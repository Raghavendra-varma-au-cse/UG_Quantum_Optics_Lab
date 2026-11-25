import Link from "next/link";
import type { ExperimentContent } from "@/lib/content/types";
import { QuizRunner } from "@/components/exam/QuizRunner";
import { EquationTable } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/primitives";

export function MasterPanel({ content }: { content: ExperimentContent }) {
  const counts = content.questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] ?? 0) + 1;
    return acc;
  }, {});
  const misconceptions = content.sections.flatMap((s) =>
    s.blocks.filter((b) => b.type === "callout" && b.tone === "misconception").map((b) => b as Extract<typeof b, { type: "callout" }>)
  );
  const checks = content.status
    ? [
        ["Scientific content", content.status.content],
        ["Working simulation", content.status.simulation],
        ["Practical procedure", content.status.procedure],
        ["Data analysis", content.status.analysis],
        ["Question bank", content.status.questions],
        ["References", content.status.references],
        ["Automated validation", content.status.validation]
      ]
    : [];

  return (
    <div className="shell py-10">
      <div className="grid gap-5 border-b border-line pb-6 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="label mb-2 text-vermilion">Mastery</p>
          <h2 className="display-lg">Explain it. Calculate it. Defend it.</h2>
          <p className="lede mt-3 max-w-2xl">
            Mastery means you can derive the result, answer the viva without notes, and diagnose a setup that refuses to
            cooperate. Use the bank below; every answer explains the physics rather than only the option.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 self-end sm:grid-cols-3 md:grid-cols-2">
          {Object.entries(counts).map(([type, n]) => (
            <div key={type} className="border-t border-line pt-2">
              <p className="num text-[1.15rem] leading-none text-ink">{n}</p>
              <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">{type}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <QuizRunner questions={content.questions} slug={content.slug} title={`${content.shortTitle} · mastery`} />

          <section className="mt-10">
            <div className="mb-3 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <h3 className="display-sm">Derivation practice</h3>
              <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">{content.derivations.length} derivations</span>
            </div>
            <p className="mb-4 max-w-2xl text-[0.8rem] leading-relaxed text-muted">
              Close the page and reproduce each result from the stated starting point. If you cannot justify an
              approximation, reread the derivation before attempting the numerical questions.
            </p>
            <div className="divide-y divide-line border-y border-line">
              {content.derivations.map((d, i) => (
                <details key={d.id} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[0.6rem] text-vermilion">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[0.82rem] text-ink">{d.title}</span>
                    </span>
                    <span className="font-mono text-[0.9rem] text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="mb-3 border-l border-line pl-4">
                    {d.steps.map((s, si) => (
                      <p key={si} className="mb-1.5 text-[0.74rem] leading-relaxed text-ink-2">
                        {si + 1}. {s.text}
                      </p>
                    ))}
                    <p className="mt-2 text-[0.72rem] text-petrol">Result: {d.result.text}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {misconceptions.length > 0 ? (
            <section className="mt-10 border-t border-line pt-4">
              <h3 className="display-sm mb-3">Ideas that reliably cause trouble</h3>
              <div className="space-y-3">
                {misconceptions.map((m, i) => (
                  <div key={i} className="border-l-2 border-brass bg-brass-soft/30 px-4 py-2.5">
                    <p className="text-[0.8rem] font-medium text-ink">{m.title}</p>
                    <p className="mt-0.5 text-[0.76rem] leading-relaxed text-ink-2">{m.body}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="border border-line bg-paper-2">
            <div className="border-b border-line px-4 py-2.5">
              <p className="label">Viva protocol</p>
            </div>
            <ol className="space-y-2 p-4">
              {[
                "State the physical principle in one sentence, without equations.",
                "Draw the layout and label every port and component.",
                "Write the governing equation, then define every symbol and unit.",
                "Give the expected order of magnitude before calculating.",
                "Name two systematic and two random error sources.",
                "Explain what would change if a stated assumption failed."
              ].map((s, i) => (
                <li key={i} className="flex gap-2 text-[0.72rem] leading-relaxed text-ink-2">
                  <span className="font-mono text-[0.58rem] text-vermilion">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-line bg-paper-2">
            <div className="border-b border-line px-4 py-2.5">
              <p className="label">Practical examination</p>
            </div>
            <div className="p-4">
              <p className="text-[0.76rem] leading-relaxed text-ink-2">
                The practical assessment asks you to identify components, align the setup, choose a measurement,
                analyse data and defend the uncertainty.
              </p>
              <Link href={`/experiments/${content.slug}/practical/`} className="btn btn-sm mt-3 w-full">
                Open practical mode
              </Link>
            </div>
          </div>

          <div className="border border-line bg-paper-2">
            <div className="border-b border-line px-4 py-2.5">
              <p className="label">Module completeness</p>
            </div>
            <ul className="divide-y divide-line">
              {checks.map(([label, ok]) => (
                <li key={String(label)} className="flex items-center justify-between gap-3 px-4 py-2">
                  <span className="text-[0.72rem] text-ink-2">{label}</span>
                  <Badge tone={ok ? "petrol" : "vermilion"}>{ok ? "present" : "incomplete"}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="mt-12 border-t border-line pt-5">
        <details>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <div>
              <p className="label mb-1">Revision</p>
              <h3 className="display-sm">Full formula sheet</h3>
            </div>
            <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">open</span>
          </summary>
          <div className="mt-5">
            <EquationTable equations={content.equations} />
          </div>
        </details>
      </section>
    </div>
  );
}
