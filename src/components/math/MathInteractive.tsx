"use client";

import { useMemo, useState } from "react";
import { Slider, SegmentedControl } from "@/components/ui/Controls";
import { jonesFromAngles, stokesFromJones, polarizationEllipse, classifyPolarization } from "@/lib/physics/polarization";
import { rayleighRange, beamRadius } from "@/lib/physics/gaussian";
import { createRng, randNormal } from "@/lib/physics/rng";
import { mean, sem } from "@/lib/physics/stats";

type Interactive = "superposition" | "jones" | "gaussian" | "fourier" | "uncertainty" | "density" | "abcd";

const num = (v: number): string => (Number.isFinite(v) ? v.toFixed(2) : "0");

function Frame({ label, children, readout }: { label: string; children: React.ReactNode; readout: React.ReactNode }) {
  return (
    <div className="my-6 border border-line bg-paper-2">
      <div className="border-b border-line px-3 py-2">
        <p className="label !text-[0.58rem]">Interactive · {label}</p>
      </div>
      <div className="p-3">{children}</div>
      <div className="border-t border-line px-3 py-2">{readout}</div>
    </div>
  );
}

function Readout({ items }: { items: [string, string][] }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1">
      {items.map(([k, v]) => (
        <p key={k} className="font-mono text-[0.62rem] text-muted">
          {k} <span className="text-ink">{v}</span>
        </p>
      ))}
    </div>
  );
}

