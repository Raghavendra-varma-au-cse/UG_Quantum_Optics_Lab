/**
 * Hardware inventory for the Quantum Optics Laboratory.
 *
 * This module is the reference database behind the component library. Every
 * entry is a *category* or a plausible teaching-laboratory item, not a claim
 * about a specific catalogue SKU. No manufacturer part number is asserted.
 * Specification values are marked `typical: true` wherever they are textbook
 * or educational figures used to size an experiment; they must be replaced by
 * the value on the actual label before any measurement is reported.
 *
 * Provenance: all entries are `unverified`. Nothing here implies that the
 * laboratory owns the item. Items that only make sense inside a simulation
 * (SPDC crystal, SPAD, single-photon source, photon counter, 3D glasses,
 * projection screen) say so explicitly.
 */

import type {
  ExperimentSlug,
  HardwareCategory,
  HardwareItem,
  SpecRow
} from "./types";
import { HARDWARE_SEEDS } from "./hardware-ids";
import { EXPERIMENT_SLUGS } from "./registry";

const THORLABS_DOC = "https://www.thorlabs.com/";
const GENERIC_MAKER = "Generic (teaching laboratory)";

/** A typical/educational specification row. */
function spec(label: string, value: string): SpecRow {
  return { label, value, typical: true };
}

/** All eight experiments, used only for genuinely shared infrastructure. */
const ALL_EXPERIMENTS: ExperimentSlug[] = [
  "michelson-interferometer",
  "mach-zehnder-interferometer",
  "quantum-bomb-tester",
  "quantum-eraser",
  "polarization-3d-cinema",
  "fourier-optics",
  "quantum-key-distribution",
  "optical-tweezers"
];

/**
 * Inventory in seed order. Categories follow the same grouping as
 * `HARDWARE_SEEDS`: sources, passive optics, detection, optomechanics,
 * samples and shared instruments.
 *
 * `experiments` records where an item is *relevant or applicable*, not a claim
 * that every listed experiment owns it. The authoritative as-built kit list is
 * the `hardware` array on each experiment page.
 */
