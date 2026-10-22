import { z } from "zod";

/**
 * Schema for detected misconception inferred from an incorrect diagnostic question.
 */
export const MisconceptionSchema = z.object({
  concept: z.string().min(1),
  misconception: z.string().min(1).describe("The likely misunderstanding (e.g. 'You may be thinking...')"),
  evidence: z.string().min(1).describe("Why the selected answer indicates this misconception"),
  severity: z.enum(["low", "medium", "high"]).catch("medium"),
});

export type Misconception = z.infer<typeof MisconceptionSchema>;

/**
 * Schema for structured targeted lesson content.
 */
export const TargetedTeachingSchema = z.object({
  concept: z.string().min(1),
  whatYouAlreadyKnow: z.string().min(1).describe("Positive validation of concepts the student got right"),
  theGap: z.string().min(1).describe("Concise clarification of what needs practice"),
  explanation: z.string().min(1).describe("The core intuitive explanation addressing the misconception"),
  formula: z.string().optional().describe("Optional concise mathematical relationship or equation (e.g. F = m * a)"),
  example: z.string().min(1).describe("Practical concrete walkthrough with numbers or scenarios"),
  keyTakeaway: z.string().min(1).describe("One memorable, punchy rule of thumb"),
  checkQuestion: z.object({
    id: z.string().min(1),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    correctAnswer: z.number().int().min(0).max(3),
    explanation: z.string().min(1),
  }),
});

export type TargetedTeaching = z.infer<typeof TargetedTeachingSchema>;

/**
 * Client safe targeted lesson (omits correctAnswer and check explanation until verified)
 */
export interface ClientTargetedTeaching {
  concept: z.infer<typeof TargetedTeachingSchema>["concept"];
  whatYouAlreadyKnow: z.infer<typeof TargetedTeachingSchema>["whatYouAlreadyKnow"];
  theGap: z.infer<typeof TargetedTeachingSchema>["theGap"];
  explanation: z.infer<typeof TargetedTeachingSchema>["explanation"];
  formula?: string;
  example: z.infer<typeof TargetedTeachingSchema>["example"];
  keyTakeaway: z.infer<typeof TargetedTeachingSchema>["keyTakeaway"];
  checkQuestion: {
    id: string;
    question: string;
    options: string[];
  };
}

/**
 * Simpler second-pass explanation when the student misses the first check question.
 */
export const SimplerExplanationSchema = z.object({
  concept: z.string().min(1),
  simplerAnalogy: z.string().min(1).describe("Everyday intuitive analogy to make it click"),
  simplifiedExplanation: z.string().min(1),
  newCheckQuestion: z.object({
    id: z.string().min(1),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    correctAnswer: z.number().int().min(0).max(3),
    explanation: z.string().min(1),
  }),
});

export type SimplerExplanation = z.infer<typeof SimplerExplanationSchema>;

export interface ClientSimplerExplanation {
  concept: string;
  simplerAnalogy: string;
  simplifiedExplanation: string;
  newCheckQuestion: {
    id: string;
    question: string;
    options: string[];
  };
}
