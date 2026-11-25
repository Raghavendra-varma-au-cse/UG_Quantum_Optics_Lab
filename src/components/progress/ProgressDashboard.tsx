"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store/progress";
import { EXPERIMENTS } from "@/lib/content/registry";
import { exportAllLocalData, estimateStorage } from "@/lib/db";
import { downloadText } from "@/lib/data/csv";

function pctFor(slug: string, r: ReturnType<typeof useProgress.getState>["records"][string] | undefined): number {
  if (!r) return 0;
  return Math.round(
    (r.visitedUnderstand ? 35 : 0) +
      Math.min(1, r.sectionsRead.length / 8) * 15 +
      (r.ranSimulation > 0 ? 20 : 0) +
      (r.quizTotal > 0 ? Math.min(1, r.quizTotal / 8) * 20 : 0) +
      (r.practicalSteps > 0 ? 10 : 0)
  );
}

export function ProgressDashboard() {
  const { records, overallPercent, hydrated, reset, lastExperiment } = useProgress();
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    void estimateStorage().then(setStorage);
  }, []);

  const started = EXPERIMENTS.filter((e) => records[e.slug]);
  const next = EXPERIMENTS.find((e) => pctFor(e.slug, records[e.slug]) < 100) ?? null;
  const last = lastExperiment ? EXPERIMENTS.find((e) => e.slug === lastExperiment) : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
      <div>
        <div className="border border-line bg-paper-2">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <p className="label mb-1">Overall completion</p>
              <p className="num text-[2rem] leading-none text-ink">{hydrated ? `${overallPercent}%` : "—"}</p>
            </div>
            <p className="max-w-[36ch] text-[0.7rem] leading-relaxed text-muted">
              Weighted across theory, sections read, simulation runs, quiz coverage and practical work. It measures
              engagement, not understanding; the quiz score is a better signal.
            </p>
          </div>
          <div className="h-[4px] w-full bg-line">
            <div className="h-full bg-petrol transition-[width] duration-500" style={{ width: `${hydrated ? overallPercent : 0}%` }} />
          </div>
          <div className="grid grid-cols-3 divide-x divide-line">
            {[
              ["Started", `${started.length} / 8`],
              ["Simulations run", String(Object.values(records).reduce((s, r) => s + r.ranSimulation, 0))],
              ["Questions attempted", String(Object.values(records).reduce((s, r) => s + r.quizTotal, 0))]
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-3">
                <p className="label !text-[0.55rem]">{label}</p>
                <p className="num mt-1 text-[0.9rem] text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="display-sm">Experiments</h2>
            {last ? (
              <Link href={`/experiments/${last.slug}`} className="font-mono text-[0.6rem] uppercase tracking-wide text-muted hover:text-ink">
                Continue {last.shortTitle} →
              </Link>
            ) : null}
          </div>
          <div className="border-t border-line">
            {EXPERIMENTS.map((e) => {
              const r = records[e.slug];
              const pct = pctFor(e.slug, r);
              return (
                <div key={e.slug} className="grid gap-2 border-b border-line py-3.5 md:grid-cols-[52px_minmax(0,1fr)_120px_90px] md:items-center md:gap-4">
                  <span className="font-mono text-[0.65rem] text-muted">{e.number}</span>
                  <div>
                    <Link href={`/experiments/${e.slug}`} className="text-[0.82rem] text-ink hover:text-vermilion">{e.title}</Link>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {[
                        ["theory", r?.visitedUnderstand],
                        ["bench", r && r.ranSimulation > 0],
                        ["mastery", r && r.quizTotal > 0],
                        ["practical", r && r.practicalSteps > 0]
                      ].map(([label, done]) => (
                        <span key={String(label)} className={`border px-1.5 py-[1px] font-mono text-[0.52rem] uppercase tracking-[0.06em] ${done ? "border-petrol/40 bg-petrol-soft/40 text-petrol" : "border-line text-muted/70"}`}>
                          {label}
                        </span>
                      ))}
                      {r ? <span className="font-mono text-[0.52rem] text-muted">{r.sectionsRead.length} sections read</span> : null}
                    </div>
                  </div>
                  <div>
                    <div className="h-[3px] w-full bg-line"><div className="h-full bg-ink" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-1 text-right font-mono text-[0.55rem] text-muted">{pct}%</p>
                  </div>
                  <div className="text-right">
                    <Link href={`/experiments/${e.slug}`} className="font-mono text-[0.58rem] uppercase tracking-wide text-muted hover:text-vermilion">open →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {next ? (
          <div className="mt-8 border border-line bg-paper-2 p-4">
            <p className="label mb-1 text-vermilion">Suggested next</p>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-[1.25rem] text-ink">{next.title}</p>
                <p className="mt-1 max-w-xl text-[0.74rem] leading-relaxed text-muted">{next.summary}</p>
              </div>
              <Link href={`/experiments/${next.slug}`} className="btn btn-sm">Open</Link>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="space-y-5">
        <div className="border border-line bg-paper-2 p-4">
          <p className="label mb-2">Your data</p>
          <p className="text-[0.72rem] leading-relaxed text-ink-2">
            Progress, notebooks, datasets and attempts are stored in this browser with IndexedDB. Nothing is transmitted.
            Clearing site data deletes them permanently.
          </p>
          {storage ? (
            <p className="mt-2 font-mono text-[0.6rem] text-muted">
              {(storage.usage / 1024 / 1024).toFixed(2)} MB used of {(storage.quota / 1024 / 1024 / 1024).toFixed(1)} GB
            </p>
          ) : null}
          <div className="mt-3 space-y-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm w-full"
              onClick={async () => {
                const data = await exportAllLocalData();
                downloadText(`quantum-optics-lab-data-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
              }}
            >
              Export all local data (JSON)
            </button>
            <Link href="/notebook" className="btn btn-ghost btn-sm w-full">Open notebook</Link>
          </div>
        </div>

        <div className="border border-line bg-paper-2 p-4">
          <p className="label mb-2">Reset progress</p>
          <p className="text-[0.7rem] leading-relaxed text-muted">
            This clears the completion record and quiz counts. Notebook records and datasets are not deleted here.
          </p>
          {confirmReset ? (
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn btn-sm flex-1" onClick={() => { reset(); setConfirmReset(false); }}>
                Confirm reset
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm mt-3 w-full" onClick={() => setConfirmReset(true)}>
              Reset progress
            </button>
          )}
        </div>

        <div className="border border-line bg-paper-2 p-4">
          <p className="label mb-2">Study protocol</p>
          <ol className="space-y-1.5">
            {[
              "Read the objectives, then attempt the derivation before reading it.",
              "Run the guided bench until you can predict the output.",
              "Do the practical alignment with the checklist closed.",
              "Answer the viva questions aloud, then check.",
              "Analyse a real dataset and quote an uncertainty."
            ].map((s, i) => (
              <li key={s} className="flex gap-2 text-[0.7rem] leading-relaxed text-ink-2">
                <span className="font-mono text-[0.55rem] text-vermilion">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
