"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "@/lib/content/types";
import { useProgress } from "@/lib/store/progress";
import { saveAttempt } from "@/lib/db";
import { formatSig } from "@/lib/physics/stats";

type Filter = "all" | "mcq" | "numerical" | "written" | "viva";
type Mode = "practice" | "timed" | "viva" | "review";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mcq", label: "Multiple choice" },
  { id: "numerical", label: "Numerical" },
  { id: "written", label: "Written" },
  { id: "viva", label: "Viva" }
];

const MODES: { id: Mode; label: string }[] = [
  { id: "practice", label: "Practice" },
  { id: "timed", label: "Timed" },
  { id: "viva", label: "Viva" },
  { id: "review", label: "Study" }
];

function typeGroup(q: Question): Filter {
  if (q.type === "mcq") return "mcq";
  if (q.type === "numerical") return "numerical";
  if (q.type === "viva") return "viva";
  return "written";
}

const DIFFICULTY = { 1: "Foundational", 2: "Intermediate", 3: "Advanced" } as const;

function scoreOf(pool: Question[], isCorrect: (q: Question) => boolean, selfGrade: Record<string, boolean | null>): number {
  return pool.filter((q) => (q.type === "mcq" || q.type === "numerical" ? isCorrect(q) : selfGrade[q.id] === true)).length;
}

function userAnswerText(q: Question, answers: Record<string, string>): string {
  const raw = answers[q.id] ?? "";
  if (q.type === "mcq" && q.options) {
    const i = Number(raw);
    return Number.isInteger(i) && q.options[i] !== undefined
      ? `${String.fromCharCode(65 + i)}. ${q.options[i]}`
      : "No answer selected";
  }
  if (q.type === "numerical") {
    return raw === "" ? "No answer entered" : `${raw}${q.numeric?.unit ? ` ${q.numeric.unit}` : ""}`;
  }
  return raw.trim() === "" ? "No written answer" : raw;
}

function modelAnswerText(q: Question): string {
  if (q.type === "mcq" && q.options && q.answerIndex !== undefined) {
    return `${String.fromCharCode(65 + q.answerIndex)}. ${q.options[q.answerIndex] ?? ""}`;
  }
  if (q.type === "numerical" && q.numeric) {
    return `${formatSig(q.numeric.value)}${q.numeric.unit ? ` ${q.numeric.unit}` : ""} (±${q.numeric.tolerance})`;
  }
  return q.answer;
}

