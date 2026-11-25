import type { HardwareCategory } from "./types";

/**
 * Canonical hardware identifiers.
 *
 * These IDs are the contract between experiment content and the inventory.
 * Every entry is a category or a plausible teaching-laboratory item, not a
 * claim about a specific catalogue SKU. The full inventory in
 * `src/lib/content/hardware.ts` expands each one and records its verification
 * status. Experiments may only reference IDs from this list.
 */

export interface HardwareSeed {
  id: string;
  name: string;
  category: HardwareCategory;
  kind: "optical" | "optomechanical" | "instrument";
  experimentsHint: string[];
  note?: string;
}

export const HARDWARE_SEEDS: HardwareSeed[] = [
  // Sources
  { id: "src-he-ne", name: "Helium–neon laser, 632.8 nm", category: "Sources", kind: "optical", experimentsHint: ["michelson", "mach-zehnder", "fourier"] },
  { id: "src-diode-532", name: "Diode-pumped solid-state laser, 532 nm", category: "Sources", kind: "optical", experimentsHint: ["michelson", "tweezers", "qkd"] },
  { id: "src-diode-1064", name: "Diode-pumped laser, 1064 nm", category: "Sources", kind: "optical", experimentsHint: ["tweezers"] },
  { id: "src-white-led", name: "White-light LED source", category: "Sources", kind: "optical", experimentsHint: ["michelson"] },
  { id: "src-attenuated-laser", name: "Attenuated coherent source (classical analogue)", category: "Sources", kind: "optical", experimentsHint: ["quantum-eraser", "bomb-tester"] },
  { id: "src-single-photon", name: "Heralded single-photon source (requires verification)", category: "Sources", kind: "optical", experimentsHint: ["qkd", "quantum-eraser"], note: "Not assumed present. A genuine single-photon implementation requires an SPDC source, heralding detector and coincidence electronics." },

  // Mirrors and beam splitting
  { id: "mir-plane", name: "Plane dielectric mirror, 25 mm", category: "Mirrors", kind: "optical", experimentsHint: ["michelson", "mach-zehnder", "eraser"] },
  { id: "mir-spherical", name: "Concave spherical mirror", category: "Mirrors", kind: "optical", experimentsHint: ["michelson"] },
  { id: "bs-cube-50", name: "Non-polarizing beam-splitter cube, 50:50", category: "Beam splitting", kind: "optical", experimentsHint: ["michelson", "mach-zehnder", "bomb-tester", "eraser"] },
  { id: "bs-plate-50", name: "Plate beam splitter, 50:50", category: "Beam splitting", kind: "optical", experimentsHint: ["michelson"] },
  { id: "bs-polarizing", name: "Polarizing beam-splitter cube", category: "Beam splitting", kind: "optical", experimentsHint: ["polarization", "qkd", "eraser"] },

  // Polarization
  { id: "pol-linear", name: "Linear polarizer, mounted", category: "Polarization", kind: "optical", experimentsHint: ["polarization", "eraser", "qkd"] },
  { id: "pol-circular", name: "Circular polarizer (linear + quarter-wave)", category: "Polarization", kind: "optical", experimentsHint: ["polarization", "cinema"] },
  { id: "waveplate-half", name: "Zero-order half-wave plate", category: "Polarization", kind: "optical", experimentsHint: ["polarization", "eraser", "qkd"] },
  { id: "waveplate-quarter", name: "Zero-order quarter-wave plate", category: "Polarization", kind: "optical", experimentsHint: ["polarization", "cinema"] },
  { id: "pol-film-sheet", name: "Polarization film / sheet analyser", category: "Polarization", kind: "optical", experimentsHint: ["polarization", "cinema"] },

  // Lenses and objectives
  { id: "lens-convex", name: "Plano-convex lens, f = 100 mm", category: "Lenses & objectives", kind: "optical", experimentsHint: ["fourier", "michelson"] },
  { id: "lens-achromat", name: "Achromatic doublet, f = 150 mm", category: "Lenses & objectives", kind: "optical", experimentsHint: ["fourier"] },
  { id: "lens-objective-10x", name: "Microscope objective, 10×", category: "Lenses & objectives", kind: "optical", experimentsHint: ["tweezers", "fourier"] },
  { id: "lens-objective-100x", name: "High-NA microscope objective, 100× oil", category: "Lenses & objectives", kind: "optical", experimentsHint: ["tweezers"] },
  { id: "lens-tube", name: "Tube lens", category: "Lenses & objectives", kind: "optical", experimentsHint: ["tweezers"] },

  // Prisms, gratings, apertures, filters
  { id: "prism-right-angle", name: "Right-angle prism", category: "Prisms & gratings", kind: "optical", experimentsHint: ["polarization"] },
  { id: "grating-ruled", name: "Ruled diffraction grating", category: "Prisms & gratings", kind: "optical", experimentsHint: ["fourier"] },
  { id: "aperture-iris", name: "Iris diaphragm", category: "Filters & apertures", kind: "optical", experimentsHint: ["fourier", "alignment"] },
  { id: "aperture-slit", name: "Adjustable slit", category: "Filters & apertures", kind: "optical", experimentsHint: ["fourier"] },
  { id: "filter-bandpass", name: "Band-pass interference filter", category: "Filters & apertures", kind: "optical", experimentsHint: ["michelson", "tweezers"] },
  { id: "filter-nd", name: "Neutral-density filter set", category: "Filters & apertures", kind: "optical", experimentsHint: ["interference", "qkd", "tweezers"] },
  { id: "screen-white", name: "White viewing screen / alignment target", category: "Filters & apertures", kind: "optical", experimentsHint: ["michelson", "mach-zehnder", "alignment"] },
  { id: "bbo-crystal", name: "Beta-barium borate (BBO) nonlinear crystal", category: "Nonlinear optics", kind: "optical", experimentsHint: ["qkd", "eraser"], note: "Only relevant to a genuine SPDC implementation, which is not assumed." },
  { id: "fiber-single-mode", name: "Single-mode optical fibre", category: "Fibre", kind: "optical", experimentsHint: ["qkd"] },
  { id: "fiber-collimator", name: "Fibre collimator", category: "Fibre", kind: "optical", experimentsHint: ["qkd"] },

  // Detection
  { id: "det-photodiode", name: "Silicon photodiode (with transimpedance amplifier)", category: "Detection", kind: "instrument", experimentsHint: ["michelson", "mach-zehnder", "polarization", "fourier"] },
  { id: "det-power-meter", name: "Optical power meter", category: "Detection", kind: "instrument", experimentsHint: ["all"] },
  { id: "det-camera", name: "USB machine-vision camera", category: "Detection", kind: "instrument", experimentsHint: ["fourier", "tweezers", "michelson"] },
  { id: "det-spad", name: "Single-photon avalanche diode (SPAD)", category: "Detection", kind: "instrument", experimentsHint: ["qkd", "eraser"], note: "Requires verification; a photodiode cannot count photons." },
  { id: "det-photon-counter", name: "Photon counter / time tagger", category: "Detection", kind: "instrument", experimentsHint: ["qkd", "eraser"] },

  // Optomechanics
  { id: "post", name: "Optical post, 12.7 mm", category: "Mounts", kind: "optomechanical", experimentsHint: ["all"] },
  { id: "post-holder", name: "Post holder", category: "Mounts", kind: "optomechanical", experimentsHint: ["all"] },
  { id: "post-base", name: "Clamping fork / post base", category: "Mounts", kind: "optomechanical", experimentsHint: ["all"] },
  { id: "kinematic-mount", name: "Kinematic mirror mount", category: "Mounts", kind: "optomechanical", experimentsHint: ["michelson", "mach-zehnder"] },
  { id: "mirror-mount", name: "Fixed mirror mount", category: "Mounts", kind: "optomechanical", experimentsHint: ["michelson", "mach-zehnder"] },
  { id: "translation-stage", name: "Micrometer translation stage", category: "Positioning", kind: "optomechanical", experimentsHint: ["michelson", "fourier", "tweezers"] },
  { id: "rotation-mount", name: "Rotating mount with scale", category: "Positioning", kind: "optomechanical", experimentsHint: ["polarization"] },
  { id: "lens-tube-mount", name: "Lens tube / SM1 lens mount", category: "Mounts", kind: "optomechanical", experimentsHint: ["fourier", "tweezers"] },
  { id: "cage-system", name: "Cage system plate and rods", category: "Structure", kind: "optomechanical", experimentsHint: ["fourier", "tweezers"] },
  { id: "breadboard", name: "Damped optical breadboard", category: "Structure", kind: "optomechanical", experimentsHint: ["all"] },
  { id: "optical-table", name: "Pneumatic optical table", category: "Structure", kind: "optomechanical", experimentsHint: ["all"] },
  { id: "beam-block", name: "Beam block / laser safety barrier", category: "Accessories", kind: "optomechanical", experimentsHint: ["all"] },
  { id: "iris-diaphragm", name: "Iris diaphragm for beam centring", category: "Accessories", kind: "optomechanical", experimentsHint: ["alignment"] },
  { id: "micrometer", name: "Micrometer head, 25 mm travel", category: "Positioning", kind: "optomechanical", experimentsHint: ["michelson"] },
  { id: "lab-jack", name: "Laboratory jack", category: "Positioning", kind: "optomechanical", experimentsHint: ["tweezers"] },
  { id: "sample-stage", name: "Sample stage with XY translation", category: "Positioning", kind: "optomechanical", experimentsHint: ["tweezers"] },

  // Samples and accessories
  { id: "sample-gas-cell", name: "Gas cell with inlet valve", category: "Accessories", kind: "optical", experimentsHint: ["michelson"] },
  { id: "sample-glass-slide", name: "Glass slide / plate sample", category: "Accessories", kind: "optical", experimentsHint: ["michelson", "polarization"] },
  { id: "sample-metal-rod", name: "Metal rod for thermal-expansion measurement", category: "Accessories", kind: "optical", experimentsHint: ["michelson"] },
  { id: "sample-bead-suspension", name: "Dielectric microsphere suspension", category: "Accessories", kind: "optical", experimentsHint: ["tweezers"] },
  { id: "sample-coverslip", name: "Coverslip / sample chamber", category: "Accessories", kind: "optical", experimentsHint: ["tweezers"] },
  { id: "sample-3d-glasses-linear", name: "Linear-polarization 3D glasses", category: "Accessories", kind: "optical", experimentsHint: ["cinema"] },
  { id: "sample-3d-glasses-circular", name: "Circular-polarization 3D glasses", category: "Accessories", kind: "optical", experimentsHint: ["cinema"] },
  { id: "sample-projection-screen", name: "Polarization-preserving projection screen", category: "Accessories", kind: "optical", experimentsHint: ["cinema"] },

  // Instruments
  { id: "inst-oscilloscope", name: "Digital oscilloscope", category: "Detection", kind: "instrument", experimentsHint: ["michelson", "tweezers"] },
  { id: "inst-function-generator", name: "Function generator", category: "Detection", kind: "instrument", experimentsHint: ["tweezers"] },
  { id: "inst-spectrum-analyzer", name: "Spectrum analyser", category: "Detection", kind: "instrument", experimentsHint: ["tweezers"] },
  { id: "inst-beam-profiler", name: "Beam profiler", category: "Detection", kind: "instrument", experimentsHint: ["tweezers", "alignment"] },
  { id: "inst-shutter", name: "Mechanical shutter", category: "Accessories", kind: "instrument", experimentsHint: ["tweezers", "alignment"] },
  { id: "inst-safety-glasses", name: "Laser safety eyewear (wavelength-specific)", category: "Accessories", kind: "instrument", experimentsHint: ["all"] }
];

export const HARDWARE_IDS = HARDWARE_SEEDS.map((h) => h.id);

export const HARDWARE_ID_SET = new Set(HARDWARE_IDS);
