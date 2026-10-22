import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "@/lib/schemas/analysis";

/**
 * AI service module for communicating with the configured Gemma model.
 * All AI interactions go through this module — never call the SDK directly from components.
 */

/** Returns the API key from server environment. Throws if missing. */
function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to your .env file."
    );
  }
  return key;
}

/** Returns the model name from server environment. Throws if missing. */
function getModelName(): string {
  const model = process.env.MODEL_NAME;
  if (!model) {
    throw new Error(
      "MODEL_NAME is not configured. Add it to your .env file."
    );
  }
  return model;
}

/** Creates and returns a GoogleGenAI client instance. */
function getClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

/** Helper sleep function for retry backoff */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes an AI API call with automatic exponential backoff retry.
 * Handles upstream transient errors (such as 500 INTERNAL and 503 UNAVAILABLE/high demand spikes)
 * frequently encountered on shared cloud endpoints.
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1500
): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const anyErr = err as {
        status?: number;
        code?: number;
        message?: string;
        error?: { code?: number; message?: string; status?: string };
      };

      const status = anyErr?.status || anyErr?.code || anyErr?.error?.code;
      const msg = anyErr?.message || anyErr?.error?.message || "";
      const statusText = anyErr?.error?.status || "";

      const isTransient =
        status === 500 ||
        status === 503 ||
        msg.includes("500") ||
        msg.includes("503") ||
        msg.includes("INTERNAL") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("high demand") ||
        statusText === "INTERNAL" ||
        statusText === "UNAVAILABLE";

      if (isTransient && attempt <= maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(
          `[LearnLoop AI] Transient upstream error (${status || "500"}). Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`
        );
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  throw new Error("Maximum retry attempts reached");
}

/**
 * Analyzes a study image and returns structured information about its content.
 */
export async function analyzeStudyImage(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const client = getClient();
  const modelName = getModelName();

  console.log(`[LearnLoop AI] Analyzing material using model: ${modelName}`);

  const prompt = `You are an expert educational content analyst. Analyze this study material carefully.

Return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "topic": "The main topic or subject of this material",
  "description": "A clear, concise 1-2 sentence description of what this material covers and why it matters",
  "difficulty": "Beginner" OR "Intermediate" OR "Advanced",
  "keyConcepts": ["concept1", "concept2", "concept3", ...],
  "importantTerms": ["term1", "term2", "term3", ...]
}

Guidelines:
- topic: Be specific. "Newton's Laws of Motion" not just "Physics"
- description: Write as if explaining to a student what they'll learn
- difficulty: Judge based on the complexity of the concepts (must be "Beginner", "Intermediate", or "Advanced")
- keyConcepts: List 3-8 key concepts. Be concise but clear
- importantTerms: List 3-10 important vocabulary or technical terms

Return ONLY the JSON object. No additional text.`;

  const response = await callWithRetry(async () => {
    return await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });
  });

  const text = response.text;
  if (!text) {
    throw new Error("The AI model returned an empty response. Please try again.");
  }

  return text;
}

/**
 * Generates a diagnostic assessment of approximately 5 questions grounded directly
 * in the analyzed study material concepts.
 */
export async function generateDiagnosticQuestions(
  analysis: AnalysisResult
): Promise<string> {
  const client = getClient();
  const modelName = getModelName();

  console.log(`[LearnLoop AI] Generating diagnostic questions for topic: "${analysis.topic}" using model: ${modelName}`);

  const conceptsList = analysis.keyConcepts.map((c, i) => `${i + 1}. ${c}`).join("\n");
  const termsList = analysis.importantTerms?.join(", ") || "None";

  const prompt = `You are an expert tutor creating a diagnostic assessment for a student who just uploaded study material.

Topic: ${analysis.topic}
Difficulty: ${analysis.difficulty}
Description: ${analysis.description}

Identified Key Concepts:
${conceptsList}

Important Terms:
${termsList}

Task:
Generate EXACTLY 5 diagnostic multiple-choice questions grounded in these concepts.
The goal is to diagnose true understanding and knowledge gaps rather than rote memorization.
Include questions testing:
1. Basic recognition
2. Conceptual understanding
3. Application/Scenario-based reasoning
4. Cause-and-effect relationship

Return a JSON object with EXACTLY this structure (no markdown, no extra keys, just valid JSON):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": [
        "First option",
        "Second option",
        "Third option",
        "Fourth option"
      ],
      "correctAnswer": 0,
      "concept": "Specific concept tested",
      "difficulty": "basic",
      "explanation": "Clear explanation of why this answer is correct and what principle applies."
    }
  ]
}

Important Rules:
- Generate EXACTLY 5 questions.
- Each question must have EXACTLY 4 distinct options.
- "correctAnswer" must be an integer index from 0 to 3 pointing to the correct option.
- "concept" must match or relate to one of the identified key concepts: ${analysis.keyConcepts.join(", ")}.
- "difficulty" must be "basic", "intermediate", or "advanced".
- "explanation" must be a concise, helpful 1-2 sentence teaching point explaining why the answer is right.
- Return ONLY the JSON object. No intro, no markdown code blocks.`;

  const response = await callWithRetry(async () => {
    return await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
  });

  const text = response.text;
  if (!text) {
    throw new Error("The AI model returned an empty response while generating diagnostic questions.");
  }

  return text;
}

/**
 * Phase 3: Generates targeted teaching tailored to a specific weak concept and detected misconception.
 */
