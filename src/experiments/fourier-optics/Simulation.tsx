"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SimulatorShell, type Readout } from "@/components/sim/SimulatorShell";
import { Slider, Toggle } from "@/components/ui/Controls";
import { IntensityCanvas } from "@/components/viz/IntensityCanvas";
import { LabLineChart } from "@/components/viz/Plot";
import { Badge, DataTable } from "@/components/ui/primitives";
import type { FilterKind, PatternKind } from "@/lib/physics/fourier";
import {
  DEFAULT_FOCAL_MM,
  DEFAULT_OBJECT_WINDOW_MM,
  DEFAULT_WAVELENGTH_NM,
  FILTER_DESCRIPTIONS,
  FILTER_LABELS,
  FOURIER_GRID_SIZES,
  FOURIER_SIMULATION_SPEC,
  OBJECT_PATTERNS,
  PATTERN_DEFAULT_FEATURE_MM,
  PATTERN_LABELS,
  imageToField,
  makeObjectField,
  opticalScale,
  resampleField,
  simulateFourF,
  type GridSize,
  type SimParams,
  type SimResult,
  type SimulateRequest,
  type WorkerResponse
} from "./physics";

/* -------------------------------------------------------------------------- */
/* Small presentation helpers                                                  */
/* -------------------------------------------------------------------------- */

type Engine = "starting" | "worker" | "fallback";

interface Measurement {
  id: number;
  label: string;
  filter: string;
  filterKind: FilterKind;
  radius: number;
  cutoff: number;
  peak: number;
  period: number;
  contrast: number;
  energy: number;
}

const FILTER_SHORT: Record<FilterKind, string> = {
  none: "open pupil",
  lowpass: "low-pass",
  highpass: "high-pass",
  vertical: "vertical slit",
  horizontal: "horizontal slit",
  annulus: "annulus",
  phase: "phase plate"
};

function fmt(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e5)) return value.toExponential(1);
  return value.toFixed(digits);
}

function niceLength(target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 1;
  const exponent = Math.floor(Math.log10(target));
  const base = 10 ** exponent;
  const mantissa = target / base;
  const nice = mantissa >= 5 ? 5 : mantissa >= 2 ? 2 : 1;
  return nice * base;
}

function hslToRgb(hue: number, saturation: number, lightness: number): [number, number, number] {
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hp = Math.min(5.999, Math.max(0, hue * 6));
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) {
    r = c;
    g = x;
  } else if (hp < 2) {
    r = x;
    g = c;
  } else if (hp < 3) {
    g = c;
    b = x;
  } else if (hp < 4) {
    g = x;
    b = c;
  } else if (hp < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const m = lightness - c / 2;
  return [Math.round(255 * (r + m)), Math.round(255 * (g + m)), Math.round(255 * (b + m))];
}

/* -------------------------------------------------------------------------- */
/* Custom visual pieces                                                        */
/* -------------------------------------------------------------------------- */

