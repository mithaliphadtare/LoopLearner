import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeStudyImage } from "@/lib/ai/gemma";
import { parseAnalysisResult } from "@/lib/schemas/analysis";
import { ACCEPTED_FILE_TYPES, extractBase64Data } from "@/lib/utils";

const RequestPayloadSchema = z.object({
  image: z.string().min(1, "File data URL is required"),
  mimeType: z
    .string()
    .refine(
      (val) => (ACCEPTED_FILE_TYPES as readonly string[]).includes(val),
      {
        message: "Unsupported file format. Allowed: PDF, PNG, JPG, JPEG, WEBP",
      }
    ),
});

/**
 * Extracts and cleans JSON from raw AI text response.
 * Handles markdown fences (```json ... ```), preamble text, and trailing commentary.
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate payload
    const parsedPayload = RequestPayloadSchema.safeParse(body);
    if (!parsedPayload.success) {
      console.warn(
        "[API /analyze] Invalid request payload:",
        parsedPayload.error.errors.map((e) => e.message).join(", ")
      );
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsedPayload.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { image, mimeType } = parsedPayload.data;
    const base64Data = extractBase64Data(image);

    console.log(
      `[API /analyze] Received study material: MIME=${mimeType}, Base64Length=${base64Data.length} chars`
    );

    // 2. Call the server-side AI module using the configured Gemma model
    let rawAiResponse: string;
    try {
      rawAiResponse = await analyzeStudyImage(base64Data, mimeType);
    } catch (aiErr: unknown) {
      const errObj = aiErr as { status?: number; message?: string; error?: { message?: string } };
      const status = errObj?.status || 500;
      const message = errObj?.message || errObj?.error?.message || "AI service communication error";

      console.error(
        `[API /analyze] Model call failed (Status: ${status}):`,
        message
      );

      // Check for missing credentials specifically
      if (message.includes("GEMINI_API_KEY") || message.includes("MODEL_NAME")) {
        return NextResponse.json(
          {
            error: "AI model configuration missing",
            details: "The server requires GEMINI_API_KEY and MODEL_NAME to be configured.",
          },
          { status: 503 }
        );
      }

      // Check for capacity / high demand / upstream internal errors
      if (
        status === 503 ||
        status === 500 ||
        message.includes("high demand") ||
        message.includes("INTERNAL")
      ) {
        return NextResponse.json(
          {
            error: "The AI service is currently busy",
            details: "The Gemma model is experiencing high demand. Please click 'Try again' in a moment.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to analyze study material with the AI model",
          details: "An error occurred while communicating with the AI service. Please try again.",
        },
        { status: 502 }
      );
    }

    // 3. Parse JSON from AI output
    const cleanedText = cleanJsonOutput(rawAiResponse);
    let jsonParsed: unknown;
    try {
      jsonParsed = JSON.parse(cleanedText);
    } catch {
      console.error(
        "[API /analyze] Malformed non-JSON output from model:\n",
        rawAiResponse.slice(0, 300)
      );
      return NextResponse.json(
        {
          error: "Malformed response received from the model",
          details: "The AI model returned text that could not be parsed as structured concepts. Please try again.",
        },
        { status: 502 }
      );
    }

    // 4. Validate output with Zod AnalysisSchema
    const validation = parseAnalysisResult(jsonParsed);
    if (!validation.success) {
      console.warn(
        "[API /analyze] Model output schema mismatch:",
        validation.error
      );
      return NextResponse.json(
        {
          error: "The AI analysis response did not conform to the expected schema",
          details: validation.error,
        },
        { status: 502 }
      );
    }

    console.log(
      `[API /analyze] Successfully analyzed material: Topic="${validation.data.topic}", Concepts=${validation.data.keyConcepts.length}`
    );

    // 5. Return structured analysis result
    return NextResponse.json({
      success: true,
      data: validation.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API /analyze] Unexpected server error:", message);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing the analysis request",
        details: "Something went wrong on the server. Please try again.",
      },
      { status: 500 }
    );
  }
}