export async function generateTargetedTeaching(params: {
  topic: string;
  concept: string;
  strongConcepts: string[];
  weakConcepts: string[];
  questionText?: string;
  studentAnswerText?: string;
  correctAnswerText?: string;
  misconceptionHint?: string;
}): Promise<string> {
  const client = getClient();
  const modelName = getModelName();

  console.log(`[LearnLoop AI] Generating targeted teaching for concept: "${params.concept}" using model: ${modelName}`);

  const strongList = params.strongConcepts.length > 0 ? params.strongConcepts.join(", ") : "general fundamentals";
  const diagnosticMistakeInfo = params.questionText
    ? `The student answered a diagnostic question incorrectly:
- Question: "${params.questionText}"
- Student selected: "${params.studentAnswerText}"
- Correct was: "${params.correctAnswerText}"`
    : `The student struggled with questions testing "${params.concept}".`;

  const prompt = `You are an adaptive 1-on-1 tutor for LearnLoop.
A student is studying: "${params.topic}".
Focus Concept that needs attention: "${params.concept}".

Student context:
- Concepts the student already demonstrated understanding of: ${strongList}.
- ${diagnosticMistakeInfo}

Your task:
Generate a personalized, targeted explanation that addresses the specific gap/misconception.
Do NOT reteach what the student already knows. Connect to what they understand, clarify the misunderstanding, give a clear mental model, a practical calculation/example, a punchy takeaway, and ONE targeted check question.

Return a JSON object with EXACTLY this structure (no markdown, no extra commentary):
{
  "concept": "${params.concept}",
  "whatYouAlreadyKnow": "A warm, encouraging sentence highlighting what they already understand (e.g. 'You already understand that a force can change an object\\'s motion.')",
  "theGap": "A gentle, precise description of where confusion arises (e.g. 'The tricky part is connecting force, mass, and acceleration quantitatively.')",
  "explanation": "2-3 short, clear sentences explaining the correct intuition and relationship. Avoid long textbook blocks.",
  "formula": "Concise key relationship (e.g. 'F = m × a' or 'a = F / m'). Leave empty if not applicable.",
  "example": "A concrete walkthrough with numbers or scenario showing step-by-step how it works.",
  "keyTakeaway": "One memorable, punchy rule of thumb sentence (e.g. 'More net force → more acceleration. More mass → less acceleration for the same force.')",
  "checkQuestion": {
    "id": "chk_1",
    "question": "A focused multiple choice question testing whether this specific concept clicked",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "Brief explanation confirming the correct answer"
  }
}

Rules:
- Keep language encouraging and clear. Never say 'you failed' or 'you are bad at this'.
- Use 'You may be thinking...' when discussing the gap.
- 'checkQuestion' must have exactly 4 options with 'correctAnswer' index (0-3).
- Return ONLY valid JSON.`;

  const response = await callWithRetry(async () => {
    return await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response while generating targeted teaching.");
  }

  return text;
}

/**
 * Phase 3 Remediation: Generates a simpler second-pass explanation with an alternative analogy
 * when the student misses the first check question.
 */
export async function generateSimplerExplanation(params: {
  topic: string;
  concept: string;
  previousQuestion: string;
  studentAnswer: string;
}): Promise<string> {
  const client = getClient();
  const modelName = getModelName();

  console.log(`[LearnLoop AI] Generating simpler alternative explanation for: "${params.concept}"`);

  const prompt = `You are an adaptive tutor for LearnLoop.
A student is learning "${params.concept}" in "${params.topic}".
They just attempted a check question:
- Question: "${params.previousQuestion}"
- Their answer was incorrect: "${params.studentAnswer}"

Task:
Provide a simpler, intuitive second-pass explanation using an everyday analogy (like pushing a shopping cart, rolling a bowling ball, or riding a bike).
Then provide a NEW simpler check question to confirm they got it.

Return a JSON object with EXACTLY this structure (no markdown):
{
  "concept": "${params.concept}",
  "simplerAnalogy": "A relatable, everyday analogy explaining the mechanism intuitively.",
  "simplifiedExplanation": "2 short sentences stripping away technical jargon to reveal the core truth.",
  "newCheckQuestion": {
    "id": "chk_simpler_1",
    "question": "A fresh, straightforward question checking the analogy/concept",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "Clear confirmation of why this option is correct"
  }
}

Rules:
- Friendly, warm, patient tone.
- Exactly 4 options for newCheckQuestion, correctAnswer is integer 0-3.
- Return ONLY valid JSON.`;

  const response = await callWithRetry(async () => {
    return await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response while generating simpler explanation.");
  }

  return text;
}

/**
 * Generates text from a prompt. General-purpose function for future phases.
 */
export async function generateText(prompt: string): Promise<string> {
  const client = getClient();
  const modelName = getModelName();

  const response = await callWithRetry(async () => {
    return await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
  });

  const text = response.text;
  if (!text) {
    throw new Error("The AI model returned an empty response.");
  }

  return text;
}

/**
 * Tests the connection to the AI service.
 * Returns a status object — never exposes the API key.
 */
export async function testConnection(): Promise<{
  connected: boolean;
  model: string;
  message: string;
}> {
  try {
    const modelName = getModelName();
    const client = getClient();

    const response = await callWithRetry(async () => {
      return await client.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [{ text: "Respond with exactly: CONNECTION_OK" }],
          },
        ],
      });
    });

    const text = response.text;
    return {
      connected: true,
      model: modelName,
      message: text ? "Connected successfully" : "Connected but empty response",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      connected: false,
      model: process.env.MODEL_NAME || "not configured",
      message,
    };
  }
}
