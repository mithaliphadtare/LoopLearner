import { z } from "zod";

export const DiagnosticQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1)).length(4, "Exactly 4 options are required"),
  correctAnswer: z.number().int().min(0).max(3),
  concept: z.string().min(1, "Concept is required"),
  difficulty: z.enum(["basic", "intermediate", "advanced"]).catch("intermediate"),
  explanation: z.string().min(1, "Explanation is required"),
});

export const DiagnosticGenerationSchema = z.object({
  questions: z.array(DiagnosticQuestionSchema).min(3).max(7),
});

export type DiagnosticQuestion = z.infer<typeof DiagnosticQuestionSchema>;
export type DiagnosticGenerationResult = z.infer<typeof DiagnosticGenerationSchema>;

/** Client-safe question where correctAnswer and explanation are omitted until answered */
export interface ClientDiagnosticQuestion {
  id: string;
  question: string;
  options: string[];
  concept: string;
  difficulty: "basic" | "intermediate" | "advanced";
}

/** Concept-level diagnosis tracking */
export interface ConceptPerformance {
  concept: string;
  total: number;
  correct: number;
  status: "Strong" | "Needs practice";
}

export interface DiagnosticAssessmentResult {
  totalQuestions: number;
  correctAnswers: number;
  conceptPerformance: ConceptPerformance[];
  weakConcepts: string[];
}
