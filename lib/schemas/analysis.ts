import { z } from "zod";

/**
 * Schema for the structured analysis result returned by the AI model.
 * Used to validate and type-check the AI response.
 */
export const AnalysisSchema = z.object({
  topic: z
    .string()
    .min(1, "Topic is required")
    .describe("The main topic or subject identified in the study material"),
  description: z
    .string()
    .min(1, "Description is required")
    .describe("A concise explanation of what this material covers"),
  difficulty: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const lower = val.toLowerCase().trim();
        if (lower.includes("begin") || lower.includes("easy")) return "Beginner";
        if (lower.includes("adv") || lower.includes("hard")) return "Advanced";
        if (lower.includes("inter") || lower.includes("med")) return "Intermediate";
      }
      return val;
    }, z.enum(["Beginner", "Intermediate", "Advanced"]).catch("Intermediate"))
    .describe("The estimated difficulty level of the material"),
  keyConcepts: z
    .array(z.string())
    .catch([])
    .transform((concepts) => {
      // If the model returned an empty list, provide a helpful fallback concept
      return concepts.length > 0 ? concepts : ["Overview and Fundamentals"];
    })
    .describe("The main concepts a student should learn from this material"),
  importantTerms: z
    .array(z.string())
    .catch([])
    .describe("Important vocabulary or technical terms found in the material"),
});

/** TypeScript type inferred from the Zod schema. */
export type AnalysisResult = z.infer<typeof AnalysisSchema>;

/**
 * Safely parses an unknown value against the AnalysisSchema.
 * Returns the validated result or an error message.
 */
export function parseAnalysisResult(
  data: unknown
): { success: true; data: AnalysisResult } | { success: false; error: string } {
  const result = AnalysisSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
  return { success: false, error: `Invalid analysis format: ${messages}` };
}
