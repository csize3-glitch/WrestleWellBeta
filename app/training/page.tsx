"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type SessionType = "practice" | "match" | "lift" | "conditioning";
type Style = "folkstyle" | "freestyle" | "greco" | "other";
type Mood = "locked-in" | "confident" | "tired" | "stressed" | "beat-up";

type TrainingSession = {
  id: string;
  date: string; // ISO
  type: SessionType;
  style: Style;
  durationMinutes: number | null;
  focus: string;
  intensity: number; // 1–5
  mood: Mood | null;
  notes: string;
};

const STORAGE_KEY = "wrestlewell_sessions";

const TrainingPage: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [type, setType] = useState<SessionType>("practice");
  const [style, setStyle] = useState<Style>("folkstyle");
  const [duration, setDuration] = useState<string>("");
  const [focus, setFocus] = useState<string>("");
  const [intensity, setIntensity] = useState<number>(3);
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState<string>("");

  // Load existing sessions
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as TrainingSession[];
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error("Failed to save sessions", err);
    }
  }, [sessions]);

  function resetForm() {
    setDate(new Date().toISOString().slice(0, 10));
    setType("practice");
    setStyle("folkstyle");
    setDuration("");
    setFocus("");
    setIntensity(3);
    setMood(null);
    setNotes("");
  }

  function handleAddSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newSession: TrainingSession = {
      id: `${Date.now()}`,
      date,
      type,
      style,
      durationMinutes: duration ? Number(duration) || null : null,
      focus: focus.trim(),
      intensity,
      mood,
      notes: notes.trim(),
    };

    setSessions((prev) => [newSession, ...prev]);
    resetForm();
  }

  // Simple weekly stats (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  const recent = sessions.filter((s) => {
    const d = new Date(s.date);
    return d >= sevenDaysAgo && d <= now;
  });

  const totalSessions = recent.length;
  const matSessions = recent.filter(
    (s) => s.type === "practice" || s.type === "match"
  ).length;
  const liftSessions = recent.filter((s) => s.type === "lift").length;

  // Use most recent session mood for the quote, or current selection if no history yet
  const latestMood: Mood | null =
    sessions.length > 0 ? sessions[0].mood ?? null : mood;

  const quote = getQuoteForMood(latestMood);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="text-xs text-slate-300 hover:text-amber-300">
              ← Back to dashboard
            </button>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Training Log</h1>
        </div>
        <p className="text-xs text-slate-400">
          Make your work on the mat and in the weight room visible.
        </p>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <section className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
            <h2 className="text-lg font-semibold mb-1">Log a session</h2>
            <p className="text-xs text-slate-400 mb-4">
              Keep it simple and consistent. You don’t need to log every tiny
              detail to see patterns.
            </p>

            <form onSubmit={handleAddSession} className="space-y-4 text-sm">
              {/* Date & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Session type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <PillButton
                      active={type === "practice"}
                      onClick={() => setType("practice")}
                    >
                      Practice
                    </PillButton>
                    <PillButton
                      active={type === "match"}
                      onClick={() => setType("match")}
                    >
                      Match
                    </PillButton>
                    <PillButton
                      active={type === "lift"}
                      onClick={() => setType("lift")}
                    >
                      Lift
                    </PillButton>
                    <PillButton
                      active={type === "conditioning"}
                      onClick={() => setType("conditioning")}
                    >
                      Conditioning
                    </PillButton>
                  </div>
                </div>
              </div>

              {/* Style & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as Style)}
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  >
                    <option value="folkstyle">Folkstyle</option>
                    <option value="freestyle">Freestyle</option>
                    <option value="greco">Greco-Roman</option>
                    <option value="other">Other / mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Focus */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Main focus
                </label>
                <input
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Bottom escapes, hand fighting, single-leg finishes…"
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Intensity (1–5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setIntensity(n)}
                      className={`h-8 w-8 rounded-full text-xs font-semibold border ${
                        intensity === n
                          ? "border-amber-400 bg-amber-400/10 text-amber-200"
                          : "border-slate-700 text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  1 = very light, 3 = normal, 5 = brutally hard.
                </p>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  How are you feeling right now?
                </label>
                <div className="flex flex-wrap gap-2">
                  <MoodChip
                    label="Locked in"
                    code="locked-in"
                    active={mood === "locked-in"}
                    onClick={() => setMood("locked-in")}
                  />
                  <MoodChip
                    label="Confident"
                    code="confident"
                    active={mood === "confident"}
                    onClick={() => setMood("confident")}
                  />
                  <MoodChip
                    label="Tired"
                    code="tired"
                    active={mood === "tired"}
                    onClick={() => setMood("tired")}
                  />
                  <MoodChip
                    label="Stressed"
                    code="stressed"
                    active={mood === "stressed"}
                    onClick={() => setMood("stressed")}
                  />
                  <MoodChip
                    label="Beat up"
                    code="beat-up"
                    active={mood === "beat-up"}
                    onClick={() => setMood("beat-up")}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  This isn’t about being tough or weak. It just helps you and
                  your future self see patterns.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="What went well? What frustrated you? Anything to adjust next time?"
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition w-full md:w-auto"
              >
                Save session
              </button>
            </form>
          </section>

          {/* Right: Summary + recent sessions + mindset */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Last 7 days</h2>
              <p className="text-xs text-slate-400 mb-3">
                This is just for you. It’s about consistency, not perfection.
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <SummaryPill label="Total sessions" value={String(totalSessions)} />
                <SummaryPill label="Mat sessions" value={String(matSessions)} />
                <SummaryPill label="Lift sessions" value={String(liftSessions)} />
              </div>
            </div>

            {/* Mindset / quote card */}
            <div className="border border-slate-800 rounded-2xl bg-slate-950/60 px-3 py-3">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                Mindset note
              </p>
              <p className="text-sm font-semibold text-slate-50 mb-1">
                {quote.title}
              </p>
              <p className="text-xs text-slate-300 mb-2">{quote.body}</p>
              <p className="text-[10px] text-slate-500">
                WrestleWell isn&apos;t a therapist or doctor. If your stress or mood
                feels heavy for a while, talking with a trusted adult or
                professional can really help.
              </p>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-semibold mb-2">Recent sessions</h3>
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No sessions logged yet. Start by adding today&apos;s work.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {sessions.slice(0, 10).map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-100">
                          {formatSessionType(s.type)} · {formatStyle(s.style)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateLabel(s.date)}
                        </span>
                      </div>
                      {s.focus && (
                        <p className="text-slate-200 text-[11px] mb-1">
                          Focus: {s.focus}
                        </p>
                      )}
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>
                          Intensity:{" "}
                          <span className="text-slate-200 font-semibold">
                            {s.intensity}/5
                          </span>
                        </span>
                        {s.durationMinutes != null && (
                          <span>{s.durationMinutes} min</span>
                        )}
                      </div>
                      <div className="mt-1 flex justify-between items-center text-[11px] text-slate-400">
                        <span>
                          Mood:{" "}
                          <span className="text-slate-200 font-medium">
                            {s.mood ? formatMood(s.mood) : "Not logged"}
                          </span>
                        </span>
                      </div>
                      {s.notes && (
                        <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                          {s.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

type PillButtonProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

const PillButton: React.FC<PillButtonProps> = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3 py-1.5 text-xs border ${
      active
        ? "border-amber-400 bg-amber-400/10 text-amber-200"
        : "border-slate-700 text-slate-200 hover:bg-slate-800/80"
    }`}
  >
    {children}
  </button>
);

