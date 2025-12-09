"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type GoalStatus = "active" | "done";
type Timeframe = "this_week" | "this_month" | "season";
type GoalFocus = "mat" | "lift" | "mental" | "school" | "life";

type Goal = {
  id: string;
  title: string;
  why?: string;
  timeframe: Timeframe;
  focus: GoalFocus;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  coachIdeas?: string; // optional tips returned from local AI coach
};

const GOALS_KEY = "wrestlewell_goals_v1";

function loadGoalsSafely(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Coerce unknown data into our Goal shape
    return parsed.map((g: Partial<Goal> & { [key: string]: unknown }) => {
      const nowIso = new Date().toISOString();

      const rawStatus = (g.status as string | undefined) ?? "active";
      const status: GoalStatus =
        rawStatus === "done" ? "done" : "active";

      const rawTimeframe = (g.timeframe as string | undefined) ?? "season";
      const timeframe: Timeframe =
        rawTimeframe === "this_week" ||
        rawTimeframe === "this_month" ||
        rawTimeframe === "season"
          ? rawTimeframe
          : "season";

      const rawFocus = (g.focus as string | undefined) ?? "mat";
      const focus: GoalFocus =
        rawFocus === "mat" ||
        rawFocus === "lift" ||
        rawFocus === "mental" ||
        rawFocus === "school" ||
        rawFocus === "life"
          ? rawFocus
          : "mat";

      return {
        id: g.id ?? String(Math.random()),
        title: g.title ?? "Untitled goal",
        why: g.why ?? "",
        timeframe,
        focus,
        status,
        createdAt: g.createdAt ?? nowIso,
        updatedAt: g.updatedAt ?? nowIso,
        coachIdeas: g.coachIdeas ?? "",
      };
    });
  } catch (err) {
    console.error("Failed to parse wrestlewell_goals_v1", err);
    return [];
  }
}

