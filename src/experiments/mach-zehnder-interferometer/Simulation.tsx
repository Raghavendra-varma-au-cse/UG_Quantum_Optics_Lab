"use client";

import { useMemo, useState } from "react";
import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { SegmentedControl, Slider, Toggle } from "@/components/ui/Controls";
import { Badge, DataTable, EmptyState } from "@/components/ui/primitives";
import { LabLineChart } from "@/components/viz/Plot";
import { cArg, rad2deg, wrapPhase, type Complex } from "@/lib/physics/complex";
import type { SimulationSpec } from "@/lib/content/types";
import {
  OPD_NM_PER_FRINGE,
  countPhotons,
  pathDifferenceFromPhase,
  phaseFromDegrees,
  phaseFromPathDifference,
  scanPhase,
  simulateMachZehnder,
  type MzResult,
  type PhotonCounts
} from "./physics";

const INK = "#171713";
const MUTED = "#6E6A5E";
const LINE = "#B8B1A0";
const BEAM = "#B23A1E";
const PETROL = "#14524A";
const BRASS = "#9A7527";
const GLASS = "#E9E4D8";
const PAPER = "#FBF9F4";

type SourceMode = "classical" | "photon";

const SIMULATION_SPEC: SimulationSpec = {
  model:
    "Scalar monochromatic fields at 632.8 nm propagate through two ideal unitary 2×2 beam-splitter matrices. Path A (reflected) carries phase 0 and path B (transmitted) carries the adjustable phase φ. A coherence factor γ multiplies the interference term; blocking an arm removes its amplitude. Output probabilities P0 and P1 are normalised to one when both arms are open. Photon counts are independent Bernoulli trials from a seeded generator.",
  approximations: [
    "Paraxial, scalar, monochromatic light at 632.8 nm",
    "Ideal lossless beam splitters with one power reflectivity",
    "Perfect spatial-mode overlap and parallel polarizations",
    "Coherence factor applied only to the interference term",
    "Ideal detectors with no dark counts, dead time or afterpulsing",
    "No dynamic vibration, thermal drift or air turbulence"
  ],
  validity: [
    "Beam-splitter reflectivities between 20% and 80%",
    "Coherence factor between 0 and 1",
    "Arbitrary relative phase, including phase from a path difference",
    "One transverse mode per arm",
    "Photon counts interpreted as independent trials"
  ],
  exclusions: [
    "No genuine single-photon source, heralding or coincidence detection",
    "No detector efficiency, dark counts or dead time",
    "No spatial-mode mismatch, beam walk or multi-mode interference",
    "No thermal, acoustic or air-current dynamics",
    "No claim that counts from the classical kit are photon-counting measurements",
    "No polarizing beam-splitter physics"
  ],
  validation: [
    "B(η) is unitary for reflectivities from 0.2 to 0.8",
    "P0 + P1 = 1 for all phases when both arms are open",
    "A balanced interferometer has P0 = 0 and P1 = 1 at φ = 0",
    "P0 follows sin²(φ/2) over a full scan",
    "Visibility is 1 when balanced and coherent, and follows the unequal-splitting formula otherwise",
    "Seeded photon counts reproduce exactly and sum to the number sent"
  ],
  stochastic:
    "Mulberry32 is seeded by the seed field. Each photon is one Bernoulli trial: D0 with p0, then D1 with p1, otherwise lost. The same seed reproduces the same run. All counts are SIMULATED."
};

