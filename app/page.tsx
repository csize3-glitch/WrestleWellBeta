"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Role = "athlete" | "coach" | "parent" | "ref";

type StoredUser = {
  name?: string;
  email?: string;
  role?: Role;
  gradYear?: string | number | null;
  profileImage?: string | null; // base64 data URL from auth page
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
};

type GoalHighlight = {
  title: string;
  timeframeLabel: string;
  focusLabel: string;
};

const GOALS_KEY = "wrestlewell_goals_v1";

const DashboardPage: React.FC = () => {
  const [athleteName, setAthleteName] = useState("Athlete");
  const [classYear, setClassYear] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [goalHighlight, setGoalHighlight] = useState<GoalHighlight | null>(
    null
  );
  const [role, setRole] = useState<Role | undefined>(undefined);

  // Load basic user info from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("wrestlewell_user");
      if (raw) {
        const data: StoredUser = JSON.parse(raw);
        if (data.name) setAthleteName(data.name);
        if (data.gradYear) setClassYear(Number(data.gradYear));
        if (data.profileImage) setProfileImage(data.profileImage);
        if (data.role) setRole(data.role);
      }
    } catch (err) {
      console.error("Failed to parse wrestlewell_user from localStorage", err);
    }
  }, []);

  // Load a “Goal of the Week” from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(GOALS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const goals: StoredGoal[] = parsed;
      const active = goals.filter((g) => (g.status ?? "active") === "active");

      if (!active.length) return;

      // Simple pick: first active goal
      const g = active[0];
      const timeframeText =
        g.timeframe === "this_week"
          ? "This week"
          : g.timeframe === "this_month"
          ? "This month"
          : g.timeframe === "season"
          ? "This season"
          : "This season";

      const focusMap: Record<GoalFocus, string> = {
        mat: "On the mat",
        lift: "Lifting / strength",
        mental: "Mindset",
        school: "School",
        life: "Life / habits",
      };

      const focusLabel = g.focus ? focusMap[g.focus] : "On the mat";

      setGoalHighlight({
        title: g.title,
        timeframeLabel: timeframeText,
        focusLabel,
      });
    } catch (err) {
      console.error("Failed to load goals for dashboard", err);
    }
  }, []);

  const recruitingSlug = athleteName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const safeYear = classYear ?? 2027;

  const recruitingUrl = `https://wrestlewell.app/r/${safeYear}/${
    recruitingSlug || "wrestler"
  }`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-800 bg-slate-950/90">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-50">
            Wrestle<span className="text-amber-400">Well</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Powered by{" "}
            <span className="text-teal-300 font-semibold">WrestleIQ</span>{" "}
            quizzes
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavItem label="Dashboard" active />
          <Link href="/training">
            <NavItem label="Training" />
          </Link>
          <Link href="/ai-coach">
            <NavItem label="AI Coach" />
          </Link>
          <Link href="/wrestleIQ">
            <NavItem label="WrestleIQ" />
          </Link>
          <Link href="/drills">
            <NavItem label="Drills & Skills" />
          </Link>
          <Link href="/film/athlete">
            <NavItem label="Film Study" />
          </Link>
          <Link href="/scout">
            <NavItem label="Opponent Scouting" />
          </Link>
          <Link href="/fuel">
            <NavItem label="Fuel & Recovery" />
          </Link>
          <Link href="/recruiting">
            <NavItem label="Recruiting" />
          </Link>
          <Link href="/goals">
            <NavItem label="Goals & Inspiration" />
          </Link>
          <Link href="/coach">
            <NavItem label="Coach / Parent View" />
          </Link>
          <Link href="/auth">
            <NavItem label="Profile & Settings" />
          </Link>

          {/* Coach-only tool */}
          {role === "coach" && (
            <Link href="/practice-plans">
              <NavItem label="Practice Plans (Coach)" />
            </Link>
          )}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
          <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="h-2 w-2 rounded-full bg-teal-300 animate-pulse" />
              <span>WrestleIQ streak: 4 days</span>
            </div>
            <Link href="/auth">
              <button className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-800 text-sm font-semibold overflow-hidden border border-slate-700">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImage}
                    alt={athleteName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  athleteName.charAt(0).toUpperCase()
                )}
              </button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Row 1: Greeting */}
            <GreetingCard name={athleteName} />

            {/* Row 2: Week summary + AI coach */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WeekSummaryCard />
              </div>
              <div className="lg:col-span-1">
                <AiCoachTeaserCard />
              </div>
            </div>

            {/* Row 3: WrestleIQ + Recruiting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WrestleIqCard />
              <RecruitingCard
                recruitingUrl={recruitingUrl}
                hasProfile={false}
              />
            </div>

            {/* Row 4: Coach / Parent view + Goals teaser */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CoachParentCard />
              <GoalsTeaserCard goal={goalHighlight} />
            </div>

            {/* Row 5: Tools – Drills, Scouting, Fuel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DrillsCard />
              <OpponentScoutCard />
              <FuelRecoveryCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

type NavItemProps = { label: string; active?: boolean };

const NavItem: React.FC<NavItemProps> = ({ label, active }) => (
  <button
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-left transition 
      ${
        active
          ? "bg-slate-800 text-amber-300 font-semibold"
          : "text-slate-300 hover:bg-slate-800/70"
      }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
    <span>{label}</span>
  </button>
);

type GreetingCardProps = { name: string };

const GreetingCard: React.FC<GreetingCardProps> = ({ name }) => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
        Good evening, {name} 👋
      </h3>
      <p className="mt-1 text-sm text-slate-300">
        Here’s what’s on your mat today.
      </p>
    </div>
    <div className="flex flex-wrap gap-3">
      <Link href="/training">
        <PrimaryButton>Log Practice</PrimaryButton>
      </Link>
      <Link href="/training">
        <SecondaryButton>Log Match</SecondaryButton>
      </Link>
      <Link href="/training">
        <SecondaryButton>Log Lift</SecondaryButton>
      </Link>
      <Link href="/check-in">
        <GhostButton>Check In</GhostButton>
      </Link>
    </div>
  </section>
);

const WeekSummaryCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">This Week</h3>
      <div className="flex gap-2">
        <Chip label="Folkstyle" />
        <Chip label="Freestyle" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
      <StatPill label="Sessions" value="4" />
      <StatPill label="Mat Time" value="3h 10m" />
      <StatPill label="Lift Sessions" value="2" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div>
        <p className="mb-1 text-slate-300">Training Volume</p>
        <div className="flex items-end gap-1 h-16">
          {[40, 60, 80, 30, 50, 70, 20].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="flex-1 bg-slate-800 rounded-t-md"
            />
          ))}
        </div>
        <p className="mt-2 text-slate-400">Most consistent: Wed &amp; Thu.</p>
      </div>

      <div>
        <p className="mb-1 text-slate-300">Mood &amp; Energy</p>
        <div className="h-16 bg-slate-950/40 rounded-md border border-slate-800 flex items-center justify-center text-slate-500 text-[11px]">
          Mood dipped before Friday dual, bounce-back Saturday.
        </div>
        <p className="mt-2 text-slate-400">
          Watch stress on heavy dual days.
        </p>
      </div>
    </div>

    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        This week’s focus
      </p>
      <p className="text-sm text-slate-200">
        You’ve been solid on the mat but only lifted once. This week, aim for{" "}
        <span className="text-amber-300 font-medium">2 short lift sessions</span>{" "}
        and drill{" "}
        <span className="text-amber-300 font-medium">bottom escapes</span> in at
        least one practice.
      </p>
    </div>

    {/* Training + Film buttons */}
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href="/training">
        <SecondaryButton>Open Training Log</SecondaryButton>
      </Link>
      <Link href="/film/athlete">
        <GhostButton>Open My Film Study</GhostButton>
      </Link>
    </div>
  </section>
);

const AiCoachTeaserCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col h-full">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold">WrestleWell Coach</h3>
      <span className="text-[11px] px-2 py-0.5 rounded-full border border-teal-300 text-teal-300">
        AI Coach
      </span>
    </div>
    <p className="text-sm text-slate-300 mb-3">
      Ask about drills, lifting, mindset, or recruiting.
    </p>

    <div className="flex flex-col gap-2 mb-4">
      <GhostChip>“I get ridden out on bottom.”</GhostChip>
      <GhostChip>“I only have 30 minutes to lift.”</GhostChip>
      <GhostChip>“I’m nervous before matches.”</GhostChip>
    </div>

    <div className="mt-auto">
      <Link href="/ai-coach">
        <PrimaryButton className="w-full">Ask a Question</PrimaryButton>
      </Link>
    </div>
  </section>
);

const WrestleIqCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold">
        WrestleIQ{" "}
        <span className="text-teal-300 text-sm font-normal">– Your Mat IQ</span>
      </h3>
      <span className="text-[11px] px-2 py-0.5 rounded-full border border-teal-300 text-teal-300">
        Streak: 4 days
      </span>
    </div>

    <div className="flex gap-4 text-xs text-slate-300 mb-3">
      <span>
        Level: <span className="font-semibold text-slate-50">Intermediate</span>
      </span>
      <span>
        XP: <span className="font-semibold text-slate-50">1,240</span>
      </span>
    </div>

    <div className="mb-4">
      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
        <span>Next level in 260 XP</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full w-[70%] bg-gradient-to-r from-teal-300 to-amber-300" />
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-2 mb-4 text-sm">
      <CategoryCard
        title="Positions"
        description="Neutral, top, bottom, par terre"
      />
      <CategoryCard
        title="Rules & Situations"
        description="Clock, score, stalling, near-fall"
      />
    </div>

    <Link href="/wrestleIQ">
      <PrimaryButton>Take a Quiz</PrimaryButton>
    </Link>
  </section>
);

type RecruitingCardProps = {
  recruitingUrl: string;
  hasProfile: boolean;
};

const RecruitingCard: React.FC<RecruitingCardProps> = ({
  recruitingUrl,
  hasProfile,
}) => {
  if (!hasProfile) {
    return (
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
        <h3 className="text-lg font-semibold mb-2">
          Want to wrestle in college?
        </h3>
        <p className="text-sm text-slate-300 mb-3">
          Turn your matches, training, and highlights into a clean profile you
          can share with college coaches.
        </p>
        <ul className="text-sm text-slate-300 mb-4 list-disc list-inside space-y-1">
          <li>Show your story over multiple seasons.</li>
          <li>AI-polished bio you control.</li>
          <li>One simple link to share.</li>
        </ul>
        <Link href="/recruiting">
          <PrimaryButton>Build My Recruiting Profile</PrimaryButton>
        </Link>
        <p className="mt-2 text-[11px] text-slate-500">
          You choose what’s public. Mental health and detailed weight logs are
          always private.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
      <h3 className="text-lg font-semibold mb-2">Your Recruiting Profile</h3>
      <p className="text-sm text-slate-300 mb-3">
        Share this link with college coaches:
      </p>
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs bg-slate-950/60 border border-slate-800 rounded-full px-3 py-1.5">
          <span className="truncate">{recruitingUrl}</span>
          <button className="text-amber-300 text-[11px] font-semibold">
            Copy
          </button>
        </div>
        <div className="flex gap-2 text-sm">
          <SecondaryButton>Preview Profile</SecondaryButton>
          <GhostButton>Edit Profile</GhostButton>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Profile views this week: <span className="font-semibold">5</span> · Last
        updated: <span className="font-semibold">3 days ago</span>
      </p>
    </section>
  );
};

// Coach / Parent card
const CoachParentCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6">
    <h3 className="text-lg font-semibold mb-2">Coach / Parent View</h3>
    <p className="text-sm text-slate-300 mb-3">
      Give your coach or parent a simple, respectful overview of your training,
      wellness check-ins, WrestleIQ progress, and recruiting status.
    </p>
    <ul className="text-sm text-slate-300 mb-4 list-disc list-inside space-y-1">
      <li>See patterns in training and energy over time.</li>
      <li>Spot stress or burnout early and talk about it.</li>
      <li>Align on goals without obsessing over the scale.</li>
    </ul>
    <Link href="/coach">
      <PrimaryButton>Open Coach / Parent View</PrimaryButton>
    </Link>
    <p className="mt-2 text-[11px] text-slate-500">
      You choose which adults can see this view in the full version of
      WrestleWell. Private details like detailed weight history and journal
      entries are always opt-in.
    </p>
  </section>
);

