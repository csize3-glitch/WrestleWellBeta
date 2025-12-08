"use client";

import React from "react";
import Link from "next/link";

const ScoutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6 md:px-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Opponent Scouting
          </h1>
          <p className="text-xs text-slate-400">
            Turn film and notes into a simple, wrestler-friendly game plan.
          </p>
        </div>
        <Link href="/" className="text-xs text-slate-300 hover:text-amber-300">
          ← Back to dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-4 text-sm">
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-3">
          <h2 className="text-sm font-semibold mb-2">What to look for</h2>
          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
            <li>Common ties / setups (collar tie, inside tie, elbow control).</li>
            <li>Favorite attacks and finishes.</li>
            <li>How they react when they get tired or behind.</li>
            <li>Top / bottom strengths and weaknesses.</li>
          </ul>
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-3">
          <h2 className="text-sm font-semibold mb-2">Scout template</h2>
          <textarea
            rows={12}
            className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
            placeholder={`Opponent name / team:
Weight:

Neutral:
- Their favorite ties:
- Their best attacks:
- Openings I see for me:

Top:
- What breaks riders:
- What they look for on top:
- My main plan from bottom:

Bottom:
- How they get out:
- Are they risky or safe?:

Game plan:
- 1–2 simple cues for me:
- What I’ll do if I get tired or behind:`}
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <Link href="/film/athlete" className="text-slate-300 hover:text-amber-300">
              Jump to Film Study →
            </Link>
            <Link href="/ai-coach" className="text-amber-300">
              Ask AI to simplify this plan →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ScoutPage;