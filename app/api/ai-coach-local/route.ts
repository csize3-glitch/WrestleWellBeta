import { NextResponse } from "next/server";

const LOCAL_MODEL = "llama3.2";

/**
 * Simple offline "coach" fallback:
 * Used if the local model is not reachable.
 */
function offlineCoachReply(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("bottom") || m.includes("ridden") || m.includes("ride out")) {
    return [
      "Let’s talk bottom work. A lot of wrestlers struggle here, especially against strong riders.",
      "Pick one main get-up (stand-up or sit-out) and drill it hard: 3–5 sets of 30 seconds after practice with a partner giving real pressure.",
      "Focus on first move off the whistle, hand control, and getting to your feet quickly. Ask your coach for 1–2 specific bottom drills to hit every day for the next 2 weeks."
    ].join(" ");
  }

  if (
    m.includes("gas") ||
    m.includes("tired") ||
    m.includes("conditioning") ||
    m.includes("3rd period")
  ) {
    return [
      "Gassing out in the 3rd is usually a mix of conditioning, pacing, and nerves.",
      "After practice, add 5–8 minutes of short sprints: for example 15–20 second hard goes, 30–40 seconds rest, 6–8 rounds.",
      "In live goes, work on breathing between whistles and not blowing all your energy in the first 30 seconds."
    ].join(" ");
  }

  if (
    m.includes("nervous") ||
    m.includes("anxious") ||
    m.includes("anxiety") ||
    m.includes("scared") ||
    m.includes("mental")
  ) {
    return [
      "Feeling nervous before matches is completely normal, even for tough wrestlers.",
      "Build a simple pre-match routine: a short warm-up you always do, a couple of deep breaths, and 1–2 phrases you repeat about effort (like “hard hand-fight and move my feet”).",
      "If nerves feel really heavy or overwhelming, talk with a coach, parent, or another trusted adult, and consider a professional if needed."
    ].join(" ");
  }

  if (
    m.includes("cut") ||
    m.includes("weight") ||
    m.includes("weigh in") ||
    m.includes("weigh-in")
  ) {
    return [
      "Weight and cutting need to be done safely.",
      "Always involve your coach and a parent or guardian before changing weight classes or cutting hard. Focus on consistent sleep, smart food, and staying hydrated while you work with adults on a safe plan.",
      "If you feel dizzy, weak, or obsessed with the scale, talk to someone you trust right away. No match is worth your long-term health."
    ].join(" ");
  }

  return [
    "Thanks for sharing that. Let’s keep it simple: pick one small thing to improve over the next 1–2 weeks.",
    "Choose 1–2 key positions or habits, ask your coach for specific drills, and track how many extra focused reps you get after practice.",
    "If you want a more detailed plan, describe the situation with position, score, time left, and how you usually react."
  ].join(" ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = body.message || "";

    const systemPrompt = `
You are WrestleWell Coach, a supportive wrestling assistant.
- Focus on folkstyle, freestyle, and Greco-Roman technique, drilling, lifting, and mindset.
- Keep answers short and practical: usually 2–4 short paragraphs or bullet points.
- Aim your tone at middle and high school athletes unless told otherwise.
- Suggest drills, habits, and questions the athlete can bring to their real coach.
- For mental/weight topics, be encouraging but do NOT give medical or clinical advice.
- Encourage talking to a real coach, parent/guardian, or medical professional as needed.
`.trim();

    // Call local Ollama server
    const resp = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LOCAL_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: false,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Ollama API error:", resp.status, errorText);

      const reply = offlineCoachReply(message);
      return NextResponse.json({
        reply,
        offline: true,
        error: "ollama_error",
      });
    }

    const data = await resp.json();

    const text: string =
      data?.message?.content ??
      data?.message ??
      "Coach is having trouble responding right now. Try again in a bit.";

    return NextResponse.json({ reply: text, offline: false });
  } catch (err: any) {
    console.error("AI coach (local) error:", err);
    const reply = offlineCoachReply("");
    return NextResponse.json({
      reply,
      offline: true,
      error: "unexpected_server_error",
    });
  }
}