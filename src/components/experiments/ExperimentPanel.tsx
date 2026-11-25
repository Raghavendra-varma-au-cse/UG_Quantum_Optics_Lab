import Link from "next/link";
import type { ExperimentContent } from "@/lib/content/types";
import { SimulationHost } from "./SimulationHost";
import { Bench3D } from "@/components/three/Bench3D";
import { getHardware } from "@/lib/content/hardware";
import { Badge, EvidenceTag } from "@/components/ui/primitives";

export function ExperimentPanel({ content }: { content: ExperimentContent }) {
  return (
    <div className="shell py-8 md:py-10">
      {/* Provenance strip */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="label">Virtual bench</p>
          <EvidenceTag label="simulation" compact />
          <span className="text-[0.65rem] text-muted">
            Computed from the declared model. These are not laboratory measurements.
          </span>
        </div>
        <Link href={`/experiments/${content.slug}/practical/`} className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted hover:text-ink">
          Go to practical mode →
        </Link>
      </div>

      <SimulationHost slug={content.slug} />

      <div className="mt-5">
        <Bench3D slug={content.slug} />
      </div>

      {/* Model summary */}
      <div className="mt-5 grid gap-6 border border-line bg-paper-2 p-4 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="label mb-2">What the model does</p>
          <p className="max-w-2xl text-[0.78rem] leading-relaxed text-ink-2">{content.simulation.model}</p>
        </div>
        <div>
          <p className="label mb-2">Validity &amp; approximations</p>
          <ul className="space-y-1">
            {content.simulation.approximations.slice(0, 4).map((a, i) => (
              <li key={i} className="text-[0.7rem] leading-snug text-muted">
                — {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Procedure */}
      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-5">
          <div>
            <p className="label mb-1 text-vermilion">Practical procedure</p>
            <h2 className="display-md">From the virtual bench to the optical table</h2>
          </div>
          <span className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">{content.procedure.length} phases</span>
        </div>
        <p className="mb-6 max-w-2xl text-[0.82rem] leading-relaxed text-muted">
          The sequence below assumes a laser class appropriate to the kit and a properly rated optical table. Never rely on the simulation for safety: the physical beam is invisible or bright, and the rules are in the laboratory handbook.
        </p>
        <div className="space-y-0 border-t border-line">
          {content.procedure.map((phase, pi) => (
            <details key={phase.id} className="group border-b border-line" open={pi === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                <div className="flex gap-4">
                  <span className="mt-1 font-mono text-[0.62rem] text-vermilion">{String(pi + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[0.9rem] font-medium text-ink">{phase.title}</p>
                    {phase.purpose ? <p className="mt-0.5 text-[0.72rem] text-muted">{phase.purpose}</p> : null}
                  </div>
                </div>
                <span className="font-mono text-[0.9rem] text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <ol className="mb-5 ml-8 border-l border-line">
                {phase.steps.map((step, si) => (
                  <li key={si} className="relative pb-4 pl-5">
                    <span className="absolute -left-[3px] top-[6px] h-[5px] w-[5px] bg-line-strong" aria-hidden />
                    <p className="text-[0.82rem] font-medium text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[0.78rem] leading-relaxed text-ink-2">{step.detail}</p>
                    {step.checkpoint ? (
                      <p className="mt-1.5 flex gap-2 text-[0.7rem] text-petrol">
                        <span className="font-mono uppercase tracking-wide">Checkpoint</span>
                        {step.checkpoint}
                      </p>
                    ) : null}
                    {step.caution ? (
                      <p className="mt-1.5 flex gap-2 text-[0.7rem] text-vermilion">
                        <span className="font-mono uppercase tracking-wide">Caution</span>
                        {step.caution}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </section>

      {/* Observations */}
      <section className="mt-12">
        <div className="mb-5 border-t border-line pt-5">
          <p className="label mb-1 text-vermilion">What you record</p>
          <h2 className="display-md">Observation templates</h2>
          <p className="mt-2 max-w-2xl text-[0.8rem] leading-relaxed text-muted">
            These are blank laboratory templates, not results. Enter your own measurements in practical mode; simulated values are kept in a separate dataset.
          </p>
        </div>
        <div className="space-y-6">
          {content.observations.map((obs) => (
            <div key={obs.id} className="border border-line bg-paper-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
                <div>
                  <p className="text-[0.82rem] font-medium text-ink">{obs.title}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted">{obs.purpose}</p>
                </div>
                <span className="font-mono text-[0.58rem] uppercase tracking-wide text-muted">{obs.columns.length} columns</span>
              </div>
              <div className="overflow-x-auto">
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th className="w-8">#</th>
                      {obs.columns.map((c) => (
                        <th key={c.key} className={c.type === "number" ? "num" : ""}>
                          {c.label}
                          {c.unit ? <span className="ml-1 font-normal text-muted">[{c.unit}]</span> : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((n) => (
                      <tr key={n}>
                        <td className="font-mono text-[0.62rem] text-muted">{n}</td>
                        {obs.columns.map((c) => (
                          <td key={c.key} className="h-8 text-muted/40">—</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-line px-4 py-2.5 text-[0.7rem] leading-relaxed text-muted">{obs.guidance}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis + errors */}
      <section className="mt-12 grid gap-10 border-t border-line pt-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="label mb-1 text-vermilion">Analysis</p>
          <h2 className="display-md mb-4">From readings to a result</h2>
          <div className="divide-y divide-line border-t border-line">
            {content.analysis.map((a, i) => (
              <div key={a.id} className="py-3.5">
                <div className="flex gap-3">
                  <span className="mt-[2px] font-mono text-[0.6rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[0.82rem] font-medium text-ink">{a.title}</p>
                    <p className="mt-1 text-[0.76rem] leading-relaxed text-ink-2">{a.method}</p>
                    {a.formula ? <p className="mt-1 font-mono text-[0.7rem] text-petrol">{a.formula}</p> : null}
                    <ol className="mt-2 space-y-1">
                      {a.steps.map((s, si) => (
                        <li key={si} className="text-[0.7rem] leading-relaxed text-muted">
                          {si + 1}. {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-1 text-vermilion">Error budget</p>
          <h2 className="display-md mb-4">What limits the measurement</h2>
          <div className="divide-y divide-line border-t border-line">
            {content.errors.map((e, i) => (
              <div key={i} className="py-3">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="text-[0.78rem] font-medium text-ink">{e.source}</p>
                  <Badge tone={e.type === "systematic" ? "vermilion" : e.type === "random" ? "brass" : "slate"}>{e.type}</Badge>
                </div>
                <p className="text-[0.72rem] leading-relaxed text-ink-2">{e.effect}</p>
                <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">Mitigation: {e.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware */}
      <section className="mt-12 border-t border-line pt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label mb-1 text-vermilion">Apparatus</p>
            <h2 className="display-md">Components in this configuration</h2>
          </div>
          <Link href="/hardware" className="arrow-link">
            Hardware inventory →
          </Link>
        </div>
        <div className="overflow-x-auto border border-line">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Role</th>
                <th>Verification</th>
                <th className="hidden sm:table-cell">Function</th>
              </tr>
            </thead>
            <tbody>
              {content.hardware.map((ref) => {
                const item = getHardware(ref.itemId);
                return (
                  <tr key={`${ref.itemId}-${ref.role}`}>
                    <td>
                      <Link href={`/components/${ref.itemId}`} className="text-ink hover:text-vermilion">
                        {item?.name ?? ref.itemId}
                      </Link>
                      {ref.quantity ? <span className="ml-2 font-mono text-[0.6rem] text-muted">×{ref.quantity}</span> : null}
                    </td>
                    <td className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">{ref.role}</td>
                    <td>
                      <Badge tone={(item?.verification ?? "unverified") === "verified" ? "petrol" : (item?.verification ?? "unverified") === "partially-verified" ? "brass" : "vermilion"}>
                        {item?.verification ?? "unverified"}
                      </Badge>
                    </td>
                    <td className="hidden max-w-md text-[0.72rem] sm:table-cell">{item?.summary ?? "Configuration to be verified."}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
          Kit: {content.kit.name}. {content.kit.note}
        </p>
      </section>
    </div>
  );
}
