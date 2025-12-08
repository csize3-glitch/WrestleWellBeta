// app/coach/tools/page.tsx
import React from "react";
import Link from "next/link";

const CoachToolsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <Link href="/coach">
            <button className="text-xs text-slate-300 hover:text-amber-300">
              ← Back to Coach / Parent View
            </button>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">
            Coach Tools
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Practical tools to plan, scout, and support your wrestlers.
        </p>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <section className="mb-2">
            <p className="text-sm text-slate-300">
              Use these tools alongside the athlete dashboard, goals, and
              mood check-ins to build smarter practices and healthier
              seasons—not just more grind.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Film Study */}
            <ToolCard
              title="Film Study & Video Breakdown"
              badge="Live"
              description="Save links to matches or practice goes, tag key positions, and jot time-stamped teaching points."
              href="/film"
              primaryLabel="Open Film Study"
            />

            {/* Practice Plans */}
            <ToolCard
              title="Practice Planner"
              badge="Coming soon"
              description="Build simple, focused practice plans from goals, mood, and upcoming competitions."
              href="#"
              disabled
              primaryLabel="Coming soon"
            />

            {/* Opponent Scouting */}
            <ToolCard
              title="Opponent Scouting"
              badge="Coming soon"
              description="Log opponent tendencies, strengths, and weaknesses so athletes have a simple game plan."
              href="#"
              disabled
              primaryLabel="Coming soon"
            />

            {/* Fuel & Recovery */}
            <ToolCard
              title="Fuel & Recovery Guides"
              badge="Coming soon"
              description="Safe, simple guidelines for dual nights and tournament days—focused on feeling good, not extreme cuts."
              href="#"
              disabled
              primaryLabel="Coming soon"
            />
          </section>
        </div>
      </main>
    </div>
  );
};

type ToolCardProps = {
  title: string;
  description: string;
  badge?: string;
  href: string;
  primaryLabel: string;
  disabled?: boolean;
};

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  badge,
  href,
  primaryLabel,
  disabled,
}) => {
  const content = (
    <div
      className={`h-full bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col justify-between transition hover:border-amber-300/70 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base md:text-lg font-semibold text-slate-50">
            {title}
          </h2>
          {badge && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border ${
                badge === "Live"
                  ? "border-emerald-300 text-emerald-300"
                  : "border-slate-500 text-slate-400"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
      <div className="mt-4">
        <button
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold ${
            disabled
              ? "bg-slate-800 text-slate-400"
              : "bg-amber-400 text-slate-950 hover:bg-amber-300"
          }`}
          type="button"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );

  if (disabled || href === "#") {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
};

export default CoachToolsPage;