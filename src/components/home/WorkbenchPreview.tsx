"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { stateFor, type Basis } from "@/lib/physics/qkd";
import { createRng, randBit } from "@/lib/physics/rng";
import { jonesFromAngles, stokesFromJones, fieldVector, polarizationEllipse } from "@/lib/physics/polarization";
import { michelsonPattern } from "@/lib/physics/interference";
import { IntensityCanvas } from "@/components/viz/IntensityCanvas";
import { Slider, Toggle, SegmentedControl } from "@/components/ui/Controls";

type Mode = "interference" | "polarization" | "bb84";

const TABS: { id: Mode; label: string }[] = [
  { id: "interference", label: "Interference" },
  { id: "polarization", label: "Polarization" },
  { id: "bb84", label: "Key distribution" }
];

export function WorkbenchPreview() {
  const [mode, setMode] = useState<Mode>("interference");
  const [tilt, setTilt] = useState(0.22);
  const [analyzer, setAnalyzer] = useState(45);
  const [delay, setDelay] = useState(90);
  const [eve, setEve] = useState(false);

  const fringes = useMemo(
    () =>
      michelsonPattern({
        fieldM: 0.01,
        wavelengthM: 632.8e-9,
        armDifferenceM: 0,
        tiltRad: tilt * 1e-4,
        coherence: 0.95,
        coherenceLengthM: 0.2,
        balance: 0.98,
        envelope: 0.8,
        samples: 140
      }),
    [tilt]
  );

  const jones = useMemo(() => jonesFromAngles(0, 0), []);
  const stokes = stokesFromJones(jones);
  const ellipse = polarizationEllipse(jones);
  const malus = Math.cos((analyzer * Math.PI) / 180) ** 2;
  const field = fieldVector(jones, 0.6);

  const bits = useMemo(() => {
    const rng = createRng("home-bb84-preview");
    return Array.from({ length: 16 }, () => {
      const bit = randBit(rng);
      const basis: Basis = randBit(rng);
      const bobBasis: Basis = randBit(rng);
      const eveBasis: Basis = eve ? randBit(rng) : basis;
      const eveBit = eve ? (eveBasis === basis ? bit : randBit(rng)) : bit;
      const measured = eve ? (bobBasis === eveBasis ? eveBit : randBit(rng)) : bobBasis === basis ? bit : randBit(rng);
      return {
        bit,
        basis,
        bobBasis,
        state: stateFor(bit, basis) as "H" | "V" | "D" | "A",
        measured: measured as 0 | 1,
        sifted: bobBasis === basis,
        error: bobBasis === basis && measured !== bit
      };
    });
  }, [eve]);

  const sifted = bits.filter((b) => b.sifted);
  const qber = sifted.length ? (sifted.filter((b) => b.error).length / sifted.length) * 100 : 0;

  return (
    <div className="border border-line-strong bg-paper-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3 py-2.5">
        <p className="label !text-[0.58rem]">Three benches, running</p>
        <div className="seg" role="group" aria-label="Preview experiment">
          {TABS.map((t) => (
            <button key={t.id} type="button" aria-pressed={mode === t.id} onClick={() => setMode(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1.15fr_1fr]">
        <div className="border-b border-line p-3 md:border-b-0 md:border-r">
          {mode === "interference" ? (
            <div>
              <div className="viz-frame aspect-[4/3]">
                <IntensityCanvas values={fringes} size={140} colormap="mono" gain={1.1} className="h-full w-full" ariaLabel="Simulated straight interference fringes" />
              </div>
              <p className="mt-2 font-mono text-[0.58rem] text-muted">Tilt mirror: Δx = λ / 2α</p>
            </div>
          ) : null}

          {mode === "polarization" ? (
            <div>
              <div className="relative flex aspect-[4/3] items-center justify-center bg-[#121210]">
                <svg viewBox="-100 -100 200 200" className="h-full w-full" role="img" aria-label="Polarization ellipse and rotating electric field vector">
                  <circle cx={0} cy={0} r={78} fill="none" stroke="#3a3a34" strokeWidth="0.6" />
                  <line x1={-88} y1={0} x2={88} y2={0} stroke="#3a3a34" strokeWidth="0.5" />
                  <line x1={0} y1={-88} x2={0} y2={88} stroke="#3a3a34" strokeWidth="0.5" />
                  <ellipse
                    cx={0}
                    cy={0}
                    rx={70 * ellipse.major}
                    ry={70 * ellipse.minor}
                    fill="none"
                    stroke="#e9e4d8"
                    strokeWidth="1"
                    transform={`rotate(${-ellipse.angleDeg})`}
                  />
                  <line x1={0} y1={0} x2={field.x * 70} y2={-field.y * 70} stroke="#C43B2A" strokeWidth="2" />
                  <circle cx={field.x * 70} cy={-field.y * 70} r={3} fill="#C43B2A" />
                  <text x={-92} y={-82} fill="#8f8a7c" fontSize="7" fontFamily="monospace">
                    E(t) in the transverse plane
                  </text>
                </svg>
              </div>
              <p className="mt-2 font-mono text-[0.58rem] text-muted">I = I₀ cos²θ = {malus.toFixed(3)} I₀</p>
            </div>
          ) : null}

          {mode === "bb84" ? (
            <div>
              <div className="min-h-[220px] bg-[#121210] p-3">
                <div className="grid grid-cols-8 gap-x-2 gap-y-3">
                  {bits.map((b, i) => (
                    <div key={i} className="text-center">
                      <p className={`font-mono text-[0.62rem] ${b.error ? "text-[#e06a4f]" : b.sifted ? "text-[#9fd3c4]" : "text-[#8f8a7c]"}`}>{b.state}</p>
                      <p className="font-mono text-[0.45rem] text-[#6f6a5e]">{b.basis === 0 ? "Z" : "X"}/{b.bobBasis === 0 ? "Z" : "X"}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#2e2e28] pt-2">
                  <span className="font-mono text-[0.5rem] uppercase tracking-wide text-[#8f8a7c]">sifted {sifted.length}/16</span>
                  <span className={`font-mono text-[0.6rem] ${qber > 11 ? "text-[#e06a4f]" : "text-[#9fd3c4]"}`}>QBER {qber.toFixed(1)}%</span>
                </div>
              </div>
              <p className="mt-2 font-mono text-[0.58rem] text-muted">Intercept–resend leaves a 25% error signature.</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-between p-4">
          {mode === "interference" ? (
            <>
              <div>
                <p className="label mb-2">Michelson · straight fringes</p>
                <p className="text-[0.8rem] leading-relaxed text-ink-2">
                  A tilt turns the circular Haidinger fringes into parallel bands. Count them while moving a mirror and
                  you have measured a wavelength with a ruler and a micrometer.
                </p>
                <div className="mt-4">
                  <Slider label="Mirror tilt" value={tilt} min={0} max={1.2} step={0.01} unit="×10⁻⁴ rad" onChange={setTilt} format={(v) => v.toFixed(2)} />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                <div>
                  <p className="label !text-[0.55rem]">spacing</p>
                  <p className="num text-[0.85rem]">{(632.8e-9 / (2 * tilt * 1e-4)) * 1e3 < 0.01 ? "—" : `${((632.8e-9 / (2 * tilt * 1e-4)) * 1e3).toFixed(2)} mm`}</p>
                </div>
                <a href="/experiments/michelson-interferometer" className="arrow-link">
                  Open →
                </a>
              </div>
            </>
          ) : null}

          {mode === "polarization" ? (
            <>
              <div>
                <p className="label mb-2">Polarizer · analyzer</p>
                <p className="text-[0.8rem] leading-relaxed text-ink-2">
                  Cross two polarizers and the field should vanish. The residual is the extinction ratio — a real number,
                  measured, not assumed.
                </p>
                <div className="mt-4">
                  <Slider label="Analyzer angle" value={analyzer} min={0} max={180} step={1} unit="°" onChange={setAnalyzer} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
                  <span className="label !text-[0.55rem]">state</span>
                  <span className="font-mono text-[0.68rem] text-ink">H · S₁={stokes.S1.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <p className="font-mono text-[0.6rem] text-muted">{ellipse.handedness}</p>
                <a href="/experiments/polarization-3d-cinema" className="arrow-link">Open →</a>
              </div>
            </>
          ) : null}

          {mode === "bb84" ? (
            <>
              <div>
                <p className="label mb-2">BB84 · 16 photons</p>
                <p className="text-[0.8rem] leading-relaxed text-ink-2">
                  Alice encodes random bits in two incompatible bases. Bob guesses. Eve makes the error rate climb.
                </p>
                <div className="mt-4">
                  <Toggle label="Eve intercepts every photon" checked={eve} onChange={setEve} hint="Intercept–resend attack; errors appear only after sifting." />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                <p className="font-mono text-[0.58rem] text-muted">threshold 11%</p>
                <a href="/experiments/quantum-key-distribution" className="arrow-link">Open →</a>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <motion.div layout className="border-t border-line px-3 py-2">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-muted">
          Interactive preview · full bench, measurement tools and procedure inside each experiment
        </p>
      </motion.div>
    </div>
  );
}
