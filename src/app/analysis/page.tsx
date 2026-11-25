import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisWorkspace } from "@/components/analysis/AnalysisWorkspace";

export const metadata: Metadata = {
  title: "Data analysis workspace",
  description: "Import experimental CSV data, inspect it, fit a line, examine residuals and export measurements with uncertainty."
};

export default function AnalysisPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Experimental data analysis</p>
          <h1 className="display-xl max-w-3xl">The number is not the result.</h1>
          <p className="lede mt-5 max-w-2xl">
            Import raw data, look at it before fitting it, examine the residuals and state an uncertainty. The workspace
            keeps the raw table intact and writes fitted parameters to a separate summary.
          </p>
        </div>
        <div className="self-end border border-line bg-paper-2 p-4">
          <p className="label mb-2">Workflow</p>
          <ol className="space-y-1.5">
            {[
              "Import or paste a CSV with a header row.",
              "Inspect ranges, missing values and outliers; do not delete without a reason.",
              "Fit only when the model is justified by the physics.",
              "Check residuals and repeat measurements.",
              "Export raw data and the fit separately."
            ].map((s, i) => (
              <li key={s} className="flex gap-2 text-[0.7rem] leading-relaxed text-ink-2">
                <span className="font-mono text-[0.55rem] text-vermilion">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="py-8">
        <AnalysisWorkspace />
      </div>

      <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-3">
        {[
          ["Experiment-specific calculations", "Michelson fringe counting, Malus fits, QBER, trap stiffness and Fourier period are also available inside each practical workspace.", "/practical"],
          ["Notebook", "Attach a dataset to a dated record, write the conclusion and export the report.", "/notebook"],
          ["Uncertainty", "Standard deviation, standard error, confidence intervals and propagation are implemented; systematic errors remain your responsibility.", "/experiments"]
        ].map(([title, body, href]) => (
          <div key={title}>
            <p className="label mb-1">{title}</p>
            <p className="text-[0.72rem] leading-relaxed text-muted">{body}</p>
            <Link href={href!} className="arrow-link mt-2 inline-flex">Open →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
