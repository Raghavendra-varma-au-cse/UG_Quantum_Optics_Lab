"use client";

import { useMemo, useState } from "react";
import { michelsonPattern, visibilityEnvelope, coherenceLength } from "@/lib/physics/interference";
import { IntensityCanvas } from "@/components/viz/IntensityCanvas";
import { Slider } from "@/components/ui/Controls";

/**
 * Hero instrument: a real Michelson calculation, not a decorative pattern.
 * The mirror displacement changes the optical path difference; the wavelength
 * changes the fringe order. The reported values are computed from the same
 * array that is drawn.
 */
export function HeroInterferometer() {
  const [deltaUm, setDeltaUm] = useState(60);
  const [wavelengthNm, setWavelengthNm] = useState(632.8);

  const lambda = wavelengthNm * 1e-9;
  const d = (deltaUm * 1e-6) / 2; // arm difference such that 2d = delta
  const opd = 2 * d;
  const order = opd / lambda;
  const lc = coherenceLength(lambda, 1e-9);
  const visibility = 0.96 * visibilityEnvelope(opd, lc);
  const samples = 168;

  const pattern = useMemo(
    () =>
      michelsonPattern({
        fieldM: 0.012,
        wavelengthM: lambda,
        armDifferenceM: d,
        tiltRad: 0,
        coherence: 0.97,
        coherenceLengthM: lc,
        balance: 0.98,
        envelope: 0.72,
        radialFocalM: 0.05,
        samples
      }),
    [lambda, d, lc]
  );

  return (
    <div className="border border-line-strong bg-paper-2">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <p className="flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink">
          <span className="inline-block h-[5px] w-[5px] animate-pulse bg-vermilion" aria-hidden />
          Live model · Michelson
        </p>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-muted">not a recording</p>
      </div>

      <div className="relative">
        <IntensityCanvas
          values={pattern}
          size={samples}
          colormap="mono"
          gain={1.15}
          className="aspect-square w-full"
          ariaLabel={`Simulated Michelson circular fringe pattern at ${wavelengthNm.toFixed(1)} nanometres and ${deltaUm.toFixed(2)} micrometres path difference`}
        />
        <div className="pointer-events-none absolute left-3 top-3 border border-white/20 bg-black/35 px-2 py-1 backdrop-blur-[2px]">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-white/75">circular fringes</p>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 text-right">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-white/60">2d / λ</p>
          <p className="font-mono text-[0.95rem] text-white/90">{order.toFixed(2)}</p>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-white/60">visibility</p>
          <p className="font-mono text-[0.95rem] text-white/90">{visibility.toFixed(3)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-line px-3 py-3">
        <Slider
          label="Mirror displacement 2d"
          value={deltaUm}
          min={-200}
          max={200}
          step={0.5}
          unit="µm"
          onChange={setDeltaUm}
          format={(v) => v.toFixed(1)}
        />
        <Slider
          label="Wavelength"
          value={wavelengthNm}
          min={430}
          max={700}
          step={0.1}
          unit="nm"
          onChange={setWavelengthNm}
          format={(v) => v.toFixed(1)}
        />
      </div>
      <p className="border-t border-line px-3 py-2 font-mono text-[0.55rem] leading-relaxed text-muted">
        I = I₁ + I₂ + 2√(I₁I₂)·V·cos(4πd/λ). One fringe = λ/2 of mirror travel.
      </p>
    </div>
  );
}
