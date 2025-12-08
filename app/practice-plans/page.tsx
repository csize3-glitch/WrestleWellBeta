"use client";

import React from "react";
import Link from "next/link";

const PracticePlansPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6 md:px-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Practice Plans (Coach)
          </h1>
          <p className="text-xs text-slate-400">
            Sketch short, focused practices that match your wrestlers&apos; goals.
          </p>
        </div>
        <Link href="/coach" className="text-xs text-slate-300 hover:text-amber-300">
          ← Back to coach view
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-4 text-sm">
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5">
          <h2 className="text-sm font-semibold mb-2">
            Simple structure for a focused practice
          </h2>
          <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1 mb-2">
            <li>Warm-up & movement (5–10 min).</li>
            <li>Technical focus in 1–2 positions (15–25 min).</li>
            <li>Short, high-intensity live or situational goes (10–20 min).</li>
            <li>Cool down / mindset reset (5 min).</li>
          </ol>
          <p className="text-[11px] text-slate-500">
            Use the athlete&apos;s goals and mood trends to decide which positions
            and how much intensity you hit.
          </p>
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-3">
          <h2 className="text-sm font-semibold mb-2">Rough practice planner</h2>
          <textarea
            rows={10}
            className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
            placeholder={`Example:

Date: Tues before dual vs Central
Theme: Bottom from referee's + clearing ties

1) Warm-up (8 min): movement, stance & motion, light hand fighting
2) Technique (18 min):
   - Stand-up to clear claw
   - Sit-out to knee-slide vs tight waist
3) Situational (15 min):
   - :30 goes starting on bottom, down 1, rotate partners
4) Mindset (5 min):
   - Ask athletes: "What felt better on bottom today than last week?"`}
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>Future: auto-suggest plans based on goals & sessions.</span>
            <Link href="/ai-coach" className="text-amber-300">
              Ask AI to refine a plan →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PracticePlansPage;