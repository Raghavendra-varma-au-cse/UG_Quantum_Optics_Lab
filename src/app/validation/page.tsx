import type { Metadata } from "next";
import Link from "next/link";
import { EXPERIMENTS } from "@/lib/content/registry";
import { EXPERIMENT_CONTENT } from "@/lib/content";
import { Badge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Scientific validation",
  description:
    "The declared models, numerical checks and limitations behind every simulation in the laboratory."
};

export default function ValidationPage() {
  const totalChecks = Object.values(EXPERIMENT_CONTENT).reduce((s, c) => s + c.simulation.validation.length, 0);

  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Scientific validation</p>
          <h1 className="display-xl max-w-3xl">A model is only useful if you know where it fails.</h1>
          <p className="lede mt-5 max-w-2xl">
            Each simulation is checked against analytical limits and conservation laws. Those checks validate the code and
            the mathematics; they do not validate a physical apparatus. The distinction is stated on every bench.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 self-end">
          <div className="border-t border-line pt-2">
            <p className="display-md">8</p>
            <p className="label mt-1">Declared models</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">{totalChecks}</p>
            <p className="label mt-1">Model-specific checks</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">46</p>
            <p className="label mt-1">Shared engine tests</p>
          </div>
          <div className="border-t border-line pt-2">
            <p className="display-md">0</p>
            <p className="label mt-1">Invented measurements</p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 border-b border-line py-6 md:grid-cols-3">
        {[
          ["Analytical limits", "Known closed-form cases are compared numerically: Malus at 0/45/90°, z_R for a Gaussian beam, fringe period λ/2, FFT of a delta."],
          ["Conservation laws", "Probability conservation in beam-splitter networks, unitarity of optical matrices, Parseval for the Fourier transform."],
          ["Reproducibility", "Every stochastic model takes an explicit seed. The same seed reproduces the run; a different seed changes it."]
        ].map(([t, b]) => (
          <div key={t}>
            <p className="label mb-1">{t}</p>
            <p className="text-[0.74rem] leading-relaxed text-muted">{b}</p>
          </div>
        ))}
      </section>

      <div className="py-6">
        {EXPERIMENTS.map((meta) => {
          const content = EXPERIMENT_CONTENT[meta.slug];
          return (
            <section key={meta.slug} className="border-b border-line py-6">
              <div className="grid gap-6 lg:grid-cols-[220px_1fr_1fr] lg:gap-10">
                <div>
                  <p className="font-mono text-[0.6rem] text-vermilion">{meta.number}</p>
                  <h2 className="mt-1 font-display text-[1.3rem] leading-tight text-ink">
                    <Link href={`/experiments/${meta.slug}`} className="hover:text-vermilion">{meta.shortTitle}</Link>
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{content.simulation.stochastic ? "stochastic" : "deterministic"}</Badge>
                    <Badge tone="slate">{content.simulation.approximations.length} approximations</Badge>
                  </div>
                  <p className="mt-3 font-mono text-[0.55rem] leading-relaxed text-muted">
                    tests: src/experiments/{meta.slug}/physics.test.ts
                  </p>
                </div>
                <div>
                  <p className="label mb-1">Declared model</p>
                  <p className="text-[0.75rem] leading-relaxed text-ink-2">{content.simulation.model}</p>
                  <p className="label mb-1 mt-3">Validity</p>
                  <ul className="space-y-1">
                    {content.simulation.validity.map((v, i) => (
                      <li key={i} className="text-[0.7rem] leading-relaxed text-muted">— {v}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label mb-1">Checks used</p>
                  <ul className="space-y-1">
                    {content.simulation.validation.map((v, i) => (
                      <li key={i} className="text-[0.7rem] leading-relaxed text-ink-2">— {v}</li>
                    ))}
                  </ul>
                  <p className="label mb-1 mt-3">Explicitly not claimed</p>
                  <ul className="space-y-1">
                    {content.simulation.exclusions.slice(0, 3).map((v, i) => (
                      <li key={i} className="text-[0.68rem] leading-relaxed text-muted">— {v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-4 grid gap-8 border-t border-line pt-6 md:grid-cols-2">
        <div>
          <p className="label mb-2">How to read a validation claim</p>
          <p className="text-[0.76rem] leading-relaxed text-ink-2">
            “Conserves probability” means the implemented matrices are unitary and the computed output probabilities sum to
            one. It does not mean the real interferometer has no loss. “Recovers λ” means the numerical inversion is
            correct for synthetic input; your measurement can still disagree because of a bent micrometer, air turbulence
            or a mislabelled source.
          </p>
        </div>
        <div>
          <p className="label mb-2">Reproduce the checks</p>
          <pre className="border border-line bg-paper-2 p-3 font-mono text-[0.66rem] text-ink-2">npm test</pre>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
            Vitest runs the shared engine suite and each experiment's model tests in Node. No browser or physical hardware
            is required.
          </p>
          <Link href="/experiments" className="arrow-link mt-3 inline-flex">Open an experiment →</Link>
        </div>
      </section>
    </div>
  );
}
