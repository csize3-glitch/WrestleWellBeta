"use client";

import React from "react";
import Link from "next/link";

const FuelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6 md:px-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Fuel & Recovery Guide
          </h1>
          <p className="text-xs text-slate-400">
            Simple ideas for eating, hydrating, and recovering like a wrestler.
          </p>
        </div>
        <Link href="/" className="text-xs text-slate-300 hover:text-amber-300">
          ← Back to dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-4 text-sm">
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-2">
          <h2 className="text-sm font-semibold mb-1">Important note</h2>
          <p className="text-xs text-slate-300">
            WrestleWell can give general ideas about fuel and recovery, but it
            isn&apos;t medical advice or nutrition counseling. If you&apos;re making big
            changes to weight or diet, talk to a doctor, dietitian, or another
            qualified professional.
          </p>
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-3">
          <h2 className="text-sm font-semibold mb-2">Dual / practice days</h2>
          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
            <li>Focus on steady hydration through the day, not just at night.</li>
            <li>Smaller, more frequent snacks instead of giant meals.</li>
            <li>Lean protein + carbs after practice to start recovery.</li>
          </ul>
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-3">
          <h2 className="text-sm font-semibold mb-2">
            Tournament day ideas (general)
          </h2>
          <p className="text-xs text-slate-300">
            Everyone is different. These are starting points to talk through with
            a coach, parent, or professional:
          </p>
          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
            <li>Easy-to-digest carbs between matches (fruit, crackers, etc.).</li>
            <li>Slow, steady sips of water or sports drink – not chugging.</li>
            <li>Light meals that don’t sit heavy between rounds.</li>
          </ul>
        </section>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 space-y-3">
          <h2 className="text-sm font-semibold mb-2">Recovery checklist</h2>
          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
            <li>Re-hydrate gradually over the rest of the day.</li>
            <li>Get a good meal within a couple of hours after competition.</li>
            <li>Light movement or stretching the next day instead of zero motion.</li>
            <li>Prioritize sleep – it&apos;s free recovery.</li>
          </ul>
          <div className="flex justify-end text-[11px] text-slate-500">
            <Link href="/ai-coach" className="text-amber-300">
              Ask AI about your week&apos;s schedule →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FuelPage;