function PanelFrame({
  label,
  meta,
  children,
  className = ""
}: {
  label: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {

  return (
    <section className={`min-w-0 border border-line bg-paper-2 ${className}`}>
      <header className="flex items-baseline justify-between gap-2 border-b border-line px-2.5 py-1.5">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink">{label}</p>
        {meta ? <span className="text-right font-mono text-[0.55rem] leading-tight text-muted">{meta}</span> : null}
      </header>
      <div className="p-2">{children}</div>
    </section>
  );
}

function ScaleBar({ fraction, label }: { fraction: number; label: string }) {
  const width = Math.max(4, Math.min(100, fraction * 100));
  return (
    <div className="pointer-events-none absolute bottom-2 left-2" aria-hidden>
      <span className="mb-1 inline-block bg-black/60 px-1 py-0.5 font-mono text-[0.52rem] text-white/90">{label}</span>
      <div className="h-[2px] bg-white drop-shadow-[0_0_1px_rgba(0,0,0,0.9)]" style={{ width: `${width}%` }} />
    </div>
  );
}

function PupilOverlay({ kind, radius, aperture }: { kind: FilterKind; radius: number; aperture: number }) {
  const apertureRing =
    aperture < 0.995 ? (
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/85"
        style={{ width: `${aperture * 100}%`, height: `${aperture * 100}%` }}
      />
    ) : null;

  if (kind === "none") return <>{apertureRing}</>;
  if (kind === "vertical" || kind === "horizontal") {
    return (
      <>
        <div
          className="pointer-events-none absolute border border-dashed border-white/70 bg-white/[0.06]"
          style={
            kind === "vertical"
              ? { top: 0, bottom: 0, left: "50%", width: `${radius * 100}%`, transform: "translateX(-50%)" }
              : { left: 0, right: 0, top: "50%", height: `${radius * 100}%`, transform: "translateY(-50%)" }
          }
        />
        {apertureRing}
      </>
    );
  }
  const outer = kind === "annulus" ? Math.min(1.2, radius + 0.12) : radius;
  return (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/70"
        style={{ width: `${outer * 100}%`, height: `${outer * 100}%` }}
      />
      {kind === "annulus" ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/40"
          style={{ width: `${radius * 100}%`, height: `${radius * 100}%` }}
        />
      ) : null}
      {apertureRing}
    </>
  );
}

function PhaseCanvas({
  values,
  brightness,
  size,
  ariaLabel
}: {
  values: Float64Array;
  brightness: Float64Array;
  size: number;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const ph = values[i] ?? 0;
      const b = brightness[i] ?? 0;
      const hue = Math.min(359.999, Math.max(0, ((ph + Math.PI) / (2 * Math.PI)) * 360));
      const amplitude = Math.max(0, Math.min(1, b));
      const lightness = amplitude < 0.16 ? 0.035 : 0.16 + 0.3 * Math.sqrt(amplitude);
      const [r, g, bl] = hslToRgb(hue / 360, 0.82, lightness);
      const idx = i * 4;
      image.data[idx] = r;
      image.data[idx + 1] = g;
      image.data[idx + 2] = bl;
      image.data[idx + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [values, brightness, size]);

  return (
    <div className="viz-frame relative aspect-square">
      <canvas
        ref={ref}
        width={size}
        height={size}
        className="h-full w-full"
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
}

function AxisFooter({
  left,
  centre,
  right,
  caption
}: {
  left: string;
  centre: string;
  right: string;
  caption: string;
}) {
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between gap-2 border-t border-line-strong/70 pt-1 font-mono text-[0.54rem] text-muted">
        <span>{left}</span>
        <span>{centre}</span>
        <span>{right}</span>
      </div>
      <p className="mt-1 text-[0.56rem] leading-snug text-muted">{caption}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Upload                                                                      */
/* -------------------------------------------------------------------------- */

async function fileToField(file: File, n: number): Promise<Float64Array> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = n;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, n, n);
    ctx.drawImage(image, 0, 0, n, n);
    const pixels = ctx.getImageData(0, 0, n, n).data;
    return imageToField(pixels, n, n, n);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* -------------------------------------------------------------------------- */
/* Guided presets                                                              */
/* -------------------------------------------------------------------------- */

const GUIDED_STEPS: { title: string; text: string; preset: Partial<SimParams> & { pattern?: PatternKind } }[] = [
  {
    title: "Open pupil",
    text: "Object at f₁, every collected frequency passes. This is the reference image.",
    preset: { pattern: "slits", featureMm: 1.5, filter: "none", filterRadius: 0.6, apertureRadius: 1 }
  },
  {
    title: "Inspect the spectrum",
    text: "Open the pupil fully and look at the amplitude and phase planes.",
    preset: { filter: "none", apertureRadius: 1, filterRadius: 1 }
  },
  {
    title: "Low-pass blur",
    text: "Close a disk to r = 0.08; fine detail disappears but the background survives.",
    preset: { filter: "lowpass", filterRadius: 0.08, apertureRadius: 1 }
  },
  {
    title: "High-pass edges",
    text: "Block the centre to r = 0.12; the background goes dark and edges remain.",
    preset: { filter: "highpass", filterRadius: 0.12, apertureRadius: 1 }
  },
  {
    title: "Directional filter",
    text: "Use a vertical slit; structure is smeared along x and kept along y.",
    preset: { filter: "vertical", filterRadius: 0.15, apertureRadius: 1 }
  },
  {
    title: "Phase contrast",
    text: "Put a π/2 phase step inside r = 0.12 and compare the image with the open pupil.",
    preset: { filter: "phase", filterRadius: 0.12, phaseShift: Math.PI / 2, apertureRadius: 1 }
  }
];

const DEFAULT_PARAMS: SimParams = {
  pattern: "slits",
  featureMm: PATTERN_DEFAULT_FEATURE_MM.slits,
  gridN: 128,
  objectWindowMm: DEFAULT_OBJECT_WINDOW_MM,
  filter: "none",
  filterRadius: 0.2,
  apertureRadius: 1,
  phaseShift: Math.PI / 2,
  focalLength1Mm: DEFAULT_FOCAL_MM,
  focalLength2Mm: DEFAULT_FOCAL_MM,
  wavelengthNm: DEFAULT_WAVELENGTH_NM,
  objectDistanceMm: DEFAULT_FOCAL_MM,
  customField: null
};

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function Simulation() {
  const [pattern, setPattern] = useState<PatternKind>(DEFAULT_PARAMS.pattern);
  const [featureMm, setFeatureMm] = useState(DEFAULT_PARAMS.featureMm);
  const [gridN, setGridN] = useState<GridSize>(DEFAULT_PARAMS.gridN);
  const [filter, setFilter] = useState<FilterKind>(DEFAULT_PARAMS.filter);
  const [filterRadius, setFilterRadius] = useState(DEFAULT_PARAMS.filterRadius);
  const [apertureRadius, setApertureRadius] = useState(DEFAULT_PARAMS.apertureRadius);
  const [phaseShift, setPhaseShift] = useState(DEFAULT_PARAMS.phaseShift);
  const [focalLength1Mm, setFocalLength1Mm] = useState(DEFAULT_PARAMS.focalLength1Mm);
  const [focalLength2Mm, setFocalLength2Mm] = useState(DEFAULT_PARAMS.focalLength2Mm);
  const [wavelengthNm, setWavelengthNm] = useState(DEFAULT_PARAMS.wavelengthNm);
  const [objectAtFocus, setObjectAtFocus] = useState(true);
  const [objectDistanceMm, setObjectDistanceMm] = useState(DEFAULT_PARAMS.objectDistanceMm);
  const [customField, setCustomField] = useState<Float64Array | null>(null);
  const [customName, setCustomName] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [result, setResult] = useState<SimResult | null>(null);
  const [computing, setComputing] = useState(true);
  const [engine, setEngine] = useState<Engine>("starting");
  const [failure, setFailure] = useState("");

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [measureLabel, setMeasureLabel] = useState("");

  const workerRef = useRef<Worker | null>(null);
  const workerGuardRef = useRef<number | undefined>(undefined);
  const requestIdRef = useRef(0);
  const nextMeasurementId = useRef(1);

  /* ---- Worker lifecycle ------------------------------------------------- */

  useEffect(() => {
    if (typeof Worker === "undefined") {
      setEngine("fallback");
      return;
    }
    let worker: Worker | null = null;
    try {
      worker = new Worker(new URL("./fft.worker.ts", import.meta.url));
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.id !== requestIdRef.current) return;
        if (workerGuardRef.current !== undefined) {
          window.clearTimeout(workerGuardRef.current);
          workerGuardRef.current = undefined;
        }
        if (message.type === "result") {
          setResult(message.result);
          setFailure("");
          setComputing(false);
        } else {
          setFailure(`FFT worker: ${message.message}`);
          setComputing(false);
        }
      };
      worker.onerror = () => {
        worker?.terminate();
        if (workerRef.current === worker) workerRef.current = null;
        setEngine("fallback");
      };
      workerRef.current = worker;
      setEngine("worker");
    } catch {
      setEngine("fallback");
    }
    return () => {
      worker?.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };
  }, []);

  /* ---- Derived fields --------------------------------------------------- */

  const customAtGrid = useMemo(() => {
    if (!customField) return null;
    const fromN = Math.round(Math.sqrt(customField.length));
    if (fromN === gridN) return customField;
    return resampleField(customField, fromN, gridN);
  }, [customField, gridN]);

  const params = useMemo<SimParams>(
    () => ({
      pattern,
      featureMm,
      gridN,
      objectWindowMm: DEFAULT_OBJECT_WINDOW_MM,
      filter,
      filterRadius,
      apertureRadius,
      phaseShift,
      focalLength1Mm,
      focalLength2Mm,
      wavelengthNm,
      objectDistanceMm: objectAtFocus ? focalLength1Mm : objectDistanceMm,
      customField: customAtGrid
    }),
    [
      pattern,
      featureMm,
      gridN,
      filter,
      filterRadius,
      apertureRadius,
      phaseShift,
      focalLength1Mm,
      focalLength2Mm,
      wavelengthNm,
      objectAtFocus,
      objectDistanceMm,
      customAtGrid
    ]
  );

  const liveScale = useMemo(() => opticalScale(params), [params]);

  /* ---- Debounced computation ------------------------------------------- */

  useEffect(() => {
    if (engine === "starting") return;
    setComputing(true);
    const id = ++requestIdRef.current;
    const timer = window.setTimeout(() => {
      const worker = workerRef.current;
      if (engine === "worker" && worker) {
        const request: SimulateRequest = { type: "simulate", id, params };
        worker.postMessage(request);
        workerGuardRef.current = window.setTimeout(() => {
          if (requestIdRef.current !== id) return;
          workerGuardRef.current = undefined;
          worker.terminate();
          if (workerRef.current === worker) workerRef.current = null;
          setEngine("fallback");
        }, 8000);
        return;
      }
      try {
        const synchronous = simulateFourF(params);
        if (requestIdRef.current !== id) return;
        setResult(synchronous);
        setFailure("");
        setComputing(false);
      } catch (error) {
        if (requestIdRef.current !== id) return;
        setFailure(error instanceof Error ? error.message : "The synchronous model failed.");
        setComputing(false);
      }
    }, 120);
    return () => {
      window.clearTimeout(timer);
      if (workerGuardRef.current !== undefined) {
        window.clearTimeout(workerGuardRef.current);
        workerGuardRef.current = undefined;
      }
    };
  }, [params, engine]);

  /* ---- Actions ---------------------------------------------------------- */

  const selectPattern = useCallback((kind: PatternKind) => {
    setPattern(kind);
    if (kind !== "custom") {
      setFeatureMm(PATTERN_DEFAULT_FEATURE_MM[kind]);
    }
  }, []);

  const handleUpload = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setUploadError("Choose a PNG, JPEG or WebP image.");
        return;
      }
      setUploadError("");
      try {
        const field = await fileToField(file, gridN);
        setCustomField(field);
        setCustomName(file.name);
        setPattern("custom");
      } catch {
        setUploadError("The image could not be decoded in this browser.");
      }
    },
    [gridN]
  );

  const reset = useCallback(() => {
    setPattern(DEFAULT_PARAMS.pattern);
    setFeatureMm(DEFAULT_PARAMS.featureMm);
    setGridN(DEFAULT_PARAMS.gridN);
    setFilter(DEFAULT_PARAMS.filter);
    setFilterRadius(DEFAULT_PARAMS.filterRadius);
    setApertureRadius(DEFAULT_PARAMS.apertureRadius);
    setPhaseShift(DEFAULT_PARAMS.phaseShift);
    setFocalLength1Mm(DEFAULT_PARAMS.focalLength1Mm);
    setFocalLength2Mm(DEFAULT_PARAMS.focalLength2Mm);
    setWavelengthNm(DEFAULT_PARAMS.wavelengthNm);
    setObjectAtFocus(true);
    setObjectDistanceMm(DEFAULT_PARAMS.objectDistanceMm);
    setCustomField(null);
    setCustomName("");
    setUploadError("");
    setMeasurements([]);
    setMeasureLabel("");
    setFailure("");
    nextMeasurementId.current = 1;
  }, []);

  const applyGuided = useCallback(
    (index: number) => {
      const step = GUIDED_STEPS[index];
      if (!step) return;
      const preset = step.preset;
      if (preset.pattern) {
        setPattern(preset.pattern);
        if (preset.pattern !== "custom") setFeatureMm(PATTERN_DEFAULT_FEATURE_MM[preset.pattern]);
      }
      if (preset.filter) setFilter(preset.filter);
      if (preset.filterRadius !== undefined) setFilterRadius(preset.filterRadius);
      if (preset.apertureRadius !== undefined) setApertureRadius(preset.apertureRadius);
      if (preset.phaseShift !== undefined) setPhaseShift(preset.phaseShift);
      setObjectAtFocus(true);
    },
    []
  );

  const recordMeasurement = useCallback(() => {
    if (!result) return;
    const row: Measurement = {
      id: nextMeasurementId.current++,
      label: measureLabel.trim() || `Run ${measurements.length + 1}`,
      filter: FILTER_LABELS[filter],
      filterKind: filter,
      radius: filterRadius,
      cutoff: result.scale.filterCutoffPerMm,
      peak: result.peakFrequencyPerMm,
      period: result.peakPeriodMm,
      contrast: result.contrast,
      energy: result.energyPassed
    };
    setMeasurements((previous) => [...previous, row]);
    setMeasureLabel("");
  }, [result, measureLabel, measurements.length, filter, filterRadius]);

  const exportCsv = useCallback(() => {
    if (measurements.length === 0) return;
    const header = [
      "label",
      "filter",
      "normalised_radius",
      "cutoff_mm-1",
      "peak_frequency_mm-1",
      "dominant_period_mm",
      "contrast_sigma_over_mean",
      "energy_passed_fraction",
      "provenance"
    ];
    const escape = (value: string): string =>
      value.includes(",") || value.includes('"') || value.includes("\n")
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    const lines = [header.join(",")];
    for (const row of measurements) {
      lines.push(
        [
          escape(row.label),
          escape(row.filter),
          row.radius.toFixed(3),
          row.cutoff.toFixed(5),
          row.peak.toFixed(5),
          row.period.toFixed(5),
          row.contrast.toFixed(5),
          row.energy.toFixed(5),
          "SIMULATED"
        ].join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fourier-optics-simulated-measurements.csv";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [measurements]);

  /* ---- Panel data ------------------------------------------------------- */

  const thumbnails = useMemo(
    () =>
      OBJECT_PATTERNS.map((kind) => ({
        kind,
        field: makeObjectField({
          kind,
          n: 64,
          windowMm: DEFAULT_OBJECT_WINDOW_MM,
          featureMm: PATTERN_DEFAULT_FEATURE_MM[kind]
        })
      })),
    []
  );

  const customThumbnail = useMemo(() => {
    if (!customField) return null;
    const fromN = Math.round(Math.sqrt(customField.length));
    return resampleField(customField, fromN, 64);
  }, [customField]);

  const profileData = useMemo(() => {
    if (!result) return [];
    const n = result.scale.n;
    const magnification = Math.max(0.05, Math.abs(result.scale.magnification));
    const step = result.scale.objectPixelMm / magnification;
    return Array.from(result.profile, (value, index) => ({
      x: (index + 0.5 - n / 2) * step,
      intensity: value
    }));
  }, [result]);

  const sweepData = useMemo(() => {
    if (!result) return [];
    let maxContrast = 0;
    for (const point of result.sweep) maxContrast = Math.max(maxContrast, point.contrast);
    const denominator = maxContrast > 0 ? maxContrast : 1;
    return result.sweep.map((point) => ({
      radius: point.radius,
      energy: point.energyPassed,
      contrast: point.contrast / denominator
    }));
  }, [result]);

  const shownScale = result?.scale ?? liveScale;
  const n = shownScale.n;
  const objectField = result?.object;
  const featureLabel =
    pattern === "slits"
      ? "Slit separation"
      : pattern === "grating"
        ? "Grating period"
        : pattern === "checker"
          ? "Checker cell"
          : pattern === "rings"
            ? "Ring period"
            : pattern === "cross"
              ? "Bar scale"
              : "Feature size";

  const objectBar = niceLength(shownScale.objectWindowMm / 4);
  const fourierBar = niceLength(shownScale.fMaxPerMm / 2);
  const imageWidth = shownScale.objectWindowMm / Math.max(0.05, Math.abs(shownScale.magnification));
  const imageBar = niceLength(imageWidth / 4);

  const readouts: Readout[] = [
    {
      label: "Fourier scale",
      value: fmt(shownScale.fMaxPerMm, 2),
      unit: "mm⁻¹",
      note: `Δf = ${fmt(shownScale.dfPerMm, 3)} mm⁻¹`
    },
    {
      label: "Filter cutoff",
      value: fmt(shownScale.filterCutoffPerMm, 2),
      unit: "mm⁻¹",
      note:
        shownScale.filterCutoffPerMm > 0
          ? `1/f_c = ${fmt(1 / shownScale.filterCutoffPerMm, 2)} mm`
          : "all frequencies blocked"
    },
    {
      label: "Resolution limit",
      value:
        shownScale.coherentResolutionMm > 0 && Number.isFinite(shownScale.coherentResolutionMm)
          ? fmt(shownScale.coherentResolutionMm * 1000, 0)
          : "—",
      unit: "µm",
      note: `NA ${shownScale.na > 0 ? shownScale.na.toExponential(2) : "—"} · Abbe ${shownScale.abbeResolutionMm > 0 ? fmt(shownScale.abbeResolutionMm * 1000, 0) : "—"} µm`
    },
    {
      label: "Energy passed",
      value: result ? fmt(result.energyPassed * 100, 1) : "—",
      unit: "%",
      note: "of collected spectral energy",
      tone: "accent"
    },
    {
      label: "Contrast",
      value: result ? fmt(result.contrast, 2) : "—",
      note: "σ/μ of reconstruction"
    },
    {
      label: "Dominant period",
      value: result && result.peakPeriodMm > 0 ? fmt(result.peakPeriodMm, 2) : "—",
      unit: "mm",
      note: result ? `peak ${fmt(result.peakFrequencyPerMm, 2)} mm⁻¹` : "no peak detected"
    },
    {
      label: "Magnification",
      value: fmt(shownScale.magnification, 2),
      unit: "×",
      note: `f₂/f₁ = ${fmt(shownScale.focalLength2Mm / shownScale.focalLength1Mm, 2)}`
    },
    {
      label: "Free-space N_F",
      value: Number.isFinite(shownScale.fresnelNumber) ? fmt(shownScale.fresnelNumber, 1) : "—",
      note: "at the object–L1 distance"
    }
  ];

  const engineLabel =
    engine === "worker" ? "Web Worker" : engine === "fallback" ? "Sync fallback" : "Starting worker";
  const engineTone = engine === "worker" ? "petrol" : "brass";

  const controlsNode = (
  <div className="space-y-5">
    <div>
      <p className="label mb-2">Object</p>
      <div className="grid grid-cols-3 gap-1">
        {thumbnails.map((thumbnail) => {
          const active = pattern === thumbnail.kind;
          return (
            <button
              key={thumbnail.kind}
              type="button"
              aria-pressed={active}
              onClick={() => selectPattern(thumbnail.kind)}
              className={`group border p-1 text-left transition-colors ${
                active ? "border-ink bg-paper-3" : "border-line hover:border-line-strong"
              }`}
            >
              <IntensityCanvas
                values={thumbnail.field}
                size={64}
                colormap="mono"
                ariaLabel={`${PATTERN_LABELS[thumbnail.kind]} test object`}
                className="aspect-square"
              />
              <span className="mt-1 block text-[0.56rem] leading-tight text-ink-2">
                {PATTERN_LABELS[thumbnail.kind]}
              </span>
            </button>
          );
        })}
        {customThumbnail ? (
          <button
            type="button"
            aria-pressed={pattern === "custom"}
            onClick={() => setPattern("custom")}
            className={`group border p-1 text-left transition-colors ${
              pattern === "custom" ? "border-ink bg-paper-3" : "border-line hover:border-line-strong"
            }`}
            title={customName}
          >
            <IntensityCanvas
              values={customThumbnail}
              size={64}
              colormap="mono"
              ariaLabel="Uploaded custom object"
              className="aspect-square"
            />
            <span className="mt-1 block truncate text-[0.56rem] leading-tight text-ink-2">
              {customName || "Uploaded"}
            </span>
          </button>
        ) : null}
      </div>

      <div className="mt-2">
        <label className="btn btn-ghost btn-sm w-full cursor-pointer" aria-label="Upload an image as the object">
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              void handleUpload(file);
              event.target.value = "";
            }}
          />
        </label>
        <p className="mt-1 text-[0.58rem] leading-snug text-muted">
          Downsampled to {n}×{n} grayscale. White is transmissive; the image is centred on the axis.
        </p>
        {uploadError ? <p className="mt-1 text-[0.62rem] text-vermilion">{uploadError}</p> : null}
      </div>

      <div className="mt-3">
        <Slider
          label={featureLabel}
          value={featureMm}
          min={0.25}
          max={3}
          step={0.05}
          unit="mm"
          onChange={setFeatureMm}
          format={(value) => value.toFixed(2)}
          disabled={pattern === "letterQ" || pattern === "custom"}
          hint={
            pattern === "letterQ"
              ? "The letter Q has fixed proportions; its scale is set by the 12 mm window."
              : pattern === "custom"
                ? "Feature size is set by the uploaded image."
                : "Changes the object itself, so the spectrum and the measured period change together."
          }
        />
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-[0.75rem] text-ink-2" htmlFor="fourier-grid">
          FFT sampling
        </label>
        <select
          id="fourier-grid"
          className="field"
          value={gridN}
          onChange={(event) => setGridN(Number(event.target.value) === 256 ? 256 : 128)}
        >
          {FOURIER_GRID_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} × {size}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[0.6rem] text-muted">
          The object window stays {fmt(DEFAULT_OBJECT_WINDOW_MM, 0)} mm, so 256² extends f_max and
          halves the object pixel.
        </p>
      </div>
    </div>

    <div className="border-t border-line pt-4">
      <p className="label mb-3">Lenses and illumination</p>
      <div className="space-y-3">
        <Slider
          label="L1 focal length f₁"
          value={focalLength1Mm}
          min={50}
          max={500}
          step={5}
          unit="mm"
          onChange={setFocalLength1Mm}
          format={(value) => value.toFixed(0)}
          hint="Sets the Fourier-plane scale λf₁ and the cutoff for a given mask radius."
        />
        <Slider
          label="L2 focal length f₂"
          value={focalLength2Mm}
          min={50}
          max={500}
          step={5}
          unit="mm"
          onChange={setFocalLength2Mm}
          format={(value) => value.toFixed(0)}
          hint={`Image magnification M = f₂/f₁ = ${(focalLength2Mm / Math.max(1, focalLength1Mm)).toFixed(2)}.`}
        />
        <Slider
          label="Wavelength λ"
          value={wavelengthNm}
          min={400}
          max={700}
          step={0.1}
          unit="nm"
          onChange={setWavelengthNm}
          format={(value) => value.toFixed(1)}
          hint="The Fourier plane scales linearly with λ; a broadband source would blur the scale."
        />
        <Toggle
          label="Object at the front focal plane"
          checked={objectAtFocus}
          onChange={(checked) => {
            setObjectAtFocus(checked);
            if (!checked) setObjectDistanceMm(focalLength1Mm);
          }}
          hint="Keeps d₁ = f₁, the exact-transform condition."
        />
        <Slider
          label="Object distance d₁"
          value={objectAtFocus ? focalLength1Mm : objectDistanceMm}
          min={50}
          max={400}
          step={1}
          unit="mm"
          onChange={(value) => {
            setObjectDistanceMm(value);
            setObjectAtFocus(false);
          }}
          format={(value) => value.toFixed(0)}
          disabled={objectAtFocus}
          hint={
            objectAtFocus
              ? "Locked to f₁. Switch the toggle off to explore defocus."
              : `Defocus Δ = d₁ − f₁ = ${(objectDistanceMm - focalLength1Mm).toFixed(0)} mm; the image softens.`
          }
        />
      </div>
    </div>

    <div className="border-t border-line pt-4">
      <p className="label mb-2">Spatial filter</p>
      <label className="mb-1 block text-[0.75rem] text-ink-2" htmlFor="fourier-filter">
        Mask type
      </label>
      <select
        id="fourier-filter"
        className="field"
        value={filter}
        onChange={(event) => setFilter(event.target.value as FilterKind)}
      >
        {(Object.keys(FILTER_LABELS) as FilterKind[]).map((kind) => (
          <option key={kind} value={kind}>
            {FILTER_LABELS[kind]}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[0.62rem] leading-snug text-muted">{FILTER_DESCRIPTIONS[filter]}</p>

      <div className="mt-3 space-y-3">
        <Slider
          label="Filter radius r"
          value={filterRadius}
          min={0.02}
          max={0.9}
          step={0.01}
          onChange={setFilterRadius}
          format={(value) => value.toFixed(2)}
          disabled={filter === "none"}
          hint={`Cutoff f_c = ${fmt(liveScale.filterCutoffPerMm, 2)} mm⁻¹; 1/f_c = ${fmt(
            1 / Math.max(1e-6, liveScale.filterCutoffPerMm),
            2
          )} mm.`}
        />
        <Slider
          label="Iris radius (aperture)"
          value={apertureRadius}
          min={0.15}
          max={1}
          step={0.01}
          onChange={setApertureRadius}
          format={(value) => (value >= 0.995 ? "open" : value.toFixed(2))}
          hint="A second hard aperture in the Fourier plane. 'Open' removes the iris from the model."
        />
        <Slider
          label="Phase step φ"
          value={phaseShift}
          min={0}
          max={2 * Math.PI}
          step={0.05}
          onChange={setPhaseShift}
          format={(value) => `${(value / Math.PI).toFixed(2)}π`}
          disabled={filter !== "phase"}
          hint="Applied inside the disk only. π/2 is the Zernike phase-contrast condition for a weak object."
        />
      </div>
      <p className="mt-2 text-[0.58rem] leading-snug text-muted">
        The resolution readout uses the smaller of the iris and the amplitude mask. A phase plate limits the
        band only through the iris.
      </p>
    </div>

    <div className="border-t border-line pt-4">
      <p className="label mb-2">Suggested sequence</p>
      <ol className="space-y-1">
        {GUIDED_STEPS.map((step, index) => (
          <li key={step.title}>
            <button
              type="button"
              onClick={() => applyGuided(index)}
              className="w-full border border-line bg-paper px-2 py-1.5 text-left transition-colors hover:border-ink hover:bg-paper-3"
            >
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-0.5 block text-[0.7rem] leading-tight text-ink">{step.title}</span>
              <span className="mt-0.5 block text-[0.6rem] leading-snug text-muted">{step.text}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>

    <div className="border-t border-line pt-3">
      <p className="text-[0.6rem] leading-relaxed text-muted">
        The worker executes the same pure function as the synchronous fallback. If worker creation is
        blocked, the bench still runs and the badge reports “Sync fallback”.
      </p>
    </div>
  </div>
  );

  return (
    <SimulatorShell
      controls={controlsNode}
      title="4f optical processor"
      subtitle="Scalar paraxial coherent model · sampled 2D FFT"
      badge={
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge tone="slate">SIMULATED</Badge>
          <Badge tone={engineTone}>
            <span
              aria-hidden
              className={`inline-block h-[5px] w-[5px] ${computing ? "animate-pulse bg-brass" : engine === "worker" ? "bg-petrol" : "bg-brass"}`}
            />
            {computing ? "computing" : engineLabel}
          </Badge>
        </span>
      }
      spec={FOURIER_SIMULATION_SPEC}
      onReset={reset}
      readouts={readouts}
      guidedNote="Start with the suggested sequence in the controls: open pupil, spectrum, low-pass, high-pass, directional, phase. Each preset keeps the object at the front focal plane so the model stays in its exact-transform regime."
      freeNote="Every parameter is unlocked. Watch the model warnings when the object leaves the front focal plane, when the feature approaches the sample limit, or when f₂/f₁ magnifies the image."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-[0.6rem] text-muted">
          <span className="font-mono uppercase tracking-[0.08em]">
            {engineLabel} · {n}×{n} FFT · {filter === "none" ? "open pupil" : FILTER_LABELS[filter]}
          </span>
          <span className="num">
            {result ? `${fmt(result.computeMs, 1)} ms` : "—"} · sample pitch {fmt(shownScale.objectPixelMm * 1000, 1)} µm ·
            Fourier pitch {fmt(shownScale.fourierPixelMm * 1000, 1)} µm
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Row 1 — object and Fourier amplitude */}
        <div className="grid gap-3 md:grid-cols-2">
          <PanelFrame
            label="Object plane"
            meta={`${fmt(shownScale.objectWindowMm, 1)} mm window`}
          >
            {objectField ? (
              <IntensityCanvas
                values={objectField}
                size={n}
                colormap="mono"
                ariaLabel="Object amplitude transmission, white is transmissive"
                className="aspect-square"
                overlay={
                  <ScaleBar
                    fraction={objectBar / shownScale.objectWindowMm}
                    label={`${fmt(objectBar, objectBar < 1 ? 2 : 1)} mm`}
                  />
                }
              />
            ) : (
              <ComputingPlaceholder label="Assembling the object field" />
            )}
            <AxisFooter
              left={`−${fmt(shownScale.objectWindowMm / 2, 1)} mm`}
              centre="0"
              right={`+${fmt(shownScale.objectWindowMm / 2, 1)} mm`}
              caption={`Amplitude transmission. Sampling ${fmt(shownScale.objectPixelMm * 1000, 1)} µm/px.`}
            />
          </PanelFrame>

          <PanelFrame label="Fourier amplitude" meta="log |E|, centred">
            {result ? (
              <IntensityCanvas
                values={result.spectrum}
                size={n}
                colormap="amber"
                ariaLabel="Centred logarithm of the Fourier amplitude of the object"
                className="aspect-square"
                overlay={
                  <>
                    <PupilOverlay kind={filter} radius={filterRadius} aperture={apertureRadius} />
                    <ScaleBar
                      fraction={fourierBar / (2 * shownScale.fMaxPerMm)}
                      label={`${fmt(fourierBar, fourierBar < 1 ? 2 : 1)} mm⁻¹`}
                    />
                  </>
                }
              />
            ) : (
              <ComputingPlaceholder label="Computing the 2D transform" />
            )}
            <AxisFooter
              left={`−${fmt(shownScale.fMaxPerMm, 2)}`}
              centre="0"
              right={`+${fmt(shownScale.fMaxPerMm, 2)} mm⁻¹`}
              caption={`f_x = x_f/(λf₁); Δf = ${fmt(shownScale.dfPerMm, 3)} mm⁻¹. Dashed outline = mask; solid ring = iris.`}
            />
          </PanelFrame>
        </div>

        {/* Row 2 — phase and filtered spectrum */}
        <div className="grid gap-3 md:grid-cols-2">
          <PanelFrame label="Fourier phase" meta="cyclic, −π to +π">
            {result ? (
              <PhaseCanvas
                values={result.phase}
                brightness={result.spectrum}
                size={n}
                ariaLabel="Cyclic phase map of the object spectrum; hue encodes phase and brightness encodes amplitude"
              />
            ) : (
              <ComputingPlaceholder label="Computing the phase spectrum" />
            )}
            <AxisFooter
              left={`−${fmt(shownScale.fMaxPerMm, 2)}`}
              centre="0"
              right={`+${fmt(shownScale.fMaxPerMm, 2)} mm⁻¹`}
              caption="Hue = phase (cyclic, −π and +π meet at red); brightness ∝ log amplitude. Dark pixels have negligible amplitude, so their phase is not meaningful."
            />
          </PanelFrame>

          <PanelFrame label="Filtered spectrum" meta="log |E| · mask applied">
            {result ? (
              <IntensityCanvas
                values={result.filtered}
                size={n}
                colormap="amber"
                ariaLabel="Centred logarithm of the filtered Fourier amplitude"
                className="aspect-square"
                overlay={
                  <>
                    <PupilOverlay kind={filter} radius={filterRadius} aperture={apertureRadius} />
                    <ScaleBar
                      fraction={fourierBar / (2 * shownScale.fMaxPerMm)}
                      label={`${fmt(fourierBar, fourierBar < 1 ? 2 : 1)} mm⁻¹`}
                    />
                  </>
                }
              />
            ) : (
              <ComputingPlaceholder label="Applying the pupil mask" />
            )}
            <AxisFooter
              left={`−${fmt(shownScale.fMaxPerMm, 2)}`}
              centre="0"
              right={`+${fmt(shownScale.fMaxPerMm, 2)} mm⁻¹`}
              caption={`${FILTER_LABELS[filter]} · energy passed ${result ? fmt(result.energyPassed * 100, 1) : "—"}%.`}
            />
          </PanelFrame>
        </div>

        {/* Row 3 — reconstruction and profile */}
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
          <PanelFrame
            label="Reconstruction"
            meta={result ? `M = ${fmt(result.scale.magnification, 2)} · ${fmt(result.computeMs, 1)} ms` : "image intensity"}
          >
            {result ? (
              <IntensityCanvas
                values={result.reconstruction}
                size={n}
                colormap="mono"
                ariaLabel="Reconstructed image intensity after filtering"
                className="aspect-square"
                overlay={
                  <ScaleBar
                    fraction={imageBar / imageWidth}
                    label={`${fmt(imageBar, imageBar < 1 ? 2 : 1)} mm`}
                  />
                }
              />
            ) : (
              <ComputingPlaceholder label="Forming the image" />
            )}
            <AxisFooter
              left={`−${fmt(imageWidth / 2, 1)} mm`}
              centre="0"
              right={`+${fmt(imageWidth / 2, 1)} mm`}
              caption={`Normalised image intensity |E|², inverted by the 4f geometry; the display window covers ${fmt(imageWidth, 1)} mm.`}
            />
          </PanelFrame>

          <PanelFrame label="Line profile" meta="central row of the image">
            {profileData.length > 0 ? (
              <LabLineChart
                data={profileData}
                series={[{ key: "intensity", label: "intensity", color: "#14524A" }]}
                xKey="x"
                xLabel="image coordinate x (mm)"
                yLabel="I (norm.)"
                yDomain={[0, 1.05]}
                height={214}
                digits={3}
              />
            ) : (
              <ChartPlaceholder label="The profile appears after the first transform." height={214} />
            )}
            <p className="mt-1 text-[0.56rem] leading-snug text-muted">
              Averaged over three central rows. Compare the edge position and the overshoot with the object
              profile; the profile is the quantitative image, not the rendered brightness.
            </p>
          </PanelFrame>
        </div>

        {/* Row 4 — sweep and measurements */}
        <div className="grid gap-3 lg:grid-cols-2">
          <PanelFrame
            label={filter === "none" ? "Contrast and energy vs iris radius" : "Contrast and energy vs filter radius"}
            meta="12-point sweep"
          >
            {sweepData.length > 0 ? (
              <LabLineChart
                data={sweepData}
                series={[
                  { key: "energy", label: "energy passed", color: "#9A7527" },
                  { key: "contrast", label: "contrast / max", color: "#B23A1E", dashed: true }
                ]}
                xKey="radius"
                xLabel={filter === "none" ? "normalised iris radius r" : "normalised filter radius r"}
                yLabel="fraction"
                yDomain={[0, 1.05]}
                height={186}
                showLegend
                digits={3}
              />
            ) : (
              <ChartPlaceholder label="The sweep is computed with each run." height={186} />
            )}
            <p className="mt-1 text-[0.56rem] leading-snug text-muted">
              {filter === "none"
                ? "With an open pupil the sweep closes the iris, so it shows how the collected band alone changes energy and contrast. "
                : "The sweep reuses the same forward spectrum and changes only the mask radius. "}
              Contrast is normalised to its maximum in the sweep; energy is the absolute fraction of collected
              spectral energy.
            </p>
          </PanelFrame>

          <PanelFrame label="Recorded readouts" meta="SIMULATED">
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                className="field h-[30px] min-w-0 flex-1 text-[0.7rem]"
                value={measureLabel}
                onChange={(event) => setMeasureLabel(event.target.value)}
                placeholder="Label (optional)"
                aria-label="Measurement label"
                maxLength={40}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={recordMeasurement}
                disabled={!result}
              >
                Record
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={exportCsv}
                disabled={measurements.length === 0}
              >
                Export CSV
              </button>
              {measurements.length > 0 ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMeasurements([])}
                >
                  Clear
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-[0.56rem] leading-snug text-muted">
              Every row is a model readout, labelled SIMULATED in the CSV. Nothing here is a laboratory
              measurement.
            </p>
            {measurements.length > 0 ? (
              <div className="mt-2 max-h-[190px] overflow-auto">
                <DataTable
                  head={["Readout", "r", "f_c", "Period", "Contrast", "Energy"]}
                  rows={measurements.map((row) => [
                    <span key={`${row.id}-label`}>
                      {row.label}
                      <span className="block text-[0.56rem] leading-tight text-muted">
                        {FILTER_SHORT[row.filterKind]}
                      </span>
                    </span>,
                    row.radius.toFixed(2),
                    row.cutoff.toFixed(2),
                    row.period.toFixed(2),
                    row.contrast.toFixed(2),
                    `${(row.energy * 100).toFixed(1)}%`
                  ])}
                  align={["l", "r", "r", "r", "r", "r"]}
                  dense
                />
              </div>
            ) : (
              <p className="mt-3 border border-dashed border-line-strong px-3 py-4 text-center text-[0.68rem] text-muted">
                No readouts recorded. Set a filter, then press Record to add a row to the table and the CSV.
              </p>
            )}
          </PanelFrame>
        </div>

        {/* Model notes and warnings */}
        {failure ? (
          <p className="border border-vermilion/40 bg-vermilion/5 px-3 py-2 text-[0.68rem] leading-relaxed text-vermilion">
            {failure}
          </p>
        ) : null}
        {result && result.warnings.length > 0 ? (
          <div className="border border-brass/50 bg-brass/[0.06] px-3 py-2">
            <p className="label mb-1 text-brass">Model warnings</p>
            <ul className="space-y-0.5">
              {result.warnings.map((warning, index) => (
                <li key={index} className="text-[0.66rem] leading-snug text-ink-2">
                  — {warning}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-[0.6rem] leading-relaxed text-muted">
          Units: the object window is {fmt(shownScale.objectWindowMm, 1)} mm sampled on {n}×{n} points;
          Δf = 1/L = {fmt(shownScale.dfPerMm, 3)} mm⁻¹ and f_max = N/(2L) ={" "}
          {fmt(shownScale.fMaxPerMm, 2)} mm⁻¹. A Fourier-plane position x_f maps to f_x = x_f/(λf₁), with
          a pixel pitch of {fmt(shownScale.fourierPixelMm * 1000, 2)} µm. The image intensity is normalised;
          energy and contrast are relative model quantities.
        </p>
      </div>

    </SimulatorShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Placeholders                                                                */
/* -------------------------------------------------------------------------- */

function ComputingPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex aspect-square items-center justify-center border border-dashed border-line-strong bg-paper-3/40 p-4 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">{label}…</span>
    </div>
  );
}

function ChartPlaceholder({ label, height }: { label: string; height: number }) {
  return (
    <div
      className="flex items-center justify-center border border-dashed border-line-strong bg-paper-3/40 px-4 text-center"
      style={{ height }}
      role="status"
      aria-live="polite"
    >
      <span className="text-[0.66rem] leading-snug text-muted">{label}</span>
    </div>
  );
}
