"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Position = "neutral" | "top" | "bottom" | "scramble";
type FilmFocus =
  | "attack"
  | "defense"
  | "ride"
  | "escape"
  | "scramble"
  | "mindset";

type FilmClip = {
  id: string;
  date: string;
  opponent?: string;
  eventName?: string;
  result?: "win" | "loss" | "close" | "unknown";
  position?: Position;
  focus?: FilmFocus;
  periodOrTime?: string;
  whatHappened?: string;
  whatToWorkOn?: string;
  talkedWithCoach?: boolean;
  createdAt?: string;
};

const FILM_KEY = "wrestlewell_film_athlete_v1";

function loadFilmSafely(): FilmClip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FILM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse film clips", err);
    return [];
  }
}

function saveFilmSafely(clips: FilmClip[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FILM_KEY, JSON.stringify(clips));
  } catch (err) {
    
    console.error("Failed to save film clips", err);
  }
}

const AthleteFilmPage: React.FC = () => {
  const [clips, setClips] = useState<FilmClip[]>([]);
  const [date, setDate] = useState<string>("");
  const [opponent, setOpponent] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [result, setResult] = useState<FilmClip["result"]>("unknown");
  const [position, setPosition] = useState<Position>("neutral");
  const [focus, setFocus] = useState<FilmFocus>("attack");
  const [periodOrTime, setPeriodOrTime] = useState<string>("");
  const [whatHappened, setWhatHappened] = useState<string>("");
  const [whatToWorkOn, setWhatToWorkOn] = useState<string>("");
  const [talkedWithCoach, setTalkedWithCoach] = useState<boolean>(false);

  useEffect(() => {
    setClips(loadFilmSafely());
  }, []);

  function handleAddClip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    const clip: FilmClip = {
      id: `${Date.now()}`,
      date: date || nowIso,
      opponent: opponent.trim() || undefined,
      eventName: eventName.trim() || undefined,
      result,
      position,
      focus,
      periodOrTime: periodOrTime.trim() || undefined,
      whatHappened: whatHappened.trim() || undefined,
      whatToWorkOn: whatToWorkOn.trim() || undefined,
      talkedWithCoach,
      createdAt: nowIso,
    };

    const updated = [clip, ...clips];
    setClips(updated);
    saveFilmSafely(updated);

    // Reset form a bit
    setWhatHappened("");
    setWhatToWorkOn("");
    setPeriodOrTime("");
    setTalkedWithCoach(false);
  }

  const totalClips = clips.length;
  const lastDate = clips[0]?.date
    ? formatDateLabel(clips[0].date)
    : "Not yet logged";

  const mostCommonFocus = getMostCommonFocus(clips);

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
            My Film Study
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Log clips so you know exactly what to fix in practice.
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Left: form */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
            <h2 className="text-lg font-semibold mb-1">Add a clip breakdown</h2>
            <p className="text-xs text-slate-400 mb-4">
              Think of one key moment: a takedown, a scramble, getting ridden
              out, or a spot where you froze. Capture what happened and what you
              want to change.
            </p>

            <form onSubmit={handleAddClip} className="space-y-4 text-sm">
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
                    Event / tournament
                  </label>
                  <input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Dual vs. Central, Holiday Classic..."
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Opponent
                  </label>
                  <input
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="Opponent name or school"
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Result
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(
                      ["win", "loss", "close", "unknown"] as FilmClip["result"][]
                    ).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResult(r)}
                        className={`px-2 py-1 rounded-xl border text-[11px] ${
                          result === r
                            ? "border-amber-400 bg-amber-400/10 text-amber-200"
                            : "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                        }`}
                      >
                        {r === "win" && "Win"}
                        {r === "loss" && "Loss"}
                        {r === "close" && "Close"}
                        {r === "unknown" && "N/A"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Position
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(
                      ["neutral", "top", "bottom", "scramble"] as Position[]
                    ).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPosition(p)}
                        className={`px-2 py-1 rounded-xl border text-[11px] ${
                          position === p
                            ? "border-teal-300 bg-teal-300/10 text-teal-200"
                            : "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                        }`}
                      >
                        {p === "neutral" && "Neutral"}
                        {p === "top" && "Top"}
                        {p === "bottom" && "Bottom"}
                        {p === "scramble" && "Scramble"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Focus
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        "attack",
                        "defense",
                        "ride",
                        "escape",
                        "scramble",
                        "mindset",
                      ] as FilmFocus[]
                    ).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFocus(f)}
                        className={`px-2 py-1 rounded-xl border text-[11px] ${
                          focus === f
                            ? "border-amber-400 bg-amber-400/10 text-amber-200"
                            : "border-slate-700 text-slate-200 hover:bg-slate-800/70"
                        }`}
                      >
                        {f === "attack" && "Attack"}
                        {f === "defense" && "Defense"}
                        {f === "ride" && "Ride"}
                        {f === "escape" && "Escape"}
                        {f === "scramble" && "Scramble"}
                        {f === "mindset" && "Mindset"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Period / time in match (optional)
                  </label>
                  <input
                    value={periodOrTime}
                    onChange={(e) => setPeriodOrTime(e.target.value)}
                    placeholder="2nd period, :30 left in OT..."
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  What happened?
                </label>
                <textarea
                  value={whatHappened}
                  onChange={(e) => setWhatHappened(e.target.value)}
                  placeholder="Example: I was up 3–2 in the 3rd, shot from too far away, got sprawled on and gave up the go-behind."
                  rows={3}
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  What do you want to work on next?
                </label>
                <textarea
                  value={whatToWorkOn}
                  onChange={(e) => setWhatToWorkOn(e.target.value)}
                  placeholder="Example: Short offense from my feet when shots get stuffed, better hand-fighting before I attack."
                  rows={3}
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <input
                  id="talked-with-coach"
                  type="checkbox"
                  checked={talkedWithCoach}
                  onChange={(e) => setTalkedWithCoach(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950"
                />
                <label htmlFor="talked-with-coach" className="text-slate-300">
                  I’ve already talked about this clip with my coach.
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition mt-1"
              >
                Save clip breakdown
              </button>

              <p className="mt-2 text-[11px] text-slate-500">
                Stored only on this device for now. In the full version you’ll
                be able to link clips, share with coaches, and sync across
                devices.
              </p>
            </form>
          </section>

          {/* Right: summary + list */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col gap-4 text-sm">
            <div>
              <h2 className="text-lg font-semibold mb-1">Your film patterns</h2>
              <p className="text-xs text-slate-400 mb-3">
                You don&apos;t have to break down every second. Even a few key
                clips per week can shape smarter drilling and practice plans.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <SummaryChip label="Clips logged" value={String(totalClips)} />
                <SummaryChip label="Last film session" value={lastDate} />
                <SummaryChip
                  label="Most common focus"
                  value={mostCommonFocus ?? "Not yet logged"}
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-semibold mb-2">Recent clips</h3>
              {clips.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No film clips logged yet. After practice or a tournament, pick
                  1–3 moments and write down what happened and what you’d change
                  next time.
                </p>
              ) : (
                <div className="space-y-2 text-xs max-h-72 overflow-auto pr-1">
                  {clips.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-100">
                          {c.opponent || "Opponent"} ·{" "}
                          {formatPosition(c.position)} / {formatFocus(c.focus)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateLabel(c.date)}
                        </span>
                      </div>
                      {c.eventName && (
                        <p className="text-[11px] text-slate-400">
                          {c.eventName}
                        </p>
                      )}
                      {c.whatHappened && (
                        <p className="text-[11px] text-slate-300">
                          <span className="font-semibold text-slate-200">
                            What happened:
                          </span>{" "}
                          {c.whatHappened}
                        </p>
                      )}
                      {c.whatToWorkOn && (
                        <p className="text-[11px] text-slate-300">
                          <span className="font-semibold text-amber-200">
                            Work on next:
                          </span>{" "}
                          {c.whatToWorkOn}
                        </p>
                      )}
                      {c.talkedWithCoach && (
                        <p className="text-[10px] text-emerald-300">
                          ✓ Already talked about this with coach.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-col gap-1 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
                <p>
                  In the full version, you’ll be able to attach actual video
                  clips and send a summary directly to your coaches.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/scout"
                    className="text-slate-300 hover:text-amber-300"
                  >
                    Turn notes into a scout →
                  </Link>
                  <Link
                    href="/ai-coach"
                    className="text-amber-300 hover:text-amber-200"
                  >
                    Ask AI what to drill →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const SummaryChip: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 flex flex-col">
    <span className="text-[11px] uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="text-sm font-semibold text-slate-50 mt-1 truncate">
      {value}
    </span>
  </div>
);

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatPosition(p?: Position): string {
  if (!p) return "Position";
  if (p === "neutral") return "Neutral";
  if (p === "top") return "Top";
  if (p === "bottom") return "Bottom";
  if (p === "scramble") return "Scramble";
  return p;
}

function formatFocus(f?: FilmFocus): string {
  if (!f) return "Focus";
  if (f === "attack") return "Attack";
  if (f === "defense") return "Defense";
  if (f === "ride") return "Ride / top";
  if (f === "escape") return "Escape / bottom";
  if (f === "scramble") return "Scramble";
  if (f === "mindset") return "Mindset";
  return f;
}

function getMostCommonFocus(clips: FilmClip[]): string | null {
  if (clips.length === 0) return null;
  const counts: Partial<Record<FilmFocus, number>> = {};
  clips.forEach((c) => {
    if (!c.focus) return;
    counts[c.focus] = (counts[c.focus] ?? 0) + 1;
  });
  let best: FilmFocus | null = null;
  let bestCount = 0;
  (Object.keys(counts) as FilmFocus[]).forEach((k) => {
    const v = counts[k] ?? 0;
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  });
  if (!best) return null;
  return formatFocus(best);
}

export default AthleteFilmPage;