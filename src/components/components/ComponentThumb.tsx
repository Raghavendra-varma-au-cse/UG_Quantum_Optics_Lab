import type { HardwareCategory } from "@/lib/content/types";
import { ComponentGlyph, type GlyphKind } from "@/components/home/ComponentGlyph";

const MAP: Partial<Record<HardwareCategory, GlyphKind>> = {
  Mirrors: "mirror",
  "Beam splitting": "beamsplitter",
  Polarization: "polarizer",
  "Lenses & objectives": "lens",
  "Sources": "detector",
  "Detection": "detector",
  "Nonlinear optics": "grating",
  "Prisms & gratings": "grating",
  "Filters & apertures": "iris",
  Fibre: "lens",
  Mounts: "stage",
  Positioning: "stage",
  Structure: "stage",
  Accessories: "stage"
};

export function ComponentThumb({ category, name }: { category: HardwareCategory; name: string }) {
  const kind = MAP[category] ?? "lens";
  return (
    <div className="flex h-[76px] w-[76px] items-center justify-center border border-line bg-paper-2" title={name}>
      <ComponentGlyph kind={kind} className="h-[62px] w-[62px]" />
    </div>
  );
}
