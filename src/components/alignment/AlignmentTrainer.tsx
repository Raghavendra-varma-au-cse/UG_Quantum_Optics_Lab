"use client";

import { useMemo, useState } from "react";
import { Slider, SegmentedControl } from "@/components/ui/Controls";
import { IntensityCanvas } from "@/components/viz/IntensityCanvas";
import { michelsonPattern, visibilityEnvelope, coherenceLength, straightFringeSpacing } from "@/lib/physics/interference";

type Mode = "steering" | "focus" | "interferometer";

const BEAM = "#B23A1E";
const INK = "#171713";
const MUTED = "#6E6A5E";
const LINE = "#B8B1A0";
const PAPER = "#FBF9F4";

interface Vec {
  x: number;
  y: number;
}
const rot = (v: Vec, a: number): Vec => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) });
const reflect = (d: Vec, n: Vec): Vec => {
  const dot = d.x * n.x + d.y * n.y;
  return { x: d.x - 2 * dot * n.x, y: d.y - 2 * dot * n.y };
};
const norm = (v: Vec): Vec => {
  const m = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / m, y: v.y / m };
};

function MirrorGfx({ x, y, angle, size = 44 }: { x: number; y: number; angle: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI})`}>
      <rect x={-size / 2} y={-2.5} width={size} height={5} fill="#EFEBE2" stroke={INK} strokeWidth="1" />
      <line x1={-size / 2} y1={-4} x2={size / 2} y2={-4} stroke={INK} strokeWidth="1" />
    </g>
  );
}

function SteeringScene({ m1Tilt, m2Tilt, irisRadius }: { m1Tilt: number; m2Tilt: number; irisRadius: number }) {
  const M1 = { x: 180, y: 260 };
  const M2 = { x: 180, y: 80 };
  const IRIS = { x: 430, y: 80 };
  const TARGET = { x: 640, y: 80 };
  const alpha1 = m1Tilt * 1e-3;
  const alpha2 = m2Tilt * 1e-3;

  const d0 = { x: 1, y: 0 };
  const n1 = rot(norm({ x: -1, y: -1 }), alpha1);
  const d1 = reflect(d0, n1);
  const t1 = (M2.y - M1.y) / (d1.y || 1e-9);
  const hitM2 = { x: M1.x + t1 * d1.x, y: M2.y };
  const missM2 = Math.abs(hitM2.x - M2.x) > 26 || t1 < 0;

  const n2 = rot(norm({ x: -1, y: 1 }), alpha2);
  const d2 = reflect(d1, n2);
  const tIris = (IRIS.x - hitM2.x) / (d2.x || 1e-9);
  const yIris = hitM2.y + tIris * d2.y;
  const irisBlocked = Math.abs(yIris - IRIS.y) > irisRadius;
  const tTarget = (TARGET.x - hitM2.x) / (d2.x || 1e-9);
  const yTarget = hitM2.y + tTarget * d2.y;
  const targetError = yTarget - TARGET.y;

  const end = irisBlocked ? { x: IRIS.x, y: yIris } : { x: TARGET.x, y: yTarget };
  const blockedPoint = irisBlocked ? { x: IRIS.x, y: yIris } : null;

  return (
    <svg viewBox="0 0 720 340" className="w-full" role="img" aria-label="Interactive beam-steering layout with two mirrors and an iris">
      <rect width="720" height="340" fill={PAPER} />
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={`v${i}`} x1={60 + i * 60} y1={20} x2={60 + i * 60} y2={320} stroke="#EEE9DF" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`h${i}`} x1={40} y1={40 + i * 64} x2={680} y2={40 + i * 64} stroke="#EEE9DF" strokeWidth="0.5" />
      ))}
      <rect x="28" y="246" width="64" height="28" fill="#EFEBE2" stroke={INK} strokeWidth="1" />
      <text x="60" y="240" textAnchor="middle" fontSize="8" fontFamily="monospace" fill={INK}>LASER</text>
      <line x1="92" y1="260" x2={M1.x} y2={M1.y} stroke={BEAM} strokeWidth="1.6" />
      <MirrorGfx x={M1.x} y={M1.y} angle={Math.PI / 4 + alpha1} />
      <text x={M1.x - 34} y={M1.y + 26} fontSize="8" fontFamily="monospace" fill={MUTED}>M1 · kinematic</text>

      {!missM2 ? (
        <>
          <line x1={M1.x} y1={M1.y} x2={hitM2.x} y2={hitM2.y} stroke={BEAM} strokeWidth="1.6" />
          <MirrorGfx x={M2.x} y={M2.y} angle={-Math.PI / 4 + alpha2} />
          <text x={M2.x - 34} y={M2.y - 14} fontSize="8" fontFamily="monospace" fill={MUTED}>M2 · kinematic</text>
        </>
      ) : (
        <text x={M1.x + 14} y={M2.y + 26} fontSize="8" fontFamily="monospace" fill={BEAM}>beam misses M2 — reduce tilt</text>
      )}

      <g>
        <circle cx={IRIS.x} cy={IRIS.y} r={irisRadius} fill="none" stroke={irisBlocked ? BEAM : INK} strokeWidth="1" />
        <circle cx={IRIS.x} cy={IRIS.y} r={22} fill="none" stroke={LINE} strokeWidth="0.8" />
        <line x1={IRIS.x - 26} y1={IRIS.y - 26} x2={IRIS.x - 16} y2={IRIS.y - 16} stroke={INK} strokeWidth="0.8" />
        <line x1={IRIS.x + 26} y1={IRIS.y - 26} x2={IRIS.x + 16} y2={IRIS.y - 16} stroke={INK} strokeWidth="0.8" />
        <text x={IRIS.x} y={IRIS.y + 40} textAnchor="middle" fontSize="8" fontFamily="monospace" fill={MUTED}>iris 1</text>
      </g>

      {!missM2 ? (
        <>
          <line x1={hitM2.x} y1={hitM2.y} x2={end.x} y2={end.y} stroke={BEAM} strokeWidth="1.6" strokeDasharray={irisBlocked ? "4 3" : undefined} />
          {blockedPoint ? <circle cx={blockedPoint.x} cy={blockedPoint.y} r={3.5} fill={BEAM} /> : null}
        </>
      ) : null}

      <g>
        <line x1={TARGET.x} y1={TARGET.y - 44} x2={TARGET.x} y2={TARGET.y + 44} stroke={INK} strokeWidth="3" />
        <circle cx={TARGET.x} cy={TARGET.y} r={4} fill="none" stroke={MUTED} strokeWidth="0.8" />
        <text x={TARGET.x + 12} y={TARGET.y + 4} fontSize="8" fontFamily="monospace" fill={MUTED}>target</text>
      </g>

      <text x={44} y={320} fontSize="8" fontFamily="monospace" fill={MUTED}>
        M1 tilt {m1Tilt.toFixed(1)} mrad · M2 tilt {m2Tilt.toFixed(1)} mrad · iris Ø {(irisRadius * 2).toFixed(1)} mm
      </text>
      <text x={470} y={320} fontSize="8" fontFamily="monospace" fill={targetError === 0 ? MUTED : BEAM}>
        target error {targetError.toFixed(1)} mm
      </text>
    </svg>
  );
}

export function AlignmentTrainer() {
  const [mode, setMode] = useState<Mode>("steering");
  const [m1Tilt, setM1Tilt] = useState(2.4);
  const [m2Tilt, setM2Tilt] = useState(-1.2);
  const [irisRadius, setIrisRadius] = useState(4);
  const [lensPos, setLensPos] = useState(300);
  const [screenPos, setScreenPos] = useState(600);
  const [focal, setFocal] = useState(150);
  const [tiltUrad, setTiltUrad] = useState(45);
  const [armUm, setArmUm] = useState(1.2);
  const [coherenceMm, setCoherenceMm] = useState(0.05);

  // Steering model values used for diagnosis (same geometry as the scene).
  const steering = useMemo(() => {
    const d0 = { x: 1, y: 0 };
    const n1 = rot(norm({ x: -1, y: -1 }), m1Tilt * 1e-3);
    const d1 = reflect(d0, n1);
    const t1 = 180 / (d1.y || -1e-9);
    const hitX = 180 + t1 * d1.x;
    const missM2 = Math.abs(hitX - 180) > 26 || t1 < 0;
    const n2 = rot(norm({ x: -1, y: 1 }), m2Tilt * 1e-3);
    const d2 = reflect(d1, n2);
    const yIris = 80 + ((430 - hitX) / (d2.x || 1e-9)) * d2.y;
    const yTarget = 80 + ((640 - hitX) / (d2.x || 1e-9)) * d2.y;
    return { missM2, hitX, yIris, irisBlocked: Math.abs(yIris - 80) > irisRadius, yTarget, targetError: yTarget - 80 };
  }, [m1Tilt, m2Tilt, irisRadius]);

  const focus = useMemo(() => {
    const lambda = 633e-9;
    const wIn = 1.5e-3;
    const w0f = (lambda * focal * 1e-3) / (Math.PI * wIn);
    const zR = (Math.PI * w0f * w0f) / lambda;
    const waistPos = lensPos + focal;
    const z = (screenPos - waistPos) * 1e-3;
    const wScreen = w0f * Math.sqrt(1 + (z / zR) ** 2);
    return { waistUm: w0f * 1e6, zRmm: zR * 1e3, waistPos, spotUm: wScreen * 1e6, defocus: z * 1e3 };
  }, [focal, lensPos, screenPos]);

  const pattern = useMemo(() => {
    const lambda = 632.8e-9;
    return michelsonPattern({
      fieldM: 0.012,
      wavelengthM: lambda,
      armDifferenceM: (armUm * 1e-6) / 2,
      tiltRad: tiltUrad * 1e-6,
      coherence: 0.96,
      coherenceLengthM: coherenceMm * 1e-3,
      balance: 0.98,
      envelope: 0.78,
      samples: 180
    });
  }, [armUm, tiltUrad, coherenceMm]);

  const visibility = visibilityEnvelope(armUm * 1e-6, coherenceMm * 1e-3) * 0.96;
  const fringeSpacingMm = straightFringeSpacing(632.8e-9, tiltUrad * 1e-6) * 1e3;

  const diagnosis = useMemo(() => {
    if (mode === "steering") {
      if (steering.missM2) return { tone: "bad", text: "The beam walks off M2. Reduce M1 tilt; large tilt cannot be recovered downstream." };
      if (steering.irisBlocked) return { tone: "bad", text: `The iris clips the beam by ${(Math.abs(steering.yIris - 80) - irisRadius).toFixed(1)} mm. Correct position with M1; M1 sets where the beam crosses the iris, M2 sets its angle.` };
      if (Math.abs(steering.targetError) > 3) return { tone: "warn", text: "The beam passes the iris but lands off the target. Adjust M2 angle, not M1 — you will lose the iris." };
      return { tone: "good", text: "Both constraints are satisfied. Tighten the mounts in the order you adjusted them and re-check the iris." };
    }
    if (mode === "focus") {
      if (Math.abs(focus.defocus) < 1) return { tone: "good", text: "The screen sits at the focused waist. The spot is near its diffraction-limited size." };
      return { tone: "warn", text: `The screen is ${Math.abs(focus.defocus).toFixed(0)} mm from the waist; the spot is ${focus.spotUm.toFixed(0)} µm instead of ${focus.waistUm.toFixed(0)} µm. Move the screen or the lens.` };
    }
    if (visibility < 0.3) return { tone: "bad", text: "Fringes are washed out. The path difference may exceed the coherence length, or the two beams are badly unbalanced." };
    if (visibility < 0.7) return { tone: "warn", text: "Fringes are visible but low contrast. Check arm balance, beam overlap and coherence." };
    return { tone: "good", text: "High-contrast fringes. Count ten fringes and divide the mirror travel by five to get λ/2." };
  }, [mode, steering, focus, visibility, irisRadius]);

  return (
    <div className="border border-line-strong bg-paper-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-3/50 px-3 py-2">
        <p className="label !text-[0.58rem]">Alignment trainer · computed beam path</p>
        <SegmentedControl
          size="sm"
          ariaLabel="Alignment exercise"
          value={mode}
          onChange={setMode}
          options={[
            { value: "steering", label: "Steering" },
            { value: "focus", label: "Focus" },
            { value: "interferometer", label: "Fringes" }
          ]}
        />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 border-b border-line p-3 lg:border-b-0 lg:border-r">
          {mode === "steering" ? <SteeringScene m1Tilt={m1Tilt} m2Tilt={m2Tilt} irisRadius={irisRadius} /> : null}

          {mode === "focus" ? (
            <svg viewBox="0 0 720 340" className="w-full" role="img" aria-label="Lens focusing geometry with beam envelope">
              <rect width="720" height="340" fill={PAPER} />
              <line x1="40" y1="170" x2="690" y2="170" stroke={LINE} strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="50" y1="156" x2={lensPos} y2="156" stroke={BEAM} strokeWidth="0.8" opacity="0.5" />
              <line x1="50" y1="184" x2={lensPos} y2="184" stroke={BEAM} strokeWidth="0.8" opacity="0.5" />
              <text x="50" y="146" fontSize="8" fontFamily="monospace" fill={MUTED}>collimated w = 1.5 mm</text>
              <g transform={`translate(${lensPos} 170)`}>
                <path d="M 0 -70 Q 12 0 0 70 Q -12 0 0 -70 Z" fill="#EFEBE2" stroke={INK} strokeWidth="1" />
              </g>
              <text x={lensPos} y="94" textAnchor="middle" fontSize="8" fontFamily="monospace" fill={INK}>f = {focal} mm</text>
              <line x1={lensPos} y1="170" x2={focus.waistPos} y2="170" stroke={MUTED} strokeWidth="0.6" />
              <text x={(lensPos + focus.waistPos) / 2} y="188" textAnchor="middle" fontSize="8" fontFamily="monospace" fill={MUTED}>f</text>
              <path
                d={`M ${lensPos} 156 L ${focus.waistPos} 166 L ${focus.waistPos} 174 L ${lensPos} 184 Z`}
                fill={BEAM}
                opacity="0.16"
              />
              <line x1={focus.waistPos} y1="158" x2={focus.waistPos} y2="182" stroke={ACCENT_LINE} strokeWidth="1" />
              <text x={focus.waistPos} y="152" textAnchor="middle" fontSize="8" fontFamily="monospace" fill={ACCENT_LINE}>waist {focus.waistUm.toFixed(1)} µm</text>
              <g transform={`translate(${screenPos} 170)`}>
                <line x1="0" y1="-60" x2="0" y2="60" stroke={INK} strokeWidth="3" />
                <circle cx="0" cy="0" r={Math.max(2, Math.min(40, focus.spotUm / 12))} fill={BEAM} opacity="0.35" />
                <text x="10" y="74" fontSize="8" fontFamily="monospace" fill={MUTED}>screen</text>
              </g>
              <text x="50" y="310" fontSize="8" fontFamily="monospace" fill={MUTED}>spot at screen {focus.spotUm.toFixed(1)} µm · defocus {focus.defocus.toFixed(1)} mm</text>
            </svg>
          ) : null}

          {mode === "interferometer" ? (
            <div>
              <IntensityCanvas values={pattern} size={180} colormap="mono" gain={1.1} className="aspect-[4/3] w-full" ariaLabel="Simulated interference fringes for alignment diagnosis" />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[0.6rem] text-muted">
                <span>visibility {visibility.toFixed(3)}</span>
                <span>spacing {Number.isFinite(fringeSpacingMm) ? `${fringeSpacingMm.toFixed(2)} mm` : "—"}</span>
              </div>
            </div>
          ) : null}

          <div className={`mt-3 border-l-2 px-3 py-2 ${diagnosis.tone === "good" ? "border-petrol bg-petrol-soft/30" : diagnosis.tone === "warn" ? "border-brass bg-brass-soft/30" : "border-vermilion bg-vermilion-soft/30"}`}>
            <p className="label mb-1 !text-[0.55rem]">Diagnosis</p>
            <p className="text-[0.72rem] leading-relaxed text-ink-2">{diagnosis.text}</p>
          </div>
        </div>

        <aside className="p-4">
          <p className="label mb-3">Controls</p>
          {mode === "steering" ? (
            <div className="space-y-4">
              <Slider label="M1 tilt" value={m1Tilt} min={-20} max={20} step={0.1} unit="mrad" onChange={setM1Tilt} format={(v) => v.toFixed(1)} />
              <Slider label="M2 tilt" value={m2Tilt} min={-20} max={20} step={0.1} unit="mrad" onChange={setM2Tilt} format={(v) => v.toFixed(1)} />
              <Slider label="Iris aperture radius" value={irisRadius} min={1} max={12} step={0.5} unit="mm" onChange={setIrisRadius} format={(v) => v.toFixed(1)} />
              <p className="border-t border-line pt-3 text-[0.66rem] leading-relaxed text-muted">
                M1 controls the beam position at the iris. M2 controls its angle at the target. Change one, observe, then
                iterate. The iris is a constraint, not a decoration.
              </p>
            </div>
          ) : null}

          {mode === "focus" ? (
            <div className="space-y-4">
              <Slider label="Lens focal length" value={focal} min={50} max={250} step={5} unit="mm" onChange={setFocal} />
              <Slider label="Lens position" value={lensPos} min={180} max={420} step={5} unit="mm" onChange={setLensPos} />
              <Slider label="Screen position" value={screenPos} min={450} max={690} step={5} unit="mm" onChange={setScreenPos} />
              <div className="border-t border-line pt-3">
                <p className="font-mono text-[0.62rem] text-muted">focused waist</p>
                <p className="num text-[0.85rem] text-ink">{focus.waistUm.toFixed(1)} µm</p>
                <p className="mt-1 font-mono text-[0.6rem] text-muted">z_R {focus.zRmm.toFixed(1)} mm</p>
              </div>
            </div>
          ) : null}

          {mode === "interferometer" ? (
            <div className="space-y-4">
              <Slider label="Mirror tilt" value={tiltUrad} min={0} max={200} step={1} unit="µrad" onChange={setTiltUrad} />
              <Slider label="Path difference 2d" value={armUm} min={-10} max={10} step={0.1} unit="µm" onChange={setArmUm} format={(v) => v.toFixed(1)} />
              <Slider label="Coherence length" value={coherenceMm} min={0.005} max={2} step={0.005} unit="mm" onChange={setCoherenceMm} format={(v) => v.toFixed(3)} />
              <p className="border-t border-line pt-3 text-[0.66rem] leading-relaxed text-muted">
                Tilt changes fringe orientation and spacing; path difference changes the order; coherence length sets how
                far you can go before contrast collapses.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

const ACCENT_LINE = "#14524A";
