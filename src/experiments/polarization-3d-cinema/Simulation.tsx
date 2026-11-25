"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { SegmentedControl, Slider, Tabs, Toggle } from "@/components/ui/Controls";
import { Badge } from "@/components/ui/primitives";
import { LabLineChart } from "@/components/viz/Plot";
import { fieldVector, intensity, type Jones } from "@/lib/physics/polarization";
import {
  DEFAULT_BENCH,
  DEFAULT_CINEMA,
  SIMULATION_SPEC,
  SOURCE_PRESETS,
  benchMalusCurve,
  crosstalkVsTilt,
  formatJones,
  formatMatrix,
  poincareFromStokes,
  polarizationEllipse,
  runBench,
  runCinema,
  type BenchConfig,
  type BenchResult,
  type CinemaConfig,
  type CinemaResult,
  type PlateKind,
  type PoincarePoint,
  type SourcePresetId
} from "./physics";

/* -------------------------------------------------------------------------- */
/* Palette                                                                     */
/* -------------------------------------------------------------------------- */

const INK = "#171713";
const MUTED = "#6E6A5E";
const LINE = "#D9D3C5";
const BEAM = "#B23A1E";
const ACCENT = "#14524A";
const PAPER = "#FBF9F4";

const fmt = (v: number, d = 2): string => (Number.isFinite(v) ? v.toFixed(d) : "—");
const pct = (v: number, d = 1): string => (Number.isFinite(v) ? (100 * v).toFixed(d) : "—");
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/* -------------------------------------------------------------------------- */
/* Small lab fixtures                                                          */
/* -------------------------------------------------------------------------- */

function PlateIcon({ x, y, label, active, angle }: { x: number; y: number; label: string; active: boolean; angle: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-7} y={-34} width={14} height={68} fill={active ? "#E9E4D8" : PAPER} stroke={INK} strokeWidth={1} opacity={active ? 1 : 0.35} />
      <line
        x1={0}
        y1={-30}
        x2={0}
        y2={30}
        stroke={ACCENT}
        strokeWidth={1.2}
        strokeDasharray="4 3"
        transform={`rotate(${active ? angle : 0})`}
        opacity={active ? 0.9 : 0.25}
      />
      <text x={0} y={-42} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={8} letterSpacing="0.04em">
        {label}
      </text>
    </g>
  );
}

