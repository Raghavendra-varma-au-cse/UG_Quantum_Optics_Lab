"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ExperimentSlug, Question } from "@/lib/content/types";
import { EXPERIMENTS } from "@/lib/content/registry";
import { createRng, shuffle } from "@/lib/physics/rng";
import { loadAttempts } from "@/lib/db";
import { QuizRunner } from "./QuizRunner";
import { Slider, Toggle } from "@/components/ui/Controls";
import { Badge } from "@/components/ui/primitives";

interface Attempt {
  id: string;
  experiment: string;
  startedAt: string;
  finishedAt?: string;
  total: number;
  correct: number;
  mode: string;
}

export function ExamHub({ allQuestions }: { allQuestions: { slug: ExperimentSlug; question: Question }[] }) {
  const [count, setCount] = useState(20);
  const [seed, setSeed] = useState("mock-paper-01");
  const [chosen, setChosen] = useState<ExperimentSlug[]>(EXPERIMENTS.map((e) => e.slug));
  const [paper, setPaper] = useState<Question[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    void loadAttempts<Attempt>().then((rows) =>
      setAttempts(rows.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)).slice(0, 10))
    );
  }, [historyKey]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of allQuestions) map.set(q.slug, (map.get(q.slug) ?? 0) + 1);
    return map;
  }, [allQuestions]);

  const pool = useMemo(() => allQuestions.filter((q) => chosen.includes(q.slug)).map((q) => q.question), [allQuestions, chosen]);
  const available = pool.length;

  function generate() {
    const rng = createRng(seed);
    const picked = shuffle(rng, pool).slice(0, Math.min(count, pool.length));
    setPaper(picked);
    setHistoryKey((k) => k + 1);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <aside className="space-y-5">
        <div className="border border-line bg-paper-2">
          <div className="border-b border-line px-4 py-2.5">
            <p className="label">Mock paper</p>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[0.72rem] text-ink-2">Questions</p>
                <p className="num text-[0.7rem] text-ink">{Math.min(count, available)}</p>
              </div>
              <Slider label="Paper length" value={count} min={5} max={40} step={5} unit="" onChange={setCount} />
              <p className="mt-1 text-[0.6rem] text-muted">{available} available in the selected modules</p>
            </div>
            <div>
              <p className="label mb-2">Modules</p>
              <div className="space-y-1.5">
                {EXPERIMENTS.map((e) => (
                  <Toggle
                    key={e.slug}
                    label={`${e.number} · ${e.shortTitle}`}
                    checked={chosen.includes(e.slug)}
                    onChange={(on) =>
                      setChosen((c) => (on ? [...c, e.slug] : c.filter((s) => s !== e.slug)))
                    }
                  />
                ))}
              </div>
            </div>
            <label className="block">
              <span className="label mb-1 block">Seed</span>
              <input className="field h-7 text-[0.66rem]" value={seed} onChange={(e) => setSeed(e.target.value)} spellCheck={false} />
            </label>
            <button type="button" className="btn w-full" onClick={generate} disabled={available === 0}>
              Generate paper
            </button>
          </div>
        </div>

        <div className="border border-line bg-paper-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="label">Recent attempts</p>
            <button type="button" onClick={() => setHistoryKey((k) => k + 1)} className="font-mono text-[0.55rem] uppercase tracking-wide text-muted hover:text-ink">refresh</button>
          </div>
          {attempts.length === 0 ? (
            <p className="px-4 py-4 text-[0.7rem] leading-relaxed text-muted">No attempts saved in this browser yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {attempts.map((a) => (
                <li key={a.id} className="px-4 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[0.68rem] text-ink-2">{a.experiment === "mixed" ? "Mixed paper" : a.experiment.replace(/-/g, " ")}</span>
                    <span className="num text-[0.68rem] text-ink">{a.correct}/{a.total}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-[0.55rem] text-muted">
                    {a.mode} · {new Date(a.startedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-line bg-paper-2 p-4">
          <p className="label mb-2">Practical examination</p>
          <p className="text-[0.7rem] leading-relaxed text-ink-2">
            Identify components, align the setup, select a measurement, analyse the data and defend the uncertainty.
            Use the practical workspace with the instrument list closed.
          </p>
          <Link href="/practical" className="arrow-link mt-3 inline-flex">Practical mode →</Link>
        </div>
      </aside>

      <div className="min-w-0">
        {paper ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
              <p className="label">Generated paper · {paper.length} questions</p>
              <p className="font-mono text-[0.58rem] text-muted">seed: {seed}</p>
            </div>
            <QuizRunner questions={paper} slug="mixed" title="Mock examination" timedMinutes={paper.length * 2} initialMode="timed" />
            <button type="button" className="btn btn-ghost mt-4" onClick={() => setPaper(null)}>
              ← Back to paper settings
            </button>
          </div>
        ) : (
          <div>
            <div className="border border-line bg-paper-2 p-6">
              <p className="label mb-2 text-vermilion">Examination preparation</p>
              <h2 className="display-md">A paper from the whole laboratory.</h2>
              <p className="mt-3 max-w-2xl text-[0.82rem] leading-relaxed text-ink-2">
                The generator samples without replacement from the selected modules. Timed mode hides the explanations
                until you finish; practice mode explains each answer immediately. The seed makes a paper reproducible for
                revision or moderation.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
                <div><p className="num text-[1.2rem] text-ink">{allQuestions.length}</p><p className="label mt-1 !text-[0.55rem]">questions</p></div>
                <div><p className="num text-[1.2rem] text-ink">{EXPERIMENTS.length}</p><p className="label mt-1 !text-[0.55rem]">modules</p></div>
                <div><p className="num text-[1.2rem] text-ink">{available}</p><p className="label mt-1 !text-[0.55rem]">selected</p></div>
                <div><p className="num text-[1.2rem] text-ink">{Math.min(count, available)}</p><p className="label mt-1 !text-[0.55rem]">paper length</p></div>
              </div>
              <button type="button" className="btn mt-5" onClick={generate} disabled={available === 0}>Generate and start</button>
            </div>

            <div className="mt-8">
              <p className="label mb-3">Practice by module</p>
              <div className="grid border-l border-t border-line sm:grid-cols-2">
                {EXPERIMENTS.map((e) => (
                  <Link key={e.slug} href={`/experiments/${e.slug}/master/`} className="group border-b border-r border-line p-4 hover:bg-paper-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-mono text-[0.58rem] text-muted">{e.number}</p>
                      <Badge>{counts.get(e.slug) ?? 0} Qs</Badge>
                    </div>
                    <p className="mt-1.5 text-[0.82rem] text-ink group-hover:text-vermilion">{e.shortTitle}</p>
                    <p className="mt-1 text-[0.66rem] text-muted">MCQ · numerical · viva · derivation</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-line pt-5">
              <p className="label mb-2">Revision strategy</p>
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  ["Recall", "Write the principle and the layout from memory. Then check the experiment page."],
                  ["Calculate", "Do the numerical questions with the formula sheet closed. Use consistent units."],
                  ["Defend", "Answer viva questions aloud. If you cannot explain why an approximation holds, revisit it."]
                ].map(([t, b]) => (
                  <div key={t}>
                    <p className="text-[0.78rem] font-medium text-ink">{t}</p>
                    <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
