"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Mood = "locked-in" | "confident" | "tired" | "stressed" | "beat-up";

type TrainingSession = {
  id: string;
  date: string;
  type?: "practice" | "match" | "lift" | "conditioning" | string;
  style?: string;
  intensity?: number;
  mood?: Mood | null;
};

type UserProfile = {
  name?: string;
  email?: string;
  role?: string;
  gradYear?: string | number | null;
};

type GoalStatus = "active" | "done";
type Timeframe = "this_week" | "this_month" | "season";
type GoalFocus = "mat" | "lift" | "mental" | "school" | "life";

type StoredGoal = {
  id: string;
  title: string;
  why?: string;
  timeframe?: Timeframe;
  focus?: GoalFocus;
  status?: GoalStatus;
  createdAt?: string;
  updatedAt?: string;
};

const SESSIONS_KEY = "wrestlewell_sessions";
const GOALS_KEY = "wrestlewell_goals_v1";

function loadGoalsSafely(): StoredGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse wrestlewell_goals_v1", err);
    return [];
  }
}

const CoachPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile>({});
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [latestMood, setLatestMood] = useState<Mood | null>(null);
  const [goals, setGoals] = useState<StoredGoal[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawUser = window.localStorage.getItem("wrestlewell_user");
    if (rawUser) {
      try {
        const data = JSON.parse(rawUser) as UserProfile;
        setUser(data);
      } catch (err) {
        console.error("Failed to parse wrestlewell_user", err);
      }
    }

    const rawSessions = window.localStorage.getItem(SESSIONS_KEY);
    if (rawSessions) {
      try {
        const data = JSON.parse(rawSessions) as TrainingSession[];
        setSessions(data);
        const latestWithMood = data.find((s) => s.mood);
        if (latestWithMood && latestWithMood.mood) {
          setLatestMood(latestWithMood.mood);
        }
      } catch (err) {
        console.error("Failed to parse wrestlewell_sessions", err);
      }
    }

    // Load goals for this athlete on this device
    setGoals(loadGoalsSafely());
  }, []);

  const name = user.name || "Athlete";
  const gradYear =
    user.gradYear != null && String(user.gradYear).trim() !== ""
      ? String(user.gradYear)
      : null;

  // Last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  const recent = sessions.filter((s) => {
    const d = new Date(s.date);
    return !Number.isNaN(d.getTime()) && d >= sevenDaysAgo && d <= now;
  });

  const totalSessions = recent.length;
  const matSessions = recent.filter(
    (s) => s.type === "practice" || s.type === "match"
  ).length;
  const liftSessions = recent.filter((s) => s.type === "lift").length;
  const avgIntensity =
    recent.length > 0
      ? (
          recent.reduce(
            (sum, s) => sum + (s.intensity != null ? s.intensity : 3),
            0
          ) / recent.length
        ).toFixed(1)
      : "–";

  const moodSummary = getMoodSummary(recent);
  const moodText = latestMood ? formatMood(latestMood) : "Not yet logged";
  const quote = getQuoteForMood(latestMood);

  // Goals broken out for coach view
  const activeGoals = goals.filter(
    (g) => (g.status ?? "active") === "active"
  );
  const doneGoals = goals.filter((g) => g.status === "done");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="text-xs text-slate-300 hover:text-amber-300">
              ← Back to athlete dashboard
            </button>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">
            Coach / Parent View
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          A simple, respectful view of training, energy, and goals.
        </p>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Athlete snapshot */}
          <section className="lg:col-span-1 bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
              Athlete
            </p>
            <h2 className="text-xl font-semibold text-slate-50 mb-1">
              {name}
            </h2>
            {gradYear && (
              <p className="text-sm text-slate-300 mb-2">
                Grad year: <span className="font-semibold">{gradYear}</span>
              </p>
            )}
            <p className="text-xs text-slate-400 mb-4">
              This view is designed for trusted adults—coaches, parents, and
              guardians—to see patterns in effort, energy, and high-level goals
              without exposing private details like journal entries or weight
              history.
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>See training consistency at a glance.</li>
              <li>Notice mood trends over a week or more.</li>
              <li>
                Use goals to guide supportive conversations, not add pressure.
              </li>
            </ul>
            <p className="mt-4 text-[11px] text-slate-500">
              WrestleWell doesn&apos;t replace medical or mental health care. If
              the athlete seems overwhelmed or down for a while, consider
              connecting them with a qualified professional.
            </p>
          </section>

          {/* Summary + mood */}
          <section className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Last 7 days</h2>
              <p className="text-xs text-slate-400 mb-3">
                These numbers give a rough picture of workload, not a full story
                of how the athlete is doing.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <SummaryPill label="Total sessions" value={String(totalSessions)} />
                <SummaryPill label="Mat sessions" value={String(matSessions)} />
                <SummaryPill label="Lift sessions" value={String(liftSessions)} />
                <SummaryPill label="Avg intensity" value={avgIntensity} />
              </div>
            </div>

            {/* Mood + mindset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="border border-slate-800 rounded-2xl bg-slate-950/60 px-3 py-3">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                  Mood trend
                </p>
                <p className="text-sm text-slate-200 mb-1">
                  Last logged mood:{" "}
                    <span className="font-semibold">{moodText}</span>
                </p>
                <p className="text-xs text-slate-300">{moodSummary}</p>
              </div>

              <div className="border border-slate-800 rounded-2xl bg-slate-950/60 px-3 py-3">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                  Conversation starter
                </p>
                <p className="text-sm font-semibold text-slate-50 mb-1">
                  {quote.title}
                </p>
                <p className="text-xs text-slate-300 mb-2">{quote.body}</p>
                <p className="text-[10px] text-slate-500">
                  Use questions like “How have practices felt lately?” or “What
                  do you need more of—rest, reps, or confidence?” instead of
                  only talking about wins and losses.
                </p>
              </div>
            </div>

            {/* Recent, high-level sessions (no private notes) */}
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-semibold mb-2">Recent sessions</h3>
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No sessions logged yet from this device.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-auto pr-1 text-xs">
                  {sessions.slice(0, 8).map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-100">
                          {formatType(s.type)} · {formatStyle(s.style)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateLabel(s.date)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>
                          Intensity:{" "}
                          <span className="text-slate-200 font-semibold">
                            {s.intensity != null ? `${s.intensity}/5` : "–"}
                          </span>
                        </span>
                        <span>
                          Mood:{" "}
                          <span className="text-slate-200 font-medium">
                            {s.mood ? formatMood(s.mood) : "Not logged"}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[10px] text-slate-500">
                Detailed notes and weight data are kept private in the full
                version unless the athlete chooses to share them.
              </p>
            </div>
          </section>
        </div>

        {/* Goals snapshot row */}
        <div className="max-w-6xl mx-auto mt-6">
          <CoachGoalsBlock activeGoals={activeGoals} doneGoals={doneGoals} />
        </div>

        {/* Coaching tools: practice plans, scouting, fuel */}
        <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <PracticePlansCard />
          <CoachScoutCard />
          <CoachFuelCard />
        </div>
      </main>
    </div>
  );
};

