"use client";

import React from "react";
import Link from "next/link";

const DrillsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6 md:px-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Drills & Skill Work
          </h1>
          <p className="text-xs text-slate-400">
            Build short, focused drill blocks you can run after practice.
          </p>
        </div>
        <Link href="/" className="text-xs text-slate-300 hover:text-amber-300">
          ← Back to dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-4 text-sm">
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5">
          <h2 className="text-sm font-semibold mb-2">How to use this page</h2>
          <p className="text-xs text-slate-300 mb-2">
            Start by picking one focus – bottom escapes, finishing single legs,
            hand fighting, etc. Keep it to 10–20 minutes max.
          </p>
          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
            <li>Choose 2–3 drills you can repeat a few times a week.</li>
            <li>Track which ones feel like they actually help in live.</li>
            <li>Ask your coach if they&apos;d tweak or add anything.</li>
          </ul>
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-3">
          <h2 className="text-sm font-semibold mb-2">
            Saved drill ideas (manual for now)
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            For now you can keep notes here or in your own notebook. Later this
            can hook into WrestleWell Coach for drill plans.
          </p>
          <textarea
            rows={10}
            className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
            placeholder={`Example:
- 3 x :30 bottom stand-up vs pressure
- 3 x :30 seatbelt wizard defense from bad shots
- 3 x :30 club + inside tie to single-leg setup`}
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>Later: save structured drills & link to goals.</span>
            <Link href="/ai-coach" className="text-amber-300">
              Ask AI for drill ideas →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DrillsPage;