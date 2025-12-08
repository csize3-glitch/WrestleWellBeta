"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type AIQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type WrestleIQProgress = {
  xp: number;
  totalAnswered: number;
  totalCorrect: number;
};

const PROGRESS_KEY = "wrestlewell_wrestleIQ_progress_v2";

function loadProgress(): WrestleIQProgress {
  if (typeof window === "undefined") {
    return { xp: 0, totalAnswered: 0, totalCorrect: 0 };
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { xp: 0, totalAnswered: 0, totalCorrect: 0 };
    const p = JSON.parse(raw);
    return {
      xp: p.xp ?? 0,
      totalAnswered: p.totalAnswered ?? 0,
      totalCorrect: p.totalCorrect ?? 0,
    };
  } catch {
    return { xp: 0, totalAnswered: 0, totalCorrect: 0 };
  }
}

function saveProgress(p: WrestleIQProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function xpToLevel(xp: number): { level: string; progress: number } {
  if (xp < 200) return { level: "Beginner", progress: xp / 200 };
  if (xp < 600) return { level: "Intermediate", progress: (xp - 200) / 400 };
  return { level: "Advanced", progress: Math.min((xp - 600) / 600, 1) };
}

const WrestleIQPage: React.FC = () => {
  const [topic, setTopic] = useState("folkstyle bottom");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scoreRun, setScoreRun] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedOfflineFallback, setUsedOfflineFallback] = useState(false);
  const [progress, setProgress] = useState<WrestleIQProgress>({
    xp: 0,
    totalAnswered: 0,
    totalCorrect: 0,
  });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const { level, progress: levelProgress } = xpToLevel(progress.xp);
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length || 1;
  const quizProgress = questions.length
    ? (currentIndex + (isAnswered ? 1 : 0)) / questions.length
    : 0;

  async function handleGenerateQuiz() {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScoreRun(0);

    try {
      const res = await fetch("/api/wrestleIQ-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const qs: AIQuestion[] = data.questions ?? [];
      if (!qs.length) {
        throw new Error("No questions returned");
      }

      setQuestions(qs);
      setCurrentIndex(0);
      setSelectedIdx(null);
      setIsAnswered(false);
      setScoreRun(0);
      setUsedOfflineFallback(Boolean(data.offline));
    } catch (err: any) {
      console.error("WrestleIQ generate error:", err);
      setError(
        "Couldn’t reach the WrestleIQ brain right now. Try again after restarting Ollama or check your local model."
      );
      setUsedOfflineFallback(true);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(idx: number) {
    if (!currentQuestion || isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuestion.correctIndex;

    const updated: WrestleIQProgress = {
      xp: progress.xp + (isCorrect ? 20 : 5),
      totalAnswered: progress.totalAnswered + 1,
      totalCorrect: progress.totalCorrect + (isCorrect ? 1 : 0),
    };
    setProgress(updated);
    saveProgress(updated);

    if (isCorrect) {
      setScoreRun((s) => s + 1);
    }
  }

  function handleNext() {
    if (!isAnswered || !questions.length) return;
    if (currentIndex === questions.length - 1) {
      // restart run
      setCurrentIndex(0);
      setSelectedIdx(null);
      setIsAnswered(false);
      setScoreRun(0);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIdx(null);
    setIsAnswered(false);
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
            WrestleIQ • AI-powered mat IQ quizzes
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <Link href="/" className="block">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-left text-slate-300 hover:bg-slate-800/70 transition">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          </Link>
          <Link href="/ai-coach" className="block">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-left text-slate-300 hover:bg-slate-800/70 transition">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>Ask WrestleWell Coach</span>
            </button>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-slate-300 hover:text-amber-300"
            >
              ← Dashboard
            </Link>
            <h2 className="text-lg font-semibold tracking-tight">
              WrestleIQ Quizzes
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <div className="text-slate-300">
                Level:{" "}
                <span className="font-semibold text-slate-50">{level}</span>
              </div>
              <div className="text-slate-400">
                XP: <span className="font-semibold">{progress.xp}</span>
              </div>
            </div>
            <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-300 to-amber-300"
                style={{ width: `${Math.min(levelProgress * 100, 100)}%` }}
              />
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Left: Quiz */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 flex flex-col">
              {/* Controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Build your quiz</h3>
                  <p className="text-xs text-slate-400">
                    Pick a focus and difficulty. WrestleIQ will generate scenarios
                    for you.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-slate-950/60 border border-slate-700 rounded-full px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  >
                    <option value="folkstyle bottom escapes">
                      Folkstyle – Bottom escapes
                    </option>
                    <option value="folkstyle neutral ties and setups">
                      Folkstyle – Neutral ties
                    </option>
                    <option value="folkstyle rules and scoring">
                      Folkstyle – Rules & scoring
                    </option>
                    <option value="freestyle mat IQ and exposure">
                      Freestyle – Exposure & mat IQ
                    </option>
                    <option value="greco upper body positions and throws">
                      Greco – Upper body positions
                    </option>
                  </select>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-slate-950/60 border border-slate-700 rounded-full px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition disabled:opacity-50"
                  >
                    {loading ? "Building quiz…" : "Generate quiz"}
                  </button>
                </div>
              </div>

              {/* Progress */}
              {questions.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span>
                      This run correct:{" "}
                      <span className="text-amber-300 font-semibold">
                        {scoreRun}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-300 to-amber-300"
                      style={{ width: `${Math.min(quizProgress * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Question area */}
              {error && (
                <div className="mb-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/40 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              {questions.length === 0 && !loading && !error && (
                <div className="flex-1 flex items-center justify-center text-center text-sm text-slate-300">
                  <p>
                    Pick a topic and difficulty, then tap{" "}
                    <span className="font-semibold text-amber-300">
                      Generate quiz
                    </span>{" "}
                    to get fresh WrestleIQ questions.
                  </p>
                </div>
              )}

              {questions.length > 0 && currentQuestion && (
                <>
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">
                      Topic: {topic} · {difficulty}
                    </p>
                    <h4 className="text-base md:text-lg font-semibold">
                      {currentQuestion.question}
                    </h4>
                  </div>

                  <div className="space-y-2 mb-4">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedIdx === idx;
                      const isCorrect = idx === currentQuestion.correctIndex;
                      const showCorrect = isAnswered && isCorrect;
                      const showWrong = isAnswered && isSelected && !isCorrect;

                      let className =
                        "w-full text-left text-sm rounded-xl border px-3 py-2 transition ";

                      if (!isAnswered) {
                        className +=
                          "border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-800/70";
                      } else if (showCorrect) {
                        className +=
                          "border-emerald-400 bg-emerald-500/10 text-emerald-200";
                      } else if (showWrong) {
                        className +=
                          "border-rose-400 bg-rose-500/10 text-rose-200";
                      } else {
                        className +=
                          "border-slate-800 bg-slate-900 text-slate-300";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleAnswer(idx)}
                          className={className}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="mb-4 text-xs text-slate-300 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2">
                      <p className="font-semibold mb-1">Coach’s explanation:</p>
                      <p>{currentQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="mt-auto flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!isAnswered}
                      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition disabled:opacity-40"
                    >
                      {currentIndex === totalQuestions - 1
                        ? "Restart this quiz"
                        : "Next question"}
                    </button>
                  </div>
                </>
              )}

              {usedOfflineFallback && (
                <p className="mt-3 text-[11px] text-slate-500">
                  These questions may be from the offline fallback if the local
                  model wasn’t reachable.
                </p>
              )}
            </section>

            {/* Right: Stats / notes */}
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Your WrestleIQ trends
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Stored only on this device for now.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
                    <p className="text-slate-400 text-[11px]">Total questions</p>
                    <p className="text-sm font-semibold text-slate-50">
                      {progress.totalAnswered}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
                    <p className="text-slate-400 text-[11px]">Total correct</p>
                    <p className="text-sm font-semibold text-slate-50">
                      {progress.totalCorrect}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-slate-200">
                  How to use WrestleIQ:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hit 1–2 short quizzes a few times a week.</li>
                  <li>Pay attention to which topics you miss (bottom, rules, etc.).</li>
                  <li>Bring those spots to practice and ask for extra reps.</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WrestleIQPage;