export function QuizRunner({
  questions,
  slug,
  title = "Question bank",
  timedMinutes = 15,
  initialMode = "practice"
}: {
  questions: Question[];
  slug: string;
  title?: string;
  timedMinutes?: number;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [selfGrade, setSelfGrade] = useState<Record<string, boolean | null>>({});
  const [showModel, setShowModel] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(timedMinutes * 60);
  const [revealedAll, setRevealedAll] = useState(false);
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const savedRef = useRef(false);

  const pool = useMemo(() => {
    if (mode === "viva") return questions.filter((q) => q.type === "viva" || q.type === "short");
    if (filter === "all") return questions;
    return questions.filter((q) => typeGroup(q) === filter);
  }, [questions, filter, mode]);

  const current = pool[Math.min(index, Math.max(0, pool.length - 1))];

  useEffect(() => {
    setIndex(0);
    setFinished(false);
    savedRef.current = false;
  }, [mode, filter]);

  useEffect(() => {
    if (!startedAt && mode === "timed") {
      setStartedAt(new Date().toISOString());
    }
  }, [mode, startedAt]);

  useEffect(() => {
    if (!startedAt) return;
    if (mode !== "timed" || finished) return;
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(t);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [startedAt, mode, finished]);

  function isCorrect(q: Question): boolean {
    if (q.type === "mcq") {
      const idx = Number(answers[q.id]);
      return Number.isInteger(idx) && idx === q.answerIndex;
    }
    if (q.type === "numerical") {
      const value = Number(answers[q.id]);
      if (!Number.isFinite(value) || !q.numeric) return false;
      return Math.abs(value - q.numeric.value) <= Math.max(q.numeric.tolerance, 1e-9);
    }
    return Boolean(selfGrade[q.id]);
  }

  function submit(q: Question) {
    setSubmitted((s) => ({ ...s, [q.id]: true }));
    setSelfGrade((g) => ({ ...g, [q.id]: isCorrect(q) }));
    if (mode === "practice") setShowModel((s) => ({ ...s, [q.id]: true }));
  }

  function finish() {
    if (savedRef.current) {
      setFinished(true);
      return;
    }
    savedRef.current = true;
    const correct = scoreOf(pool, isCorrect, selfGrade);
    const now = new Date().toISOString();
    recordQuiz(slug, correct, pool.length);
    void saveAttempt({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      experiment: slug,
      startedAt: startedAt ?? now,
      finishedAt: now,
      total: pool.length,
      correct,
      answers,
      mode: mode === "timed" ? "timed" : mode === "viva" ? "viva" : "practice"
    });
    setRevealedAll(true);
    setFinished(true);
  }

  function reset() {
    setFinished(false);
    setRevealedAll(false);
    setAnswers({});
    setSubmitted({});
    setSelfGrade({});
    setShowModel({});
    setIndex(0);
    setStartedAt(null);
    setRemaining(timedMinutes * 60);
    savedRef.current = false;
  }

  if (pool.length === 0) {
    return (
      <div className="border border-line bg-paper-2 p-8 text-center">
        <p className="text-[0.8rem] text-ink">No questions in this category yet.</p>
        <p className="mt-1 text-[0.72rem] text-muted">Choose another category.</p>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Study mode: all model answers visible, no scoring                   */
  /* ------------------------------------------------------------------ */
  if (mode === "review") {
    return (
      <div className="border border-line bg-paper-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-3/40 px-4 py-2.5">
          <div>
            <p className="label">{title} · study mode</p>
            <p className="text-[0.65rem] text-muted">Model answers and reasoning visible · nothing is scored</p>
          </div>
          <div className="seg" role="group" aria-label="Quiz mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => {
                  setMode(m.id);
                  reset();
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 no-scrollbar" role="group" aria-label="Question category">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? questions.length : questions.filter((q) => typeGroup(q) === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] transition-colors ${
                  filter === f.id ? "bg-ink text-paper-2" : "text-muted hover:bg-paper-3 hover:text-ink"
                }`}
              >
                {f.label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <ol className="divide-y divide-line">
          {pool.map((q, i) => (
            <li key={q.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.6rem] text-vermilion">{String(i + 1).padStart(2, "0")}</span>
                <span className="label !text-[0.55rem]">{q.topic}</span>
                <span className="label !text-[0.55rem]">· {q.type}</span>
                <span className="label !text-[0.55rem]">· {DIFFICULTY[q.difficulty]}</span>
              </div>
              <p className="max-w-3xl text-[0.85rem] leading-relaxed text-ink">{q.prompt}</p>
              {q.type === "mcq" && q.options ? (
                <ul className="mt-2 space-y-1">
                  {q.options.map((opt, oi) => (
                    <li
                      key={oi}
                      className={`px-2 py-1 text-[0.76rem] ${oi === q.answerIndex ? "border-l-2 border-petrol bg-petrol-soft/40 text-ink" : "text-muted"}`}
                    >
                      <span className="mr-2 font-mono text-[0.58rem]">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 border-l-2 border-petrol/40 bg-paper px-3 py-2">
                <p className="label mb-1 !text-[0.55rem]">Model answer</p>
                <p className="whitespace-pre-line text-[0.78rem] leading-relaxed text-ink-2">{modelAnswerText(q)}</p>
                {q.explanation ? <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">{q.explanation}</p> : null}
                {q.hint ? <p className="mt-1 text-[0.65rem] text-brass">Hint: {q.hint}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Results: full answer review, including model answers                */
  /* ------------------------------------------------------------------ */
  if (finished) {
    const correct = scoreOf(pool, isCorrect, selfGrade);
    const pct = Math.round((correct / pool.length) * 100);
    return (
      <div className="border border-line bg-paper-2">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="label mb-1">{title} · results</p>
            <p className="display-sm">
              {correct} / {pool.length} correct · {pct}%
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("review");
                reset();
              }}
              className="btn btn-ghost btn-sm"
            >
              Study all answers
            </button>
            <button type="button" onClick={reset} className="btn btn-sm">
              Retake
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-line p-5 lg:border-b-0 lg:border-r">
            <p className="label mb-1">Score</p>
            <p className="num text-[2.4rem] leading-none">{pct}%</p>
            <div className="mt-3 h-[3px] w-full bg-line">
              <div className="h-full bg-petrol transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <dl className="mt-4 space-y-1.5 font-mono text-[0.62rem] text-muted">
              <div className="flex justify-between"><dt>mode</dt><dd className="text-ink">{mode}</dd></div>
              <div className="flex justify-between"><dt>questions</dt><dd className="text-ink">{pool.length}</dd></div>
              <div className="flex justify-between"><dt>correct</dt><dd className="text-ink">{correct}</dd></div>
              <div className="flex justify-between"><dt>review</dt><dd className="text-ink">{pool.length - correct}</dd></div>
            </dl>
            <p className="mt-4 text-[0.72rem] leading-relaxed text-muted">
              {mode === "viva"
                ? "Viva answers are self-assessed against the model answer. Every question below now shows the full reasoning."
                : "Every question below now shows your answer, the correct or model answer, and the explanation. Written answers are compared by self-assessment."}
            </p>
            <p className="mt-3 border-t border-line pt-2 text-[0.65rem] leading-relaxed text-muted">
              The score is saved locally. Model answers are not a substitute for reproducing the derivation on paper.
            </p>
          </aside>

          <div className="min-w-0 p-4">
            <p className="label mb-2">Answer review</p>
            <ol className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {pool.map((q, i) => {
                const ok = q.type === "mcq" || q.type === "numerical" ? isCorrect(q) : selfGrade[q.id] === true;
                const wasAnswered = q.type === "mcq" || q.type === "numerical" ? submitted[q.id] : selfGrade[q.id] !== undefined && selfGrade[q.id] !== null;
                return (
                  <li key={q.id} className="border border-line">
                    <details open={i === 0}>
                      <summary className="flex cursor-pointer list-none items-start gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                        <span className={`mt-1.5 inline-block h-[6px] w-[6px] shrink-0 ${ok ? "bg-petrol" : "bg-vermilion"}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.76rem] leading-snug text-ink">
                            {i + 1}. {q.prompt}
                          </span>
                          <span className="mt-1 block font-mono text-[0.58rem] uppercase tracking-wide text-muted">
                            {q.type} · {DIFFICULTY[q.difficulty]} · {ok ? "correct" : wasAnswered ? "incorrect" : "not answered"}
                          </span>
                        </span>
                        <span className="font-mono text-[0.9rem] text-muted">+</span>
                      </summary>
                      <div className="space-y-2 border-t border-line px-3 py-3">
                        <div>
                          <p className="label mb-0.5 !text-[0.52rem]">Your answer</p>
                          <p className={`text-[0.74rem] leading-relaxed ${ok ? "text-petrol" : "text-ink-2"}`}>
                            {userAnswerText(q, answers)}
                          </p>
                        </div>
                        <div>
                          <p className="label mb-0.5 !text-[0.52rem]">
                            {q.type === "mcq" || q.type === "numerical" ? "Correct answer" : "Model answer"}
                          </p>
                          <p className="whitespace-pre-line text-[0.76rem] leading-relaxed text-ink-2">{modelAnswerText(q)}</p>
                        </div>
                        {q.explanation ? (
                          <div className="border-l border-line pl-2.5">
                            <p className="label mb-0.5 !text-[0.52rem]">Why</p>
                            <p className="text-[0.7rem] leading-relaxed text-muted">{q.explanation}</p>
                          </div>
                        ) : null}
                        {q.type !== "mcq" && q.type !== "numerical" ? (
                          <div className="flex items-center gap-2 border-t border-line pt-2">
                            <span className="text-[0.62rem] text-muted">Self-assess:</span>
                            <button
                              type="button"
                              onClick={() => setSelfGrade((g) => ({ ...g, [q.id]: true }))}
                              className={`border px-2 py-0.5 font-mono text-[0.56rem] uppercase tracking-wide ${selfGrade[q.id] === true ? "border-petrol bg-petrol text-paper-2" : "border-line-strong text-muted hover:text-ink"}`}
                            >
                              I had this
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelfGrade((g) => ({ ...g, [q.id]: false }))}
                              className={`border px-2 py-0.5 font-mono text-[0.56rem] uppercase tracking-wide ${selfGrade[q.id] === false ? "border-vermilion bg-vermilion text-paper-2" : "border-line-strong text-muted hover:text-ink"}`}
                            >
                              Review
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Active quiz                                                        */
  /* ------------------------------------------------------------------ */
  const answer = current ? answers[current.id] ?? "" : "";
  const isSubmitted = current ? Boolean(submitted[current.id]) : false;
  const showExplanation = Boolean(current && (revealedAll || showModel[current.id] || (mode === "practice" && isSubmitted)));
  const progressPct = ((index + 1) / pool.length) * 100;

  return (
    <div className="border border-line bg-paper-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-3/40 px-4 py-2.5">
        <div>
          <p className="label">{title}</p>
          <p className="text-[0.65rem] text-muted">{pool.length} questions · answers explained at the end</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="seg" role="group" aria-label="Quiz mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => {
                  reset();
                  setMode(m.id);
                  setRemaining(timedMinutes * 60);
                  if (m.id === "timed") setStartedAt(new Date().toISOString());
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          {mode === "timed" ? (
            <span className={`num border border-line px-2 py-1 text-[0.68rem] ${remaining < 60 ? "text-vermilion" : "text-ink"}`} aria-live="polite">
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
            </span>
          ) : null}
        </div>
      </div>

      {mode !== "viva" ? (
        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 no-scrollbar" role="group" aria-label="Question category">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? questions.length : questions.filter((q) => typeGroup(q) === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] transition-colors ${
                  filter === f.id ? "bg-ink text-paper-2" : "text-muted hover:bg-paper-3 hover:text-ink"
                }`}
              >
                {f.label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="h-[2px] w-full bg-line">
        <div className="h-full bg-vermilion transition-[width] duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="grid lg:grid-cols-[1fr_132px]">
        <div className="min-w-0 p-5 sm:p-6">
          {current ? (
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.62rem] text-vermilion">
                  Q{String(index + 1).padStart(2, "0")} / {pool.length}
                </span>
                <span className="label !text-[0.58rem]">{current.topic}</span>
                <span className="label !text-[0.58rem]">· {DIFFICULTY[current.difficulty]}</span>
                <span className="label !text-[0.58rem]">· {current.type}</span>
                {current.marks ? <span className="label !text-[0.58rem]">· {current.marks} marks</span> : null}
              </div>
              <fieldset>
                <legend className="mb-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink">{current.prompt}</legend>

                {current.type === "mcq" && current.options ? (
                  <div className="space-y-2">
                    {current.options.map((opt, i) => {
                      const selected = Number(answer) === i;
                      const correct = isSubmitted && i === current.answerIndex;
                      const wrong = isSubmitted && selected && i !== current.answerIndex;
                      return (
                        <label
                          key={i}
                          className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 text-[0.82rem] leading-relaxed transition-colors ${
                            correct
                              ? "border-petrol bg-petrol-soft/50"
                              : wrong
                                ? "border-vermilion bg-vermilion-soft/50"
                                : selected
                                  ? "border-ink bg-paper-3"
                                  : "border-line hover:border-line-strong hover:bg-paper-3/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${current.id}`}
                            className="mt-1 accent-ink"
                            checked={selected}
                            disabled={isSubmitted}
                            onChange={() => setAnswers((a) => ({ ...a, [current.id]: String(i) }))}
                          />
                          <span className="flex-1">
                            <span className="mr-2 font-mono text-[0.65rem] text-muted">{String.fromCharCode(65 + i)}</span>
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : current.type === "numerical" ? (
                  <div className="max-w-sm">
                    <label htmlFor={`num_${current.id}`} className="mb-1 block text-[0.72rem] text-muted">
                      Your answer {current.numeric?.unit ? `(${current.numeric.unit})` : ""}
                    </label>
                    <div className="flex">
                      <input
                        id={`num_${current.id}`}
                        type="number"
                        step="any"
                        className="field"
                        value={answer}
                        disabled={isSubmitted}
                        onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
                      />
                      {current.numeric?.unit ? (
                        <span className="flex items-center border border-l-0 border-line-strong bg-paper-3 px-2 font-mono text-[0.65rem] text-muted">
                          {current.numeric.unit}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[0.65rem] text-muted">
                      Accepted tolerance ±{current.numeric?.tolerance ?? 0} {current.numeric?.unit ?? ""}. The model answer is shown at the end.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label htmlFor={`text_${current.id}`} className="mb-1 block text-[0.72rem] text-muted">
                      Draft your answer. You will compare it with the model answer and self-assess.
                    </label>
                    <textarea
                      id={`text_${current.id}`}
                      rows={5}
                      className="field resize-y"
                      value={answer}
                      onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
                      placeholder="Write the physics, the equation, and the reasoning…"
                    />
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {!isSubmitted || current.type === "mcq" || current.type === "numerical" ? (
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={(current.type === "mcq" || current.type === "numerical") && answer === ""}
                      onClick={() =>
                        current.type === "mcq" || current.type === "numerical"
                          ? submit(current)
                          : setShowModel((s) => ({ ...s, [current.id]: true }))
                      }
                    >
                      {current.type === "mcq" || current.type === "numerical" ? "Check answer" : "Reveal model answer"}
                    </button>
                  ) : null}
                  {current.hint && !isSubmitted ? (
                    <details className="text-[0.7rem] text-muted">
                      <summary className="cursor-pointer hover:text-ink">Hint</summary>
                      <p className="mt-1 max-w-md leading-relaxed">{current.hint}</p>
                    </details>
                  ) : null}
                </div>
              </fieldset>

              {showExplanation ? (
                <div className="mt-5 border-t border-line pt-4" aria-live="polite">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-block h-[6px] w-[6px] ${
                        current.type === "mcq" || current.type === "numerical"
                          ? isCorrect(current)
                            ? "bg-petrol"
                            : "bg-vermilion"
                          : "bg-brass"
                      }`}
                    />
                    <p className="label !text-[0.6rem]">
                      {current.type === "mcq" || current.type === "numerical"
                        ? isCorrect(current)
                          ? "Correct"
                          : "Not quite"
                        : "Model answer"}
                    </p>
                  </div>
                  {current.type === "numerical" && current.numeric ? (
                    <p className="mb-2 text-[0.78rem] text-ink">
                      Expected: <span className="num">{formatSig(current.numeric.value)}</span> {current.numeric.unit ?? ""}
                    </p>
                  ) : null}
                  <p className="max-w-2xl whitespace-pre-line text-[0.82rem] leading-relaxed text-ink-2">{current.answer}</p>
                  {current.explanation ? (
                    <p className="mt-3 max-w-2xl border-l border-line pl-3 text-[0.76rem] leading-relaxed text-muted">
                      {current.explanation}
                    </p>
                  ) : null}
                  {current.type !== "mcq" && current.type !== "numerical" ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[0.68rem] text-muted">Self-assess:</span>
                      <button
                        type="button"
                        onClick={() => setSelfGrade((g) => ({ ...g, [current.id]: true }))}
                        aria-pressed={selfGrade[current.id] === true}
                        className={`border px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wide ${
                          selfGrade[current.id] === true ? "border-petrol bg-petrol text-paper-2" : "border-line-strong text-muted hover:text-ink"
                        }`}
                      >
                        I had this
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelfGrade((g) => ({ ...g, [current.id]: false }))}
                        aria-pressed={selfGrade[current.id] === false}
                        className={`border px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wide ${
                          selfGrade[current.id] === false ? "border-vermilion bg-vermilion text-paper-2" : "border-line-strong text-muted hover:text-ink"
                        }`}
                      >
                        Review
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-7 flex items-center justify-between border-t border-line pt-4">
            <button type="button" className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              ← Previous
            </button>
            <span className="font-mono text-[0.62rem] text-muted">
              answered {pool.filter((q) => q.type === "mcq" || q.type === "numerical" ? submitted[q.id] : selfGrade[q.id] !== undefined && selfGrade[q.id] !== null).length} · correct {scoreOf(pool, isCorrect, selfGrade)}
            </span>
            {index < pool.length - 1 ? (
              <button type="button" className="btn btn-sm" onClick={() => setIndex((i) => Math.min(pool.length - 1, i + 1))}>
                Next →
              </button>
            ) : (
              <button type="button" className="btn btn-sm" onClick={finish}>
                Finish &amp; show answers
              </button>
            )}
          </div>
        </div>

        <aside className="hidden border-l border-line p-3 lg:block">
          <p className="label mb-2 !text-[0.55rem]">Navigator</p>
          <div className="grid grid-cols-4 gap-1">
            {pool.map((q, i) => {
              const done = q.type === "mcq" || q.type === "numerical" ? submitted[q.id] : selfGrade[q.id] !== undefined && selfGrade[q.id] !== null;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Question ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`flex h-6 w-full items-center justify-center border font-mono text-[0.55rem] ${
                    i === index ? "border-ink bg-ink text-paper-2" : done ? "border-petrol/40 bg-petrol-soft text-petrol" : "border-line text-muted hover:border-line-strong"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={finish} className="mt-4 w-full border border-line-strong py-1.5 font-mono text-[0.58rem] uppercase tracking-wide text-ink-2 hover:bg-paper-3">
            Finish &amp; review
          </button>
        </aside>
      </div>
    </div>
  );
}
