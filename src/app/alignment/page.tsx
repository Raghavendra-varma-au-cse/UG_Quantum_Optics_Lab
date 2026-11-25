import type { Metadata } from "next";
import Link from "next/link";
import { AlignmentTrainer } from "@/components/alignment/AlignmentTrainer";
import { OpticalDiagram } from "@/components/diagrams/OpticalDiagram";

export const metadata: Metadata = {
  title: "Optical alignment trainer",
  description:
    "Practise beam height, mirror steering, iris centring, focusing and interferometer alignment with computed ray paths and a diagnostic system."
};

const CHECKLIST = [
  ["Safety", "Laser class, eyewear, beam blocks, beam height below eye level, no reflective jewellery."],
  ["Structure", "Breadboard level; posts secure; clamps on; nothing overhanging the table edge."],
  ["Source", "Warm-up time; power and wavelength recorded; shutter closed unless observing."],
  ["Beam height", "Set with the source and two irises at the working height before any optic."],
  ["Rough path", "Steer with mirrors, not by sliding mounts sideways; keep incidence near the design angle."],
  ["Centring", "Two irises define the axis; adjust one degree of freedom at a time."],
  ["Focus", "Lens at the design distance; check the spot at the actual observation plane, not on a card."],
  ["Interference", "Equal arm lengths within coherence; overlap the beams; verify the dark port before counting."],
  ["Lock", "Tighten in the order adjusted; re-check the far iris after locking."],
  ["Record", "Photograph the layout; record component and mount positions in the notebook."]
];

const DIAGNOSTICS = [
  ["No light on the target", "Check shutter, source power, a beam block in the path, and the last mirror you touched."],
  ["Beam walks when you adjust the next mirror", "The two adjustments are not orthogonal in the plane you think; re-check the mirror orientation and the iris order."],
  ["Fringes visible but low contrast", "Unequal arm intensity, poor spatial overlap, path difference beyond coherence, or polarisation mismatch."],
  ["Fringes drift steadily", "Thermal expansion, air currents, table settling, or a mount that is not locked."],
  ["Fringes disappeared after inserting a polariser", "The beams are orthogonally polarised; rotate the polariser or add a half-wave plate to match."],
  ["Spot does not focus", "Lens at the wrong distance, aperture clipping, spherical aberration at high NA, or the beam is not collimated."]
];

export default function AlignmentPage() {
  return (
    <div className="shell py-10 md:py-14">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label mb-3 text-vermilion">Alignment trainer</p>
          <h1 className="display-xl max-w-3xl">The experiment begins before the measurement.</h1>
          <p className="lede mt-5 max-w-2xl">
            Most failed experiments are not physics failures. They are beam-height, centring, focus or coherence failures.
            This trainer computes the beam path from your adjustments and tells you which constraint you have violated.
          </p>
        </div>
        <div className="self-end border border-line bg-paper-2 p-4">
          <p className="label mb-2">The order that works</p>
          <p className="text-[0.76rem] leading-relaxed text-ink-2">
            Height → squareness → rough steering → two-iris centring → focus → overlap → coherence → measurement. Do not
            optimise a later stage to compensate for an earlier one.
          </p>
        </div>
      </div>

      <section className="py-8">
        <AlignmentTrainer />
      </section>

      <section className="grid gap-10 border-t border-line py-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <p className="label mb-2 text-vermilion">Procedure</p>
          <h2 className="display-md mb-4">Alignment checklist</h2>
          <ol className="border-t border-line">
            {CHECKLIST.map(([title, body], i) => (
              <li key={title} className="grid gap-1 border-b border-line py-2.5 sm:grid-cols-[108px_1fr] sm:gap-4">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.06em] text-ink">{String(i + 1).padStart(2, "0")} · {title}</p>
                <p className="text-[0.75rem] leading-relaxed text-ink-2">{body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="label mb-2 text-vermilion">Diagnosis</p>
          <h2 className="display-md mb-4">When the expected observation is absent</h2>
          <div className="divide-y divide-line border-t border-line">
            {DIAGNOSTICS.map(([symptom, cause]) => (
              <div key={symptom} className="py-3">
                <p className="text-[0.78rem] font-medium text-ink">{symptom}</p>
                <p className="mt-1 text-[0.72rem] leading-relaxed text-muted">{cause}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="border border-line">
            <OpticalDiagram kind="optical-table" />
            <p className="border-t border-line px-4 py-2 text-[0.66rem] text-muted">
              A 25 mm hole grid is a coordinate system, not a suggestion. Record positions relative to it.
            </p>
          </div>
          <div className="self-center">
            <h2 className="display-md">What the trainer does not model</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Wavefront aberration and lens aberrations beyond the paraxial envelope.",
                "Polarisation-dependent losses at dielectric coatings.",
                "Thermal drift and table vibration; these must be observed on the real bench.",
                "Safety. A simulated beam cannot burn a retina; a real one can."
              ].map((s) => (
                <li key={s} className="flex gap-3 text-[0.78rem] leading-relaxed text-ink-2">
                  <span className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-vermilion" />
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link href="/instruments" className="arrow-link">Instrumentation →</Link>
              <Link href="/experiments/michelson-interferometer/experiment/" className="arrow-link">Michelson bench →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
