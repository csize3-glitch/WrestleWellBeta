import { NextResponse } from "next/server";

// Node runtime ensures process.env is available
export const runtime = "nodejs";

export async function GET() {
  const openaiKeyPresent = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    openai_api_key_present: openaiKeyPresent,
    env_loaded: !!process.env.NODE_ENV || true,
  });
}
