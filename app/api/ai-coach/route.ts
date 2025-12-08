import { NextResponse } from "next/server";
import OpenAI from "openai";

// Run on Node so process.env works reliably
export const runtime = "nodejs";

type MessageRole = "user" | "coach";

type IncomingMessage = {
  role: MessageRole;
  text: string;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("AI coach error: OPENAI_API_KEY is not set");
      return NextResponse.json(
        {
          error:
            "WrestleWell Coach is not configured yet (missing API key on the server).",
        },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const body = await req.json();
    const history = (body.history || []) as IncomingMessage[];
    const message = ((body.message as string) || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Missing message" },
        { status: 400 }
      );
    }

    // Short transcript from recent messages
    const context = history
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Athlete" : "Coach"}: ${m.text}`)
      .join("\n");

    const instructions = `
You are "WrestleWell Coach", an AI assistant that supports wrestlers, parents, and coaches.

DO:
- Focus on wrestling-specific training, match strategy, mindset, and recovery.
- Use clear, practical language teens and coaches can understand.
- Break advice into small, concrete steps (drills, habits, checklists).
- Emphasize healthy weight management, sleep, hydration, and recovery.
- Encourage athletes to talk with real coaches, parents, trainers about important decisions.
- If the user mentions injuries, eating issues, or serious mental health struggles, 
  gently encourage them to seek help from a medical professional, counselor, or trusted adult.

DO NOT:
- Do NOT give medical diagnoses.
- Do NOT tell users to ignore pain, starve themselves, or train through obviously serious injury.
- Do NOT give crisis counseling. If someone sounds unsafe or hopeless, tell them to reach out
  immediately to a trusted adult, coach, medical professional, or local emergency/crisis services.

Be supportive, honest, and never promise outcomes. You are one tool alongside real humans, not a replacement.
`;

    // ✅ Use a simple text input, as in the official docs
    const combinedInput =
      context
        ? `Here is our recent conversation:\n${context}\n\nAthlete: ${message}\n\nCoach:`
        : `Athlete: ${message}\n\nCoach:`;

    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      instructions,
      input: combinedInput,
      max_output_tokens: 350,
    });

    // Try the convenience helper, then fall back to raw fields
    const replyText =
      (resp as any).output_text ??
      (resp as any).output?.[0]?.content?.[0]?.text ??
      "I had trouble forming a full response, but I’m here to help you think through your training and mindset.";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("AI coach error:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong talking to WrestleWell Coach. Please try again in a minute.",
      },
      { status: 500 }
    );
  }
}