function BenchChain({ bench }: { bench: BenchResult }) {
  const { config, transmitted } = bench;
  const plateLabel =
    config.plate === "none"
      ? "no plate"
      : config.plate === "half"
        ? "λ/2"
        : config.plate === "quarter"
          ? "λ/4"
          : `δ=${Math.round(bench.retardanceDeg)}°`;
  return (
    <svg
      viewBox="0 0 640 150"
      className="h-auto w-full"
      role="img"
      aria-label={`Optical train: source, polarizer at ${config.polarizerAngleDeg} degrees, ${plateLabel}, analyser at ${config.analyzerAngleDeg} degrees, detector. Transmission ${pct(transmitted)} percent.`}
    >
      <rect width="640" height="150" fill={PAPER} />
      <line x1="60" y1="80" x2="600" y2="80" stroke={LINE} strokeWidth="1" />
      {/* source */}
      <g transform="translate(42 80)">
        <rect x={-22} y={-13} width={44} height={26} fill="#E9E4D8" stroke={INK} strokeWidth="1" />
        <rect x={-15} y={-5} width={20} height={10} fill={BEAM} opacity="0.8" />
        <text x={0} y={32} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
          SOURCE
        </text>
      </g>
      {/* beam before analyser */}
      <line x1="70" y1="80" x2="430" y2="80" stroke={BEAM} strokeWidth={transmitted > 0.5 ? 2.6 : 1.8} opacity="0.85" />
      <line x1="430" y1="80" x2="560" y2="80" stroke={BEAM} strokeWidth={0.6 + 1.8 * clamp01(transmitted)} opacity={0.2 + 0.8 * clamp01(transmitted)} />
      {/* polarizer */}
      <PlateIcon x={150} y={80} label={config.polarizerEnabled ? `P θ=${config.polarizerAngleDeg}°` : "P off"} active={config.polarizerEnabled} angle={config.polarizerAngleDeg} />
      {/* plate */}
      <PlateIcon x={290} y={80} label={plateLabel} active={config.plate !== "none"} angle={config.plateAngleDeg} />
      {/* analyser */}
      <PlateIcon x={430} y={80} label={`A φ=${config.analyzerAngleDeg}°`} active angle={config.analyzerAngleDeg} />
      {/* detector */}
      <g transform="translate(572 80)">
        <circle r={13} fill={PAPER} stroke={INK} strokeWidth="1" />
        <circle r={4} fill={INK} />
        <text x={0} y={30} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
          PD
        </text>
      </g>
      <text x={320} y={24} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8" letterSpacing="0.06em">
        JONES TRAIN · SOURCE → POLARIZER → RETARDER → ANALYSER
      </text>
      <text x={495} y={126} textAnchor="middle" fill={ACCENT} fontFamily="var(--font-mono), monospace" fontSize="9">
        I / I₀ = {pct(transmitted)}
      </text>
      <text x={320} y={140} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
        angles read from each element&apos;s own scale
      </text>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Electric-field animation                                                    */
/* -------------------------------------------------------------------------- */

function FieldCanvas({ jones }: { jones: Jones }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion() === true;
  const stateIntensity = intensity(jones);
  const label = useMemo(
    () =>
      stateIntensity < 1e-9
        ? "Electric-field animation: no light reaches the analyser."
        : "Animation of the electric-field vector at a fixed plane and of its x and y components along the propagation direction.",
    [stateIntensity]
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const totalIntensity = intensity(jones);
    const amplitudeScale = totalIntensity > 1e-12 ? 1 / Math.sqrt(totalIntensity) : 0;
    const normalizedJones: Jones = [
      { re: jones[0].re * amplitudeScale, im: jones[0].im * amplitudeScale },
      { re: jones[1].re * amplitudeScale, im: jones[1].im * amplitudeScale }
    ];

    const draw = (phase: number) => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      const lights = intensity(jones) > 1e-9;

      // ---- transverse plane ------------------------------------------------
      const cx = 150;
      const cy = 152;
      const R = 92;
      ctx.strokeStyle = LINE;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - R - 12, cy);
      ctx.lineTo(cx + R + 12, cy);
      ctx.moveTo(cx, cy - R - 12);
      ctx.lineTo(cx, cy + R + 12);
      ctx.stroke();

      ctx.fillStyle = MUTED;
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("transverse plane", 24, 24);
      ctx.fillText("x →", cx + R - 2, cy + 16);
      ctx.fillText("y ↑", cx + 6, cy - R + 2);

      if (lights) {
        const ellipse = polarizationEllipse(normalizedJones);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((-ellipse.angleDeg * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(ellipse.major * R, 0.5), Math.max(ellipse.minor * R, 0.5), 0, 0, Math.PI * 2);
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = LINE;
        ctx.beginPath();
        ctx.moveTo(-ellipse.major * R, 0);
        ctx.lineTo(ellipse.major * R, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // fading trail of field vectors, newest last
        for (let k = 12; k >= 0; k--) {
          const v = fieldVector(normalizedJones, phase - k * 0.055);
          const alpha = 0.08 + 0.32 * (1 - k / 12);
          ctx.beginPath();
          ctx.arc(cx + v.x * R, cy - v.y * R, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(178, 58, 30, ${alpha.toFixed(3)})`;
          ctx.fill();
        }

        const v = fieldVector(normalizedJones, phase);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + v.x * R, cy - v.y * R);
        ctx.strokeStyle = BEAM;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + v.x * R, cy - v.y * R, 3.6, 0, Math.PI * 2);
        ctx.fillStyle = BEAM;
        ctx.fill();
      } else {
        ctx.fillStyle = MUTED;
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText("no light", cx - 26, cy + 4);
      }

      // ---- propagation traces ---------------------------------------------
      ctx.strokeStyle = LINE;
      ctx.beginPath();
      ctx.moveTo(292, 18);
      ctx.lineTo(292, 282);
      ctx.stroke();

      const x0 = 306;
      const x1 = 622;
      const midX = 104;
      const midY = 226;
      const amp = 46;
      const lambdaPx = 92;

      ctx.strokeStyle = LINE;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(x0, midX);
      ctx.lineTo(x1, midX);
      ctx.moveTo(x0, midY);
      ctx.lineTo(x1, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      if (lights) {
        const trace = (pick: (p: { x: number; y: number }) => number, mid: number, color: string, text: string) => {
          ctx.beginPath();
          for (let px = x0; px <= x1; px += 2) {
            const z = ((px - x0) / lambdaPx) * Math.PI * 2;
            const value = pick(fieldVector(normalizedJones, phase - z));
            const sy = mid - value * amp;
            if (px === x0) ctx.moveTo(px, sy);
            else ctx.lineTo(px, sy);
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillText(text, x0 + 2, mid - amp - 10);
        };
        trace((p) => p.x, midX, ACCENT, "E_x(z,t)");
        trace((p) => p.y, midY, BEAM, "E_y(z,t)");
      }

      ctx.fillStyle = MUTED;
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("z →", x1 - 24, 280);
      ctx.fillText(lights ? "one wavelength ≈ 92 px" : "components are zero", x0 + 2, 280);
    };

    if (reduceMotion) {
      draw(0.9);
      return;
    }

    let raf = 0;
    let start = 0;
    const loop = (timestamp: number) => {
      if (!start) start = timestamp;
      draw(((timestamp - start) / 1000) * 1.7);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [jones, reduceMotion]);

  return (
    <div className="viz-frame border border-line">
      <canvas ref={ref} width={640} height={300} className="h-auto w-full" role="img" aria-label={label} />
      <p className="sr-only">
        {stateIntensity < 1e-9
          ? "No light passes the polarizer in this configuration."
          : "The left panel shows the polarization ellipse in the transverse plane with a rotating electric-field vector. The right panel shows the x and y field components along the propagation direction; their relative phase sets the ellipse."}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ellipse diagram                                                             */
/* -------------------------------------------------------------------------- */

function EllipseDiagram({ bench }: { bench: BenchResult }) {
  const ell = bench.ellipse;
  const hasLight = bench.stateStokes.S0 > 1e-9;
  const R = 74;
  const major = Math.max(ell.major * R, 0.6);
  const minor = Math.max(ell.minor * R, 0.6);
  const az = ell.angleDeg;
  const tipX = 106 + Math.cos((az * Math.PI) / 180) * 92;
  const tipY = 106 - Math.sin((az * Math.PI) / 180) * 92;

  return (
    <div className="border border-line bg-paper-2 p-2">
      <p className="label mb-1 px-1 text-[0.55rem]">Polarization ellipse</p>
      <svg
        viewBox="0 0 212 196"
        className="h-auto w-full"
        role="img"
        aria-label={
          hasLight
            ? `Polarization ellipse with azimuth ${fmt(az, 1)} degrees, ellipticity ${fmt(bench.ellipticityDeg, 1)} degrees and handedness ${ell.handedness}.`
            : "No light reaches the analyser, so no ellipse is defined."
        }
      >
        <rect width="212" height="196" fill={PAPER} />
        <circle cx="106" cy="94" r="78" fill="none" stroke={LINE} />
        <line x1="20" y1="94" x2="192" y2="94" stroke={LINE} strokeWidth="1" />
        <line x1="106" y1="8" x2="106" y2="180" stroke={LINE} strokeWidth="1" />
        {hasLight ? (
          <>
            <g transform={`rotate(${-az} 106 94)`}>
              <ellipse cx="106" cy="94" rx={major} ry={minor} fill="none" stroke={ACCENT} strokeWidth="1.8" />
              <line x1={106 - major} y1="94" x2={106 + major} y2="94" stroke={ACCENT} strokeWidth="0.7" strokeDasharray="3 3" />
              <line x1="106" y1={94 - minor} x2="106" y2={94 + minor} stroke={ACCENT} strokeWidth="0.7" strokeDasharray="3 3" />
            </g>
            <line x1="106" y1="94" x2={tipX} y2={tipY} stroke={BEAM} strokeWidth="1.2" />
            <circle cx={tipX} cy={tipY} r="3" fill={BEAM} />
            <text
              x={Math.min(190, Math.max(22, 106 + Math.cos((az * Math.PI) / 180) * 88))}
              y={Math.min(184, Math.max(14, 88 - Math.sin((az * Math.PI) / 180) * 88))}
              textAnchor="middle"
              fill={BEAM}
              fontFamily="var(--font-mono), monospace"
              fontSize="8"
            >
              ψ = {fmt(az, 0)}°
            </text>
            <text x="106" y="190" textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
              {ell.handedness === "linear" ? "linear" : `${ell.handedness} elliptical`} · χ = {fmt(bench.ellipticityDeg, 1)}°
            </text>
          </>
        ) : (
          <text x="106" y="98" textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="10">
            no light
          </text>
        )}
        <text x="188" y="106" textAnchor="end" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
          x
        </text>
        <text x="112" y="18" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
          y
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Poincaré sphere                                                             */
/* -------------------------------------------------------------------------- */

function PoincareSphere({ point, trail }: { point: PoincarePoint; trail: PoincarePoint[] }) {
  const [yaw, setYaw] = useState(0.55);
  const [pitch, setPitch] = useState(0.32);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const cx = 160;
  const cy = 148;
  const R = 88;

  const project = (x: number, y: number, z: number): { sx: number; sy: number; depth: number } => {
    const cyaw = Math.cos(yaw);
    const syaw = Math.sin(yaw);
    const x1 = x * cyaw - y * syaw;
    const y1 = x * syaw + y * cyaw;
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const depth = y1 * cp - z * sp;
    const up = y1 * sp + z * cp;
    return { sx: cx + R * x1, sy: cy - R * up, depth };
  };

  const path = (fn: (t: number) => [number, number, number], n = 72): string =>
    Array.from({ length: n + 1 }, (_, i) => {
      const [x, y, z] = fn((i / n) * Math.PI * 2);
      const p = project(x, y, z);
      return `${i === 0 ? "M" : "L"} ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`;
    }).join(" ");

  const labels: { text: string; pos: [number, number, number] }[] = [
    { text: "H", pos: [1.16, 0, 0] },
    { text: "V", pos: [-1.16, 0, 0] },
    { text: "D", pos: [0, 1.16, 0] },
    { text: "A", pos: [0, -1.16, 0] },
    { text: "R", pos: [0, 0, 1.16] },
    { text: "L", pos: [0, 0, -1.16] }
  ];

  const state = project(point.x, point.y, point.z);
  const trailPoints = trail.map((p) => project(p.x, p.y, p.z));

  return (
    <div className="border border-line bg-paper-2 p-2">
      <div className="mb-1 flex items-baseline justify-between px-1">
        <p className="label text-[0.55rem]">Poincaré sphere</p>
        <p className="font-mono text-[0.55rem] text-muted">drag / arrows</p>
      </div>
      <svg
        viewBox="0 0 320 300"
        className="h-auto w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        tabIndex={0}
        aria-label={`Poincaré sphere with the state at S1 ${fmt(point.x, 2)}, S2 ${fmt(point.y, 2)}, S3 ${fmt(point.z, 2)} and degree of polarization ${fmt(point.dop, 2)}. Drag or use the arrow keys to rotate the view.`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const dx = event.clientX - drag.current.x;
          const dy = event.clientY - drag.current.y;
          drag.current = { x: event.clientX, y: event.clientY };
          setYaw((v) => v + dx * 0.01);
          setPitch((v) => Math.min(1.3, Math.max(-1.3, v + dy * 0.01)));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setYaw((v) => v - 0.12);
          else if (event.key === "ArrowRight") setYaw((v) => v + 0.12);
          else if (event.key === "ArrowUp") setPitch((v) => Math.min(1.3, v + 0.1));
          else if (event.key === "ArrowDown") setPitch((v) => Math.max(-1.3, v - 0.1));
          else return;
          event.preventDefault();
        }}
      >
        <rect width="320" height="300" fill={PAPER} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={LINE} strokeWidth="1.2" />
        <path d={path((t) => [Math.cos(t), Math.sin(t), 0])} fill="none" stroke={LINE} strokeWidth="0.8" opacity="0.9" />
        <path d={path((t) => [0, Math.cos(t), Math.sin(t)])} fill="none" stroke={LINE} strokeWidth="0.8" strokeDasharray="3 3" />
        <path d={path((t) => [Math.cos(t), 0, Math.sin(t)])} fill="none" stroke={LINE} strokeWidth="0.8" strokeDasharray="3 3" />

        {/* axes */}
        {[
          { a: project(-1, 0, 0), b: project(1, 0, 0), color: MUTED },
          { a: project(0, -1, 0), b: project(0, 1, 0), color: MUTED },
          { a: project(0, 0, -1), b: project(0, 0, 1), color: MUTED }
        ].map((axis, i) => (
          <line key={i} x1={axis.a.sx} y1={axis.a.sy} x2={axis.b.sx} y2={axis.b.sy} stroke={axis.color} strokeWidth="0.7" opacity="0.6" />
        ))}

        {labels.map((label) => {
          const p = project(label.pos[0], label.pos[1], label.pos[2]);
          return (
            <text key={label.text} x={p.sx} y={p.sy + 3} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
              {label.text}
            </text>
          );
        })}

        {trailPoints.length > 1 ? (
          <polyline
            points={trailPoints.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ")}
            fill="none"
            stroke={BEAM}
            strokeWidth="1.1"
            opacity="0.45"
          />
        ) : null}
        {trailPoints.map((p, i) => (
          <circle key={i} cx={p.sx} cy={p.sy} r="1.5" fill={BEAM} opacity={0.08 + (0.32 * i) / Math.max(1, trailPoints.length - 1)} />
        ))}

        <line x1={cx} y1={cy} x2={state.sx} y2={state.sy} stroke={INK} strokeWidth="0.7" strokeDasharray="2 2" opacity="0.5" />
        <circle cx={state.sx} cy={state.sy} r="5" fill={BEAM} stroke={PAPER} strokeWidth="1" />
        <text x={Math.min(300, state.sx + 8)} y={Math.max(14, state.sy - 8)} fill={BEAM} fontFamily="var(--font-mono), monospace" fontSize="8">
          state
        </text>

        <text x="160" y="288" textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize="8">
          |s| = DoP = {fmt(point.dop, 2)}
        </text>
      </svg>
      <p className="px-1 text-[0.6rem] leading-snug text-muted">
        Equator: linear states. Poles: circular. Antipodal points are orthogonal.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Matrix panel                                                                */
/* -------------------------------------------------------------------------- */

function MatrixBox({ title, rows, note }: { title: string; rows: string[][]; note?: string }) {
  return (
    <div className="min-w-0 border border-line bg-paper-2 p-2">
      <p className="label mb-1 text-[0.52rem]">{title}</p>
      <div className="flex items-stretch gap-1">
        <span aria-hidden className="w-[3px] border-y border-l border-line-strong" />
        <div className="grid flex-1 grid-cols-2 gap-x-2 gap-y-0.5 py-1 font-mono text-[0.62rem] leading-tight text-ink">
          {rows.map((row, ri) =>
            row.map((cell, ci) => (
              <span key={`${ri}-${ci}`} className="text-right">
                {cell}
              </span>
            ))
          )}
        </div>
        <span aria-hidden className="w-[3px] border-y border-r border-line-strong" />
      </div>
      {note ? <p className="mt-1 font-mono text-[0.52rem] leading-snug text-muted">{note}</p> : null}
    </div>
  );
}

function MatrixPanel({ bench }: { bench: BenchResult }) {
  const identity = [
    ["1", "0"],
    ["0", "1"]
  ];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MatrixBox
          title="P(θ)"
          rows={bench.polarizerMatrix ? formatMatrix(bench.polarizerMatrix) : identity}
          note={bench.polarizerMatrix ? `θ = ${bench.config.polarizerAngleDeg}°` : "not inserted"}
        />
        <MatrixBox
          title="W(α, δ)"
          rows={bench.plateMatrix ? formatMatrix(bench.plateMatrix) : identity}
          note={bench.plateMatrix ? `α = ${bench.config.plateAngleDeg}°, δ = ${Math.round(bench.retardanceDeg)}°` : "not inserted"}
        />
        <MatrixBox title="A(φ)" rows={formatMatrix(bench.analyzerMatrix)} note={`φ = ${bench.config.analyzerAngleDeg}°`} />
      </div>
      <div className="border border-line bg-paper-3/50 px-2.5 py-2 font-mono text-[0.62rem] leading-relaxed text-ink-2">
        <p>
          <span className="text-muted">J at analyser = </span>
          {formatJones(bench.afterPlate)}
        </p>
        <p className="mt-0.5">
          <span className="text-muted">J detected = </span>
          {formatJones(bench.output)}
        </p>
      </div>
      <p className="text-[0.6rem] leading-snug text-muted">
        Read-only. Matrices are applied in the order source → P → W → A; the rightmost factor acts first.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Guided checklist                                                            */
/* -------------------------------------------------------------------------- */

function CheckRow({ done, children }: { done: boolean; children: string }) {
  return (
    <li className="flex items-start gap-2 text-[0.68rem] leading-snug">
      <span
        aria-hidden
        className={`mt-[3px] inline-block h-[7px] w-[7px] shrink-0 border ${done ? "border-petrol bg-petrol" : "border-line-strong bg-paper"}`}
      />
      <span className={done ? "text-ink" : "text-muted"}>{children}</span>
      <span className="sr-only">{done ? "done" : "not yet"}</span>
    </li>
  );
}

function GuidedBench({ bench }: { bench: BenchResult }) {
  const config = bench.config;
  const delta = (((config.analyzerAngleDeg - (config.polarizerAngleDeg + 90)) % 180) + 180) % 180;
  const analyserCrossed = delta < 2 || delta > 178;
  const crossed = config.polarizerEnabled && analyserCrossed;
  const plateIn = config.plate === "half" && Math.abs(config.plateAngleDeg - 22.5) <= 1;
  const recovered = plateIn && analyserCrossed && Math.abs(bench.transmitted - 0.5) <= 0.03;
  const crossedText = (config.polarizerAngleDeg + 90) % 180;
  return (
    <div className="border border-line bg-paper-2 p-3">
      <p className="label mb-2 text-[0.55rem]">Guided sequence · live check</p>
      <ol className="space-y-2">
        <CheckRow done={crossed}>
          {`Cross the polarizers: set the analyser near ${crossedText}° with the polarizer at ${config.polarizerAngleDeg}°.`}
        </CheckRow>
        <CheckRow done={plateIn}>Insert the λ/2 plate at 22.5°; it rotates the linear state by 45°.</CheckRow>
        <CheckRow done={recovered}>Recover 50 %: the crossed analyser now transmits cos²45°.</CheckRow>
      </ol>
      <p className="mt-2 border-t border-line pt-2 text-[0.62rem] leading-snug text-muted">
        A wave plate between crossed polarizers does not add light; it changes the state so that light the analyser would have blocked is now
        projected onto its axis.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bench lab                                                                   */
/* -------------------------------------------------------------------------- */

function BenchLab({ config, trail }: { config: BenchConfig; trail: PoincarePoint[] }) {
  const bench = useMemo(() => runBench(config), [config]);
  const point = useMemo(() => poincareFromStokes(bench.stateStokes), [bench.stateStokes]);
  const malus = useMemo(() => benchMalusCurve(bench.stateStokes, 180), [bench.stateStokes]);
  const s0 = bench.stateStokes.S0;
  const norm = (v: number) => (s0 > 1e-9 ? v / s0 : 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <FieldCanvas jones={bench.afterPlate} />
        <div className="grid gap-3 sm:grid-cols-2">
          <EllipseDiagram bench={bench} />
          <PoincareSphere point={point} trail={trail} />
        </div>
      </div>

      <div className="border border-line bg-paper-2 p-2">
        <BenchChain bench={bench} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="border border-line bg-paper-2 p-3">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="label text-[0.55rem]">Malus curve at the analyser</p>
            <p className="font-mono text-[0.6rem] text-muted">
              current φ = {bench.config.analyzerAngleDeg}° · T = {pct(bench.transmitted)}
            </p>
          </div>
          <LabLineChart
            data={malus}
            series={[{ key: "y", label: "Transmission", color: BEAM, width: 1.6 }]}
            xKey="x"
            xLabel="Analyser angle (°)"
            yLabel="I / I₀"
            height={208}
            domain={[0, 180]}
            yDomain={[0, 1]}
            referenceX={bench.config.analyzerAngleDeg}
            referenceY={bench.transmitted}
            showLegend={false}
          />
          <p className="sr-only">
            Sampled Malus curve from 0 to 180 degrees. The current analyser angle is {bench.config.analyzerAngleDeg} degrees and the
            transmitted fraction is {pct(bench.transmitted)} percent. The state arriving at the analyser has azimuth{" "}
            {fmt(bench.azimuthDeg, 1)} degrees and degree of polarization {fmt(bench.dop, 2)}.
          </p>
          <p className="mt-1 text-[0.62rem] leading-snug text-muted">
            Dashed lines mark the current analyser angle and the transmitted fraction. The curve is computed from the Stokes vector of the
            state arriving at the analyser, so it stays correct when the plate makes the state elliptical.
          </p>
        </div>

        <div className="space-y-3">
          <MatrixPanel bench={bench} />
          <div className="border border-line bg-paper-2 px-3 py-2">
            <p className="label mb-1 text-[0.55rem]">State arriving at the analyser</p>
            <p className="text-[0.78rem] leading-snug text-ink">{bench.classification}</p>
            <dl className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 font-mono text-[0.62rem]">
              <div>
                <dt className="text-muted">ψ</dt>
                <dd className="text-ink">{fmt(bench.azimuthDeg, 1)}°</dd>
              </div>
              <div>
                <dt className="text-muted">χ</dt>
                <dd className="text-ink">{fmt(bench.ellipticityDeg, 1)}°</dd>
              </div>
              <div>
                <dt className="text-muted">DoP</dt>
                <dd className="text-ink">{fmt(bench.dop, 3)}</dd>
              </div>
              <div>
                <dt className="text-muted">S₀</dt>
                <dd className="text-ink">{fmt(s0, 2)}</dd>
              </div>
              <div>
                <dt className="text-muted">S₁/S₀</dt>
                <dd className="text-ink">{fmt(norm(bench.stateStokes.S1), 2)}</dd>
              </div>
              <div>
                <dt className="text-muted">S₂/S₀</dt>
                <dd className="text-ink">{fmt(norm(bench.stateStokes.S2), 2)}</dd>
              </div>
              <div>
                <dt className="text-muted">S₃/S₀</dt>
                <dd className="text-ink">{fmt(norm(bench.stateStokes.S3), 2)}</dd>
              </div>
            </dl>
          </div>
          <GuidedBench bench={bench} />
        </div>
      </div>

    </div>
  );
}

function BenchControls({ config, onChange }: { config: BenchConfig; onChange: (next: BenchConfig) => void }) {
  const plateOptions: { value: PlateKind; label: string }[] = [
    { value: "none", label: "None" },
    { value: "half", label: "λ/2" },
    { value: "quarter", label: "λ/4" },
    { value: "custom", label: "Custom" }
  ];
  return (
    <div className="space-y-4">
      <div>
        <p className="label mb-1.5">Source state</p>
        <SegmentedControl
          ariaLabel="Source polarization preset"
          value={config.source}
          onChange={(value: SourcePresetId) => onChange({ ...config, source: value })}
          options={SOURCE_PRESETS.map((preset) => ({ value: preset.id, label: preset.label, title: preset.note }))}
        />
        <p className="mt-1 text-[0.62rem] leading-snug text-muted">
          {SOURCE_PRESETS.find((preset) => preset.id === config.source)?.note ?? "Arbitrary state"}
        </p>
      </div>

      {config.source === "custom" ? (
        <div className="space-y-3">
          <Slider
            label="Source azimuth ψ"
            value={config.sourceAzimuthDeg}
            min={-90}
            max={90}
            step={1}
            unit="°"
            onChange={(value) => onChange({ ...config, sourceAzimuthDeg: value })}
          />
          <Slider
            label="Source ellipticity χ"
            value={config.sourceEllipticityDeg}
            min={-45}
            max={45}
            step={1}
            unit="°"
            onChange={(value) => onChange({ ...config, sourceEllipticityDeg: value })}
            hint="χ = ±45° is circular; 0° is linear."
          />
        </div>
      ) : null}

      <div className="border-t border-line pt-3">
        <Toggle
          label="Polarizer in the beam"
          checked={config.polarizerEnabled}
          onChange={(value) => onChange({ ...config, polarizerEnabled: value })}
          hint="The first polarizer turns an unpolarized source into a known linear state (and costs half the light)."
        />
        <div className="mt-2">
          <Slider
            label="Polarizer angle θ"
            value={config.polarizerAngleDeg}
            min={0}
            max={180}
            step={1}
            unit="°"
            disabled={!config.polarizerEnabled}
            onChange={(value) => onChange({ ...config, polarizerAngleDeg: value })}
          />
        </div>
      </div>

      <div className="border-t border-line pt-3">
        <p className="label mb-1.5">Retarder</p>
        <SegmentedControl
          ariaLabel="Retarder type"
          value={config.plate}
          onChange={(value: PlateKind) => onChange({ ...config, plate: value })}
          options={plateOptions}
        />
        <div className="mt-2 space-y-3">
          <Slider
            label="Fast-axis angle α"
            value={config.plateAngleDeg}
            min={0}
            max={180}
            step={0.5}
            unit="°"
            disabled={config.plate === "none"}
            onChange={(value) => onChange({ ...config, plateAngleDeg: value })}
            hint="For H input: α = 45° makes the plate act as an exchange; α = 22.5° rotates H to D."
          />
          {config.plate === "custom" ? (
            <Slider
              label="Retardance δ"
              value={config.customRetardanceDeg}
              min={0}
              max={360}
              step={5}
              unit="°"
              onChange={(value) => onChange({ ...config, customRetardanceDeg: value })}
              hint="90° = quarter wave, 180° = half wave."
            />
          ) : null}
        </div>
      </div>

      <div className="border-t border-line pt-3">
        <Slider
          label="Analyser angle φ"
          value={config.analyzerAngleDeg}
          min={0}
          max={180}
          step={1}
          unit="°"
          onChange={(value) => onChange({ ...config, analyzerAngleDeg: value })}
        />
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Stereo patterns                                                             */
/* -------------------------------------------------------------------------- */

function LeftPattern({ color, opacity, offset = 0 }: { color: string; opacity: number; offset?: number }) {
  return (
    <g transform={`translate(${offset} 0)`} opacity={opacity} stroke={color} fill="none" strokeWidth="2">
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`l-${i}`} x1={26 + i * 24} y1={18} x2={26 + i * 24 - 34} y2={166} />
      ))}
      <circle cx="136" cy="92" r="44" strokeWidth="2.4" />
      <circle cx="136" cy="92" r="25" strokeDasharray="5 4" strokeWidth="1.4" />
      <line x1="92" y1="92" x2="180" y2="92" strokeWidth="1.2" strokeDasharray="2 4" />
    </g>
  );
}

function RightPattern({ color, opacity, offset = 0 }: { color: string; opacity: number; offset?: number }) {
  return (
    <g transform={`translate(${offset} 0)`} opacity={opacity} stroke={color} fill="none" strokeWidth="2">
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`r-${i}`} x1={20} y1={26 + i * 18} x2={242} y2={26 + i * 18} />
      ))}
      <path d="M 152 34 L 214 148 L 90 148 Z" strokeWidth="2.4" />
      <path d="M 152 72 L 180 126 L 124 126 Z" strokeWidth="1.2" strokeDasharray="4 3" />
    </g>
  );
}

function EyePanel({ side, result }: { side: "left" | "right"; result: CinemaResult }) {
  const own = side === "left" ? result.left.wanted : result.right.wanted;
  const ghost = side === "left" ? result.left.leak : result.right.leak;
  const ownLabel = side === "left" ? "own image" : "own image";
  return (
    <figure className="min-w-0">
      <div className="border border-line bg-[#12120f]">
        <svg
          viewBox="0 0 260 180"
          className="h-auto w-full"
          role="img"
          aria-label={`${side} eye view: own pattern at ${pct(own)} percent, ghost of the opposite pattern at ${pct(ghost)} percent.`}
        >
          <rect width="260" height="180" fill="#12120f" />
          {side === "left" ? (
            <>
              <LeftPattern color="#F3EEE3" opacity={clamp01(own)} />
              <RightPattern color="#D9775C" opacity={clamp01(ghost * 1.4)} />
            </>
          ) : (
            <>
              <RightPattern color="#F3EEE3" opacity={clamp01(own)} />
              <LeftPattern color="#7FB3A8" opacity={clamp01(ghost * 1.4)} />
            </>
          )}
          <text x="12" y="16" fill="#F3EEE3" fontFamily="var(--font-mono), monospace" fontSize="9" opacity="0.8">
            {side === "left" ? "LEFT EYE" : "RIGHT EYE"}
          </text>
        </svg>
      </div>
      <figcaption className="mt-1 flex items-baseline justify-between gap-2 text-[0.62rem] leading-snug text-muted">
        <span>{ownLabel}</span>
        <span className="num text-ink">ghost {pct(ghost)}%</span>
      </figcaption>
    </figure>
  );
}

function CombinedView({ result }: { result: CinemaResult }) {
  return (
    <figure className="min-w-0">
      <div className="border border-line bg-paper-2">
        <svg
          viewBox="0 0 260 180"
          className="h-auto w-full"
          role="img"
          aria-label={`Illustrative combined view: left pattern at ${pct(result.left.wanted)} percent in petrol, right pattern at ${pct(result.right.wanted)} percent in vermilion, with each ghost at ${pct(result.left.leak)} and ${pct(result.right.leak)} percent.`}
        >
          <rect width="260" height="180" fill={PAPER} />
          <LeftPattern color="#14524A" opacity={clamp01(result.left.wanted * 0.85)} offset={-5} />
          <RightPattern color="#B23A1E" opacity={clamp01(result.right.wanted * 0.85)} offset={5} />
          <LeftPattern color="#14524A" opacity={clamp01(result.right.leak * 0.8)} offset={5} />
          <RightPattern color="#B23A1E" opacity={clamp01(result.left.leak * 0.8)} offset={-5} />
        </svg>
      </div>
      <figcaption className="mt-1 text-[0.62rem] leading-snug text-muted">
        Illustrative superposition of the two channels and their ghosts — a diagram of the leakage, not a photographic simulation of
        perception.
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Cinema lab                                                                  */
/* -------------------------------------------------------------------------- */

function CinemaLab({ config }: { config: CinemaConfig }) {
  const cinema = useMemo(() => runCinema(config), [config]);
  const tiltData = useMemo(() => crosstalkVsTilt(config, 45, 1), [config]);
  const compare = useMemo(() => {
    const at = (tilt: number, technology: "linear" | "circular") =>
      runCinema({ ...config, technology, headTiltDeg: tilt, ghostFloorPct: config.ghostFloorPct });
    return [
      { tilt: 0, linear: at(0, "linear"), circular: at(0, "circular") },
      { tilt: 30, linear: at(30, "linear"), circular: at(30, "circular") }
    ];
  }, [config]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <EyePanel side="left" result={cinema} />
        <EyePanel side="right" result={cinema} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CombinedView result={cinema} />
        <div className="border border-line bg-paper-2 p-3">
          <p className="label mb-1.5 text-[0.55rem]">Why tilt matters</p>
          <p className="text-[0.72rem] leading-relaxed text-ink-2">
            {config.technology === "linear"
              ? "Linearly polarized images are pinned to the screen's axes. Rotating the glasses by β turns the analyser away from its image: the wanted projection falls as cos²β and the other channel leaks in as sin²β."
              : "Circular states are eigenstates of rotation about the viewing axis. Rotating the glasses does not move the analyser eigenstate away from the image, so the head-tilt term disappears."}
          </p>
          <div className="mt-2 space-y-1.5">
            {compare.map((row) => (
              <div key={row.tilt} className="grid grid-cols-[54px_1fr_1fr] items-baseline gap-2 border-t border-line pt-1.5 font-mono text-[0.62rem]">
                <span className="text-muted">{row.tilt}° tilt</span>
                <span className={config.technology === "linear" ? "text-ink" : "text-muted"}>
                  linear {pct(row.linear.meanCrosstalk)}%
                </span>
                <span className={config.technology === "circular" ? "text-ink" : "text-muted"}>
                  circular {pct(row.circular.meanCrosstalk)}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.62rem] leading-snug text-muted">
            Both columns use the same extinction, screen depolarization and ghost floor as the sliders. Switch technology above to see which
            one the readouts follow.
          </p>
        </div>
      </div>

      <div className="border border-line bg-paper-2 p-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="label text-[0.55rem]">Crosstalk versus head tilt</p>
          <p className="font-mono text-[0.6rem] text-muted">current tilt {config.headTiltDeg}°</p>
        </div>
        <LabLineChart
          data={tiltData}
          series={[
            { key: "linear", label: "Linear ±45°", color: BEAM, width: 1.6 },
            { key: "circular", label: "Circular R/L", color: ACCENT, width: 1.6 }
          ]}
          xKey="tilt"
          xLabel="Head tilt (°)"
          yLabel="Crosstalk (%)"
          height={210}
          domain={[0, 45]}
          yDomain={[0, 50]}
          referenceX={config.headTiltDeg}
          showLegend
        />
        <p className="sr-only">
          Linear crosstalk is {pct(tiltData[0]?.linear ?? 0)} percent at zero tilt and {pct(tiltData[tiltData.length - 1]?.linear ?? 0)}{" "}
          percent at 45 degrees. Circular crosstalk is {pct(tiltData[0]?.circular ?? 0)} percent at zero tilt and{" "}
          {pct(tiltData[tiltData.length - 1]?.circular ?? 0)} percent at 45 degrees.
        </p>
        <p className="mt-1 text-[0.62rem] leading-snug text-muted">
          At 0° both technologies share the same floor, set by analyser extinction and screen depolarization. Only the linear curve rises with
          tilt.
        </p>
      </div>

      <div className="border border-line bg-paper-2 p-3">
        <p className="label mb-1.5 text-[0.55rem]">What the model does and does not claim</p>
        <p className="text-[0.68rem] leading-relaxed text-muted">
          This is an optical channel-separation model, not a commercial cinema. It assumes ideal uniform analysers with a single extinction
          ratio, a screen described by one depolarization number, and no viewer physiology. It deliberately omits projector optics, screen
          microstructure, wavelength-dependent quarter-wave error, viewing-angle gain and perceptual ghost thresholds. Those omissions are the
          reason a real installation must be measured, not predicted from two sliders.
        </p>
      </div>

    </div>
  );
}

function CinemaControls({ config, onChange }: { config: CinemaConfig; onChange: (next: CinemaConfig) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="label mb-1.5">Stereo technology</p>
        <SegmentedControl
          ariaLabel="Stereo technology"
          value={config.technology}
          onChange={(value: "linear" | "circular") => onChange({ ...config, technology: value })}
          options={[
            { value: "linear", label: "Linear ±45°" },
            { value: "circular", label: "Circular R/L" }
          ]}
        />
      </div>
      <Slider
        label="Head tilt β"
        value={config.headTiltDeg}
        min={0}
        max={45}
        step={1}
        unit="°"
        onChange={(value) => onChange({ ...config, headTiltDeg: value })}
        hint="Rotation of the glasses about the viewing axis. Linear leakage grows as sin²β; circular is invariant."
      />
      <Slider
        label="Analyser extinction"
        value={config.extinctionDb}
        min={10}
        max={60}
        step={1}
        unit="dB"
        onChange={(value) => onChange({ ...config, extinctionDb: value })}
        hint="A model input, not a product specification. 30 dB means the crossed lens leaks 0.1 %."
      />
      <Slider
        label="Screen depolarization"
        value={config.depolarization}
        min={0}
        max={0.3}
        step={0.005}
        format={(value) => `${(value * 100).toFixed(1)} %`}
        onChange={(value) => onChange({ ...config, depolarization: value })}
        hint="Fraction of the image the screen fully depolarizes. A matte screen is far worse than this model's upper limit."
      />
      <Slider
        label="Ghost floor (scatter / transport)"
        value={config.ghostFloorPct}
        min={0}
        max={5}
        step={0.1}
        unit="%"
        onChange={(value) => onChange({ ...config, ghostFloorPct: value })}
        hint="Unpolarized leakage added to the opposite channel. It sets a floor no glasses can remove."
      />
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Top-level component                                                         */
/* -------------------------------------------------------------------------- */

export default function Simulation() {
  const [tab, setTab] = useState<"bench" | "cinema">("bench");
  const [benchConfig, setBenchConfig] = useState<BenchConfig>(DEFAULT_BENCH);
  const [cinemaConfig, setCinemaConfig] = useState<CinemaConfig>(DEFAULT_CINEMA);
  const [trail, setTrail] = useState<PoincarePoint[]>([]);

  const bench = useMemo(() => runBench(benchConfig), [benchConfig]);
  const point = useMemo(() => poincareFromStokes(bench.stateStokes), [bench.stateStokes]);
  const cinema = useMemo(() => runCinema(cinemaConfig), [cinemaConfig]);

  useEffect(() => {
    if (point.dop < 1e-6) return;
    setTrail((previous) => {
      const last = previous[previous.length - 1];
      if (last && Math.hypot(last.x - point.x, last.y - point.y, last.z - point.z) < 0.004) return previous;
      return [...previous, { x: point.x, y: point.y, z: point.z, dop: point.dop }].slice(-64);
    });
  }, [point]);

  const reset = () => {
    setBenchConfig(DEFAULT_BENCH);
    setCinemaConfig(DEFAULT_CINEMA);
    setTrail([]);
    setTab("bench");
  };

  const benchReadouts: Readout[] = [
    { label: "Transmitted", value: pct(bench.transmitted), unit: "%", tone: "accent" },
    { label: "State", value: bench.classification },
    { label: "S₀", value: fmt(bench.stateStokes.S0, 2) },
    { label: "DoP", value: fmt(bench.dop, 3) },
    { label: "Azimuth ψ", value: fmt(bench.azimuthDeg, 1), unit: "°" },
    { label: "Ellipticity χ", value: fmt(bench.ellipticityDeg, 1), unit: "°" },
    { label: "S₃ / S₀", value: fmt(bench.stateStokes.S0 > 0 ? bench.stateStokes.S3 / bench.stateStokes.S0 : 0, 2) },
    { label: "Analyser", value: String(benchConfig.analyzerAngleDeg), unit: "°" }
  ];

  const cinemaReadouts: Readout[] = [
    { label: "Left leakage", value: pct(cinema.left.leak), unit: "%", tone: cinema.left.leak > 0.05 ? "warn" : "default" },
    { label: "Right leakage", value: pct(cinema.right.leak), unit: "%", tone: cinema.right.leak > 0.05 ? "warn" : "default" },
    { label: "Crosstalk", value: pct(cinema.meanCrosstalk), unit: "%", tone: "accent" },
    { label: "Contrast", value: Number.isFinite(cinema.meanContrast) ? fmt(cinema.meanContrast, 1) : "∞" },
    { label: "Wanted · L", value: pct(cinema.left.wanted), unit: "%" },
    { label: "Wanted · R", value: pct(cinema.right.wanted), unit: "%" },
    { label: "Head tilt", value: String(cinemaConfig.headTiltDeg), unit: "°" },
    { label: "Technology", value: cinemaConfig.technology === "linear" ? "linear" : "circular" }
  ];

  return (
    <SimulatorShell
      title="POL-05 · Polarization bench and stereo projector"
      subtitle="Jones calculus on a real optical train; Stokes channels for a passive 3D pair"
      badge={<Badge tone="brass">Jones + Mueller</Badge>}
      spec={SIMULATION_SPEC}
      onReset={reset}
      readouts={tab === "bench" ? benchReadouts : cinemaReadouts}
      controls={tab === "bench" ? <BenchControls config={benchConfig} onChange={setBenchConfig} /> : <CinemaControls config={cinemaConfig} onChange={setCinemaConfig} />}
      guidedNote="Bench: cross the polarizers to minimum, insert the λ/2 plate at 22.5° and recover 50 %. Cinema: compare head tilt 0° with 30° for linear and circular glasses."
      freeNote="All parameters are unlocked. Watch the ellipticity and DoP readouts when a retardance leaves its nominal quarter- or half-wave value; the model remains exact for ideal elements."
      footer={
        <p className="text-[0.65rem] leading-relaxed text-muted">
          Two coupled models: a fully polarized Jones train and a partially polarized Stokes channel model. Ideal elements, monochromatic light,
          no projector or viewer physiology. Use the Model button for the full disclosure.
        </p>
      }
    >
      <div className="space-y-4">
        <Tabs
          items={[
            { id: "bench", label: "Polarization bench", meta: "Jones · Malus · Poincaré" },
            { id: "cinema", label: "3D cinema", meta: "Stokes · crosstalk · head tilt" }
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === "bench" ? <BenchLab config={benchConfig} trail={trail} /> : <CinemaLab config={cinemaConfig} />}
      </div>
    </SimulatorShell>
  );
}
