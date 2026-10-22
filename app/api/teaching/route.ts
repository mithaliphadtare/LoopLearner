import { NextRequest, NextResponse } from "next/server";
import {
  generateTargetedTeaching,
  generateSimplerExplanation,
} from "@/lib/ai/gemma";
import {
  TargetedTeachingSchema,
  SimplerExplanationSchema,
  type TargetedTeaching,
  type SimplerExplanation,
  type ClientTargetedTeaching,
  type ClientSimplerExplanation,
} from "@/lib/schemas/teaching";

// In-memory cache for targeted teaching verification sessions
interface StoredTeachingSession {
  concept: string;
  checkQuestion: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  createdAt: number;
}

const teachingStore = new Map<string, StoredTeachingSession>();

function cleanupOldSessions() {
  const now = Date.now();
  for (const [id, s] of teachingStore.entries()) {
    if (now - s.createdAt > 2 * 60 * 60 * 1000) {
      teachingStore.delete(id);
    }
  }
}

function cleanJson(raw: string): string {
  let cleaned = raw.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }
  return cleaned.trim();
}

/**
 * POST /api/teaching
 * Handles:
 * - action: "generate_lesson"
 * - action: "check_answer"
 * - action: "simpler_explanation"
 */
export async function POST(req: NextRequest) {
  cleanupOldSessions();

  try {
    const body = await req.json();
    const action = body.action || "generate_lesson";

    // ==========================================
    // ACTION 1: GENERATE TARGETED TEACHING
    // ==========================================
    if (action === "generate_lesson") {
      const {
        topic,
        concept,
        strongConcepts = [],
        weakConcepts = [],
        questionText,
        studentAnswerText,
        correctAnswerText,
        misconceptionHint,
      } = body;

      if (!topic || !concept) {
        return NextResponse.json(
          { error: "Topic and concept are required" },
          { status: 400 }
        );
      }

      let rawResponse: string;
      try {
        rawResponse = await generateTargetedTeaching({
          topic,
          concept,
          strongConcepts,
          weakConcepts,
          questionText,
          studentAnswerText,
          correctAnswerText,
          misconceptionHint,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to generate targeted teaching";
        console.error("[API /teaching] Generation error:", msg);
        return NextResponse.json(
          {
            error: "We couldn't prepare your personalized explanation.",
            details: "Please try again.",
          },
          { status: 502 }
        );
      }

      const cleaned = cleanJson(rawResponse);
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("[API /teaching] Non-JSON output:\n", rawResponse.slice(0, 300));
        return NextResponse.json(
          {
            error: "We couldn't prepare your personalized explanation.",
            details: "The model returned an invalid response format.",
          },
          { status: 502 }
        );
      }

      const validation = TargetedTeachingSchema.safeParse(parsed);
      if (!validation.success) {
        console.warn("[API /teaching] Schema mismatch:", validation.error);
        return NextResponse.json(
          {
            error: "Targeted teaching content did not meet required format",
            details: validation.error.errors.map((e) => e.message).join(", "),
          },
          { status: 502 }
        );
      }

      const teachingData: TargetedTeaching = validation.data;
      const teachingSessionId = `teach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Store answer server-side so student cannot inspect it in DevTools
      teachingStore.set(teachingSessionId, {
        concept: teachingData.concept,
        checkQuestion: teachingData.checkQuestion,
        createdAt: Date.now(),
      });

      const clientContent: ClientTargetedTeaching = {
        concept: teachingData.concept,
        whatYouAlreadyKnow: teachingData.whatYouAlreadyKnow,
        theGap: teachingData.theGap,
        explanation: teachingData.explanation,
        formula: teachingData.formula,
        example: teachingData.example,
        keyTakeaway: teachingData.keyTakeaway,
        checkQuestion: {
          id: teachingData.checkQuestion.id,
          question: teachingData.checkQuestion.question,
          options: teachingData.checkQuestion.options,
        },
      };

      return NextResponse.json({
        success: true,
        teachingSessionId,
        content: clientContent,
      });
    }

    // ==========================================
    // ACTION 2: CHECK UNDERSTANDING QUESTION
    // ==========================================
    if (action === "check_answer") {
      const { teachingSessionId, selectedOption } = body;
      const session = teachingStore.get(teachingSessionId);

      if (!session) {
        return NextResponse.json(
          { error: "Teaching session not found or expired. Please refresh." },
          { status: 404 }
        );
      }

      const q = session.checkQuestion;
      const isCorrect = q.correctAnswer === selectedOption;

      return NextResponse.json({
        success: true,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      });
    }

    // ==========================================
    // ACTION 3: GENERATE SIMPLER EXPLANATION
    // ==========================================
    if (action === "simpler_explanation") {
      const { topic, concept, previousQuestion, studentAnswer } = body;

      let rawResponse: string;
      try {
        rawResponse = await generateSimplerExplanation({
          topic,
          concept,
          previousQuestion,
          studentAnswer,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to generate simpler explanation";
        console.error("[API /teaching] Simpler explanation error:", msg);
        return NextResponse.json(
          { error: "Failed to generate simpler explanation", details: msg },
          { status: 502 }
        );
      }

      const cleaned = cleanJson(rawResponse);
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        return NextResponse.json(
          { error: "Invalid simpler explanation format" },
          { status: 502 }
        );
      }

      const validation = SimplerExplanationSchema.safeParse(parsed);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation failed for simpler explanation", details: validation.error.message },
          { status: 502 }
        );
      }

      const simplerData: SimplerExplanation = validation.data;
      const newSessionId = `teach_simp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      teachingStore.set(newSessionId, {
        concept: simplerData.concept,
        checkQuestion: simplerData.newCheckQuestion,
        createdAt: Date.now(),
      });

      const clientContent: ClientSimplerExplanation = {
        concept: simplerData.concept,
        simplerAnalogy: simplerData.simplerAnalogy,
        simplifiedExplanation: simplerData.simplifiedExplanation,
        newCheckQuestion: {
          id: simplerData.newCheckQuestion.id,
          question: simplerData.newCheckQuestion.question,
          options: simplerData.newCheckQuestion.options,
        },
      };

      return NextResponse.json({
        success: true,
        teachingSessionId: newSessionId,
        content: clientContent,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: "Internal server error", details: msg }, { status: 500 });
  }
}
