import Link from "next/link";
import { EXPERIMENTS } from "@/lib/content/registry";

export function SiteFooter() {
  return (
    <footer className="relative z-[1] mt-24 border-t border-line bg-paper-3/40">
      <div className="shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-[1.6rem] leading-tight text-ink">Quantum Optics Laboratory</p>
            <p className="mt-3 max-w-sm text-[0.75rem] leading-relaxed text-muted">
              An undergraduate teaching laboratory for experimental quantum optics: verified content, physical
              simulations, measurement analysis and honest provenance.
            </p>
            <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
              No login · local-first · exportable data
            </p>
          </div>
          <div>
            <p className="label mb-3">Experiments</p>
            <ul className="space-y-1.5">
              {EXPERIMENTS.slice(0, 5).map((e) => (
                <li key={e.slug}>
                  <Link href={`/experiments/${e.slug}`} className="text-[0.75rem] text-ink-2 hover:text-vermilion">
                    {e.number} — {e.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-3">Continue</p>
            <ul className="space-y-1.5">
              {EXPERIMENTS.slice(5).map((e) => (
                <li key={e.slug}>
                  <Link href={`/experiments/${e.slug}`} className="text-[0.75rem] text-ink-2 hover:text-vermilion">
                    {e.number} — {e.shortTitle}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/experiments" className="text-[0.75rem] text-ink hover:underline">
                  All experiments
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="label mb-3">Reference</p>
            <ul className="space-y-1.5">
              {[
                ["/hardware", "Hardware inventory"],
                ["/components", "Component library"],
                ["/mathematics", "Mathematics"],
                ["/quantum-mechanics", "Quantum mechanics"],
                ["/instruments", "Instrumentation"],
                ["/alignment", "Alignment trainer"],
                ["/validation", "Scientific validation"],
                ["/notebook", "Notebook"],
                ["/exam", "Examination"]
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href!} className="text-[0.75rem] text-ink-2 hover:text-vermilion">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-line pt-5 md:grid-cols-[1fr_auto]">
          <p className="max-w-3xl text-[0.65rem] leading-relaxed text-muted">
            <strong className="font-medium text-ink-2">Scientific provenance.</strong> Simulations are computed from the
            models disclosed with each experiment. Values are not measurements. Hardware part numbers are recorded only
            where a manufacturer document or the physical kit label has been checked; unconfirmed configurations are
            marked <em>unverified</em>. Thorlabs® is a trademark of Thorlabs, Inc.; this independent teaching resource is
            not affiliated with or endorsed by Thorlabs.
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted md:text-right">
            Educational use · v1.0
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4">
          <a
            href="https://github.com/Raghavendra-varma-au-cse/UG_Quantum_Optics_Lab"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted hover:text-ink"
          >
            Source on GitHub ↗
          </a>
          <a
            href="https://raghavendra-varma-au-cse.github.io/UG_Quantum_Optics_Lab/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted hover:text-ink"
          >
            Live laboratory ↗
          </a>
          <a
            href="https://github.com/Raghavendra-varma-au-cse/UG_Quantum_Optics_Lab/actions/workflows/deploy.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted hover:text-ink"
          >
            Deployment ↗
          </a>
          <Link href="/validation" className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted hover:text-ink">
            Validation
          </Link>
          <a
            href="https://github.com/Raghavendra-varma-au-cse/UG_Quantum_Optics_Lab/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted hover:text-ink md:ml-auto"
          >
            MIT licence
          </a>
        </div>
      </div>
    </footer>
  );
}
