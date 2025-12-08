import { NextResponse } from "next/server";

const DEFAULT_MODEL_ID = "gemini-3-pro-preview";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelId = process.env.GEMINI_MODEL_ID || DEFAULT_MODEL_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const message: string = body.message || "";

    const systemInstructions = `
You are WrestleWell Coach, a supportive wrestling assistant.
- Focus on folkstyle, freestyle, and Greco-Roman technique, drilling, lifting, and mindset.
- Keep answers short and practical: usually 2–4 short paragraphs or bullet points.
- Aim your tone at middle and high school athletes unless told otherwise.
- You can suggest drills, habits, and questions for the athlete to ask their real coach.
- For mental health and weight-cut topics, be encouraging but DO NOT give medical or clinical advice.
- Remind the athlete to talk to a real coach, parent, or medical professional when appropriate.
`.trim();

    const fullPrompt = `${systemInstructions}

Athlete message:
${message}
`;

    // 👇 This matches the official REST docs for gemini-3-pro-preview
    // https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          // Optional: you *can* add thinkingConfig for gemini-3, but not required
          // thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(
        `Gemini API error (${resp.status}) for model ${modelId}:`,
        errorText
      );
      return NextResponse.json(
        {
          error: "Gemini API error",
          status: resp.status,
          details: errorText,
        },
        { status: 500 }
      );
    }

    const data = await resp.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Coach is having trouble responding right now. Try again in a bit.";

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error("AI coach (Gemini) error:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err) },
      { status: 500 }
    );
  }
}