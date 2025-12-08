"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type GoalStatus = "active" | "done";
type Timeframe = "this_week" | "this_month" | "season";

type Goal = {
  id: string;
  title: string;
  why: string;
  timeframe: Timeframe;
  focus: "mat" | "lift" | "mental" | "school" | "life";
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

const GOALS_KEY = "wrestlewell_goals_v1";

const QUOTES: { focus: Goal["focus"]; text: string }[] = [
  {
    focus: "mat",
    text: "Win the position, and the points will follow.",
  },
  {
    focus: "lift",
    text: "Strong hips and strong habits both come from showing up when you’re tired.",
  },
  {
    focus: "mental",
    text: "You can’t always control the result, but you can always control your effort and your response.",
  },
  {
    focus: "school",
    text: "Handle your business in the classroom and the mat will feel lighter.",
  },
  {
    focus: "life",
    text: "Small, consistent choices stack into big changes over a season.",
  },
];

function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGoals(goals: Goal[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("this_week");
  const [focus, setFocus] = useState<Goal["focus"]>("mat");

  // AI plan state (not stored in localStorage)
  const [plansByGoal, setPlansByGoal] = useState<Record<string, string>>({});
  const [loadingPlanFor, setLoadingPlanFor] = useState<string | null>(null);
  const [planErrorFor, setPlanErrorFor] = useState<Record<string, string>>({});

  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      why: why.trim(),
      timeframe,
      focus,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveGoals(updated);
    setTitle("");
    setWhy("");
  }

  function toggleStatus(id: string) {
    const updated = goals.map((g) =>
      g.id === id
        ? {
            ...g,
            status: g.status === "active" ? "done" : "active",
            updatedAt: new Date().toISOString(),
          }
        : g
    );
    setGoals(updated);
    saveGoals(updated);
  }

  function deleteGoal(id: string) {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);

    // Clear any plan/errors for that goal
    setPlansByGoal((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setPlanErrorFor((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    saveGoals(updated);
  }

  async function handleGeneratePlan(goal: Goal) {
    // reset error for this goal
    setPlanErrorFor((prev) => {
      const copy = { ...prev };
      delete copy[goal.id];
      return copy;
    });

    setLoadingPlanFor(goal.id);
    try {
      const timeframeText =
        goal.timeframe === "this_week"
          ? "this week"
          : goal.timeframe === "this_month"
          ? "this month"
          : "this season";

      const focusLabelMap: Record<Goal["focus"], string> = {
        mat: "on the mat",
        lift: "lifting / strength",
        mental: "mindset",
        school: "school / academics",
        life: "life / daily habits",
      };

      const message = `
Goal: ${goal.title}
Why it matters: ${goal.why || "Not specified"}
Timeframe: ${timeframeText}
Focus area: ${focusLabelMap[goal.focus]}

You are WrestleWell Coach. Give this athlete a short, practical 3-step plan they can try for the next ${timeframeText}.
- Keep the tone simple, encouraging, and specific.
- Aim for middle or high school wrestlers.
- Focus on controllable actions (drills, habits, conversations with coaches/parents).
- Do NOT mention being an AI.
`.trim();

      const res = await fetch("/api/ai-coach-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply: string =
        data.reply ||
        "Coach is having trouble forming a full response right now. Try again later.";

      setPlansByGoal((prev) => ({
        ...prev,
        [goal.id]: reply,
      }));
    } catch (err: any) {
      console.error("Generate goal plan error:", err);
      setPlanErrorFor((prev) => ({
        ...prev,
        [goal.id]:
          "Couldn’t reach WrestleWell Coach. Make sure your local model is running (Ollama) and try again.",
      }));
    } finally {
      setLoadingPlanFor(null);
    }
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const doneGoals = goals.filter((g) => g.status === "done");

  const primaryFocus =
    activeGoals[0]?.focus || doneGoals[0]?.focus || ("mat" as const);
  const quote =
    QUOTES.find((q) => q.focus === primaryFocus) ?? QUOTES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-800 bg-slate-950/90">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-50">
            Wrestle<span className="text-amber-400">Well</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Goals • Habits • Inspiration
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
          <Link href="/ai-coach" className="block">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-left text-slate-300 hover:bg-slate-800/70 transition">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>WrestleWell Coach</span>
            </button>
          </Link>
        </nav>
      </aside>

      {/* Main */}
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
              Goals & Inspiration
            </h2>
          </div>
          <div className="text-xs text-slate-300">
            Active goals:{" "}
            <span className="font-semibold text-amber-300">
              {activeGoals.length}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Left: Goals */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Set a clear goal
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Keep it simple and controllable: effort, habits, and specific
                  positions—not just &quot;win state&quot;.
                </p>

                <form
                  onSubmit={addGoal}
                  className="space-y-3 text-sm bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-3"
                >
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Goal
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Example: Get out from bottom in under 10 seconds"
                      className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Why this matters
                    </label>
                    <textarea
                      value={why}
                      onChange={(e) => setWhy(e.target.value)}
                      rows={2}
                      placeholder="Example: I keep getting ridden out in duals and I want to trust my bottom game."
                      className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 resize-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <select
                      value={timeframe}
                      onChange={(e) =>
                        setTimeframe(e.target.value as Timeframe)
                      }
                      className="bg-slate-950/60 border border-slate-700 rounded-full px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                    >
                      <option value="this_week">This week</option>
                      <option value="this_month">This month</option>
                      <option value="season">This season</option>
                    </select>
                    <select
                      value={focus}
                      onChange={(e) =>
                        setFocus(e.target.value as Goal["focus"])
                      }
                      className="bg-slate-950/60 border border-slate-700 rounded-full px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                    >
                      <option value="mat">On the mat</option>
                      <option value="lift">Lifting / strength</option>
                      <option value="mental">Mindset</option>
                      <option value="school">School</option>
                      <option value="life">Life / habits</option>
                    </select>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                    >
                      Add goal
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-3 text-xs">
                <h4 className="text-slate-200 font-semibold">
                  Active goals
                </h4>
                {activeGoals.length === 0 && (
                  <p className="text-slate-400">
                    No active goals yet. Add one small goal to get started.
                  </p>
                )}
                {activeGoals.map((g) => {
                  const plan = plansByGoal[g.id];
                  const error = planErrorFor[g.id];
                  const isLoading = loadingPlanFor === g.id;

                  return (
                    <div
                      key={g.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <p className="font-semibold text-slate-50 text-sm">
                          {g.title}
                        </p>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => handleGeneratePlan(g)}
                            disabled={isLoading}
                            className="px-3 py-1 rounded-full text-[11px] bg-teal-500/10 text-teal-300 border border-teal-400/40 hover:bg-teal-500/20 disabled:opacity-50"
                          >
                            {isLoading
                              ? "Building plan..."
                              : "Get 3-step plan"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(g.id)}
                            className="px-2 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/20"
                          >
                            Mark done
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGoal(g.id)}
                            className="px-2 py-1 rounded-full text-[11px] bg-rose-500/10 text-rose-300 border border-rose-400/40 hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {g.why && (
                        <p className="text-slate-300 text-[11px]">
                          Why: {g.why}
                        </p>
                      )}
                      <p className="text-slate-500 text-[11px]">
                        Timeframe:{" "}
                        {g.timeframe === "this_week"
                          ? "This week"
                          : g.timeframe === "this_month"
                          ? "This month"
                          : "This season"}{" "}
                        · Focus: {g.focus}
                      </p>

                      {error && (
                        <p className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/40 rounded-lg px-2 py-1">
                          {error}
                        </p>
                      )}

                      {plan && (
                        <div className="text-[11px] text-slate-200 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2">
                          <p className="font-semibold mb-1">
                            WrestleWell Coach plan:
                          </p>
                          <p className="whitespace-pre-wrap">{plan}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {doneGoals.length > 0 && (
                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                  <h4 className="text-slate-200 font-semibold">
                    Completed goals
                  </h4>
                  {doneGoals.map((g) => (
                    <div
                      key={g.id}
                      className="bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 flex justify-between items-center"
                    >
                      <p className="text-slate-300 text-[11px] line-through">
                        {g.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleStatus(g.id)}
                        className="px-2 py-1 rounded-full text-[11px] border border-slate-700 text-slate-300 hover:bg-slate-800/70"
                      >
                        Make active again
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Right: Inspiration */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Today’s reminder
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Based on your main focus right now.
                </p>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm">
                  <p className="text-amber-300 mb-1 text-[11px] uppercase tracking-wide">
                    Focus: {primaryFocus}
                  </p>
                  <p className="text-slate-50">{quote.text}</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-slate-200">
                  How to set solid wrestling goals:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make them about habits and positions, not just trophies.</li>
                  <li>Keep them small enough to track week to week.</li>
                  <li>Share them with a coach or trusted adult.</li>
                </ul>
              </div>

              <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-1">
                <p>
                  Now you can tap into WrestleWell Coach from your goals. Use the
                  3-step plans as a starting point and adjust with your real
                  coach.
                </p>
                <p>
                  This still runs mostly on your device. AI comes from your local
                  model (Ollama), not a cloud account.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GoalsPage;