export function MathInteractive({ kind }: { kind: Interactive }) {
  const [theta, setTheta] = useState(50);
  const [phase, setPhase] = useState(0);
  const [azimuth, setAzimuth] = useState(30);
  const [ellipticity, setEllipticity] = useState(0);
  const [waistUm, setWaistUm] = useState(2);
  const [zMm, setZMm] = useState(0);
  const [harmonics, setHarmonics] = useState(5);
  const [nSamples, setNSamples] = useState(20);
  const [mix, setMix] = useState(0.5);
  const [abcdElement, setAbcdElement] = useState<"free" | "lens" | "mirror">("free");
  const [rayHeight, setRayHeight] = useState(5);
  const [rayAngle, setRayAngle] = useState(0.02);

  const alpha = Math.cos((theta * Math.PI) / 360);
  const beta = Math.sin((theta * Math.PI) / 360);
  const pAlpha = alpha * alpha;
  const pBeta = beta * beta;

  const jones = useMemo(() => jonesFromAngles(azimuth, ellipticity), [azimuth, ellipticity]);
  const stokes = stokesFromJones(jones);
  const ellipse = polarizationEllipse(jones);

  const beam = { wavelengthM: 1064e-9, waistM: waistUm * 1e-6, powerW: 0.1 };
  const zr = rayleighRange(beam);
  const zRmm = zr * 1e3;
  const w = beamRadius(beam, zMm * 1e-3);
  const wCurve = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const z = (i / 100) * 6 * zr - 3 * zr;
      pts.push({ x: z, y: beamRadius(beam, z) * 1e6 });
    }
    return pts;
  }, [zr, waistUm]);

  const harmonicsData = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * 2;
      let y = 0;
      for (let k = 1; k <= harmonics; k += 2) {
        y += (4 / (Math.PI * k)) * Math.sin(2 * Math.PI * k * x);
      }
      pts.push({ x, y });
    }
    return pts;
  }, [harmonics]);

  const uncertaintyData = useMemo(() => {
    const rng = createRng("uncertainty-demo");
    const pts: { x: number; y: number; lo: number; hi: number; mean: number }[] = [];
    for (let n = 3; n <= 120; n += 3) {
      const values = Array.from({ length: n }, () => randNormal(rng, 10, 1.5));
      const m = mean(values);
      const s = sem(values);
      pts.push({ x: n, y: s, lo: m - s, hi: m + s, mean: m });
    }
    return pts;
  }, []);

  const selected = uncertaintyData.find((d) => d.x >= nSamples) ?? uncertaintyData[uncertaintyData.length - 1]!;

  const density = useMemo(() => {
    // Mixture of |H> and |D> with classical probability mix.
    const overlap = Math.SQRT1_2;
    const purity = mix * mix + (1 - mix) * (1 - mix) + 2 * mix * (1 - mix) * overlap * overlap;
    const r = Math.sqrt(Math.max(0, 2 * purity - 1));
    return { purity, r, entropy: purity >= 1 ? 0 : purity <= 0.5 ? 1 : -(purity * Math.log2(purity) + (1 - purity) * Math.log2(1 - purity)) };
  }, [mix]);

  // ABCD: propagate a ray 100 mm through free space, a 100 mm focal lens, or a flat mirror.
  const abcd = useMemo(() => {
    const y = rayHeight;
    const a = rayAngle;
    if (abcdElement === "free") {
      const d = 100;
      return { y: y + d * a, angle: a, matrix: `[1 ${d}; 0 1]` };
    }
    if (abcdElement === "lens") {
      const f = 100;
      return { y, angle: a - y / f, matrix: `[1 0; −1/${f} 1]` };
    }
    return { y: -y, angle: -a, matrix: `[1 0; 0 1] (flat mirror, sign convention)` };
  }, [abcdElement, rayHeight, rayAngle]);

  const minW = Math.min(...wCurve.map((p) => p.y));
  const maxW = Math.max(...wCurve.map((p) => p.y));

  return (
    <Frame
      label={
        kind === "superposition"
          ? "state amplitudes"
          : kind === "jones"
            ? "Jones state"
            : kind === "gaussian"
              ? "Gaussian beam"
              : kind === "fourier"
                ? "Fourier synthesis"
                : kind === "uncertainty"
                  ? "standard error"
                  : kind === "density"
                    ? "mixed state"
                    : "ABCD ray transfer"
      }
      readout={
        kind === "superposition" ? (
          <Readout items={[["|α|²", pAlpha.toFixed(3)], ["|β|²", pBeta.toFixed(3)], ["phase", `${phase}°`], ["norm", (pAlpha + pBeta).toFixed(3)]]} />
        ) : kind === "jones" ? (
          <Readout items={[["state", classifyPolarization(jones)], ["S₁", stokes.S1.toFixed(2)], ["S₂", stokes.S2.toFixed(2)], ["S₃", stokes.S3.toFixed(2)], ["DoP", stokes.dop.toFixed(2)]]} />
        ) : kind === "gaussian" ? (
          <Readout items={[["z_R", `${zRmm.toFixed(2)} mm`], ["w(z)", `${(w * 1e6).toFixed(2)} µm`], ["w₀", `${waistUm.toFixed(1)} µm`]]} />
        ) : kind === "fourier" ? (
          <Readout items={[["harmonics", String(harmonics)], ["overshoot", "≈ 9% (Gibbs)"], ["period", "T = 2"]]} />
        ) : kind === "uncertainty" ? (
          <Readout items={[["n", String(selected.x)], ["mean", selected.mean.toFixed(2)], ["SEM", selected.y.toFixed(3)]]} />
        ) : kind === "density" ? (
          <Readout items={[["purity", density.purity.toFixed(3)], ["|r|", density.r.toFixed(3)], ["S(ρ)", `${density.entropy.toFixed(2)} bits`]]} />
        ) : (
          <Readout items={[["y_out", `${abcd.y.toFixed(2)} mm`], ["θ_out", `${abcd.angle.toFixed(4)} rad`], ["M", abcd.matrix]]} />
        )
      }
    >
      {kind === "superposition" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <svg viewBox="0 0 240 200" className="h-[200px] w-full" role="img" aria-label="Two-component state on a circle">
            <circle cx="120" cy="100" r="72" fill="none" stroke="#D9D3C5" />
            <line x1="40" y1="100" x2="200" y2="100" stroke="#D9D3C5" />
            <line x1="120" y1="20" x2="120" y2="180" stroke="#D9D3C5" />
            <line x1="120" y1="100" x2={num(120 + Math.cos((theta * Math.PI) / 180) * 72)} y2={num(100 - Math.sin((theta * Math.PI) / 180) * 72)} stroke="#14524A" strokeWidth="2" />
            <line x1="120" y1="100" x2={num(120 + Math.cos((-phase * Math.PI) / 180) * 72 * beta)} y2={num(100 - Math.sin((-phase * Math.PI) / 180) * 72 * beta)} stroke="#B23A1E" strokeWidth="2" />
            <text x="44" y="192" fontSize="8" fontFamily="monospace" fill="#6E6A5E">|0⟩</text>
            <text x="126" y="30" fontSize="8" fontFamily="monospace" fill="#6E6A5E">|1⟩</text>
          </svg>
          <div className="space-y-4">
            <Slider label="Polar angle" value={theta} min={0} max={180} step={1} unit="°" onChange={setTheta} />
            <Slider label="Relative phase" value={phase} min={0} max={360} step={1} unit="°" onChange={setPhase} />
            <div className="space-y-1.5">
              {[["|0⟩", pAlpha, "bg-petrol"], ["|1⟩", pBeta, "bg-vermilion"]].map(([l, p, c]) => (
                <div key={String(l)}>
                  <div className="flex justify-between font-mono text-[0.6rem] text-muted"><span>{l}</span><span>{Number(p).toFixed(3)}</span></div>
                  <div className="h-[5px] bg-line"><div className={`h-full ${c}`} style={{ width: `${Number(p) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {kind === "jones" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <svg viewBox="-100 -100 200 200" className="h-[200px] w-full" role="img" aria-label="Polarization ellipse">
            <circle r="76" fill="none" stroke="#D9D3C5" />
            <line x1="-86" y1="0" x2="86" y2="0" stroke="#D9D3C5" />
            <line x1="0" y1="-86" x2="0" y2="86" stroke="#D9D3C5" />
            <ellipse rx={70 * ellipse.major} ry={70 * Math.max(0.01, ellipse.minor)} fill="none" stroke="#B23A1E" strokeWidth="1.5" transform={`rotate(${-ellipse.angleDeg})`} />
            <line x1="0" y1="0" x2={70 * ellipse.major * Math.cos((-ellipse.angleDeg * Math.PI) / 180)} y2={-70 * ellipse.major * Math.sin((-ellipse.angleDeg * Math.PI) / 180)} stroke="#14524A" strokeWidth="1" />
            <text x="-92" y="-84" fontSize="8" fontFamily="monospace" fill="#6E6A5E">E(t)</text>
          </svg>
          <div className="space-y-4">
            <Slider label="Azimuth" value={azimuth} min={0} max={180} step={1} unit="°" onChange={setAzimuth} />
            <Slider label="Ellipticity" value={ellipticity} min={-45} max={45} step={1} unit="°" onChange={setEllipticity} />
            <p className="text-[0.66rem] leading-relaxed text-muted">Ellipticity +45° is circular; 0° is linear. The handedness follows the sign.</p>
          </div>
        </div>
      ) : null}

      {kind === "gaussian" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_210px]">
          <svg viewBox="0 0 300 180" className="h-[200px] w-full" role="img" aria-label="Gaussian beam radius versus z">
            <line x1="20" y1="120" x2="290" y2="120" stroke="#D9D3C5" />
            {[1, 2, 3, 4, 5].map((k) => (
              <line key={k} x1={20} y1={120 - (k / 5) * 100} x2="290" y2={120 - (k / 5) * 100} stroke="#EEE9DF" strokeWidth="0.5" />
            ))}
            <polyline
              points={wCurve.map((p, i) => `${num(20 + (i / 100) * 260)},${num(120 - ((p.y - minW) / Math.max(1e-9, maxW - minW)) * 95)}`).join(" ")}
              fill="none"
              stroke="#B23A1E"
              strokeWidth="1.5"
            />
            <polyline
              points={wCurve.map((p, i) => `${num(20 + (i / 100) * 260)},${num(240 - (120 - ((p.y - minW) / Math.max(1e-9, maxW - minW)) * 95))}`).join(" ")}
              fill="none"
              stroke="#B23A1E"
              strokeWidth="0.8"
              opacity="0.5"
            />
            <line x1="150" y1="20" x2="150" y2="120" stroke="#14524A" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="155" y="30" fontSize="8" fontFamily="monospace" fill="#14524A">w₀</text>
            <text x="265" y="136" fontSize="8" fontFamily="monospace" fill="#6E6A5E">z</text>
            <text x="24" y="16" fontSize="8" fontFamily="monospace" fill="#6E6A5E">w(z) [µm]</text>
          </svg>
          <div className="space-y-4">
            <Slider label="Beam waist w₀" value={waistUm} min={0.5} max={8} step={0.1} unit="µm" onChange={setWaistUm} format={(v) => v.toFixed(1)} />
            <Slider label="Propagation distance" value={zMm} min={-30} max={30} step={0.5} unit="mm" onChange={setZMm} format={(v) => v.toFixed(1)} />
            <p className="text-[0.66rem] leading-relaxed text-muted">The Rayleigh range z_R = πw₀²/λ sets the depth of focus. Smaller waist means shorter depth.</p>
          </div>
        </div>
      ) : null}

      {kind === "fourier" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <svg viewBox="0 0 300 160" className="h-[200px] w-full" role="img" aria-label="Fourier synthesis of a square wave">
            <line x1="20" y1="80" x2="290" y2="80" stroke="#D9D3C5" />
            <line x1="20" y1="20" x2="20" y2="140" stroke="#D9D3C5" />
            <polyline
              points={harmonicsData.map((p, i) => `${num(20 + (i / 240) * 265)},${num(80 - p.y * 45)}`).join(" ")}
              fill="none"
              stroke="#B23A1E"
              strokeWidth="1.5"
            />
            <line x1="20" y1="35" x2="285" y2="35" stroke="#14524A" strokeWidth="0.6" strokeDasharray="3 3" />
            <line x1="20" y1="125" x2="285" y2="125" stroke="#14524A" strokeWidth="0.6" strokeDasharray="3 3" />
            <text x="24" y="18" fontSize="8" fontFamily="monospace" fill="#6E6A5E">partial sum</text>
          </svg>
          <div className="space-y-4">
            <Slider label="Odd harmonics" value={harmonics} min={1} max={51} step={2} unit="" onChange={setHarmonics} />
            <p className="text-[0.66rem] leading-relaxed text-muted">
              A square wave is a sum of odd sine harmonics with amplitudes 4/(πk). The Gibbs overshoot does not vanish as N grows; it moves closer to the edge.
            </p>
          </div>
        </div>
      ) : null}

      {kind === "uncertainty" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_210px]">
          <svg viewBox="0 0 300 180" className="h-[200px] w-full" role="img" aria-label="Standard error versus sample size">
            <line x1="30" y1="140" x2="290" y2="140" stroke="#D9D3C5" />
            <line x1="30" y1="20" x2="30" y2="140" stroke="#D9D3C5" />
            <polyline
              points={uncertaintyData.map((p) => `${num(30 + ((p.x - 3) / 117) * 255)},${num(140 - (p.y / uncertaintyData[0]!.y) * 110)}`).join(" ")}
              fill="none"
              stroke="#B23A1E"
              strokeWidth="1.5"
            />
            <line x1={num(30 + ((selected.x - 3) / 117) * 255)} y1="20" x2={num(30 + ((selected.x - 3) / 117) * 255)} y2="140" stroke="#14524A" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="34" y="16" fontSize="8" fontFamily="monospace" fill="#6E6A5E">SEM ∝ 1/√n</text>
            <text x="255" y="154" fontSize="8" fontFamily="monospace" fill="#6E6A5E">n</text>
          </svg>
          <div className="space-y-4">
            <Slider label="Sample size" value={nSamples} min={3} max={120} step={3} unit="" onChange={setNSamples} />
            <p className="text-[0.66rem] leading-relaxed text-muted">
              The standard error falls as 1/√n. Quadrupling the number of readings halves it — and never removes a systematic error.
            </p>
          </div>
        </div>
      ) : null}

      {kind === "density" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <svg viewBox="0 0 240 200" className="h-[200px] w-full" role="img" aria-label="Bloch vector length of a mixed state">
            <circle cx="120" cy="100" r="72" fill="none" stroke="#D9D3C5" />
            <line x1="40" y1="100" x2="200" y2="100" stroke="#D9D3C5" />
            <line x1="120" y1="20" x2="120" y2="180" stroke="#D9D3C5" />
            <circle cx="120" cy="100" r="72" fill="#14524A" opacity="0.06" />
            <line x1="120" y1="100" x2={num(120 + 72 * density.r * Math.cos(Math.PI / 4))} y2={num(100 - 72 * density.r * Math.sin(Math.PI / 4))} stroke="#B23A1E" strokeWidth="2" />
            <circle cx={num(120 + 72 * density.r * Math.cos(Math.PI / 4))} cy={num(100 - 72 * density.r * Math.sin(Math.PI / 4))} r="3" fill="#B23A1E" />
            <text x="46" y="192" fontSize="8" fontFamily="monospace" fill="#6E6A5E">mixed center</text>
          </svg>
          <div className="space-y-4">
            <Slider label="Classical mixture p" value={mix} min={0} max={1} step={0.01} unit="" onChange={setMix} format={(v) => v.toFixed(2)} />
            <p className="text-[0.66rem] leading-relaxed text-muted">
              ρ = p|H⟩⟨H| + (1−p)|D⟩⟨D|. Even with non-orthogonal components, the Bloch vector shrinks and the state becomes mixed. Purity Tr(ρ²) drops below 1.
            </p>
          </div>
        </div>
      ) : null}

      {kind === "abcd" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_230px]">
          <svg viewBox="0 0 300 170" className="h-[200px] w-full" role="img" aria-label="Ray transfer through an optical element">
            <line x1="20" y1="95" x2="285" y2="95" stroke="#D9D3C5" strokeDasharray="3 3" />
            <line x1="150" y1="25" x2="150" y2="150" stroke="#171713" strokeWidth={abcdElement === "lens" ? 2 : 3} />
            <line x1="24" y1={num(95 - rayHeight * 3)} x2="150" y2="95" stroke="#B23A1E" strokeWidth="1.4" />
            <line x1="150" y1="95" x2="285" y2={num(95 - abcd.y * 3)} stroke="#B23A1E" strokeWidth="1.4" />
            <text x="156" y="34" fontSize="8" fontFamily="monospace" fill="#6E6A5E">{abcdElement === "free" ? "free space" : abcdElement === "lens" ? "thin lens" : "mirror"}</text>
            <text x="24" y="86" fontSize="8" fontFamily="monospace" fill="#6E6A5E">input ray</text>
          </svg>
          <div className="space-y-4">
            <SegmentedControl
              ariaLabel="Optical element"
              value={abcdElement}
              onChange={setAbcdElement}
              options={[
                { value: "free", label: "Free" },
                { value: "lens", label: "Lens" },
                { value: "mirror", label: "Mirror" }
              ]}
            />
            <Slider label="Input height y" value={rayHeight} min={-30} max={30} step={0.5} unit="mm" onChange={setRayHeight} format={(v) => v.toFixed(1)} />
            <Slider label="Input angle θ" value={rayAngle} min={-0.1} max={0.1} step={0.001} unit="rad" onChange={setRayAngle} format={(v) => v.toFixed(3)} />
            <p className="text-[0.64rem] leading-relaxed text-muted">Ray vector (y, θ). Free space adds dθ to y; a thin lens subtracts y/f from θ.</p>
          </div>
        </div>
      ) : null}
    </Frame>
  );
}
