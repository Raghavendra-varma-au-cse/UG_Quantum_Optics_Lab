import type { Metadata } from "next";
import Link from "next/link";
import { HARDWARE_INVENTORY } from "@/lib/content/hardware";
import { ComponentLibrary } from "@/components/components/ComponentLibrary";

export const metadata: Metadata = {
  title: "Component library",
  description:
    "Optical and optomechanical components: working principle, typical specifications, alignment, common errors and the experiments that use them."
};

export default function ComponentsPage() {
  const optical = HARDWARE_INVENTORY.filter((i) => i.kind === "optical").length;
  const mech = HARDWARE_INVENTORY.filter((i) => i.kind === "optomechanical").length;
  const instr = HARDWARE_INVENTORY.filter((i) => i.kind === "instrument").length;
  const unverified = HARDWARE_INVENTORY.filter((i) => i.verification !== "verified").length;

  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Component &amp; optomechanics library</p>
          <h1 className="display-xl max-w-3xl">The apparatus, part by part.</h1>
          <p className="lede mt-5 max-w-2xl">
            A beam is only as good as the mount that holds the optic. Search every optical, optomechanical and detection
            component used in the laboratory: what it is, how it works internally, how to align it, what usually goes
            wrong, and which experiment depends on it.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 self-end">
          {[
            ["Optical", optical],
            ["Optomechanical", mech],
            ["Instruments", instr],
            ["Unverified entries", unverified]
          ].map(([label, value]) => (
            <div key={String(label)} className="border-t border-line pt-2">
              <p className="display-md">{value}</p>
              <p className="label mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 border-b border-line py-5 md:grid-cols-[1.4fr_1fr]">
        <p className="max-w-2xl text-[0.76rem] leading-relaxed text-muted">
          <span className="font-mono uppercase tracking-[0.08em] text-ink">Specification honesty.</span> Values marked
          “typical” are educational ranges, not datasheet limits. A part number is shown only when it has been checked
          against a label or manufacturer document. Everything else is a category and is marked unverified — including
          items this laboratory may not own.
        </p>
        <div className="flex flex-wrap gap-4 md:justify-end">
          <Link href="/hardware" className="arrow-link">Hardware inventory →</Link>
          <Link href="/instruments" className="arrow-link">Instrumentation →</Link>
        </div>
      </div>

      <div className="mt-6">
        <ComponentLibrary items={HARDWARE_INVENTORY} />
      </div>
    </div>
  );
}
