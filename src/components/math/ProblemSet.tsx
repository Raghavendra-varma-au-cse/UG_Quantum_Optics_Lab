"use client";

import { useState } from "react";
import type { Question } from "@/lib/content/types";

export function ProblemSet({ problems }: { problems: Question[] }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  return (
    <div className="border border-line bg-paper-2">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="label">Practice problems</p>
        <p className="font-mono text-[0.58rem] text-muted">{problems.length} problems · worked answers</p>
      </div>
      <ol className="divide-y divide-line">
        {problems.map((q, i) => {
          const isRevealed = Boolean(revealed[q.id]);
          const value = selected[q.id] ?? "";
          const correct = q.type === "mcq" ? Number(value) === q.answerIndex : null;
          return (
            <li key={q.id} className="px-4 py-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.6rem] text-vermilion">{String(i + 1).padStart(2, "0")}</span>
                <span className="label !text-[0.55rem]">{q.topic}</span>
                <span className="label !text-[0.55rem]">· {q.type}</span>
                <span className="label !text-[0.55rem]">· level {q.difficulty}</span>
              </div>
              <p className="max-w-2xl text-[0.84rem] leading-relaxed text-ink">{q.prompt}</p>

              {q.type === "mcq" && q.options ? (
                <div className="mt-3 space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const sel = Number(value) === oi;
                    const isAnswer = isRevealed && oi === q.answerIndex;
                    return (
                      <label key={oi} className={`flex cursor-pointer items-start gap-2 border px-2.5 py-1.5 text-[0.76rem] ${isAnswer ? "border-petrol bg-petrol-soft/40" : isRevealed && sel ? "border-vermilion bg-vermilion-soft/40" : sel ? "border-ink" : "border-line"}`}>
                        <input type="radio" name={`p_${q.id}`} className="mt-0.5 accent-ink" checked={sel} disabled={isRevealed} onChange={() => setSelected((s) => ({ ...s, [q.id]: String(oi) }))} />
                        <span><span className="mr-1.5 font-mono text-[0.58rem] text-muted">{String.fromCharCode(65 + oi)}</span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : q.type === "numerical" ? (
                <div className="mt-3 flex max-w-xs">
                  <input type="number" step="any" className="field h-8 text-[0.72rem]" value={value} disabled={isRevealed} onChange={(e) => setSelected((s) => ({ ...s, [q.id]: e.target.value }))} aria-label="Your numerical answer" />
                  {q.numeric?.unit ? <span className="flex items-center border border-l-0 border-line-strong bg-paper-3 px-2 font-mono text-[0.58rem] text-muted">{q.numeric.unit}</span> : null}
                </div>
              ) : null}

              <div className="mt-2.5 flex items-center gap-3">
                <button type="button" onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))} className="border border-line-strong px-2 py-1 font-mono text-[0.58rem] uppercase tracking-wide text-ink-2 hover:bg-paper-3">
                  {isRevealed ? "Answer shown" : "Show answer"}
                </button>
                {isRevealed && correct !== null ? (
                  <span className={`font-mono text-[0.58rem] uppercase tracking-wide ${correct ? "text-petrol" : "text-vermilion"}`}>{correct ? "correct" : "not quite"}</span>
                ) : null}
              </div>

              {isRevealed ? (
                <div className="mt-3 border-l-2 border-petrol/40 bg-paper px-3 py-2">
                  {q.type === "numerical" && q.numeric ? (
                    <p className="mb-1 font-mono text-[0.66rem] text-petrol">Expected: {q.numeric.value} {q.numeric.unit ?? ""} (±{q.numeric.tolerance})</p>
                  ) : null}
                  <p className="whitespace-pre-line text-[0.76rem] leading-relaxed text-ink-2">{q.answer}</p>
                  {q.explanation ? <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted">{q.explanation}</p> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