// NEW: Goals teaser card
const GoalsTeaserCard: React.FC<{ goal: GoalHighlight | null }> = ({
  goal,
}) => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col">
    <h3 className="text-lg font-semibold mb-1">Goal of the Week</h3>
    <p className="text-xs text-slate-400 mb-3">
      Pulled from your Goals page on this device.
    </p>

    {goal ? (
      <>
        <p className="text-sm text-slate-50 font-semibold mb-1">
          {goal.title}
        </p>
        <p className="text-xs text-slate-400 mb-3">
          {goal.timeframeLabel} · {goal.focusLabel}
        </p>
        <p className="text-xs text-slate-300 mb-4">
          Use this as your anchor for the week. Tell your coach, write it down,
          and line up your training and habits around it.
        </p>
      </>
    ) : (
      <p className="text-sm text-slate-300 mb-4">
        No active goals yet. Add one small goal—like a bottom escape focus or a
        lifting habit—from the Goals page.
      </p>
    )}

    <div className="mt-auto flex justify-between items-center gap-3 text-xs">
      <p className="text-slate-400">
        Want to update this?{" "}
        <span className="text-slate-200">Edit your goals.</span>
      </p>
      <Link href="/goals">
        <SecondaryButton>Open Goals</SecondaryButton>
      </Link>
    </div>
  </section>
);

