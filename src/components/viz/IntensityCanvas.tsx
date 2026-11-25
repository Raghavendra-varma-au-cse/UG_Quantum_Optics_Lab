"use client";

import { useEffect, useRef } from "react";

export type Colormap = "mono" | "amber" | "petrol" | "thermal" | "gray";

function applyColormap(value: number, map: Colormap): [number, number, number] {
  const v = Math.max(0, Math.min(1, value));
  switch (map) {
    case "amber": {
      // Black → deep red → amber → warm white
      return [Math.round(255 * Math.min(1, v * 1.7)), Math.round(220 * v ** 1.5), Math.round(120 * v ** 3)];
    }
    case "petrol": {
      return [Math.round(18 + 120 * v ** 2), Math.round(30 + 190 * v ** 1.3), Math.round(40 + 170 * v)];
    }
    case "thermal": {
      const r = Math.min(255, Math.round(255 * Math.min(1, 1.6 * v)));
      const g = Math.min(255, Math.round(255 * Math.max(0, 1.8 * v - 0.7)));
      const b = Math.min(255, Math.round(255 * Math.max(0, 1.4 * v - 1.2)));
      return [r, g, b];
    }
    case "gray":
    case "mono":
    default: {
      const g = Math.round(255 * v);
      return [g, g, g];
    }
  }
}

/**
 * Renders a scalar field (fringe pattern, Fourier spectrum, force map) as an
 * image. Values are normalised to their own maximum. Not decorative: the
 * array is computed by the experiment's physics module.
 */
export function IntensityCanvas({
  values,
  width,
  height,
  size,
  colormap = "mono",
  gain = 1,
  className = "",
  ariaLabel,
  showScale = false,
  min = 0,
  max,
  overlay
}: {
  values: ArrayLike<number>;
  width?: number;
  height?: number;
  size?: number;
  colormap?: Colormap;
  gain?: number;
  className?: string;
  ariaLabel: string;
  showScale?: boolean;
  min?: number;
  max?: number;
  overlay?: React.ReactNode;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const n = size ?? Math.round(Math.sqrt(values.length));
  const w = width ?? n;
  const h = height ?? n;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let hi = max ?? -Infinity;
    if (max === undefined) {
      for (let i = 0; i < values.length; i++) {
        const v = values[i] ?? 0;
        if (v > hi) hi = v;
      }
    }
    const span = (hi || 1) - min || 1;
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const sy = Math.min(n - 1, Math.floor((y / h) * n));
      for (let x = 0; x < w; x++) {
        const sx = Math.min(n - 1, Math.floor((x / w) * n));
        const raw = (values[sy * n + sx] ?? 0) - min;
        const norm = Math.max(0, Math.min(1, (raw / span) * gain));
        const [r, g, b] = applyColormap(norm, colormap);
        const idx = (y * w + x) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [values, w, h, n, colormap, gain, min, max]);

  return (
    <div className={`viz-frame relative ${className}`}>
      <canvas
        ref={ref}
        width={w}
        height={h}
        role="img"
        aria-label={ariaLabel}
        className="h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
      {showScale ? (
        <div className="pointer-events-none absolute bottom-2 right-2 flex flex-col items-end gap-1">
          <div className="h-[3px] w-16 bg-gradient-to-r from-black via-[#c9a227] to-white" />
          <span className="font-mono text-[0.5rem] uppercase tracking-wider text-white/70">low → high</span>
        </div>
      ) : null}
      {overlay}
    </div>
  );
}

/** Small strip profile used in headers and inline previews. */
export function FringeStrip({
  values,
  height = 48,
  color = "#e7e2d6",
  className = ""
}: {
  values: ArrayLike<number>;
  height?: number;
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#121210";
    ctx.fillRect(0, 0, w, h);
    let hi = 1;
    for (let i = 0; i < values.length; i++) hi = Math.max(hi, values[i] ?? 0);
    ctx.beginPath();
    const n = values.length;
    for (let i = 0; i < n; i++) {
      const x = (i / Math.max(1, n - 1)) * w;
      const y = h - ((values[i] ?? 0) / hi) * (h - 2) - 1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [values, color]);
  return <canvas ref={ref} width={480} height={height} className={`h-full w-full ${className}`} aria-hidden />;
}
