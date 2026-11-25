"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { SegmentedControl, Slider, Toggle } from "@/components/ui/Controls";
import { Badge, DataTable } from "@/components/ui/primitives";
import { IntensityCanvas } from "@/components/viz/IntensityCanvas";
import { LabLineChart, type Series } from "@/components/viz/Plot";
import { formatSig, histogram } from "@/lib/physics/stats";
import {
  K_B,
  analyseTrace,
  axialStabilityRatio,
  beamRadiusM,
  boltzmannDensityPerM,
  clausiusMossotti,
  diffusionCoefficientM2S,
  escapeForceN,
  gradientForceN,
  intensityWm2,
  maxGradientForceN,
  naFromWaist,
  peakIntensityWm2,
  rayleighRangeM,
  scatteringForceN,
  simulateBrownian,
  trapDepthKt,
  trapPotentialJ,
  trapStiffnessNm,
  waistFromNaM,
  type BrownianTrace,
  type TweezersParams
} from "./physics";
import { opticalTweezers } from "./content";

const VERM = "#B23A1E";
const PETROL = "#14524A";
const BRASS = "#9A7527";
const SLATE = "#3D4A55";
const MUTED = "#6E6A5E";

const DEFAULTS = {
  powerMw: 150,
  wavelengthNm: 1064,
  na: 1.4,
  waistUm: 0.4637,
  radiusUm: 0.2,
  nParticle: 1.45,
  nMedium: 1.33,
  viscosity: 1.0,
  temperatureK: 298
};

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

const fmt = (value: number, digits = 3) => (Number.isFinite(value) ? formatSig(value, digits) : "—");

type View = "forces" | "brownian" | "spectrum";

interface CalibrationRow {
  run: number;
  seed: string;
  powerMw: number;
  waistUm: number;
  radiusUm: number;
  kModel: number;
  kVariance: number;
  ratio: number;
  fcModel: number;
  fcFit: number;
  varianceNm2: number;
}

