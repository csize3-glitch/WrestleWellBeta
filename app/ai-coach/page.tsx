"use client";

import React, { useState } from "react";
import Link from "next/link";

type MessageRole = "user" | "coach";

type Message = {
  id: number;
  role: MessageRole;
  text: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "coach",
    text:
      "Hey, I’m WrestleWell Coach. I can help you think through training, matches, lifting, and mindset. What’s on your mind today?",
  },
];

const AiCoachPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    // Show the user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 🔑 NOTE: this now calls the Gemini-backed route
      const res = await fetch("/api/ai-coach-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const coachMessage: Message = {
        id: Date.now() + 1,
        role: "coach",
        text:
          data.reply ??
          "I had trouble forming a full response, but I’m here to help you think this through.",
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch (err) {
      console.error("AI coach fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "coach",
          text:
            "I couldn’t reach WrestleWell Coach right now (network or server issue). Try again in a few minutes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-800 bg-slate-950/90">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-50">
            Wrestle<span className="text-amber-400">Well</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            AI Coach • Conversation space
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <Link href="/" className="block">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-left text-slate-300 hover:bg-slate-800/70 transition">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          </Link>
          <Link href="/training" className="block">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-left text-slate-300 hover:bg-slate-800/70 transition">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>Training Log</span>
            </button>
          </Link>
          <Link href="/wrestleIQ" className="block">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-left text-slate-300 hover:bg-slate-800/70 transition">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>WrestleIQ Quiz</span>
            </button>
          </Link>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-slate-300 hover:text-amber-300"
            >
              ← Dashboard
            </Link>
            <h2 className="text-lg font-semibold tracking-tight">
              WrestleWell Coach
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-teal-300 animate-pulse" />
            <span>Prototype – responses are examples only</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Chat */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <p className="text-sm text-slate-200">
                  Talk through training, nerves, slumps, or goals.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  WrestleWell Coach is for education and reflection only. It
                  doesn&apos;t replace your real coach, a doctor, or a therapist.
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 px-4 py-4 md:px-5 md:py-5 space-y-3 overflow-y-auto">
                {messages.map((m) => (
                  <ChatBubble key={m.id} role={m.role} text={m.text} />
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="border-t border-slate-800 px-4 py-3 md:px-5 md:py-4 bg-slate-950/80"
              >
                <div className="flex items-end gap-3">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Type something like: “I gas out in the 3rd period, what should I adjust?”'
                    className="flex-1 rounded-2xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 resize-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition disabled:opacity-50"
                    disabled={!input.trim() || loading}
                  >
                    {loading ? "Thinking..." : "Send"}
                  </button>
                </div>
              </form>
            </section>

            {/* Right panel: prompts & guardrails */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm">
              <h3 className="text-lg font-semibold mb-2">
                Good questions to ask
              </h3>
              <p className="text-slate-300 mb-3">
                You&apos;ll get the best answers when you share specifics:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-1 mb-4">
                <li>What position or situation is giving you trouble?</li>
                <li>When does it happen — practice, duals, tournaments?</li>
                <li>What have you already tried?</li>
              </ul>

              <div className="space-y-2 mb-4 text-xs">
                <PromptChip>
                  &quot;I freeze up before big matches. How can I build a
                  pre-match routine?&quot;
                </PromptChip>
                <PromptChip>
                  &quot;I get ridden out on bottom. Give me a 10-minute drill
                  plan for after practice.&quot;
                </PromptChip>
                <PromptChip>
                  &quot;I&apos;m cutting to 132. Help me plan a safer week
                  leading into weigh-ins.&quot;
                </PromptChip>
              </div>

              <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-200">Important:</p>
                <p>
                  WrestleWell Coach can help you think through training,
                  mindset, and wellness habits. It cannot diagnose injuries,
                  eating disorders, or mental health conditions.
                </p>
                <p>
                  If you are feeling hopeless, unsafe, or like you might hurt
                  yourself, please talk to a trusted adult, coach, or medical
                  professional immediately, or contact local emergency / crisis
                  services.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

type ChatBubbleProps = {
  role: MessageRole;
  text: string;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text }) => {
  const isUser = role === "user";
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } text-sm leading-relaxed`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
          isUser
            ? "bg-amber-400 text-slate-950 rounded-br-sm"
            : "bg-slate-800 text-slate-50 rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

const PromptChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-slate-200">
    {children}
  </div>
);

export default AiCoachPage;