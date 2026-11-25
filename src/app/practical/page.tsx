import type { Metadata } from "next";
import Link from "next/link";
import { EXPERIMENTS } from "@/lib/content/registry";
import { EXPERIMENT_CONTENT } from "@/lib/content";
import { EvidenceTag } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Practical laboratory mode",
  description:
    "Equipment checklists, alignment procedures, measurement tables, CSV import, experiment-specific calculations and printable reports for all eight experiments."
};

export default function PracticalPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Practical mode</p>
          <h1 className="display-xl max-w-3xl">The part that happens on the table.</h1>
          <p className="lede mt-5 max-w-2xl">
            A checklist you can actually work through, blank observation templates, CSV import, a fit with residuals and a
            report that keeps your raw numbers intact. Simulated data is labelled in every export.
          </p>
        </div>
        <div className="self-end border border-vermilion/40 bg-vermilion-soft/20 p-4">
          <p className="label mb-2 !text-vermilion">Before you start</p>
          <p className="text-[0.75rem] leading-relaxed text-ink-2">
            Confirm the laser class, wavelength and eyewear with the supervisor. Verify the kit against the inventory. A
            simulation cannot tell you whether the beam is safely contained.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="label mb-3">Choose an experiment</p>
          <div className="border-t border-line">
            {EXPERIMENTS.map((e) => {
              const content = EXPERIMENT_CONTENT[e.slug];
              const steps = content.procedure.reduce((s, p) => s + p.steps.length, 0);
              return (
                <Link
                  key={e.slug}
                  href={`/experiments/${e.slug}/practical/`}
                  className="group grid grid-cols-[42px_1fr_auto] items-baseline gap-3 border-b border-line py-3 hover:bg-paper-2"
                >
                  <span className="font-mono text-[0.62rem] text-muted">{e.number}</span>
                  <div>
                    <p className="text-[0.82rem] text-ink group-hover:text-vermilion">{e.title}</p>
                    <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-muted">
                      {content.hardware.length} components · {steps} steps · {content.observations.length} templates
                    </p>
                  </div>
                  <EvidenceTag label={content.evidence.implementation} compact />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="border border-line bg-paper-2 p-4">
            <p className="label mb-2">What is in a practical session</p>
            <ol className="space-y-2">
              {[
                "Equipment checklist with verification status and links to the component library.",
                "Phase-by-phase procedure with checkpoints and safety cautions.",
                "Editable observation tables with units and a provenance switch.",
                "CSV import that preserves raw values and reports mismatches.",
                "Linear regression, residuals, column statistics and a specialised calculator.",
                "Print/PDF, HTML, Markdown and CSV export; save to the notebook."
              ].map((s, i) => (
                <li key={s} className="flex gap-2 text-[0.73rem] leading-relaxed text-ink-2">
                  <span className="font-mono text-[0.55rem] text-vermilion">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="border border-line bg-paper-2 p-4">
            <p className="label mb-2">Data integrity</p>
            <p className="text-[0.73rem] leading-relaxed text-muted">
              The workspace never fills a blank cell, never removes an outlier silently and never mixes a model output with
              your measurement. If you import a file, the raw text is kept and the numeric interpretation is separate.
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <Link href="/analysis" className="arrow-link">Full analysis workspace →</Link>
              <Link href="/notebook" className="arrow-link">Notebook →</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-6 border-t border-line pt-6 md:grid-cols-3">
        {[
          ["Practical examination", "You are given a component set and an outcome. Identify the optics, align the path, choose the measurement and defend the uncertainty."],
          ["Report standard", "Objectives, apparatus, procedure, raw data, analysis, uncertainty, error discussion and conclusion. Every figure has axes and units."],
          ["Safety", "Laser safety is not a checkbox. Beam blocks, eyewear, controlled access and a written risk assessment precede the first measurement."]
        ].map(([title, body]) => (
          <div key={title}>
            <p className="label mb-1">{title}</p>
            <p className="text-[0.73rem] leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