type MoodChipProps = {
  label: string;
  code: Mood;
  active: boolean;
  onClick: () => void;
};

const MoodChip: React.FC<MoodChipProps> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-[11px] border ${
      active
        ? "border-teal-300 bg-teal-300/10 text-teal-200"
        : "border-slate-700 text-slate-200 hover:bg-slate-800/80"
    }`}
  >
    {label}
  </button>
);

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

function formatSessionType(t: SessionType): string {
  if (t === "practice") return "Practice";
  if (t === "match") return "Match";
  if (t === "lift") return "Lift";
  if (t === "conditioning") return "Conditioning";
  return t;
}

function formatStyle(s: Style): string {
  if (s === "folkstyle") return "Folkstyle";
  if (s === "freestyle") return "Freestyle";
  if (s === "greco") return "Greco";
  if (s === "other") return "Other";
  return s;
}

function formatMood(m: Mood): string {
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

function getQuoteForMood(mood: Mood | null): { title: string; body: string } {
  switch (mood) {
    case "locked-in":
      return {
        title: "Trust your preparation.",
        body: "You’ve stacked work day after day. Breathe, clear your head, and let the reps you’ve already done take over.",
      };
    case "confident":
      return {
        title: "Stay humble, stay sharp.",
        body: "Confidence is earned. Keep your edge by doing the little things right—stance, motion, hand fight, breathe.",
      };
    case "tired":
      return {
        title: "Tired doesn’t mean done.",
        body: "Some of your best growth happens when you’re tired and still move your feet. But rest is part of the plan too—sleep, hydrate, refuel.",
      };
    case "stressed":
      return {
        title: "One position at a time.",
        body: "When your mind is crowded, zoom in. Bottom: one good first move. Neutral: one strong tie. You don’t have to win the whole season tonight.",
      };
    case "beat-up":
      return {
        title: "Listen to your body.",
        body: "Toughness isn’t ignoring pain forever. Smart wrestlers recover, take lighter days when needed, and come back sharper.",
      };
    default:
      return {
        title: "Show up, even on average days.",
        body: "Not every session is a highlight. Showing up on the ordinary days is what separates good from great.",
      };
  }
}

export default TrainingPage;