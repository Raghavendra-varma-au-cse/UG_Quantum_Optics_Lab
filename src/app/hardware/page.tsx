import type { Metadata } from "next";
import Link from "next/link";
import { HARDWARE_INVENTORY, HARDWARE_CATEGORIES } from "@/lib/content/hardware";
import { EXPERIMENTS } from "@/lib/content/registry";
import { EXPERIMENT_CONTENT } from "@/lib/content";
import { Badge, EvidenceTag } from "@/components/ui/primitives";
import { ComponentThumb } from "@/components/components/ComponentThumb";

export const metadata: Metadata = {
  title: "Hardware inventory",
  description:
    "The laboratory's optical, optomechanical and detection inventory, with a verification status for every configuration."
};

const VERIFICATION = [
  {
    key: "verified",
    title: "Verified",
    body: "Checked against the physical label or a manufacturer document. A part number may be quoted."
  },
  {
    key: "partially-verified",
    title: "Partially verified",
    body: "The category is confirmed but the exact model, coating or accessory is not. Values are typical, not datasheet limits."
  },
  {
    key: "unverified",
    title: "Unverified",
    body: "A plausible teaching-laboratory item or a simulation-only device. Presence, model and specification must be confirmed before use."
  }
];

export default function HardwarePage() {
  const counts = {
    total: HARDWARE_INVENTORY.length,
    verified: HARDWARE_INVENTORY.filter((i) => i.verification === "verified").length,
    partial: HARDWARE_INVENTORY.filter((i) => i.verification === "partially-verified").length,
    unverified: HARDWARE_INVENTORY.filter((i) => i.verification === "unverified").length
  };

  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Hardware inventory · provenance first</p>
          <h1 className="display-xl max-w-3xl">What is actually on the table.</h1>
          <p className="lede mt-5 max-w-2xl">
            The laboratory does not assume that every experiment uses the same kit, that a catalogue number is known, or
            that a demonstration is a single-photon measurement. Each configuration carries a verification label and each
            component states its role.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 self-end">
          {[
            ["Entries", counts.total],
            ["Verified", counts.verified],
            ["Partial", counts.partial],
            ["Unverified", counts.unverified]
          ].map(([label, value]) => (
            <div key={String(label)} className="border-t border-line pt-2">
              <p className="display-md">{value}</p>
              <p className="label mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="border-b border-line py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {VERIFICATION.map((v) => (
            <div key={v.key}>
              <div className="mb-2 flex items-center gap-2">
                <Badge tone={v.key === "verified" ? "petrol" : v.key === "partially-verified" ? "brass" : "vermilion"}>{v.title}</Badge>
              </div>
              <p className="text-[0.74rem] leading-relaxed text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Per-experiment configurations */}
      <section className="py-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label mb-2 text-vermilion">Configurations</p>
            <h2 className="display-md">Each experiment, its kit and its evidence label</h2>
          </div>
          <p className="max-w-[38ch] text-[0.68rem] leading-relaxed text-muted">
            The kit model is a field to be completed from the physical label and packing list. A model number is never
            inferred from a website.
          </p>
        </div>
        <div className="overflow-x-auto border border-line">
          <table className="lab-table min-w-[760px]">
            <thead>
              <tr>
                <th>No.</th>
                <th>Experiment</th>
                <th>Evidence label</th>
                <th>Kit / configuration</th>
                <th>Verification</th>
                <th className="num">Unique items</th>
              </tr>
            </thead>
            <tbody>
              {EXPERIMENTS.map((e) => {
                const content = EXPERIMENT_CONTENT[e.slug];
                return (
                  <tr key={e.slug}>
                    <td className="font-mono text-[0.65rem] text-muted">{e.number}</td>
                    <td>
                      <Link href={`/experiments/${e.slug}`} className="text-ink hover:text-vermilion">{e.title}</Link>
                    </td>
                    <td><EvidenceTag label={content.evidence.implementation} compact /></td>
                    <td className="max-w-[260px] text-[0.7rem]">{content.kit.name}</td>
                    <td>
                      <Badge tone={content.kit.verification === "verified" ? "petrol" : content.kit.verification === "partially-verified" ? "brass" : "vermilion"}>
                        {content.kit.verification}
                      </Badge>
                    </td>
                    <td className="num text-[0.7rem]">{new Set(content.hardware.map((h) => h.itemId)).size}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Full inventory */}
      <section className="py-6">
        <div className="mb-4 flex items-end justify-between gap-4 border-t border-line pt-5">
          <div>
            <p className="label mb-2 text-vermilion">Database</p>
            <h2 className="display-md">Full inventory</h2>
          </div>
          <Link href="/components" className="arrow-link">Searchable library →</Link>
        </div>
        <div className="grid gap-x-10 gap-y-0 md:grid-cols-2">
          {HARDWARE_CATEGORIES.map((category) => {
            const items = HARDWARE_INVENTORY.filter((i) => i.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} className="border-t border-line py-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink">{category}</p>
                  <span className="font-mono text-[0.58rem] text-muted">{items.length}</span>
                </div>
                <ul>
                  {items.map((i) => (
                    <li key={i.id} className="border-b border-line/70 py-1.5">
                      <Link href={`/components/${i.id}`} className="group flex items-baseline justify-between gap-3">
                        <span className="flex items-baseline gap-2 text-[0.72rem] text-ink-2 group-hover:text-vermilion">
                          <span className={`inline-block h-[4px] w-[4px] shrink-0 ${i.verification === "verified" ? "bg-petrol" : i.verification === "partially-verified" ? "bg-brass" : "bg-vermilion"}`} />
                          {i.name}
                        </span>
                        <span className="font-mono text-[0.55rem] text-muted">{i.verification === "verified" ? "verified" : i.verification === "partially-verified" ? "partial" : "unverified"}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-8 border-t border-line pt-6 md:grid-cols-2">
        <div>
          <p className="label mb-2 text-vermilion">What this inventory does not claim</p>
          <ul className="space-y-2">
            {[
              "That every listed item is currently owned by the laboratory.",
              "That a generic manufacturer name implies a specific catalogue product.",
              "That a specification is a guaranteed datasheet value rather than a typical educational range.",
              "That an experiment labelled ‘simulation’ can be performed with the listed hardware without a source, detector and coincidence upgrade."
            ].map((s) => (
              <li key={s} className="flex gap-3 text-[0.76rem] leading-relaxed text-ink-2">
                <span className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-vermilion" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-line bg-paper-2 p-4">
          <p className="label mb-2">Before the session</p>
          <ol className="space-y-2">
            {[
              "Photograph the kit label and packing list.",
              "Match each item to this inventory and change its verification status.",
              "Record the laser class, wavelength, power and detector model.",
              "Attach the model-specific manufacturer procedure to the notebook record.",
              "Only then rely on the alignment sequence and expected observations."
            ].map((s, i) => (
              <li key={s} className="flex gap-2 text-[0.72rem] leading-relaxed text-ink-2">
                <span className="font-mono text-[0.58rem] text-vermilion">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:grid-cols-4">
        {HARDWARE_INVENTORY.slice(0, 4).map((i) => (
          <Link key={i.id} href={`/components/${i.id}`} className="flex items-center gap-3 border border-line p-2.5 hover:border-ink">
            <ComponentThumb category={i.category} name={i.name} />
            <span className="text-[0.68rem] leading-snug text-ink-2">{i.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
