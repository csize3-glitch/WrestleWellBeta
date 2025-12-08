"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";

type Profile = {
  name: string;
  gradYear: string;
  weightClass: string;
  style: string;
  school: string;
  cityState: string;
  email: string;
  gpa: string;
  testScores: string;
  majorInterest: string;
  record: string;
  accomplishments: string;
  goals: string;
  videoUrl: string;
  social: string;
};

const defaultProfile: Profile = {
  name: "",
  gradYear: "",
  weightClass: "",
  style: "Folkstyle / Freestyle / Greco",
  school: "",
  cityState: "",
  email: "",
  gpa: "",
  testScores: "",
  majorInterest: "",
  record: "",
  accomplishments: "",
  goals: "",
  videoUrl: "",
  social: ""
};

const RecruitingPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Later: send to backend. For now, just flag as saved.
    setSaved(true);
  }

  const displayName = profile.name || "Alex Martinez";
  const displayGrad = profile.gradYear || "2027";
  const displayWeight = profile.weightClass || "132 / 138";
  const displaySchool =
    profile.school || "Example High School · Anytown, USA";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-800 bg-slate-950/90">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-50">
            Wrestle<span className="text-amber-400">Well</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Recruiting • Athlete profile
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
          <Link href="/wrestleIQ" className="block">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-left text-slate-300 hover:bg-slate-800/70 transition">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>WrestleIQ Quiz</span>
            </button>
          </Link>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-300 hover:text-amber-300">
              ← Dashboard
            </Link>
            <h2 className="text-lg font-semibold tracking-tight">
              Recruiting Profile
            </h2>
          </div>
          <div className="text-xs text-slate-400">
            This is the card college coaches will see.
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            {/* Form column */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-7 md:py-7">
              <h3 className="text-lg font-semibold mb-1">
                Build your profile
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                Keep it honest and simple. We&apos;ll later help polish the
                wording with AI, but coaches care most about your effort,
                attitude, and consistency.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Full name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Alex Martinez"
                  />
                  <FormField
                    label="Grad year"
                    name="gradYear"
                    value={profile.gradYear}
                    onChange={handleChange}
                    placeholder="2027"
                  />
                  <FormField
                    label="Projected college weight class"
                    name="weightClass"
                    value={profile.weightClass}
                    onChange={handleChange}
                    placeholder="133 / 141"
                  />
                  <FormField
                    label="Primary styles"
                    name="style"
                    value={profile.style}
                    onChange={handleChange}
                    placeholder="Folkstyle, Freestyle, Greco"
                  />
                </div>

                {/* School / contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="High school / club"
                    name="school"
                    value={profile.school}
                    onChange={handleChange}
                    placeholder="Example HS / XYZ Wrestling Club"
                  />
                  <FormField
                    label="City & state"
                    name="cityState"
                    value={profile.cityState}
                    onChange={handleChange}
                    placeholder="Columbus, OH"
                  />
                  <FormField
                    label="Contact email (you / parent / coach)"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="recruiting@example.com"
                  />
                  <FormField
                    label="Social handle (optional)"
                    name="social"
                    value={profile.social}
                    onChange={handleChange}
                    placeholder="@alexwrestles"
                  />
                </div>

                {/* Academics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="GPA"
                    name="gpa"
                    value={profile.gpa}
                    onChange={handleChange}
                    placeholder="3.7 (unweighted)"
                  />
                  <FormField
                    label="Test scores (if taken)"
                    name="testScores"
                    value={profile.testScores}
                    onChange={handleChange}
                    placeholder="SAT 1320 / ACT 28"
                  />
                  <FormField
                    label="Academic interests / major"
                    name="majorInterest"
                    value={profile.majorInterest}
                    onChange={handleChange}
                    placeholder="Exercise science, education, business…"
                    className="sm:col-span-2"
                  />
                </div>

                {/* Wrestling summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Recent season record / results"
                    name="record"
                    value={profile.record}
                    onChange={handleChange}
                    placeholder="34–8, state qualifier, 2x district placer"
                    className="sm:col-span-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextareaField
                    label="Key accomplishments"
                    name="accomplishments"
                    value={profile.accomplishments}
                    onChange={handleChange}
                    placeholder="State placer, Fargo qualifier, team captain, etc."
                  />
                  <TextareaField
                    label="Goals & what you bring to a team"
                    name="goals"
                    value={profile.goals}
                    onChange={handleChange}
                    placeholder="Compete for conference titles, be coachable, lead by example…"
                  />
                </div>

                {/* Video */}
                <FormField
                  label="Highlight / match film link"
                  name="videoUrl"
                  value={profile.videoUrl}
                  onChange={handleChange}
                  placeholder="https://hudl.com/..."
                />

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                  >
                    Save profile (local)
                  </button>
                  {saved && (
                    <span className="text-xs text-emerald-300">
                      Saved for this browser session. Later we&apos;ll sync it to
                      your WrestleWell account with a shareable link.
                    </span>
                  )}
                </div>
              </form>
            </section>

            {/* Preview column */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm">
              <h3 className="text-lg font-semibold mb-3">
                Coach view preview
              </h3>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">{displayName}</p>
                    <p className="text-xs text-slate-400">
                      Class of {displayGrad} • {displayWeight}
                    </p>
                    <p className="text-xs text-slate-400">{displaySchool}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{profile.style || "Folkstyle / Freestyle / Greco"}</p>
                    {profile.cityState && <p>{profile.cityState}</p>}
                  </div>
                </div>

                {profile.record && (
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100 mb-0.5">
                      Recent results
                    </p>
                    <p>{profile.record}</p>
                  </div>
                )}

                {profile.accomplishments && (
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100 mb-0.5">
                      Key accomplishments
                    </p>
                    <p>{profile.accomplishments}</p>
                  </div>
                )}

                {profile.goals && (
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-slate-100 mb-0.5">
                      Goals & fit
                    </p>
                    <p>{profile.goals}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <InfoPill label="GPA" value={profile.gpa || "—"} />
                  <InfoPill
                    label="Test scores"
                    value={profile.testScores || "—"}
                  />
                  <InfoPill
                    label="Academic interest"
                    value={profile.majorInterest || "—"}
                    full
                  />
                </div>

                {profile.videoUrl && (
                  <div className="text-xs">
                    <p className="font-semibold text-slate-100 mb-0.5">
                      Video
                    </p>
                    <a
                      href={profile.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-300 hover:text-amber-200 break-all"
                    >
                      {profile.videoUrl}
                    </a>
                  </div>
                )}

                <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 mt-1 space-y-1">
                  {profile.email && (
                    <p>
                      Contact:{" "}
                      <span className="text-slate-100">{profile.email}</span>
                    </p>
                  )}
                  {profile.social && (
                    <p>
                      Social:{" "}
                      <span className="text-slate-100">{profile.social}</span>
                    </p>
                  )}
                  <p className="text-[11px]">
                    This preview is private. You choose what is public when you
                    share your link with coaches.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

type FormFieldProps = {
  label: string;
  name: keyof Profile;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  className = ""
}) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-400 mb-1">
      {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
    />
  </div>
);

type TextareaFieldProps = {
  label: string;
  name: keyof Profile;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
};

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 mb-1">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 resize-none"
    />
  </div>
);

type InfoPillProps = {
  label: string;
  value: string;
  full?: boolean;
};

const InfoPill: React.FC<InfoPillProps> = ({ label, value, full }) => (
  <div
    className={`rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2 ${
      full ? "sm:col-span-2" : ""
    }`}
  >
    <p className="text-[11px] uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="text-xs text-slate-100 mt-0.5">{value}</p>
  </div>
);

export default RecruitingPage;