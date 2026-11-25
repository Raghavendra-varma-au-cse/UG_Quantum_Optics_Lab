import type { Metadata } from "next";
import { QUANTUM_CHAPTERS } from "@/lib/content/quantum-foundations";
import { ChapterView } from "@/components/math/ChapterView";

export const metadata: Metadata = {
  title: "Quantum mechanics foundations",
  description:
    "States, amplitudes, measurement, density matrices, entanglement and complementarity, connected to the Mach–Zehnder, eraser, bomb tester and BB84 experiments."
};

export default function QuantumPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-petrol">Quantum foundations · eight chapters</p>
          <h1 className="display-xl max-w-3xl">One interferometer. Two descriptions.</h1>
          <p className="lede mt-5 max-w-2xl">
            The wave picture and the state-vector picture are not rival theories; they are two levels of the same
            description. This module develops the quantum language slowly, then uses it on the experiments where the
            difference becomes measurable.
          </p>
        </div>
        <div className="self-end border border-petrol/30 bg-petrol-soft/30 p-4">
          <p className="label mb-2 !text-petrol">A necessary caution</p>
          <p className="text-[0.75rem] leading-relaxed text-ink-2">
            A classical laser demonstration and a single-photon experiment can share an equation and still be different
            experiments. Every claim in this section says which one it is describing.
          </p>
        </div>
      </div>

      <div className="grid gap-10 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-[88px]">
            <p className="label mb-3">Chapters</p>
            <nav className="border-l border-line">
              {QUANTUM_CHAPTERS.map((c) => (
                <a key={c.id} href={`#${c.id}`} className="group flex gap-2 border-l border-transparent py-1.5 pl-3 text-[0.7rem] leading-snug text-muted hover:border-petrol hover:text-ink">
                  <span className="font-mono text-[0.55rem] text-line-strong group-hover:text-petrol">{c.number}</span>
                  {c.title}
                </a>
              ))}
            </nav>
            <p className="mt-4 border-t border-line pt-3 text-[0.65rem] leading-relaxed text-muted">
              The mathematics chapters provide the linear algebra and probability background. Links at the end of each
              chapter connect back to the bench.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-12">
          {QUANTUM_CHAPTERS.map((c) => (
            <ChapterView key={c.id} chapter={c} accent="petrol" />
          ))}
        </div>
      </div>
    </div>
  );
}