interface PhotonRun {
  counts: PhotonCounts;
  signature: string;
  phaseDeg: number;
  seed: string;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function beamStyle(intensity: number, blocked = false): { strokeWidth: number; strokeOpacity: number; strokeDasharray?: string } {
  const v = clamp01(intensity);
  return {
    strokeWidth: 0.9 + 3.6 * Math.sqrt(v),
    strokeOpacity: blocked ? 0.16 : 0.18 + 0.78 * v,
    strokeDasharray: blocked ? "3 4" : undefined
  };
}

function BeamLine({
  x1,
  y1,
  x2,
  y2,
  intensity,
  blocked = false
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  intensity: number;
  blocked?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={BEAM}
      strokeLinecap="round"
      {...beamStyle(intensity, blocked)}
    />
  );
}

function SplitterSymbol({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={28} height={28} fill="rgba(255,255,255,0.72)" stroke={INK} strokeWidth={1} />
      <line x1={x - 14} y1={y + 14} x2={x + 14} y2={y - 14} stroke={INK} strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={x} y={y + 30} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={9}>
        {label}
      </text>
    </g>
  );
}

function MirrorSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-45)`}>
      <rect x={-19} y={-3} width={38} height={6} fill={GLASS} stroke={INK} strokeWidth={1} />
      <line x1={-19} y1={-5} x2={19} y2={-5} stroke={INK} strokeWidth={0.9} />
    </g>
  );
}

function DetectorSymbol({
  x,
  y,
  label,
  detail,
  probability,
  labelSide
}: {
  x: number;
  y: number;
  label: string;
  detail: string;
  probability: number;
  labelSide: "right" | "left";
}) {
  const anchor = labelSide === "right" ? "start" : "end";
  const textX = x + (labelSide === "right" ? 20 : -20);
  return (
    <g>
      <circle cx={x} cy={y} r={13} fill={PAPER} stroke={INK} strokeWidth={1} />
      <circle cx={x} cy={y} r={4.5} fill={BEAM} opacity={0.12 + 0.85 * clamp01(probability)} />
      <text x={textX} y={y - 2} textAnchor={anchor} fill={INK} fontFamily="var(--font-mono), monospace" fontSize={9}>
        {label}
      </text>
      <text x={textX} y={y + 10} textAnchor={anchor} fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7.5}>
        {detail}
      </text>
      <text x={textX} y={y + 22} textAnchor={anchor} fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7.5}>
        {(probability * 100).toFixed(1)}%
      </text>
    </g>
  );
}

function Bench({
  sim,
  phaseRad,
  sourceMode,
  blockA,
  blockB,
  viewAngle
}: {
  sim: MzResult;
  phaseRad: number;
  sourceMode: SourceMode;
  blockA: boolean;
  blockB: boolean;
  viewAngle: number;
}) {
  const ia = sim.eta1;
  const ib = 1 - sim.eta1;
  const iaPost = sim.intensityA;
  const ibPost = sim.intensityB;
  const needle = wrapPhase(phaseRad);
  const dialX = 650;
  const dialY = 296;
  const dialR = 36;
  const needleX = dialX + dialR * 0.82 * Math.cos(needle);
  const needleY = dialY - dialR * 0.82 * Math.sin(needle);

  return (
    <div style={{ perspective: "1400px" }}>
      <div
        style={{
          transform: `rotateX(${viewAngle}deg) rotateZ(${viewAngle * 0.22}deg)`,
          transformOrigin: "50% 55%",
          transition: "transform 160ms cubic-bezier(0.22, 0.61, 0.36, 1)"
        }}
      >
        <svg
          viewBox="0 0 760 380"
          className="h-auto w-full select-none"
          role="img"
          aria-label={`Mach–Zehnder bench. Path A intensity ${(iaPost * 100).toFixed(0)} percent, path B intensity ${(ibPost * 100).toFixed(0)} percent. Predicted D0 ${(
            sim.p0 * 100
          ).toFixed(1)} percent, D1 ${(sim.p1 * 100).toFixed(1)} percent.${blockA ? " Path A is blocked." : ""}${
            blockB ? " Path B is blocked." : ""
          }`}
        >
          <defs>
            <pattern id="mz-bench-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx={1} cy={1} r={0.7} fill={LINE} />
            </pattern>
          </defs>
          <rect width={760} height={380} fill={PAPER} />
          <rect width={760} height={380} fill="url(#mz-bench-dots)" opacity={0.65} />

          {/* Source */}
          <g>
            <rect x={40} y={238} width={60} height={24} fill={GLASS} stroke={INK} strokeWidth={1} />
            <rect x={84} y={244} width={12} height={12} fill={BEAM} opacity={0.8} />
            <text x={40} y={282} fill={INK} fontFamily="var(--font-mono), monospace" fontSize={9}>
              He–Ne 632.8 nm
            </text>
            <text x={40} y={294} fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7.5}>
              {sourceMode === "photon" ? "single-photon model" : "coherent laser (model)"}
            </text>
          </g>

          {/* Source to BS1 */}
          <BeamLine x1={100} y1={250} x2={196} y2={250} intensity={1} />

          {/* Path A: reflected, upper arm, phase 0 */}
          <BeamLine x1={210} y1={236} x2={210} y2={186} intensity={ia} />
          <BeamLine x1={210} y1={186} x2={210} y2={174} intensity={ia} />
          <BeamLine x1={210} y1={174} x2={210} y2={110} intensity={iaPost} blocked={blockA} />
          <BeamLine x1={210} y1={110} x2={466} y2={110} intensity={iaPost} blocked={blockA} />

          {/* Path B: transmitted, lower arm, phase φ */}
          <BeamLine x1={224} y1={250} x2={350} y2={250} intensity={ib} />
          <BeamLine x1={372} y1={250} x2={480} y2={250} intensity={ib} />
          <BeamLine x1={480} y1={236} x2={480} y2={196} intensity={ib} />
          <BeamLine x1={480} y1={196} x2={480} y2={184} intensity={ib} />
          <BeamLine x1={480} y1={184} x2={480} y2={124} intensity={ibPost} blocked={blockB} />

          {/* Outputs */}
          <BeamLine x1={480} y1={96} x2={480} y2={44} intensity={sim.p0} />
          <BeamLine x1={494} y1={110} x2={634} y2={110} intensity={sim.p1} />

          {/* Optics */}
          <SplitterSymbol x={210} y={250} label="BS1" />
          <SplitterSymbol x={480} y={110} label="BS2" />
          <MirrorSymbol x={210} y={110} />
          <MirrorSymbol x={480} y={250} />

          {/* Phase shifter on path B */}
          <g>
            <rect x={350} y={234} width={22} height={32} fill={GLASS} stroke={INK} strokeWidth={0.9} />
            <line x1={355} y1={237} x2={355} y2={263} stroke={BRASS} strokeWidth={1} />
            <line x1={367} y1={237} x2={367} y2={263} stroke={BRASS} strokeWidth={1} />
            <text x={361} y={228} textAnchor="middle" fill={BRASS} fontFamily="var(--font-mono), monospace" fontSize={8}>
              φ
            </text>
          </g>

          {/* Beam blocks */}
          {blockA ? (
            <g>
              <rect x={196} y={174} width={28} height={12} fill={INK} />
              <rect x={196} y={174} width={28} height={12} fill="url(#mz-bench-dots)" opacity={0.5} />
              <text x={166} y={182} textAnchor="end" fill={BEAM} fontFamily="var(--font-mono), monospace" fontSize={7.5}>
                A blocked
              </text>
            </g>
          ) : null}
          {blockB ? (
            <g>
              <rect x={466} y={184} width={28} height={12} fill={INK} />
              <rect x={466} y={184} width={28} height={12} fill="url(#mz-bench-dots)" opacity={0.5} />
              <text x={504} y={194} fill={BEAM} fontFamily="var(--font-mono), monospace" fontSize={7.5}>
                B blocked
              </text>
            </g>
          ) : null}

          {/* Detectors */}
          <DetectorSymbol
            x={480}
            y={32}
            label="D0"
            detail="dark at φ = 0"
            probability={sim.p0}
            labelSide="right"
          />
          <DetectorSymbol
            x={648}
            y={110}
            label="D1"
            detail="bright at φ = 0"
            probability={sim.p1}
            labelSide="right"
          />

          {/* Path labels */}
          <text x={286} y={100} textAnchor="middle" fill={BEAM} fontFamily="var(--font-mono), monospace" fontSize={8}>
            path A · reflected
          </text>
          <text x={300} y={270} textAnchor="middle" fill={BEAM} fontFamily="var(--font-mono), monospace" fontSize={8}>
            path B · transmitted
          </text>
          <text x={162} y={98} textAnchor="end" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={8}>
            M1
          </text>
          <text x={500} y={272} fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={8}>
            M2
          </text>

          {/* Phase dial */}
          <g>
            <circle cx={dialX} cy={dialY} r={dialR} fill="none" stroke={LINE} strokeWidth={1} />
            <circle cx={dialX} cy={dialY} r={2} fill={INK} />
            {[0, 90, 180, 270].map((deg) => {
              const a = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={dialX + (dialR - 4) * Math.cos(a)}
                  y1={dialY - (dialR - 4) * Math.sin(a)}
                  x2={dialX + dialR * Math.cos(a)}
                  y2={dialY - dialR * Math.sin(a)}
                  stroke={LINE}
                  strokeWidth={0.8}
                />
              );
            })}
            <line x1={dialX} y1={dialY} x2={needleX} y2={needleY} stroke={BEAM} strokeWidth={1.6} />
            <circle cx={needleX} cy={needleY} r={2.4} fill={BEAM} />
            <text x={dialX} y={dialY - dialR - 8} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7.5}>
              φ_eff = {rad2deg(needle).toFixed(0)}°
            </text>
            <text x={dialX} y={dialY + dialR + 12} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7}>
              phase indicator
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function PhasorInset({
  sim,
  phaseRad,
  blockA,
  blockB
}: {
  sim: MzResult;
  phaseRad: number;
  blockA: boolean;
  blockB: boolean;
}) {
  const cx = 100;
  const cy = 88;
  const radius = 62;
  const scale = 100;
  const t1 = Math.sqrt(1 - sim.eta1);
  const t2 = Math.sqrt(1 - sim.eta2);
  const r1 = Math.sqrt(sim.eta1);
  const r2 = Math.sqrt(sim.eta2);
  const uMag = blockB ? 0 : t1 * t2;
  const vMag = blockA ? 0 : r1 * r2;
  const ux = uMag * Math.cos(phaseRad);
  const uy = uMag * Math.sin(phaseRad);
  const vx = -vMag;
  const vy = 0;
  const sx = ux + vx;
  const sy = uy + vy;
  const sumMag = Math.hypot(sx, sy);

  const toX = (x: number): number => cx + x * scale;
  const toY = (y: number): number => cy - y * scale;

  return (
    <div>
      <p className="label mb-2">Phasor sum at D0</p>
      <svg viewBox="0 0 200 176" className="h-auto w-full" role="img" aria-label="Phasor diagram of the two path contributions at port D0">
        <rect width={200} height={176} fill={PAPER} />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={LINE} strokeWidth={0.7} />
        <line x1={cx - radius - 8} y1={cy} x2={cx + radius + 8} y2={cy} stroke={LINE} strokeWidth={0.7} />
        <line x1={cx} y1={cy - radius - 8} x2={cx} y2={cy + radius + 8} stroke={LINE} strokeWidth={0.7} />
        <text x={cx + radius + 10} y={cy + 3} fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7}>
          Re
        </text>
        <text x={cx + 4} y={cy - radius - 10} fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7}>
          Im
        </text>

        {uMag > 1e-9 ? (
          <g>
            <line x1={cx} y1={cy} x2={toX(ux)} y2={toY(uy)} stroke={PETROL} strokeWidth={1.5} />
            <circle cx={toX(ux)} cy={toY(uy)} r={2.6} fill={PETROL} />
            <text x={toX(ux * 0.62) + 4} y={toY(uy * 0.62) - 4} fill={PETROL} fontFamily="var(--font-mono), monospace" fontSize={7}>
              u
            </text>
          </g>
        ) : null}

        {vMag > 1e-9 ? (
          <g>
            <line x1={cx} y1={cy} x2={toX(vx)} y2={toY(vy)} stroke={BRASS} strokeWidth={1.5} />
            <circle cx={toX(vx)} cy={toY(vy)} r={2.6} fill={BRASS} />
            <text x={toX(vx) - 12} y={toY(vy) - 5} fill={BRASS} fontFamily="var(--font-mono), monospace" fontSize={7}>
              v
            </text>
          </g>
        ) : null}

        {sumMag > 1e-9 ? (
          <g>
            <line x1={cx} y1={cy} x2={toX(sx)} y2={toY(sy)} stroke={BEAM} strokeWidth={2} />
            <circle cx={toX(sx)} cy={toY(sy)} r={3.2} fill={BEAM} />
            <text x={toX(sx) + 5} y={toY(sy) + 3} fill={BEAM} fontFamily="var(--font-mono), monospace" fontSize={7}>
              u+v
            </text>
          </g>
        ) : (
          <circle cx={cx} cy={cy} r={3.2} fill={BEAM} />
        )}

        <text x={cx} y={168} textAnchor="middle" fill={MUTED} fontFamily="var(--font-mono), monospace" fontSize={7}>
          {"u = t₁t₂ e^(iφ) · v = −r₁r₂"}
        </text>
      </svg>
      <p className="mt-1 text-[0.58rem] leading-snug text-muted">
        {sim.coherence < 0.999
          ? "Drawn for γ = 1; the probability uses the reduced interference term."
          : "Coherent phasors; the squared resultant is P(D0)."}
      </p>
    </div>
  );
}

function ProbabilityBar({ label, value, color }: { label: string; value: number; color: "vermilion" | "petrol" }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[0.7rem] text-ink-2">{label}</span>
        <span className="num text-[0.7rem] text-ink">{value.toFixed(4)}</span>
      </div>
      <div className="h-[6px] w-full bg-line" aria-hidden>
        <div className={`h-full ${color === "vermilion" ? "bg-vermilion" : "bg-petrol"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatArg(z: Complex): string {
  if (Math.hypot(z.re, z.im) < 1e-9) return "—";
  return `${rad2deg(cArg(z)).toFixed(1)}°`;
}

function CountCard({
  label,
  predicted,
  observed,
  sigma,
  color
}: {
  label: string;
  predicted: number;
  observed: number;
  sigma: number;
  color: "vermilion" | "petrol";
}) {
  return (
    <div className="border border-line bg-paper px-3 py-2">
      <p className="label mb-1">{label}</p>
      <p className="num text-[1.05rem] leading-none text-ink">{observed}</p>
      <p className="mt-1 text-[0.62rem] leading-snug text-muted">
        predicted {predicted.toFixed(1)} ± {sigma.toFixed(1)}
      </p>
      <div className="mt-2 h-[4px] w-full bg-line" aria-hidden>
        <div
          className={`h-full ${color === "vermilion" ? "bg-vermilion" : "bg-petrol"}`}
          style={{ width: `${Math.max(0, Math.min(100, (observed / Math.max(1, predicted + 5 * sigma)) * 100))}%` }}
        />
      </div>
    </div>
  );
}

export default function Simulation() {
  const [phaseDeg, setPhaseDeg] = useState(0);
  const [eta1Pct, setEta1Pct] = useState(50);
  const [eta2Pct, setEta2Pct] = useState(50);
  const [coherencePct, setCoherencePct] = useState(100);
  const [blockA, setBlockA] = useState(false);
  const [blockB, setBlockB] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>("classical");
  const [useOpd, setUseOpd] = useState(false);
  const [opdNm, setOpdNm] = useState(0);
  const [viewAngle, setViewAngle] = useState(0);
  const [photonN, setPhotonN] = useState(400);
  const [seed, setSeed] = useState("mz-02");
  const [run, setRun] = useState<PhotonRun | null>(null);

  const phaseRad = phaseFromDegrees(phaseDeg) + (useOpd ? phaseFromPathDifference(opdNm) : 0);
  const sim = simulateMachZehnder({
    phaseRad,
    eta1: eta1Pct / 100,
    eta2: eta2Pct / 100,
    coherence: coherencePct / 100,
    blockA,
    blockB
  });

  const scan = useMemo(
    () =>
      scanPhase(
        {
          eta1: eta1Pct / 100,
          eta2: eta2Pct / 100,
          coherence: coherencePct / 100,
          blockA,
          blockB
        },
        361
      ),
    [eta1Pct, eta2Pct, coherencePct, blockA, blockB]
  );

  const chartData = scan.map((point) => ({
    phaseDeg: point.phaseDeg,
    p0: point.p0,
    p1: point.p1,
    total: point.total
  }));

  const effectiveDeg = rad2deg(phaseRad);
  const equivalentOpdNm = pathDifferenceFromPhase(phaseRad);
  const signature = `${phaseDeg}|${eta1Pct}|${eta2Pct}|${coherencePct}|${blockA}|${blockB}|${useOpd}|${opdNm}|${photonN}|${seed}`;
  const stale = run !== null && run.signature !== signature;

  const readouts: Readout[] = [
    {
      label: "P(D0) dark port",
      value: sim.p0.toFixed(4),
      note: sim.eta1 === 0.5 && sim.eta2 === 0.5 && sim.coherence === 1 && !blockA && !blockB ? "sin²(φ/2)" : "model output"
    },
    {
      label: "P(D1) bright port",
      value: sim.p1.toFixed(4),
      note: "complementary to D0"
    },
    {
      label: "Visibility",
      value: sim.visibility.toFixed(3),
      note: blockA || blockB ? "no interference" : "over a 2π scan"
    },
    {
      label: "P0 + P1",
      value: sim.total.toFixed(4),
      note: sim.loss > 1e-9 ? `loss ${(sim.loss * 100).toFixed(1)}%` : "lossless",
      tone: sim.loss > 1e-9 ? "warn" : "default"
    }
  ];

  function handleReset() {
    setPhaseDeg(0);
    setEta1Pct(50);
    setEta2Pct(50);
    setCoherencePct(100);
    setBlockA(false);
    setBlockB(false);
    setSourceMode("classical");
    setUseOpd(false);
    setOpdNm(0);
    setViewAngle(0);
    setPhotonN(400);
    setSeed("mz-02");
    setRun(null);
  }

  function handleRun() {
    const counts = countPhotons(sim.p0, sim.p1, photonN, seed);
    setRun({
      counts,
      signature,
      phaseDeg: effectiveDeg,
      seed
    });
  }

  const predicted0 = run ? run.counts.n * run.counts.probability0 : 0;
  const predicted1 = run ? run.counts.n * run.counts.probability1 : 0;
  const sigma0 = run ? Math.sqrt(Math.max(0, run.counts.n * run.counts.probability0 * (1 - run.counts.probability0))) : 0;
  const sigma1 = run ? Math.sqrt(Math.max(0, run.counts.n * run.counts.probability1 * (1 - run.counts.probability1))) : 0;

  const eventRows: string[][] =
    run?.counts.events.map((event) => [
      String(event.index),
      event.port === 0 ? "D0" : "D1",
      String(event.count0),
      String(event.count1)
    ]) ?? [];

  const controls = (
    <>
      <Slider
        label="Relative phase φ"
        value={phaseDeg}
        min={-360}
        max={360}
        step={1}
        unit="°"
        onChange={setPhaseDeg}
        format={(v) => `${v.toFixed(0)}`}
        hint="0° gives a dark D0 for a balanced instrument."
      />

      <Toggle
        label="Add path-length difference"
        checked={useOpd}
        onChange={(v) => setUseOpd(v)}
        hint="Adds Δφ = 2πΔL/λ to the phase dial."
      />

      <Slider
        label="Path length difference ΔL"
        value={opdNm}
        min={-OPD_NM_PER_FRINGE}
        max={OPD_NM_PER_FRINGE}
        step={1}
        unit="nm"
        onChange={setOpdNm}
        disabled={!useOpd}
        format={(v) => `${v.toFixed(0)}`}
        hint={`One fringe per ${OPD_NM_PER_FRINGE.toFixed(1)} nm; negative values lengthen the other arm.`}
      />

      <Slider
        label="BS1 reflectivity"
        value={eta1Pct}
        min={20}
        max={80}
        step={1}
        unit="%"
        onChange={setEta1Pct}
        hint="Power reflectivity of the first cube."
      />

      <Slider
        label="BS2 reflectivity"
        value={eta2Pct}
        min={20}
        max={80}
        step={1}
        unit="%"
        onChange={setEta2Pct}
        hint="Power reflectivity of the recombining cube."
      />

      <div>
        <p className="mb-1.5 text-[0.75rem] text-ink-2">Source mode</p>
        <SegmentedControl<SourceMode>
          ariaLabel="Source mode"
          value={sourceMode}
          onChange={setSourceMode}
          options={[
            { value: "classical", label: "Coherent field" },
            { value: "photon", label: "Single photon" }
          ]}
        />
        <p className="mt-1 text-[0.62rem] leading-snug text-muted">
          {sourceMode === "classical"
            ? "A coherent field and photodiode readout. The probabilities are identical."
            : "One photon at a time in the model. Detection is a single click; the probabilities are identical."}
        </p>
      </div>

      <Slider
        label="Coherence / visibility factor γ"
        value={coherencePct}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={setCoherencePct}
        hint="Multiplies the interference term only; the two output probabilities still sum to one."
      />

      <div className="space-y-2 border-t border-line pt-3">
        <Toggle label="Block path A" checked={blockA} onChange={setBlockA} hint="Upper reflected arm." />
        <Toggle label="Block path B" checked={blockB} onChange={setBlockB} hint="Lower transmitted arm." />
      </div>

      <Slider
        label="View angle"
        value={viewAngle}
        min={-30}
        max={30}
        step={1}
        unit="°"
        onChange={setViewAngle}
        format={(v) => `${v.toFixed(0)}`}
        hint="0° is a plan view; tilt for an oblique inspection of the folding."
      />

      <div className="border-t border-line pt-3">
        <p className="label mb-2">Photon counter · simulated</p>
        <Slider
          label="Photons per run N"
          value={photonN}
          min={50}
          max={2000}
          step={50}
          onChange={setPhotonN}
          format={(v) => `${v.toFixed(0)}`}
          hint="Independent Bernoulli trials using the current probabilities."
        />
        <button type="button" className="btn btn-sm mt-2 w-full" onClick={handleRun}>
          Send photons
        </button>
      </div>
    </>
  );

  return (
    <SimulatorShell
      title="Mach–Zehnder bench"
      subtitle="Two paths · unitary splitters · 632.8 nm"
      badge={<Badge tone="slate">Simulated model</Badge>}
      initialMode="guided"
      guidedNote="Set φ = 0 and confirm P(D0) ≈ 0 and P(D1) ≈ 1. Scan φ to 360° to find the next dark fringe. Block path B and observe that the fringe disappears; then enable ΔL and find the path difference that gives the opposite output."
      freeNote="Vary the two splitter ratios independently, lower γ and compare the visibility with the unequal-splitting formula. The photon counter is a separate seeded experiment: it does not change the field probabilities."
      onReset={handleReset}
      seed={seed}
      onSeedChange={(value) => {
        setSeed(value);
        setRun(null);
      }}
      onRandomize={() => {
        setSeed(String(Math.floor(Math.random() * 900000) + 100000));
        setRun(null);
      }}
      readouts={readouts}
      spec={SIMULATION_SPEC}
      controls={controls}
      footer={
        <p className="text-[0.65rem] leading-relaxed text-muted">
          <span className="font-mono uppercase tracking-[0.08em] text-ink">Read this as a model.</span>{" "}
          The laser kit is a classical demonstration. The single-photon mode uses the same unitary algebra but does not claim a
          heralded source, a detector efficiency or a measured count. The seed affects only the simulated photon counts; the
          field probabilities are deterministic.
        </p>
      }
    >
      <div className="space-y-4">
        <div className="border border-line bg-paper-2 p-2 sm:p-3">
          <Bench
            sim={sim}
            phaseRad={phaseRad}
            sourceMode={sourceMode}
            blockA={blockA}
            blockB={blockB}
            viewAngle={viewAngle}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line px-1 pt-2">
            <p className="text-[0.62rem] leading-snug text-muted">
              Beam brightness follows the computed intensity. The phase indicator is the only moving element and is driven by
              φ.
            </p>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
              φ_eff {rad2deg(wrapPhase(phaseRad)).toFixed(1)}° · ΔL_eq {equivalentOpdNm.toFixed(1)} nm
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[190px_minmax(0,1fr)]">
          <div className="border border-line bg-paper-2 p-3">
            <PhasorInset sim={sim} phaseRad={phaseRad} blockA={blockA} blockB={blockB} />
          </div>

          <div className="border border-line bg-paper-2 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="label">Output probabilities</p>
              <span className="num text-[0.68rem] text-muted">V = {sim.visibility.toFixed(3)}</span>
            </div>
            <div className="space-y-3">
              <ProbabilityBar label="P(D0) · dark port" value={sim.p0} color="vermilion" />
              <ProbabilityBar label="P(D1) · bright port" value={sim.p1} color="petrol" />
            </div>
            <div className="mt-4">
              <DataTable
                dense
                caption="Coherent amplitudes at the outputs (γ = 1 limit)"
                head={["Port", "Re(a)", "Im(a)", "|a|²", "arg(a)"]}
                align={["l", "r", "r", "r", "r"]}
                rows={[
                  ["D0", sim.amp0.re.toFixed(3), sim.amp0.im.toFixed(3), sim.coherentP0.toFixed(3), formatArg(sim.amp0)],
                  ["D1", sim.amp1.re.toFixed(3), sim.amp1.im.toFixed(3), sim.coherentP1.toFixed(3), formatArg(sim.amp1)]
                ]}
              />
              {sim.coherence < 0.999 ? (
                <p className="mt-2 text-[0.6rem] leading-snug text-muted">
                  With γ = {sim.coherence.toFixed(2)} the probabilities include the reduced interference term, so P ≠ |a|².
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border border-line bg-paper-2 p-3">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="label">Intensity versus relative phase</p>
            <span className="font-mono text-[0.6rem] text-muted">
              {blockA || blockB ? "one arm blocked: total is the surviving fraction" : "P0 + P1 = 1 across the scan"}
            </span>
          </div>
          <LabLineChart
            data={chartData}
            series={[
              { key: "p0", label: "P(D0)", color: "#B23A1E" },
              { key: "p1", label: "P(D1)", color: "#14524A" },
              { key: "total", label: "P0 + P1", color: "#3D4A55", dashed: true, width: 1 }
            ]}
            xKey="phaseDeg"
            xLabel="Relative phase φ (degrees)"
            yLabel="Probability"
            xUnit="°"
            yUnit=""
            domain={[-180, 180]}
            yDomain={[0, 1.05]}
            referenceX={rad2deg(wrapPhase(phaseRad))}
            height={230}
            showLegend
            digits={3}
          />
        </div>

        <div className="border border-line bg-paper-2 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="label">Photon counter</p>
            <div className="flex items-center gap-2">
              <Badge tone="slate">Simulated</Badge>
              <span className="font-mono text-[0.6rem] text-muted">seed {seed}</span>
            </div>
          </div>

          {run ? (
            <>
              <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
                N = {run.counts.n} photons at φ = {run.phaseDeg.toFixed(1)}°. Each event is a seeded Bernoulli trial; the
                predicted counts are N·p, not measurements.
              </p>
              {stale ? (
                <p className="mt-2 border border-vermilion/40 bg-vermilion-soft/40 px-2 py-1 text-[0.62rem] leading-snug text-vermilion">
                  Parameters changed since this run. Press “Send photons” to sample the current probabilities.
                </p>
              ) : null}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <CountCard label="D0 counts" predicted={predicted0} observed={run.counts.counts0} sigma={sigma0} color="vermilion" />
                <CountCard label="D1 counts" predicted={predicted1} observed={run.counts.counts1} sigma={sigma1} color="petrol" />
              </div>

              {run.counts.lost > 0 ? (
                <p className="mt-2 text-[0.62rem] leading-snug text-muted">
                  {run.counts.lost} photons were lost in the model (blocked arm). The observed fractions are conditional on
                  the photons that reached a detector.
                </p>
              ) : null}

              <div className="mt-4">
                <p className="label mb-2">Last 20 detection events</p>
                {eventRows.length > 0 ? (
                  <DataTable
                    dense
                    head={["Photon #", "Detector", "D0 total", "D1 total"]}
                    align={["r", "l", "r", "r"]}
                    rows={eventRows}
                  />
                ) : (
                  <p className="text-[0.68rem] text-muted">No detections: both paths are blocked or the run was empty.</p>
                )}
              </div>
            </>
          ) : (
            <div className="mt-3">
              <EmptyState title="No photon run yet">
                Set N in the controls and press “Send photons”. The run uses the current probabilities and the seed shown
                above; the same seed reproduces the same events.
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    </SimulatorShell>
  );
}
