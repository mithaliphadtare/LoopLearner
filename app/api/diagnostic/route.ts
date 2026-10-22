import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateDiagnosticQuestions } from "@/lib/ai/gemma";
import {
  DiagnosticGenerationSchema,
  type DiagnosticQuestion,
  type ClientDiagnosticQuestion,
  type ConceptPerformance,
  type DiagnosticAssessmentResult,
} from "@/lib/schemas/diagnostic";
import { AnalysisSchema } from "@/lib/schemas/analysis";

// In-memory server-side session cache for diagnostic answers
// Stores full questions with correct answers keyed by sessionId
interface StoredDiagnosticSession {
  questions: DiagnosticQuestion[];
  createdAt: number;
}

const sessionStore = new Map<string, StoredDiagnosticSession>();

// Cleanup stale sessions older than 2 hours
function cleanupStaleSessions() {
  const now = Date.now();
  for (const [id, session] of sessionStore.entries()) {
    if (now - session.createdAt > 2 * 60 * 60 * 1000) {
      sessionStore.delete(id);
    }
  }
}

/**
 * Extracts and cleans JSON from raw AI text response.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    // If no explicit code block, find outer {...} JSON braces
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  return cleaned.trim();
}

/**
 * POST /api/diagnostic:
 * Action 1 (generate): Takes { action: "generate", analysis } -> returns client questions + sessionId
 * Action 2 (evaluate): Takes { action: "evaluate", sessionId, answers: Record<string, number> } -> evaluates answers server-side
 */
export async function POST(req: NextRequest) {
  cleanupStaleSessions();

  try {
    const body = await req.json();
    const action = body.action || "generate";

    // ==========================================
    // ACTION 1: GENERATE DIAGNOSTIC QUESTIONS
    // ==========================================
    if (action === "generate") {
      const analysisValidation = AnalysisSchema.safeParse(body.analysis);
      if (!analysisValidation.success) {
        return NextResponse.json(
          {
            error: "Invalid study material analysis provided",
            details: analysisValidation.error.errors.map((e) => e.message).join(", "),
          },
          { status: 400 }
        );
      }

      const analysis = analysisValidation.data;

      let rawResponse: string;
      try {
        rawResponse = await generateDiagnosticQuestions(analysis);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to generate diagnostic questions";
        console.error("[API /diagnostic] Generation error:", message);
        return NextResponse.json(
          {
            error: "Something went wrong while preparing your diagnostic.",
            details: "The AI model encountered a temporary issue. Please try again.",
          },
          { status: 502 }
        );
      }

      // Parse JSON from output
      const cleaned = cleanJsonOutput(rawResponse);
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("[API /diagnostic] Non-JSON output:\n", rawResponse.slice(0, 300));
        return NextResponse.json(
          {
            error: "Something went wrong while preparing your diagnostic.",
            details: "The model returned an unparseable response. Please retry.",
          },
          { status: 502 }
        );
      }

      // Validate questions structure
      const schemaValidation = DiagnosticGenerationSchema.safeParse(parsed);
      if (!schemaValidation.success) {
        console.warn("[API /diagnostic] Schema mismatch:", schemaValidation.error);
        return NextResponse.json(
          {
            error: "Diagnostic questions did not meet format requirements",
            details: schemaValidation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
          },
          { status: 502 }
        );
      }

      // Ensure 5 questions max/min where possible, or slice to 5
      const questions = schemaValidation.data.questions.slice(0, 5);

      // Store server-side session to keep correct answers secure
      const sessionId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStore.set(sessionId, {
        questions,
        createdAt: Date.now(),
      });

      // Prepare client questions (correctAnswer and explanation omitted)
      const clientQuestions: ClientDiagnosticQuestion[] = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        concept: q.concept,
        difficulty: q.difficulty,
      }));

      console.log(`[API /diagnostic] Generated ${clientQuestions.length} questions for session ${sessionId}`);

      return NextResponse.json({
        success: true,
        sessionId,
        questions: clientQuestions,
      });
    }

    // ==========================================
    // ACTION 2: CHECK INDIVIDUAL QUESTION ANSWER
    // ==========================================
    if (action === "check_question") {
      const { sessionId, questionId, selectedOption } = body;
      const session = sessionStore.get(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: "Diagnostic session expired or not found. Please restart." },
          { status: 404 }
        );
      }

      const question = session.questions.find((q) => q.id === questionId);
      if (!question) {
        return NextResponse.json(
          { error: "Question not found in current diagnostic." },
          { status: 404 }
        );
      }

      const isCorrect = question.correctAnswer === selectedOption;

      return NextResponse.json({
        success: true,
        questionId,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
    }

    // ==========================================
    // ACTION 3: EVALUATE COMPLETE ASSESSMENT
    // ==========================================
    if (action === "evaluate") {
      const { sessionId, answers } = body as {
        sessionId: string;
        answers: Record<string, number>;
      };

      const session = sessionStore.get(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: "Diagnostic session expired. Please restart." },
          { status: 404 }
        );
      }

      const questions = session.questions;
      let correctCount = 0;
      const conceptMap = new Map<string, { total: number; correct: number }>();

      for (const q of questions) {
        const studentAns = answers[q.id];
        const isCorrect = studentAns === q.correctAnswer;
        if (isCorrect) correctCount++;

        const currentConcept = conceptMap.get(q.concept) || { total: 0, correct: 0 };
        currentConcept.total += 1;
        if (isCorrect) currentConcept.correct += 1;
        conceptMap.set(q.concept, currentConcept);
      }

      const conceptPerformance: ConceptPerformance[] = [];
      const weakConcepts: string[] = [];

      for (const [concept, stats] of conceptMap.entries()) {
        const isStrong = stats.correct === stats.total;
        conceptPerformance.push({
          concept,
          total: stats.total,
          correct: stats.correct,
          status: isStrong ? "Strong" : "Needs practice",
        });

        if (!isStrong) {
          weakConcepts.push(concept);
        }
      }

      const result: DiagnosticAssessmentResult = {
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        conceptPerformance,
        weakConcepts,
      };

      return NextResponse.json({
        success: true,
        result,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API /diagnostic] Server error:", message);
    return NextResponse.json(
      {
        error: "Something went wrong while preparing your diagnostic.",
        details: message,
      },
      { status: 500 }
    );
  }
}