const SummaryPill: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 flex flex-col">
    <span className="text-[11px] uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="text-sm font-semibold text-slate-50 mt-1">{value}</span>
  </div>
);

const CoachGoalsBlock: React.FC<{
  activeGoals: StoredGoal[];
  doneGoals: StoredGoal[];
}> = ({ activeGoals, doneGoals }) => {
  const labelTimeframe = (t?: Timeframe): string => {
    if (t === "this_week") return "This week";
    if (t === "this_month") return "This month";
    if (t === "season") return "This season";
    return "This season";
  };

  const labelFocus = (f?: GoalFocus): string => {
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
  };

  const supportTipsForGoal = (g: StoredGoal): string[] => {
    const focus = g.focus ?? "mat";
    const tf = g.timeframe ?? "season";

    const shortWindow = tf === "this_week" || tf === "this_month";

    switch (focus) {
      case "mat":
        return [
          shortWindow
            ? "Ask which position or situation this goal is about (bottom, top, neutral) and help them find 10–15 extra drill minutes a couple times this week."
            : "Check in once a week about how this position feels in live goes instead of focusing only on wins and losses.",
          "If you’re a coach, build a few reps of that position into warmups or short, focused drills.",
          "Praise effort and progress on the skill itself, not just match outcomes.",
        ];
      case "lift":
        return [
          "Help them have a consistent lift schedule rather than random hard days—consistency beats hero workouts.",
          "Support sleep, nutrition, and rides to the weight room or gym when possible.",
          "Remind them that form and staying healthy matter more than chasing max numbers every session.",
        ];
      case "mental":
        return [
          "Start low-pressure conversations like “How are practices feeling?” instead of “Why didn’t you win?”",
          "Normalize nerves and off days—share that it’s okay to talk about being stressed or anxious.",
          "Encourage simple routines: a consistent pre-match routine, breathing, or a short positive self-talk script.",
        ];
      case "school":
        return [
          "Help them map out busy weeks—meets, exams, and homework—so they’re not surprised by overload.",
          "Create a quiet, phone-light space for homework when you can.",
          "Celebrate effort in school the same way you do on the mat—grades are part of the overall load they’re carrying.",
        ];
      case "life":
        return [
          "Ask what habits outside wrestling they’re trying to improve (sleep, phone time, chores, relationships).",
          "Make changes alongside them when possible (family bedtime, shared screen rules, shared walks).",
          "When they slip, keep the tone curious, not critical—“What got in the way?” instead of “Why didn’t you do it?”",
        ];
      default:
        return [
          "Ask them to explain this goal in their own words and what “success” would look like.",
          "Check in regularly on how it feels, not just whether they “hit” the goal.",
        ];
    }
  };

  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
      <h3 className="text-lg font-semibold mb-1">Goals snapshot</h3>
      <p className="text-xs text-slate-400 mb-3">
        These are high-level goals the athlete set. Use them to support effort
        and well-being, not to add pressure.
      </p>

      <div className="flex flex-wrap gap-3 text-xs mb-4">
        <span className="bg-slate-950/60 border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-slate-400">
            Active goals
          </span>
          <span className="text-sm font-semibold text-amber-300">
            {activeGoals.length}
          </span>
        </span>
        <span className="bg-slate-950/60 border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-slate-400">
            Completed
          </span>
          <span className="text-sm font-semibold text-emerald-300">
            {doneGoals.length}
          </span>
        </span>
      </div>

      <div className="space-y-3 text-sm">
        {activeGoals.length === 0 ? (
          <p className="text-xs text-slate-400">
            No active goals set on this device yet. When the athlete adds goals,
            you&apos;ll see them here with ideas for how to support them.
          </p>
        ) : (
          activeGoals.map((g) => {
            const tips = supportTipsForGoal(g);
            return (
              <div
                key={g.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 flex flex-col gap-1"
              >
                <p className="text-slate-50 text-sm font-semibold">
                  {g.title}
                </p>
                <p className="text-[11px] text-slate-400">
                  {labelTimeframe(g.timeframe)} · {labelFocus(g.focus)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  How to support this goal:
                </p>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                  {tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-500 mt-1">
                  The deeper reasons why this goal matters stay private in the
                  athlete’s app unless they choose to share them with you.
                </p>
              </div>
            );
          })
        )}
      </div>

      {doneGoals.length > 0 && (
        <div className="mt-4 border-t border-slate-800 pt-3 text-xs space-y-1">
          <p className="text-slate-300 font-semibold">Recently completed goals</p>
          {doneGoals.slice(0, 3).map((g) => (
            <div
              key={g.id}
              className="bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 flex justify-between items-center"
            >
              <p className="text-slate-300 text-[11px] line-through">
                {g.title}
              </p>
              <span className="text-[11px] text-emerald-300">Done</span>
            </div>
          ))}
          {doneGoals.length > 3 && (
            <p className="text-[11px] text-slate-500">
              + {doneGoals.length - 3} more completed on this device.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

/** NEW: Coaching tools cards */

const PracticePlansCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-4 md:px-5 md:py-5 flex flex-col">
    <h3 className="text-sm font-semibold mb-1">Practice Plans</h3>
    <p className="text-xs text-slate-300 mb-3">
      Sketch simple, focused practice plans that match the athlete&apos;s goals,
      season phase, and energy.
    </p>
    <ul className="text-[11px] text-slate-300 space-y-1 mb-3 list-disc list-inside">
      <li>Short, high-focus segments instead of marathon practices.</li>
      <li>Build drills around positions they&apos;re actually working on.</li>
      <li>
        Use mood and recent load to dial intensity up or down intelligently.
      </li>
    </ul>
    <div className="mt-auto flex gap-2">
      <Link href="/practice-plans">
        <PrimaryButton className="text-xs px-3 py-1.5">
          Open Practice Plans
        </PrimaryButton>
      </Link>
      <Link href="/ai-coach">
        <GhostButton className="text-xs px-3 py-1.5">
          Ask AI for a plan
        </GhostButton>
      </Link>
    </div>
  </section>
);

const CoachScoutCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-4 md:px-5 md:py-5 flex flex-col">
    <h3 className="text-sm font-semibold mb-1">Opponent Scouting</h3>
    <p className="text-xs text-slate-300 mb-3">
      Turn film and stats into a calm, clear game plan instead of panic-scrolling
      rankings.
    </p>
    <ul className="text-[11px] text-slate-300 space-y-1 mb-3 list-disc list-inside">
      <li>Note ties, setups, and finishes your athlete will actually see.</li>
      <li>Identify safe attacks and positions to avoid.</li>
      <li>Keep the plan to 1–2 simple cues they can remember.</li>
    </ul>
    <div className="mt-auto flex gap-2">
      <Link href="/scout">
        <PrimaryButton className="text-xs px-3 py-1.5">
          Open Scouting
        </PrimaryButton>
      </Link>
      <Link href="/film/athlete">
        <GhostButton className="text-xs px-3 py-1.5">
          Jump to Film
        </GhostButton>
      </Link>
    </div>
  </section>
);

const CoachFuelCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-4 md:px-5 md:py-5 flex flex-col">
    <h3 className="text-sm font-semibold mb-1">Fuel & Recovery Guide</h3>
    <p className="text-xs text-slate-300 mb-3">
      Help the athlete show up with energy all year—without turning eating and
      weight into constant stress.
    </p>
    <ul className="text-[11px] text-slate-300 space-y-1 mb-3 list-disc list-inside">
      <li>Pre-dual and tournament-day snack and hydration ideas.</li>
      <li>Recovery checklists for the night after competition.</li>
      <li>Prompts to talk about cut plans in a safer, honest way.</li>
    </ul>
    <div className="mt-auto flex gap-2">
      <Link href="/fuel">
        <PrimaryButton className="text-xs px-3 py-1.5">
          Open Guide
        </PrimaryButton>
      </Link>
      <Link href="/ai-coach">
        <GhostButton className="text-xs px-3 py-1.5">
          Ask AI about fueling
        </GhostButton>
      </Link>
    </div>
  </section>
);

function formatType(t: TrainingSession["type"]): string {
  if (t === "practice") return "Practice";
  if (t === "match") return "Match";
  if (t === "lift") return "Lift";
  if (t === "conditioning") return "Conditioning";
  return "Session";
}

function formatStyle(style?: string): string {
  if (!style) return "Mixed";
  const s = style.toLowerCase();
  if (s === "folkstyle") return "Folkstyle";
  if (s === "freestyle") return "Freestyle";
  if (s === "greco" || s === "greco-roman") return "Greco-Roman";
  return "Mixed";
}

function formatMood(m?: Mood | null): string {
  if (!m) return "Not logged";
  if (m === "locked-in") return "Locked in";
  if (m === "confident") return "Confident";
  if (m === "tired") return "Tired";
  if (m === "stressed") return "Stressed";
  if (m === "beat-up") return "Beat up";
  return m;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getMoodSummary(sessions: TrainingSession[]): string {
  if (sessions.length === 0) {
    return "No mood check-ins logged yet. Once the athlete logs how they feel, you’ll see simple trends here.";
  }

  const counts: Record<Mood, number> = {
    "locked-in": 0,
    confident: 0,
    tired: 0,
    stressed: 0,
    "beat-up": 0,
  };

  sessions.forEach((s) => {
    if (s.mood && counts[s.mood] != null) {
      counts[s.mood] += 1;
    }
  });

  const totalLogged = Object.values(counts).reduce((a, b) => a + b, 0);
  if (totalLogged === 0) {
    return "Mood hasn’t been logged on recent sessions. Encourage the athlete to use it as a quick, honest check-in.";
  }

  const heavy =
    counts["tired"] + counts["stressed"] + counts["beat-up"];
  const positive = counts["locked-in"] + counts["confident"];

  if (heavy > positive && heavy >= 3) {
    return "There have been more tired, stressed, or beat-up days than confident ones this week. It might be worth asking how they’re feeling and whether rest, recovery, or support would help.";
  }

  if (positive >= heavy && positive >= 3) {
    return "Most recorded days this week have been locked in or confident. Keep encouraging healthy routines—sleep, nutrition, and recovery—to sustain that.";
  }

  return "Mood check-ins have been a mix. Use them as a cue to ask open-ended questions about how training and school life are feeling.";
}

function getQuoteForMood(mood: Mood | null): { title: string; body: string } {
  switch (mood) {
    case "locked-in":
      return {
        title: "Trust the process they’re building.",
        body: "Locked-in days are valuable. Help them keep perspective so their confidence is based on effort and habits, not just results.",
      };
    case "confident":
      return {
        title: "Protect their confidence with support.",
        body: "Confidence grows when athletes feel believed in. Celebrate small improvements, not just wins on the scoreboard.",
      };
    case "tired":
      return {
        title: "Fatigue is feedback, not weakness.",
        body: "A stretch of tired days might mean school, training, and life are adding up. Adjust volume or encourage better sleep and recovery when needed.",
      };
    case "stressed":
      return {
        title: "Pressure is lighter when it’s shared.",
        body: "If they’re logging stress, a calm conversation can help. Ask what’s on their mind and listen more than you talk.",
      };
    case "beat-up":
      return {
        title: "Tough doesn’t mean ignoring pain.",
        body: "If they often feel beat up, make sure they’re being honest about injuries and soreness. Smart recovery keeps them in the sport longer.",
      };
    default:
      return {
        title: "Stay curious, not critical.",
        body: "The goal of this view is to understand the athlete’s experience, not to judge them. Ask questions that show you care about them as a person first.",
      };
  }
}

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
    bg-amber-400 text-slate-950 hover:bg-amber-300 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const GhostButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium
    text-slate-300 hover:bg-slate-800/80 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default CoachPage;