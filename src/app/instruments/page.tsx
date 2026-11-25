import type { Metadata } from "next";
import Link from "next/link";
import { INSTRUMENTS } from "@/lib/content/instruments";
import { Badge } from "@/components/ui/primitives";
import { OscilloscopeDemo } from "@/components/instruments/OscilloscopeDemo";
import { EXPERIMENTS } from "@/lib/content/registry";

export const metadata: Metadata = {
  title: "Instrumentation & measurement",
  description:
    "How photodiodes, SPADs, oscilloscopes, power meters, cameras and positioning systems work, and how their output connects to the physics."
};

export default function InstrumentsPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Instrumentation &amp; measurement</p>
          <h1 className="display-xl max-w-3xl">What the instrument actually measures.</h1>
          <p className="lede mt-5 max-w-2xl">
            A detector does not return “intensity”. It returns a current, a voltage, a count rate or a digital number.
            Understanding the conversion chain is part of the experiment — and so is its noise, bandwidth and calibration.
          </p>
        </div>
        <div className="self-end border border-line bg-paper-2 p-4">
          <p className="label mb-2">The distinction that matters</p>
          <p className="text-[0.76rem] leading-relaxed text-ink-2">
            A photodiode plus transimpedance amplifier measures <span className="font-medium text-ink">optical power</span>.
            A single-photon avalanche diode plus a time tagger measures <span className="font-medium text-ink">detection events</span>.
            They are not interchangeable, and a photodiode cannot count photons.
          </p>
        </div>
      </div>

      <section className="py-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="label mb-1 text-vermilion">Simulated instrument face</p>
            <h2 className="display-md">Signal, noise and bandwidth</h2>
          </div>
          <p className="max-w-[36ch] text-right text-[0.66rem] leading-relaxed text-muted">
            Change the power and gain; watch the trace and the SNR. The model includes shot and thermal noise.
          </p>
        </div>
        <OscilloscopeDemo />
      </section>

      <section className="border-t border-line py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="label mb-1 text-vermilion">Reference</p>
            <h2 className="display-md">Instruments in the laboratory</h2>
          </div>
          <p className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">{INSTRUMENTS.length} entries</p>
        </div>

        <div className="space-y-3">
          {INSTRUMENTS.map((inst, i) => (
            <details key={inst.id} id={inst.id} className="group scroll-mt-28 border border-line bg-paper-2">
              <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <div className="flex gap-3">
                  <span className="mt-[3px] font-mono text-[0.6rem] text-vermilion">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[0.84rem] font-medium text-ink">{inst.name}</p>
                    <p className="mt-0.5 max-w-2xl text-[0.7rem] leading-relaxed text-muted">{inst.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{inst.category}</Badge>
                  <span className="font-mono text-[0.9rem] text-muted transition-transform group-open:rotate-45">+</span>
                </div>
              </summary>
              <div className="grid gap-6 border-t border-line px-4 py-4 md:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="label mb-1">Internal working principle</p>
                  <p className="text-[0.78rem] leading-relaxed text-ink-2">{inst.principle}</p>
                  <p className="label mb-1 mt-4">Measurement procedure</p>
                  <ol className="space-y-1">
                    {inst.measurementProcedure.map((s, si) => (
                      <li key={si} className="text-[0.72rem] leading-relaxed text-ink-2">{si + 1}. {s}</li>
                    ))}
                  </ol>
                  <p className="label mb-1 mt-4">Noise sources</p>
                  <ul className="space-y-1">
                    {inst.noise.map((s) => (
                      <li key={s} className="text-[0.72rem] leading-relaxed text-muted">— {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label mb-1">Typical specifications</p>
                  <dl className="divide-y divide-line border-t border-line">
                    {inst.specs.map((s) => (
                      <div key={s.label} className="flex items-baseline justify-between gap-3 py-1.5">
                        <dt className="text-[0.68rem] text-muted">{s.label}</dt>
                        <dd className="text-right font-mono text-[0.66rem] text-ink">
                          {s.value}{s.typical ? <span className="ml-1 text-[0.52rem] uppercase text-brass">typ.</span> : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="label mb-1 mt-4">Calibration</p>
                  <ul className="space-y-1">
                    {inst.calibration.map((s) => (
                      <li key={s} className="text-[0.72rem] leading-relaxed text-ink-2">— {s}</li>
                    ))}
                  </ul>
                  <p className="label mb-1 mt-4">Common errors</p>
                  <ul className="space-y-1">
                    {inst.commonErrors.map((s) => (
                      <li key={s} className="text-[0.72rem] leading-relaxed text-muted">— {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-4 py-2.5">
                <span className="font-mono text-[0.58rem] uppercase tracking-wide text-muted">Connects to</span>
                {inst.links.map((l) => (
                  <span key={l} className="text-[0.68rem] text-ink-2">{l}</span>
                ))}
                {inst.docUrl ? (
                  <a href={inst.docUrl} target="_blank" rel="noopener noreferrer" className="ml-auto font-mono text-[0.6rem] text-muted hover:text-vermilion">
                    manufacturer library ↗
                  </a>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 border-t border-line pt-6 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="label mb-2">Where the signal chain appears</p>
          <div className="flex flex-wrap gap-2">
            {EXPERIMENTS.map((e) => (
              <Link key={e.slug} href={`/experiments/${e.slug}/experiment/`} className="border border-line px-2 py-1 text-[0.68rem] text-ink-2 hover:border-ink">
                {e.shortTitle}
              </Link>
            ))}
          </div>
        </div>
        <div className="border border-line bg-paper-2 p-4">
          <p className="label mb-2">Read the chain</p>
          <p className="text-[0.74rem] leading-relaxed text-muted">
            Optical power → photocurrent → transimpedance voltage → oscilloscope or ADC → sampled numbers. Every stage has
            a gain, a bandwidth and a noise contribution. The experiment page for each module states which detector is
            assumed.
          </p>
        </div>
      </section>
    </div>
  );
}