/** NEW: Drills card (athlete-facing) */
const DrillsCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-4 md:px-5 md:py-5 flex flex-col">
    <h3 className="text-sm font-semibold mb-1">Drills & Skill Work</h3>
    <p className="text-xs text-slate-300 mb-3">
      Build a small menu of go-to drills for neutral, top, and bottom. Keep it
      simple and repeatable.
    </p>
    <ul className="text-[11px] text-slate-300 space-y-1 mb-3 list-disc list-inside">
      <li>10–15 minute drill plans you can run after practice.</li>
      <li>Position-specific reps (bottom escapes, hand-fighting, finishes).</li>
      <li>Ideas you can ask your real coach about or tweak.</li>
    </ul>
    <div className="mt-auto flex gap-2">
      <Link href="/drills">
        <PrimaryButton className="text-xs px-3 py-1.5">
          Open Drills
        </PrimaryButton>
      </Link>
      <Link href="/ai-coach">
        <GhostButton className="text-xs px-3 py-1.5">
          Ask AI for drills
        </GhostButton>
      </Link>
    </div>
  </section>
);

/** NEW: Opponent scouting card (both) */
const OpponentScoutCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-4 md:px-5 md:py-5 flex flex-col">
    <h3 className="text-sm font-semibold mb-1">Opponent Scouting</h3>
    <p className="text-xs text-slate-300 mb-3">
      Organize what you notice from film: ties, setups, favorite finishes, and
      how they react under pressure.
    </p>
    <ul className="text-[11px] text-slate-300 space-y-1 mb-3 list-disc list-inside">
      <li>Track tendencies instead of obsessing over records.</li>
      <li>Note what scores on them – and what they score with.</li>
      <li>Turn film into a simple, calm game plan.</li>
    </ul>
    <div className="mt-auto flex gap-2">
      <Link href="/scout">
        <PrimaryButton className="text-xs px-3 py-1.5">
          Open Scouting
        </PrimaryButton>
      </Link>
      <Link href="/film/athlete">
        <GhostButton className="text-xs px-3 py-1.5">
          Link to Film
        </GhostButton>
      </Link>
    </div>
  </section>
);

/** NEW: Fuel & recovery card (both) */
const FuelRecoveryCard: React.FC = () => (
  <section className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-4 md:px-5 md:py-5 flex flex-col">
    <h3 className="text-sm font-semibold mb-1">Fuel & Recovery Guide</h3>
    <p className="text-xs text-slate-300 mb-3">
      Simple, wrestler-friendly ideas for eating, hydrating, and recovering
      through a dual or tournament weekend.
    </p>
    <ul className="text-[11px] text-slate-300 space-y-1 mb-3 list-disc list-inside">
      <li>Pre-match and between-match snack ideas.</li>
      <li>Hydration reminders that respect weight class goals.</li>
      <li>Sleep, stretching, and “day after” recovery suggestions.</li>
    </ul>
    <div className="mt-auto flex gap-2">
      <Link href="/fuel">
        <PrimaryButton className="text-xs px-3 py-1.5">
          Open Guide
        </PrimaryButton>
      </Link>
      <Link href="/ai-coach">
        <GhostButton className="text-xs px-3 py-1.5">
          Ask AI about fuel
        </GhostButton>
      </Link>
    </div>
  </section>
);

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

const SecondaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
    border border-amber-400 text-amber-300 hover:bg-amber-400/10 transition ${className}`}
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

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-200">
    {label}
  </span>
);

const StatPill: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800 flex flex-col">
    <span className="text-[11px] uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="text-sm font-semibold mt-1">{value}</span>
  </div>
);

const GhostChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button className="w-full text-left text-xs text-slate-200 bg-slate-950/60 border border-slate-800 rounded-full px-3 py-1.5 hover:bg-slate-800/80 transition">
    {children}
  </button>
);

const CategoryCard: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <button className="flex-1 text-left bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-3 hover:border-teal-300 hover:bg-slate-900 transition">
    <p className="text-sm font-semibold mb-1">{title}</p>
    <p className="text-xs text-slate-300">{description}</p>
  </button>
);

export default DashboardPage;