function saveGoalsSafely(goals: Goal[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (err) {
    console.error("Failed to save wrestlewell_goals_v1", err);
  }
}

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("this_week");
  const [focus, setFocus] = useState<GoalFocus>("mat");
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setGoals(loadGoalsSafely());
  }, []);

  function handleAddGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const nowIso = new Date().toISOString();
    const newGoal: Goal = {
      id: `${Date.now()}`,
      title: trimmed,
      why: why.trim() || "",
      timeframe,
      focus,
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveGoalsSafely(updated);

    setTitle("");
    setWhy("");
    setTimeframe("this_week");
    setFocus("mat");
  }

  function handleToggleStatus(id: string, newStatus: GoalStatus): void {
    const nowIso = new Date().toISOString();

    // newStatus is explicitly GoalStatus, so updated is a Goal[]
    const updated: Goal[] = goals.map((g) =>
      g.id === id
        ? {
            ...g,
            status: newStatus,
            updatedAt: nowIso,
          }
        : g
    );

    setGoals(updated);
    saveGoalsSafely(updated);
  }

  async function handleAskCoach(goal: Goal): Promise<void> {
    setAiError(null);
    setAiLoadingId(goal.id);

    try {
      const res = await fetch("/api/ai-coach-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `
Here is one of my wrestling goals:

Title: ${goal.title}
Why it matters: ${goal.why || "Not written yet"}
Timeframe: ${labelTimeframe(goal.timeframe)}
Focus area: ${labelFocus(goal.focus)}

Give me 3–4 concrete action steps I can take this week to move toward this goal. Keep it specific to wrestling (training, mindset, habits).`,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: { reply?: string } = await res.json();
      const text =
        data.reply ??
        "WrestleWell Coach had trouble generating ideas. Try again in a bit.";

      const updated: Goal[] = goals.map((g) =>
        g.id === goal.id
          ? {
              ...g,
              coachIdeas: text,
              updatedAt: new Date().toISOString(),
            }
          : g
      );

      setGoals(updated);
      saveGoalsSafely(updated);
    } catch (err) {
      console.error("AI coach (local) error:", err);
      setAiError(
        "Couldn’t reach WrestleWell Coach right now. Try again in a few minutes."
      );
    } finally {
      setAiLoadingId(null);
    }
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const doneGoals = goals.filter((g) => g.status === "done");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="text-xs text-slate-300 hover:text-amber-300">
              ← Back to dashboard
            </button>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">
            Goals &amp; Inspiration
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Set one or two things to aim at. Keep it simple and winnable.
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Left: create & list goals */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Set a goal</h2>
              <p className="text-xs text-slate-400 mb-3">
                Keep it specific and under your control. Example: &quot;Drill
                bottom escapes 3x this week&quot; instead of just &quot;Win
                the tournament.&quot;
              </p>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Goal
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Get out from bottom vs anyone in under 10 seconds."
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Why does this matter to you?
                </label>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  rows={3}
                  placeholder="Example: I lose matches late because I get ridden out. Fixing this gives me confidence in the 3rd period."
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Timeframe
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["this_week", "this_month", "season"] as Timeframe[]).map(
                      (tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setTimeframe(tf)}
                          className={`px-2 py-1 rounded-xl border text-[11px] ${
                            timeframe === tf
                              ? "border-amber-400 bg-amber-400/10 text-amber-200"
                              : "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                          }`}
                        >
                          {labelTimeframe(tf)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Focus area
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      ["mat", "lift", "mental", "school", "life"] as GoalFocus[]
                    ).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFocus(f)}
                        className={`px-2 py-1 rounded-xl border text-[11px] ${
                          focus === f
                            ? "border-teal-300 bg-teal-300/10 text-teal-200"
                            : "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                        }`}
                      >
                        {labelFocus(f)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
              >
                Save goal
              </button>
            </form>

            <div className="border-t border-slate-800 pt-4 mt-2 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-slate-300 font-semibold">
                  Your goals
                </span>
                <span className="text-slate-400">
                  Active:{" "}
                  <span className="text-amber-300 font-semibold">
                    {activeGoals.length}
                  </span>{" "}
                  · Done:{" "}
                  <span className="text-emerald-300 font-semibold">
                    {doneGoals.length}
                  </span>
                </span>
              </div>

              {goals.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No goals yet. Start with one small thing that would make this
                  week feel like a win.
                </p>
              ) : (
                <div className="space-y-2 text-xs max-h-80 overflow-auto pr-1">
                  {goals.map((g) => (
                    <GoalCard
                      key={g.id}
                      goal={g}
                      onToggleStatus={handleToggleStatus}
                      onAskCoach={handleAskCoach}
                      aiLoading={aiLoadingId === g.id}
                    />
                  ))}
                </div>
              )}

              {aiError && (
                <p className="mt-2 text-[11px] text-red-400">{aiError}</p>
              )}
            </div>
          </section>

          {/* Right: inspiration / guardrails */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">
                Make goals feel lighter, not heavier
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                Goals are here to focus your effort, not to beat yourself up.
                Use them to guide small daily choices.
              </p>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                <li>
                  Aim at habits you control: drills, sleep, effort, mindset.
                </li>
                <li>
                  Break big goals into tiny steps: &quot;3 extra bottom reps after
                  practice&quot; instead of &quot;Never get ridden out again.&quot;
                </li>
                <li>
                  If you miss a day, you didn&apos;t fail—you just start again
                  tomorrow.
                </li>
              </ul>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-sm font-semibold mb-1">Quick reset</h3>
              <p className="text-xs text-slate-300 mb-2">
                If wrestling or school feels heavy, pick just{" "}
                <span className="text-amber-300 font-semibold">
                  one tiny win
                </span>{" "}
                for today: a good warm-up, one hard go, or being a great
                teammate.
              </p>
              <p className="text-[11px] text-slate-500">
                You can always adjust or delete goals. They&apos;re tools, not
                grades.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

type GoalCardProps = {
  goal: Goal;
  onToggleStatus: (id: string, newStatus: GoalStatus) => void;
  onAskCoach: (goal: Goal) => Promise<void>;
  aiLoading: boolean;
};

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onToggleStatus,
  onAskCoach,
  aiLoading,
}) => {
  const isDone = goal.status === "done";

  return (
    <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 flex flex-col gap-1">
      <div className="flex justify-between items-center gap-2">
        <p
          className={`text-slate-50 text-sm font-semibold ${
            isDone ? "line-through text-slate-400" : ""
          }`}
        >
          {goal.title}
        </p>
        <button
          type="button"
          onClick={() =>
            onToggleStatus(goal.id, isDone ? "active" : "done")
          }
          className={`text-[11px] px-2 py-0.5 rounded-full border ${
            isDone
              ? "border-slate-700 text-slate-300 hover:bg-slate-800/70"
              : "border-emerald-400 text-emerald-300 hover:bg-emerald-400/10"
          }`}
        >
          {isDone ? "Mark active" : "Mark done"}
        </button>
      </div>

      <p className="text-[11px] text-slate-400">
        {labelTimeframe(goal.timeframe)} · {labelFocus(goal.focus)}
      </p>

      {goal.why && (
        <p className="text-[11px] text-slate-300">
          <span className="font-semibold text-slate-200">Why:</span>{" "}
          {goal.why}
        </p>
      )}

      <div className="flex justify-between items-center gap-2 mt-1">
        <button
          type="button"
          onClick={() => onAskCoach(goal)}
          disabled={aiLoading}
          className="text-[11px] px-2 py-1 rounded-full border border-teal-300 text-teal-200 hover:bg-teal-300/10 disabled:opacity-60"
        >
          {aiLoading ? "Coach is thinking..." : "Ask Coach for ideas"}
        </button>
        <span className="text-[10px] text-slate-500">
          Updated {new Date(goal.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {goal.coachIdeas && (
        <p className="mt-1 text-[11px] text-slate-300 whitespace-pre-line">
          <span className="font-semibold text-teal-200">
            Coach&apos;s ideas:
          </span>{" "}
          {goal.coachIdeas}
        </p>
      )}
    </div>
  );
};

function labelTimeframe(t: Timeframe): string {
  if (t === "this_week") return "This week";
  if (t === "this_month") return "This month";
  return "This season";
}

function labelFocus(f: GoalFocus): string {
  switch (f) {
    case "mat":
      return "On the mat";
    case "lift":
      return "Lifting / strength";
    case "mental":
      return "Mindset";
    case "school":
      return "School";
    case "life":
      return "Life / habits";
    default:
      return "On the mat";
  }
}

export default GoalsPage;