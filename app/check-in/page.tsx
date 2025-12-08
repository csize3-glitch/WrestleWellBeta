"use client";

import React, { useState } from "react";
import Link from "next/link";

type Mood = "Great" | "Okay" | "Tired" | "Stressed";
type CheckIn = {
  id: number;
  date: string;
  mood: Mood;
  stress: number;
  sleepHours: string;
  weight: string;
  note: string;
};

const CheckInPage: React.FC = () => {
  const [mood, setMood] = useState<Mood>("Okay");
  const [stress, setStress] = useState(5);
  const [sleepHours, setSleepHours] = useState("");
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  const today = new Date();
  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newEntry: CheckIn = {
      id: Date.now(),
      date: today.toISOString(),
      mood,
      stress,
      sleepHours: sleepHours.trim(),
      weight: weight.trim(),
      note: note.trim(),
    };

    setCheckIns((prev) => [newEntry, ...prev]);
    setSleepHours("");
    setWeight("");
    setNote("");
    setMood("Okay");
    setStress(5);
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
            Check-in • Mood, sleep, weight
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
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-300 hover:text-amber-300">
              ← Dashboard
            </Link>
            <h2 className="text-lg font-semibold tracking-tight">
              Daily Check-In
            </h2>
          </div>
          <span className="text-xs text-slate-400">Today • {todayLabel}</span>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Form */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-7 md:py-7 text-sm">
              <h3 className="text-lg font-semibold mb-1">How are you doing?</h3>
              <p className="text-slate-300 mb-4">
                Quick check-in on how you feel today. This helps you, your
                parents, and your coaches see trends over time.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mood */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Mood
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["Great", "Okay", "Tired", "Stressed"] as Mood[]).map(
                      (m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMood(m)}
                          className={`px-3 py-1.5 rounded-full border text-xs ${
                            mood === m
                              ? "border-amber-400 bg-amber-400/10 text-amber-200"
                              : "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                          }`}
                        >
                          {m}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Stress slider */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Stress level (1–10)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={stress}
                      onChange={(e) => setStress(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-sm text-slate-100 text-right">
                      {stress}
                    </span>
                  </div>
                </div>

                {/* Sleep + weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Sleep last night (hours)
                    </label>
                    <input
                      type="text"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      placeholder="e.g. 7.5"
                      className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Current weight (optional)
                    </label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 138.2"
                      className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Anything you want to remember about today (practice, school, stress, wins, etc.)"
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                  >
                    Save today&apos;s check-in
                  </button>
                  <span className="text-[11px] text-slate-500">
                    This is stored in your browser for now. Later we can sync it
                    to your account and let parents/coaches see it if you allow.
                  </span>
                </div>
              </form>
            </section>

            {/* History */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm">
              <h3 className="text-lg font-semibold mb-2">Recent check-ins</h3>
              {checkIns.length === 0 ? (
                <p className="text-slate-400">
                  No check-ins yet. Start with one today to build your streak.
                </p>
              ) : (
                <div className="space-y-3">
                  {checkIns.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                          {new Date(c.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-slate-300">
                          Mood:{" "}
                          <span className="font-semibold text-amber-200">
                            {c.mood}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-1">
                        Stress:{" "}
                        <span className="font-semibold text-slate-100">
                          {c.stress}/10
                        </span>
                        {c.sleepHours && (
                          <>
                            {" • "}Sleep:{" "}
                            <span className="font-semibold text-slate-100">
                              {c.sleepHours}h
                            </span>
                          </>
                        )}
                        {c.weight && (
                          <>
                            {" • "}Weight:{" "}
                            <span className="font-semibold text-slate-100">
                              {c.weight}
                            </span>
                          </>
                        )}
                      </p>
                      {c.note && (
                        <p className="text-xs text-slate-300">{c.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                Remember: this is a tool to notice patterns. If you feel really
                low, unsafe, or overwhelmed, talk to a trusted adult, coach,
                school counselor, or medical professional.
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CheckInPage;