export default function Simulation() {
  const [powerMw, setPowerMw] = useState(DEFAULTS.powerMw);
  const [wavelengthNm, setWavelengthNm] = useState(DEFAULTS.wavelengthNm);
  const [focusMode, setFocusMode] = useState<"na" | "waist">("na");
  const [na, setNa] = useState(DEFAULTS.na);
  const [waistUm, setWaistUm] = useState(DEFAULTS.waistUm);
  const [radiusUm, setRadiusUm] = useState(DEFAULTS.radiusUm);
  const [nParticle, setNParticle] = useState(DEFAULTS.nParticle);
  const [nMedium, setNMedium] = useState(DEFAULTS.nMedium);
  const [viscosity, setViscosity] = useState(DEFAULTS.viscosity);
  const [temperatureK, setTemperatureK] = useState(DEFAULTS.temperatureK);
  const [trapOn, setTrapOn] = useState(true);
  const [externalForcePn, setExternalForcePn] = useState(0);
  const [rate, setRate] = useState(1);
  const [dispM, setDispM] = useState(0);
  const [seed, setSeed] = useState("tweezers-08");
  const [view, setView] = useState<View>("forces");
  const [rows, setRows] = useState<CalibrationRow[]>([]);

  const wavelengthM = wavelengthNm * 1e-9;
  const effectiveWaistM =
    focusMode === "na" ? waistFromNaM(wavelengthM, na) : waistUm * 1e-6;
  const derivedNa = naFromWaist(wavelengthM, effectiveWaistM);

  const params = useMemo<TweezersParams>(
    () => ({
      powerW: trapOn ? powerMw / 1000 : 0,
      wavelengthM,
      waistM: effectiveWaistM,
      radiusM: radiusUm * 1e-6,
      nParticle,
      nMedium,
      viscosityPaS: viscosity * 1e-3,
      temperatureK
    }),
    [
      trapOn,
      powerMw,
      wavelengthM,
      effectiveWaistM,
      radiusUm,
      nParticle,
      nMedium,
      viscosity,
      temperatureK
    ]
  );

  const waistM = params.waistM;
  const radiusM = params.radiusM;
  const externalForceN = externalForcePn * 1e-12;
  const rangeM = Math.max(2.5 * waistM, 0.6e-6);
  const rangeNm = rangeM * 1e9;

  const steps = Math.round(clamp(12000 * rate, 4000, 30000));

  const trace = useMemo(
    () =>
      simulateBrownian(params, `${seed}|trace`, {
        steps,
        externalForceN
      }),
    [params, seed, steps, externalForceN]
  );

  const analysis = useMemo(() => analyseTrace(trace, 72), [trace]);

  const metrics = useMemo(() => {
    const k = trapStiffnessNm(params);
    return {
      zr: rayleighRangeM(params),
      peakI: peakIntensityWm2(params),
      grad: gradientForceN(params, dispM),
      scatter: scatteringForceN(params, 0),
      maxGrad: maxGradientForceN(params),
      k,
      depth: trapDepthKt(params),
      fc: trace.cornerHz,
      diffusion: diffusionCoefficientM2S(radiusM, params.viscosityPaS, temperatureK),
      escape: escapeForceN(params),
      ratio: axialStabilityRatio(params),
      attractive: clausiusMossotti(nParticle, nMedium) > 0,
      sizeRatio: radiusM / (wavelengthM / nMedium)
    };
  }, [params, dispM, trace.cornerHz, radiusM, temperatureK, wavelengthM, nMedium, nParticle]);

  const beamMap = useMemo(() => {
    const n = 132;
    const zr = rayleighRangeM(params);
    const zRange = 2.2 * zr;
    const rRange = 2.8 * waistM;
    const values = new Float64Array(n * n);
    for (let iy = 0; iy < n; iy++) {
      const r = ((iy / (n - 1)) * 2 - 1) * rRange;
      for (let ix = 0; ix < n; ix++) {
        const z = ((ix / (n - 1)) * 2 - 1) * zRange;
        values[iy * n + ix] = intensityWm2(params, r, z);
      }
    }
    return { values, zRange, rRange };
  }, [params, waistM]);

  const forceRows = useMemo(() => {
    const count = 161;
    const rMax = 3 * waistM;
    const rowsOut: Record<string, number | null>[] = [];
    for (let i = 0; i < count; i++) {
      const r = -rMax + (2 * rMax * i) / (count - 1);
      const fg = gradientForceN(params, r);
      const scatter = scatteringForceN(params, Math.abs(r));
      const flow = externalForceN;
      rowsOut.push({
        r: r * 1e6,
        gradient: fg * 1e12,
        flow: flow * 1e12,
        total: (fg + flow) * 1e12,
        scattering: scatter * 1e12
      });
    }
    return rowsOut;
  }, [params, waistM, externalForceN]);

  const potentialRows = useMemo(() => {
    const count = 181;
    const rMax = 3 * waistM;
    const rowsOut: Record<string, number | null>[] = [];
    for (let i = 0; i < count; i++) {
      const r = -rMax + (2 * rMax * i) / (count - 1);
      rowsOut.push({
        r: r * 1e6,
        optical: trapPotentialJ(params, r) / (K_B * temperatureK),
        total: (trapPotentialJ(params, r) - externalForceN * r) / (K_B * temperatureK)
      });
    }
    return rowsOut;
  }, [params, waistM, externalForceN, temperatureK]);

  const radialRows = useMemo(() => {
    const count = 121;
    const rMax = 3 * waistM;
    const rowsOut: Record<string, number | null>[] = [];
    for (let i = 0; i < count; i++) {
      const r = (rMax * i) / (count - 1);
      rowsOut.push({
        r: r * 1e6,
        intensity: intensityWm2(params, r, 0) / 1e10
      });
    }
    return rowsOut;
  }, [params, waistM]);

  const traceRows = useMemo(() => {
    const n = trace.x.length;
    const stride = Math.max(1, Math.ceil(n / 560));
    const rowsOut: Record<string, number | null>[] = [];
    const rmsNm = trace.rmsM * 1e9;
    for (let i = 0; i < n; i += stride) {
      rowsOut.push({
        t: trace.t[i]!,
        x: trace.x[i]! * 1e9,
        plus: rmsNm,
        minus: -rmsNm
      });
    }
    return rowsOut;
  }, [trace]);

  const histogramRows = useMemo(() => {
    const sigma = Math.sqrt(Math.max(trace.varianceM2, 0)) || 5e-9;
    const lo = -3.4 * sigma;
    const hi = 3.4 * sigma;
    const bins = histogram(Array.from(trace.x), 41, [lo, hi]);
    const k = trace.stiffnessModelNm;
    return bins.map<Record<string, number | null>>((bin) => ({
      x: bin.x * 1e9,
      measured: bin.density / 1e9,
      boltzmann: k > 0 ? boltzmannDensityPerM(bin.x, k, temperatureK) / 1e9 : null
    }));
  }, [trace, temperatureK]);

  const psdRows = useMemo(() => {
    const rowsOut: Record<string, number | null>[] = [];
    for (let i = 0; i < analysis.periodogram.f.length; i++) {
      const f = analysis.periodogram.f[i]!;
      const measured = analysis.periodogram.s[i]!;
      const model = analysis.psdModel.s[i]!;
      if (!(f > 0) || !(measured > 0)) continue;
      rowsOut.push({
        logF: Math.log10(f),
        measured: Math.log10(measured),
        model: Number.isFinite(model) && model > 0 ? Math.log10(model) : null
      });
    }
    return rowsOut;
  }, [analysis]);

  const stability: Readout = useMemo(() => {
    if (!trapOn) {
      return {
        label: "Stability",
        value: "Beam blocked",
        tone: "warn",
        note: "shutter closed; free diffusion"
      };
    }
    if (!metrics.attractive) {
      return {
        label: "Stability",
        value: "No trap",
        tone: "warn",
        note: "n_p ≤ n_m: gradient force is repulsive"
      };
    }
    if (metrics.ratio >= 1) {
      return {
        label: "Stability",
        value: "Axial escape",
        tone: "warn",
        note: `scattering/gradient = ${metrics.ratio.toFixed(2)}`
      };
    }
    if (externalForceN > Math.max(0, metrics.escape)) {
      return {
        label: "Stability",
        value: "Flow escape",
        tone: "warn",
        note: `flow ${externalForcePn.toFixed(1)} pN > margin`
      };
    }
    if (metrics.ratio > 0.8) {
      return {
        label: "Stability",
        value: "Marginal",
        tone: "warn",
        note: `scattering/gradient = ${metrics.ratio.toFixed(2)}`
      };
    }
    return {
      label: "Stability",
      value: "Stable",
      tone: "accent",
      note: `scattering/gradient = ${metrics.ratio.toFixed(2)}`
    };
  }, [trapOn, metrics, externalForceN, externalForcePn]);

  const readouts: Readout[] = [
    { label: "Beam waist w₀", value: fmt(waistM * 1e6, 3), unit: "µm", note: `NA ≈ ${derivedNa.toFixed(2)} (nominal)` },
    { label: "Rayleigh range", value: fmt(metrics.zr * 1e6, 3), unit: "µm", note: "z_R = πw₀²n/λ" },
    { label: "Peak intensity", value: fmt(metrics.peakI / 1e10, 3), unit: "MW/cm²", note: "2P/(πw₀²)" },
    {
      label: "Gradient at bead",
      value: fmt(Math.abs(metrics.grad) * 1e12, 3),
      unit: "pN",
      note:
        Math.abs(metrics.grad) < 1e-18
          ? "at the focus"
          : metrics.grad < 0
            ? "directed inward"
            : "directed outward"
    },
    { label: "Scattering force", value: fmt(metrics.scatter * 1e12, 3), unit: "pN", note: "axial, +z" },
    { label: "Stiffness k", value: fmt(metrics.k * 1e6, 3), unit: "µN/m", note: "transverse, small-signal" },
    { label: "Trap depth", value: fmt(metrics.depth, 3), unit: "k_BT", note: "Rayleigh estimate" },
    { label: "Corner frequency", value: metrics.fc > 0 ? fmt(metrics.fc, 3) : "—", unit: "Hz", note: "k/(2πγ)" },
    { label: "Diffusion D", value: fmt(metrics.diffusion * 1e12, 3), unit: "µm²/s", note: "k_BT/γ" },
    {
      label: "Escape force",
      value: fmt(Math.max(0, metrics.escape) * 1e12, 3),
      unit: "pN",
      tone: metrics.escape > 0 ? "default" : "warn",
      note: metrics.escape > 0 ? "F_grad,max − F_scat" : "no positive margin"
    },
    stability,
    {
      label: "Rayleigh indicator",
      value: fmt(metrics.sizeRatio, 2),
      unit: "a/λ_m",
      tone: metrics.sizeRatio > 0.1 ? "warn" : "default",
      note: metrics.sizeRatio > 0.1 ? "outside strict a ≪ λ" : "within the dipole regime"
    }
  ];

  const handleFocusMode = (mode: "na" | "waist") => {
    if (mode === "na") {
      setNa(clamp(naFromWaist(wavelengthM, effectiveWaistM), 0.4, 1.4));
    } else {
      setWaistUm(effectiveWaistM * 1e6);
    }
    setFocusMode(mode);
  };

  const reset = () => {
    setPowerMw(DEFAULTS.powerMw);
    setWavelengthNm(DEFAULTS.wavelengthNm);
    setFocusMode("na");
    setNa(DEFAULTS.na);
    setWaistUm(DEFAULTS.waistUm);
    setRadiusUm(DEFAULTS.radiusUm);
    setNParticle(DEFAULTS.nParticle);
    setNMedium(DEFAULTS.nMedium);
    setViscosity(DEFAULTS.viscosity);
    setTemperatureK(DEFAULTS.temperatureK);
    setTrapOn(true);
    setExternalForcePn(0);
    setRate(1);
    setDispM(0);
    setSeed("tweezers-08");
    setView("forces");
    setRows([]);
  };

  const recordCalibration = useCallback(() => {
    if (!trapOn || trapStiffnessNm(params) <= 0) return;
    const run = rows.length + 1;
    const calSeed = `${seed}|cal|${run}`;
    const calTrace = simulateBrownian(params, calSeed, { steps: 30000 });
    const calAnalysis = analyseTrace(calTrace, 72);
    const kModel = trapStiffnessNm(params) * 1e6;
    const kVariance = calTrace.stiffnessMeasuredNm * 1e6;
    setRows((prev) =>
      [
        ...prev,
        {
          run,
          seed: calSeed,
          powerMw,
          waistUm: waistM * 1e6,
          radiusUm,
          kModel,
          kVariance: Number.isFinite(kVariance) ? kVariance : Number.NaN,
          ratio: Number.isFinite(kVariance) && kModel !== 0 ? kVariance / kModel : Number.NaN,
          fcModel: calTrace.cornerHz,
          fcFit: calAnalysis.fit.cornerHz,
          varianceNm2: calTrace.varianceM2 * 1e18
        }
      ].slice(-6)
    );
  }, [trapOn, params, rows.length, seed, powerMw, waistM, radiusUm]);

  const downloadCsv = () => {
    if (rows.length === 0) return;
    const header = [
      "run",
      "seed",
      "power_mW",
      "waist_um",
      "radius_um",
      "k_model_uN_per_m",
      "k_variance_uN_per_m",
      "ratio",
      "fc_model_Hz",
      "fc_fit_Hz",
      "variance_nm2"
    ];
    const lines = rows.map((row) =>
      [
        row.run,
        `"${row.seed.replace(/"/g, '""')}"`,
        row.powerMw.toFixed(3),
        row.waistUm.toFixed(5),
        row.radiusUm.toFixed(3),
        row.kModel.toExponential(6),
        row.kVariance.toExponential(6),
        row.ratio.toFixed(4),
        row.fcModel.toFixed(2),
        Number.isFinite(row.fcFit) ? row.fcFit.toFixed(2) : "",
        row.varianceNm2.toExponential(6)
      ].join(",")
    );
    const csv = `# SIMULATED calibration — point-dipole model, not measured data\n${header.join(",")}\n${lines.join("\n")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `optical-tweezers-simulated-calibration-${seed.replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const fitCorner = metrics.k > 0 ? analysis.fit.cornerHz : Number.NaN;

  const forceSeries = useMemo<Series[]>(() => {
    const series: Series[] = [{ key: "gradient", label: "gradient", color: VERM }];
    if (externalForceN > 0) {
      series.push({ key: "flow", label: "flow", color: PETROL, dashed: true });
      series.push({ key: "total", label: "gradient + flow", color: SLATE });
    }
    series.push({ key: "scattering", label: "scattering (axial)", color: BRASS, dashed: true });
    return series;
  }, [externalForceN]);

  const potentialSeries = useMemo<Series[]>(() => {
    const series: Series[] = [{ key: "optical", label: "optical well", color: VERM }];
    if (externalForceN > 0) {
      series.push({ key: "total", label: "with flow", color: PETROL, dashed: true });
    }
    return series;
  }, [externalForceN]);

  return (
    <SimulatorShell
      title="Optical tweezers bench"
      subtitle="Gaussian beam · point dipole · overdamped Langevin"
      badge={<Badge tone="brass">simulated</Badge>}
      spec={opticalTweezers.simulation}
      onReset={reset}
      seed={seed}
      onSeedChange={setSeed}
      onRandomize={() => setSeed(`tw-${Math.random().toString(36).slice(2, 8)}`)}
      guidedNote="Increase power until the trap depth exceeds 10 k_BT while the scattering force stays below the maximum gradient. Then record a calibration run and compare k from the position variance with the model stiffness."
      freeNote="All parameters are unlocked. The Rayleigh and paraxial warnings show where the model stops being quantitative; the readouts remain model outputs, not measurements."
      readouts={readouts}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-[0.65rem] text-muted">
          <p>
            Record: <span className="num text-ink-2">{trace.steps.toLocaleString()}</span> steps ·{" "}
            <span className="num text-ink-2">{(trace.dt * 1e6).toFixed(2)}</span> µs ·{" "}
            <span className="num text-ink-2">{(trace.steps * trace.dt * 1e3).toFixed(1)}</span> ms total. Seed
            fixes the stochastic trace.
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-brass">
            Model output · not calibration data
          </p>
        </div>
      }
      controls={
        <>
          <div>
            <p className="label mb-2">Beam</p>
            <div className="space-y-3.5">
              <Slider
                label="Laser power"
                value={powerMw}
                min={1}
                max={500}
                step={1}
                unit="mW"
                onChange={setPowerMw}
                format={(v) => v.toFixed(0)}
                hint="Power at the sample. Scattering and depth scale with it."
              />
              <Slider
                label="Wavelength"
                value={wavelengthNm}
                min={800}
                max={1100}
                step={1}
                unit="nm"
                onChange={setWavelengthNm}
                format={(v) => v.toFixed(0)}
                hint="1064 nm is the biological standard; 800–1100 nm spans the model."
              />
              <SegmentedControl
                ariaLabel="Focus parameter"
                value={focusMode}
                onChange={handleFocusMode}
                options={[
                  { value: "na", label: "NA" },
                  { value: "waist", label: "w₀" }
                ]}
              />
              {focusMode === "na" ? (
                <Slider
                  label="Objective NA"
                  value={na}
                  min={0.4}
                  max={1.4}
                  step={0.01}
                  onChange={(v) => setNa(v)}
                  format={(v) => v.toFixed(2)}
                  hint={`Linked waist w₀ = ${(effectiveWaistM * 1e6).toFixed(3)} µm via 0.61 λ/NA.`}
                />
              ) : (
                <Slider
                  label="Beam waist w₀"
                  value={waistUm}
                  min={0.3}
                  max={3}
                  step={0.01}
                  unit="µm"
                  onChange={setWaistUm}
                  format={(v) => v.toFixed(2)}
                  hint={`Nominal NA ≈ ${derivedNa.toFixed(2)}${derivedNa > 1.4 ? " — beyond a 1.4 objective" : ""}.`}
                />
              )}
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <p className="label mb-2">Particle & medium</p>
            <div className="space-y-3.5">
              <Slider
                label="Particle radius"
                value={radiusUm}
                min={0.2}
                max={2}
                step={0.01}
                unit="µm"
                onChange={setRadiusUm}
                format={(v) => v.toFixed(2)}
                hint="Smaller beads scatter less but diffuse more."
              />
              <Slider
                label="Particle index n_p"
                value={nParticle}
                min={1.35}
                max={1.7}
                step={0.01}
                onChange={setNParticle}
                format={(v) => v.toFixed(2)}
              />
              <Slider
                label="Medium index n_m"
                value={nMedium}
                min={1.33}
                max={1.5}
                step={0.01}
                onChange={setNMedium}
                format={(v) => v.toFixed(2)}
                hint="Index contrast sets the sign and strength of the force."
              />
              <Slider
                label="Viscosity"
                value={viscosity}
                min={0.7}
                max={3}
                step={0.05}
                unit="mPa·s"
                onChange={setViscosity}
                format={(v) => v.toFixed(2)}
              />
              <Slider
                label="Temperature"
                value={temperatureK}
                min={293}
                max={310}
                step={0.5}
                unit="K"
                onChange={setTemperatureK}
                format={(v) => v.toFixed(1)}
              />
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <p className="label mb-2">Trap & flow</p>
            <div className="space-y-3.5">
              <Toggle
                label="Trap beam on"
                checked={trapOn}
                onChange={setTrapOn}
                hint="Off blocks the beam: free diffusion only."
              />
              <Slider
                label="External force / flow"
                value={externalForcePn}
                min={0}
                max={20}
                step={0.1}
                unit="pN"
                onChange={setExternalForcePn}
                format={(v) => v.toFixed(1)}
                hint="Constant force along +x. It tilts the potential and shifts the bead."
              />
              <Slider
                label="Bead displacement"
                value={dispM * 1e9}
                min={-rangeNm}
                max={rangeNm}
                step={Math.max(1, Math.round(rangeNm / 200))}
                unit="nm"
                onChange={(v) => setDispM(v * 1e-9)}
                format={(v) => v.toFixed(0)}
                hint="Or drag the bead in the top-view field."
              />
              <button
                type="button"
                onClick={() => setDispM(0)}
                className="w-full border border-line-strong px-2 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-2 hover:bg-paper"
              >
                Centre bead at focus
              </button>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <p className="label mb-2">Integration</p>
            <Slider
              label="Integration speed / trace length"
              value={rate}
              min={0.34}
              max={2.5}
              step={0.01}
              unit="×"
              onChange={setRate}
              format={(v) => `${v.toFixed(2)}`}
              hint={`${steps.toLocaleString()} steps at dt = 1/(60 f_c). Longer traces reduce the variance error.`}
            />
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
          <div className="border border-line bg-paper-2">
            <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
              <div>
                <p className="label">Trap field · top view</p>
                <p className="text-[0.68rem] text-muted">Drag the bead away from the focus</p>
              </div>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-brass">interactive</span>
            </div>
            <TrapCanvas
              params={params}
              dispM={dispM}
              onDispChange={setDispM}
              rangeM={rangeM}
              externalForceN={externalForceN}
              trapOn={trapOn}
              trace={trace}
            />
          </div>

          <div className="space-y-3">
            <div className="border border-line bg-paper-2">
              <div className="flex items-baseline justify-between gap-2 border-b border-line px-3 py-2">
                <p className="label">Beam intensity · r–z</p>
                <p className="font-mono text-[0.58rem] text-muted">
                  ±2.2 z_R · ±2.8 w₀
                </p>
              </div>
              <div className="p-2">
                <div className="relative mx-auto aspect-square w-full max-w-[238px]">
                  <IntensityCanvas
                    values={beamMap.values}
                    width={132}
                    height={132}
                    size={132}
                    colormap="amber"
                    gain={0.62}
                    ariaLabel="Gaussian beam intensity in the radial–axial plane, bright at the focus and spreading away from it"
                    className="h-full w-full"
                    overlay={
                      <div className="pointer-events-none absolute inset-0">
                        <div
                          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 border border-white/80"
                          style={{ left: "50%", top: "50%" }}
                        />
                        <div
                          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                          style={{
                            left: "50%",
                            top: `${clamp(50 - (dispM / beamMap.rRange) * 50, 2, 98)}%`
                          }}
                        />
                        <span className="absolute left-2 top-1.5 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-white/60">
                          r ↑
                        </span>
                        <span className="absolute bottom-1.5 right-2 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-white/60">
                          z →
                        </span>
                      </div>
                    }
                  />
                </div>
                <p className="mt-1.5 px-1 text-[0.62rem] leading-snug text-muted">
                  Linear colour scale. The white ring marks the bead at r ={" "}
                  <span className="num text-ink-2">{fmt(dispM * 1e9, 3)} nm</span>. The focus is the central cross.
                </p>
              </div>
            </div>

            <div className="border border-line bg-paper-2">
              <div className="border-b border-line px-3 py-1.5">
                <p className="label">Objective / cone</p>
              </div>
              <BeamCone na={derivedNa} waistUm={waistM * 1e6} on={trapOn} />
            </div>
          </div>
        </div>

        <div className="border border-line bg-paper-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <p className="label">Simulated data</p>
            <SegmentedControl
              size="sm"
              ariaLabel="Simulated data view"
              value={view}
              onChange={setView}
              options={[
                { value: "forces", label: "Forces" },
                { value: "brownian", label: "Brownian" },
                { value: "spectrum", label: "Spectrum" }
              ]}
            />
          </div>

          <div className="grid gap-3 p-3 lg:grid-cols-2">
            {view === "forces" ? (
              <>
                <ChartCard
                  label="Force balance"
                  title="Restoring force vs radial displacement"
                  note={`Gradient (solid), ${
                    externalForceN > 0 ? "flow (dashed) and their sum (slate)" : "external flow = 0"
                  }. Scattering is axial, shown for scale. k = ${fmt(metrics.k * 1e6, 3)} µN/m.`}
                >
                  <LabLineChart
                    data={forceRows}
                    xKey="r"
                    xLabel="radial displacement r (µm)"
                    yLabel="force (pN)"
                    yUnit="pN"
                    height={185}
                    series={forceSeries}
                    showLegend
                    referenceX={dispM * 1e6}
                    referenceY={0}
                    digits={3}
                  />
                </ChartCard>
                <ChartCard
                  label="Potential"
                  title="Optical potential with k_BT depth"
                  note={`U(r)/k_BT; ${
                    externalForceN > 0 ? "flow tilts the well by −F·r. " : ""
                  }Depth = ${fmt(metrics.depth, 3)} k_BT. The marker is the current bead position.`}
                >
                  <LabLineChart
                    data={potentialRows}
                    xKey="r"
                    xLabel="radial displacement r (µm)"
                    yLabel="U / k_BT"
                    height={185}
                    series={potentialSeries}
                    showLegend
                    referenceX={dispM * 1e6}
                    referenceY={0}
                    digits={3}
                  />
                </ChartCard>
              </>
            ) : null}

            {view === "brownian" ? (
              <>
                <ChartCard
                  label="Trajectory"
                  title="Brownian x(t) in the harmonic trap"
                  note={`Seeded Euler–Maruyama run, ${trace.steps.toLocaleString()} steps. σ = ${fmt(trace.rmsM * 1e9, 3)} nm; dashed lines are ±σ.`}
                >
                  <LabLineChart
                    data={traceRows}
                    xKey="t"
                    xLabel="time (s)"
                    yLabel="x (nm)"
                    height={185}
                    series={[
                      { key: "x", label: "x(t)", color: PETROL },
                      { key: "plus", label: "+σ", color: MUTED, dashed: true },
                      { key: "minus", label: "−σ", color: MUTED, dashed: true }
                    ]}
                    digits={3}
                  />
                </ChartCard>
                <ChartCard
                  label="Distribution"
                  title="Position histogram vs Boltzmann"
                  note={
                    trace.stiffnessModelNm > 0
                      ? `Histogram (bars) and Gaussian with σ² = k_BT/k. Variance-derived k = ${fmt(trace.stiffnessMeasuredNm * 1e6, 3)} µN/m.`
                      : "No trap: the histogram is a finite free-diffusion record, not a stationary Boltzmann distribution."
                  }
                >
                  <LabLineChart
                    data={histogramRows}
                    xKey="x"
                    xLabel="x (nm)"
                    yLabel="density (1/nm)"
                    height={185}
                    series={[
                      { key: "measured", label: "histogram", color: PETROL },
                      { key: "boltzmann", label: "Boltzmann", color: VERM, dashed: true }
                    ]}
                    showLegend
                    digits={3}
                  />
                </ChartCard>
              </>
            ) : null}

            {view === "spectrum" ? (
              <>
                <ChartCard
                  label="Power spectral density"
                  title="Log–log PSD with Lorentzian fit"
                  note={
                    Number.isFinite(fitCorner)
                      ? `Fit f_c = ${fmt(fitCorner, 3)} Hz; model f_c = ${fmt(metrics.fc, 3)} Hz. Plateau → corner → 1/f².`
                      : "No stationary spectrum with the trap off. Turn the trap on to fit a corner."
                  }
                >
                  <LabLineChart
                    data={psdRows}
                    xKey="logF"
                    xLabel="log₁₀(f / Hz)"
                    yLabel="log₁₀(S / m²Hz⁻¹)"
                    height={185}
                    series={[
                      { key: "measured", label: "periodogram (Welch)", color: PETROL },
                      { key: "model", label: "Lorentzian", color: VERM, dashed: true }
                    ]}
                    showLegend
                    referenceX={Number.isFinite(fitCorner) && fitCorner > 0 ? Math.log10(fitCorner) : undefined}
                    digits={3}
                  />
                </ChartCard>
                <ChartCard
                  label="Beam profile"
                  title="Radial intensity I(r, 0)"
                  note={`1/e² radius w₀ = ${fmt(waistM * 1e6, 3)} µm (marker). Peak ${fmt(metrics.peakI / 1e10, 3)} MW/cm².`}
                >
                  <LabLineChart
                    data={radialRows}
                    xKey="r"
                    xLabel="radius r (µm)"
                    yLabel="intensity (MW/cm²)"
                    height={185}
                    series={[{ key: "intensity", label: "I(r)", color: BRASS }]}
                    referenceX={waistM * 1e6}
                    digits={3}
                  />
                </ChartCard>
              </>
            ) : null}
          </div>
        </div>

        <div className="border border-line bg-paper-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div>
              <p className="label">Calibration panel</p>
              <p className="text-[0.68rem] text-muted">
                Run a long seeded record, compare k_BT/⟨x²⟩ with the model, and export the rows.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={recordCalibration}
                disabled={!trapOn || metrics.k <= 0}
                className="btn btn-sm disabled:opacity-40"
              >
                Record simulated run
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                disabled={rows.length === 0}
                className="btn btn-ghost btn-sm disabled:opacity-40"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setRows([])}
                disabled={rows.length === 0}
                className="border border-line-strong px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-2 hover:bg-paper disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>
          {rows.length === 0 ? (
            <div className="px-3 py-5 text-[0.72rem] leading-relaxed text-muted">
              No runs yet. With the beam on, record a run and compare{" "}
              <span className="num text-ink-2">k_variance = k_BT/⟨x²⟩</span> with the model stiffness. The CSV is
              explicitly labelled as simulated data and must not be presented as a measurement.
            </div>
          ) : (
            <DataTable
              dense
              head={["Run", "P", "w₀", "k model", "k variance", "ratio", "f_c model", "f_c fit", "seed"]}
              align={["l", "r", "r", "r", "r", "r", "r", "r", "l"]}
              rows={rows.map((row) => [
                String(row.run),
                `${row.powerMw.toFixed(0)} mW`,
                `${row.waistUm.toFixed(3)} µm`,
                `${fmt(row.kModel, 3)} µN/m`,
                `${fmt(row.kVariance, 3)} µN/m`,
                Number.isFinite(row.ratio) ? row.ratio.toFixed(3) : "—",
                `${fmt(row.fcModel, 3)} Hz`,
                Number.isFinite(row.fcFit) ? `${fmt(row.fcFit, 3)} Hz` : "—",
                <span key={`seed-${row.run}`} className="font-mono text-[0.6rem] text-muted">
                  {row.seed}
                </span>
              ])}
            />
          )}
          <p className="border-t border-line px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-brass">
            Simulated calibration · not experimental data
          </p>
        </div>
      </div>
    </SimulatorShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Chart frame                                                                */
/* -------------------------------------------------------------------------- */

function ChartCard({
  label,
  title,
  note,
  children
}: {
  label: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line">
      <div className="border-b border-line px-3 py-2">
        <p className="label">{label}</p>
        <p className="text-[0.7rem] font-medium text-ink">{title}</p>
      </div>
      <div className="px-1 py-2">{children}</div>
      <p className="border-t border-line px-3 py-1.5 text-[0.6rem] leading-snug text-muted">{note}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactive trap field                                                     */
/* -------------------------------------------------------------------------- */

const VIEW_W = 380;
const VIEW_H = 286;
const CX = VIEW_W / 2;
const CY = 148;
const HALF_X = 164;
const HALF_Y = 108;

function TrapCanvas({
  params,
  dispM,
  onDispChange,
  rangeM,
  externalForceN,
  trapOn,
  trace
}: {
  params: TweezersParams;
  dispM: number;
  onDispChange: (value: number) => void;
  rangeM: number;
  externalForceN: number;
  trapOn: boolean;
  trace: BrownianTrace;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);

  useEffect(() => {
    if (Math.abs(dispM) > rangeM) {
      onDispChange(Math.sign(dispM) * rangeM);
    }
  }, [dispM, rangeM, onDispChange]);

  useEffect(() => {
    setPlaying(false);
    setReplayIndex(0);
  }, [trace]);

  useEffect(() => {
    if (!playing) return;
    if (trace.x.length === 0) return;
    const stride = Math.max(1, Math.floor(trace.x.length / 260));
    const timer = window.setInterval(() => {
      setReplayIndex((index) => {
        const next = index + stride;
        return next >= trace.x.length ? trace.x.length - 1 : next;
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, trace]);

  useEffect(() => {
    if (playing && replayIndex >= trace.x.length - 1) setPlaying(false);
  }, [playing, replayIndex, trace.x.length]);

  const toDisplacement = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return clamp(((point.x - CX) / HALF_X) * rangeM, -rangeM, rangeM);
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    const value = toDisplacement(event);
    if (value !== null) {
      onDispChange(value);
      setPlaying(false);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const value = toDisplacement(event);
    if (value !== null) onDispChange(value);
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const forceN = gradientForceN(params, dispM);
  const maxGrad = Math.abs(maxGradientForceN(params));
  const scaleForce = maxGrad > 0 ? Math.min(76, (Math.abs(forceN) / maxGrad) * 68) : 0;
  const beadX = clamp(CX + (dispM / rangeM) * HALF_X, 8, VIEW_W - 8);
  const beadR = clamp((params.radiusM / rangeM) * HALF_X, 5, 26);
  const w0px = clamp((params.waistM / rangeM) * HALF_X, 6, HALF_X);
  const ghostIndex = clamp(replayIndex, 0, Math.max(0, trace.x.length - 1));
  const ghostM = trace.x.length > 0 ? trace.x[ghostIndex] ?? 0 : 0;
  const ghostX = clamp(CX + (ghostM / rangeM) * HALF_X, 8, VIEW_W - 8);
  const forceDir = forceN === 0 ? 0 : Math.sign(forceN);
  const flowLength = maxGrad > 0 ? Math.min(60, (externalForceN / maxGrad) * 58) : 0;
  const scaleM = rangeM > 1.5e-6 ? 1e-6 : 0.5e-6;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label="Top view of the optical trap. The focused beam is a bright spot at the centre; the bead can be dragged away to show the inward gradient force."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <radialGradient id="tweezer-glow">
            <stop offset="0%" stopColor="#FFD27A" stopOpacity={0.95} />
            <stop offset="35%" stopColor="#F0A93F" stopOpacity={0.55} />
            <stop offset="70%" stopColor="#9A7527" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#9A7527" stopOpacity={0} />
          </radialGradient>
          <marker id="tweezer-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={VERM} />
          </marker>
          <marker id="tweezer-flow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5FB6A4" />
          </marker>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="#121210" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={20 + (i * (VIEW_W - 40)) / 8}
            y1={18}
            x2={20 + (i * (VIEW_W - 40)) / 8}
            y2={VIEW_H - 44}
            stroke="#2A2925"
            strokeWidth={0.6}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={20}
            y1={18 + (i * (VIEW_H - 62)) / 5}
            x2={VIEW_W - 20}
            y2={18 + (i * (VIEW_H - 62)) / 5}
            stroke="#2A2925"
            strokeWidth={0.6}
          />
        ))}

        {trapOn ? (
          <>
            <circle cx={CX} cy={CY} r={w0px * 2.7} fill="url(#tweezer-glow)" />
            <circle cx={CX} cy={CY} r={w0px} fill="none" stroke="#F0C878" strokeWidth={0.7} opacity={0.6} />
            <circle cx={CX} cy={CY} r={w0px * 2} fill="none" stroke="#9A7527" strokeWidth={0.6} opacity={0.4} strokeDasharray="3 3" />
          </>
        ) : null}

        <line x1={CX - 10} y1={CY} x2={CX + 10} y2={CY} stroke={trapOn ? "#FFE1A8" : "#4A4840"} strokeWidth={1} />
        <line x1={CX} y1={CY - 10} x2={CX} y2={CY + 10} stroke={trapOn ? "#FFE1A8" : "#4A4840"} strokeWidth={1} />
        <text x={CX + 14} y={CY - 10} fill="#A8A290" fontFamily="var(--font-mono), monospace" fontSize={8}>
          focus
        </text>

        {trapOn && scaleForce > 1 ? (
          <line
            x1={beadX}
            y1={CY}
            x2={beadX + forceDir * scaleForce}
            y2={CY}
            stroke={VERM}
            strokeWidth={2}
            markerEnd="url(#tweezer-arrow)"
          />
        ) : null}
        {externalForceN > 0 && flowLength > 1 ? (
          <line
            x1={beadX}
            y1={CY + 18}
            x2={beadX + flowLength}
            y2={CY + 18}
            stroke="#5FB6A4"
            strokeWidth={1.6}
            markerEnd="url(#tweezer-flow)"
          />
        ) : null}

        <circle cx={beadX} cy={CY} r={beadR} fill={trapOn ? "#D9E8E3" : "#8D8A80"} stroke="#FFFFFF" strokeWidth={1.1} opacity={0.94} />
        <circle cx={beadX - beadR * 0.28} cy={CY - beadR * 0.3} r={beadR * 0.3} fill="#FFFFFF" opacity={0.45} />

        {trace.x.length > 0 && (playing || replayIndex > 0) ? (
          <>
            <circle cx={ghostX} cy={CY - 30} r={Math.max(3, beadR * 0.45)} fill="none" stroke="#5FB6A4" strokeWidth={1.4} />
            <text x={ghostX + 8} y={CY - 33} fill="#8FD0C2" fontFamily="var(--font-mono), monospace" fontSize={7}>
              replay {(ghostIndex * trace.dt * 1e3).toFixed(1)} ms
            </text>
          </>
        ) : null}

        <text x={18} y={VIEW_H - 22} fill="#A8A290" fontFamily="var(--font-mono), monospace" fontSize={8}>
          {trapOn ? `F_grad ${(Math.abs(forceN) * 1e12).toFixed(1)} pN` : "SHUTTER CLOSED"}
        </text>
        {externalForceN > 0 ? (
          <text x={18} y={VIEW_H - 10} fill="#8FD0C2" fontFamily="var(--font-mono), monospace" fontSize={8}>
            flow {externalForceN.toFixed(1)} pN → +x
          </text>
        ) : null}

        <line
          x1={VIEW_W - 30 - (scaleM / rangeM) * HALF_X}
          y1={VIEW_H - 16}
          x2={VIEW_W - 30}
          y2={VIEW_H - 16}
          stroke="#A8A290"
          strokeWidth={1.4}
        />
        <text
          x={VIEW_W - 30 - ((scaleM / rangeM) * HALF_X) / 2}
          y={VIEW_H - 22}
          fill="#A8A290"
          fontFamily="var(--font-mono), monospace"
          fontSize={7}
          textAnchor="middle"
        >
          {scaleM * 1e6} µm
        </text>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2">
        <p className="text-[0.62rem] leading-snug text-muted">
          {trapOn
            ? `w₀ = ${(params.waistM * 1e6).toFixed(2)} µm · drag to ±${(rangeM * 1e6).toFixed(2)} µm`
            : "Beam blocked: only Brownian motion remains."}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setReplayIndex(0);
              setPlaying((value) => !value);
            }}
            className="border border-line-strong px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-ink-2 hover:bg-paper"
          >
            {playing ? "Stop replay" : "Replay Brownian"}
          </button>
          <button
            type="button"
            onClick={() => onDispChange(0)}
            className="border border-line-strong px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-ink-2 hover:bg-paper"
          >
            Centre
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Objective / cone schematic                                                 */
/* -------------------------------------------------------------------------- */

function BeamCone({ na, waistUm, on }: { na: number; waistUm: number; on: boolean }) {
  const focusX = 120;
  const focusY = 74;
  const half = 24 + 52 * Math.min(1, na / 1.4);
  return (
    <div className="px-2 py-1.5">
      <svg viewBox="0 0 240 112" className="h-auto w-full" role="img" aria-label="Objective cone focusing the beam onto a bead above a coverslip">
        <rect width={240} height={112} fill="#FBF9F4" />
        <rect x={focusX - 34} y={10} width={68} height={14} fill="#E9E4D8" stroke="#171713" strokeWidth={0.8} />
        <path d={`M ${focusX - 30} 24 L ${focusX + 30} 24 L ${focusX + 18} 38 L ${focusX - 18} 38 Z`} fill="#E9E4D8" stroke="#171713" strokeWidth={0.8} />
        <line x1={focusX - 46} y1={54} x2={focusX + 46} y2={54} stroke="#B8B1A0" strokeWidth={0.8} />
        <path
          d={`M ${focusX - half} 42 L ${focusX} ${focusY} L ${focusX + half} 42`}
          fill="none"
          stroke={on ? "#B23A1E" : "#B8B1A0"}
          strokeWidth={1.2}
          strokeDasharray={on ? undefined : "3 3"}
          opacity={0.8}
        />
        <path d={`M ${focusX - half * 0.6} 42 L ${focusX} ${focusY}`} fill="none" stroke={on ? "#D8896E" : "#D9D3C5"} strokeWidth={0.6} />
        <path d={`M ${focusX + half * 0.6} 42 L ${focusX} ${focusY}`} fill="none" stroke={on ? "#D8896E" : "#D9D3C5"} strokeWidth={0.6} />
        <line x1={focusX - 42} y1={86} x2={focusX + 42} y2={86} stroke="#171713" strokeWidth={1.6} />
        <rect x={focusX - 48} y={90} width={96} height={7} fill="#E9E4D8" stroke="#171713" strokeWidth={0.7} />
        <circle cx={focusX} cy={focusY - 5} r={4.5} fill={on ? "#14524A" : "#8D8A80"} opacity={0.9} />
        <text x={8} y={16} fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7}>
          NA {na.toFixed(2)}
        </text>
        <text x={8} y={25} fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7}>
          w₀ {waistUm.toFixed(3)} µm
        </text>
        <text x={focusX} y={105} fill="#6E6A5E" fontFamily="var(--font-mono), monospace" fontSize={7} textAnchor="middle">
          coverslip / sample
        </text>
        <text x={focusX + 46} y={focusY + 3} fill={on ? "#B23A1E" : "#6E6A5E"} fontFamily="var(--font-mono), monospace" fontSize={7}>
          {on ? "trapped bead" : "beam off"}
        </text>
        <line x1={focusX} y1={38} x2={focusX} y2={48} stroke="#6E6A5E" strokeWidth={0.6} strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
