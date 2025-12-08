import { NextResponse } from "next/server";

const LOCAL_MODEL = "llama3.2";

type RawQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function fallbackQuestions(topic: string, difficulty: string): RawQuestion[] {
  return [
    {
      question: `In ${topic}, what is usually the most important first focus at a ${difficulty.toLowerCase()} level?`,
      options: [
        "Trying a big throw immediately",
        "Getting solid position first (stance, hands, head)",
        "Backing straight up to create space",
        "Dropping to your butt to avoid contact",
      ],
      correctIndex: 1,
      explanation:
        "Even at higher levels, good position comes before big moves. Solid stance, head and hand position make all attacks safer and more effective.",
    },
    {
      question: "When you keep getting stuck in the same position, what is a good basic plan?",
      options: [
        "Hope it goes away on its own",
        "Avoid that position in practice",
        "Ask your coach for 1–2 drills and hit extra reps every day",
        "Only watch videos and never drill",
      ],
      correctIndex: 2,
      explanation:
        "Specific, focused reps on the exact position with guidance from your coach is the fastest way to fix problem spots.",
    },
    {
      question: "Which of these BEST describes good ‘mat IQ’?",
      options: [
        "Knowing a lot of fancy moves but never using them",
        "Understanding score, time, and position to make smart choices",
        "Only wrestling hard in the first period",
        "Ignoring your coach’s plan and doing random moves",
      ],
      correctIndex: 1,
      explanation:
        "Mat IQ is about awareness of score, time, and position so you can choose the highest-percentage options in each moment.",
    },
  ];
}

function tryExtractJsonArray(text: string): RawQuestion[] | null {
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return null;
    const slice = text.slice(start, end + 1);
    const parsed = JSON.parse(slice);
    if (!Array.isArray(parsed)) return null;
    return parsed as RawQuestion[];
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic: string = body.topic || "folkstyle neutral";
    const difficulty: string = body.difficulty || "Intermediate";

    const systemPrompt = `
You are WrestleIQ, a wrestling-specific quiz generator for folkstyle, freestyle, and Greco-Roman.

Return EXACTLY a JSON array of 3 multiple-choice questions with this shape:

[
  {
    "question": "string – clear situation or concept",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 1,
    "explanation": "short, practical explanation for wrestlers"
  },
  ...
]

Rules:
- Questions must be about wrestling positions, mat IQ, rules, strategy, or situations.
- Keep the language appropriate for middle/high school wrestlers.
- Match the requested topic and difficulty as best you can.
- DO NOT include any extra commentary, code fences, or text outside the JSON array.
    `.trim();

    const userPrompt = `
Topic: ${topic}
Difficulty: ${difficulty}

Generate 3 questions that would help a wrestler think better on the mat.
`.trim();

    const resp = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LOCAL_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Ollama WrestleIQ error:", resp.status, txt);
      const fb = fallbackQuestions(topic, difficulty);
      return NextResponse.json({ questions: fb, offline: true });
    }

    const data = await resp.json();
    const content: string | undefined =
      typeof data?.message?.content === "string"
        ? data.message.content
        : Array.isArray(data?.message?.content)
        ? data.message.content.join("")
        : data?.message?.content ?? "";

    const parsed = content ? tryExtractJsonArray(content) : null;
    const questions = parsed && parsed.length > 0
      ? parsed
      : fallbackQuestions(topic, difficulty);

    // add IDs for frontend
    const normalized = questions.map((q, idx) => ({
      id: `ai-${idx}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));

    return NextResponse.json({ questions: normalized, offline: false });
  } catch (err: any) {
    console.error("WrestleIQ-local route error:", err);
    const fb = fallbackQuestions("folkstyle neutral", "Intermediate");
    const normalized = fb.map((q, idx) => ({
      id: `fb-${idx}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));
    return NextResponse.json({ questions: normalized, offline: true });
  }
}