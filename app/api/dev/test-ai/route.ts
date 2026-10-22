import { NextResponse } from "next/server";
import { testConnection } from "@/lib/ai/gemma";

/**
 * Development-only endpoint to test AI connection without ever revealing API keys.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const result = await testConnection();

  return NextResponse.json({
    status: result.connected ? "connected" : "failed",
    model: result.model,
    message: result.message,
    timestamp: new Date().toISOString(),
  });
}
