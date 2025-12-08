// app/film/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type FilmEntry = {
  id: string;
  title: string;
  date: string; // ISO or simple text
  style: "folkstyle" | "freestyle" | "greco" | "mixed";
  sessionType: "match" | "practice" | "drill" | "other";
  opponent?: string;
  teamOrEvent?: string;
  weightClass?: string;
  videoUrl?: string;
  tags?: string; // comma-separated
  notes?: string; // can include manual timestamps
};

const STORAGE_KEY = "wrestlewell_film_v1";

const FilmPage: React.FC = () => {
  const [entries, setEntries] = useState<FilmEntry[]>([]);
  const [savingError, setSavingError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [style, setStyle] = useState<FilmEntry["style"]>("folkstyle");
  const [sessionType, setSessionType] =
    useState<FilmEntry["sessionType"]>("match");
  const [opponent, setOpponent] = useState("");
  const [teamOrEvent, setTeamOrEvent] = useState("");
  const [weightClass, setWeightClass] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch (err) {
      console.error("Failed to load film entries", err);
    }
  }, []);

  function saveEntries(next: FilmEntry[]) {
    setEntries(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavingError(null);
    } catch (err) {
      console.error("Failed to save film entries", err);
      setSavingError(
        "Could not save new film entry (storage full or blocked on this device)."
      );
    }
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newEntry: FilmEntry = {
      id: `${Date.now()}`,
      title: cleanTitle,
      date: date || new Date().toISOString().slice(0, 10),
      style,
      sessionType,
      opponent: opponent.trim() || undefined,
      teamOrEvent: teamOrEvent.trim() || undefined,
      weightClass: weightClass.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      tags: tags.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const next = [newEntry, ...entries];
    saveEntries(next);

    // Light reset (keep date/style/type so it’s faster to add more)
    setTitle("");
    setOpponent("");
    setTeamOrEvent("");
    setWeightClass("");
    setVideoUrl("");
    setTags("");
    setNotes("");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <Link href="/coach/tools">
            <button className="text-xs text-slate-300 hover:text-amber-300">
              ← Coach Tools
            </button>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">
            Film Study & Video Breakdown
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Save film links, tag positions, and jot teaching points.
        </p>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)] gap-6">
          {/* Left: Form */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
            <h2 className="text-base md:text-lg font-semibold mb-2">
              Add a film session
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              This stays on this device only. Later we can connect it to AI to
              suggest drills and breakdowns, but for now it&apos;s your structured
              notebook.
            </p>

            <form onSubmit={handleAdd} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Title / label
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="vs Smith – Dual at Central"
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) =>
                      setStyle(e.target.value as FilmEntry["style"])
                    }
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  >
                    <option value="folkstyle">Folkstyle</option>
                    <option value="freestyle">Freestyle</option>
                    <option value="greco">Greco-Roman</option>
                    <option value="mixed">Mixed / drilling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Session type
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) =>
                      setSessionType(
                        e.target.value as FilmEntry["sessionType"]
                      )
                    }
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  >
                    <option value="match">Match</option>
                    <option value="practice">Practice go</option>
                    <option value="drill">Drill session</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Weight (optional)
                  </label>
                  <input
                    value={weightClass}
                    onChange={(e) => setWeightClass(e.target.value)}
                    placeholder="132, 145, etc."
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Opponent (optional)
                  </label>
                  <input
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Team / event (optional)
                  </label>
                  <input
                    value={teamOrEvent}
                    onChange={(e) => setTeamOrEvent(e.target.value)}
                    placeholder="School, club, or tournament"
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Video link (Hudl, YouTube, Drive, etc.)
                </label>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  WrestleWell just saves the link; it doesn&apos;t host or upload
                  video.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Tags (optional)
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="bottom escapes, re-shots, hand fighting"
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes (you can include timestamps)
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Examples:
0:25 – Hesitated on the re-shot, reach instead of level change
1:40 – Rode too high on top, lost hip pressure
2:55 – Good chain: fake, re-attack, finish on single`}
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 resize-y"
                />
              </div>

              {savingError && (
                <p className="text-[11px] text-red-400">{savingError}</p>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition mt-1"
              >
                Save film session
              </button>
            </form>
          </section>

          {/* Right: List */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base md:text-lg font-semibold">
                Saved film sessions
              </h2>
              <p className="text-[11px] text-slate-400">
                {entries.length === 0
                  ? "None yet"
                  : `${entries.length} on this device`}
              </p>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              You might review 1–2 key positions instead of the whole match:
              bottom off the whistle, finishing leg attacks, or mat returns.
            </p>

            {entries.length === 0 ? (
              <p className="text-xs text-slate-500">
                When you add film sessions, they&apos;ll show up here with quick
                tags and links.
              </p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1 text-sm">
                {entries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-3"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-50">
                          {entry.title}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(entry.date)} ·{" "}
                          {labelStyle(entry.style)} ·{" "}
                          {labelSessionType(entry.sessionType)}
                        </p>
                        {(entry.opponent || entry.teamOrEvent || entry.weightClass) && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            {entry.opponent && <>vs {entry.opponent} · </>}
                            {entry.teamOrEvent && <>{entry.teamOrEvent} · </>}
                            {entry.weightClass && <>WT: {entry.weightClass}</>}
                          </p>
                        )}
                      </div>
                      {entry.videoUrl && (
                        <Link
                          href={entry.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-amber-300 hover:text-amber-200 underline"
                        >
                          Open video
                        </Link>
                      )}
                    </div>

                    {entry.tags && (
                      <p className="text-[11px] text-teal-200 mb-1">
                        Tags: {entry.tags}
                      </p>
                    )}

                    {entry.notes && (
                      <p className="text-[11px] text-slate-300 whitespace-pre-line">
                        {entry.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}

            <p className="mt-3 text-[10px] text-slate-500">
              In a future version, WrestleWell Coach will be able to read these
              notes and suggest drills, game plans, and focus points based on
              what you&apos;re seeing on film.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

function formatDate(input: string): string {
  if (!input) return "Date not set";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function labelStyle(style: FilmEntry["style"]): string {
  if (style === "folkstyle") return "Folkstyle";
  if (style === "freestyle") return "Freestyle";
  if (style === "greco") return "Greco-Roman";
  return "Mixed / drilling";
}

function labelSessionType(t: FilmEntry["sessionType"]): string {
  if (t === "match") return "Match";
  if (t === "practice") return "Practice go";
  if (t === "drill") return "Drill session";
  return "Other";
}

export default FilmPage;