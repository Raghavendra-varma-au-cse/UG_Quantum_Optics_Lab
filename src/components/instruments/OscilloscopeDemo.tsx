"use client";

import { useMemo, useState } from "react";
import { Slider, SegmentedControl } from "@/components/ui/Controls";
import { createRng } from "@/lib/physics/rng";

/**
 * Instrument face: a transimpedance photodiode signal on a simulated
 * oscilloscope. The trace is computed from responsivity, gain, bandwidth and
 * noise; it is not a recorded waveform.
 */
export function OscilloscopeDemo() {
  const [powerUw, setPowerUw] = useState(25);
  const [gainK, setGainK] = useState(100);
  const [bandwidthMhz, setBandwidthMhz] = useState(5);
  const [noise, setNoise] = useState(1);
  const [timebase, setTimebase] = useState(1);
  const [mode, setMode] = useState<"analog" | "photon">("analog");

  const trace = useMemo(() => {
    const n = 480;
    const rng = createRng(`scope:${powerUw}:${gainK}:${bandwidthMhz}:${noise}:${timebase}:${mode}`);
    const responsivity = 0.45; // A/W, typical Si at 632 nm
    const current = (powerUw * 1e-6) * responsivity; // A
    const transimpedance = gainK * 1e3; // V/A
    const vSignal = current * transimpedance; // V
    const bwLimit = Math.min(1, bandwidthMhz / (bandwidthMhz + 0.35 / (timebase * 1e-3)));
    const shotNoise = Math.sqrt(2 * 1.602e-19 * Math.max(current, 1e-12) * bandwidthMhz * 1e6) * transimpedance;
    const thermal = 1e-12 * Math.sqrt(bandwidthMhz * 1e6) * transimpedance;
    const noiseV = (shotNoise + thermal) * noise;
    const pts: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * timebase * 4e-3;
      const carrier = Math.sin(2 * Math.PI * 1000 * t) * vSignal * bwLimit * 0.5;
      const envelope = 0.6 + 0.4 * Math.sin(2 * Math.PI * 137 * t);
      pts.push(carrier * envelope + (rng() - 0.5) * noiseV * 4);
    }
    const peak = Math.max(...pts.map(Math.abs), 1e-9);
    return { pts, vSignal, noiseV, bwLimit, peak };
  }, [powerUw, gainK, bandwidthMhz, noise, timebase, mode]);

  const width = 620;
  const height = 230;
  const mid = height / 2;
  const scale = (height * 0.42) / Math.max(trace.peak, 1e-9);
  const path = trace.pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${((i / (trace.pts.length - 1)) * width).toFixed(2)} ${(mid - v * scale).toFixed(2)}`)
    .join(" ");

  const snr = trace.noiseV > 0 ? 20 * Math.log10(Math.abs(trace.vSignal) / trace.noiseV) : Infinity;

  return (
    <div className="border border-line-strong bg-paper-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-3/50 px-3 py-2">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink">Instrument face · oscilloscope</p>
        <SegmentedControl
          size="sm"
          ariaLabel="Detection mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "analog", label: "Photodiode" },
            { value: "photon", label: "Photon counting" }
          ]}
        />
      </div>

      <div className="relative bg-[#121210]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Simulated oscilloscope trace of a photodiode signal">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={(i / 10) * width} y1={0} x2={(i / 10) * width} y2={height} stroke="#2e2e28" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i / 5) * height} x2={width} y2={(i / 5) * height} stroke="#2e2e28" strokeWidth="0.5" />
          ))}
          {mode === "analog" ? (
            <path d={path} fill="none" stroke="#d8c98a" strokeWidth="1.1" />
          ) : (
            <g>
              {trace.pts.map((v, i) =>
                v > trace.peak * 0.55 ? (
                  <rect key={i} x={(i / trace.pts.length) * width} y={mid - 8 - (v / trace.peak) * 50} width="1.5" height={12 + (v / trace.peak) * 50} fill="#9fd3c4" opacity="0.85" />
                ) : null
              )}
              <line x1={0} y1={mid} x2={width} y2={mid} stroke="#3a3a34" strokeWidth="0.6" />
            </g>
          )}
          <text x={10} y={18} fill="#8f8a7c" fontSize="7" fontFamily="monospace">
            {mode === "analog" ? "CH1 500 mV/div · 1 ms/div" : "COUNTS · 10 µs bin"}
          </text>
          <text x={width - 10} y={18} fill="#8f8a7c" fontSize="7" fontFamily="monospace" textAnchor="end">
            {mode === "analog" ? `BW ${bandwidthMhz.toFixed(1)} MHz` : "SPAD · Geiger mode"}
          </text>
        </svg>
      </div>

      <div className="grid gap-4 border-t border-line px-3 py-3 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="Optical power" value={powerUw} min={0.1} max={200} step={0.1} unit="µW" onChange={setPowerUw} format={(v) => v.toFixed(1)} />
        <Slider label="Transimpedance gain" value={gainK} min={1} max={1000} step={1} unit="kV/A" onChange={setGainK} />
        <Slider label="Bandwidth" value={bandwidthMhz} min={0.1} max={50} step={0.1} unit="MHz" onChange={setBandwidthMhz} format={(v) => v.toFixed(1)} />
        <Slider label="Noise scale" value={noise} min={0} max={5} step={0.1} unit="×" onChange={setNoise} format={(v) => v.toFixed(1)} />
      </div>

      <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
        {[
          ["Signal", `${(trace.vSignal * 1e3).toFixed(2)} mV`],
          ["Noise (rms)", `${(trace.noiseV * 1e3).toFixed(3)} mV`],
          ["SNR", Number.isFinite(snr) ? `${snr.toFixed(1)} dB` : "∞"],
          ["Bandwidth factor", trace.bwLimit.toFixed(3)]
        ].map(([label, value]) => (
          <div key={label} className="border-r border-line px-3 py-2 last:border-r-0">
            <p className="label !text-[0.55rem]">{label}</p>
            <p className="num mt-0.5 text-[0.8rem] text-ink">{value}</p>
          </div>
        ))}
      </div>

      <p className="border-t border-line px-3 py-2 text-[0.64rem] leading-relaxed text-muted">
        {mode === "analog"
          ? "A photodiode measures optical power as a current. The transimpedance amplifier converts it to a voltage; bandwidth and noise set the smallest detectable modulation. This is not photon counting."
          : "A SPAD detects individual photons above breakdown and requires quenching. The trace shows discrete counts; at high flux the detector saturates and the Poisson statistics are no longer resolvable."}
      </p>
    </div>
  );
}
