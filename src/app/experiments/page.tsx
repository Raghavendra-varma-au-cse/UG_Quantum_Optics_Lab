import type { Metadata } from "next";
import Link from "next/link";
import { EXPERIMENTS } from "@/lib/content/registry";
import { EXPERIMENT_CONTENT } from "@/lib/content";
import { ExperimentDirectory } from "@/components/experiments/ExperimentDirectory";

export const metadata: Metadata = {
  title: "Experiment index",
  description:
    "Eight undergraduate quantum optics experiments, each with theory, a physical simulation, practical procedure, data analysis and examination preparation."
};

const STAGES = [
  { n: "I", title: "Wave optics", detail: "Superposition, coherence, path difference", experiments: ["01", "02"] },
  { n: "II", title: "Quantum foundations", detail: "Measurement, which-path, complementarity", experiments: ["03", "04"] },
  { n: "III", title: "Polarization & information", detail: "Jones calculus, Fourier processing, encoding", experiments: ["05", "06"] },
  { n: "IV", title: "Quantum technology", detail: "Key distribution, optical manipulation", experiments: ["07", "08"] }
];

export default function ExperimentsPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Experiment index · 08 modules</p>
          <h1 className="display-xl max-w-3xl">Eight experiments. One connected laboratory.</h1>
          <p className="lede mt-5 max-w-2xl">
            Each experiment is a complete learning environment: the physics and its derivation, a working numerical bench,
            the alignment procedure, blank measurement templates, uncertainty analysis and a viva-level question bank.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 self-end">
          <div className="border-t border-line pt-2">
            <p className="display-md">8</p>
            <p className="label mt-1">Experiments</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">3</p>
            <p className="label mt-1">Learning modes</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">{Object.values(EXPERIMENT_CONTENT).reduce((s, c) => s + c.questions.length, 0)}</p>
            <p className="label mt-1">Explained questions</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">{Object.values(EXPERIMENT_CONTENT).reduce((s, c) => s + c.equations.length, 0)}</p>
            <p className="label mt-1">Equations</p>
          </div>
        </div>
      </div>

      <section className="py-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="display-md">Learning progression</h2>
          <p className="hidden font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted sm:block">Recommended order · not a prerequisite lock</p>
        </div>
        <div className="grid gap-0 border-y border-line md:grid-cols-4">
          {STAGES.map((s, i) => (
            <div key={s.n} className={`py-4 md:px-4 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""} ${i === 0 ? "md:pl-0" : ""}`}>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[0.6rem] text-vermilion">Stage {s.n}</span>
                <span className="font-mono text-[0.6rem] text-muted">/ exp. {s.experiments.join(" · ")}</span>
              </div>
              <p className="mt-1 text-[0.82rem] font-medium text-ink">{s.title}</p>
              <p className="mt-0.5 text-[0.7rem] leading-relaxed text-muted">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <ExperimentDirectory
        experiments={EXPERIMENTS}
        questionCounts={Object.fromEntries(Object.entries(EXPERIMENT_CONTENT).map(([slug, c]) => [slug, c.questions.length]))}
      />

      <section className="mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-3">
        {[
          {
            label: "Understand",
            body: "Read the phenomenon, the assumptions and the full derivation. Every symbol carries a unit; every equation is connected to the bench.",
            href: "/mathematics"
          },
          {
            label: "Experiment",
            body: "Manipulate the model, collect simulated observations, then follow the alignment procedure on real hardware. Simulated and measured data never mix silently.",
            href: "/alignment"
          },
          {
            label: "Master",
            body: "Derive, calculate and defend. The question bank explains each answer, and the practical examination tests the whole sequence.",
            href: "/exam"
          }
        ].map((m) => (
          <div key={m.label}>
            <p className="label mb-2 text-vermilion">{m.label}</p>
            <p className="text-[0.8rem] leading-relaxed text-ink-2">{m.body}</p>
            <Link href={m.href} className="arrow-link mt-3 inline-flex">
              Open section →
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