const ITEMS: HardwareItem[] = [
  // ── Sources ────────────────────────────────────────────────────────────
  {
    id: "src-he-ne",
    name: "Helium–neon laser, 632.8 nm",
    category: "Sources",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A sealed helium–neon tube supplies a continuous, highly coherent red beam at 632.8 nm, the reference source for Michelson and Mach–Zehnder work. Its long coherence length keeps fringe contrast usable over centimetre-scale path differences, and its fixed wavelength anchors length measurements. It is a low-power but still hazardous Class 3R source that must be enclosed and never aimed at eye level.",
    principle:
      "A DC glow discharge accelerates electrons through a helium–neon mixture. Metastable helium atoms transfer energy by collision into the neon 3s levels, creating a population inversion relative to the 2p levels. Stimulated emission on the 3s₂→2p₄ transition gives 632.8 nm, while Brewster-angled windows or an axial magnetic field select one linear polarization. The tube sits inside a high-reflectivity resonator; the narrow gain bandwidth is what gives the beam a coherence length of tens of centimetres.",
    specs: [
      spec("Emission wavelength", "632.8 nm (fixed by the neon transition)"),
      spec("Output power", "0.5–5 mW (typical teaching tube)"),
      spec("Beam diameter", "0.5–1.0 mm at 1/e²"),
      spec("Beam divergence", "0.8–1.5 mrad"),
      spec("Polarization", "linear, extinction ≥ 500:1"),
      spec("Coherence length", "0.1–1 m"),
      spec("Warm-up", "10–30 min for stable power and frequency"),
      spec("Safety classification", "Class 3R (typical); confirm the tube label")
    ],
    alignment: [
      "Clamp the tube in a V-block or cylindrical holder so the output is horizontal, at the height of the optical axis. Do not crush the tube body.",
      "Place two irises about 30 cm apart and centre both on the raw beam before adding any other optic.",
      "Let the tube warm up for 15–30 min, then record the power on the lowest meter range that does not clip.",
      "Keep the whole path below eye level and terminate every unused beam in a beam block."
    ],
    errors: [
      "Blocking the beam with a hand, a ruler or a shiny tool instead of a matte beam block.",
      "Expecting stable fringes immediately after switch-on: thermal drift of the tube and mounts moves them for many minutes.",
      "Using a mirror coated for 532 nm, which lowers fringe contrast and can transmit a stray reflection.",
      "Treating the output as unpolarized; the polarization is strong and rotates if the tube is rotated."
    ],
    applications: [
      "Coherent reference for two-path interferometry",
      "Wavelength calibration of a grating or spectrometer",
      "Alignment tracer for an invisible beam",
      "Demonstration of laser gain and coherence"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-bomb-tester",
      "quantum-eraser",
      "fourier-optics"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "src-diode-532",
    name: "Diode-pumped solid-state laser, 532 nm",
    category: "Sources",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A frequency-doubled diode-pumped laser delivers several milliwatts of green light in a clean TEM₀₀ beam. Green is the usual choice for optical tweezers because it is visible, efficiently detected by silicon, and can be attenuated to the few-photon level for QKD demonstrations. Most units also leak a small amount of invisible 1064 nm pump light, so an infrared filter is part of the source, not an accessory.",
    principle:
      "An 808 nm pump diode excites a neodymium-doped crystal (Nd:YAG or Nd:YVO₄) that lases at 1064 nm inside a resonator. A potassium titanyl phosphate (KTP) crystal inside or just outside the cavity doubles the frequency by second-harmonic generation: two 1064 nm photons combine into one 532 nm photon in a χ⁽²⁾ process. The doubling crystal is temperature-stabilised because its phase-matching condition drifts with temperature, and the output is normally linearly polarized.",
    specs: [
      spec("Wavelength", "532 nm (with residual 1064 nm leakage)"),
      spec("Output power", "5–100 mW, CW"),
      spec("Beam quality", "TEM₀₀, M² < 1.2"),
      spec("Beam diameter", "0.7–2 mm at 1/e²"),
      spec("Coherence length", "1–50 cm, often much shorter than a HeNe"),
      spec("Polarization", "linear, ≥ 100:1 typical"),
      spec("Warm-up", "5–15 min to reach the temperature setpoint"),
      spec("Safety classification", "Class 3B (typical); confirm the label")
    ],
    alignment: [
      "Mount the head so the beam is horizontal and at the standard optical height, then centre two irises on the raw beam.",
      "Place an infrared-blocking filter after the exit aperture and verify with an IR-sensitive card that no 1064 nm remains.",
      "Attenuate with neutral-density filters before any camera or photodiode; a few milliwatts already saturate most sensors.",
      "Re-check the beam path after warm-up, because thermal expansion of the head can move the beam by a milliradian."
    ],
    errors: [
      "Omitting the IR filter and assuming the invisible leakage is harmless.",
      "Changing the head temperature or operating before the setpoint is reached, causing mode hops and power jumps.",
      "Overfilling a microscope objective so that the extra power heats the mount instead of tightening the focus.",
      "Using a dichroic designed for 45° at normal incidence, which shifts the transmitted band."
    ],
    applications: [
      "Optical trapping of micrometre-scale particles",
      "Attenuated source for BB84 demonstrations",
      "Green interferometry and diffraction demonstrations",
      "Fluorescence excitation"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-eraser",
      "quantum-key-distribution",
      "optical-tweezers"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "src-diode-1064",
    name: "Diode-pumped laser, 1064 nm",
    category: "Sources",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "An infrared diode-pumped laser at 1064 nm is used where lower scattering and reduced photochemical damage matter, notably for trapping biological samples. The beam is invisible, so alignment depends on an infrared viewer or a fluorescent card and the entire path must be enclosed. Weak but non-zero water absorption at this wavelength can still heat a sample, so power is kept as low as the trap allows.",
    principle:
      "An 808 nm diode pumps a Nd:YVO₄ or Nd:YAG crystal, which lases on the 1064 nm four-level transition. The resonator selects a TEM₀₀ mode and a polarizing element fixes the output polarization. Compared with visible light, 1064 nm is scattered less by small inhomogeneities and causes less photochemical damage, but it is absorbed by water orders of magnitude more strongly than green light, so heating must be managed.",
    specs: [
      spec("Wavelength", "1064 nm (invisible)"),
      spec("Output power", "50–500 mW, CW"),
      spec("Beam quality", "TEM₀₀, M² < 1.2"),
      spec("Beam diameter", "1–2 mm at 1/e²"),
      spec("Polarization", "linear, ≥ 100:1 typical"),
      spec("Coherence length", "0.1–1 m"),
      spec("Warm-up", "10–20 min"),
      spec("Safety classification", "Class 3B or 4 (typical); confirm the label")
    ],
    alignment: [
      "Co-align a low-power visible tracer beam with the IR beam using a dichroic or a flip mirror, then align the rest of the system to the tracer.",
      "Use an IR viewer or an IR-sensitive fluorescent card for every check; never infer the beam position from a red dot.",
      "Enclose the path with IR-opaque panels and confirm the enclosure with a viewer before increasing power.",
      "Measure power with a head calibrated at 1064 nm, not with a visible-range sensor."
    ],
    errors: [
      "Assuming an unlit path is safe; 1064 nm is invisible and can cause retinal damage before any sensation.",
      "Using optics labelled for the visible that transmit only part of the IR beam and heat up.",
      "Setting trap power by the driver dial instead of measuring at the sample plane.",
      "Forgetting that water absorbs at 1064 nm and over-heating a biological specimen."
    ],
    applications: [
      "Infrared optical tweezers",
      "Trapping in turbid or biological media",
      "Low-photodamage micromanipulation",
      "Pump source for further nonlinear conversion"
    ],
    experiments: ["optical-tweezers"],
    verification: "unverified",
    generic: true
  },
  {
    id: "src-white-led",
    name: "White-light LED source",
    category: "Sources",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A white-light LED provides a broad, spatially extended, low-coherence source for white-light interference and for broadband illumination in imaging. Fringes appear only when the two interferometer arms are matched to within a few micrometres, which makes the source a direct demonstration of coherence length. It is also the honest way to show why a laser is needed for large-path-difference interferometry.",
    principle:
      "A blue InGaN die pumps a Ce:YAG phosphor; the mixture of transmitted blue and Stokes-shifted yellow emission approximates a broad visible spectrum. Each atomic emitter radiates independently, so both spatial and temporal coherence are low and the coherence length is only a few micrometres. A condenser or diffuser is needed to fill the interferometer aperture uniformly, and the finite emitter size limits spatial coherence.",
    specs: [
      spec("Spectrum", "broadband, roughly 450–650 nm"),
      spec("Correlated colour temperature", "4000–6500 K typical"),
      spec("Optical output", "0.1–1 W from a 1–3 mm emitter"),
      spec("Coherence length", "1–5 µm (typical, order-of-magnitude only)"),
      spec("Polarization", "none defined"),
      spec("Modulation", "may flicker at driver/PWM frequency"),
      spec("Lifetime", "tens of thousands of hours, decreasing with drive current")
    ],
    alignment: [
      "Image or condense the emitter into the interferometer aperture so the input face is evenly filled.",
      "Use an iris to set the source etendue and keep the beam within the mirrors' clear aperture.",
      "Find white-light fringes by scanning the delay arm slowly around zero optical path difference; count only the few visible orders.",
      "Average several camera frames to suppress LED flicker and detector noise."
    ],
    errors: [
      "Searching for fringes far from zero path difference, where the coherence envelope is already zero.",
      "Using the bare LED without a condenser, so only a small part of the aperture is illuminated.",
      "Ignoring ambient room light, which adds a constant background and lowers apparent contrast.",
      "Driving the LED with PWM and mistaking the flicker for interference."
    ],
    applications: [
      "White-light Michelson fringes",
      "Coherence-length demonstration",
      "Broadband illumination for imaging",
      "Colour and dispersion demonstrations"
    ],
    experiments: ["michelson-interferometer", "fourier-optics"],
    verification: "unverified",
    generic: true
  },
  {
    id: "src-attenuated-laser",
    name: "Attenuated coherent source (classical analogue)",
    category: "Sources",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A laser followed by calibrated neutral-density attenuation produces a Poissonian few-photon beam that reproduces the count rates of a quantum source without any non-classical statistics. It is the honest classical analogue used in quantum-eraser and bomb-tester demonstrations, and it must never be described as a single-photon source. The entry exists so the difference between 'dim light' and 'one photon' is explicit in the inventory.",
    principle:
      "A coherent state attenuated by a factor T remains a coherent state with mean photon number µ = T·P/(hν) per coherence time. Its photon-number distribution stays Poissonian, with variance equal to the mean, so the second-order correlation is g⁽²⁾(0) = 1. At µ ≪ 1 most detection windows contain zero photons and a few contain one, which is enough to show click correlations and threshold behaviour, but not antibunching. A calibrated OD wheel plus a monitor tap sets µ repeatably.",
    specs: [
      spec("Wavelength", "632.8 nm or 532 nm, matching the laser"),
      spec("Attenuation range", "OD 0.3–6 in steps (typical filter set)"),
      spec("Mean photons per window", "10⁻³–10⁻¹ (set by OD and window length)"),
      spec("Photon statistics", "Poissonian, g⁽²⁾(0) = 1"),
      spec("Polarization", "preserved by absorptive ND glass"),
      spec("Output power", "below 1 µW; often below 1 nW"),
      spec("Stability", "limited by laser power drift and filter heating")
    ],
    alignment: [
      "Measure the unattenuated power, then compute the OD needed for the target mean photon number.",
      "Insert the ND filter in a wheel or flip mount so the attenuated beam stays on the same axis.",
      "Verify the attenuated power on the lowest meter range, or count with a calibrated SPAD if the power is below the meter floor.",
      "Record the OD, the meter reading and the counting window together; never rely on the filter label alone."
    ],
    errors: [
      "Calling the output a single-photon source; attenuation cannot change g⁽²⁾(0) from unity.",
      "Detector afterpulsing producing apparent antibunching in a Hong–Ou–Mandel-style test.",
      "Stray room light or a leaking shutter adding counts that are not from the source.",
      "Saturating the SPAD and then correcting the count rate with a dead-time model that does not apply."
    ],
    applications: [
      "Classical analogue of single-photon interference",
      "Threshold and click-statistics demonstrations",
      "Detector dead-time and afterpulsing studies",
      "Alignment of photon-counting apparatus before a quantum source is available"
    ],
    experiments: [
      "quantum-bomb-tester",
      "quantum-eraser",
      "quantum-key-distribution"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "src-single-photon",
    name: "Heralded single-photon source (requires verification)",
    category: "Sources",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A heralded single-photon source would use spontaneous parametric down-conversion and a herald detector to announce one photon in the partner mode. No such source is assumed to exist in this laboratory; the entry records what a genuine implementation requires and what must be checked before any single-photon claim is made. Treat any proposed source as absent until its g⁽²⁾ measurement, loss budget and coincidence electronics have been independently verified.",
    principle:
      "A pump photon in a χ⁽²⁾ crystal can split into signal and idler photons while conserving energy and momentum (phase matching). Detecting the idler as a herald projects the signal onto a near-single-photon state. The quality is quantified by g⁽²⁾(0) < 0.5 in a Hanbury Brown–Twiss measurement after subtracting background and correcting for afterpulsing. Heralding efficiency, detector jitter and all optical losses decide whether the heralded state is useful for an experiment.",
    specs: [
      spec("Pump wavelength", "405 nm typical for degenerate SPDC"),
      spec("Signal / idler", "around 810 nm degenerate (typical)"),
      spec("Target antibunching", "g⁽²⁾(0) < 0.5, ideally ≪ 0.5"),
      spec("Heralding efficiency", "10–60% depending on coupling and loss"),
      spec("Coincidence window", "1–10 ns, set by detector jitter"),
      spec("Detector requirement", "SPAD or SNSPD with low dark counts"),
      spec("Status in this laboratory", "not assumed present; verify before use")
    ],
    alignment: [
      "Confirm the crystal phase-matching angle and temperature against the pump wavelength before connecting detectors.",
      "Couple signal and idler into single-mode fibre and maximise each count rate independently.",
      "Set the coincidence window from the measured detector jitter and cable delays, then record raw and accidental rates.",
      "Measure g⁽²⁾(0) with a fibre beam splitter and two detectors, and report the background-subtracted value with its uncertainty."
    ],
    errors: [
      "Presenting an attenuated laser as a single-photon source.",
      "Reporting g⁽²⁾ without subtracting accidentals or detector afterpulsing.",
      "Ignoring pump scatter that reaches the detectors and inflates both singles and coincidences.",
      "Assuming a herald guarantees one photon when loss and multi-pair emission spoil the state."
    ],
    applications: [
      "Genuine single-photon interference and erasure",
      "BB84 with a true single-photon source",
      "Hanbury Brown–Twiss and antibunching demonstrations",
      "Heralded photon-pair source characterisation"
    ],
    experiments: ["quantum-key-distribution", "quantum-eraser"],
    verification: "unverified",
    generic: true
  },

  // ── Mirrors and beam splitting ─────────────────────────────────────────
  {
    id: "mir-plane",
    name: "Plane dielectric mirror, 25 mm",
    category: "Mirrors",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A 25 mm plane dielectric mirror steers a beam with high reflectivity and low absorption at its design wavelength. Dielectric multilayer coatings are preferred over metal for laser work because they dissipate little power and tolerate higher intensity. It is the folding element in Michelson, Mach–Zehnder and delay arms.",
    principle:
      "Alternating high- and low-index quarter-wave layers form a Bragg stack whose partial reflections add in phase across a stop band, giving reflectivity above 99% at the design angle and wavelength. The reflected wave acquires a phase shift that depends on the top layer and the incidence angle, which matters when two arms recombine. Metal coatings reflect over a broad band but absorb a few percent and cannot withstand high power.",
    specs: [
      spec("Substrate", "N-BK7 or fused silica (typical)"),
      spec("Diameter / thickness", "25.4 mm / 6 mm (typical)"),
      spec("Reflectivity", "> 99% over the design band"),
      spec("Design angle of incidence", "0–45°, depending on coating"),
      spec("Surface flatness", "λ/10 over the clear aperture (typical)"),
      spec("Surface quality", "10–5 scratch–dig (typical)"),
      spec("Mounting", "SM1-threaded kinematic mount"),
      spec("Damage threshold", "> 1 J/cm² at 10 ns, 532 nm (typical; verify)")
    ],
    alignment: [
      "Seat the mirror in a kinematic mount and set the angle of incidence close to the coating design value.",
      "Use two irises, one near the mirror and one far away, to separate position error from angle error.",
      "Walk the beam by alternating adjustments of the near and far irises rather than chasing the spot.",
      "Check the reflected power with a meter and keep the unused transmitted/leakage beam blocked."
    ],
    errors: [
      "Using a mirror coated for the wrong wavelength, which raises loss and can transmit a dangerous stray beam.",
      "Operating a 45° coating at normal incidence and accepting a large reflectivity drop.",
      "Ignoring the weak back-surface reflection from the substrate.",
      "Over-tightening the retaining ring, which distorts the substrate and spoils wavefront quality."
    ],
    applications: [
      "Folding an interferometer arm",
      "Beam steering and delay lines",
      "Ring resonators and optical cavities",
      "Periscopes and vertical beam transfer"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-bomb-tester",
      "quantum-eraser"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "mir-spherical",
    name: "Concave spherical mirror",
    category: "Mirrors",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A concave spherical mirror both reflects and focuses, so it can fold an arm while controlling beam size. In a Michelson interferometer it supports a confocal or near-confocal configuration with curved wavefronts, and in a resonator it forms a stable cavity. Its focal length is half its radius of curvature, and its alignment is more sensitive to tilt than a plane mirror.",
    principle:
      "A spherical reflecting surface imposes a quadratic phase front on the reflected beam, equivalent to a thin lens of focal length f = R/2 followed by a plane mirror. Two such mirrors separated by roughly their radius of curvature form a stable optical resonator, because the focusing exactly compensates diffraction. In an interferometer the curved return wavefront must match the other arm, or the fringes become concentric rings rather than straight lines.",
    specs: [
      spec("Substrate", "N-BK7 or fused silica (typical)"),
      spec("Diameter", "12.7–25.4 mm (typical)"),
      spec("Radius of curvature", "100–500 mm; f = R/2"),
      spec("Coating", "dielectric HR at the design wavelength"),
      spec("Surface figure", "λ/10 or better (typical)"),
      spec("Mounting", "kinematic mount with tip/tilt"),
      spec("Damage threshold", "> 1 J/cm² at 10 ns (typical; verify)")
    ],
    alignment: [
      "Set the mirror roughly one radius of curvature from the other cavity element or from the beam waist.",
      "Centre the return beam on the input iris; a spherical mirror returns a converging or diverging beam, so judge the far-field pattern rather than a single spot.",
      "Tilt in small increments while watching the fringe curvature; straight fringes mean the wavefronts match.",
      "Check that the beam does not walk off the coating when the angle is changed."
    ],
    errors: [
      "Using the nominal radius as the focal length; the focal length is R/2.",
      "Judging alignment only at the near field and missing a large angular error.",
      "Placing the mirror at a distance where the cavity is unstable.",
      "Mixing a spherical mirror with a plane mirror in an arm without accounting for the different wavefront curvature."
    ],
    applications: [
      "Confocal Michelson interferometer",
      "Stable optical cavity end mirror",
      "Focusing a return beam onto a detector",
      "Beam-size control in a folded arm"
    ],
    experiments: ["michelson-interferometer"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "bs-cube-50",
    name: "Non-polarizing beam-splitter cube, 50:50",
    category: "Beam splitting",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A cemented cube with a dielectric hypotenuse splits a beam 50:50 with negligible lateral displacement and no back-surface ghost. It is the standard recombination element in Michelson and Mach–Zehnder builds where two outputs must be accessible. The cube transmits and reflects comparable amounts of both polarizations, so it does not itself analyse polarization.",
    principle:
      "Two right-angle prisms are cemented into a cube, and the hypotenuse carries a dielectric coating designed for 50/50 splitting at 45° internal incidence. Unitarity fixes the relation between the transmitted and reflected amplitudes; in the symmetric convention the reflected port acquires a factor i (a π/2 phase) relative to transmission. Because both beams traverse the same glass path, the cube is much less sensitive to translation and wavelength than a thin plate, and the cement suppresses the ghost reflection.",
    specs: [
      spec("Splitting ratio", "50:50 ± 5% at the design wavelength"),
      spec("Wavelength range", "400–700 nm for a visible coating (typical)"),
      spec("Polarization dependence", "small by design; verify at your wavelength"),
      spec("Clear aperture", "10–20 mm (typical)"),
      spec("Transmitted wavefront", "λ/4 to λ/10 (typical)"),
      spec("Reflected phase", "approximately π/2 relative to transmission"),
      spec("Mounting", "SM1 thread or 30 mm cage"),
      spec("Damage threshold", "cement-limited; verify for pulsed use")
    ],
    alignment: [
      "Set the input face normal to the beam so the transmitted beam does not refract sideways.",
      "Use the transmitted and reflected ports as the two arms; keep one port terminated until the layout is complete.",
      "Measure the split ratio with a power meter and record it, because the arms are rarely exactly equal.",
      "If the two recombined outputs are used, keep the cube orientation fixed: rotating it changes which port carries the π/2 phase."
    ],
    errors: [
      "Assuming the cube is exactly 50:50 at every wavelength; the coating is designed for a band.",
      "Using a polarizing cube where a non-polarizing one is needed and then blaming fringe visibility on coherence.",
      "Forgetting the reflected-port phase when predicting which output is dark.",
      "Illuminating the cube outside its clear aperture or at a large angle, which shifts the ratio."
    ],
    applications: [
      "Michelson and Mach–Zehnder beam splitting",
      "Balanced homodyne and coincidence setups",
      "Combining two beams onto one axis",
      "Teaching beam-splitter matrices and unitarity"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-bomb-tester",
      "quantum-eraser"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "bs-plate-50",
    name: "Plate beam splitter, 50:50",
    category: "Beam splitting",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A thin plate with a first-surface dielectric coating splits a beam at 45° with minimal glass path and low cost. It is used where a cube's cement or dispersion is unwanted, but the second surface produces a weak ghost that must be blocked or displaced. A wedge or an antireflection-coated back surface is preferred for coherent work.",
    principle:
      "The coating on the front surface reflects part of the beam and transmits the rest. The transmitted beam refracts through the substrate and exits parallel but laterally displaced; the weak reflection from the back surface emerges as a secondary beam. If that ghost overlaps the main beam it forms a parasitic interferometer with its own phase, so the plate is often wedged or tilted slightly and the ghost is dumped.",
    specs: [
      spec("Splitting ratio", "50:50 ± 5% at the design wavelength"),
      spec("Substrate", "fused silica or N-BK7, 1–3 mm thick"),
      spec("Coating", "first-surface dielectric, 45° design"),
      spec("Ghost", "weak second-surface reflection; wedge recommended"),
      spec("Clear aperture", "20–25 mm (typical)"),
      spec("Mounting", "SM1 or kinematic plate holder"),
      spec("Damage threshold", "> 1 J/cm² at 10 ns (typical; verify)")
    ],
    alignment: [
      "Set the plate at 45° to the input beam and check that the reflected beam is at 90°.",
      "Tilt the plate slightly about the vertical axis so the back-surface ghost walks away from the main beam.",
      "Place a beam block where the ghost lands, not in the main path.",
      "Measure both output powers; a plate often deviates from 50:50 because of coating and absorption."
    ],
    errors: [
      "Ignoring the second-surface ghost, which produces a second set of fringes or a spurious beat.",
      "Using the plate at normal incidence where the coating is not designed to split.",
      "Clamping the plate at its centre and inducing stress birefringence.",
      "Assuming the plate has the same phase relation as a cube."
    ],
    applications: [
      "Low-cost Michelson beam splitting",
      "Pick-off for a monitor detector",
      "Beam sampling in an imaging path",
      "Demonstration of ghost reflections"
    ],
    experiments: ["michelson-interferometer", "mach-zehnder-interferometer"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "bs-polarizing",
    name: "Polarizing beam-splitter cube",
    category: "Beam splitting",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A polarizing beam-splitter cube separates two orthogonal linear polarizations into different ports with high extinction. It is the analyser and basis selector in polarization experiments and in a BB84 demonstration, and it can also clean up a laser's polarization. Unlike a non-polarizing cube, its splitting ratio is deliberately extreme and depends on the input polarization state.",
    principle:
      "A multilayer dielectric coating on the cube hypotenuse is designed for 45° internal incidence so that one linear polarization (usually s) is almost totally reflected while the orthogonal (p) is transmitted. In the MacNeille design the coating is embedded at an angle close to Brewster's angle, which minimizes reflection of the p component. The two output ports therefore carry orthogonal linear states, and rotating the cube about the beam axis selects which lab axis is transmitted.",
    specs: [
      spec("Extinction ratio", "≥ 1000:1 transmitted, verify"),
      spec("Transmission", "> 90% for p, reflection > 99% for s (typical)"),
      spec("Wavelength range", "420–680 nm for a visible coating (typical)"),
      spec("Clear aperture", "10–20 mm"),
      spec("Angle of incidence", "0° (cube face normal)"),
      spec("Mounting", "SM1 or rotation mount"),
      spec("Damage threshold", "cement and coating limited; verify")
    ],
    alignment: [
      "Set the input face normal to the beam and rotate the cube about the beam axis until the transmitted power is maximum for the desired input state.",
      "Check extinction by placing a linear analyser after each port and rotating it; a good cube gives a deep minimum.",
      "Label the transmitted and reflected ports with their polarization; do not rely on memory during a run.",
      "Terminate the unused port in a beam block, especially when the source is intense."
    ],
    errors: [
      "Using the cube with unpolarized or circular input and expecting a fixed 50:50 split.",
      "Confusing the transmitted and reflected polarization labels between setups.",
      "Assuming the extinction is perfect; a real cube leaks a small orthogonal component that limits QBER.",
      "Rotating the cube to change splitting ratio; rotation changes the basis, not the ratio."
    ],
    applications: [
      "Polarization analysis and state preparation",
      "BB84 basis selection",
      "Which-path marking in an eraser",
      "Laser polarization cleanup"
    ],
    experiments: [
      "mach-zehnder-interferometer",
      "quantum-eraser",
      "polarization-3d-cinema",
      "quantum-key-distribution"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },

  // ── Polarization ───────────────────────────────────────────────────────
  {
    id: "pol-linear",
    name: "Linear polarizer, mounted",
    category: "Polarization",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A mounted linear polarizer transmits one electric-field direction and absorbs or scatters the orthogonal one. It is the analyser in Malus's-law measurements, the state preparer at the input of a polarization experiment, and the simplest way to check whether a beam is polarized. A dichroic sheet is adequate for teaching; a calcite or wire-grid polarizer is used where extinction or power handling matters.",
    principle:
      "Dichroic polymer sheets contain aligned long-chain molecules that absorb light whose electric field lies along the chains while transmitting the perpendicular component. The transmitted intensity through an ideal analyser follows Malus's law, I = I₀ cos²θ, where θ is the angle between the input linear state and the analyser axis. Real polarizers have finite extinction, so the minimum is not zero and the transmitted beam is slightly elliptical.",
    specs: [
      spec("Type", "dichroic polymer sheet in a rotation mount (typical)"),
      spec("Wavelength range", "400–700 nm"),
      spec("Extinction ratio", "≥ 1000:1 (typical; verify)"),
      spec("Transmission at pass axis", "42–45% (ideal is 50%)"),
      spec("Clear aperture", "20–25 mm"),
      spec("Angular field", "small; keep incidence near normal"),
      spec("Mounting", "SM1 rotation mount with scale"),
      spec("Damage threshold", "low for polymer film; verify for CW and pulsed")
    ],
    alignment: [
      "Mount the polarizer in a rotation stage with a readable scale and set the scale zero arbitrarily.",
      "With a known linearly polarized input, rotate until transmission is maximum; record that angle as the pass axis.",
      "Rotate 90° and confirm the minimum; the ratio of maximum to minimum is the extinction.",
      "Keep the polarizer normal to the beam, because tilting changes both path and effective axis."
    ],
    errors: [
      "Using the polarizer at a large angle of incidence and treating the projection as Malus's law.",
      "Exceeding the damage threshold of a polymer sheet with a focused beam.",
      "Forgetting that a polarizer also absorbs power and can heat and distort.",
      "Reading the scale as an absolute polarization angle without calibrating the mount zero."
    ],
    applications: [
      "Malus's-law measurements",
      "State preparation for wave-plate experiments",
      "Extinction-ratio measurement of cubes and plates",
      "Glare and reflection demonstrations"
    ],
    experiments: [
      "polarization-3d-cinema",
      "quantum-eraser",
      "quantum-key-distribution"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "pol-circular",
    name: "Circular polarizer (linear + quarter-wave)",
    category: "Polarization",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A circular polarizer laminates a linear polarizer with a quarter-wave retarder set at 45°, converting unpolarized or linear input into a circular state. It is the projector-side element in a circular-polarization 3D cinema demonstration and a convenient way to produce circular light without aligning two separate components. The handedness depends on the order of the layers and on which face faces the beam.",
    principle:
      "The linear layer first defines a polarization axis; the quarter-wave layer, with its fast axis at 45° to that axis, delays one component by λ/4 so the two equal components acquire a 90° phase difference. The result is circular: the electric vector rotates once per optical cycle with constant magnitude. Reversing the stack or flipping the element reverses the handedness, which is why projector and glasses must be paired deliberately.",
    specs: [
      spec("Construction", "linear polarizer + zero-order quarter-wave layer"),
      spec("Design wavelength", "usually 532 or 550 nm (typical)"),
      spec("Output", "circular, with a small linear residual"),
      spec("Extinction when analysed", "deep minimum for the matched handedness"),
      spec("Clear aperture", "20–25 mm"),
      spec("Mounting", "rotation mount, marked front face"),
      spec("Damage threshold", "polymer-limited; verify")
    ],
    alignment: [
      "Identify the front face and the linear axis marked by the manufacturer; do not guess from the housing.",
      "Place it after a linear polarizer and rotate the assembly until the output is circular: a rotating analyser then gives nearly constant transmission.",
      "Confirm handedness with a second circular analyser of known orientation; parallel handedness transmits, opposite handedness extinguishes.",
      "Keep the element normal to the beam and at the design wavelength, or the retardance error makes the output elliptical."
    ],
    errors: [
      "Flipping the element and silently reversing the handedness.",
      "Using it at a wavelength far from the quarter-wave design, leaving a large linear component.",
      "Assuming a circular polarizer can be used as a variable neutral-density filter; it cannot.",
      "Confusing the projector circular polarizer with the analyser in the glasses."
    ],
    applications: [
      "Circular-polarization 3D projection",
      "Producing circular states for ellipsometry demonstrations",
      "Reducing reflection loss from a surface",
      "Handedness and chirality demonstrations"
    ],
    experiments: ["polarization-3d-cinema", "quantum-eraser"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "waveplate-half",
    name: "Zero-order half-wave plate",
    category: "Polarization",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A half-wave plate retards one linear component by half a wavelength, rotating a linear polarization by twice the angle between the input and the fast axis. It is the standard tool for setting an arbitrary linear state without losing power, and it is used to switch bases in QKD and to rotate a marker in an eraser. A zero-order plate is preferred over a multiple-order plate because its retardance is far less sensitive to temperature and wavelength.",
    principle:
      "A birefringent crystal has different refractive indices for light along its fast and slow axes. A retardance of π means the slow component emerges inverted, so a linear input at angle θ to the fast axis emerges at −θ: the plane of polarization rotates by 2θ. A true zero-order plate is built from two thin plates with their axes crossed so the net retardance is λ/2 while the physical thickness is small; a multiple-order plate is one thick crystal whose retardance is many waves plus a half wave, making it drift with temperature and wavelength.",
    specs: [
      spec("Retardance", "λ/2 at the design wavelength"),
      spec("Type", "zero-order, two-plate construction (typical)"),
      spec("Retardance tolerance", "λ/100 to λ/500 (typical)"),
      spec("Clear aperture", "10–12.7 mm"),
      spec("AR coating", "R < 0.5% per surface over the band"),
      spec("Angular acceptance", "± 2–3° before retardance error matters"),
      spec("Mounting", "SM1 rotation mount with scale"),
      spec("Damage threshold", "> 5 J/cm² at 10 ns (typical; verify)")
    ],
    alignment: [
      "Place the plate between crossed polarizers and rotate it until extinction is restored or maximized; this locates the fast/slow axes relative to the input.",
      "Set the desired rotation: if the input is at 0° and the fast axis at θ, the output is at 2θ.",
      "Check the output with a second polarizer at the expected angle and at the orthogonal angle.",
      "Keep the plate normal to the beam; tilting changes the effective retardance."
    ],
    errors: [
      "Using a multiple-order plate near a different wavelength and assuming the retardance is still λ/2.",
      "Confusing the fast axis with the slow axis and rotating the state the wrong way.",
      "Setting the plate at 45° and expecting a rotation of 45° rather than 90°.",
      "Over-tightening the mount and inducing stress birefringence in the plate."
    ],
    applications: [
      "Rotating linear polarization without loss",
      "BB84 basis switching",
      "Polarization marking in a quantum eraser",
      "Polarimetry and ellipsometry"
    ],
    experiments: [
      "polarization-3d-cinema",
      "quantum-eraser",
      "quantum-key-distribution"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "waveplate-quarter",
    name: "Zero-order quarter-wave plate",
    category: "Polarization",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A quarter-wave plate introduces a 90° phase delay between two orthogonal linear components, converting linear at 45° into circular and circular into linear. It is the element that creates and analyses circular polarization in the 3D-cinema experiment and the phase-encoding element in a BB84 demonstration. As with the half-wave plate, a zero-order construction keeps the retardance stable against temperature and wavelength drift.",
    principle:
      "The birefringent plate gives the slow axis a quarter-wavelength of extra optical path. Equal components along the fast and slow axes therefore emerge with a 90° phase difference, so a linear input at 45° becomes circular; conversely, circular input becomes linear along an axis set by the plate orientation. A multiple-order plate reaches the same retardance modulo λ but with a large temperature coefficient, because its retardance is the small difference between two large optical paths.",
    specs: [
      spec("Retardance", "λ/4 at the design wavelength"),
      spec("Type", "zero-order, two-plate construction (typical)"),
      spec("Retardance tolerance", "λ/100 to λ/500 (typical)"),
      spec("Clear aperture", "10–12.7 mm"),
      spec("AR coating", "R < 0.5% per surface (typical)"),
      spec("Angular acceptance", "± 2–3°"),
      spec("Mounting", "SM1 rotation mount"),
      spec("Damage threshold", "> 5 J/cm² at 10 ns (typical; verify)")
    ],
    alignment: [
      "Set a linear polarizer before the plate and orient the plate's fast axis at 45° to the input, using the mount scale or an extinction test.",
      "Place a rotating analyser after the plate; circular output gives nearly constant transmission as the analyser turns.",
      "To produce a specific circular handedness, check the sign of the retardance and the direction of the 45° rotation, then verify with a known circular analyser.",
      "Use the design wavelength: a 10 nm error already leaves several percent linear residual."
    ],
    errors: [
      "Using a quarter-wave plate at the wrong wavelength and treating the output as perfectly circular.",
      "Setting the axis at 0° or 90° instead of 45°, which leaves the light linear.",
      "Reversing the handedness by flipping the plate and not noticing.",
      "Judging circularity by eye from a reflection; a mirror reverses handedness."
    ],
    applications: [
      "Creating and analysing circular polarization",
      "Phase encoding in BB84",
      "Circular-polarization 3D cinema",
      "Ellipsometry and optical rotation measurements"
    ],
    experiments: [
      "polarization-3d-cinema",
      "quantum-eraser",
      "quantum-key-distribution"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "pol-film-sheet",
    name: "Polarization film / sheet analyser",
    category: "Polarization",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A low-cost dichroic sheet is a hand-held analyser for quick polarization checks and for demonstrating Malus's law across a large area. Its extinction is modest compared with a mounted polarizer, so it is used for qualitative work and for covering a screen or window. It is also the material inside many linear 3D glasses, which makes it useful for explaining how the cinema effect works.",
    principle:
      "The sheet contains aligned dichroic molecules that absorb the electric-field component parallel to the alignment direction. Because the sheet is thin and inexpensive, the alignment is imperfect and the extinction ratio is only of order 50:1 to 200:1. Placed over a screen it converts a polarization pattern into a visible intensity pattern, which is exactly what a linear analyser does.",
    specs: [
      spec("Type", "dichroic polymer sheet, unmounted or laminated"),
      spec("Wavelength range", "visible, roughly 400–700 nm"),
      spec("Extinction ratio", "50:1 to 200:1 (typical; verify)"),
      spec("Transmission", "30–40% at the pass axis"),
      spec("Size", "A4 sheet or 50 × 50 mm swatch (typical)"),
      spec("Handling", "soft, easily scratched; keep in a sleeve"),
      spec("Damage threshold", "very low; do not place in a focused beam")
    ],
    alignment: [
      "Hold the sheet normal to the beam and rotate it slowly while watching the transmitted spot or screen.",
      "Mark the pass axis on the sheet with a permanent reference mark before cutting it.",
      "For a large-area check, place it directly against the screen or diffuser rather than in the beam.",
      "Compare maximum and minimum with a camera or meter; do not trust visual judgement alone for extinction."
    ],
    errors: [
      "Using a wrinkled or scratched sheet and interpreting scattering as depolarization.",
      "Placing the sheet in a focused beam and burning it.",
      "Assuming the sheet is as good as a mounted polarizer when quantifying extinction.",
      "Forgetting that a white screen behind the sheet depolarizes the light."
    ],
    applications: [
      "Qualitative polarization checks",
      "Malus's-law demonstration over a large area",
      "Explaining linear 3D glasses",
      "Stress-birefringence viewing"
    ],
    experiments: ["polarization-3d-cinema", "quantum-eraser"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },

  // ── Lenses and objectives ──────────────────────────────────────────────
  {
    id: "lens-convex",
    name: "Plano-convex lens, f = 100 mm",
    category: "Lenses & objectives",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A 100 mm plano-convex singlet focuses a collimated beam and is the workhorse for beam expansion, Fourier-plane access and simple imaging. It is inexpensive and available in many coatings, but it suffers spherical and chromatic aberration, so it is used where monochromatic performance and modest NA are acceptable. The plano surface should face the collimated beam to minimize spherical aberration.",
    principle:
      "Refraction at the curved surface bends the wavefront toward the axis; the lens power is given by the lensmaker's equation, 1/f = (n−1)(1/R₁ − 1/R₂). A plano-convex singlet has one curved and one flat surface, which minimizes spherical aberration when the curved side faces the more divergent beam. Chromatic aberration arises because n varies with wavelength, so different colours focus at different distances.",
    specs: [
      spec("Substrate", "N-BK7 (typical)"),
      spec("Focal length", "100 mm ± 1%"),
      spec("Diameter", "25.4 mm"),
      spec("Coating", "AR, R < 0.5% per surface over 400–700 nm"),
      spec("Surface quality", "40–20 scratch–dig (typical)"),
      spec("Numerical aperture", "≈ 0.12 for a 25 mm aperture"),
      spec("Mounting", "SM1 lens tube or retaining ring"),
      spec("Damage threshold", "> 5 J/cm² at 10 ns (typical; verify)")
    ],
    alignment: [
      "Mount the lens with its curved surface toward the collimated input and its flat surface toward the focus.",
      "Centre the lens on the beam with an iris before and after; a decentred lens steers the focus sideways.",
      "Check the focus position by imaging a distant object or by autocollimating a return reflection.",
      "Stop down the aperture if spherical aberration is visible in the focal spot."
    ],
    errors: [
      "Mounting the lens backwards and increasing spherical aberration.",
      "Using the nominal focal length at a different wavelength without correcting for dispersion.",
      "Overfilling the aperture with a beam wider than the clear aperture, which clips and creates diffraction rings.",
      "Tightening a retaining ring directly on the glass and chipping the edge."
    ],
    applications: [
      "Beam expansion and collimation",
      "Fourier-transform lens in a 4f system",
      "Simple imaging and focusing",
      "Coupling light into a fibre"
    ],
    experiments: ["michelson-interferometer", "fourier-optics"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "lens-achromat",
    name: "Achromatic doublet, f = 150 mm",
    category: "Lenses & objectives",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "An achromatic doublet combines two glasses to bring two wavelengths to a common focus, greatly reducing the colour fringing of a singlet. It is the preferred Fourier or imaging lens when a broadband source or a camera with wide spectral response is used. The remaining secondary spectrum is small but not zero, and the doublet is more expensive and heavier than a singlet.",
    principle:
      "A converging crown-glass element is cemented to a diverging flint-glass element. Because the two glasses have different dispersion, the chromatic powers partly cancel: the focal length is equalized at two design wavelengths and the residual variation between them is much smaller than for a singlet. The cemented interface also reduces ghost reflections, though the two outer surfaces still need AR coatings.",
    specs: [
      spec("Construction", "cemented crown/flint doublet"),
      spec("Focal length", "150 mm ± 1%"),
      spec("Diameter", "25.4 mm"),
      spec("Coating", "AR, R < 0.5% per surface (typical)"),
      spec("Chromatic correction", "two design wavelengths, visible band"),
      spec("Surface quality", "40–20 scratch–dig (typical)"),
      spec("Mounting", "SM1 lens tube"),
      spec("Damage threshold", "> 5 J/cm² at 10 ns (typical; verify)")
    ],
    alignment: [
      "Orientation matters: the steeper curved surface usually faces the longer conjugate. Follow the arrow or the manufacturer's marking.",
      "Centre the doublet on the beam and check that the focus does not move laterally when the aperture is stopped down.",
      "Focus a white-light object and check for residual colour fringing at the edges of the image.",
      "Keep the lens clean; cement interfaces can be damaged by solvents."
    ],
    errors: [
      "Mounting the doublet backwards, which increases aberrations and can shift the focus.",
      "Cleaning with acetone or alcohol that attacks the cement at the edge.",
      "Expecting perfect colour correction across the whole visible band; secondary spectrum remains.",
      "Using a doublet designed for a finite conjugate at infinity without refocusing."
    ],
    applications: [
      "Broadband Fourier optics",
      "Colour imaging with reduced fringing",
      "White-light interferometer imaging",
      "Precision focusing of a multi-wavelength beam"
    ],
    experiments: ["fourier-optics", "optical-tweezers"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "lens-objective-10x",
    name: "Microscope objective, 10×",
    category: "Lenses & objectives",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A 10× microscope objective provides a moderate numerical aperture and a long working distance, making it the usual first choice for imaging and for low-stiffness optical trapping. It is designed for an infinite conjugate and is used with a tube lens to form an image. Its relatively low NA gives a weak axial gradient force, so it is better for imaging than for tight three-dimensional trapping.",
    principle:
      "The objective is a multi-element lens system corrected for aberrations over a specified field and conjugate. For an infinite-conjugate objective, the specimen sits at the front focal plane and the output is collimated; a tube lens then focuses that collimated light to form an image. The numerical aperture, NA = n sin θ, sets both the resolution (≈ 0.61 λ/NA) and the strength of the axial gradient force, which scales roughly with NA².",
    specs: [
      spec("Magnification", "10× with a 200 mm tube lens"),
      spec("Numerical aperture", "0.25–0.30 (typical)"),
      spec("Working distance", "5–15 mm (typical)"),
      spec("Conjugate", "infinite, requires a tube lens"),
      spec("Field of view", "1–2 mm with a 200 mm tube lens"),
      spec("Coverslip correction", "none or 0–1.5 mm (typical)"),
      spec("Mounting", "RMS or M25 thread"),
      spec("Transmission", "> 70% over the visible band (typical)")
    ],
    alignment: [
      "Mount the objective on a stable holder with its axis parallel to the beam; use a cage or a dedicated objective mount.",
      "Fill the back aperture with the beam but do not overfill it; underfilling wastes NA and overfilling heats the barrel.",
      "Focus on a calibration target and check that the image is centred and free of coma.",
      "For trapping, measure the power at the sample plane after the objective; the transmission is not 100%."
    ],
    errors: [
      "Using an infinite-conjugate objective without a tube lens and wondering why the image never focuses.",
      "Overfilling the back aperture and clipping the beam on the barrel.",
      "Assuming the magnification is exact; it depends on the tube-lens focal length.",
      "Forgetting the objective's transmission and absorption when calculating trap power."
    ],
    applications: [
      "Imaging trapped particles",
      "Low-NA optical trapping",
      "Microscopy and sample inspection",
      "Coupling light into a sample cell"
    ],
    experiments: ["fourier-optics", "optical-tweezers"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "lens-objective-100x",
    name: "High-NA microscope objective, 100× oil",
    category: "Lenses & objectives",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A 100× oil-immersion objective reaches a numerical aperture above 1.2, producing the tight focus needed for three-dimensional optical trapping. The high NA gives a strong axial gradient force, but the working distance is only a fraction of a millimetre and the immersion oil and coverslip thickness become part of the optical design. It is a delicate, expensive component that must be used with the correct oil and cleaned immediately.",
    principle:
      "Immersion oil with a refractive index close to glass removes the air gap between the objective and the coverslip, so rays at large angles can reach the sample without total internal reflection. The resulting NA = n sin θ can exceed 1.0, and the diffraction-limited focal spot scales as λ/NA. The axial gradient force grows rapidly with NA, which is why high-NA objectives are required to overcome the scattering force and trap in three dimensions.",
    specs: [
      spec("Magnification", "100× with a 200 mm tube lens"),
      spec("Numerical aperture", "1.25–1.40 (typical)"),
      spec("Working distance", "0.10–0.20 mm"),
      spec("Immersion medium", "oil, n ≈ 1.515"),
      spec("Coverslip thickness", "0.17 mm (#1.5)"),
      spec("Conjugate", "infinite"),
      spec("Mounting", "RMS or M25 thread"),
      spec("Transmission", "> 60% at the design wavelength (typical)")
    ],
    alignment: [
      "Place a drop of the specified immersion oil on the coverslip and lower the objective slowly until the oil contacts the lens without trapping a bubble.",
      "Use a bright calibration sample and focus with the fine drive; the working distance is too short for coarse approach.",
      "Centre the trapping beam in the back aperture and check the focus with a camera before adding particles.",
      "After use, remove the oil with lens tissue and the recommended solvent; never let it dry on the front lens."
    ],
    errors: [
      "Using the objective dry, which destroys the NA and can damage the front lens.",
      "Using the wrong oil or a bubble in the oil, producing spherical aberration and a poor focus.",
      "Using a coverslip of the wrong thickness; 0.17 mm is part of the design.",
      "Cleaning with a harsh solvent that attacks the cement or coating."
    ],
    applications: [
      "Three-dimensional optical tweezers",
      "High-resolution imaging of trapped particles",
      "Single-molecule fluorescence",
      "Tight focusing for nonlinear optics"
    ],
    experiments: ["optical-tweezers"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "lens-tube",
    name: "Tube lens",
    category: "Lenses & objectives",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A tube lens focuses the collimated output of an infinite-conjugate objective to form an image, and its focal length sets the system magnification. A 200 mm tube lens gives the magnification printed on the objective; shorter or longer tubes change the field of view and the effective magnification. It is also useful on its own for Fourier-plane access and simple imaging.",
    principle:
      "An infinite-conjugate objective outputs a collimated beam whose angle encodes the position of a point in the specimen. The tube lens converts that angle to a position at its back focal plane, so the image height is proportional to the object height. The system magnification is the ratio of the tube-lens focal length to the objective focal length, which is why a 200 mm tube is the standard reference.",
    specs: [
      spec("Focal length", "200 mm (typical)"),
      spec("Diameter", "25.4–50 mm (typical)"),
      spec("Coating", "AR over the visible band"),
      spec("Conjugate", "infinity to focus"),
      spec("Mounting", "SM1 or SM2 lens tube"),
      spec("Surface quality", "40–20 scratch–dig (typical)"),
      spec("Damage threshold", "> 5 J/cm² at 10 ns (typical; verify)")
    ],
    alignment: [
      "Place the tube lens one focal length from the camera sensor or the intermediate image plane.",
      "Keep the separation between objective and tube lens within the design range; too much spacing vignettes the field.",
      "Focus by moving the tube lens or camera, not by changing the objective-to-sample distance if the trap is already set.",
      "Check magnification with a graticule and record it; the nominal value assumes a 200 mm tube."
    ],
    errors: [
      "Using a tube lens of a different focal length and still quoting the objective's nominal magnification.",
      "Placing the camera at the wrong distance from the tube lens.",
      "Letting the beam clip on the tube-lens mount, which darkens the image edges.",
      "Confusing the tube lens with the objective's own focusing optics."
    ],
    applications: [
      "Imaging with an infinite-conjugate objective",
      "Setting the magnification of a microscope",
      "Fourier-plane access",
      "Camera relay optics"
    ],
    experiments: ["fourier-optics", "optical-tweezers"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },

  // ── Prisms, gratings, apertures, filters, fibre ───────────────────────
  {
    id: "prism-right-angle",
    name: "Right-angle prism",
    category: "Prisms & gratings",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A 45–45–90 prism turns a beam through 90° by total internal reflection at the hypotenuse, acting as a compact periscope or folding element. Total internal reflection is lossless apart from surface scatter, but it introduces a polarization-dependent phase shift between the s and p components. The prism can also be used as a retroreflector when the beam enters normal to the hypotenuse.",
    principle:
      "Light entering normal to one leg passes into the glass and strikes the hypotenuse at 45°. For glass with n ≈ 1.52 the critical angle is about 41.2°, so the beam is totally internally reflected and exits normal to the other leg. The evanescent field penetrates a fraction of a wavelength into the surrounding medium, so dust, cement or a finger on the hypotenuse can frustrate the reflection. The s and p components acquire different phase shifts on reflection, which can change an elliptical state.",
    specs: [
      spec("Substrate", "N-BK7 (typical, n ≈ 1.517 at 633 nm)"),
      spec("Geometry", "45–45–90, legs 20–30 mm"),
      spec("Critical angle", "≈ 41.2° for N-BK7–air"),
      spec("Coating", "AR on entrance/exit faces; hypotenuse uncoated (typical)"),
      spec("Surface flatness", "λ/4 on optical faces (typical)"),
      spec("Mounting", "prism table or kinematic plate"),
      spec("Polarization effect", "s/p phase difference on TIR; verify if state matters")
    ],
    alignment: [
      "Set the entrance face normal to the beam by autocollimating the weak front-surface reflection.",
      "Rotate the prism until the exit beam is at 90° to the input, then lock the mount.",
      "Check that the beam hits the middle of the hypotenuse and does not clip the edges.",
      "If polarization matters, measure the output state rather than assuming TIR preserves it."
    ],
    errors: [
      "Touching or contaminating the hypotenuse, which frustrates total internal reflection and scatters light.",
      "Using the prism at an incidence angle below the critical angle and losing the beam through the hypotenuse.",
      "Assuming the output polarization is unchanged; TIR introduces a phase shift.",
      "Mounting the prism by its optical faces and scratching them."
    ],
    applications: [
      "Compact 90° beam steering",
      "Periscope for changing beam height",
      "Retroreflection with a corner-cube arrangement",
      "Demonstration of total internal reflection"
    ],
    experiments: ["michelson-interferometer", "polarization-3d-cinema"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "grating-ruled",
    name: "Ruled diffraction grating",
    category: "Prisms & gratings",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A ruled grating disperses light into diffraction orders, turning a beam into a spectrum and serving as the dispersive element in a spectrometer. In a Fourier-optics demonstration it can also produce a spatial spectrum that a lens images at its focal plane. Groove density, blaze angle and polarization determine which orders are efficient.",
    principle:
      "Periodic grooves impose a periodic phase modulation on the wavefront. Constructive interference between adjacent grooves occurs when d(sin θ_m − sin θ_i) = mλ, where d is the groove spacing and m the order. Different wavelengths therefore leave at different angles, and a lens converts the angular spectrum into a spatial one. A blazed grating concentrates energy into a chosen order by shaping each groove like a tiny facet.",
    specs: [
      spec("Groove density", "600–1200 lines/mm (typical)"),
      spec("Substrate", "fused silica or replicated epoxy on glass"),
      spec("Blaze wavelength", "500–750 nm depending on the master (typical)"),
      spec("Size", "25 × 25 mm (typical)"),
      spec("Diffraction efficiency", "40–80% into the blazed order (typical)"),
      spec("Polarization dependence", "efficiency differs for s and p"),
      spec("Mounting", "kinematic mount; grooves facing the beam"),
      spec("Handling", "never touch the groove surface")
    ],
    alignment: [
      "Mount the grating with the grooved side facing the incoming beam and set it normal to the beam for the zero-order check.",
      "Identify the zero order (straight through) and then rotate to put the first order on the detector or screen.",
      "For a spectrometer, set the angle so the desired wavelength lands on the exit slit or sensor centre.",
      "Check the order and wavelength with a known source before trusting a dispersion calibration."
    ],
    errors: [
      "Confusing the zero order with the first order and misassigning wavelengths.",
      "Touching the grooves and permanently removing the ruling.",
      "Using the grating in an order where the efficiency is very low.",
      "Ignoring polarization: a grating can act as a partial polarizer."
    ],
    applications: [
      "Spectroscopy and wavelength separation",
      "Spatial-spectrum demonstration",
      "Pulse stretching and compression",
      "Wavelength calibration"
    ],
    experiments: ["fourier-optics"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "aperture-iris",
    name: "Iris diaphragm",
    category: "Filters & apertures",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "An iris diaphragm is a continuously variable circular aperture that sets the beam diameter and blocks stray light. It is the basic alignment aid: two irises define an optical axis, and a third checks that the beam has not walked. Closing the iris also stops down a lens, trading light for reduced aberration and increased depth of field.",
    principle:
      "A set of overlapping thin leaves forms an approximately circular opening whose diameter is changed by a lever or a rotating ring. The aperture limits the range of ray angles that pass, so it acts as a spatial filter and as a stop. Diffraction at the edge produces rings when the aperture becomes comparable to the beam size, which is both a limit and a useful demonstration.",
    specs: [
      spec("Aperture range", "1–25 mm (typical)"),
      spec("Leaf material", "blackened spring steel or brass"),
      spec("Mounting", "SM1 thread or 1/2-inch post"),
      spec("Clear aperture", "approximately circular, leaf-shaped at small settings"),
      spec("Edge quality", "not a precision knife edge"),
      spec("Damage threshold", "low; do not place at a focus")
    ],
    alignment: [
      "Mount the iris on a post at the standard beam height and centre the open aperture on the beam.",
      "Close the iris until it just touches the beam, then open it slightly; this finds the beam centre without clipping.",
      "Repeat with a second iris at least 30 cm away to define the axis.",
      "When using the iris as a stop, open it only until the desired beam or image is just unclipped."
    ],
    errors: [
      "Using the iris at a focus where the intensity can burn the leaves.",
      "Closing the iris too far and introducing diffraction rings that look like interference.",
      "Assuming the aperture is a precise diameter; the leaf shape is only approximately circular.",
      "Leaving an iris partially closed during a power measurement and reporting a low value."
    ],
    applications: [
      "Defining and checking the optical axis",
      "Setting beam diameter and numerical aperture",
      "Blocking stray light",
      "Depth-of-field and diffraction demonstrations"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "fourier-optics"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "aperture-slit",
    name: "Adjustable slit",
    category: "Filters & apertures",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "An adjustable slit sets a narrow rectangular aperture for diffraction experiments and for spatial filtering in a 4f processor. Its width controls the diffraction pattern: a narrow slit broadens the pattern, while a wide slit approaches a shadow. Two orthogonal blades allow the width to be changed without moving the centre.",
    principle:
      "A slit imposes a rectangular amplitude transmission on the wavefront. In the Fraunhofer regime the far-field amplitude is the Fourier transform of the slit, giving a sinc² intensity pattern whose first minimum is at sin θ = λ/b for slit width b. A lens in the Fourier plane makes this pattern accessible directly, which is why a slit at the object plane is a standard spatial-frequency demonstration.",
    specs: [
      spec("Width range", "0–10 mm (typical)"),
      spec("Blade material", "blackened stainless steel"),
      spec("Mounting", "SM1 thread or post"),
      spec("Edge quality", "straight, but not a knife edge"),
      spec("Height", "10–20 mm (typical)"),
      spec("Damage threshold", "low; avoid focused beams")
    ],
    alignment: [
      "Mount the slit with its long axis vertical and centre it on the beam using the through-light.",
      "Close the slit until the transmitted power drops, then open to the desired width and read the scale.",
      "Place a lens after the slit and observe the sinc² pattern at its focal plane.",
      "Check that the slit is not clipping the beam vertically; the blades have finite height."
    ],
    errors: [
      "Reading the scale as an absolute width without calibrating against a known translation.",
      "Using a slit that is not centred and thereby steering the beam.",
      "Placing the slit at a focus and damaging the blades.",
      "Forgetting that the slit also acts as a spatial filter and removes high spatial frequencies."
    ],
    applications: [
      "Single-slit diffraction",
      "Spatial filtering in a 4f system",
      "Spectrometer entrance slit",
      "Beam shaping"
    ],
    experiments: ["fourier-optics"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "filter-bandpass",
    name: "Band-pass interference filter",
    category: "Filters & apertures",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A band-pass interference filter transmits a narrow wavelength band and blocks the rest, isolating a laser line or a fluorescence band. It is essential when a detector would otherwise respond to room light, pump leakage or plasma glow. The passband shifts to shorter wavelengths as the angle of incidence increases, so it must be used near normal incidence.",
    principle:
      "The filter is a Fabry–Perot-like stack of dielectric layers: a spacer between two reflective mirrors produces constructive transmission only at wavelengths that satisfy the round-trip phase condition. Multiple cavities sharpen the passband and improve out-of-band blocking. Because the phase condition depends on the angle of incidence, tilting the filter tunes the band blue-ward and eventually splits the passband for different polarizations.",
    specs: [
      spec("Centre wavelength", "matched to the laser line, e.g. 632.8 or 532 nm"),
      spec("Full width at half maximum", "3–10 nm (typical)"),
      spec("Peak transmission", "40–70% (typical)"),
      spec("Blocking", "OD 3–4 outside the band (typical)"),
      spec("Diameter", "25 mm mounted (typical)"),
      spec("Angle sensitivity", "blue shift with tilt; use normal incidence"),
      spec("Damage threshold", "verify for pulsed or focused use")
    ],
    alignment: [
      "Mount the filter normal to the beam in a rotation mount with a positive stop at 0°.",
      "Measure the transmitted power at the laser line and compare with the specified peak transmission.",
      "Check blocking by looking through the filter at a white card; a good filter shows no bright room light.",
      "If the signal is weak, verify that the filter is not tilted and that the beam is not hitting the mounting ring."
    ],
    errors: [
      "Tilting the filter to 'tune' it and shifting the band off the laser line.",
      "Using a filter designed for one wavelength with a different laser.",
      "Ignoring the filter's fluorescence under UV or blue excitation.",
      "Measuring transmission at an angle and comparing it with the normal-incidence specification."
    ],
    applications: [
      "Laser-line cleanup",
      "Fluorescence emission isolation",
      "Raman and scattering measurements",
      "Daylight rejection for photon counting"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-key-distribution",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "filter-nd",
    name: "Neutral-density filter set",
    category: "Filters & apertures",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A set of neutral-density filters attenuates a beam by a known factor across a broad wavelength range, protecting detectors and setting the photon rate in quantum demonstrations. Absorptive glass filters are spectrally flat but can heat and fluoresce; reflective metal-film filters handle more power but have a colour cast. The optical density is logarithmic, so OD 1 means 10% transmission and OD 3 means 0.1%.",
    principle:
      "Absorptive ND glass contains dopants that absorb a controlled fraction of the light throughout the visible; reflective ND filters use a thin metal film whose transmission is set by its thickness. In both cases the transmitted power follows P = P₀·10^(−OD), and stacking filters adds optical densities. Attenuation is a random sampling process for a coherent state, so it lowers the mean photon number without changing the Poissonian statistics.",
    specs: [
      spec("Optical density", "0.3–4.0 in a mounted set (typical)"),
      spec("Wavelength range", "400–700 nm for absorptive glass"),
      spec("Transmission accuracy", "± 10% of nominal OD (typical)"),
      spec("Diameter", "25 mm mounted (typical)"),
      spec("Stacking", "OD values add; verify each filter"),
      spec("Thermal limit", "absorptive glass heats; keep power low"),
      spec("Fluorescence", "possible in absorptive glass under blue/UV")
    ],
    alignment: [
      "Start with the highest OD that still gives a measurable signal, then reduce it in steps.",
      "Mount filters normal to the beam in a wheel so the beam axis does not move when changing density.",
      "Measure the actual transmitted power; do not trust the printed OD for a quantitative result.",
      "Keep the total power on absorptive glass well below its thermal limit."
    ],
    errors: [
      "Adding optical densities arithmetically when the filters are not at the same wavelength.",
      "Placing a plastic or absorptive filter at a focus and burning it.",
      "Ignoring fluorescence from the filter itself in a low-light measurement.",
      "Assuming an ND filter turns a laser into a single-photon source."
    ],
    applications: [
      "Detector protection and dynamic range matching",
      "Setting mean photon number in QKD demonstrations",
      "Power balancing in interferometer arms",
      "Camera exposure control"
    ],
    experiments: [
      "michelson-interferometer",
      "polarization-3d-cinema",
      "quantum-key-distribution",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "screen-white",
    name: "White viewing screen / alignment target",
    category: "Filters & apertures",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A matte white screen or card makes an invisible or weak beam visible by scattering it diffusely, and it is the simplest way to view fringes, diffraction patterns and beam profiles. It is a diagnostic, not a precision detector: the scattered light is unpolarized and the screen has no calibrated response. For polarization work, a white screen destroys the very state being measured.",
    principle:
      "Rough surface structures scatter incident light into a broad range of angles, so a viewer sees a bright patch whose shape follows the beam cross-section. Multiple scattering inside the coating randomizes the polarization, so the screen acts as a depolarizer. The brightness is proportional to the local irradiance, but the relation is not calibrated and depends on viewing angle and ambient light.",
    specs: [
      spec("Material", "matte white paper, ceramic or coated card"),
      spec("Reflectance", "diffuse, 70–90% (typical)"),
      spec("Polarization", "depolarizing"),
      spec("Size", "A5 to A3 card (typical)"),
      spec("Mounting", "post, magnetic base or hand-held"),
      spec("Damage threshold", "burns in a focused beam")
    ],
    alignment: [
      "Place the screen normal to the beam at a convenient viewing distance.",
      "Dim the room lights so the scattered pattern is visible without saturating the eye or camera.",
      "Use the screen to find a beam before inserting a detector; then replace it with the detector at the same plane.",
      "For fringe counting, image the screen with a camera rather than judging by eye."
    ],
    errors: [
      "Using a white screen to measure polarization; it depolarizes the scattered light.",
      "Leaving the screen in the beam during a power measurement.",
      "Burning the card at a focus.",
      "Judging beam quality from a saturated white spot; the eye compresses brightness."
    ],
    applications: [
      "Finding an invisible beam",
      "Viewing interference and diffraction patterns",
      "Rough beam-profile checks",
      "Alignment target for a folded path"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "polarization-3d-cinema",
      "fourier-optics"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "bbo-crystal",
    name: "Beta-barium borate (BBO) nonlinear crystal",
    category: "Nonlinear optics",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A BBO crystal is the usual medium for spontaneous parametric down-conversion in a teaching single-photon experiment, converting a blue pump photon into a signal–idler pair. No BBO crystal or SPDC source is assumed to be present in this laboratory; this entry exists to describe what a genuine implementation would need and what must be verified. It is meaningless without a pump laser, phase-matching control, single-photon detectors and coincidence electronics.",
    principle:
      "BBO has a large second-order nonlinear susceptibility χ⁽²⁾ and is birefringent, so phase matching can be achieved by choosing the crystal angle and temperature. In type-I SPDC a pump photon polarized as the extraordinary wave splits into two ordinary-wave photons whose energies and momenta sum to the pump values. Energy conservation fixes the signal and idler wavelengths, and momentum conservation (phase matching) fixes the emission cone. The process is weak, so count rates are low and coincidence detection is essential.",
    specs: [
      spec("Transparency range", "approximately 190–3500 nm"),
      spec("Nonlinearity", "large χ⁽²⁾; among the highest for visible/UV"),
      spec("Typical thickness", "1–5 mm"),
      spec("Aperture", "5 × 5 mm to 10 × 10 mm"),
      spec("Phase matching", "angle-tuned; temperature stabilisation recommended"),
      spec("Pump example", "405 nm → signal/idler near 810 nm (degenerate)"),
      spec("Coating", "AR at pump and down-converted bands (typical)"),
      spec("Hygroscopic", "slightly; store dry")
    ],
    alignment: [
      "Confirm the phase-matching angle for the actual pump wavelength and crystal cut before mounting.",
      "Set the pump polarization to the extraordinary axis and align the crystal on a rotation stage with fine angular control.",
      "Image or fibre-couple the down-converted cone and locate the degenerate ring with a sensitive camera or detector.",
      "Measure coincidences between conjugate points and record the singles, accidentals and background separately."
    ],
    errors: [
      "Assuming a crystal alone produces single photons without detectors and coincidence electronics.",
      "Using the wrong phase-matching angle or pump polarization and seeing no down-conversion.",
      "Ignoring pump scatter, which dominates the singles rate and masquerades as signal.",
      "Exposing the crystal to moisture or handling the optical faces."
    ],
    applications: [
      "Spontaneous parametric down-conversion",
      "Heralded single-photon sources",
      "Entangled photon-pair sources",
      "Quantum imaging and Bell tests"
    ],
    experiments: ["quantum-key-distribution", "quantum-eraser"],
    verification: "unverified",
    generic: true
  },
  {
    id: "fiber-single-mode",
    name: "Single-mode optical fibre",
    category: "Fibre",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A single-mode fibre carries one spatial mode, so it delivers a clean Gaussian-like output and provides a stable, flexible path between apparatus. It is used to transport attenuated light to a detector and to define a well-known spatial mode for a QKD demonstration. Standard single-mode fibre does not preserve polarization; a polarization-maintaining fibre is a different component.",
    principle:
      "In a step-index fibre the core–cladding index difference confines light by total internal reflection. Single-mode operation requires the normalized frequency V = 2πa·NA/λ to stay below 2.405, so only the fundamental LP₀₁ mode propagates. The mode field diameter is slightly larger than the core, and bending or stress can couple power into cladding modes or change the output polarization.",
    specs: [
      spec("Core diameter", "4–9 µm (typical, wavelength dependent)"),
      spec("Numerical aperture", "0.10–0.14"),
      spec("Cutoff wavelength", "below the operating wavelength, e.g. 450–600 nm"),
      spec("Mode field diameter", "4–5 µm at 633 nm (typical)"),
      spec("Connectors", "FC/PC or FC/APC"),
      spec("Polarization", "not maintained in standard SM fibre"),
      spec("Bend radius", "> 20–30 mm to avoid loss"),
      spec("Attenuation", "a few dB/km at visible wavelengths (typical)")
    ],
    alignment: [
      "Clean both connector ends and inspect them with a fibre scope before mating.",
      "Launch light with a matched objective or a fibre coupler and maximize throughput while adjusting the launch position and angle.",
      "Check the output mode with a camera or beam profiler; a clean Gaussian indicates good coupling.",
      "Coil the fibre loosely and secure it so it cannot be kicked or bent sharply during the experiment."
    ],
    errors: [
      "Dirty connectors, which cause loss, back-reflection and permanent damage.",
      "Bending the fibre below its minimum radius and losing the mode.",
      "Assuming the output polarization is stable; standard SM fibre drifts with temperature and stress.",
      "Using a multimode fibre and then treating the output as a single spatial mode."
    ],
    applications: [
      "Flexible beam delivery",
      "Spatial-mode filtering",
      "Fibre-coupled QKD links",
      "Remote detection"
    ],
    experiments: ["quantum-key-distribution"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "fiber-collimator",
    name: "Fibre collimator",
    category: "Fibre",
    kind: "optical",
    manufacturer: "Thorlabs",
    summary:
      "A fibre collimator holds a lens at the correct distance from a fibre end to convert the diverging fibre mode into a collimated free-space beam. It is the interface between fibre delivery and an optical bench, and its focal length sets the output beam diameter and the tolerance on alignment. A five-axis mount is normally required to optimize coupling in the reverse direction.",
    principle:
      "The fibre end acts as a point source with a divergence set by its numerical aperture. A lens placed one focal length away collimates that diverging cone; the output waist is approximately the fibre mode field diameter magnified by the ratio of the lens focal length to the fibre's Rayleigh range. Aspheric or graded-index lenses are used to keep the package small and the aberration low.",
    specs: [
      spec("Focal length", "10–20 mm (typical)"),
      spec("Output beam diameter", "1–3 mm (typical)"),
      spec("Wavelength range", "AR-coated for the design band"),
      spec("Connector", "FC/PC or FC/APC"),
      spec("Adjustment", "focus plus two transverse axes"),
      spec("Return loss", "> 40 dB with APC (typical)"),
      spec("Mounting", "SM1 thread or 30 mm cage")
    ],
    alignment: [
      "Mate a clean connector and set the collimator roughly one focal length from the fibre end (usually fixed by the design).",
      "Aim the output at a distant target and adjust the transverse screws until the beam is centred on the target.",
      "Check collimation by measuring the beam diameter at two distances; refocus if it grows too quickly.",
      "When coupling into the fibre, optimize the input beam angle and position for maximum throughput."
    ],
    errors: [
      "Using the collimator outside its design wavelength, which shifts the focus and adds aberration.",
      "Forcing an APC connector into a PC receptacle and damaging both.",
      "Judging collimation from a single spot rather than two distances.",
      "Ignoring the back-reflection from a flat PC connector in a sensitive interferometer."
    ],
    applications: [
      "Fibre-to-free-space launch",
      "Fibre-coupled detection",
      "QKD receiver input",
      "Compact beam delivery"
    ],
    experiments: ["quantum-key-distribution"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },

  // ── Detection ──────────────────────────────────────────────────────────
  {
    id: "det-photodiode",
    name: "Silicon photodiode (with transimpedance amplifier)",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "A silicon photodiode converts incident photons into a photocurrent, and a transimpedance amplifier turns that current into a voltage for a scope or digitiser. It measures average optical power or a modulated waveform, not individual photons: at room temperature the dark current and amplifier noise are far larger than a single photoelectron. It is the standard detector for fringe signals, transmission measurements and trap-position sensing.",
    principle:
      "Photons absorbed in the depletion region of a reverse-biased p–n or p–i–n junction create electron–hole pairs. The built-in and applied fields sweep the carriers apart, producing a photocurrent proportional to absorbed power, I = R·P, where R is the responsivity in A/W. A transimpedance amplifier with feedback resistor R_f converts this to V = I·R_f; the feedback capacitance and the diode capacitance set the bandwidth, while R_f sets the gain and the input-referred noise.",
    specs: [
      spec("Material", "silicon p–i–n (typical)"),
      spec("Spectral range", "320–1100 nm; peak response 800–950 nm"),
      spec("Responsivity", "0.35–0.5 A/W at 633 nm (typical; verify)"),
      spec("Active area", "1–10 mm² (typical)"),
      spec("Dark current", "0.1–10 nA at moderate reverse bias (typical)"),
      spec("Bandwidth", "DC to 1–100 MHz depending on gain"),
      spec("Transimpedance gain", "10³–10⁷ V/A (typical)"),
      spec("Noise equivalent power", "pW/√Hz range (typical)")
    ],
    alignment: [
      "Centre the active area on the beam; a partially illuminated large-area diode gives a misleading power reading.",
      "Attenuate so the output stays within the amplifier's linear range; check the waveform for clipping.",
      "Set the reverse bias and gain according to the required bandwidth, and allow a few minutes for thermal drift.",
      "Shield the input and keep cables short; a high-impedance transimpedance input picks up interference."
    ],
    errors: [
      "Saturating the amplifier and reading a clipped or compressed signal.",
      "Using a photodiode to count photons; it cannot resolve single-photon events at room temperature.",
      "Forgetting that responsivity depends strongly on wavelength.",
      "Ignoring the trade-off between transimpedance gain and bandwidth."
    ],
    applications: [
      "Fringe signal detection",
      "Transmission and absorption measurements",
      "Quadrant-detector position sensing",
      "Heterodyne and beat-note detection"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "polarization-3d-cinema",
      "fourier-optics"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "det-power-meter",
    name: "Optical power meter",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "An optical power meter reports the time-averaged optical power falling on a calibrated sensor, usually a photodiode for microwatts to milliwatts or a thermopile for higher powers. It is the reference for every quantitative statement about beam power, attenuation and detector saturation. A power meter measures average energy flux; it says nothing about photon statistics or individual detection events.",
    principle:
      "A photodiode head converts absorbed power to current and the meter applies a wavelength-dependent calibration factor to display watts. A thermopile head absorbs the beam and measures the temperature rise of a blackened surface, giving a wavelength-flat response at the cost of speed and sensitivity. The meter's calibration is traceable to a standard detector, but only at the wavelengths and power levels on its certificate.",
    specs: [
      spec("Sensor types", "photodiode (µW–mW) or thermopile (mW–W)"),
      spec("Wavelength range", "200–1100 nm for Si; broader for thermopile"),
      spec("Power range", "1 nW–10 W depending on head"),
      spec("Resolution", "0.1% of full scale (typical display)"),
      spec("Accuracy", "± 3–5% with calibration (typical)"),
      spec("Response time", "< 1 s for photodiode; seconds for thermopile"),
      spec("Aperture", "5–10 mm (typical)"),
      spec("Calibration", "wavelength-dependent correction stored in the head")
    ],
    alignment: [
      "Zero the meter with the beam blocked, then select the wavelength closest to the source.",
      "Place the sensor so the beam fills the aperture without spilling over the edge.",
      "Start on the highest range and step down to avoid saturating or damaging the head.",
      "Record the reading, range, wavelength setting and head serial number together."
    ],
    errors: [
      "Overfilling the aperture and under-reading the power.",
      "Using the wrong wavelength setting, which applies the wrong calibration factor.",
      "Assuming a photodiode head is linear up to its damage threshold.",
      "Using a power meter to infer photon counts without accounting for the detector's spectral response."
    ],
    applications: [
      "Beam power and attenuation measurement",
      "Checking detector saturation",
      "Verifying beam-splitter ratios",
      "Laser safety surveys"
    ],
    experiments: ALL_EXPERIMENTS,
    verification: "unverified",
    generic: true
  },
  {
    id: "det-camera",
    name: "USB machine-vision camera",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "A USB machine-vision camera images beam profiles, fringes, diffraction patterns and trapped particles over a two-dimensional field. Its sensor is a CMOS array with a Bayer colour filter or a monochrome response, and its exposure and gain must be set deliberately to avoid clipping. It is an imaging detector, not a calibrated power meter, unless it has been flat-fielded and calibrated.",
    principle:
      "Each pixel is a photodiode with a reset-and-integrate circuit: photons generate charge, and the accumulated charge is converted to a digital value by an analogue-to-digital converter. Exposure time sets the integration window and gain multiplies the signal before digitization. A colour sensor overlays red, green and blue filters on a repeating pattern and interpolates the missing colours, which corrupts quantitative colour measurements unless the raw data are used.",
    specs: [
      spec("Sensor", "CMOS, 1/2.5″ to 1″ (typical)"),
      spec("Resolution", "1–12 megapixels"),
      spec("Pixel size", "2–6 µm (typical)"),
      spec("Frame rate", "10–60 fps at full resolution"),
      spec("Exposure", "microseconds to seconds"),
      spec("Bit depth", "8–12 bits"),
      spec("Interface", "USB 3.0 or GigE"),
      spec("Shutter", "rolling or global, depending on model")
    ],
    alignment: [
      "Mount the camera on a stable post or cage and set the sensor plane at the intended image or Fourier plane.",
      "Start with a short exposure and low gain, then increase exposure until the brightest region is below saturation.",
      "Check for clipping by looking at the raw pixel values; a white-looking image can still be saturated.",
      "Record exposure, gain and any binning with every image."
    ],
    errors: [
      "Saturating the sensor and then measuring a beam width from the flat-topped image.",
      "Using automatic gain and exposure, which change between frames and destroy quantitative comparison.",
      "Ignoring gamma or colour processing applied by the driver.",
      "Assuming a rolling-shutter camera can freeze a fast moving fringe pattern."
    ],
    applications: [
      "Beam profiling and mode imaging",
      "Fringe and diffraction pattern capture",
      "Particle tracking in a trap",
      "Alignment and documentation"
    ],
    experiments: [
      "michelson-interferometer",
      "fourier-optics",
      "optical-tweezers"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "det-spad",
    name: "Single-photon avalanche diode (SPAD)",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "A SPAD is a photodiode biased above breakdown so that a single absorbed photon can trigger a self-sustaining avalanche and a logic pulse. It is the detector that makes photon counting possible, and it is fundamentally different from a linear photodiode: it is binary, has a dead time, and saturates at high count rates. No SPAD is assumed to be present until its model, bias circuit, dark-count rate and timing jitter have been verified.",
    principle:
      "The diode is biased above its breakdown voltage in Geiger mode. A single photo-generated carrier entering the high-field depletion region can initiate an impact-ionization avalanche, producing a macroscopic current pulse. A quenching circuit (passive resistor or active feedback) lowers the bias below breakdown to stop the avalanche, then restores it after a dead time. The photon detection efficiency, dark-count rate, afterpulsing probability and timing jitter are the parameters that matter.",
    specs: [
      spec("Operating mode", "Geiger mode, bias above breakdown"),
      spec("Wavelength range", "400–1000 nm for silicon (typical)"),
      spec("Photon detection efficiency", "30–70% at 650 nm (typical; verify)"),
      spec("Dark count rate", "10–1000 Hz for a small area (typical)"),
      spec("Dead time", "20–100 ns (typical)"),
      spec("Timing jitter", "100–500 ps FWHM (typical)"),
      spec("Active area", "10–100 µm diameter (typical)"),
      spec("Output", "TTL/NIM pulse per detected photon")
    ],
    alignment: [
      "Verify the bias supply and quenching circuit before connecting the diode; an uncontrolled bias can destroy it.",
      "Focus the beam so the spot is smaller than the active area, then attenuate to a count rate well below saturation.",
      "Measure the dark-count rate with the beam blocked and record it at the operating temperature.",
      "Set the discriminator threshold on the detector output and confirm the count rate is stable."
    ],
    errors: [
      "Exposing the SPAD to room light and saturating or damaging it.",
      "Operating above the maximum count rate and applying a simple dead-time correction outside its valid range.",
      "Ignoring afterpulsing, which creates correlated counts that mimic photon bunching.",
      "Assuming the detection efficiency is uniform across the active area and wavelength."
    ],
    applications: [
      "Photon counting and antibunching measurements",
      "BB84 and other QKD protocols",
      "Heralded single-photon detection",
      "Time-correlated single-photon counting"
    ],
    experiments: ["quantum-key-distribution", "quantum-eraser"],
    verification: "unverified",
    generic: true
  },
  {
    id: "det-photon-counter",
    name: "Photon counter / time tagger",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "A photon counter or time tagger records the arrival times of detector pulses, producing count rates, histograms and coincidence statistics that a power meter cannot provide. It is the electronics half of a photon-counting chain: the SPAD produces the pulse, and the counter decides when it arrived and whether two detectors fired together. Without this device a 'single-photon' experiment is only a dim-light experiment.",
    principle:
      "A discriminator converts each detector pulse into a digital edge with a fixed threshold and timestamp. A time-to-digital converter measures the interval between edges with picosecond to nanosecond resolution, and firmware bins the intervals into histograms or streams time tags to a computer. Coincidence logic counts pairs within a window set by detector jitter and cable delays; accidental coincidences scale with the product of the singles rates and the window width.",
    specs: [
      spec("Channels", "2–8 (typical)"),
      spec("Timing resolution", "10–1000 ps depending on mode"),
      spec("Maximum count rate", "1–100 MHz per channel"),
      spec("Input", "TTL/NIM from SPAD or PMT"),
      spec("Coincidence window", "set by firmware or cable delay"),
      spec("Histogram bins", "up to thousands of bins"),
      spec("Interface", "USB or Ethernet"),
      spec("Dead time", "channel and mode dependent; verify")
    ],
    alignment: [
      "Match the detector output level to the counter input and terminate the cable correctly.",
      "Measure the cable delay between channels with a common source before interpreting coincidence times.",
      "Set the discriminator threshold just above the detector noise floor.",
      "Record singles, accidentals and coincidences separately so the g⁽²⁾ calculation is auditable."
    ],
    errors: [
      "Reporting coincidence counts without subtracting accidentals.",
      "Ignoring counter dead time at high count rates.",
      "Using a coincidence window much larger than the detector jitter, which admits noise.",
      "Forgetting that cable length differences shift the apparent arrival time."
    ],
    applications: [
      "Hanbury Brown–Twiss and g⁽²⁾ measurements",
      "QKD sifting and error-rate estimation",
      "Time-correlated single-photon counting",
      "Coincidence imaging"
    ],
    experiments: ["quantum-key-distribution", "quantum-eraser"],
    verification: "unverified",
    generic: true
  },

  // ── Optomechanics ──────────────────────────────────────────────────────
  {
    id: "post",
    name: "Optical post, 12.7 mm",
    category: "Mounts",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A 12.7 mm optical post is the vertical column that sets an optic's height above the table. Posts come in many lengths and are clamped at the bottom by a post holder or base, while the optic mount attaches to the top. A short, thick post is much stiffer than a long thin one, so height should be built from the holder and the stage rather than from an excessively long post.",
    principle:
      "The post is a cantilever beam: its static stiffness falls with the cube of its free length, and its lowest mechanical resonance falls with the square. A 12.7 mm stainless or aluminium column is stiff enough for a small mount at moderate height, but a long post will ring at tens of hertz and couple table vibration into the beam. The end threads (1/4″-20 or M6) transmit the clamping force into the mount.",
    specs: [
      spec("Diameter", "12.7 mm (1/2 inch)"),
      spec("Material", "stainless steel or aluminium (typical)"),
      spec("Lengths", "25–300 mm in 12.5 mm steps (typical)"),
      spec("End thread", "1/4″-20 or M6, depending on region"),
      spec("Finish", "black anodized or bead-blasted"),
      spec("Load", "a few hundred grams per post (typical)"),
      spec("Mounting", "post holder or clamping fork")
    ],
    alignment: [
      "Choose the shortest post that reaches the required height, and take up the rest with the holder or a riser.",
      "Thread the mount finger-tight; do not use pliers on the post or the mount.",
      "Check verticality with a bubble level or by comparing the beam height at two distances.",
      "Route cables so they do not load the post sideways."
    ],
    errors: [
      "Using a very long post for a heavy mount, producing visible sway and fringe drift.",
      "Cross-threading the end thread by starting it at an angle.",
      "Over-tightening and cracking the mount's threaded insert.",
      "Ignoring the post's mechanical resonance when measuring a small signal."
    ],
    applications: [
      "Supporting mounts at the standard beam height",
      "Building a rigid optical axis",
      "Temporary alignment fixtures",
      "Cable and fibre strain relief"
    ],
    experiments: ALL_EXPERIMENTS,
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "post-holder",
    name: "Post holder",
    category: "Mounts",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A post holder clamps a 12.7 mm post and sets its height, usually with a slit and a thumbscrew or a lever. It is the adjustable interface between the table and the optic, and its clamp is often the weakest point in a supposedly rigid mount. A good holder grips over a long length and does not twist the post when tightened.",
    principle:
      "The holder is a tube with an axial slit; tightening the screw closes the slit and produces a uniform radial clamp over the contact length. The height is set by sliding the post before tightening, or by a separate height-adjustment mechanism. Friction between the post and the bore carries the load, so a short or polished bore with a single set screw is much less stable than a long split clamp.",
    specs: [
      spec("Post diameter", "12.7 mm"),
      spec("Height range", "25–150 mm (typical)"),
      spec("Clamp", "split bore with thumbscrew or lever"),
      spec("Material", "anodized aluminium (typical)"),
      spec("Base thread", "1/4″-20 or M6"),
      spec("Load", "a few hundred grams (typical)")
    ],
    alignment: [
      "Insert the post fully into the holder before tightening, leaving enough travel for fine height adjustment.",
      "Tighten the clamp firmly by hand; the post should not rotate when the mount is gently pushed.",
      "Set the height with the beam and a target, then lock any secondary height adjustment.",
      "Check that the holder's base is seated flat on the table or breadboard."
    ],
    errors: [
      "Clamping only the very end of the post, which gives a weak grip and wobble.",
      "Using a set screw that dents the post and prevents smooth height changes.",
      "Leaving the height lock loose so the optic sinks during a measurement.",
      "Overtightening a plastic or thin-walled holder until it cracks."
    ],
    applications: [
      "Setting and locking optic height",
      "Supporting posts on a breadboard",
      "Quick height adjustment during alignment",
      "Mounting small translation stages"
    ],
    experiments: ALL_EXPERIMENTS,
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "post-base",
    name: "Clamping fork / post base",
    category: "Mounts",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A clamping fork or weighted base anchors a post holder to the optical table without drilling or tapping. The fork straddles the holder's base flange and a single bolt pulls it down, while a weighted base relies on mass and friction. Neither is as rigid as a bolted stage, so heavy or high-magnification mounts should be bolted directly.",
    principle:
      "The fork converts a vertical bolt force into a clamping force on the flange, pressing the flange against the table. Friction between the flange and the table resists lateral motion; the bolt's preload and the contact area determine how much. A weighted base instead lowers the centre of mass and increases the normal force, but it can still slide under a sideways cable pull.",
    specs: [
      spec("Compatibility", "12.7 mm post holders with a base flange"),
      spec("Material", "black anodized aluminium or cast iron"),
      spec("Bolt", "1/4″-20 or M6 captive screw"),
      spec("Footprint", "25–50 mm (typical)"),
      spec("Weighted base mass", "0.2–1 kg (typical)"),
      spec("Table interface", "flat surface or tapped hole")
    ],
    alignment: [
      "Seat the fork over the holder flange and engage the bolt in a table hole.",
      "Press the holder down while tightening so the flange sits flat.",
      "Check for rocking by pushing gently on the top of the post.",
      "Keep cables from pulling sideways on a fork-mounted post."
    ],
    errors: [
      "Using a fork on a holder whose flange is too thick or too thin for the slot.",
      "Leaving the bolt finger-tight so the base creeps during a scan.",
      "Assuming a weighted base is bolted; it can slide.",
      "Letting the fork overhang a table hole and tilt."
    ],
    applications: [
      "Temporary mounting without a dedicated stage",
      "Quick reconfiguration of a teaching setup",
      "Anchoring posts at the table edge",
      "Supporting lightweight alignment tools"
    ],
    experiments: ALL_EXPERIMENTS,
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "kinematic-mount",
    name: "Kinematic mirror mount",
    category: "Mounts",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A kinematic mount holds a mirror and adjusts its tilt about two orthogonal axes with two fine screws, while a spring or a third contact keeps the plate seated. It is the standard steering element in an interferometer because it gives independent, repeatable tip and tilt. The mount's angular resolution is set by the screw pitch and the distance between the screw and the pivot.",
    principle:
      "The moving plate rests on three contact points: one fixed pivot and two adjuster screws bearing against it, with a spring providing the preload. Turning a screw moves that contact and tilts the plate about the axis through the other two contacts. Because the pivot and screws are separated by tens of millimetres, a 0.25 mm screw pitch gives an angular change of order ten milliradians per turn, and a differential or fine-pitch screw improves this further.",
    specs: [
      spec("Adjustment", "two fine screws, 80–100 TPI (typical)"),
      spec("Angular range", "± 3–5° per axis (typical)"),
      spec("Resolution", "tens of arcseconds per division; arcsecond level with a differential screw"),
      spec("Pivot", "ball or cone, spring preloaded"),
      spec("Optic size", "25.4 mm (typical)"),
      spec("Mounting", "1/2″ post or 30 mm cage"),
      spec("Material", "anodized aluminium")
    ],
    alignment: [
      "Mount the mirror and set both screws near mid-travel so there is adjustment in both directions.",
      "Use a far-field target: adjust one screw until the beam is centred horizontally, the other for vertical.",
      "Iterate between two targets at different distances to remove cross-coupling.",
      "Lock or note the settings; a kinematic mount can drift if the spring is weak or the screws are loose."
    ],
    errors: [
      "Running a screw to the end of its travel and then forcing it.",
      "Adjusting both screws at once and losing track of which axis moved.",
      "Over-compressing the spring so the plate is no longer seated on all three contacts.",
      "Using a heavy optic in a mount designed for a thin mirror, causing sag."
    ],
    applications: [
      "Steering a Michelson or Mach–Zehnder arm",
      "Optimizing fibre coupling",
      "Aligning a cavity or delay line",
      "Pointing a beam at a distant target"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-bomb-tester",
      "quantum-eraser"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "mirror-mount",
    name: "Fixed mirror mount",
    category: "Mounts",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A fixed mirror mount holds an optic at a set angle without adjustment screws, relying on a precisely machined seat and a retaining ring. It is more rigid and less drift-prone than a kinematic mount, so it is used once the beam angle has been set by another element. Alignment is done by moving the mount or the stage it sits on, not by tilting the optic.",
    principle:
      "The mirror is pressed against a machined shoulder or three fixed pads by a retaining ring or clip. Because there are no compliant adjusters, the optic's angle is fixed by the mount geometry and the interface to the post. The rigidity comes at the cost of adjustability: any angular correction must come from the post, a stage or a shim.",
    specs: [
      spec("Optic size", "25.4 mm (typical)"),
      spec("Retention", "threaded retaining ring or clip"),
      spec("Material", "anodized aluminium or stainless steel"),
      spec("Angular tolerance", "fixed by machining; not adjustable"),
      spec("Mounting", "1/2″ post or cage plate"),
      spec("Load", "light to moderate (typical)")
    ],
    alignment: [
      "Bolt the mount to a stage or post whose position can be adjusted before final tightening.",
      "Seat the mirror flat against the shoulder and tighten the retainer evenly.",
      "Set the angle using the stage or the post, then lock it.",
      "Check the far-field spot after locking; tightening can shift a poorly seated optic."
    ],
    errors: [
      "Trying to align by bending the post, which is neither stable nor repeatable.",
      "Tightening one side of the retainer first and tilting the optic.",
      "Using a fixed mount where a kinematic mount is needed for daily alignment.",
      "Assuming the mount's face is exactly perpendicular to the post."
    ],
    applications: [
      "Holding a mirror at a fixed fold angle",
      "Rigid end mirror of a cavity",
      "Reference surface in an interferometer",
      "Compact beam routing"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-eraser"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "translation-stage",
    name: "Micrometer translation stage",
    category: "Positioning",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A micrometer translation stage moves an optic along one axis with a calibrated screw, typically over 12–25 mm with micrometre readout. It is the element that scans a Michelson arm, positions a Fourier-plane filter or sets the focus in a tweezer setup. Its accuracy is limited by backlash, tilt and the thermal stability of the whole mount, not only by the micrometer graduation.",
    principle:
      "A micrometer head turns a precision screw that pushes a moving carriage against a spring or a preloaded dovetail. The carriage slides on a lapped dovetail or ball-bearing guide, and the micrometer thimble converts rotation into linear travel with a known pitch (commonly 0.5 mm per revolution, read to 0.01 mm). Backlash arises from clearance in the screw and guide and is minimized by always approaching a setting from the same direction.",
    specs: [
      spec("Travel", "12–25 mm (typical)"),
      spec("Micrometer graduation", "0.01 mm"),
      spec("Readout resolution", "0.001 mm with a vernier (typical)"),
      spec("Backlash", "a few micrometres; approach from one direction"),
      spec("Straightness", "a few micrometres over travel (typical)"),
      spec("Load", "1–5 kg (typical)"),
      spec("Mounting", "1/4″-20 or M6 to a breadboard")
    ],
    alignment: [
      "Bolt the stage flat to the table and check that the carriage moves parallel to the beam axis.",
      "Set the micrometer to mid-travel and mount the optic without disturbing the setting.",
      "Always approach a target position from the same direction to take up backlash.",
      "Measure the actual displacement with an interferometer or a dial indicator if the experiment depends on absolute travel."
    ],
    errors: [
      "Reading the micrometer as an absolute optical path change without accounting for the angle of the stage.",
      "Approaching a setting from the opposite direction and including backlash.",
      "Loading the stage off-centre, which tilts the carriage.",
      "Forgetting that the stage's thermal expansion also changes the optical path."
    ],
    applications: [
      "Scanning a Michelson arm",
      "Positioning a spatial filter in a 4f plane",
      "Focus adjustment in imaging",
      "Sample positioning"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-eraser",
      "fourier-optics",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "rotation-mount",
    name: "Rotating mount with scale",
    category: "Positioning",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A rotating mount turns a polarizer, wave plate or prism about the beam axis with a readable angular scale. It is the element that sets the analyser angle in a Malus's-law measurement and the fast-axis orientation of a wave plate. The scale is only a relative indicator until it has been zeroed against a known polarization state.",
    principle:
      "The optic sits in a cylindrical carriage that rotates in a close-fitting bore, driven by a worm gear, a friction ring or a direct hand turn. A graduated ring and a vernier or a fine division give an angular readout, while a lock screw fixes the setting. The angular accuracy is limited by the fit of the bore, the worm backlash and the centring of the optic.",
    specs: [
      spec("Rotation", "continuous 360° (typical)"),
      spec("Scale graduation", "1–2° with a vernier (typical)"),
      spec("Resolution", "0.1–1° depending on the mount"),
      spec("Clear aperture", "12.7–25.4 mm"),
      spec("Backlash", "present in worm drives; approach one way"),
      spec("Mounting", "1/2″ post or 30 mm cage")
    ],
    alignment: [
      "Mount the optic centred in the bore and set the scale to a convenient zero.",
      "Zero the scale against a known linear polarization by finding the extinction angle with an analyser.",
      "Rotate to the target angle and lock the stage without disturbing the setting.",
      "Check the angle by re-measuring extinction or transmission after locking."
    ],
    errors: [
      "Treating the scale as an absolute polarization angle without zeroing.",
      "Ignoring worm-gear backlash when reversing direction.",
      "Mounting the optic off-centre so rotation translates the beam.",
      "Locking the stage too hard and twisting the optic off its setting."
    ],
    applications: [
      "Malus's-law and wave-plate measurements",
      "Setting a QKD basis",
      "Rotating a grating or prism",
      "Polarization marking in an eraser"
    ],
    experiments: [
      "polarization-3d-cinema",
      "quantum-eraser",
      "quantum-key-distribution"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "lens-tube-mount",
    name: "Lens tube / SM1 lens mount",
    category: "Mounts",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "An SM1 lens tube holds a lens or filter at a fixed distance inside a threaded barrel, with retaining rings to set its axial position. Tubes can be stacked to build a compact imaging or Fourier assembly with a well-defined spacing. The thread is 1.035″-40, and the tube's inside diameter sets the maximum clear aperture.",
    principle:
      "The lens is dropped into the tube and held between two threaded retaining rings. The tube's length and the ring positions set the lens-to-lens spacing, which is the critical parameter in a 4f system or a beam expander. Because the thread is continuous, the axial position can be tuned finely, but the tube must be square to the beam or the whole assembly tilts.",
    specs: [
      spec("Thread", "SM1 (1.035″-40)"),
      spec("Inner diameter", "≈ 25.4 mm"),
      spec("Lengths", "12.7–150 mm (typical)"),
      spec("Retaining rings", "SM1RR or equivalent"),
      spec("Material", "black anodized aluminium"),
      spec("Clear aperture", "limited by the retaining ring")
    ],
    alignment: [
      "Insert the lens with the correct orientation and seat it against a retaining ring.",
      "Add or remove spacers to set the lens separation before tightening the stack.",
      "Check squareness by autocollimating the front surface or by observing the beam position at two distances.",
      "Use a spanner wrench on the retaining ring, not on the tube body."
    ],
    errors: [
      "Cross-threading a retaining ring and damaging the fine thread.",
      "Clamping the lens only at its edge with a ring that is too small and vignetting the beam.",
      "Stacking tubes without checking total length, so the lens spacing is wrong.",
      "Using a tube with a shiny interior that scatters stray light."
    ],
    applications: [
      "Compact beam expander",
      "4f spatial-filter assembly",
      "Camera relay lens mount",
      "Filter and wave-plate stacking"
    ],
    experiments: ["fourier-optics", "optical-tweezers"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "cage-system",
    name: "Cage system plate and rods",
    category: "Structure",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A cage system uses four parallel rods and slotted plates to hold lenses, filters and cameras on a common axis. It is rigid, compact and self-aligning in the transverse plane, which makes it ideal for a 4f processor or a microscope arm. The trade-off is limited access to the beam between plates and a fixed 30 mm rod spacing.",
    principle:
      "Four rods pass through clearance holes in each plate, and set screws or clamps fix the plate's axial position. The rods constrain the plate to slide without rotating, so all plates share a common optical axis. The stiffness comes from the rod-plate assembly acting as a space frame; a long unsupported cage can still vibrate, and over-tightening one plate can rack the frame.",
    specs: [
      spec("Rod spacing", "30 mm (typical)"),
      spec("Rod diameter", "6 mm"),
      spec("Plate size", "30 × 30 mm to 60 × 60 mm"),
      spec("Thread", "4-40 or M3 set screws"),
      spec("Material", "anodized aluminium"),
      spec("Compatibility", "SM1 or SM2 threads in plate centres")
    ],
    alignment: [
      "Assemble the cage on a flat surface and tighten the plates gradually in a cross pattern.",
      "Slide plates to the required spacing and lock them without twisting the rods.",
      "Check the axis with a laser and an iris at each end; a racked cage steers the beam.",
      "Support long cages at both ends to reduce vibration."
    ],
    errors: [
      "Tightening one plate fully before the others, which racks the cage.",
      "Using rods of unequal length and assuming the plates are parallel.",
      "Overloading a long unsupported cage with a heavy camera.",
      "Forgetting that the rods block access to the beam for irises and beam blocks."
    ],
    applications: [
      "4f optical processor",
      "Compact microscope arm",
      "Filter and camera stacks",
      "Fibre-launch assembly"
    ],
    experiments: ["fourier-optics", "optical-tweezers"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "breadboard",
    name: "Damped optical breadboard",
    category: "Structure",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A damped optical breadboard provides a flat, tapped surface on a 25 mm grid for mounting components. Its honeycomb core and constrained damping layer suppress ringing so that a small interferometer can be built without a full pneumatic table. It is portable and can be placed on a lab bench, but it does not isolate against building vibration the way a floating table does.",
    principle:
      "The top skin is a steel or aluminium plate with a regular array of tapped holes (M6 or 1/4″-20) on a 25 mm grid. A honeycomb core gives high stiffness with low mass, and a damping layer converts vibration into heat, raising the mechanical Q down. The breadboard's first bending mode is typically hundreds of hertz; above that, the damping keeps ringing short.",
    specs: [
      spec("Hole grid", "25 mm × 25 mm"),
      spec("Thread", "M6 or 1/4″-20"),
      spec("Thickness", "12.7–50 mm (typical)"),
      spec("Top skin", "ferromagnetic stainless steel or aluminium"),
      spec("Flatness", "± 0.1 mm over a small board (typical)"),
      spec("Core", "steel or aluminium honeycomb"),
      spec("Damping", "constrained-layer or tuned mass (typical)")
    ],
    alignment: [
      "Place the board on a rigid bench and check that it is not rocking on a warped surface.",
      "Plan the layout on the 25 mm grid so components do not obstruct each other's access.",
      "Bolt heavy items through the board, not just with a clamping fork.",
      "Keep the board clean and cover unused holes to stop screws and dust falling in."
    ],
    errors: [
      "Using the wrong thread pitch and cross-threading a component.",
      "Assuming a breadboard isolates vibration; it only damps it.",
      "Over-tightening a bolt and pulling a threaded insert.",
      "Letting swarf or liquid into the honeycomb through an open hole."
    ],
    applications: [
      "Portable interferometer build",
      "Teaching-lab optical layout",
      "Prototype optical system",
      "Mounting stages and cages"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-eraser",
      "polarization-3d-cinema",
      "fourier-optics"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "optical-table",
    name: "Pneumatic optical table",
    category: "Structure",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A pneumatic optical table combines a stiff honeycomb top with air-spring isolators that attenuate building vibration below a few hertz. It is the right surface for interferometry and optical trapping, where micron-scale path stability matters. The table must be levelled and its isolators inflated correctly; a table resting on its stops transmits vibration instead of isolating it.",
    principle:
      "Each isolator is a piston in a rolling diaphragm or a sealed air chamber. The air spring has a low natural frequency (around 1–2 Hz), so above that frequency the table behaves as a mass on a soft spring and attenuates floor vibration. A leveling valve admits or releases air to keep the table height constant as the load changes. The honeycomb top provides stiffness and damping at higher frequencies.",
    specs: [
      spec("Isolation", "pneumatic, natural frequency ≈ 1–2 Hz"),
      spec("Top", "steel honeycomb with tapped 25 mm grid"),
      spec("Hole thread", "M6 or 1/4″-20"),
      spec("Load capacity", "hundreds of kilograms (typical)"),
      spec("Leveling", "automatic or manual valves per isolator"),
      spec("Surface flatness", "± 0.1 mm or better")
    ],
    alignment: [
      "Distribute the load symmetrically and keep it within the isolator rating.",
      "Inflate the isolators until the table floats at its design height, then level it with the valves.",
      "Wait for the table to settle after loading before making a sensitive measurement.",
      "Check that cables and hoses do not bridge the table to the floor, which bypasses the isolation."
    ],
    errors: [
      "Leaving the table on its mechanical stops and believing it is isolated.",
      "Loading one corner heavily and tilting the table.",
      "Running a rigid cable tray or hose from the floor to the table.",
      "Assuming isolation removes acoustic or air-current disturbances; it does not."
    ],
    applications: [
      "Stable interferometry",
      "Optical trapping",
      "Holography and long-exposure imaging",
      "Precision metrology"
    ],
    experiments: ALL_EXPERIMENTS,
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "beam-block",
    name: "Beam block / laser safety barrier",
    category: "Accessories",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A beam block is a matte, absorbing target that terminates a laser beam safely instead of letting it hit a wall, a tool or an eye. Every unused port in an interferometer should have one, and the block should be large enough to catch the full beam including any divergence. A shiny metal object is not a beam block, even if it looks black.",
    principle:
      "The block's surface is roughened and anodized or coated so that incident light is absorbed and the small reflected fraction is scattered into large angles rather than a specular beam. The material must also conduct heat away if the beam is powerful. The block's rating depends on wavelength, power density and exposure time, so a block suitable for a milliwatt HeNe may not survive a focused pulsed beam.",
    specs: [
      spec("Material", "black anodized aluminium or ceramic (typical)"),
      spec("Surface", "matte, high absorptance"),
      spec("Size", "25–100 mm (typical)"),
      spec("Mounting", "1/2″ post or magnetic base"),
      spec("Power rating", "verify for the actual wavelength and beam size"),
      spec("Reflectance", "low but not zero; check at grazing angles")
    ],
    alignment: [
      "Place a block at every unused beam port before turning on the source.",
      "Aim the block at the centre of the beam, not at its edge, and make it larger than the beam.",
      "Check for a reflected glint with a card or an IR viewer, especially at grazing incidence.",
      "Keep blocks in place during alignment changes; never use a hand as a temporary block."
    ],
    errors: [
      "Using a shiny black plastic object that reflects a dangerous specular beam.",
      "Blocking only the core of a diverging beam and letting the halo escape.",
      "Placing a block too close to a focus and burning it.",
      "Removing a block 'just for a moment' during a measurement."
    ],
    applications: [
      "Terminating unused beams",
      "Enclosing a beam path",
      "Safe beam dumping during alignment",
      "Protecting detectors from stray light"
    ],
    experiments: ALL_EXPERIMENTS,
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "iris-diaphragm",
    name: "Iris diaphragm for beam centring",
    category: "Accessories",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "This is the alignment-grade iris: a mounted, post-supported diaphragm used to find and hold the optical axis rather than to set a calibrated aperture. Two of them define a line, and a third reveals angular walk. It is deliberately listed separately from the optical iris because its job is mechanical referencing, not beam shaping.",
    principle:
      "The leaf aperture closes symmetrically about the mount centre, so the centre of the opening is a fixed mechanical reference independent of diameter. By closing the iris until it just grazes the beam, the beam centre is located to a fraction of the aperture. The mount's post and base then define that point in table coordinates.",
    specs: [
      spec("Aperture range", "1–25 mm (typical)"),
      spec("Mount", "post-mounted with a rotating lever"),
      spec("Centre stability", "fixed by the leaf mechanism"),
      spec("Material", "blackened steel leaves"),
      spec("Compatibility", "1/2″ post"),
      spec("Use", "alignment reference, not metrology aperture")
    ],
    alignment: [
      "Set the iris at the standard beam height and open it fully.",
      "Close it until the beam is just clipped, then open a little; the beam is now centred on the mount.",
      "Place a second iris far away and repeat; the two centres define the axis.",
      "Use a third iris to check that later optics have not steered the beam."
    ],
    errors: [
      "Using the iris as a precision aperture and quoting its diameter.",
      "Mounting it on a flexible post that moves when adjusted.",
      "Closing it fully on a powerful beam and burning the leaves.",
      "Assuming the mount centre is the beam centre without checking with a card."
    ],
    applications: [
      "Defining the optical axis",
      "Checking beam walk after a fold",
      "Centring a lens or mirror",
      "Aligning a fibre launch"
    ],
    experiments: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "fourier-optics",
      "quantum-key-distribution",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "micrometer",
    name: "Micrometer head, 25 mm travel",
    category: "Positioning",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A micrometer head is a precision screw with a graduated thimble, used either as a standalone positioner or as the drive for a translation stage. Its 25 mm travel and 0.01 mm graduation make it suitable for fringe counting and focus adjustment. The reading is only as good as the mechanical preload: backlash and thermal drift can exceed the graduation.",
    principle:
      "A hardened screw with a known pitch (commonly 0.5 mm per revolution) moves a spindle linearly. The sleeve carries a linear scale and the thimble a circular scale, so the position is read as sleeve millimetres plus thimble hundredths. A friction thimble or a ratchet stop limits the measuring force; without preload, reversing direction introduces backlash.",
    specs: [
      spec("Travel", "25 mm (typical)"),
      spec("Graduation", "0.01 mm"),
      spec("Pitch", "0.5 mm per revolution (typical)"),
      spec("Spindle", "hardened steel, flat or spherical tip"),
      spec("Accuracy", "a few micrometres over 25 mm (typical)"),
      spec("Mounting", "9.5 mm or 3/8″ stem clamp")
    ],
    alignment: [
      "Clamp the micrometer by its stem, not by the thimble, and check that the spindle moves freely.",
      "Zero the reading against a reference surface or the stage's hard stop.",
      "Approach the measurement point from one direction and record the reading before locking.",
      "Check the actual displacement with an independent scale if the result depends on absolute travel."
    ],
    errors: [
      "Reading the thimble in the wrong direction on a left-handed or reverse-reading model.",
      "Ignoring backlash after reversing the screw.",
      "Over-tightening the spindle against a fragile optic.",
      "Assuming the graduation equals the accuracy; screw and thermal errors add."
    ],
    applications: [
      "Manual translation of an optic",
      "Fringe counting and path-length setting",
      "Focus adjustment",
      "Calibrating a stage"
    ],
    experiments: ["michelson-interferometer", "fourier-optics"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "lab-jack",
    name: "Laboratory jack",
    category: "Positioning",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "A laboratory jack is a scissor-lift platform for raising a sample, cell or heavy component to the beam height. It provides coarse vertical travel with a large, stable platform, and is often used under a sample stage in a tweezer setup. The screw drive gives fine height control, but the platform can wobble if the load is off-centre or the jack is near its maximum height.",
    principle:
      "A lead screw drives a pair of crossed arms that form a scissor linkage. As the screw shortens the horizontal diagonal, the platform rises while staying approximately horizontal. The mechanical advantage is large, so a small screw turn gives a small height change, but the linkage has clearance and the platform's stiffness falls as it extends.",
    specs: [
      spec("Platform size", "100 × 100 mm to 200 × 200 mm (typical)"),
      spec("Height range", "50–250 mm (typical)"),
      spec("Load", "5–20 kg (typical)"),
      spec("Drive", "lead screw with hand crank"),
      spec("Material", "stainless steel or aluminium"),
      spec("Locking", "some models have a lock screw")
    ],
    alignment: [
      "Place the jack on a flat, rigid surface and centre the load on the platform.",
      "Raise the platform to roughly the beam height before fine adjustment with the sample stage.",
      "Lock the height if the jack has a lock, and check for rocking.",
      "Keep the load well below the rated maximum and avoid side loads."
    ],
    errors: [
      "Loading the platform at one edge, which racks the scissor and tilts the sample.",
      "Using the jack at full extension where it is least stable.",
      "Forgetting to lock the height before a long measurement.",
      "Placing a heavy laser or table on a jack not rated for it."
    ],
    applications: [
      "Raising a sample cell to beam height",
      "Supporting a microscope stage",
      "Coarse vertical positioning of a heavy assembly",
      "Height adjustment under a trap"
    ],
    experiments: ["optical-tweezers"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-stage",
    name: "Sample stage with XY translation",
    category: "Positioning",
    kind: "optomechanical",
    manufacturer: "Thorlabs",
    summary:
      "An XY sample stage holds a slide, coverslip or cell and moves it laterally under a fixed beam. It is essential for finding a particle, scanning a sample through a focus and bringing a region of interest into the trap. Good stages have low tilt and hysteresis so that moving in X does not change the focus.",
    principle:
      "Two stacked linear stages, usually with dovetail or flexure guides and micrometer or differential drives, provide orthogonal travel. The sample holder sits on the top plate, so its height is set by the stack; any tilt or runout in the guides moves the sample along the optical axis as well as laterally. A spring preload removes clearance and reduces backlash.",
    specs: [
      spec("Travel", "12–25 mm per axis (typical)"),
      spec("Resolution", "1–10 µm with micrometer drives"),
      spec("Straightness / flatness", "a few micrometres (typical)"),
      spec("Load", "0.5–5 kg (typical)"),
      spec("Holder", "slide, coverslip or Petri dish"),
      spec("Mounting", "1/4″-20 or M6")
    ],
    alignment: [
      "Bolt the stage flat and check that the sample surface is perpendicular to the optical axis.",
      "Secure the slide or chamber without bending it; use gentle clips or vacuum.",
      "Move through the full travel and watch the focus; refocus if the stage tilts.",
      "Approach a target position from one direction to reduce backlash."
    ],
    errors: [
      "Clamping a coverslip so hard that it bends and changes the focus.",
      "Assuming the two axes are exactly orthogonal.",
      "Moving the stage while a long exposure is running and blurring the image.",
      "Letting immersion oil or water run into the stage mechanism."
    ],
    applications: [
      "Scanning a sample under a trap",
      "Finding particles in a suspension",
      "Imaging a slide or chamber",
      "Positioning a Fourier-plane object"
    ],
    experiments: ["optical-tweezers", "fourier-optics"],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },

  // ── Samples and accessories ────────────────────────────────────────────
  {
    id: "sample-gas-cell",
    name: "Gas cell with inlet valve",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A sealed gas cell with AR-coated windows and an inlet valve lets the refractive index of a gas be changed in a controlled way inside one interferometer arm. Pumping or filling the cell changes the optical path, producing a measurable fringe shift from which the index or the pressure can be inferred. The cell must be thick enough to give a measurable shift and thin enough that the windows remain parallel and the fringes stay visible.",
    principle:
      "The optical path through the cell is n(P,T)·L, where L is the geometric length and n depends on pressure through the Lorentz–Lorenz or Gladstone–Dale relation. For air the refractivity n−1 is of order 10⁻⁴ at one bar, so a 10–100 mm cell gives a path change of several to tens of wavelengths for a one-bar change. The fringe count N = Δ(nL)/λ therefore measures the index change once the cell length and wavelength are known.",
    specs: [
      spec("Path length", "10–100 mm (typical)"),
      spec("Windows", "AR-coated fused silica, wedged or parallel"),
      spec("Pressure", "vacuum to a few bar, depending on the body"),
      spec("Valve", "inlet/outlet with a vacuum-tight seal"),
      spec("Body", "stainless steel or aluminium"),
      spec("Mounting", "post or optical rail"),
      spec("Leak rate", "verify with a blank-off test")
    ],
    alignment: [
      "Mount the cell so both windows are normal to the beam and the beam passes through the centre.",
      "Check that the cell is not tilted; a wedged window produces a lateral shift and a ghost.",
      "Pump or fill slowly and wait for thermal equilibrium before counting fringes.",
      "Record pressure, temperature and the exact cell length with the fringe count."
    ],
    errors: [
      "Assuming the cell length is exactly the nominal value; measure it or use the manufacturer's calibrated value.",
      "Changing pressure quickly and reading fringes before the gas reaches thermal equilibrium.",
      "Over-pressurizing a cell not rated for it.",
      "Ignoring window wedge and multiple reflections, which add parasitic fringes."
    ],
    applications: [
      "Refractive index of gases versus pressure",
      "Gas sensing and absorption measurements",
      "Pressure calibration by interferometry",
      "Demonstration of optical path length"
    ],
    experiments: ["michelson-interferometer"],
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-glass-slide",
    name: "Glass slide / plate sample",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A plain glass slide or plate is a simple phase object for interferometry and a birefringence specimen for polarization work. Its thickness and refractive index change the optical path in one arm, and its residual stress can rotate or elliptically polarize transmitted light. It is inexpensive but never optically perfect: wedge, surface figure and stress all matter.",
    principle:
      "A plate of thickness t and index n adds an optical path (n−1)t relative to air, so inserting it in one arm shifts the fringes by (n−1)t/λ. In polarized light, residual stress makes the glass weakly birefringent through the photoelastic effect, so the transmitted state depends on position and on the stress pattern. A tilted plate also laterally displaces the beam and can introduce astigmatism.",
    specs: [
      spec("Material", "soda-lime or borosilicate glass (typical)"),
      spec("Thickness", "1–3 mm"),
      spec("Refractive index", "≈ 1.51–1.52 at 633 nm"),
      spec("Flatness", "not specified; often several wavelengths"),
      spec("Wedge", "present; can produce ghost fringes"),
      spec("Birefringence", "residual stress, usually small but measurable"),
      spec("Size", "25 × 75 mm microscope slide (typical)")
    ],
    alignment: [
      "Mount the slide in a holder that does not bend it; a tilted or warped slide adds aberrations.",
      "Set it normal to the beam for a pure optical-path measurement, or at a known angle if tilting is the variable.",
      "Check for ghost reflections from the second surface and block them if necessary.",
      "For polarization work, rotate the slide between crossed polarizers to map its stress pattern."
    ],
    errors: [
      "Treating the slide as a plane-parallel etalon; its surfaces are not parallel.",
      "Clamping it in a way that introduces stress birefringence and then attributing it to the material.",
      "Ignoring the lateral displacement of a tilted plate.",
      "Using a dirty slide and mistaking scatter for a sample property."
    ],
    applications: [
      "Optical path and refractive index demonstration",
      "Stress-birefringence viewing",
      "Phase object for interferometry",
      "Simple beam displacement"
    ],
    experiments: [
      "michelson-interferometer",
      "polarization-3d-cinema",
      "fourier-optics"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-metal-rod",
    name: "Metal rod for thermal-expansion measurement",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A metal rod clamped at one end and heated expands by a small, measurable amount, making it a direct interferometric measurement of the linear thermal-expansion coefficient. The rod pushes a mirror or a probe in one interferometer arm while the other arm stays fixed. The measurement is limited by temperature uniformity and by how well the rod's expansion is transmitted without play.",
    principle:
      "The rod's length changes as ΔL = α·L·ΔT, where α is the coefficient of linear expansion. For a 100 mm aluminium rod (α ≈ 23 × 10⁻⁶ K⁻¹) a 10 K rise gives about 23 µm of movement, or roughly 70 fringes at 633 nm in a Michelson interferometer. The expansion is measured by counting fringes as the mirror moves; the sign and the count give ΔL, and α follows if L and ΔT are known.",
    specs: [
      spec("Materials", "aluminium, brass or steel (α ≈ 12–23 × 10⁻⁶ K⁻¹)"),
      spec("Length", "50–200 mm (typical)"),
      spec("Diameter", "5–10 mm (typical)"),
      spec("Mounting", "clamped at one end, free at the other"),
      spec("Heating", "resistive heater, water bath or hot plate"),
      spec("Thermometry", "thermocouple or RTD attached to the rod")
    ],
    alignment: [
      "Clamp the rod rigidly at one end and couple the free end to the moving mirror without backlash.",
      "Attach the temperature sensor at the same point on the rod and insulate the rod from air currents.",
      "Heat slowly so the rod and sensor reach equilibrium; record temperature and fringe count together.",
      "Allow the rod to cool and check that the fringes return, which tests for hysteresis and play."
    ],
    errors: [
      "Measuring the heater temperature instead of the rod temperature.",
      "Heating too fast so the rod is not in thermal equilibrium.",
      "Using a mount that constrains the rod's expansion or introduces play.",
      "Ignoring the expansion of the mount and the probe itself."
    ],
    applications: [
      "Measurement of thermal-expansion coefficients",
      "Interferometric dilatometry",
      "Temperature calibration of a stage",
      "Demonstration of optical metrology"
    ],
    experiments: ["michelson-interferometer"],
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-bead-suspension",
    name: "Dielectric microsphere suspension",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A dilute suspension of dielectric microspheres provides the particles that an optical trap holds and manipulates. Polystyrene or silica spheres of 1–5 µm diameter are typical: large enough to image, small enough for the gradient force to dominate. The suspension must be dilute and sealed to prevent evaporation and aggregation during a measurement.",
    principle:
      "A transparent sphere with a refractive index higher than its medium is drawn toward the intensity maximum of a focused beam by the gradient force, while scattering pushes it along the propagation direction. For spheres much smaller than the wavelength the point-dipole model applies; for micron-scale spheres ray optics gives a useful intuition. The balance of gradient and scattering forces, together with Brownian motion, determines whether a stable three-dimensional trap forms.",
    specs: [
      spec("Material", "polystyrene (n ≈ 1.59) or silica (n ≈ 1.45)"),
      spec("Diameter", "1–5 µm (typical)"),
      spec("Medium", "water or heavy water, with surfactant"),
      spec("Density", "1.05 g/cm³ for polystyrene; close to water"),
      spec("Concentration", "dilute, so particles are well separated"),
      spec("Storage", "refrigerated, resuspend before use"),
      spec("Sealing", "coverslip or chamber to prevent evaporation")
    ],
    alignment: [
      "Dilute the stock suspension in filtered water and sonicate briefly to break up aggregates.",
      "Place a drop in a sealed chamber or on a coverslip and let it settle before focusing.",
      "Find a single isolated sphere with the imaging camera, then move the trap focus onto it.",
      "Reduce laser power slowly when releasing the particle to avoid a sudden kick."
    ],
    errors: [
      "Using a suspension that is too concentrated, so particles cluster and trap each other.",
      "Letting the sample dry out, which changes the osmolality and sticks particles to the glass.",
      "Assuming the nominal diameter is exact; size distributions are broad.",
      "Forgetting that polystyrene beads may fluoresce or degrade under blue light."
    ],
    applications: [
      "Optical trapping and micromanipulation",
      "Brownian motion and stiffness calibration",
      "Colloidal interaction studies",
      "Particle tracking"
    ],
    experiments: ["optical-tweezers"],
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-coverslip",
    name: "Coverslip / sample chamber",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A coverslip closes a sample chamber and provides the thin glass window through which a high-NA objective focuses. The standard #1.5 thickness of 0.17 mm is part of the objective's optical design, so using the wrong thickness introduces spherical aberration. The chamber must seal against evaporation without flexing the glass into the optical path.",
    principle:
      "The objective is corrected for a specific coverslip thickness and immersion medium. If the glass is thicker or thinner, the rays at high NA focus at different depths, producing spherical aberration and a dim, axially smeared spot. The chamber's geometry also sets the sample volume and the thermal and mechanical stability of the trap.",
    specs: [
      spec("Material", "borosilicate glass"),
      spec("Thickness", "#1.5, 0.17 mm nominal"),
      spec("Size", "18 × 18 mm to 24 × 60 mm"),
      spec("Refractive index", "≈ 1.52"),
      spec("Seal", "silicone grease, tape or gasket"),
      spec("Volume", "10–200 µL (typical chamber)"),
      spec("Cleanliness", "dust-free; clean before use")
    ],
    alignment: [
      "Select a #1.5 coverslip and check its thickness if the objective is sensitive.",
      "Seal the chamber without trapping air bubbles and without bowing the glass.",
      "Place the chamber on the stage with the coverslip facing the objective and the oil in contact.",
      "Check the focus across the field; a tilted coverslip gives uneven focus."
    ],
    errors: [
      "Using a thick or unknown coverslip and accepting a blurred, aberrated focus.",
      "Letting the chamber leak so the sample dries during a measurement.",
      "Trapping an air bubble under the coverslip and mistaking it for a particle.",
      "Pressing the objective onto the coverslip and cracking it."
    ],
    applications: [
      "Sealed sample chamber for trapping",
      "High-NA imaging",
      "Long-duration measurements without evaporation",
      "Microfluidic sample mounting"
    ],
    experiments: ["optical-tweezers"],
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-3d-glasses-linear",
    name: "Linear-polarization 3D glasses",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "Linear-polarization 3D glasses use two orthogonal linear analysers to separate the left- and right-eye images from a projected pair of orthogonal linear states. They are the simplest demonstration of stereo projection and of Malus's law in a familiar object. No such glasses are assumed to be laboratory stock; verify their axes and extinction before using them quantitatively.",
    principle:
      "Each eye's filter transmits one linear polarization and blocks the orthogonal one. If the projector sends left-eye and right-eye images with orthogonal linear states, each eye sees only its intended image, provided the head stays upright. Tilting the head rotates the filters relative to the projected states and causes ghosting, which is the main practical weakness of the linear scheme.",
    specs: [
      spec("Filters", "two dichroic linear polarizers, axes crossed"),
      spec("Extinction ratio", "50:1 to 200:1 (typical, consumer grade)"),
      spec("Wavelength range", "visible"),
      spec("Frame", "cardboard or plastic"),
      spec("Axis marking", "usually not marked; measure it"),
      spec("Status", "not assumed present; verify")
    ],
    alignment: [
      "Measure each lens's pass axis with a known polarizer and mark it.",
      "Orient the projector's two states to match the lenses and check extinction through each eye.",
      "Keep the viewer's head upright; tilting mixes the channels.",
      "Measure ghosting with a camera through each lens rather than judging by eye."
    ],
    errors: [
      "Assuming the lenses are perfectly crossed and have high extinction.",
      "Tilting the head and interpreting the resulting ghosting as a projector fault.",
      "Using the glasses with circular-polarized projection and getting almost no separation.",
      "Scratched or delaminated filters producing scattering and reduced contrast."
    ],
    applications: [
      "Linear-polarization stereo demonstration",
      "Analyser pair for Malus's law",
      "Explaining ghosting and head tilt",
      "Polarization channel separation"
    ],
    experiments: ["polarization-3d-cinema"],
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-3d-glasses-circular",
    name: "Circular-polarization 3D glasses",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "Circular-polarization 3D glasses use a quarter-wave retarder followed by a linear analyser in each eye to separate left- and right-circular states. Unlike linear glasses they tolerate head tilt, which is why they are used in commercial cinemas. No such glasses are assumed to be laboratory stock; their handedness and extinction must be measured before use.",
    principle:
      "Each eye's stack converts one circular handedness to linear light aligned with its analyser and converts the opposite handedness to the orthogonal linear state, which the analyser blocks. The quarter-wave layer is designed for a specific wavelength band, so the separation degrades away from the design wavelength. Flipping a lens or viewing a reflection reverses the handedness and swaps the channels.",
    specs: [
      spec("Stack", "quarter-wave retarder + linear analyser per eye"),
      spec("Design wavelength", "around 550 nm (typical)"),
      spec("Handedness", "opposite in the two eyes"),
      spec("Extinction", "depends on retardance accuracy; measure"),
      spec("Frame", "plastic cinema frame"),
      spec("Status", "not assumed present; verify")
    ],
    alignment: [
      "Identify the front and back faces; the retarder must face the projector.",
      "Measure transmission through each lens for left- and right-circular input and record the contrast.",
      "Check that the two lenses have opposite handedness by looking through one lens with the other reversed.",
      "Keep the glasses at the design wavelength band; test with the actual projector spectrum."
    ],
    errors: [
      "Flipping a lens and reversing the channel.",
      "Using the glasses with a linear-polarized source and getting poor separation.",
      "Assuming the glasses work equally well at all visible wavelengths.",
      "Judging ghosting by eye without a camera and a controlled source."
    ],
    applications: [
      "Circular-polarization stereo demonstration",
      "Handedness analyser",
      "Explaining head-tilt tolerance",
      "Polarization channel contrast measurement"
    ],
    experiments: ["polarization-3d-cinema"],
    verification: "unverified",
    generic: true
  },
  {
    id: "sample-projection-screen",
    name: "Polarization-preserving projection screen",
    category: "Accessories",
    kind: "optical",
    manufacturer: GENERIC_MAKER,
    summary:
      "A polarization-preserving screen reflects or transmits the projected image without scrambling its polarization, which is essential for a 3D cinema demonstration. An ordinary matte white screen depolarizes on scattering and destroys the channel separation. No polarization-preserving screen is assumed to be part of the standard kit, and its behaviour depends on coating and viewing geometry, so it must be characterized rather than assumed.",
    principle:
      "A silvered or specially coated screen reflects light specularly or with limited depolarization, retaining the incident polarization. A diffuse white screen multiply scatters the light, randomizing the polarization and converting a clean circular or linear state into a mixture. The screen gain and viewing angle also affect brightness uniformity, which matters when comparing channels.",
    specs: [
      spec("Type", "silvered or polarization-preserving coating"),
      spec("Reflectance", "moderate to high, angle dependent"),
      spec("Polarization retention", "high for the design geometry; verify"),
      spec("Gain", "1–2.5 (typical)"),
      spec("Size", "portable 40–100 inch (typical)"),
      spec("Mounting", "tripod or wall"),
      spec("Status", "not assumed present; verify")
    ],
    alignment: [
      "Set the screen perpendicular to the projector axis and avoid extreme viewing angles.",
      "Measure the polarization state of the reflected light with an analyser; do not assume preservation.",
      "Compare the screen with a white card to demonstrate the difference in channel separation.",
      "Keep ambient light low so the projected polarization pattern is visible."
    ],
    errors: [
      "Using an ordinary white wall or matte screen and blaming the glasses for ghosting.",
      "Viewing at a large angle where the coating's polarization behaviour changes.",
      "Assuming a silvered screen preserves circular polarization perfectly.",
      "Overexposing the camera and losing the channel contrast."
    ],
    applications: [
      "Polarization-preserving 3D projection",
      "Demonstration of depolarizing versus preserving screens",
      "Channel-contrast measurement",
      "Polarized imaging background"
    ],
    experiments: ["polarization-3d-cinema"],
    verification: "unverified",
    generic: true
  },

  // ── Shared instruments (hardware view) ─────────────────────────────────
  {
    id: "inst-oscilloscope",
    name: "Digital oscilloscope",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "A digital oscilloscope digitizes a detector or transducer signal so its amplitude, timing and noise can be inspected in the time domain. It is used to watch fringe signals, photodiode pulses and quadrant-detector difference signals. The scope's bandwidth, sampling rate and vertical resolution set what can honestly be measured.",
    principle:
      "An analogue front end amplifies or attenuates the input, then an analogue-to-digital converter samples it at a fixed rate. Samples are stored in a buffer and displayed with triggering that aligns repeated events. The vertical resolution is typically 8 bits, so small features on a large offset need AC coupling or a smaller range; the bandwidth limits the fastest edge that can be displayed without distortion.",
    specs: [
      spec("Bandwidth", "100–500 MHz (typical)"),
      spec("Sample rate", "1–5 GS/s (typical)"),
      spec("Vertical resolution", "8 bits"),
      spec("Channels", "2–4"),
      spec("Input impedance", "1 MΩ // 10–20 pF"),
      spec("Time base", "ns/div to s/div"),
      spec("Trigger", "edge, pulse, video (typical)")
    ],
    alignment: [
      "Use a 10× probe or a terminated coax cable and compensate the probe before measuring.",
      "Set the vertical scale so the signal fills most of the screen without clipping.",
      "Adjust the time base to show several periods and trigger on a stable edge.",
      "Use AC coupling only when the DC offset is unimportant, and remember it changes the low-frequency response."
    ],
    errors: [
      "Measuring a signal whose bandwidth exceeds the scope's and trusting the amplitude.",
      "Using a long ground lead that picks up noise and forms a loop.",
      "Confusing 8-bit quantization with the noise floor of the measurement.",
      "Forgetting that a 1 MΩ input loads a high-impedance detector output."
    ],
    applications: [
      "Fringe and beat-signal observation",
      "Detector pulse timing",
      "Noise and stability monitoring",
      "Triggering a shutter or acquisition"
    ],
    experiments: [
      "michelson-interferometer",
      "quantum-eraser",
      "optical-tweezers"
    ],
    verification: "unverified",
    generic: true
  },
  {
    id: "inst-function-generator",
    name: "Function generator",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "A function generator produces sine, square, triangle and arbitrary waveforms to drive a piezo, an acousto-optic modulator, a shutter or a stage. It is the clock and the dither source for many measurements, including lock-in detection and trap-stiffness calibration. Its output impedance and load matching matter as much as its frequency accuracy.",
    principle:
      "Direct digital synthesis builds a waveform from a phase accumulator and a lookup table, then a digital-to-analogue converter and an output amplifier produce the analogue signal. The frequency is set by the phase increment and the sample clock, so it can be tuned finely and swept phase-continuously. The output is usually 50 Ω source impedance, so the delivered amplitude depends on the load.",
    specs: [
      spec("Frequency range", "1 µHz–20 MHz (typical)"),
      spec("Waveforms", "sine, square, triangle, ramp, arbitrary"),
      spec("Amplitude", "10 mV–10 V peak-to-peak into 50 Ω"),
      spec("DC offset", "± 5 V (typical)"),
      spec("Resolution", "µHz in frequency; mV in amplitude"),
      spec("Output impedance", "50 Ω"),
      spec("Channels", "1–2")
    ],
    alignment: [
      "Set the desired waveform and frequency before connecting the load.",
      "Check the amplitude with the scope at the load, not at the generator display.",
      "Use a BNC cable and a proper termination; a high-impedance load doubles the displayed amplitude.",
      "Add a DC offset only after checking the load's rating."
    ],
    errors: [
      "Assuming the displayed amplitude is delivered into a high-impedance load.",
      "Driving a piezo or modulator beyond its voltage rating.",
      "Using a square wave with fast edges that ring on a long cable.",
      "Forgetting that changing frequency can change the output amplitude in some instruments."
    ],
    applications: [
      "Piezo scanning and dithering",
      "Acousto-optic modulator drive",
      "Shutter and trigger timing",
      "Lock-in reference signal"
    ],
    experiments: ["michelson-interferometer", "optical-tweezers"],
    verification: "unverified",
    generic: true
  },
  {
    id: "inst-spectrum-analyzer",
    name: "Spectrum analyser",
    category: "Detection",
    kind: "instrument",
    manufacturer: GENERIC_MAKER,
    summary:
      "An electrical spectrum analyser displays the power spectral density of a detector signal, revealing noise, periodic interference and the Lorentzian corner of a trapped particle. It is not an optical spectrometer: it analyses the voltage waveform from a photodiode, not the light's wavelength spectrum. Resolution bandwidth and input attenuation must be set deliberately or the displayed noise is misleading.",
    principle:
      "A swept superheterodyne analyser mixes the input with a local oscillator, filters the intermediate frequency with a narrow resolution-bandwidth filter, and measures the power as the local oscillator sweeps. An FFT analyser instead digitizes the waveform and computes its discrete Fourier transform. In both cases the displayed power per bin depends on the resolution bandwidth, so noise density must be normalized by that bandwidth.",
    specs: [
      spec("Frequency range", "DC–1 GHz or higher (typical)"),
      spec("Resolution bandwidth", "1 Hz–1 MHz"),
      spec("Displayed average noise", "−120 to −160 dBm/Hz (typical)"),
      spec("Input impedance", "50 Ω"),
      spec("Attenuation", "0–30 dB input attenuator"),
      spec("Dynamic range", "70–100 dB (typical)")
    ],
    alignment: [
      "Connect the detector through a DC block if the analyser input cannot tolerate a bias.",
      "Set the input attenuation so the largest signal does not overload the mixer.",
      "Choose a resolution bandwidth narrow enough to resolve the feature but wide enough to keep the sweep fast.",
      "Normalize the displayed noise by the resolution bandwidth before comparing with theory."
    ],
    errors: [
      "Reading a noise floor in dBm without converting to dBm/Hz.",
      "Overloading the input and generating harmonics that look like real signals.",
      "Using a resolution bandwidth so wide that the Lorentzian corner is smeared.",
      "Forgetting that the analyser measures voltage noise, not optical power noise."
    ],
    applications: [
      "Brownian-motion power spectral density",
      "Detector and amplifier noise characterization",
      "Interference and pickup hunting",
      "Trap-stiffness calibration"
    ],
    experiments: ["optical-tweezers"],
    verification: "unverified",
    generic: true
  },
  {
    id: "inst-beam-profiler",
    name: "Beam profiler",
    category: "Detection",
    kind: "instrument",
    manufacturer: "Thorlabs",
    summary:
      "A beam profiler measures the transverse intensity distribution of a beam, from which width, position, ellipticity and M² can be derived. Camera-based profilers image a screen or the beam directly; scanning-slit profilers move a narrow slit through the beam. Either way, the instrument must be attenuated and the analysis method stated, because different width definitions give different numbers.",
    principle:
      "A camera profiler records the irradiance pattern on a sensor and computes moments of the distribution. The ISO 11146 second-moment width (D4σ) is the standard for Gaussian-like beams, while a Gaussian fit or a 1/e² width gives different values for non-ideal beams. A scanning-slit profiler convolves the beam with a narrow slit and reconstructs the profile from the transmitted power versus position.",
    specs: [
      spec("Type", "camera or scanning slit (typical)"),
      spec("Wavelength range", "350–1100 nm with a Si sensor"),
      spec("Beam width range", "tens of µm to several mm"),
      spec("Sensor resolution", "a few µm per pixel (typical)"),
      spec("Frame rate", "up to tens of Hz"),
      spec("Attenuation", "built-in or external ND filters"),
      spec("Analysis", "D4σ, Gaussian fit, 1/e²")
    ],
    alignment: [
      "Attenuate the beam so the peak pixel is well below saturation.",
      "Place the profiler at the plane of interest and check that the beam is centred on the sensor.",
      "Record the background frame with the beam blocked and subtract it.",
      "State the width definition and the fit residuals with every reported beam size."
    ],
    errors: [
      "Measuring a saturated or clipped beam and reporting its width.",
      "Comparing a D4σ width with a 1/e² width from another instrument.",
      "Ignoring the sensor's pixel response and windowing.",
      "Profiling a pulsed beam with a camera exposure that averages many pulses."
    ],
    applications: [
      "Beam width and divergence measurement",
      "M² characterization",
      "Fibre-coupling optimization",
      "Trap focus diagnostics"
    ],
    experiments: [
      "michelson-interferometer",
      "fourier-optics",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "inst-shutter",
    name: "Mechanical shutter",
    category: "Accessories",
    kind: "instrument",
    manufacturer: "Thorlabs",
    summary:
      "A mechanical shutter blocks and unblocks a beam under electronic control, defining exposure intervals and protecting a detector between measurements. It is a physical beam block with a timed actuator, not a modulator: its opening time is milliseconds and its repetition rate is limited. A shutter should fail closed and be interlocked with the source for safety.",
    principle:
      "A solenoid or stepper motor moves a blade or an iris across the beam. The controller accepts a TTL trigger and reports a sync pulse when the blade is fully open or closed. The blade transit time and the bounce at the end stop set the timing uncertainty, which matters when the shutter defines the start of an exposure.",
    specs: [
      spec("Aperture", "1–25 mm (typical)"),
      spec("Opening time", "5–50 ms (typical)"),
      spec("Actuation", "solenoid or stepper"),
      spec("Control", "TTL trigger, 5 V logic"),
      spec("Duty cycle", "limited by actuator heating"),
      spec("Fail state", "closed on power loss (verify)"),
      spec("Mounting", "SM1 or post")
    ],
    alignment: [
      "Place the shutter in a collimated section of the beam, not at a focus.",
      "Adjust the blade travel so it fully clears the beam when open and fully covers it when closed.",
      "Connect the sync output to the acquisition so exposure timing is recorded.",
      "Test the fail state by removing power and confirming that the beam is blocked."
    ],
    errors: [
      "Using the shutter as a fast modulator; its transit time is milliseconds.",
      "Placing it at a focus and burning the blade.",
      "Ignoring the delay between trigger and fully open.",
      "Assuming the shutter is failsafe without testing it."
    ],
    applications: [
      "Timed exposure control",
      "Detector protection between measurements",
      "Dark-count and background measurement",
      "Beam blocking under software control"
    ],
    experiments: [
      "polarization-3d-cinema",
      "fourier-optics",
      "optical-tweezers"
    ],
    docUrl: THORLABS_DOC,
    verification: "unverified",
    generic: true
  },
  {
    id: "inst-safety-glasses",
    name: "Laser safety eyewear (wavelength-specific)",
    category: "Accessories",
    kind: "instrument",
    manufacturer: "Generic (laser safety supplier)",
    summary:
      "Laser safety eyewear attenuates the specific wavelength and power of the source while transmitting enough visible light to work safely. It is wavelength-specific: a pair rated for 532 nm may be useless at 1064 nm, and the wrong pair can give a false sense of protection. Eyewear is the last line of defence, not a substitute for enclosures and beam blocks.",
    principle:
      "The filter contains absorbers or interference layers that block the laser wavelength while transmitting other visible wavelengths. The protection factor is expressed as an optical density at the specified wavelength, and the frame must also withstand the beam. Because the eye's aversion response is useless for invisible or intense light, the eyewear must be chosen from the source's wavelength and power, not from colour.",
    specs: [
      spec("Wavelength rating", "specific to the source, e.g. 632.8, 532 or 1064 nm"),
      spec("Optical density", "OD 3–7 at the rated wavelength"),
      spec("Visible transmission", "20–50% (typical)"),
      spec("Standard", "EN 207/208 or ANSI Z87.1 plus laser rating"),
      spec("Frame", "side shields, adjustable temples"),
      spec("Inspection", "check for cracks, scratches and label legibility"),
      spec("Limitation", "not a substitute for engineering controls")
    ],
    alignment: [
      "Read the label and confirm the wavelength and OD match the source before entering the lab.",
      "Inspect the lenses for cracks, pinholes and coating damage.",
      "Wear the eyewear whenever the beam is unenclosed, including during alignment.",
      "Replace eyewear after a direct hit or when the label is no longer legible."
    ],
    errors: [
      "Using 532 nm eyewear for a 1064 nm beam.",
      "Wearing scratched or damaged lenses that no longer meet the rated OD.",
      "Removing eyewear 'just to see the beam' during alignment.",
      "Relying on eyewear instead of enclosing the beam and using beam blocks."
    ],
    applications: [
      "Personal protection during alignment",
      "Class 3B/4 laser work",
      "Visitor protection",
      "Emergency response"
    ],
    experiments: ALL_EXPERIMENTS,
    verification: "unverified",
    generic: true
  }
];

/** The complete inventory, in seed order. */
export const HARDWARE_INVENTORY: HardwareItem[] = ITEMS;

/** Canonical category list for filters and index pages. */
export const HARDWARE_CATEGORIES: HardwareCategory[] = [
  "Mirrors",
  "Beam splitting",
  "Polarization",
  "Lenses & objectives",
  "Sources",
  "Detection",
  "Nonlinear optics",
  "Prisms & gratings",
  "Filters & apertures",
  "Fibre",
  "Mounts",
  "Positioning",
  "Structure",
  "Accessories"
];

/** O(1) lookup by canonical id. */
export const HARDWARE_BY_ID: Record<string, HardwareItem> = Object.fromEntries(
  HARDWARE_INVENTORY.map((item) => [item.id, item])
);

/** Grouped view used by the component library. */
export const HARDWARE_BY_CATEGORY: Record<HardwareCategory, HardwareItem[]> = (() => {
  const grouped = {} as Record<HardwareCategory, HardwareItem[]>;
  for (const category of HARDWARE_CATEGORIES) grouped[category] = [];
  for (const item of HARDWARE_INVENTORY) grouped[item.category].push(item);
  return grouped;
})();

export function getHardware(id: string): HardwareItem | undefined {
  return HARDWARE_BY_ID[id];
}

/**
 * Case-insensitive multi-term search over name, id, category, summary and
 * applications. All terms must match somewhere in the record. Optional
 * category and experiment filters are applied before scoring.
 */
export function searchHardware(
  query: string,
  category: HardwareCategory | "all" = "all",
  experiments?: string[]
): HardwareItem[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  const experimentFilter = experiments && experiments.length > 0 ? new Set(experiments) : null;

  const scored: { item: HardwareItem; score: number }[] = [];
  for (const item of HARDWARE_INVENTORY) {
    if (category !== "all" && item.category !== category) continue;
    if (experimentFilter && !item.experiments.some((slug) => experimentFilter.has(slug))) continue;

    const name = item.name.toLowerCase();
    const id = item.id.toLowerCase();
    const haystack = [
      name,
      id,
      item.category.toLowerCase(),
      item.summary.toLowerCase(),
      item.applications.join(" ").toLowerCase()
    ].join(" ");

    let score = 0;
    let matchesAllTerms = true;
    for (const term of terms) {
      if (!haystack.includes(term)) {
        matchesAllTerms = false;
        break;
      }
      if (name === term || id === term) score += 100;
      else if (name.startsWith(term) || id.startsWith(term)) score += 40;
      else if (name.includes(term)) score += 20;
      else if (id.includes(term)) score += 15;
      else score += 5;
    }
    if (!matchesAllTerms) continue;
    scored.push({ item, score });
  }

  if (terms.length > 0) {
    scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  }
  return scored.map((entry) => entry.item);
}

/** All inventory items that a given experiment may legitimately reference. */
export function hardwareForExperiment(slug: ExperimentSlug): HardwareItem[] {
  return HARDWARE_INVENTORY.filter((item) => item.experiments.includes(slug));
}

const HARDWARE_SEED_IDS = new Set(HARDWARE_SEEDS.map((seed) => seed.id));

export interface InventoryValidation {
  ok: boolean;
  total: number;
  seedCount: number;
  /** Seed ids with no inventory entry. */
  missing: string[];
  /** Inventory ids that are not in the seed list. */
  unknown: string[];
  /** Ids that appear more than once. */
  duplicates: string[];
  /** Categories that are not part of HardwareCategory. */
  unknownCategories: string[];
  /** Experiment slugs that are not in the canonical experiment registry. */
  unknownExperimentSlugs: string[];
}

/**
 * Structural self-check. Safe to call at runtime and from tests; it never
 * throws, so a content mistake cannot break a page render.
 *
 * Experiment coverage (≥ 5 items per experiment) is asserted in
 * `hardware.test.ts`, because it is an editorial target rather than a
 * structural invariant of the inventory.
 */
export function validateInventory(): InventoryValidation {
  const counts = new Map<string, number>();
  for (const item of HARDWARE_INVENTORY) {
    counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
  }

  const missing = HARDWARE_SEEDS.filter((seed) => !counts.has(seed.id)).map((seed) => seed.id);
  const unknown = [...counts.keys()].filter((id) => !HARDWARE_SEED_IDS.has(id));
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);

  const categorySet = new Set<string>(HARDWARE_CATEGORIES);
  const unknownCategories = [
    ...new Set(HARDWARE_INVENTORY.map((item) => item.category).filter((c) => !categorySet.has(c)))
  ];

  const experimentSet = new Set<string>(EXPERIMENT_SLUGS);
  const unknownExperimentSlugs = [
    ...new Set(
      HARDWARE_INVENTORY.flatMap((item) => item.experiments).filter((slug) => !experimentSet.has(slug))
    )
  ];

  return {
    ok:
      missing.length === 0 &&
      unknown.length === 0 &&
      duplicates.length === 0 &&
      unknownCategories.length === 0 &&
      unknownExperimentSlugs.length === 0,
    total: HARDWARE_INVENTORY.length,
    seedCount: HARDWARE_SEEDS.length,
    missing,
    unknown,
    duplicates,
    unknownCategories,
    unknownExperimentSlugs
  };
}

