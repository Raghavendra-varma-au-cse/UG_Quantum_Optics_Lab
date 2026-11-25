import Link from "next/link";
import { EXPERIMENTS } from "@/lib/content/registry";
import { EXPERIMENT_CONTENT } from "@/lib/content";
import { HARDWARE_SEEDS } from "@/lib/content/hardware-ids";
import { HeroInterferometer } from "@/components/home/HeroInterferometer";
import { WorkbenchPreview } from "@/components/home/WorkbenchPreview";
import { ComponentGlyph, type GlyphKind } from "@/components/home/ComponentGlyph";
import { OpticalDiagram } from "@/components/diagrams/OpticalDiagram";
import { Eq } from "@/components/ui/Equation";
import { EvidenceTag } from "@/components/ui/primitives";

const COMPONENT_PREVIEW: { id: string; kind: GlyphKind }[] = [
  { id: "mir-plane", kind: "mirror" },
  { id: "bs-cube-50", kind: "beamsplitter" },
  { id: "lens-convex", kind: "lens" },
  { id: "pol-linear", kind: "polarizer" },
  { id: "waveplate-quarter", kind: "waveplate" },
  { id: "translation-stage", kind: "stage" }
];

export default function HomePage() {
  const totalQuestions = Object.values(EXPERIMENT_CONTENT).reduce((s, c) => s + c.questions.length, 0);
  const totalEquations = Object.values(EXPERIMENT_CONTENT).reduce((s, c) => s + c.equations.length, 0);
  const totalReferences = Object.values(EXPERIMENT_CONTENT).reduce((s, c) => s + c.references.length, 0);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="shell pb-10 pt-8 md:pb-14 md:pt-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-2.5">
          <p className="label">Department of Physics · Undergraduate laboratory</p>
          <p className="hidden font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted sm:block">
            Eight experiments · Three modes · Local-first
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-[1px] w-10 bg-vermilion" aria-hidden />
              <span className="label text-vermilion">Experimental quantum optics</span>
            </div>
            <h1 className="display-xl max-w-[15ch] text-balance">
              Make the light interfere. Then explain why.
            </h1>
            <p className="lede mt-6 max-w-xl">
              A working laboratory for the eight experiments that carry you from coherence and path difference to a
              quantum key, a trapped bead and a measurement you can defend.
            </p>
            <p className="mt-4 max-w-xl text-[0.85rem] leading-relaxed text-muted">
              Every experiment combines the physics and its derivation, a numerical bench that actually computes, the
              optical alignment procedure, blank measurement templates and a viva-level question bank.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/experiments" className="btn">
                Enter the experiment index
                <span aria-hidden>→</span>
              </Link>
              <Link href="/experiments/michelson-interferometer" className="btn btn-ghost">
                Read the Michelson first
              </Link>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-4">
              <div>
                <dt className="label mb-1">Experiments</dt>
                <dd className="font-display text-[1.7rem] leading-none">08</dd>
              </div>
              <div>
                <dt className="label mb-1">
                  <span className="hidden sm:inline">Explained questions</span>
                  <span className="sm:hidden">Questions</span>
                </dt>
                <dd className="font-display text-[1.7rem] leading-none">{totalQuestions}</dd>
              </div>
              <div>
                <dt className="label mb-1">
                  <span className="hidden sm:inline">Equations &amp; derivations</span>
                  <span className="sm:hidden">Equations</span>
                </dt>
                <dd className="font-display text-[1.7rem] leading-none">{totalEquations}</dd>
              </div>
            </dl>
            <p className="mt-4 max-w-xl text-[0.68rem] leading-relaxed text-muted">
              No account required. Progress, notebooks and measurements stay in this browser. Simulations are labelled
              and their approximations are disclosed in the bench itself.
            </p>
          </div>

          <div className="lg:pt-4">
            <HeroInterferometer />
            <div className="mt-2 flex items-start justify-between gap-4">
              <p className="max-w-[34ch] text-[0.65rem] leading-relaxed text-muted">
                The hero pattern is computed live from the two-beam interference law, not drawn. Move the mirror and the
                fringe order changes as it would on the bench.
              </p>
              <Link href="/experiments/michelson-interferometer/experiment/" className="arrow-link shrink-0">
                Open bench →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Index                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-line bg-paper-2/40">
        <div className="shell py-10 md:py-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label mb-2 text-vermilion">The laboratory</p>
              <h2 className="display-lg">Eight benches, in sequence</h2>
            </div>
            <div className="flex items-center gap-5">
              <p className="hidden max-w-[30ch] text-right text-[0.7rem] leading-relaxed text-muted md:block">
                The order is a progression, not a lock. Each module states its prerequisites and its hardware.
              </p>
              <Link href="/experiments" className="arrow-link shrink-0">
                Full index →
              </Link>
            </div>
          </div>

          <div className="border-t border-ink">
            {EXPERIMENTS.map((e) => (
              <Link
                key={e.slug}
                href={`/experiments/${e.slug}`}
                className="group grid gap-3 border-b border-line py-4 transition-colors hover:bg-paper-2 md:grid-cols-[58px_minmax(0,1.7fr)_minmax(0,1fr)_150px_100px] md:items-center md:gap-5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.66rem] text-muted">{e.number}</span>
                  <span className="hidden h-[1px] w-5 bg-line-strong md:block" aria-hidden />
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="display-sm text-ink transition-colors group-hover:text-vermilion">{e.title}</h3>
                    <span className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-muted">{e.family}</span>
                  </div>
                  <p className="mt-1 max-w-2xl text-[0.72rem] leading-relaxed text-muted">{e.summary}</p>
                </div>
                <p className="hidden text-[0.7rem] leading-relaxed text-ink-2 md:block">{e.principle}</p>
                <div className="flex items-center gap-2 md:block">
                  <p className="font-mono text-[0.62rem] text-muted">{e.duration}</p>
                  <div className="mt-1 hidden md:block">
                    <EvidenceTag label={e.evidence} compact />
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end md:gap-4">
                  <span className="font-mono text-[0.58rem] uppercase tracking-wide text-muted md:hidden">
                    {e.evidence === "actual" ? "lab" : e.evidence === "simulation" ? "model" : "analogue"}
                  </span>
                  <span className="font-mono text-[0.9rem] text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-vermilion">→</span>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-4 max-w-3xl text-[0.65rem] leading-relaxed text-muted">
            <span className="font-mono uppercase tracking-[0.08em] text-ink">Reading the labels.</span> “Actual laboratory
            implementation” means the kit exists in a teaching lab; “classical optical demonstration” means the same
            mathematics is shown with coherent light, not single photons; “theoretical simulation” means no commercial kit
            is assumed. No label is decorative.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Modes                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="shell py-12 md:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
          <div>
            <p className="label mb-2 text-vermilion">How an experiment works</p>
            <h2 className="display-lg max-w-2xl">One route through theory, bench and defence.</h2>
          </div>
          <p className="max-w-[34ch] text-[0.72rem] leading-relaxed text-muted">
            Switching modes keeps your place. Progress is recorded locally, per mode, so you can see what you have read,
            run or answered — not just that you visited.
          </p>
        </div>

        <div className="grid border-t border-line md:grid-cols-3">
          <div className="border-b border-line py-6 md:border-b-0 md:border-r md:pr-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="label text-vermilion">01 — Understand</p>
              <span className="font-mono text-[0.6rem] text-muted">theory</span>
            </div>
            <p className="text-[0.84rem] leading-relaxed text-ink-2">
              Start from the physical question, not the formula. Every symbol is defined, every approximation is named,
              and the derivation is worked in full.
            </p>
            <div className="mt-4 border border-line bg-paper-2 px-4 py-3">
              <p className="label mb-2 !text-[0.55rem]">Two-beam interference</p>
              <div className="overflow-x-auto">
                <Eq>{String.raw`I = I_1 + I_2 + 2\sqrt{I_1 I_2}\,V\cos\delta`}</Eq>
              </div>
              <p className="mt-2 text-[0.62rem] leading-relaxed text-muted">
                V is not assumed to be 1. Coherence, balance and path difference set it.
              </p>
            </div>
          </div>
          <div className="border-b border-line py-6 md:border-b-0 md:border-r md:px-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="label text-vermilion">02 — Experiment</p>
              <span className="font-mono text-[0.6rem] text-muted">bench</span>
            </div>
            <p className="text-[0.84rem] leading-relaxed text-ink-2">
              Move mirrors, rotate wave plates, change a beam-splitter ratio. The model recomputes; the readout tells you
              what it assumed. Then follow the real alignment sequence.
            </p>
            <div className="mt-4 border border-line bg-paper-2">
              <OpticalDiagram kind="mach-zehnder" className="opacity-95" />
              <p className="border-t border-line px-3 py-2 font-mono text-[0.55rem] uppercase tracking-wide text-muted">
                Interactive bench · guided and independent
              </p>
            </div>
          </div>
          <div className="py-6 md:pl-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="label text-vermilion">03 — Master</p>
              <span className="font-mono text-[0.6rem] text-muted">defence</span>
            </div>
            <p className="text-[0.84rem] leading-relaxed text-ink-2">
              Numerical problems, derivations and viva questions with model answers. The timed paper and practical
              examination test the full sequence, not isolated facts.
            </p>
            <div className="mt-4 border border-line bg-paper-2 px-4 py-3">
              <p className="font-mono text-[0.55rem] uppercase tracking-wide text-muted">Viva · 2 marks</p>
              <p className="mt-1 text-[0.76rem] leading-snug text-ink">
                Why does a click at the normally dark port certify a live bomb without detonating it?
              </p>
              <p className="mt-2 border-t border-line pt-2 text-[0.64rem] leading-relaxed text-muted">
                The absorber removes one path amplitude, so the remaining amplitude can no longer cancel. The ideal
                probability is 1/4, not 1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Workbench                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-line bg-paper-3/30">
        <div className="shell py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <p className="label mb-2 text-vermilion">The bench is the argument</p>
              <h2 className="display-lg max-w-lg">A simulation that shows its working.</h2>
              <p className="mt-4 max-w-md text-[0.85rem] leading-relaxed text-ink-2">
                These are not looping animations. Every pattern, curve and count is recomputed from the declared model.
                Where randomness is physical — photon detection, eavesdropping, Brownian motion — the seed is exposed and
                the run is reproducible.
              </p>
              <dl className="mt-6 divide-y divide-line border-t border-line">
                {[
                  ["Deterministic optics", "Jones, beam-splitter and interference models are evaluated directly."],
                  ["Stochastic models", "Seeded Monte Carlo; the same seed reproduces the same statistics."],
                  ["Model disclosure", "Approximations, validity range and exclusions are one click away."],
                  ["No invented data", "Simulated measurements are labelled in tables, CSVs and reports."]
                ].map(([term, def]) => (
                  <div key={term} className="grid gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-4">
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.06em] text-ink">{term}</dt>
                    <dd className="text-[0.72rem] leading-relaxed text-muted">{def}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <WorkbenchPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Optical table / hardware                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div className="border border-line">
            <OpticalDiagram kind="optical-table" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">Beam height 100 mm · 25 mm hole grid</p>
              <Link href="/alignment" className="arrow-link">
                Alignment trainer →
              </Link>
            </div>
          </div>
          <div className="self-center">
            <p className="label mb-2 text-vermilion">Optomechanics</p>
            <h2 className="display-lg">The beam does not align itself.</h2>
            <p className="mt-4 max-w-md text-[0.84rem] leading-relaxed text-ink-2">
              An experiment is a mechanical system before it is an optical one. Posts, kinematic mounts, irises and
              translation stages determine whether the physics is visible at all. The alignment trainer lets you make the
              usual mistakes — and diagnose them from the observation.
            </p>
            <ul className="mt-5 space-y-2 border-t border-line pt-3">
              {[
                "Set beam height and squareness before placing a single lens.",
                "Centre with two irises; adjust one degree of freedom at a time.",
                "Tilt a mirror and watch fringes rotate and shear.",
                "Distinguish a misaligned interferometer from a coherence problem."
              ].map((s) => (
                <li key={s} className="flex gap-3 text-[0.76rem] leading-relaxed text-ink-2">
                  <span className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-vermilion" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link href="/alignment" className="arrow-link">Build the beam path →</Link>
              <Link href="/hardware" className="arrow-link">Hardware inventory →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Components                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-line">
        <div className="shell py-12 md:py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label mb-2 text-vermilion">Component library</p>
              <h2 className="display-lg">Know what is on the table.</h2>
            </div>
            <div className="flex items-center gap-5">
              <p className="hidden max-w-[34ch] text-right text-[0.7rem] leading-relaxed text-muted md:block">
                Working principle, specification, alignment, common errors and which experiments use it.
              </p>
              <Link href="/components" className="arrow-link shrink-0">Search the library →</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-6">
            {COMPONENT_PREVIEW.map((c) => {
              const seed = HARDWARE_SEEDS.find((h) => h.id === c.id);
              return (
                <Link key={c.id} href={`/components/${c.id}`} className="group border-b border-r border-line p-4 hover:bg-paper-2">
                  <ComponentGlyph kind={c.kind} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                  <p className="mt-3 text-[0.78rem] leading-tight text-ink group-hover:text-vermilion">{seed?.name ?? c.id}</p>
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.06em] text-muted">{seed?.category ?? "optic"}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-[0.65rem] text-muted">
            Drawings are schematic, not product photographs. Catalogue numbers and exact specifications are recorded only
            where verified; otherwise the component is marked unverified.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Integrity                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-petrol text-paper">
        <div className="shell py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper/60">Scientific integrity</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.03] tracking-[-0.02em]">
                What this laboratory refuses to do.
              </h2>
              <p className="mt-4 max-w-md text-[0.8rem] leading-relaxed text-paper/70">
                A teaching platform earns trust by being explicit about what it does not know. These are constraints, not
                marketing claims.
              </p>
            </div>
            <ol className="divide-y divide-paper/15 border-t border-paper/15">
              {[
                ["Call a laser demonstration a single-photon experiment.", "Attenuated coherent light shows the same mathematics, but it is not a photon-counting measurement. The labels and the text say so."],
                ["Present a model output as a measurement.", "Simulated values are marked in every table, chart and exported CSV. The practical workspace is for your data."],
                ["Invent a part number, a specification or a citation.", "Unverified hardware is marked unverified. References carry DOIs only where the source is identified."],
                ["Hide an approximation behind a smooth animation.", "The model disclosure states the regime, the assumptions and what the simulation does not claim."]
              ].map(([title, body], i) => (
                <li key={i} className="grid gap-2 py-4 sm:grid-cols-[30px_1fr] sm:gap-4">
                  <span className="font-mono text-[0.6rem] text-paper/50">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[0.86rem] font-medium text-paper">{title}</p>
                    <p className="mt-1 max-w-xl text-[0.72rem] leading-relaxed text-paper/65">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Foundations                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="shell py-12 md:py-16">
        <div className="mb-6 border-t border-line pt-5">
          <p className="label mb-2 text-vermilion">Foundations</p>
          <h2 className="display-lg max-w-2xl">The mathematics is not a prerequisite. It is part of the experiment.</h2>
        </div>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-baseline justify-between border-b border-line pb-2">
              <h3 className="display-sm">Mathematics for experimental optics</h3>
              <Link href="/mathematics" className="arrow-link">Open →</Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {[
                "Complex numbers & phasors",
                "Vectors and matrices",
                "Maxwell and the wave equation",
                "Interference and coherence",
                "Gaussian beams & ABCD",
                "Fourier transforms",
                "Probability & least squares",
                "Hilbert spaces & Dirac notation",
                "Density matrices",
                "Polarization mathematics"
              ].map((c, i) => (
                <p key={c} className="flex gap-2 text-[0.72rem] text-ink-2">
                  <span className="font-mono text-[0.55rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {c}
                </p>
              ))}
            </div>
            <div className="mt-5 border border-line bg-paper-2 px-4 py-3">
              <p className="label mb-2 !text-[0.55rem]">From Maxwell to the bench</p>
              <div className="overflow-x-auto">
                <Eq>{String.raw`\nabla^2\mathbf{E} = \mu_0\varepsilon_0\,\frac{\partial^2\mathbf{E}}{\partial t^2}`}</Eq>
              </div>
              <p className="mt-2 text-[0.62rem] leading-relaxed text-muted">
                A wave equation with a transverse vector solution. Polarization, interference and the diffraction integral
                all follow from it; the bench tests the consequences.
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between border-b border-line pb-2">
              <h3 className="display-sm">Quantum mechanics for the experiments</h3>
              <Link href="/quantum-mechanics" className="arrow-link">Open →</Link>
            </div>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-2">
              The same interferometer, described with states and operators. Start with complex amplitudes and the Born
              rule, then move to density matrices, which-path information and complementarity — connected directly to the
              Mach–Zehnder, eraser, bomb tester and BB84 modules.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                ["States & superposition", "|ψ⟩ = α|0⟩ + β|1⟩"],
                ["Measurement", "p(k) = |⟨k|ψ⟩|²"],
                ["Unitary optics", "|ψ'⟩ = Û|ψ⟩"],
                ["Mixed states", "ρ = Σ pᵢ|ψᵢ⟩⟨ψᵢ|"],
                ["Complementarity", "D² + V² ≤ 1"],
                ["No-cloning", "⟨ψ|φ⟩ ≠ 0,1"]
              ].map(([label, formula]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 border-b border-line py-1.5">
                  <span className="text-[0.7rem] text-ink-2">{label}</span>
                  <span className="font-mono text-[0.62rem] text-petrol">{formula}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[0.65rem] leading-relaxed text-muted">
              Concepts are developed with interactive state visualisations, not asserted as facts to memorise.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Practice                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-line bg-paper-2/50">
        <div className="shell py-12 md:py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label mb-2 text-vermilion">After the beam</p>
              <h2 className="display-lg">Record it. Analyse it. Defend it.</h2>
            </div>
            <p className="max-w-[36ch] text-[0.7rem] leading-relaxed text-muted">
              A result is not a number on a screen. It is a dataset, an uncertainty and an argument.
            </p>
          </div>
          <div className="grid border-t border-line md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Practical mode",
                body: "Equipment checklist, alignment phases, editable observation tables, CSV import, experiment-specific calculations and a printable report. Raw values are never altered.",
                href: "/practical",
                link: "Enter practical mode"
              },
              {
                n: "02",
                title: "Data workspace",
                body: "Import a CSV, inspect distributions, fit a line or a sinusoid, examine residuals and propagate uncertainty. Export the fitted parameters with the dataset.",
                href: "/analysis",
                link: "Analyse a dataset"
              },
              {
                n: "03",
                title: "Notebook & examination",
                body: "Keep dated records locally, attach plots and export a report. Then test yourself with explained MCQs, numerical problems, viva practice and a timed paper.",
                href: "/notebook",
                link: "Open the notebook"
              }
            ].map((c, i) => (
              <div key={c.n} className={`py-5 md:px-7 ${i === 0 ? "md:pl-0" : ""} ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}`}>
                <p className="font-mono text-[0.6rem] text-vermilion">{c.n}</p>
                <h3 className="mt-2 display-sm">{c.title}</h3>
                <p className="mt-2 text-[0.76rem] leading-relaxed text-ink-2">{c.body}</p>
                <Link href={c.href} className="arrow-link mt-3 inline-flex">{c.link} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="shell py-14 md:py-20">
        <div className="grid items-end gap-8 border-t border-line pt-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="label mb-3 text-vermilion">Start where you are</p>
            <h2 className="display-xl max-w-[16ch]">A beam, two paths, and a question.</h2>
            <p className="mt-4 max-w-lg text-[0.85rem] leading-relaxed text-ink-2">
              Begin with the Michelson if you want fringes you can count. Begin with the bomb tester if you want the
              strangeness first. Every route ends with a measurement you can explain.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Link href="/experiments/michelson-interferometer" className="btn">Michelson interferometer</Link>
            <Link href="/experiments/quantum-bomb-tester" className="btn btn-ghost">Quantum bomb tester</Link>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
            {totalReferences} references · {totalEquations} equations · {totalQuestions} explained questions
          </p>
          <Link href="/progress" className="arrow-link">View your progress →</Link>
        </div>
      </section>
    </>
  );
}
