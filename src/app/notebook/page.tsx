import type { Metadata } from "next";
import { NotebookWorkspace } from "@/components/notebook/NotebookWorkspace";

export const metadata: Metadata = {
  title: "Laboratory notebook",
  description: "Local-first experiment records: objectives, apparatus, raw measurements, uncertainty, conclusion and export."
};

export default function NotebookPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="mb-8 grid gap-6 border-b border-line pb-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Laboratory notebook</p>
          <h1 className="display-xl max-w-3xl">A record that survives the viva.</h1>
          <p className="lede mt-4 max-w-2xl">
            Date every record. Keep the apparatus, the raw values, the calculation, the uncertainty and the conclusion in
            one place — with simulated data labelled.
          </p>
        </div>
        <div className="self-end border border-line bg-paper-2 p-4">
          <p className="label mb-2">Local-first by design</p>
          <p className="text-[0.74rem] leading-relaxed text-ink-2">
            Records are stored in this browser with IndexedDB. No account, no upload. Export JSON, Markdown or a printable
            PDF before clearing site data or changing machine.
          </p>
        </div>
      </div>
      <NotebookWorkspace />
    </div>
  );
}
