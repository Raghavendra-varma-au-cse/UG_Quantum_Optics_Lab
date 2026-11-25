import type {
  ExperimentContent,
  Question,
  Reference
} from "@/lib/content/types";
import { getReference } from "@/lib/content/references";
import { SIMULATION_SPEC } from "./physics";

/**
 * CONTENT — Experiment 05, Polarization & 3D Cinema.
 *
 * Editorial rules for this module:
 *   • Every number quoted in an example is either derived in place or is a
 *     named material constant with its conditions stated.
 *   • No commercial projector, screen or eyewear specification is asserted.
 *     The cinema half is an optical demonstration of stereo separation.
 *   • The kit is recorded as unverified; the reader is told what to check.
 */

function cited(...ids: string[]): Reference[] {
  const out: Reference[] = [];
  for (const id of ids) {
    const reference = getReference(id);
    if (reference) out.push(reference);
  }
  return out;
}

const questions: Question[] = [
  {
    id: "q-malus-60",
    type: "mcq",
    difficulty: 1,
    topic: "Malus's law",
    prompt:
      "Unpolarized light passes through a polarizer and then through an analyser whose axis is 60° from the polarizer. Ignoring losses other than projection, what fraction of the light that left the polarizer reaches the detector?",
    options: ["100 %", "75 %", "50 %", "25 %"],
    answerIndex: 3,
    answer: "25 %.",
    explanation:
      "The first polarizer sets a linear state. The analyser transmits cos²60° = (1/2)² = 0.25 of that state. The first polarizer already discarded half of the originally unpolarized beam, so the overall fraction of the original beam is 12.5 %, but the question asks for the fraction after the polarizer.",
    marks: 2
  },
  {
    id: "q-hwp-45",
    type: "mcq",
    difficulty: 1,
    topic: "Wave plates",
    prompt: "A half-wave plate with its fast axis at 45° is placed in a horizontal (H) beam. The output is:",
    options: ["H", "V", "D (+45°)", "Circular"],
    answerIndex: 1,
    answer: "V (vertical).",
    explanation:
      "A half-wave plate reflects the linear state about its fast axis: an input at angle α emerges at 2θ − α. With θ = 45° and α = 0°, the output is at 90°, i.e. V. The Jones matrix at 45° is the exchange matrix [[0,1],[1,0]].",
    marks: 2
  },
  {
    id: "q-qwp-45",
    type: "mcq",
    difficulty: 1,
    topic: "Wave plates",
    prompt: "A quarter-wave plate with its fast axis at 45° is placed in an H beam. The output is:",
    options: ["Linear at 45°", "Linear at 90°", "Circular", "Unpolarized"],
    answerIndex: 2,
    answer: "Circular.",
    explanation:
      "The input has equal components along the fast (45°) and slow (135°) axes. The plate delays one by 90°, so the two components are equal in amplitude and a quarter-cycle apart in phase — the definition of circular polarization.",
    marks: 2
  },
  {
    id: "q-unpol-polarizer",
    type: "mcq",
    difficulty: 1,
    topic: "Polarizers",
    prompt: "An ideal linear polarizer is placed in a fully unpolarized beam. What fraction of the intensity is transmitted?",
    options: ["0 %", "25 %", "50 %", "100 %"],
    answerIndex: 2,
    answer: "50 %.",
    explanation:
      "Unpolarized light has no preferred azimuth. Projecting it onto one axis gives cos²θ averaged over θ, and the average of cos²θ over a full turn is 1/2. The transmitted light is fully polarized along the polarizer axis.",
    marks: 2
  },
  {
    id: "q-s3",
    type: "mcq",
    difficulty: 1,
    topic: "Stokes parameters",
    prompt: "Which state has S₃/S₀ = +1 in this module's convention?",
    options: ["H", "V", "D", "Right circular"],
    answerIndex: 3,
    answer: "Right circular.",
    explanation:
      "S₃ measures the circular content: S₃ = −2 Im(E_x E_y*). For [1, i]ᵀ/√2 this gives +1, which the module labels right circular. H and V have S₃ = 0; D has S₂ = 1.",
    marks: 2
  },
  {
    id: "q-why-circular",
    type: "mcq",
    difficulty: 2,
    topic: "3D cinema",
    prompt: "Why do passive cinema systems generally use circular rather than linear polarization?",
    options: [
      "Circular glasses are cheaper to manufacture",
      "Circular states are unchanged by rotation about the viewing axis, so head tilt does not cause leakage",
      "Circular light is brighter on a white screen",
      "Circular polarization removes the need for a special screen"
    ],
    answerIndex: 1,
    answer: "Head-tilt tolerance.",
    explanation:
      "A linear analyser rotated by β relative to a linear image transmits cos²β of it and leaks sin²β of the orthogonal image. A circular analyser's eigenstate lies on the S₃ axis, which is invariant under rotation about the beam, so tilting the head does not change the projection. Circular systems still need a polarization-preserving screen.",
    marks: 2
  },
  {
    id: "q-dop-pure",
    type: "mcq",
    difficulty: 1,
    topic: "Degree of polarization",
    prompt: "What is the degree of polarization of a pure elliptical state?",
    options: ["0", "0.5", "1", "It depends on the ellipticity"],
    answerIndex: 2,
    answer: "1.",
    explanation:
      "Every pure Jones state satisfies S₀² = S₁² + S₂² + S₃², so the normalized Stokes vector has unit length and DoP = 1. Ellipticity changes its position on the sphere, not the radius. Only unpolarized or partially polarized light lies inside the sphere.",
    marks: 2
  },
  {
    id: "q-jones-limit",
    type: "mcq",
    difficulty: 2,
    topic: "Jones calculus",
    prompt: "Which of these cannot be represented by a single Jones vector?",
    options: ["A pure elliptical state", "A partially polarized state", "A linear state at 17°", "A circular state"],
    answerIndex: 1,
    answer: "A partially polarized state.",
    explanation:
      "A Jones vector describes a fully coherent, fully polarized field. Partial polarization requires a statistical description — a coherency matrix, Stokes vector or Mueller matrix — because the phase relation between the components fluctuates.",
    marks: 2
  },
  {
    id: "q-brewster",
    type: "mcq",
    difficulty: 2,
    topic: "Brewster's angle",
    prompt: "For light incident from air on glass with n = 1.5, the Brewster angle is closest to:",
    options: ["33.7°", "41.8°", "56.3°", "63.4°"],
    answerIndex: 2,
    answer: "56.3°.",
    explanation:
      "tan θ_B = n₂/n₁ = 1.5, so θ_B = arctan 1.5 = 56.31°. At this angle the reflected p-component vanishes and the reflected beam is s-polarized.",
    marks: 2
  },
  {
    id: "q-er-40",
    type: "mcq",
    difficulty: 2,
    topic: "Extinction ratio",
    prompt: "An extinction ratio of 40 dB corresponds to a maximum-to-minimum transmission ratio of:",
    options: ["10²", "10³", "10⁴", "10⁶"],
    answerIndex: 2,
    answer: "10⁴.",
    explanation:
      "ER_dB = 10 log₁₀(I_max/I_min), so I_max/I_min = 10^(40/10) = 10⁴. In intensity terms the minimum is 10⁻⁴ of the maximum.",
    marks: 2
  },
  {
    id: "q-hwp-rotation",
    type: "mcq",
    difficulty: 2,
    topic: "Wave plates",
    prompt: "Rotating a half-wave plate by θ rotates the plane of linear polarization by:",
    options: ["θ", "2θ", "θ/2", "4θ"],
    answerIndex: 1,
    answer: "2θ.",
    explanation:
      "The plate reflects the linear state about its fast axis. If the axis moves by θ, the reflected direction moves by 2θ. This is why 22.5° between crossed polarizers rotates H to D and recovers 50 % transmission.",
    marks: 2
  },
  {
    id: "q-polarizer-matrix",
    type: "mcq",
    difficulty: 2,
    topic: "Jones calculus",
    prompt: "The Jones matrix of an ideal linear polarizer is:",
    options: [
      "Unitary and Hermitian",
      "Hermitian and idempotent",
      "Anti-Hermitian and unitary",
      "Orthogonal with determinant −1"
    ],
    answerIndex: 1,
    answer: "Hermitian and idempotent.",
    explanation:
      "P(θ) is a projector: P† = P and P² = P. It is singular (determinant 0), so it is not unitary; applying the same polarizer twice gives the same state as applying it once. Its eigenvalues are 1 and 0.",
    marks: 3
  },
  {
    id: "q-s2-measure",
    type: "mcq",
    difficulty: 2,
    topic: "Stokes parameters",
    prompt: "Which pair of measurements isolates S₂?",
    options: [
      "Analysers at 0° and 90°",
      "Analysers at 45° and 135°",
      "Right- and left-circular analysers",
      "A single analyser at 0°"
    ],
    answerIndex: 1,
    answer: "45° and 135°.",
    explanation:
      "S₂ = I₄₅ − I₁₃₅. The 0°/90° pair gives S₀ and S₁; the circular pair gives S₃. All four measurements plus S₀ are needed for a complete Stokes vector, with S₀ also available as I₀ + I₉₀.",
    marks: 2
  },
  {
    id: "q-screen-purpose",
    type: "mcq",
    difficulty: 2,
    topic: "3D cinema",
    prompt: "The main optical job of a silver cinema screen in a passive stereo system is to:",
    options: [
      "Increase overall brightness by 4×",
      "Preserve the polarization state of the projected light",
      "Absorb the ghost image",
      "Convert linear polarization into circular polarization"
    ],
    answerIndex: 1,
    answer: "Preserve polarization.",
    explanation:
      "A conventional matte screen scatters light through multiple random events, which scrambles the polarization. A metallized (silver) screen is more specular and retains the incident state, at the cost of a narrower viewing cone and a brighter hotspot. The quarter-wave conversion happens at the projector and in the glasses, not at the screen.",
    marks: 2
  },

  {
    id: "n-quartz-thickness",
    type: "numerical",
    difficulty: 2,
    topic: "Birefringence",
    prompt:
      "Crystal quartz has Δn = 0.0090 at 589 nm. What thickness gives a quarter-wave retardance at that wavelength? Give the answer in micrometres.",
    answer:
      "d = λ/(4Δn) = 589 nm/(4 × 0.0090) = 16.4 µm.",
    explanation:
      "Use δ = 2πΔnd/λ with δ = π/2, so d = λ/(4Δn). Real plates are usually zero-order (two plates crossed to cancel the multi-order retardance) because a 16 µm free-standing plate is fragile and temperature-sensitive.",
    numeric: { value: 16.4, tolerance: 0.5, unit: "µm" },
    marks: 3
  },
  {
    id: "n-malus-5mw",
    type: "numerical",
    difficulty: 1,
    topic: "Malus's law",
    prompt: "A 5.00 mW linearly polarized beam passes through an analyser at 30.0° to its polarization. What power emerges?",
    answer: "P = 5.00 mW × cos²30° = 5.00 × 0.750 = 3.75 mW.",
    explanation:
      "Malus's law applies to the polarized beam; the first polarizer is already accounted for in the 5.00 mW. No other losses are stated.",
    numeric: { value: 3.75, tolerance: 0.03, unit: "mW" },
    marks: 2
  },
  {
    id: "n-er-db",
    type: "numerical",
    difficulty: 1,
    topic: "Extinction ratio",
    prompt:
      "With crossed polarizers the detector reads 0.80 µW; with parallel polarizers it reads 800 µW. What is the extinction ratio in dB?",
    answer: "ER = 10 log₁₀(800/0.80) = 10 log₁₀(1000) = 30.0 dB.",
    explanation:
      "Both readings must be dark-offset corrected and taken with the same beam and detector gain. A 30 dB ratio means the minimum is 10⁻³ of the maximum.",
    numeric: { value: 30, tolerance: 0.2, unit: "dB" },
    marks: 2
  },
  {
    id: "n-stokes-dop",
    type: "numerical",
    difficulty: 3,
    topic: "Stokes parameters",
    prompt:
      "Six analyser measurements give I₀ = 1.00, I₉₀ = 0.20, I₄₅ = 0.60, I₁₃₅ = 0.60, I_R = 0.50, I_L = 0.70 (arbitrary units). Compute S₀…S₃ and the degree of polarization.",
    answer:
      "S₀ = 1.20, S₁ = 0.80, S₂ = 0, S₃ = −0.20; DoP = √(0.80² + 0² + 0.20²)/1.20 = 0.825/1.20 = 0.688.",
    explanation:
      "The state is mostly linear along x with a small left-circular component. DoP below 1 means the beam is partially polarized, so a Jones vector alone is insufficient. Its azimuth is ½ atan2(0, 0.80) = 0° and its ellipticity is ½ asin(−0.20/1.20) = −4.8°.",
    numeric: { value: 0.688, tolerance: 0.01, unit: "" },
    marks: 4
  },
  {
    id: "n-retardance-transmission",
    type: "numerical",
    difficulty: 3,
    topic: "Retardance",
    prompt:
      "A wave plate at 45° between crossed polarizers transmits 25.0 % of the parallel-polarizer intensity. What retardance does this imply, in degrees?",
    answer: "δ = 2 arcsin(√0.25) = 2 × 30° = 60°.",
    explanation:
      "For a plate at 45° between crossed polarizers, T = sin²(δ/2). T = 0.25 gives δ/2 = 30°, so δ = 60° = λ/6. The sign of the retardance is not determined by an intensity measurement.",
    numeric: { value: 60, tolerance: 1, unit: "°" },
    marks: 4
  },
  {
    id: "n-crosstalk",
    type: "numerical",
    difficulty: 2,
    topic: "3D cinema",
    prompt:
      "In one eye, the wanted image arrives with intensity 0.99 and the opposite image leaks in with 0.01. Compute the crosstalk percentage and the contrast ratio.",
    answer: "XT = 0.01/(0.99 + 0.01) = 1.0 %; C = 0.99/0.01 = 99.",
    explanation:
      "Crosstalk is the leaked fraction of the total light in that eye; contrast is the wanted-to-leak ratio. A 1 % crosstalk corresponds to about 20 dB of channel contrast, which is a useful way to compare an optical measurement with a quoted extinction ratio.",
    numeric: { value: 1.0, tolerance: 0.05, unit: "%" },
    marks: 3
  },
  {
    id: "n-brewster",
    type: "numerical",
    difficulty: 1,
    topic: "Brewster's angle",
    prompt: "Light in air strikes a dielectric with refractive index 1.52. At what angle is the reflected p-component zero?",
    answer: "θ_B = arctan(1.52/1.00) = 56.7°.",
    explanation:
      "At Brewster incidence the reflected and refracted rays are perpendicular, so the induced dipole in the medium cannot radiate the p-component back into the incident medium. The reflected beam is s-polarized.",
    numeric: { value: 56.7, tolerance: 0.2, unit: "°" },
    marks: 2
  },

  {
    id: "s-transverse",
    type: "short",
    difficulty: 1,
    topic: "Electromagnetic waves",
    prompt: "Why does an ideal plane wave in vacuum have no longitudinal electric-field component?",
    answer:
      "For a plane wave E = E₀ exp[i(k·r − ωt)], the source-free Gauss law ∇·E = 0 requires k·E₀ = 0. The field is therefore orthogonal to the propagation direction, leaving only two independent transverse components. A tightly focused beam or a waveguide mode can have a longitudinal component, but that is not a plane wave.",
    explanation:
      "The same condition makes the wave transverse for B as well, and fixes B = (1/c) k̂ × E. The two transverse directions are the two-dimensional space in which polarization lives.",
    marks: 3
  },
  {
    id: "s-pol-vs-retarder",
    type: "short",
    difficulty: 1,
    topic: "Polarizers",
    prompt: "State the essential difference between a polarizer and a retarder in terms of what happens to the Jones vector and to the intensity.",
    answer:
      "A polarizer is a projector: it removes one component, reduces the intensity in general and changes the degree of polarization of a mixture. A retarder is unitary: it changes the relative phase of the two components, preserves the total intensity and preserves the degree of polarization. A retarder alone is invisible to a power meter unless an analyser follows it.",
    explanation:
      "In matrix terms P² = P and P† = P for a polarizer; W†W = 1 for a lossless retarder. The polarizer has eigenvalues 1 and 0; the retarder has eigenvalues of unit modulus.",
    marks: 3
  },
  {
    id: "s-global-phase",
    type: "short",
    difficulty: 1,
    topic: "Jones calculus",
    prompt: "Why can a Jones vector be multiplied by e^{iα} without changing any measurable quantity?",
    answer:
      "The common phase is not a relative phase. Intensity depends on |E_x|² + |E_y|², and every Stokes parameter depends on quadratic products in which the common factor cancels. Only the phase difference φ_y − φ_x changes the ellipse.",
    explanation:
      "This is why the Jones vector is normalized and why matrix results are quoted up to a global phase. It is also why a Mach–Zehnder phase shift is observable but a common phase plate is not.",
    marks: 2
  },
  {
    id: "s-analyzer-measure",
    type: "short",
    difficulty: 2,
    topic: "Stokes parameters",
    prompt: "What does a linear analyser at 45° measure for a general partially polarized beam?",
    answer:
      "It measures the 45° linear projection: I₄₅ = ½(S₀ + S₂). For a pure linear state at azimuth θ this reduces to I₀ cos²(45° − θ). It does not measure the circular content, so it cannot distinguish right from left circular light.",
    explanation:
      "The general analyser law is I(φ) = ½(S₀ + S₁cos2φ + S₂sin2φ). The missing S₃ term is exactly why a circular analyser is needed for a complete Stokes measurement.",
    marks: 3
  },
  {
    id: "s-unpol-jones",
    type: "short",
    difficulty: 2,
    topic: "Degree of polarization",
    prompt: "Why is a single Jones vector unable to describe unpolarized light?",
    answer:
      "A Jones vector presupposes a definite phase relation between the two components, so it always describes a pure state with DoP = 1. Unpolarized light has a phase relation that fluctuates faster than the measurement, so it must be described statistically — by a coherency matrix or a Stokes vector with zero polarization part.",
    explanation:
      "A mixture cannot be written as one coherent superposition: the relative phase is not a fixed number. This is the same reason a density matrix is needed for a mixed qubit.",
    marks: 3
  },
  {
    id: "s-poincare-axes",
    type: "short",
    difficulty: 2,
    topic: "Poincaré sphere",
    prompt: "What do the three axes of the Poincaré sphere represent, and where do linear, circular and unpolarized states sit?",
    answer:
      "S₁ is the H-versus-V linear difference, S₂ the +45°-versus-−45° difference, and S₃ the circular handedness difference. Linear states lie on the equator (S₃ = 0), circular states at the poles, and unpolarized light at the centre. Partial polarization lies inside the sphere at radius equal to the DoP.",
    explanation:
      "Longitude is twice the azimuth (2ψ) and latitude is twice the ellipticity angle (2χ). Antipodal points are orthogonal states.",
    marks: 3
  },
  {
    id: "s-hwp-double",
    type: "short",
    difficulty: 2,
    topic: "Wave plates",
    prompt: "Why does rotating a half-wave plate by θ rotate the transmitted linear polarization by 2θ?",
    answer:
      "The plate reflects the linear state about its fast axis. If the fast axis moves by θ, the mirror line moves by θ and the reflected direction moves by 2θ. Equivalently, the output azimuth is 2θ − α for input azimuth α.",
    explanation:
      "At θ = 45° the reflection sends H to V; at θ = 22.5° it sends H to D. The factor of two is the reason a half-wave plate is so useful for building a switch between two orthogonal states.",
    marks: 3
  },
  {
    id: "s-stress",
    type: "short",
    difficulty: 2,
    topic: "Stress birefringence",
    prompt: "How does a polariscope make mechanical stress visible?",
    answer:
      "Stress induces a birefringence Δn = Cσ, so the sample becomes a retarder with δ = 2πCσd/λ. Between crossed polarizers the transmission is sin²(2θ)sin²(δ/2): regions whose principal axes are at 45° to the polarizers brighten, and the brightness maps the retardance. White light turns the retardance map into colour fringes.",
    explanation:
      "Rotating the sample separates isoclinics (directions of principal stress) from isochromatics (loci of constant retardance). The method is used in photoelasticity and in checking glass parts for residual stress.",
    marks: 4
  },
  {
    id: "s-silver",
    type: "short",
    difficulty: 2,
    topic: "3D cinema",
    prompt: "Why can a passive polarization cinema not use an ordinary matte white screen?",
    answer:
      "A matte screen scatters light through multiple random events inside a diffuse coating. Each scattering event can change the polarization, so the two orthogonal channels are mixed and both eyes receive both images. A metallized screen is more specular and preserves the incident polarization, at the cost of a narrower viewing cone and a brighter hotspot.",
    explanation:
      "The screen is an optical element in the channel budget, not a passive backdrop. Its depolarization adds a floor to crosstalk that no glasses can remove.",
    marks: 3
  },
  {
    id: "s-cd",
    type: "short",
    difficulty: 3,
    topic: "Optical activity",
    prompt: "Distinguish optical rotation from circular dichroism.",
    answer:
      "Optical rotation comes from circular birefringence: left and right circular components acquire different phases, so a linear input emerges linear but rotated. Circular dichroism comes from differential absorption: the two circular components acquire different amplitudes, so a linear input emerges elliptical. A chiral medium generally shows both, with the two effects related by dispersion relations.",
    explanation:
      "A rotator changes azimuth only; a circular dichroism changes ellipticity. Both are described by a complex rotation angle whose real part is rotation and imaginary part is ellipticity.",
    marks: 4
  },
  {
    id: "q-long-circular",
    type: "long",
    difficulty: 3,
    topic: "3D cinema",
    prompt:
      "A venue proposes replacing circular-polarization glasses with cheaper linear glasses. Using the channel model, give a quantitative argument for and against the change, and state what else would have to be true for linear to work.",
    answer:
      "Take a 30 dB analyser (ε = 10⁻³) and 2 % screen depolarization. At zero tilt both technologies give about 1.1 % crosstalk, so linear is not inherently worse. But at 30° of head tilt the linear wanted projection falls to cos²30° = 0.75 and the orthogonal leakage rises to sin²30° = 0.25, giving about 25.5 % crosstalk and a contrast near 3 — a conspicuous ghost. Circular stays at the 1.1 % floor for every tilt. Linear could be acceptable only if viewers keep their heads within roughly 10° of upright (about 4 % crosstalk) and if the seating and screen geometry keep the analyser axes aligned; that is not realistic across a large auditorium. The cost saving on glasses would be offset by a worse and posture-dependent experience.",
    explanation:
      "The argument is not that circular light is 'better light'; it is that the circular analyser eigenstate is invariant under rotation about the viewing axis. The residual floor is set by extinction, screen depolarization and scatter, not by the encoding.",
    marks: 6
  },
  {
    id: "q-long-jones-mueller",
    type: "long",
    difficulty: 3,
    topic: "Mueller calculus",
    prompt:
      "When should you use Jones calculus and when Mueller calculus? Illustrate each with a measurement from this experiment.",
    answer:
      "Jones calculus applies to fully polarized, coherent light and ideal or lossy-but-non-depolarizing elements: it is the natural tool for the bench chain (polarizer, wave plate, analyser) and gives the phase and the output Jones vector directly. Mueller calculus applies when the beam is partially polarized or an element depolarizes: the cinema screen, a real analyser with finite extinction, and a Stokes polarimeter are examples. Mueller matrices are 4×4 real and act on Stokes vectors; they cannot recover the absolute phase, and a Jones matrix cannot represent a depolarizing screen. For pure states and non-depolarizing elements the two descriptions agree.",
    explanation:
      "The cinema channel model is a Mueller-type calculation in disguise: each lens is a partial analyser and the screen scales the polarized part. The bench is a Jones calculation because every element is unitary or a projector on a pure state.",
    marks: 6
  },

  {
    id: "v-leak",
    type: "viva",
    difficulty: 2,
    topic: "Metrology",
    prompt:
      "Your crossed polarizers read 0.30 % of the parallel transmission. A visitor asks whether that is the extinction ratio of the polarizers. How do you answer?",
    answer:
      "It is the extinction ratio of the whole measurement, not necessarily of the polarizer pair. The reading includes stray light, detector dark offset, light leaking around the mounts, beam convergence, residual birefringence in the mounts, and any sample in the beam. To isolate the pair, shield the detector, subtract the dark reading, use a well-collimated beam, remove everything else from the train, and check that the result is independent of beam power. Only then can the number be attributed to the polarizers at that wavelength.",
    explanation:
      "A null measurement is exquisitely sensitive to additive backgrounds. The correct procedure is to demonstrate that the background is negligible, not to assume it.",
    marks: 4
  },
  {
    id: "v-four-extinctions",
    type: "viva",
    difficulty: 3,
    topic: "Stress birefringence",
    prompt:
      "A stressed sample between crossed polarizers goes dark four times in a full 360° rotation. Explain the count and what it tells you.",
    answer:
      "The transmission is proportional to sin²(2θ), which vanishes whenever the sample's principal axis is parallel to either polarizer — four orientations per full turn (every 90°). The dark orientations are the isoclinics and reveal the principal stress directions. The brightness between them depends on the retardance, so a separate measurement at 45° gives δ. If the sample were optically isotropic, it would stay dark at every angle.",
    explanation:
      "sin²(2θ) has period 90° in θ, so four zeros per 360°. The intensity has period 90° in the sample angle, not 180°, because the sample's principal axes are undirected lines.",
    marks: 4
  },
  {
    id: "v-hwp-language",
    type: "viva",
    difficulty: 2,
    topic: "Wave plates",
    prompt:
      "A student writes that the half-wave plate 'rotates the plane of polarization'. Correct the statement precisely.",
    answer:
      "The plate does not rotate anything in the sense of a rotator. It delays one principal component by π relative to the other. For a linear input the result happens to be linear at the reflected azimuth 2θ − α; for circular input the handedness flips; for elliptical input the ellipse is reflected about the fast axis. The mechanism is differential phase, not a rotation of the field.",
    explanation:
      "A true rotator (optical activity) rotates every state's azimuth without changing ellipticity. A half-wave plate generally changes ellipticity except for special inputs.",
    marks: 4
  },
  {
    id: "v-circular-50",
    type: "viva",
    difficulty: 2,
    topic: "Polarization states",
    prompt: "Why does a rotating linear analyser read a constant 50 % for circular light, whatever its angle?",
    answer:
      "Circular light has equal amplitudes along any two orthogonal linear axes, with a fixed ±90° phase between them. The projection onto any linear axis therefore has squared amplitude ½ of the total, independent of the axis angle. The analyser cannot distinguish the handedness because it responds only to the linear projection; a quarter-wave plate plus analyser is needed for that.",
    explanation:
      "For a normalized circular state S₁ = S₂ = 0, so I(φ) = ½S₀ for every φ. The flat response is the signature of circular (or unpolarized) light on a linear analyser; the two are distinguished by a circular analyser or by a retarder scan.",
    marks: 3
  },
  {
    id: "v-off-axis",
    type: "viva",
    difficulty: 3,
    topic: "3D cinema",
    prompt:
      "A circular-polarization installation ghosts more at the edge of the auditorium than in the centre. Is the circular encoding failing?",
    answer:
      "Not necessarily. The head-tilt invariance is exact only for rotation about the beam. At an oblique viewing angle the screen reflection changes the polarization, the quarter-wave retardance is angle-dependent, and the glasses are designed for near-normal incidence. Screen gain and depolarization also vary with angle. All of these raise crosstalk without a head tilt. The remedy is a screen and glasses designed for the viewing geometry, not a switch to linear.",
    explanation:
      "The model in this experiment assumes normal incidence and a single depolarization scalar. A real auditorium violates both, which is why installations are measured at several seats.",
    marks: 4
  },

  {
    id: "d-malus",
    type: "derivation",
    difficulty: 2,
    topic: "Malus's law",
    prompt: "Derive Malus's law from the projection of a linear field onto the analyser axis, stating each assumption.",
    answer:
      "Write the input as E_in = E₀ û_in. An ideal analyser transmits only the component along û_a: E_out = (E_in·û_a)û_a = E₀ cosθ û_a, where θ is the angle between the two unit vectors. Intensity is proportional to |E_out|², so I = I₀ cos²θ with I₀ ∝ E₀². Assumptions: ideal analyser, linear input, normal incidence, no absorption of the transmitted component. For unpolarized input, average cos²θ over θ to get the 50 % factor of the first polarizer.",
    explanation:
      "The derivation is one line of vector algebra; the physics is in the projection. The same result follows from the Jones projector P(θ).",
    marks: 5
  },
  {
    id: "d-waveplate",
    type: "derivation",
    difficulty: 3,
    topic: "Wave plates",
    prompt: "Derive the Jones matrix of a retarder and show that a quarter-wave plate at 45° turns H into circular light.",
    answer:
      "In the plate frame the fast axis has phase 0 and the slow axis phase δ, so W_frame = diag(1, e^{iδ}). Rotate into the frame with R(−θ), apply W_frame, and rotate back: W(θ,δ) = R(θ) diag(1,e^{iδ}) R(−θ). At θ = 45°, δ = π/2, W = ½[[1+i, 1−i],[1−i, 1+i]]. Applied to H = [1,0]ᵀ it gives [(1+i)/2, (1−i)/2]ᵀ. The two components have equal magnitude 1/√2 and a 90° relative phase, so S₁ = S₂ = 0 and |S₃| = 1: circular. The sign of S₃ gives the handedness.",
    explanation:
      "The matrix is unitary for real δ, so the intensity is unchanged. The global phase is chosen so the fast component is real.",
    marks: 6
  },
  {
    id: "d-stokes-poincare",
    type: "derivation",
    difficulty: 3,
    topic: "Stokes parameters",
    prompt: "Show that a pure state maps to the surface of the Poincaré sphere and that orthogonal states are antipodal.",
    answer:
      "For a pure Jones vector, S₀² = (|E_x|²+|E_y|²)² and S₁²+S₂²+S₃² = (|E_x|²−|E_y|²)² + 4|E_xE_y|² = (|E_x|²+|E_y|²)², using |E_xE_y*|² = |E_x|²|E_y|². Hence the normalized vector has unit length. Writing S₁/S₀ = cos2χcos2ψ, S₂/S₀ = cos2χsin2ψ, S₃/S₀ = sin2χ gives the angles. For two pure states, |⟨a|b⟩|² = ½(1 + ŝ_a·ŝ_b); orthogonality makes the inner product zero, so ŝ_a·ŝ_b = −1, i.e. antipodal points.",
    explanation:
      "Partial polarization reduces the radius to the degree of polarization, so mixed states lie inside the sphere. The mapping is a bijection between normalized Stokes vectors and (ψ, χ) up to the sphere's geometry.",
    marks: 6
  },
  {
    id: "d-cinema",
    type: "derivation",
    difficulty: 3,
    topic: "3D cinema",
    prompt:
      "Derive the crosstalk of a linear stereo channel with analyser extinction ε and head tilt β, and show that the circular channel has no β dependence.",
    answer:
      "Model the lens as T = ½[(1+ε) + (1−ε)ŝ·â]. For linear light the left image is at +45° and the left analyser at +45°+β, so ŝ·â = cos2β. The wanted and leaked intensities are I_want = ½[(1+ε)+(1−ε)cos2β] and I_leak = ½[(1+ε)−(1−ε)cos2β]. Hence XT = I_leak/(I_want+I_leak) = [(1+ε)−(1−ε)cos2β]/[(1+ε)+(1−ε)cos2β]. For circular light both ŝ and â lie on the S₃ axis, so ŝ·â = ±1 for every β; the crosstalk reduces to ε/(1+ε) at zero screen depolarization and is independent of tilt. Including screen depolarization p scales the dot product by (1−p) and adds the floor ½(1−ε)p to the leakage.",
    explanation:
      "The tilt enters only through the projection of two equatorial vectors: the image state is fixed on the screen while the analyser rotates with the head, so their dot product changes for linear states but not for circular ones.",
    marks: 6
  },

  {
    id: "t-no-extinction",
    type: "troubleshooting",
    difficulty: 2,
    topic: "Troubleshooting",
    prompt:
      "Rotating the analyser produces no deep minimum at any angle. List the likely causes in the order you would check them.",
    answer:
      "First confirm the source is actually linearly polarized: with only the first polarizer, rotate it and see whether the power changes. If it does not, the source may be unpolarized, circular, or depolarized by a fibre. Next check that the beam passes through both polarizers and that neither is rotated out or missing. Then look for stray light and detector saturation, both of which put a floor under the null. Finally check for a retarder or stressed window between the polarizers, and for beam wander that changes the collected power as the mount turns.",
    explanation:
      "A missing null is a background problem more often than a polarizer problem. Isolating each element one at a time is faster than adjusting the analyser.",
    marks: 4
  },
  {
    id: "t-drift",
    type: "troubleshooting",
    difficulty: 2,
    topic: "Troubleshooting",
    prompt:
      "The transmitted power drifts by several per cent during a Malus scan, enough to spoil the fit. What do you do?",
    answer:
      "Let the laser warm up to thermal equilibrium first. Shorten the scan and repeat the 0° point at the end to quantify the drift. Normalise each point to a monitor detector that sees a fixed pick-off, or scan quickly and average several passes. Check that air currents or a fan are not moving the beam, that the detector is not heating, and that a fibre is not changing its polarization. If the drift is monotonic with time, it is thermal; if it is erratic, it is mechanical or airflow.",
    explanation:
      "Normalising to a monitor turns a multiplicative drift into a common factor and preserves the shape of the curve. Do not fit a drifting scan and call the residual noise.",
    marks: 4
  },
  {
    id: "t-qwp",
    type: "troubleshooting",
    difficulty: 3,
    topic: "Troubleshooting",
    prompt:
      "A quarter-wave plate at 45° gives an analyser modulation of 15 % peak-to-peak instead of the expected flat response. What could be wrong?",
    answer:
      "The plate may not be quarter-wave at the source wavelength, the angle may be off 45°, the input may not be clean linear light, or there may be additional birefringence between the plate and the analyser. Check the plate label and, if possible, repeat at its design wavelength; scan the plate angle finely around 45°; verify the input with a rotating analyser before inserting the plate; and remove or rotate any window or mount that could be stressed. A detector with polarization sensitivity also produces a residual modulation.",
    explanation:
      "The residual modulation is cos²(2χ) of the output: 15 % peak-to-peak corresponds to an ellipticity well away from 45°. The sign of the modulation tells you which side of 45° you are on.",
    marks: 5
  },
  {
    id: "t-ghosting",
    type: "troubleshooting",
    difficulty: 3,
    topic: "3D cinema",
    prompt:
      "The measured stereo crosstalk is much worse than the model prediction from the glasses' extinction ratio. Give four plausible causes and a test for each.",
    answer:
      "1) The screen is not polarization-preserving: repeat on the metallized screen and compare; a matte screen should push crosstalk towards 50 %. 2) The glasses are mismatched or one lens is reversed: measure each lens separately and check that the marked left lens passes the left channel. 3) The projector channels are not truly orthogonal: insert an analyser in front of each projector and measure the leakage. 4) Ambient light or scatter is reaching the eye: block the projectors and measure the background. Off-axis viewing and a wavelength-mismatched quarter-wave plate are further causes, tested by moving the detector across the screen.",
    explanation:
      "Crosstalk is a budget, not a single number. Measuring one channel at a time separates projector leakage, screen depolarization, glasses leakage and ambient background.",
    marks: 5
  },
  {
    id: "t-linear-tilt",
    type: "troubleshooting",
    difficulty: 2,
    topic: "3D cinema",
    prompt:
      "Linear glasses give a clean image upright but a strong ghost when the viewer tilts their head 30°. Is the setup faulty?",
    answer:
      "No, this is the expected behaviour. A 30° tilt changes the angle between the image polarization and the analyser by 30°, so the wanted projection falls to cos²30° = 75 % and the orthogonal channel leaks 25 %. That is a conspicuous ghost. The remedy is circular polarization, not an adjustment of the linear system; no amount of alignment can make a fixed linear analyser follow a rotating head.",
    explanation:
      "The only way to keep linear separation under head tilt is to rotate the projector polarization with the viewer, which is impractical. Circular encoding solves the geometry by making the analyser eigenstate rotation-invariant.",
    marks: 4
  },

  {
    id: "i-detector",
    type: "instrumentation",
    difficulty: 2,
    topic: "Instrumentation",
    prompt: "Why is a photodiode with a transimpedance amplifier preferred to a camera for a Malus scan?",
    answer:
      "A photodiode averages over its area and gives a linear, fast, calibrated intensity signal with a known gain. A camera is spatially informative but its response may be gamma-encoded, it can saturate per pixel, and its automatic exposure can change between frames. For a scan of total transmitted power, the photodiode is the right instrument; the camera is used when the spatial fringe pattern itself is the measurement.",
    explanation:
      "Linearity is the key property: Malus's law is a statement about relative intensities, and a nonlinear detector distorts the curve. Always check the dark offset and the saturation level.",
    marks: 4
  },
  {
    id: "i-zero",
    type: "instrumentation",
    difficulty: 2,
    topic: "Instrumentation",
    prompt: "How do you establish a reliable angular zero for a rotation mount?",
    answer:
      "Use a physical null rather than the engraved scale. Cross the polarizers and refine the analyser angle from both directions until the reading is minimum; average the two readings to cancel backlash. Record that scale value as the crossed position. Then define the parallel position 90° away and verify it by rotating back. For a wave plate, use the extinction of a known linear state or the flat response of a circular analyser to locate 45°.",
    explanation:
      "The scale is a convenience, not a calibration. Backlash and a zero offset of a degree or two are common and directly bias a Malus fit.",
    marks: 4
  },
  {
    id: "i-order",
    type: "instrumentation",
    difficulty: 3,
    topic: "Instrumentation",
    prompt: "What is the practical difference between a zero-order and a multi-order wave plate, and which would you choose for a wavelength-scanning experiment?",
    answer:
      "A zero-order plate has a retardance below one wave, usually made by cementing two plates whose retardances cancel to a small residual. A multi-order plate relies on a large path difference, so its retardance changes rapidly with wavelength, temperature and incidence angle. For wavelength scanning or broad-spectrum work, choose zero-order (or a true zero-order single plate if available); a multi-order plate is only correct near its design wavelength.",
    explanation:
      "The sensitivity is proportional to the order m: δ = 2π(m + f), and a small fractional change in Δn or λ moves a high-order plate through many fringes. Zero-order plates are thinner in retardance, not necessarily in physical thickness.",
    marks: 4
  },
  {
    id: "i-circular",
    type: "instrumentation",
    difficulty: 2,
    topic: "Instrumentation",
    prompt: "Describe how to generate circular polarization and how to verify it with the equipment on this bench.",
    answer:
      "Put a linear polarizer first, then a quarter-wave plate with its fast axis at 45° to the polarizer. Verify with a rotating linear analyser: the transmitted intensity should be nearly constant at half the input. Then build a circular analyser (another quarter-wave plate at 45° followed by a linear polarizer) and check that one orientation transmits strongly and the orthogonal orientation extinguishes. The extinction direction identifies the handedness.",
    explanation:
      "The flat response alone cannot distinguish circular from unpolarized light; the circular analyser is what proves the state is pure and which handedness it has.",
    marks: 5
  },
  {
    id: "pol-x-extinction-dark",
    type: "short",
    difficulty: 2,
    topic: "Metrology",
    prompt:
      "Outline how you measure the extinction ratio of a polarizer pair and how you separate genuine leakage from an additive background.",
    answer:
      "Record the dark reading with the beam blocked, then measure the parallel maximum and the crossed minimum with the same gain and a shielded, aperture-limited detector. Subtract the dark reading from both extrema before forming the ratio, and compute ER = 10 log₁₀(I_max/I_min). Approach the minimum from both directions and average to reduce mount backlash. Repeat at half power with a neutral-density filter: if the ratio changes, the detector is nonlinear or a background is present. Measure the ambient level with the laser blocked but the room lights on. For example, a raw null of 0.80 µW with a 0.50 µW dark offset is really 0.30 µW; with a 800 µW maximum the ratio changes from an apparent 30.0 dB to 34.3 dB.",
    explanation:
      "Extinction is a ratio of two small, background-prone numbers. The dark offset and stray light add to the minimum and compress the ratio, so they must be removed before the logarithm. A result that depends on beam power or room lighting is not yet an extinction ratio of the polarizers.",
    marks: 5
  },
  {
    id: "pol-x-backlash",
    type: "short",
    difficulty: 2,
    topic: "Instrumentation",
    prompt:
      "The same analyser null reads 89.6° when approached clockwise and 91.1° when approached anticlockwise. What is happening, how large is the angular uncertainty, and how should the scan be taken?",
    answer:
      "The mount has backlash or hysteresis: the scale and the optic do not return to the same relative position when the direction of rotation reverses. The null lies between the two readings; the midpoint is 90.35° and the half-width is about 0.75°. Take every point while approaching from the same direction, or average clockwise and anticlockwise readings at each setting. Fit the angular offset θ₀ as a free parameter rather than trusting the engraving, and check that the beam stays centred so the null is not a beam-walk artefact. Near 45° from the null, a 0.75° error changes cos² by roughly 1.3 % of the maximum, which is larger than a good detector's noise.",
    explanation:
      "Backlash is a mechanical dead band, not a polarization effect. Its signature is a null position that depends on the direction of approach. Consistent approach direction plus a fitted offset removes the bias; simply averaging the two extrema without recording the direction hides the problem.",
    marks: 4
  },
  {
    id: "pol-x-handcheck",
    type: "short",
    difficulty: 2,
    topic: "Wave plates",
    prompt:
      "You have one linear polarizer and one quarter-wave plate, but no second wave plate. Can you determine the handedness of the circular light you generate? Explain what you can and cannot conclude, and what happens if you flip the plate.",
    answer:
      "Put the polarizer first and the quarter-wave plate at 45° to its axis. A rotating linear analyser then reads a nearly constant intensity, which shows that the state is circular or unpolarized; it does not distinguish the two, and it cannot distinguish right from left because a linear analyser responds only to the linear projection. Determining handedness requires a circular analyser — a second quarter-wave plate at 45° followed by a linear polarizer, or a known reference state — because only then do the two handednesses give different transmissions. Turning the plate face-to-face (about an in-plane axis) mirrors its principal axes in the transverse plane, so the same input produces the opposite handedness; rotating it about the beam axis does not. Label the input face and keep the orientation fixed.",
    explanation:
      "The flat analyser response is necessary but not sufficient for circular polarization. The handedness is the sign of S₃, and a linear analyser is blind to S₃. One wave plate can create a circular state but cannot, by itself, certify which circular state it is. Flipping the plate changes the geometry; it does not change the retardance magnitude.",
    marks: 5
  },
  {
    id: "pol-x-stress-observe",
    type: "short",
    difficulty: 2,
    topic: "Stress birefringence",
    prompt:
      "A coverslip between crossed polarizers is dark until you squeeze it. Explain the observation and describe how to separate isoclinics from isochromatics.",
    answer:
      "At zero load the coverslip is either nearly isotropic or its principal axes are parallel to the polarizers, so sin²(2θ) is zero and the field is blocked. Squeezing induces a birefringence Δn = Cσ and therefore a retardance δ = 2πCσd/λ; at 45° to the polarizers the transmission becomes sin²(δ/2) and the sample brightens. Rotating the sample produces four dark orientations per full turn (every 90°): these are the isoclinics, and they locate the principal stress directions. Changing the load or moving along the sample moves the bright and dark bands whose spacing depends on δ: these are the isochromatics. To measure δ, set the sample at 45° to the polarizers and use T = sin²(δ/2). With white light the retardance map appears as colour fringes.",
    explanation:
      "A dark sample does not prove the absence of stress: the axes may simply be aligned with the polarizers, or the retardance may be below sensitivity. Rotating the sample is the test. Isoclinics depend on orientation; isochromatics depend on retardance and therefore on load and position.",
    marks: 5
  },
  {
    id: "pol-x-ambient-null",
    type: "mcq",
    difficulty: 2,
    topic: "Troubleshooting",
    prompt:
      "With the analyser at the crossed position, a good polarizer pair reads 0.8 % of the parallel maximum instead of below 0.01 %. Which action is the most informative first step?",
    options: [
      "Replace the laser; an unpolarized source is the only explanation.",
      "Block the beam and record the dark and ambient levels, then shield the detector and repeat.",
      "Rotate the polarizer by 45° and read the new maximum.",
      "Increase the detector gain so the null is easier to see."
    ],
    answerIndex: 1,
    answer:
      "Block the beam and record the dark and ambient levels, then shield the detector and repeat. A 0.8 % floor is an additive-background problem until proved otherwise.",
    explanation:
      "Room light, detector dark offset, scatter around the mounts and a converging beam all add to the crossed reading and set a floor. Shielding, an aperture and dark subtraction separate those from finite polarizer extinction. Increasing the gain does not remove a background and may saturate the maximum. Rotating the polarizer changes the state instead of diagnosing the floor.",
    marks: 3
  },
  {
    id: "pol-x-axis-offset",
    type: "mcq",
    difficulty: 3,
    topic: "Troubleshooting",
    prompt:
      "After remounting, a quarter-wave plate gives its flattest analyser response at 38° on the mount scale instead of 45°. The residual modulation at that point is only a few per cent. What is the best interpretation?",
    options: [
      "The plate has lost a quarter wave of retardance and should be replaced.",
      "The mount zero is offset by about 7°; the plate is fine, and angles should be referenced to the input polarization.",
      "The analyser is nonlinear; the detector must be recalibrated.",
      "The source has become circular, so a quarter-wave plate cannot work."
    ],
    answerIndex: 1,
    answer:
      "The mount zero is offset by about 7°. A scale offset shifts the angle at which the response is flattest; a genuine retardance error leaves residual modulation at the true 45° orientation.",
    explanation:
      "The physics depends on the angle between the plate axis and the input linear state, not on the engraved number. Scan the plate angle and find the minimum modulation: that is the true 45° orientation. Then re-zero the mount or record the offset. Check the depth of the nulls at 0° and 90° as well; if the plate is not quarter-wave at the operating wavelength, no orientation will give a truly flat response. Detector nonlinearity would distort the curve shape, not shift its minimum.",
    marks: 4
  },
  {
    id: "pol-x-tilt-quantitative",
    type: "mcq",
    difficulty: 2,
    topic: "3D cinema",
    prompt:
      "A linear passive system uses ±45° states with 30 dB analysers and an ideal screen. At 30° of head tilt, which statement is closest to the truth?",
    options: [
      "Crosstalk stays near 0.1 % because the analysers are good.",
      "Crosstalk rises to about 25 %, while a circular system stays near 0.1 %.",
      "Crosstalk rises to about 50 %, and a circular system also rises to 50 %.",
      "Crosstalk falls because the effective analyser angle moves closer to the image."
    ],
    answerIndex: 1,
    answer:
      "Crosstalk rises to about 25 %, while a circular system stays near 0.1 %.",
    explanation:
      "At 30° the wanted projection is cos²30° = 0.75 and the orthogonal leakage is sin²30° = 0.25; with ε = 10⁻³ the crosstalk is about 25 %. The circular analyser eigenstate lies on the S₃ axis, which a rotation about the viewing axis does not move, so its crosstalk stays at the extinction floor. This tilt invariance is why cinemas choose circular encoding; it does not remove the need for a polarization-preserving screen.",
    marks: 4
  },
  {
    id: "pol-x-unit-trap",
    type: "mcq",
    difficulty: 2,
    topic: "Metrology",
    prompt:
      "A student enters a retardance of 90° as the number 90 in d = δλ/(2πΔn), with λ = 532 nm and Δn = 0.009. What is wrong with the result?",
    options: [
      "Nothing; the formula accepts degrees if λ is in nanometres.",
      "The thickness is about 57× too small because radians must be converted to degrees.",
      "The thickness is 10⁹× too large because nanometres must be converted to metres.",
      "The thickness is about 57× too large because δ must be in radians; 90° = π/2."
    ],
    answerIndex: 3,
    answer:
      "The thickness is about 57× too large; δ must be in radians, and 90° = π/2.",
    explanation:
      "Using δ = π/2 gives d = (π/2 × 532 nm)/(2π × 0.009) = 532/(4 × 0.009) = 14.8 µm. Using 90 gives 846.7 µm, larger by 90/(π/2) = 57.3. The units are otherwise consistent: λ in nanometres and dimensionless Δn give d in nanometres. Convert λ to metres only if you want d in metres, and never mix a degree value with a formula that expects radians. The same discipline appears in LCD retardance and ellipsometry, where a phase error of a few degrees becomes a thickness or voltage error.",
    marks: 4
  },
  {
    id: "pol-x-crosstalk-numeric",
    type: "numerical",
    difficulty: 3,
    topic: "3D cinema",
    prompt:
      "One eye of a stereo pair measures 0.94 for its own image and 0.06 for the opposite image, both normalized to the same white level. (a) Compute the crosstalk percentage and the contrast ratio. (b) The glasses are quoted at 30 dB extinction and the screen is ideal; what leakage fraction do the glasses alone produce? (c) What does the difference imply?",
    answer:
      "(a) XT = 0.06/(0.94 + 0.06) = 0.060 = 6.0 %, and C = 0.94/0.06 = 15.7. (b) 30 dB means ε = 10^(−30/10) = 10⁻³, so the crossed lens leaks 0.1 % of the wanted channel; the crosstalk floor is ε/(1+ε) ≈ 0.1 %. (c) The measured 6 % is about 60× the glasses floor, so the analyser extinction is not the dominant leakage. Screen depolarization, scatter, a channel mismatch or a non-polarization-preserving screen is the likely cause; better glasses would barely change the result.",
    explanation:
      "Crosstalk is the leaked fraction of the total light in that eye, not the leaked fraction of the wanted channel. Comparing the measured value with the floor predicted by the quoted extinction separates the glasses from the screen and the rest of the channel. A 30 dB ratio is an intensity ratio of 10³, not 30.",
    numeric: { value: 6.0, tolerance: 0.1, unit: "%" },
    marks: 5
  },
  {
    id: "pol-x-jones-four-intensities",
    type: "viva",
    difficulty: 3,
    topic: "Stokes parameters",
    prompt:
      "A colleague has four linear analyser readings I₀, I₄₅, I₉₀ and I₁₃₅ and claims to have fully characterised the state, including its handedness, and that a Jones vector is sufficient because the light is 'mostly polarized'. Evaluate both claims.",
    answer:
      "Both claims are wrong. The four readings give S₀ = I₀ + I₉₀, S₁ = I₀ − I₉₀ and S₂ = I₄₅ − I₁₃₅; S₃ requires a circular analyser, so handedness, ellipticity and the degree of polarization are not determined. If the light is known to be pure, the magnitude |S₃| follows from S₀² = S₁² + S₂² + S₃², but the sign remains unknown without a circular measurement. 'Mostly polarized' means DoP < 1, which is exactly the regime a Jones vector cannot describe; a Stokes vector or Mueller calculus is required. Add a quarter-wave plate at 45° before the analyser and measure I_R and I_L to close the state.",
    explanation:
      "A linear analyser is blind to S₃: its transmission is ½(S₀ + S₁cos2φ + S₂sin2φ). Four linear readings therefore span only the equatorial part of the Poincaré sphere. The Jones vector assumes a definite phase relation and unit DoP; partial polarization needs the statistical description.",
    marks: 5
  }
];

const content: ExperimentContent = {
  slug: "polarization-3d-cinema",
  number: "05",
  title: "Polarization & 3D Cinema",
  shortTitle: "Polarization",
  subtitle: "From Maxwell's vector field to stereo projection",
  summary:
    "Work through Jones calculus, wave plates, Stokes parameters and the Poincaré sphere, then separate left- and right-eye images with real polarizers and glasses.",
  principle:
    "The transverse electric-field vector carries the polarization state; anisotropic media and analysers transform it deterministically, and orthogonal states let one screen carry two independent images.",
  family: "Polarization",
  difficulty: 2,
  duration: "4–6 h",

  evidence: {
    implementation: "actual",
    headline: "Table-top polarization bench plus an optical stereo demonstration",
    detail:
      "Every measurement in phases 2–6 uses the listed source, polarizers, wave plates, rotation mounts and photodiode, and can be performed on a teaching table. The 3D-cinema phase demonstrates stereo separation with two polarizer/glasses channels on a polarization-preserving screen; it is an optical demonstration of the principle, not a claim about any commercial cinema projector, screen or eyewear. The kit itself is recorded as unverified until the packing list is checked."
  },

  kit: {
    name: "Undergraduate polarization optics set (composite)",
    manufacturer: "Thorlabs educational components (kit identity unverified)",
    verification: "unverified",
    documentation: [
      {
        title: "Thorlabs document library",
        url: "https://www.thorlabs.com/",
        note:
          "Consult the printed guide and packing list supplied with the physical kit. Do not assume a part number, retardance tolerance or extinction value until the label on the part has been read."
      }
    ],
    note:
      "The experiment needs two good linear polarizers, one zero-order half-wave plate, one zero-order quarter-wave plate, three rotation mounts with readable scales, a photodiode with a linear amplifier, and a pair each of linear and circular 3D glasses. Any 1–5 mW visible laser works; the procedure quotes 632.8 nm and 532 nm because those are the sources in the inventory. Verify wavelength compatibility of every retarder before use."
  },

  hardware: [
    { itemId: "src-he-ne", quantity: "1", role: "kit", note: "632.8 nm reference source; low power, visible beam, good for a first alignment." },
    { itemId: "src-diode-532", quantity: "1", role: "kit", note: "532 nm alternative; check that the wave plates are specified for this wavelength." },
    { itemId: "pol-linear", quantity: "2", role: "kit", note: "Polarizer and analyser; mark the transmission axis on the mount." },
    { itemId: "pol-circular", quantity: "1", role: "kit", note: "Linear polarizer followed by a quarter-wave plate; useful as a circular analyser." },
    { itemId: "waveplate-half", quantity: "1", role: "kit", note: "Zero-order preferred; record the design wavelength." },
    { itemId: "waveplate-quarter", quantity: "1", role: "kit", note: "Zero-order preferred; used for circular generation and analysis." },
    { itemId: "rotation-mount", quantity: "3", role: "kit", note: "One each for polarizer, plate and analyser; read the scale to 0.5°." },
    { itemId: "prism-right-angle", quantity: "1", role: "kit", note: "Brewster-angle reflection demonstration; a bare glass surface is enough." },
    { itemId: "sample-glass-slide", quantity: "1", role: "kit", note: "Stress-birefringence sample; bend it gently in a clamp." },
    { itemId: "sample-coverslip", quantity: "1", role: "kit", note: "Thin glass shows stress colours with modest force." },
    { itemId: "det-photodiode", quantity: "1", role: "kit", note: "Silicon photodiode with transimpedance amplifier; check linearity and dark offset." },
    { itemId: "screen-white", quantity: "1", role: "kit", note: "Alignment target and reference for a non-polarization-preserving screen." },
    { itemId: "sample-3d-glasses-linear", quantity: "1", role: "kit", note: "Pair of linear analyser glasses; label left and right." },
    { itemId: "sample-3d-glasses-circular", quantity: "1", role: "kit", note: "Pair of circular analyser glasses; label left and right." },
    { itemId: "sample-projection-screen", quantity: "1", role: "kit", note: "Polarization-preserving screen; compare with the white screen to show the difference." },
    { itemId: "optical-table", quantity: "1", role: "kit", note: "Damped surface; beam height and orthogonality matter more than the table." },
    { itemId: "beam-block", quantity: "1", role: "kit", note: "Beam stop at the end of the train; never leave an unblocked beam." }
  ],

  objectives: [
    "Describe light as a transverse electromagnetic wave and represent a fully polarized state by a normalized Jones vector.",
    "Predict transmission through one and two polarizers with Malus's law, and distinguish the first polarizer's 50 % loss from the analyser's projection loss.",
    "Classify linear, circular and elliptical states, and separate the ideas of polarization purity (DoP) from polarization shape.",
    "Compose polarizer, rotator and retarder Jones matrices in the correct order and interpret the result physically.",
    "Relate retardance to birefringence, thickness and wavelength, and select half- and quarter-wave plates for a stated task.",
    "Measure the four Stokes parameters from six analyser settings and place the state on the Poincaré sphere.",
    "Explain when Mueller calculus is required and apply a depolarizing channel model to a partially polarized beam.",
    "Observe and interpret stress-induced birefringence in ordinary glass and a coverslip.",
    "Build a two-channel passive stereo separator and quantify leakage, contrast and crosstalk.",
    "Explain, with the projection algebra, why practical cinemas prefer circular polarization and what that choice still costs."
  ],

  concepts: [
    "Transverse electromagnetic wave",
    "Jones vector and Jones matrix",
    "Malus's law",
    "Dichroism and wire-grid polarizers",
    "Brewster's angle",
    "Birefringence and retardance",
    "Half-wave and quarter-wave plates",
    "Stokes parameters",
    "Degree of polarization",
    "Mueller calculus",
    "Poincaré sphere",
    "Stress-induced birefringence",
    "Extinction ratio",
    "Stereo crosstalk and ghosting"
  ],

  prerequisites: [
    "Complex numbers: modulus, argument, conjugation and the exponential form.",
    "2×2 matrices: multiplication, determinant, inverse, Hermitian and unitary matrices.",
    "Trigonometry: double-angle identities and the geometry of the ellipse.",
    "The wave equation and the idea of phase; familiarity with k = 2π/λ and ω = 2πf.",
    "Snell's law and the qualitative form of the Fresnel reflection coefficients.",
    "Intensity as a squared amplitude, and the use of a photodiode as a linear intensity sensor.",
    "Propagation of uncertainty for a ratio and for a trigonometric function.",
    "Safe handling of a visible class 3R/3B laser beam."
  ],

  sections: [
    {
      id: "em-wave",
      number: "5.1",
      title: "The wave and its vector",
      kicker: "Maxwell → Jones",
      blocks: [
        {
          type: "lead",
          text:
            "Polarization is the direction in which the electric field of a light wave oscillates. It is not an extra property attached to the wave — it is the shape traced by the field vector as the wave passes, and it is the reason a passive pair of glasses can deliver two different images to two eyes."
        },
        {
          type: "p",
          text:
            "In a source-free, homogeneous, isotropic medium, Maxwell's equations admit monochromatic plane waves whose electric field is perpendicular to the propagation direction. For a wave travelling along +z, the field has only x and y components, and the magnetic field is fixed by B = (1/c) k̂ × E. The triad E, B, k is right-handed, and the transversality condition k · E = 0 removes the longitudinal component entirely. This is why polarization is a two-dimensional subject: at every instant the tip of E lies in the transverse plane."
        },
        {
          type: "eq",
          latex:
            "\\mathbf{E}(z,t)=\\operatorname{Re}\\left\\{\\begin{bmatrix}E_{0x}e^{i\\varphi_x}\\\\E_{0y}e^{i\\varphi_y}\\end{bmatrix}e^{i(kz-\\omega t)}\\right\\}",
          number: "5.1",
          note:
            "The bracket is the complex amplitude. Only the relative amplitude |E_y|/|E_x| and the relative phase φ_y − φ_x change the polarization shape; a common phase is unobservable."
        },
        {
          type: "p",
          text:
            "The two complex numbers E_x and E_y therefore carry the complete state of a fully polarized wave. Their ratio is the physically meaningful quantity, and normalizing the pair to unit intensity gives the Jones vector. The absolute scale is recovered separately from the beam power: for a 1 mW beam spread over 1 mm², the peak field is of order 1 kV m⁻¹, a useful reminder that optical fields are large even when the power is small."
        },
        { type: "diagram", kind: "polarization", caption: "A transverse field propagating along z, followed by a polarizer and an analyser. The analyser transmits the projection of E onto its axis, which is the whole content of Malus's law." },
        {
          type: "callout",
          tone: "principle",
          title: "The state is a ratio, not a pair of absolute numbers",
          body:
            "Scaling a Jones vector by any complex number does not change the polarization; it changes the intensity and the absolute phase. This is why every state in this module is normalized and why a global phase is never reported as a measurement."
        },
        {
          type: "p",
          text:
            "A real beam is never a perfect monochromatic plane wave. It has a finite bandwidth, a finite transverse extent and a noisy phase. Those imperfections are what make unpolarized and partially polarized light possible. The plane-wave model remains the right starting point because any field can be decomposed into plane-wave components, and because the polarizers and retarders in this experiment act on each monochromatic component in the same way."
        }
      ]
    },

    {
      id: "states",
      number: "5.2",
      title: "Linear, circular, elliptical — and everything in between",
      kicker: "The shape of the trace",
      blocks: [
        {
          type: "p",
          text:
            "If the two components are in phase or exactly out of phase, the field vector oscillates along a fixed line: linear polarization. If the amplitudes are equal and the relative phase is ±90°, the vector rotates at constant magnitude: circular polarization. Every other combination traces an ellipse whose axes are tilted with respect to x and y. These are not three separate kinds of light; they are three regions of one continuous family, labelled by an azimuth ψ and an ellipticity angle χ."
        },
        {
          type: "p",
          text:
            "Handedness is the one place where textbooks routinely disagree. This module follows the codebase: S₃ > 0 is called right circular, and the state [1, i]ᵀ/√2 has S₃ = +1. The physically invariant statement is the sign of S₃ relative to a calibrated quarter-wave plate and analyser. When comparing with another book, check its time convention before transferring a handedness label."
        },
        {
          type: "table",
          caption: "The six canonical states in this module's convention. S₁, S₂ and S₃ are normalized to S₀ = 1.",
          head: ["State", "Jones vector", "S₁", "S₂", "S₃", "Trace"],
          rows: [
            ["H", "[1, 0]ᵀ", "1", "0", "0", "horizontal line"],
            ["V", "[0, 1]ᵀ", "−1", "0", "0", "vertical line"],
            ["D", "[1, 1]ᵀ/√2", "0", "1", "0", "line at +45°"],
            ["A", "[1, −1]ᵀ/√2", "0", "−1", "0", "line at −45°"],
            ["R", "[1, i]ᵀ/√2", "0", "0", "1", "clockwise circle (this convention)"],
            ["L", "[1, −i]ᵀ/√2", "0", "0", "−1", "anticlockwise circle (this convention)"]
          ],
          align: ["l", "l", "r", "r", "r", "l"]
        },
        {
          type: "definition",
          term: "Unpolarized light",
          body:
            "Light whose polarization state fluctuates on a timescale short compared with the measurement, so that no stable phase relation exists between the x and y components. It is described by a Stokes vector (S₀, 0, 0, 0) or by a coherency matrix proportional to the identity — never by a single Jones vector."
        },
        {
          type: "definition",
          term: "Partially polarized light",
          body:
            "A statistical mixture of a fully polarized component and an unpolarized component. Its Stokes vector has 0 < DoP < 1 and lies inside the Poincaré sphere. Sunlight scattered by the sky, light transmitted through a stressed window, and a stereo image after screen depolarization are all partially polarized."
        },
        {
          type: "p",
          text:
            "The decomposition into a polarized part and an unpolarized part is not unique in general, but the degree of polarization is. If a beam has Stokes vector S, then DoP = |S_vec|/S₀, where S_vec is the spatial part (S₁, S₂, S₃). A value of 1 means a pure state, 0 means fully unpolarized, and anything between means a mixture. The polarized part points in the direction of S_vec on the Poincaré sphere; the unpolarized part contributes only to S₀."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "“Unpolarized” does not mean “no electric field”",
          body:
            "It means the field direction changes unpredictably from one coherence interval to the next. A polarizer still transmits half the intensity, and the transmitted light is fully polarized — the polarizer has selected one projection from a rapidly changing vector."
        }
      ]
    },

    {
      id: "polarizers",
      number: "5.3",
      title: "Polarizers and Malus's law",
      kicker: "Projection, not selection by magic",
      blocks: [
        {
          type: "p",
          text:
            "A linear polarizer transmits the component of E along one axis and removes the orthogonal component. The removal mechanism differs by type. Dichroic sheet polarizers absorb one component in an oriented polymer; wire-grid polarizers reflect the component parallel to the wires and transmit the perpendicular one; polarizing beam-splitter cubes use interference coatings at a Brewster-like internal angle to send the two components to different ports; birefringent prisms use the different refraction of ordinary and extraordinary rays. In every case the transmitted field is the projection of the input field onto the transmission axis."
        },
        {
          type: "p",
          text:
            "For a linear input at angle θ relative to the analyser, the transmitted amplitude is E₀ cos θ and the intensity is I₀ cos²θ. That is Malus's law. It follows directly from the dot product of the field with the unit vector along the analyser, so it is a statement about amplitudes, not a separate empirical rule."
        },
        {
          type: "eq",
          latex: "I(\\theta)=I_0\\cos^2\\theta",
          number: "5.2",
          note: "I₀ is the intensity that would pass if the analyser were aligned with the input linear state. For an unpolarized input, replace I₀ by the intensity after the first polarizer."
        },
        {
          type: "eq",
          latex:
            "P(\\theta)=\\begin{bmatrix}\\cos^2\\theta&\\sin\\theta\\cos\\theta\\\\\\sin\\theta\\cos\\theta&\\sin^2\\theta\\end{bmatrix}",
          number: "5.3",
          note:
            "The matrix is a projector: Hermitian, idempotent and singular. P² = P expresses the obvious fact that a second identical polarizer changes nothing."
        },
        {
          type: "p",
          text:
            "An analyser is simply a polarizer used to interrogate a state. Rotating it and recording the transmitted intensity gives the projection curve I(φ) = ½(S₀ + S₁ cos 2φ + S₂ sin 2φ) for any input described by Stokes parameters. For a linear input this reduces to a shifted cos² curve; for an elliptical input the contrast is reduced because the state has a circular component that no linear analyser can address."
        },
        {
          type: "table",
          caption: "Polarizer families and what limits them. The extinction figures are order-of-magnitude teaching values, not datasheet claims.",
          head: ["Type", "Mechanism", "Typical extinction", "Notes"],
          rows: [
            ["Dichroic sheet", "Absorption of one component in an oriented polymer", "10⁻³–10⁻⁴", "Large aperture, inexpensive, some absorption and scatter"],
            ["Wire grid", "Reflection of the component along the wires", "10⁻³–10⁻⁴", "Broadband, good for IR, sensitive to wire damage"],
            ["Polarizing cube", "Multilayer interference at a Brewster angle", "10⁻⁴–10⁻⁵", "Two ports, high transmission, limited aperture"],
            ["Birefringent prism", "Spatial separation of o and e rays", "very high", "Bulky, narrow field, used in precision instruments"],
            ["Reflection at Brewster incidence", "Zero p reflectance at one angle", "moderate", "Simple demo, angle-sensitive, incomplete"]
          ],
          align: ["l", "l", "l", "l"]
        },
        {
          type: "callout",
          tone: "lab",
          title: "The first polarizer costs half the light",
          body:
            "With an unpolarized source, the first polarizer transmits 50 % and produces a fully polarized beam. The second polarizer then follows Malus. Students often fit the second stage correctly but forget the 50 % factor when predicting the absolute power at the detector."
        },
        {
          type: "numeric",
          title: "Malus with a real beam",
          statement:
            "A 5.00 mW horizontally polarized beam meets an analyser at 30.0°. What power reaches the detector, ignoring reflection and absorption?",
          latex: "P=5.00\\ \\mathrm{mW}\\times\\cos^2 30^\\circ",
          result: "3.75 mW. At 60° the same beam would deliver 1.25 mW, and at 90° the ideal result is zero."
        },
        { type: "derivation", derivationId: "der-malus" }
      ]
    },

    {
      id: "brewster",
      number: "5.4",
      title: "Polarization by reflection and Brewster's angle",
      kicker: "Where the p-wave disappears",
      blocks: [
        {
          type: "p",
          text:
            "Reflection is a polarizing process. The Fresnel coefficient for p-polarized light (electric field in the plane of incidence) passes through zero at a particular angle, while the s coefficient remains finite. At that angle the reflected ray and the refracted ray are perpendicular, so the oscillating dipoles in the medium radiate along the reflected direction only for the s-component. The reflected beam is then completely s-polarized, and the transmitted beam is partially polarized."
        },
        {
          type: "eq",
          latex: "\\tan\\theta_B=\\frac{n_2}{n_1}",
          number: "5.4",
          note:
            "Brewster's angle for the interface from medium 1 to medium 2. For air to glass with n = 1.5 the angle is 56.3°; for n = 1.52 it is 56.7°."
        },
        {
          type: "p",
          text:
            "The effect is used in several ways. A stack of plates at Brewster incidence builds up a highly polarized transmitted beam because each surface removes a little of the s-component on reflection and passes the p-component. Laser windows are often cut at Brewster's angle so that the p-polarized intracavity beam suffers no reflection loss. Polarizing beam-splitter cubes exploit the same physics in a multilayer coating: the coating is designed so that p-polarized light is transmitted and s-polarized light is reflected at the internal design angle."
        },
        {
          type: "callout",
          tone: "caution",
          title: "The angle is measured from the normal",
          body:
            "A rotation stage reads the angle of the surface, not the angle of incidence. Record which zero you are using. A 1° error near Brewster moves the p-reflectance off zero and can easily be larger than the detector noise."
        },
        {
          type: "numeric",
          title: "Brewster angle for a glass slide",
          statement:
            "A glass slide has n = 1.52 at 632.8 nm. At what incidence is the reflected p-component zero in air?",
          latex: "\\theta_B=\\arctan(1.52)=56.7^\\circ",
          result:
            "56.7° from the normal. The reflected beam is s-polarized; a polarizer in front of the detector can extinguish it almost completely, which is a sensitive way to find the angle."
        }
      ]
    },

    {
      id: "birefringence",
      number: "5.5",
      title: "Birefringence and retarders",
      kicker: "Two refractive indices, one phase delay",
      blocks: [
        {
          type: "p",
          text:
            "In an anisotropic crystal the refractive index depends on the direction of the electric field relative to the crystal axes. A uniaxial crystal has one optic axis: light polarized along it sees the extraordinary index n_e, light polarized perpendicular to it sees the ordinary index n_o. Because the two components travel at different speeds, a plate of thickness d introduces a phase difference"
        },
        {
          type: "eq",
          latex: "\\delta=\\frac{2\\pi\\,\\Delta n\\,d}{\\lambda},\\qquad \\Delta n=|n_e-n_o|",
          number: "5.5",
          note:
            "δ is the retardance in radians. Δn is written as a magnitude; whether the extraordinary axis is fast or slow decides the sign of δ in the matrix, which affects handedness but not the intensity between crossed polarizers."
        },
        {
          type: "p",
          text:
            "A retarder does not absorb either component; it changes their relative phase. The eigenaxes are the fast axis (less phase delay) and the slow axis (more phase delay). Rotating the plate changes which projection of the input lands on each axis, and therefore changes the output ellipse. A half-wave plate (δ = π) reflects a linear state about its fast axis; a quarter-wave plate (δ = π/2) turns a linear state at 45° to its axis into a circular state."
        },
        { type: "diagram", kind: "waveplate", caption: "A retarder with fast and slow axes. The output is the same two components with a relative phase δ; the polarization ellipse changes shape while the total intensity is unchanged." },
        {
          type: "table",
          caption: "Retarders at a glance. “Order” is m in δ = 2π(m + f) with f the fractional wave; zero-order plates have m = 0.",
          head: ["Plate", "δ", "Effect on a linear state", "Typical use"],
          rows: [
            ["λ/4", "90° (π/2)", "linear at 45° → circular", "circular polarizer, Stokes S₃, stereo glasses"],
            ["λ/2", "180° (π)", "linear at α → linear at 2θ − α", "rotate polarization, build crossed-polarizer switch"],
            ["λ", "360° (2π)", "identity (for that wavelength)", "check the wavelength calibration"],
            ["λ/6", "60° (π/3)", "elliptical, T = 25 % between crossed polarizers", "retardance calibration exercise"],
            ["arbitrary", "0–360°", "elliptical in general", "stress measurement, variable retarder"]
          ],
          align: ["l", "l", "l", "l"]
        },
        {
          type: "callout",
          tone: "misconception",
          title: "A wave plate is not a polarizer",
          body:
            "A wave plate changes the phase relationship between two components and transmits both. If you place a wave plate alone in a beam and look at the total power, it barely changes. You need an analyser after it to convert the changed ellipse into an intensity change."
        },
        {
          type: "numeric",
          title: "How thick is a quarter-wave plate?",
          statement:
            "Crystal quartz has Δn = 0.0090 at 589 nm. What thickness gives δ = 90°?",
          latex: "d=\\frac{\\lambda}{4\\Delta n}=\\frac{589\\ \\mathrm{nm}}{4\\times0.0090}",
          result:
            "16.4 µm. A true zero-order plate at visible wavelengths is therefore very thin and is usually made from two thicker plates whose retardances subtract to a small residual. Multi-order plates are cheaper but far more sensitive to wavelength and temperature."
        },
        {
          type: "p",
          text:
            "Retardance is dispersive: Δn and therefore δ change with wavelength. A plate specified as quarter-wave at 632.8 nm is not quarter-wave at 532 nm. It is also sensitive to incidence angle, because tilting the plate changes the effective path length and the projection of the principal axes. Both effects matter in the cinema discussion, where a plastic quarter-wave sheet must work across the visible spectrum and over a range of viewing angles."
        },
        { type: "derivation", derivationId: "der-waveplate" }
      ]
    },

    {
      id: "jones",
      number: "5.6",
      title: "Jones vectors and matrices",
      kicker: "A 2×2 algebra for pure states",
      blocks: [
        {
          type: "p",
          text:
            "The Jones formalism packages the two complex components into a column vector and every linear element into a 2×2 matrix. The output is the matrix applied to the input, and matrices compose by multiplication in the order the light meets them — the rightmost matrix acts first. This is the most compact way to design a polarization train and the easiest way to make a sign error, so write the order explicitly every time."
        },
        {
          type: "eq",
          latex:
            "\\mathbf{J}=\\frac{1}{\\sqrt{|E_x|^2+|E_y|^2}}\\begin{bmatrix}E_x\\\\E_y\\end{bmatrix},\\qquad I\\propto|E_x|^2+|E_y|^2",
          number: "5.6",
          note: "Normalization is a convenience. A global phase e^{iα} multiplying the whole vector is physically irrelevant."
        },
        {
          type: "p",
          text:
            "Three matrices cover almost everything in this experiment. The polarizer P(θ) is a projector. The retarder W(θ, δ) is unitary: it rotates the state on the Poincaré sphere without changing its radius. A rotator R(φ) — optical activity, or simply a rotation of the coordinate frame — is also unitary and moves the state along the equator by 2φ. A cascade is unitary overall only if every element is a retarder or rotator; a polarizer makes the product non-unitary and reduces the intensity."
        },
        {
          type: "eq",
          latex:
            "W(\\theta,\\delta)=R(\\theta)\\,\\operatorname{diag}(1,e^{i\\delta})\\,R(-\\theta),\\qquad R(\\phi)=\\begin{bmatrix}\\cos\\phi&-\\sin\\phi\\\\\\sin\\phi&\\cos\\phi\\end{bmatrix}",
          number: "5.7",
          note:
            "Rotate into the plate frame, apply the phase to the slow axis, rotate back. At θ = 0 the fast axis is x and the slow axis is y. The global phase is chosen so that the fast component has phase zero."
        },
        {
          type: "p",
          text:
            "A worked example makes the order concrete. Start with H, pass through a half-wave plate at 22.5°, then a vertical analyser. The plate matrix at 22.5° with δ = π is (1/√2)[[1,1],[1,−1]]. Applied to [1,0]ᵀ it gives [1,1]ᵀ/√2 = D. The vertical analyser then transmits cos²45° = 50 %. Two crossed polarizers that transmitted nothing now transmit half the light, because the plate rotated the intermediate state by 45°."
        },
        {
          type: "callout",
          tone: "note",
          title: "When Jones calculus is the wrong tool",
          body:
            "Jones vectors cannot describe unpolarized light, partial polarization or a depolarizing screen, because they assume a definite phase relation. Use Stokes vectors and Mueller matrices for those. Jones calculus is still the right tool for the fully polarized bench, and it is much easier to invert and interpret."
        }
      ]
    },

    {
      id: "stokes",
      number: "5.7",
      title: "Stokes parameters and the Poincaré sphere",
      kicker: "Four numbers, one geometry",
      blocks: [
        {
          type: "p",
          text:
            "The Stokes parameters are four real intensities that describe any beam, pure or mixed. They are defined so that S₀ is the total intensity, S₁ is the excess of x over y linear polarization, S₂ is the excess of +45° over −45°, and S₃ is the excess of one circular handedness over the other. For a pure state they satisfy S₀² = S₁² + S₂² + S₃²; for a mixed state the sum of squares is smaller."
        },
        {
          type: "eq",
          latex:
            "\\begin{aligned}S_0&=|E_x|^2+|E_y|^2,\\\\ S_1&=|E_x|^2-|E_y|^2,\\\\ S_2&=2\\operatorname{Re}(E_xE_y^{*}),\\\\ S_3&=-2\\operatorname{Im}(E_xE_y^{*})\\end{aligned}",
          number: "5.8",
          note: "The sign of S₃ is tied to the time convention; this is the form implemented by stokesFromJones in the shared physics module."
        },
        {
          type: "p",
          text:
            "Experimentally the parameters come from six analyser settings: a linear analyser at 0°, 45°, 90° and 135°, and a circular analyser for each handedness. The circular analyser is a quarter-wave plate at 45° followed by a linear polarizer, with the order and orientation chosen so that it passes one circular state and blocks the other. The reduction is linear and easy to propagate through the error budget."
        },
        {
          type: "eq",
          latex:
            "\\begin{aligned}S_0&=I_0+I_{90},\\\\ S_1&=I_0-I_{90},\\\\ S_2&=I_{45}-I_{135},\\\\ S_3&=I_R-I_L\\end{aligned}",
          number: "5.9",
          note: "Every I is dark-offset corrected and measured with the same beam power. S₀ is over-determined; compare I₀ + I₉₀ with I₄₅ + I₁₃₅ as a consistency check."
        },
        {
          type: "p",
          text:
            "Normalizing by S₀ maps every state into or onto the unit Poincaré sphere. The equator (S₃ = 0) is the set of linear states; the poles are the circular states; latitude is ellipticity and longitude is twice the azimuth. Orthogonal states are antipodal. Partial polarization puts the point inside the sphere, with the radius equal to the degree of polarization."
        },
        {
          type: "eq",
          latex:
            "\\mathcal{P}=\\frac{\\sqrt{S_1^2+S_2^2+S_3^2}}{S_0}\\le 1",
          number: "5.10",
          note: "DoP = 1 for a pure state, 0 for unpolarized light, and between for a mixture. It is invariant under retarders, which rotate the Stokes vector without changing its length."
        },
        {
          type: "eq",
          latex:
            "\\psi=\\tfrac12\\operatorname{atan2}(S_2,S_1),\\qquad \\chi=\\tfrac12\\arcsin\\!\\left(\\frac{S_3}{S_0}\\right)",
          number: "5.11",
          note: "ψ is the azimuth of the major axis of the ellipse, χ is the ellipticity angle. χ = 0 is linear, χ = ±45° is circular."
        },
        { type: "diagram", kind: "poincare", caption: "The Poincaré sphere. Longitude is 2ψ, latitude is 2χ, and antipodal points are orthogonal states. A pure state sits on the surface; a partially polarized state sits inside at radius equal to its DoP." },
        {
          type: "numeric",
          title: "Stokes parameters from six readings",
          statement:
            "I₀ = 1.00, I₉₀ = 0.20, I₄₅ = 0.60, I₁₃₅ = 0.60, I_R = 0.50, I_L = 0.70 (same units). Find the Stokes vector and DoP.",
          latex:
            "S_0=1.20,\\ S_1=0.80,\\ S_2=0,\\ S_3=-0.20,\\ \\mathcal{P}=0.825/1.20=0.688",
          result:
            "A mostly horizontal, slightly left-circular, partially polarized beam. Its azimuth is 0° and its ellipticity is −4.8°. Because DoP < 1, no single Jones vector describes it."
        },
        { type: "derivation", derivationId: "der-stokes-poincare" },
        {
          type: "callout",
          tone: "note",
          title: "The sphere is a map, not a physical object",
          body:
            "Nothing rotates in space when a state moves on the Poincaré sphere. The sphere is a convenient geometry for the three independent intensity differences; the physical ellipse lives in the transverse plane. The two pictures are related by ψ and χ, not by a rigid rotation."
        }
      ]
    },

    {
      id: "mueller",
      number: "5.8",
      title: "Mueller calculus for partial polarization",
      kicker: "When a Jones vector is not enough",
      blocks: [
        {
          type: "p",
          text:
            "A Mueller matrix is a real 4×4 matrix that acts on a Stokes vector. It can describe everything Jones matrices describe, plus depolarization, diattenuation and imperfect analysers. The price is redundancy: sixteen numbers instead of four complex ones, and no direct access to the phase of the field. The reward is that partially polarized light and real, lossy elements become linear algebra."
        },
        {
          type: "p",
          text:
            "A linear polarizer is a projector in Mueller form. It is idempotent, M_P² = M_P, and it raises the degree of polarization of an unpolarized input from 0 to 1 because the transmitted light is fully polarized even though half the intensity is lost. A retarder is an orthogonal matrix in the S₁–S₃ subspace: it rotates the Stokes vector and leaves S₀ and the DoP unchanged."
        },
        {
          type: "eq",
          latex:
            "M_P(\\theta)=\\frac12\\begin{bmatrix}1&\\cos2\\theta&\\sin2\\theta&0\\\\ \\cos2\\theta&\\cos^22\\theta&\\sin2\\theta\\cos2\\theta&0\\\\ \\sin2\\theta&\\sin2\\theta\\cos2\\theta&\\sin^22\\theta&0\\\\ 0&0&0&0\\end{bmatrix}",
          number: "5.12",
          note: "The factor ½ is the unpolarized-input transmission. Apply it to (1,0,0,0) to get (½, ½cos2θ, ½sin2θ, 0)."
        },
        {
          type: "eq",
          latex:
            "M_W(\\theta,\\delta)=\\begin{bmatrix}1&0&0&0\\\\ 0&c^2+s^2\\cos\\delta&cs(1-\\cos\\delta)&-s\\sin\\delta\\\\ 0&cs(1-\\cos\\delta)&s^2+c^2\\cos\\delta&c\\sin\\delta\\\\ 0&s\\sin\\delta&-c\\sin\\delta&\\cos\\delta\\end{bmatrix}",
          number: "5.13",
          note:
            "with c = cos 2θ and s = sin 2θ. The sign of the sin δ terms follows this module's handedness convention; reversing the convention reverses the sign of δ. This is the form implemented by muellerRetarder."
        },
        {
          type: "p",
          text:
            "A depolarizing screen is modelled by scaling the three polarization components while leaving S₀ alone: M_depol = diag(1, 1−p, 1−p, 1−p), with p the depolarized fraction. Complete depolarization (p = 1) sends every input to (S₀, 0, 0, 0). A real screen is somewhere between this and a perfect mirror, and its behaviour depends on viewing angle, which is one reason a cinema screen is not a simple optical element."
        },
        {
          type: "callout",
          tone: "principle",
          title: "One formalism, two regimes",
          body:
            "If the light is fully polarized and the elements are ideal, Jones calculus is smaller and clearer. If the light is partially polarized or an element depolarizes, Mueller calculus is the only consistent choice. The two agree for pure states and non-depolarizing elements."
        },
        {
          type: "numeric",
          title: "Unpolarized light through a polarizer",
          statement: "Apply M_P(0°) to the Stokes vector (1, 0, 0, 0).",
          latex: "\\tfrac12\\begin{bmatrix}1&1&0&0\\\\1&1&0&0\\\\0&0&0&0\\\\0&0&0&0\\end{bmatrix}\\begin{bmatrix}1\\\\0\\\\0\\\\0\\end{bmatrix}=\\begin{bmatrix}0.5\\\\0.5\\\\0\\\\0\\end{bmatrix}",
          result:
            "Half the intensity, fully polarized along x. The Mueller matrix makes both facts visible at once: S₀ halves and the polarization part becomes as large as it can be for that S₀."
        }
      ]
    },

    {
      id: "optical-activity",
      number: "5.9",
      title: "Optical activity and circular dichroism",
      kicker: "Chirality written into the phase and the absorption",
      blocks: [
        {
          type: "p",
          text:
            "A chiral medium — a sugar solution, a quartz crystal along its optic axis, a helical polymer — has different refractive indices for left and right circular polarization. A linear state can be written as an equal superposition of the two circular states; after propagation the two components acquire different phases, and their superposition is again linear but rotated. This is optical activity, or circular birefringence. The rotation is proportional to concentration and path length for a solution: β = [α] c l, where [α] is the specific rotation."
        },
        {
          type: "p",
          text:
            "If the two circular components are also absorbed differently, the output becomes elliptical as well as rotated. That is circular dichroism (CD). It is measured as the ellipticity induced in an initially linear beam, usually with a photoelastic modulator and a lock-in amplifier because the effect is small. CD is the basis of a large family of structural measurements on proteins and chiral molecules, and vibrational CD extends it into the infrared."
        },
        {
          type: "numeric",
          title: "Rotation by a sucrose solution",
          statement:
            "Sucrose has a specific rotation of about +66.5° mL g⁻¹ dm⁻¹ at 589 nm. What rotation does a 10 g per 100 mL solution produce in a 1 dm tube?",
          latex: "\\beta=66.5\\times0.100\\times1=6.65^\\circ",
          result:
            "6.65°. The sign and magnitude are measurable with two polarizers and a tube, which is the classical saccharimeter. Temperature and wavelength must be stated because both change the result."
        },
        {
          type: "callout",
          tone: "note",
          title: "Rotation is not the same as retardation",
          body:
            "A rotator changes the azimuth of every linear state without changing its ellipticity. A retarder changes the ellipticity. Optical activity is a circular birefringence, so it acts like a rotator for linear input, but its physical origin is the differential phase of the circular eigenstates."
        }
      ]
    },

    {
      id: "stress",
      number: "5.10",
      title: "Stress-induced birefringence and photoelasticity",
      kicker: "Glass under load becomes a wave plate",
      blocks: [
        {
          type: "p",
          text:
            "Mechanical stress deforms the electron clouds of a glass or polymer and makes the material optically anisotropic. To first order the induced birefringence is proportional to the stress: Δn = Cσ, where C is the stress-optic coefficient. Combined with the thickness, this gives a retardance δ = 2πCσd/λ. A bent coverslip or a clamped slide therefore behaves like a weak, spatially varying wave plate."
        },
        {
          type: "p",
          text:
            "A polariscope makes the effect visible. Place the sample between crossed polarizers and illuminate it with a broad beam. Where the stress axes are at 45° to the polarizers, the transmitted intensity is maximum for a given retardance; where they are parallel to either polarizer, the sample is invisible. Rotating the sample distinguishes the principal stress directions (isoclinics) from the loci of constant retardance (isochromatics). The colour fringes in white light are a direct map of retardance versus wavelength."
        },
        {
          type: "numeric",
          title: "Order of magnitude for a loaded slide",
          statement:
            "Take C ≈ 3.5 × 10⁻¹² Pa⁻¹ (typical glass, material dependent), σ = 10 MPa, d = 1.0 mm and λ = 632.8 nm. Estimate the retardance.",
          latex: "\\delta=\\frac{2\\pi C\\sigma d}{\\lambda}=\\frac{2\\pi(3.5\\times10^{-12})(10^7)(10^{-3})}{632.8\\times10^{-9}}\\approx0.35\\ \\mathrm{rad}",
          result:
            "About 0.35 rad, or 20°. The number is order-of-magnitude only: C varies by material and the stress distribution is not uniform. It is large enough to see between crossed polarizers with a modest load."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Your “unstressed” sample is probably stressed",
          body:
            "A slide clamped in a mount, a lens in a tight holder, and a coverslip picked up with tweezers all carry stress. If a sample shows fringes before you load it, loosen the mount or rotate the sample; do not attribute the pattern to the effect you are trying to measure."
        }
      ]
    },

    {
      id: "cinema-linear",
      number: "5.11",
      title: "Stereo projection I: linear passive 3D",
      kicker: "Two images, two orthogonal axes",
      blocks: [
        {
          type: "p",
          text:
            "Stereoscopic projection sends a slightly different image to each eye. In a passive polarization system the two images are encoded on orthogonal polarization states and separated by analysers in the glasses. The simplest encoding is linear: the left image is projected at +45° and the right at −45° (or H and V), and the left lens passes +45° while the right passes −45°. A viewer with the glasses upright sees the intended image in each eye and only a small leakage of the other."
        },
        {
          type: "p",
          text:
            "The screen is the weak link. An ordinary matte white screen scatters light through multiple random events and destroys the polarization; both images then reach both eyes and the stereo effect collapses into a double exposure. A metallized “silver” screen is more specular: it preserves the incident polarization, at the cost of a narrower viewing cone and a brighter hotspot. This is why a passive cinema needs a special screen, not just special glasses."
        },
        {
          type: "p",
          text:
            "Head tilt is the fatal flaw of linear stereo. If the glasses rotate by β about the viewing axis while the projected states stay fixed on the screen, the left analyser is no longer aligned with the left image. The wanted projection falls as cos²β and the orthogonal image leaks in as sin²β. At 30° of tilt the leakage is already 25 % of the channel, which is a visible ghost for most viewers."
        },
        {
          type: "eq",
          latex:
            "I_{\\mathrm{want}}=\\tfrac12\\big[(1+\\epsilon)+(1-\\epsilon)\\cos2\\beta\\big],\\qquad I_{\\mathrm{leak}}=\\tfrac12\\big[(1+\\epsilon)-(1-\\epsilon)\\cos2\\beta\\big]",
          number: "5.14",
          note:
            "One eye of a linear system with analyser extinction ε and head tilt β, for a perfect screen. At β = 0 the leakage is ε; at β = 45° the two channels are equally mixed."
        },
        {
          type: "table",
          caption:
            "Model crosstalk for a linear system at 30 dB analyser extinction with 2 % screen depolarization and no extra ghost floor. The circular row is included for comparison.",
          head: ["Head tilt", "Linear crosstalk", "Circular crosstalk"],
          rows: [
            ["0°", "1.1 %", "1.1 %"],
            ["10°", "4.0 %", "1.1 %"],
            ["20°", "12.5 %", "1.1 %"],
            ["30°", "25.5 %", "1.1 %"],
            ["40°", "41.5 %", "1.1 %"]
          ],
          align: ["r", "r", "r"]
        },
        {
          type: "callout",
          tone: "misconception",
          title: "The screen does not create the polarization",
          body:
            "It preserves (or fails to preserve) the polarization that arrives. A silver screen is not a polarizer; it is a reflector with low depolarization. If the projector sends unpolarized light, the glasses will not separate anything."
        },
        { type: "derivation", derivationId: "der-cinema" }
      ]
    },

    {
      id: "cinema-circular",
      number: "5.12",
      title: "Stereo projection II: circular polarization and why cinemas use it",
      kicker: "Rotation-invariant separation",
      blocks: [
        {
          type: "p",
          text:
            "Circular stereo encodes the two images on right and left circular states. The projector puts a quarter-wave plate after each linear polarizer (or uses a single modulator followed by a quarter-wave stage), and each lens is a quarter-wave plate followed by a linear analyser. The handedness, not the azimuth, carries the channel. Because a rotation about the viewing axis leaves a circular state unchanged, tilting the head does not rotate the analyser eigenstate away from the image state."
        },
        {
          type: "p",
          text:
            "This is the practical reason real cinemas prefer circular polarization. Audiences tilt their heads, recline, sit off-axis and wear the glasses at different angles. A linear system would make the ghosting depend on posture; a circular system keeps the projection close to unity for every head orientation. The glasses can be cheap passive plastic, with no battery, no sync and no electronics — a major operational advantage in an auditorium with hundreds of seats."
        },
        {
          type: "p",
          text:
            "The price is that circular stereo still needs a polarization-preserving screen and a well-made quarter-wave stage. The quarter-wave sheet must be close to quarter-wave across the visible spectrum; if it is not, each wavelength arrives with a slightly different ellipticity and the leakage rises. It must also work over the range of incidence angles on the screen and in the glasses. These imperfections, plus screen depolarization and scatter, are the sources of the residual ghosting that a real installation has to manage."
        },
        {
          type: "p",
          text:
            "Notice what circular polarization does and does not fix. It removes the head-tilt term exactly, because the analyser axis lies along S₃ and a rotation about the beam does not move it. It does not remove leakage from finite analyser extinction, from a depolarizing screen, from scatter in the auditorium, or from a mismatched quarter-wave plate. A circular system with a bad screen can ghost more than a linear system with a good one."
        },
        {
          type: "callout",
          tone: "principle",
          title: "The invariance is geometric",
          body:
            "A circular state is an eigenstate of rotation about the propagation axis. Rotating the glasses rotates both the quarter-wave plate and the linear analyser together, so the analyser still projects onto the same circular eigenstate. Nothing physical is “following” the head; the state simply has no azimuth to misalign."
        },
        {
          type: "p",
          text:
            "The same reasoning explains the viewing-angle problem. A viewer far off the projector axis sees the screen at an oblique angle, and the reflection can change the polarization state. The glasses are also designed for near-normal incidence. Both effects grow with angle, so a circular system can be excellent in the centre of the auditorium and noticeably worse at the edges. A real installation trades screen gain, viewing cone and polarization preservation against one another."
        }
      ]
    },

    {
      id: "cinema-other",
      number: "5.13",
      title: "Active shutter, anaglyph and the rest of the stereo toolbox",
      kicker: "Alternatives and their trade-offs",
      blocks: [
        {
          type: "p",
          text:
            "Passive polarization is only one way to separate stereo channels. Active shutter glasses alternate a liquid-crystal shutter over each eye in synchrony with the display, which shows left and right frames alternately. The separation is temporal rather than polarization-based, so no special screen is required, but the glasses need power, a receiver and a sync signal, and they are heavier. Crosstalk comes from shutter response time, backlight persistence and sync errors rather than from polarization leakage."
        },
        {
          type: "p",
          text:
            "Anaglyph glasses use colour filters — traditionally red and cyan — to separate channels encoded in complementary colour bands. The method works on any screen and any projector, but it destroys colour fidelity and is now mainly a low-cost or archival format. Spectral-interference systems use narrow, interleaved wavelength bands and can preserve colour better, but they need matched filters and a high-performance projector. Autostereoscopic displays use parallax barriers or lenticular arrays to send different views in different directions, removing the glasses entirely at the cost of viewing position and resolution."
        },
        {
          type: "table",
          caption: "Stereo separation technologies compared. The entries are qualitative because the right choice depends on the venue, not on a universal ranking.",
          head: ["Technology", "Separation", "Screen requirement", "Head tilt", "Main crosstalk source"],
          rows: [
            ["Passive linear", "orthogonal linear states", "polarization-preserving", "poor", "head tilt, screen depolarization"],
            ["Passive circular", "orthogonal circular states", "polarization-preserving", "good", "quarter-wave error, screen depolarization"],
            ["Active shutter", "time multiplexing", "ordinary", "good", "shutter response, sync"],
            ["Anaglyph", "colour bands", "ordinary", "good", "colour overlap"],
            ["Spectral interference", "narrow wavelength bands", "matched filters", "good", "filter overlap, projector spectrum"],
            ["Autostereoscopic", "spatial views", "none", "position-dependent", "view overlap, resolution"]
          ],
          align: ["l", "l", "l", "l", "l"]
        },
        {
          type: "p",
          text:
            "Brightness is a universal tax. A passive system puts a polarizer in front of each projector channel, so at least half of unpolarized projector light is discarded before it reaches the screen; the analyser in each lens then passes most of its own channel but must block the other, so the separation — not the transmission — is the constraint, and the screen adds reflection loss. An active system avoids the screen polarizer but divides the time between two eyes. Either way, a stereo presentation is dimmer than the same projector in 2D, which is why cinema projection is designed around a large light budget."
        },
        {
          type: "callout",
          tone: "note",
          title: "No universal winner",
          body:
            "The best technology depends on the venue: a large auditorium with many seats favours cheap passive circular glasses and a silver screen; a small lab with an ordinary screen favours active shutter; a printed figure may use anaglyph because it must survive reproduction. The physics in this experiment is the same projection algebra in every case."
        }
      ]
    },

    {
      id: "metrology",
      number: "5.14",
      title: "Measuring polarization without fooling yourself",
      kicker: "Nulls, offsets and calibration",
      blocks: [
        {
          type: "p",
          text:
            "A polarization measurement is an intensity measurement with an angular label. The quality of the result is therefore set by the same things that limit any photodiode measurement — dark offset, linearity, stray light, drift — plus the angular accuracy of the mounts. The most sensitive measurements are nulls: rotate the analyser to the minimum and read the angle, rather than trying to measure a small intensity on a large background."
        },
        {
          type: "steps",
          items: [
            {
              title: "Zero the detector",
              body: "Block the beam and record the dark reading at the same gain and integration time you will use. Subtract it from every point, including the “zero” of the extinction measurement."
            },
            {
              title: "Find the source axis",
              body: "With only the first polarizer in the beam, rotate it until the photodiode reads maximum. That is the source's polarization axis if the source is linearly polarized; if the reading is flat, the source is unpolarized or circular and a polarizer alone cannot define an axis."
            },
            {
              title: "Calibrate the analyser scale",
              body: "Set the polarizer to a known mark, then rotate the analyser to the minimum. Record the scale reading as the crossed position. All later analyser angles are relative to that null, not to the engraving on the mount."
            },
            {
              title: "Check linearity",
              body: "Use a neutral-density filter or a second polarizer to produce a known fraction of the maximum and confirm that the detector reading scales. A saturated photodiode will flatten the top of the Malus curve and bias the fit."
            },
            {
              title: "Repeat at a second power",
              body: "If the fitted extinction ratio changes with beam power, suspect detector nonlinearity, stray light or a thermal drift in the polarizer. A genuine extinction ratio is a property of the pair at that wavelength."
            }
          ]
        },
        {
          type: "p",
          text:
            "For a full Stokes measurement, the circular analyser needs its own calibration. Build it from a quarter-wave plate and a linear polarizer, align the plate at 45° to the polarizer, and verify that it blocks one circular state and passes the other. A quick check is to rotate the resulting circular analyser: the reading should be nearly independent of its rotation about the beam. If it is not, the plate is not at 45° or is not quarter-wave at the operating wavelength."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Stray light sets the extinction floor",
          body:
            "A 40 dB polarizer pair measured in a lit room can easily read 30 dB because room light reaches the detector around the polarizers. Shield the detector, use an aperture, and measure the stray background with the laser blocked but the room lights on."
        }
      ]
    },

    {
      id: "bench",
      number: "5.15",
      title: "The bench as built",
      kicker: "Alignment, inventory and honest limits",
      blocks: [
        {
          type: "p",
          text:
            "The optical train is deliberately simple: source → polarizer → wave plate → analyser → photodiode, all on a common beam height. The source is a low-power visible laser. The polarizer and analyser sit in rotation mounts with readable scales; the wave plate sits between them in a third mount. A beam block at the end of the train is not optional."
        },
        {
          type: "p",
          text:
            "Alignment rules are the usual ones. Keep the beam parallel to the table and at the height of the mounts. Make every element normal to the beam so that the beam does not walk when the mount rotates. Centre the beam on the rotation axis: a beam offset from the axis traces a circle as the mount turns, which changes the overlap with the detector and mimics a polarization signal. Remove or block unnecessary reflections; a back-reflection from a polarizer can re-enter the laser and destabilise it."
        },
        {
          type: "p",
          text:
            "The photodiode should be operated in a linear regime. A transimpedance amplifier gives a voltage proportional to photocurrent; check the saturation point with a neutral-density filter and stay well below it. The detector's own polarization sensitivity is usually small but not zero; rotate the detector once with a fixed polarized input to check. Record the wavelength and the plate's design wavelength, because a retarder is only what its label says at that wavelength."
        },
        {
          type: "p",
          text:
            "What the kit can do: measure Malus curves, extinction ratios, wave-plate rotation laws, retardance by transmission, Stokes parameters, stress birefringence and stereo crosstalk. What it cannot do: absolute retardance without a calibrated reference, single-photon measurements, or a faithful reproduction of a commercial cinema. Those limits are part of the experiment, not a defect."
        },
        {
          type: "callout",
          tone: "lab",
          title: "Laser safety in one paragraph",
          body:
            "Use the lowest power that gives a good signal. Wear wavelength-appropriate eyewear if the beam can leave the table. Never look into the beam or a specular reflection. Keep the beam below eye height and block it at the end of the train. Remove reflective jewellery and watches from the beam path. A visible beam is not a safe beam."
        }
      ]
    },

    {
      id: "quantum",
      number: "5.16",
      title: "Polarization as a resource",
      kicker: "From the bench to the qubit",
      blocks: [
        {
          type: "p",
          text:
            "The two-component Jones vector is mathematically a qubit. The Poincaré sphere is the Bloch sphere; orthogonal polarization states are orthogonal basis states; a wave plate is a unitary rotation; a polarizer is a projective measurement. This is not an analogy invented for teaching — it is the same Hilbert space, and it is why polarization is the workhorse of table-top quantum optics."
        },
        {
          type: "p",
          text:
            "BB84 encodes each bit in one of two polarization bases and reveals eavesdropping through the error rate. The quantum eraser uses polarization to mark which path a photon took and then erases the mark. Bell tests use polarization correlations. None of those experiments is performed here: this module uses a classical, attenuated coherent beam and measures intensities. The classical model is the correct description of what the apparatus actually does, and the quantum language becomes appropriate only when the source and detectors are genuinely single-photon."
        },
        {
          type: "p",
          text:
            "Outside quantum optics, polarization is a practical metrology channel. Ellipsometry measures thin-film thickness and refractive index from the change in polarization on reflection, with sub-nanometre sensitivity. Polarimetric imaging separates surface reflections from subsurface scattering and reveals stress, orientation and material boundaries. Liquid-crystal displays are polarization modulators sandwiched between polarizers. Stress analysis in structural glass and photoelasticity in engineering use the same polariscope that this experiment builds."
        },
        {
          type: "callout",
          tone: "note",
          title: "The honest boundary",
          body:
            "Everything measured in phases 2–6 is a classical intensity. The quantum discussion is there to show where the mathematics leads, not to claim that the kit is a quantum apparatus. A photodiode cannot count photons, and a coherent laser is not a single-photon source."
        }
      ]
    }
  ],

  equations: [
    {
      id: "eq-em",
      name: "Plane wave and its complex amplitude",
      latex:
        "\\mathbf{E}(z,t)=\\operatorname{Re}\\left\\{\\begin{bmatrix}E_{0x}e^{i\\varphi_x}\\\\E_{0y}e^{i\\varphi_y}\\end{bmatrix}e^{i(kz-\\omega t)}\\right\\}",
      symbols: [
        { symbol: "\\mathbf{E}", meaning: "electric field vector", unit: "V m⁻¹" },
        { symbol: "E_{0x},E_{0y}", meaning: "peak amplitudes along x and y", unit: "V m⁻¹" },
        { symbol: "\\varphi_x,\\varphi_y", meaning: "component phases", unit: "rad" },
        { symbol: "k", meaning: "wavenumber 2π/λ", unit: "m⁻¹" },
        { symbol: "\\omega", meaning: "angular frequency 2πf", unit: "s⁻¹" },
        { symbol: "z,t", meaning: "propagation coordinate and time", unit: "m, s" }
      ],
      interpretation:
        "A monochromatic plane wave travelling along +z has only transverse components. The two complex amplitudes form the Jones vector; their relative phase and amplitude ratio determine the polarization ellipse.",
      assumptions: [
        "Homogeneous, isotropic, non-absorbing medium.",
        "Plane wave, propagation exactly along z.",
        "The time dependence is e^{−iωt} in this display; the code's Jones algebra is equivalent up to a global conjugation and a stated handedness convention."
      ],
      usedIn: ["5.1", "5.2", "5.6"],
      numericExample: {
        statement: "For λ = 632.8 nm, k = 2π/λ = 9.93 × 10⁶ m⁻¹ and ω = ck = 2.98 × 10¹⁵ s⁻¹.",
        latex: "k=9.93\\times10^{6}\\ \\mathrm{m^{-1}},\\quad \\omega=2.98\\times10^{15}\\ \\mathrm{s^{-1}}"
      }
    },
    {
      id: "eq-jones",
      name: "Normalized Jones vector",
      latex:
        "\\mathbf{J}=\\frac{1}{\\sqrt{|E_x|^2+|E_y|^2}}\\begin{bmatrix}E_x\\\\E_y\\end{bmatrix},\\qquad I\\propto|E_x|^2+|E_y|^2",
      symbols: [
        { symbol: "\\mathbf{J}", meaning: "normalized Jones vector", unit: "dimensionless" },
        { symbol: "E_x,E_y", meaning: "complex transverse field components", unit: "V m⁻¹" },
        { symbol: "I", meaning: "intensity", unit: "W m⁻²" }
      ],
      interpretation:
        "Normalization removes the intensity degree of freedom; the remaining three real numbers are the two angles of the ellipse and the overall phase. A global phase multiplies the whole vector and is unobservable.",
      assumptions: ["Fully polarized, coherent light.", "A definite phase relation between the components."],
      usedIn: ["5.2", "5.6"],
      numericExample: {
        statement: "D = [1, 1]ᵀ/√2 has |E_x|² = |E_y|² = 0.5 and total intensity 1 in normalized units.",
        latex: "\\mathbf{J}_D=\\tfrac{1}{\\sqrt2}\\begin{bmatrix}1\\\\1\\end{bmatrix}"
      }
    },
    {
      id: "eq-malus",
      name: "Malus's law",
      latex: "I(\\theta)=I_0\\cos^2\\theta",
      symbols: [
        { symbol: "I_0", meaning: "intensity transmitted when the analyser is aligned with the input linear state", unit: "W" },
        { symbol: "\\theta", meaning: "angle between the input linear polarization and the analyser axis", unit: "rad or °" },
        { symbol: "I(\\theta)", meaning: "transmitted intensity", unit: "W" }
      ],
      interpretation:
        "The analyser projects the field onto its axis. The amplitude is multiplied by cos θ and the intensity by cos²θ. At 45° half the intensity passes; at 90° the ideal transmission is zero.",
      assumptions: ["Linear input state.", "Ideal analyser with zero leakage.", "Normal incidence and no absorption other than the projection."],
      usedIn: ["5.3", "5.6", "5.11"],
      numericExample: {
        statement: "5.00 mW at 30° gives 5.00 × 0.750 = 3.75 mW.",
        latex: "P=5.00\\cos^2 30^\\circ=3.75\\ \\mathrm{mW}"
      }
    },
    {
      id: "eq-polarizer",
      name: "Jones matrix of a linear polarizer",
      latex:
        "P(\\theta)=\\begin{bmatrix}\\cos^2\\theta&\\sin\\theta\\cos\\theta\\\\\\sin\\theta\\cos\\theta&\\sin^2\\theta\\end{bmatrix}",
      symbols: [
        { symbol: "P(\\theta)", meaning: "2×2 Jones projector onto the axis at θ", unit: "dimensionless" },
        { symbol: "\\theta", meaning: "transmission-axis angle from x", unit: "rad or °" }
      ],
      interpretation:
        "P is Hermitian and idempotent: P† = P and P² = P. It is singular, so it destroys one component and reduces the intensity. Applying it twice is the same as applying it once.",
      assumptions: ["Ideal polarizer, zero leakage, no absorption of the transmitted component.", "Normal incidence, no depolarization."],
      usedIn: ["5.3", "5.6"],
      numericExample: {
        statement: "P(45°) applied to H gives [0.5, 0.5]ᵀ, intensity 0.5.",
        latex: "\\tfrac12\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}\\begin{bmatrix}1\\\\0\\end{bmatrix}=\\begin{bmatrix}0.5\\\\0.5\\end{bmatrix}"
      }
    },
    {
      id: "eq-retarder",
      name: "Jones matrix of a retarder",
      latex:
        "W(\\theta,\\delta)=R(\\theta)\\,\\operatorname{diag}(1,e^{i\\delta})\\,R(-\\theta),\\qquad R(\\phi)=\\begin{bmatrix}\\cos\\phi&-\\sin\\phi\\\\\\sin\\phi&\\cos\\phi\\end{bmatrix}",
      symbols: [
        { symbol: "W", meaning: "retarder Jones matrix", unit: "dimensionless" },
        { symbol: "\\theta", meaning: "fast-axis angle from x", unit: "rad or °" },
        { symbol: "\\delta", meaning: "retardance, phase delay of the slow axis relative to the fast axis", unit: "rad" },
        { symbol: "R", meaning: "coordinate rotation matrix", unit: "dimensionless" }
      ],
      interpretation:
        "Rotate into the plate frame, apply the phase to the slow axis, rotate back. W is unitary for real δ, so it changes the ellipse without changing the intensity. At θ = 45° and δ = π it becomes the exchange matrix; at δ = π/2 it turns H into circular light.",
      assumptions: ["Lossless, homogeneous retarder.", "Principal axes fixed and known.", "Single wavelength; δ is wavelength dependent."],
      usedIn: ["5.5", "5.6", "5.12"],
      numericExample: {
        statement: "W(45°, π) = [[0,1],[1,0]], so H → V. W(45°, π/2) sends H to [ (1+i)/2, (1−i)/2 ]ᵀ, a circular state with |S₃| = 1.",
        latex: "W(45^\\circ,\\pi)=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}"
      }
    },
    {
      id: "eq-retardance",
      name: "Retardance of a birefringent plate",
      latex: "\\delta=\\frac{2\\pi\\,\\Delta n\\,d}{\\lambda}",
      symbols: [
        { symbol: "\\delta", meaning: "retardance", unit: "rad" },
        { symbol: "\\Delta n", meaning: "birefringence |n_e − n_o|", unit: "dimensionless" },
        { symbol: "d", meaning: "plate thickness", unit: "m" },
        { symbol: "\\lambda", meaning: "vacuum wavelength", unit: "m" }
      ],
      interpretation:
        "The two principal components accumulate a phase difference proportional to the birefringence and the path. A quarter-wave plate has δ = π/2; a half-wave plate has δ = π. Because Δn and λ both vary, δ is specified at a design wavelength.",
      assumptions: ["Uniaxial crystal, light at normal incidence.", "Single pass through the plate.", "No stress or temperature contribution beyond the stated Δn."],
      usedIn: ["5.5", "5.10"],
      numericExample: {
        statement: "Quartz with Δn = 0.0090 at 589 nm needs d = 589 nm/(4 × 0.0090) = 16.4 µm for a quarter wave.",
        latex: "d=\\frac{\\lambda}{4\\Delta n}=16.4\\ \\mu\\mathrm{m}"
      }
    },
    {
      id: "eq-stokes-jones",
      name: "Stokes parameters from a Jones vector",
      latex:
        "\\begin{aligned}S_0&=|E_x|^2+|E_y|^2,\\\\ S_1&=|E_x|^2-|E_y|^2,\\\\ S_2&=2\\operatorname{Re}(E_xE_y^{*}),\\\\ S_3&=-2\\operatorname{Im}(E_xE_y^{*})\\end{aligned}",
      symbols: [
        { symbol: "S_0", meaning: "total intensity", unit: "W" },
        { symbol: "S_1", meaning: "x-minus-y linear difference", unit: "W" },
        { symbol: "S_2", meaning: "+45°-minus-−45° linear difference", unit: "W" },
        { symbol: "S_3", meaning: "circular handedness difference", unit: "W" }
      ],
      interpretation:
        "For a pure state the four numbers satisfy S₀² = S₁² + S₂² + S₃². The normalized vector (S₁,S₂,S₃)/S₀ is a point on the Poincaré sphere. S₃ is the only parameter a linear analyser cannot access.",
      assumptions: ["Fully polarized, coherent field for this form.", "The sign of S₃ follows the stated convention."],
      usedIn: ["5.7", "5.8"],
      numericExample: {
        statement: "H gives (1,1,0,0); D gives (1,0,1,0); R gives (1,0,0,1).",
        latex: "S_H=(1,1,0,0),\\quad S_D=(1,0,1,0),\\quad S_R=(1,0,0,1)"
      }
    },
    {
      id: "eq-stokes-measure",
      name: "Stokes parameters from six analyser readings",
      latex:
        "\\begin{aligned}S_0&=I_0+I_{90},\\\\ S_1&=I_0-I_{90},\\\\ S_2&=I_{45}-I_{135},\\\\ S_3&=I_R-I_L\\end{aligned}",
      symbols: [
        { symbol: "I_0,I_{90}", meaning: "transmissions through linear analysers at 0° and 90°", unit: "W" },
        { symbol: "I_{45},I_{135}", meaning: "transmissions through linear analysers at 45° and 135°", unit: "W" },
        { symbol: "I_R,I_L", meaning: "transmissions through right- and left-circular analysers", unit: "W" }
      ],
      interpretation:
        "A complete polarization measurement is six intensity readings. The circular analyser is a quarter-wave plate plus a linear polarizer; without it S₃ cannot be determined. The redundancy S₀ = I₀ + I₉₀ = I₄₅ + I₁₃₅ is a useful consistency check.",
      assumptions: ["Each reading uses the same input power and detector gain.", "Dark offsets removed.", "Analyser angles calibrated relative to the same reference."],
      usedIn: ["5.7", "5.14"],
      numericExample: {
        statement: "I₀ = 1.00, I₉₀ = 0.20 gives S₀ = 1.20 and S₁ = 0.80.",
        latex: "S_0=1.20,\\quad S_1=0.80"
      }
    },
    {
      id: "eq-dop",
      name: "Degree of polarization",
      latex: "\\mathcal{P}=\\frac{\\sqrt{S_1^2+S_2^2+S_3^2}}{S_0}",
      symbols: [
        { symbol: "\\mathcal{P}", meaning: "degree of polarization, 0–1", unit: "dimensionless" },
        { symbol: "S_0", meaning: "total intensity", unit: "W" },
        { symbol: "S_1,S_2,S_3", meaning: "polarization differences", unit: "W" }
      ],
      interpretation:
        "P = 1 means a pure state; P = 0 means unpolarized; intermediate values mean a mixture of a polarized and an unpolarized component. A retarder rotates the Stokes vector but leaves P unchanged.",
      assumptions: ["The Stokes vector refers to the same beam and the same measurement bandwidth."],
      usedIn: ["5.2", "5.7"],
      numericExample: {
        statement: "S = (1.20, 0.80, 0, −0.20) gives P = 0.825/1.20 = 0.688.",
        latex: "\\mathcal{P}=\\frac{\\sqrt{0.80^2+0.20^2}}{1.20}=0.688"
      }
    },
    {
      id: "eq-az-el",
      name: "Azimuth and ellipticity of the polarization ellipse",
      latex:
        "\\psi=\\tfrac12\\operatorname{atan2}(S_2,S_1),\\qquad \\chi=\\tfrac12\\arcsin\\!\\left(\\frac{S_3}{S_0}\\right)",
      symbols: [
        { symbol: "\\psi", meaning: "azimuth of the major axis", unit: "rad or °" },
        { symbol: "\\chi", meaning: "ellipticity angle; 0 linear, ±45° circular", unit: "rad or °" },
        { symbol: "S_1,S_2,S_3", meaning: "Stokes differences", unit: "W" }
      ],
      interpretation:
        "These are the two angles that locate a pure state on the Poincaré sphere: longitude 2ψ, latitude 2χ. The semi-axis ratio of the ellipse is |tan χ|; the sign of χ is the handedness.",
      assumptions: ["S₀ > 0.", "The stated Stokes sign convention."],
      usedIn: ["5.7"],
      numericExample: {
        statement: "For S = (1.20, 0.80, 0, −0.20), ψ = 0° and χ = ½ asin(−1/6) = −4.8°.",
        latex: "\\psi=0^\\circ,\\quad \\chi=-4.8^\\circ"
      }
    },
    {
      id: "eq-mueller-pol",
      name: "Mueller matrix of a linear polarizer",
      latex:
        "M_P(\\theta)=\\frac12\\begin{bmatrix}1&\\cos2\\theta&\\sin2\\theta&0\\\\ \\cos2\\theta&\\cos^22\\theta&\\sin2\\theta\\cos2\\theta&0\\\\ \\sin2\\theta&\\sin2\\theta\\cos2\\theta&\\sin^22\\theta&0\\\\ 0&0&0&0\\end{bmatrix}",
      symbols: [
        { symbol: "M_P", meaning: "4×4 Mueller matrix", unit: "dimensionless" },
        { symbol: "\\theta", meaning: "transmission-axis angle", unit: "rad or °" }
      ],
      interpretation:
        "For unpolarized input (1,0,0,0) the output is (½, ½cos2θ, ½sin2θ, 0): half the intensity, fully polarized. M_P is idempotent. It acts on any Stokes vector, including partially polarized ones.",
      assumptions: ["Ideal linear polarizer.", "Intensity basis with S₀ in the same units as the input."],
      usedIn: ["5.8"],
      numericExample: {
        statement: "At θ = 0 the matrix transmits S₀/2 and S₁/2, with no S₂ or S₃ output.",
        latex: "M_P(0)\\,(1,0,0,0)^{\\mathsf T}=(0.5,0.5,0,0)^{\\mathsf T}"
      }
    },
    {
      id: "eq-mueller-ret",
      name: "Mueller matrix of a retarder",
      latex:
        "M_W(\\theta,\\delta)=\\begin{bmatrix}1&0&0&0\\\\ 0&c^2+s^2\\cos\\delta&cs(1-\\cos\\delta)&-s\\sin\\delta\\\\ 0&cs(1-\\cos\\delta)&s^2+c^2\\cos\\delta&c\\sin\\delta\\\\ 0&s\\sin\\delta&-c\\sin\\delta&\\cos\\delta\\end{bmatrix}",
      symbols: [
        { symbol: "c", meaning: "cos 2θ", unit: "dimensionless" },
        { symbol: "s", meaning: "sin 2θ", unit: "dimensionless" },
        { symbol: "\\delta", meaning: "retardance", unit: "rad" }
      ],
      interpretation:
        "A rotation of the Stokes vector in the S₁–S₂–S₃ space. It preserves S₀ and the degree of polarization. The signs of the sin δ terms follow this module's handedness convention; reversing the convention reverses the sign of δ.",
      assumptions: ["Lossless retarder.", "No depolarization.", "Same convention for S₃ as eq. 5.8."],
      usedIn: ["5.8", "5.12"],
      numericExample: {
        statement: "At θ = 0 and δ = 90°, an H state lies along the fast axis and is unchanged: S₃ stays zero.",
        latex: "M_W(0,90^\\circ)\\,(1,1,0,0)^{\\mathsf T}=(1,1,0,0)^{\\mathsf T}"
      }
    },
    {
      id: "eq-brewster",
      name: "Brewster's angle",
      latex: "\\tan\\theta_B=\\frac{n_2}{n_1}",
      symbols: [
        { symbol: "\\theta_B", meaning: "Brewster angle measured from the normal", unit: "rad or °" },
        { symbol: "n_1,n_2", meaning: "refractive indices of the incident and transmitting media", unit: "dimensionless" }
      ],
      interpretation:
        "At this incidence the reflected p-component vanishes and the reflected beam is s-polarized. It follows from the Fresnel coefficients and the condition that the reflected and refracted rays are perpendicular.",
      assumptions: ["Planar interface between two homogeneous dielectrics.", "Clean surface, no film.", "Light incident from medium 1."],
      usedIn: ["5.4"],
      numericExample: {
        statement: "Air to glass with n = 1.52 gives θ_B = arctan 1.52 = 56.7°.",
        latex: "\\theta_B=\\arctan(1.52)=56.7^\\circ"
      }
    },
    {
      id: "eq-extinction",
      name: "Extinction ratio",
      latex: "ER_{\\mathrm{dB}}=10\\log_{10}\\!\\left(\\frac{I_{\\max}}{I_{\\min}}\\right)",
      symbols: [
        { symbol: "ER_{\\mathrm{dB}}", meaning: "extinction ratio in decibels", unit: "dB" },
        { symbol: "I_{\\max}", meaning: "transmission with the pair aligned", unit: "W" },
        { symbol: "I_{\\min}", meaning: "transmission with the pair crossed", unit: "W" }
      ],
      interpretation:
        "A 30 dB pair leaks 10⁻³ of the maximum intensity; 40 dB leaks 10⁻⁴. The ratio is a property of the pair, the wavelength and the beam geometry, not of one polarizer alone.",
      assumptions: ["Both readings use the same beam, detector gain and dark offset.", "The beam is well collimated and centred.", "Stray light is negligible compared with I_min."],
      usedIn: ["5.3", "5.14", "5.11"],
      numericExample: {
        statement: "I_max = 800 µW and I_min = 0.80 µW give ER = 30.0 dB.",
        latex: "ER=10\\log_{10}(1000)=30\\ \\mathrm{dB}"
      }
    },
    {
      id: "eq-crosstalk",
      name: "Stereo crosstalk and contrast",
      latex:
        "\\mathrm{XT}=\\frac{I_{\\mathrm{leak}}}{I_{\\mathrm{want}}+I_{\\mathrm{leak}}},\\qquad C=\\frac{I_{\\mathrm{want}}}{I_{\\mathrm{leak}}}",
      symbols: [
        { symbol: "\\mathrm{XT}", meaning: "crosstalk, the leaked fraction of the light in one eye", unit: "dimensionless or %" },
        { symbol: "I_{\\mathrm{want}}", meaning: "this eye's own image intensity", unit: "W" },
        { symbol: "I_{\\mathrm{leak}}", meaning: "the opposite image's intensity in this eye", unit: "W" },
        { symbol: "C", meaning: "wanted-to-leak contrast ratio", unit: "dimensionless" }
      ],
      interpretation:
        "XT is the fraction of the total light in one eye that belongs to the wrong image. C is its reciprocal-like ratio. Both are per-eye quantities; a single number is an average over the two eyes.",
      assumptions: ["The two channels add incoherently.", "Intensities are measured at the same retinal position and with the same spectral weighting.", "Viewer perception is not modelled."],
      usedIn: ["5.11", "5.12", "5.13"],
      numericExample: {
        statement: "I_want = 0.99 and I_leak = 0.01 give XT = 1.0 % and C = 99.",
        latex: "\\mathrm{XT}=0.01/1.00=1.0\\%,\\quad C=99"
      }
    }
  ],

  derivations: [
    {
      id: "der-malus",
      title: "Malus's law from a projection",
      intro:
        "The result follows from the dot product of the field with the analyser axis; no additional physical assumption is needed beyond an ideal polarizer.",
      steps: [
        {
          label: "1",
          text: "Let the input be a linear state with complex amplitude E₀ along unit vector û_in, and let the analyser axis be û_a. Choose the real phase reference so that E_in = E₀ û_in.",
          latex: "\\mathbf{E}_{\\mathrm{in}}=E_0\\hat{u}_{\\mathrm{in}}"
        },
        {
          label: "2",
          text: "An ideal polarizer transmits only the component along its axis. That is the scalar projection of the input onto û_a.",
          latex: "\\mathbf{E}_{\\mathrm{out}}=(\\mathbf{E}_{\\mathrm{in}}\\cdot\\hat{u}_a)\\,\\hat{u}_a=E_0\\cos\\theta\\,\\hat{u}_a"
        },
        {
          label: "3",
          text: "Intensity is proportional to the squared field amplitude, and û_a is a unit vector.",
          latex: "I_{\\mathrm{out}}\\propto|\\mathbf{E}_{\\mathrm{out}}|^2=E_0^2\\cos^2\\theta"
        },
        {
          label: "4",
          text: "Define I₀ as the intensity that would pass with θ = 0. Then",
          latex: "I(\\theta)=I_0\\cos^2\\theta"
        }
      ],
      result: {
        latex: "I(\\theta)=I_0\\cos^2\\theta",
        text: "Two ideal polarizers at angle θ transmit cos²θ of the light that the first one passed. At 45° this is half; at 90° it is zero."
      },
      assumptions: [
        "Ideal polarizer with zero leakage and no absorption of the transmitted component.",
        "Fully polarized linear input; unpolarized input first requires the 50 % factor from the first polarizer.",
        "Normal incidence."
      ]
    },
    {
      id: "der-waveplate",
      title: "The wave-plate matrix and the quarter-wave circular condition",
      intro:
        "A retarder is diagonal in its own principal-axis frame. The laboratory matrix is obtained by rotating into that frame and back.",
      steps: [
        {
          label: "1",
          text: "In the plate frame the fast axis has phase delay 0 and the slow axis has delay δ. The matrix is diagonal.",
          latex: "W_{\\mathrm{frame}}=\\begin{bmatrix}1&0\\\\0&e^{i\\delta}\\end{bmatrix}"
        },
        {
          label: "2",
          text: "The plate's fast axis is at angle θ from the laboratory x axis. Rotate the field into the plate frame with R(−θ), apply the diagonal matrix, and rotate back with R(θ).",
          latex: "W(\\theta,\\delta)=R(\\theta)\\,W_{\\mathrm{frame}}\\,R(-\\theta)"
        },
        {
          label: "3",
          text: "For θ = 45° and δ = π, cos 2θ = 0 and sin 2θ = 1. The matrix reduces to the exchange matrix.",
          latex: "W(45^\\circ,\\pi)=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}"
        },
        {
          label: "4",
          text: "Apply it to H = [1,0]ᵀ.",
          latex: "W(45^\\circ,\\pi)\\begin{bmatrix}1\\\\0\\end{bmatrix}=\\begin{bmatrix}0\\\\1\\end{bmatrix}=V"
        },
        {
          label: "5",
          text: "For a quarter-wave plate set δ = π/2 at the same 45° orientation and apply to H. The two components have equal magnitude and a 90° relative phase.",
          latex: "W(45^\\circ,\\tfrac{\\pi}{2})\\begin{bmatrix}1\\\\0\\end{bmatrix}=\\frac12\\begin{bmatrix}1+i\\\\1-i\\end{bmatrix}"
        },
        {
          label: "6",
          text: "Compute S₃ for that output. The cross term E_x E_y* is purely imaginary, so the state is circular.",
          latex: "S_3=-2\\operatorname{Im}(E_xE_y^{*})=\\pm1,\\qquad S_1=S_2=0"
        }
      ],
      result: {
        latex: "\\delta=\\pi\\;\\Rightarrow\\;\\text{H} \\to \\text{V at }45^\\circ,\\qquad \\delta=\\tfrac{\\pi}{2}\\;\\Rightarrow\\;\\text{H} \\to \\text{circular at }45^\\circ",
        text: "The half-wave plate reflects the linear state about its fast axis; the quarter-wave plate converts a 45° linear state into a circular one. The sign of S₃ depends on which axis is fast and on the handedness convention."
      },
      assumptions: [
        "Lossless, homogeneous plate with known principal axes.",
        "Single wavelength; δ is evaluated at the operating λ.",
        "Normal incidence and no stress birefringence from the mount."
      ]
    },
    {
      id: "der-stokes-poincare",
      title: "Stokes parameters, the Poincaré sphere and orthogonality",
      intro:
        "The four Stokes parameters are the coefficients of the field in the Pauli basis. Normalizing by S₀ gives a three-vector whose length is the degree of polarization.",
      steps: [
        {
          label: "1",
          text: "Write the field as a two-component complex vector and expand the four quadratic combinations.",
          latex: "S_0=|E_x|^2+|E_y|^2,\\quad S_1=|E_x|^2-|E_y|^2"
        },
        {
          label: "2",
          text: "The cross terms carry the relative phase. Splitting E_x E_y* into real and imaginary parts gives S₂ and S₃.",
          latex: "S_2=2\\operatorname{Re}(E_xE_y^{*}),\\qquad S_3=-2\\operatorname{Im}(E_xE_y^{*})"
        },
        {
          label: "3",
          text: "For a pure state the four terms satisfy an identity: the sum of the squares of the three differences equals the square of the total.",
          latex: "S_0^2=S_1^2+S_2^2+S_3^2"
        },
        {
          label: "4",
          text: "Divide by S₀ to obtain a unit vector. Its direction is the state, and its length is the degree of polarization for a mixed state.",
          latex: "\\hat{s}=\\frac{1}{S_0}(S_1,S_2,S_3),\\qquad |\\hat{s}|=\\mathcal{P}"
        },
        {
          label: "5",
          text: "The azimuth and ellipticity follow from the direction cosines of that vector.",
          latex: "S_1/S_0=\\cos2\\chi\\cos2\\psi,\\quad S_2/S_0=\\cos2\\chi\\sin2\\psi,\\quad S_3/S_0=\\sin2\\chi"
        },
        {
          label: "6",
          text: "Two pure states are orthogonal when their Jones inner product vanishes. In Stokes terms this is equivalent to antipodal points on the sphere.",
          latex: "|\\langle a|b\\rangle|^2=\\tfrac12\\big(1+\\hat{s}_a\\cdot\\hat{s}_b\\big)=0\\iff\\hat{s}_a=-\\hat{s}_b"
        }
      ],
      result: {
        latex: "\\hat{s}=(\\cos2\\chi\\cos2\\psi,\\ \\cos2\\chi\\sin2\\psi,\\ \\sin2\\chi),\\qquad \\hat{s}_a\\cdot\\hat{s}_b=-1\\iff\\langle a|b\\rangle=0",
        text: "Every pure state is a point on the unit sphere; orthogonal states are antipodal. Partial polarization moves the point inward by the degree of polarization."
      },
      assumptions: [
        "The Stokes vector describes a single beam in a fixed measurement bandwidth.",
        "The sign of S₃ follows the stated convention.",
        "For mixed states, the decomposition into polarized and unpolarized parts is used."
      ]
    },
    {
      id: "der-cinema",
      title: "Stereo channel separation with finite analyser extinction",
      intro:
        "A lens is an imperfect analyser. Its transmission for a state ŝ is a linear interpolation between full transmission and full extinction, and the head-tilt dependence enters through the dot product of the image and analyser Stokes axes.",
      steps: [
        {
          label: "1",
          text: "Let the analyser have principal intensity transmittances 1 (aligned) and ε (crossed). For a normalized state ŝ and analyser axis â, the transmission is a linear function of the projection.",
          latex: "T(\\hat{s},\\hat{a})=\\tfrac12\\big[(1+\\epsilon)+(1-\\epsilon)\\,\\hat{s}\\cdot\\hat{a}\\big]"
        },
        {
          label: "2",
          text: "A screen that fully depolarizes a fraction p scales the polarized part: ŝ_eff = (1−p)ŝ.",
          latex: "T=\\tfrac12\\big[(1+\\epsilon)+(1-\\epsilon)(1-p)\\,\\hat{s}\\cdot\\hat{a}\\big]"
        },
        {
          label: "3",
          text: "For linear stereo the left image is at +45° and the left analyser at +45° + β. Their Stokes vectors lie on the equator, so the dot product is cos 2β.",
          latex: "\\hat{s}_L=(0,1,0),\\quad \\hat{a}_L=(\\cos2(45^\\circ+\\beta),\\sin2(45^\\circ+\\beta),0),\\quad \\hat{s}_L\\cdot\\hat{a}_L=\\cos2\\beta"
        },
        {
          label: "4",
          text: "The orthogonal image has the opposite projection, so the wanted and leaked intensities are",
          latex: "I_{\\mathrm{want}}=\\tfrac12[(1+\\epsilon)+(1-\\epsilon)(1-p)\\cos2\\beta],\\quad I_{\\mathrm{leak}}=\\tfrac12[(1+\\epsilon)-(1-\\epsilon)(1-p)\\cos2\\beta]"
        },
        {
          label: "5",
          text: "For circular stereo the states and analysers lie on the S₃ axis. A head rotation about the beam does not move them, so the dot product is ±1 for every β.",
          latex: "\\hat{s}_L=(0,0,1),\\quad \\hat{a}_L=(0,0,1),\\quad \\hat{s}_L\\cdot\\hat{a}_L=1\\ \\text{for all }\\beta"
        },
        {
          label: "6",
          text: "At β = 0, or at any tilt for circular light, the crosstalk reduces to a simple function of ε and p.",
          latex: "\\mathrm{XT}=\\frac{\\epsilon+\\tfrac12(1-\\epsilon)p}{1+\\epsilon}"
        }
      ],
      result: {
        latex: "\\mathrm{XT}_{\\mathrm{linear}}(\\beta)=\\frac{(1+\\epsilon)-(1-\\epsilon)(1-p)\\cos2\\beta}{2(1+\\epsilon)},\\qquad \\mathrm{XT}_{\\mathrm{circ}}=\\frac{\\epsilon+\\tfrac12(1-\\epsilon)p}{1+\\epsilon}",
        text: "Head tilt enters linear stereo through cos 2β and is absent for circular stereo. Screen depolarization sets a floor that no glasses can remove. With ε = 10⁻³ and p = 0.02, the circular floor is about 1.1 % crosstalk."
      },
      assumptions: [
        "Each lens is a uniform partial analyser with a single extinction ratio.",
        "The screen depolarization is a single scalar, independent of angle and wavelength.",
        "The two channels are incoherent and add by intensity.",
        "No viewer perception threshold is assumed."
      ]
    }
  ],

  simulation: SIMULATION_SPEC,

  procedure: [
    {
      id: "prep",
      title: "Preparation, safety and inventory",
      purpose: "Establish a safe, aligned bench and confirm that every component is the one the procedure assumes.",
      steps: [
        {
          title: "Clear the table and post the beam path",
          detail:
            "Lay out source, two polarizers, half-wave plate, quarter-wave plate, three rotation mounts, photodiode and beam block. Keep the beam below eye height and block it before turning anything on.",
          caution: "Never leave a laser running unattended or unblocked, even at low power."
        },
        {
          title: "Verify the wave plates",
          detail:
            "Read the label on each plate: design wavelength, retardance and order. A plate marked for 532 nm is not quarter-wave at 632.8 nm. Record the label in the notebook; if the label is missing, treat the plate as unknown and calibrate it in phase 5.",
          checkpoint: "Both plate wavelengths match the source, or the mismatch is written down."
        },
        {
          title: "Align to a common beam height",
          detail:
            "Use two irises far apart to define the axis. Set every mount normal to the beam so that rotation does not walk the beam. Centre the beam on each rotation axis by checking that the spot on a distant screen does not move when the mount turns.",
          checkpoint: "Rotating each empty mount moves the spot by less than a millimetre at the detector."
        },
        {
          title: "Set the detector gain",
          detail:
            "Start with the beam blocked. Record the dark voltage. Unblock at low power and confirm the reading is below saturation. If the amplifier has a gain switch, keep it fixed for the whole scan.",
          caution: "A saturated photodiode produces a flat-topped Malus curve and a falsely high extinction ratio."
        }
      ]
    },
    {
      id: "extinction",
      title: "Polarizer/analyser extinction and zero reference",
      purpose: "Measure the best extinction the pair can deliver and establish the angular zero for every later scan.",
      steps: [
        {
          title: "Find the maximum",
          detail:
            "With only the two polarizers in the beam, rotate the analyser in 5° steps and find the approximate maximum. Refine in 1° steps. Record the angle and the maximum reading.",
          checkpoint: "A smooth maximum with a broad top, as expected for cos²."
        },
        {
          title: "Find the minimum",
          detail:
            "Rotate to the approximate crossed position and refine in 0.5° steps until the reading is smallest. Record the angle and the dark-corrected minimum. Repeat the minimum from both sides to check backlash.",
          caution: "Do not force the mount against its stop; backlash will bias the zero."
        },
        {
          title: "Compute the extinction ratio",
          detail:
            "Subtract the dark reading from both extrema, then compute ER_dB = 10 log₁₀(I_max/I_min). Compare with the expected order of magnitude for the polarizer type. If the result is much worse than expected, look for stray light, a non-collimated beam or a second polarizer left in the train.",
          checkpoint: "ER is stable when the beam power is halved with a neutral-density filter."
        },
        {
          title: "Define the analyser zero",
          detail:
            "Set the polarizer to its marked zero and the analyser to the crossed position found above. Write down the analyser scale reading that corresponds to 90° relative to the polarizer. All later analyser angles are relative to this null.",
          checkpoint: "The documented zero reproduces the minimum when the pair is reset from scratch."
        }
      ]
    },
    {
      id: "malus",
      title: "Malus quantitative scan",
      purpose: "Test the cos² law over the full range and fit I₀ and the angular offset.",
      steps: [
        {
          title: "Choose a fixed input state",
          detail:
            "Leave the polarizer at its zero. Remove the wave plates. Confirm that the beam entering the analyser is linearly polarized by checking that rotating the analyser gives deep nulls.",
          checkpoint: "The null is at least 100× deeper than the maximum."
        },
        {
          title: "Scan the analyser",
          detail:
            "Record the dark-corrected intensity at 0°, 10°, 20°, …, 180°. Take a repeat at 0° at the end to check drift. If the source power drifts, normalise each point to a monitor reading or repeat the scan quickly.",
          caution: "Keep the detector fixed; moving it changes the collected power."
        },
        {
          title: "Plot and inspect",
          detail:
            "Plot I versus analyser angle. The curve should be a shifted cos² with period 180°. A flattened top suggests saturation; a nonzero floor suggests stray light or finite extinction; an asymmetric curve suggests beam wander with rotation.",
          checkpoint: "The minima are at the crossed position ± 1° and the maxima at the parallel position ± 1°."
        },
        {
          title: "Fit the model",
          detail:
            "Fit I = I₀ cos²(θ − θ₀) + I_dark, allowing θ₀ to absorb the scale zero. Report I₀, θ₀, the dark offset and R². Compare I_dark with the measured dark reading.",
          checkpoint: "R² > 0.995 and the residuals show no systematic trend."
        }
      ]
    },
    {
      id: "halfwave",
      title: "Half-wave plate rotation",
      purpose: "Verify the 2θ rotation law and the crossed-polarizer recovery.",
      steps: [
        {
          title: "Set the plate between parallel polarizers",
          detail:
            "Place the half-wave plate between the polarizer and analyser, both at 0°. Rotate the plate and record the transmitted intensity. At plate angles 0° and 90° the input is along a principal axis and the output stays H; at 45° it becomes V and the parallel analyser extinguishes it.",
          checkpoint: "Minima at 45° and 135°, maxima at 0°, 90° and 180°."
        },
        {
          title: "Cross the polarizers and recover 50 %",
          detail:
            "Set the analyser to 90° so the pair is crossed and the transmission is at its floor. Insert the half-wave plate at 22.5°. The plate rotates H by 45° to D, and the vertical analyser transmits cos²45° = 50 %.",
          checkpoint: "Transmission returns to 50 % ± 2 % of the parallel-polarizer value."
        },
        {
          title: "Scan the plate angle",
          detail:
            "With the polarizers crossed, scan the plate from 0° to 180° in 5° steps. The transmission should follow sin²(2θ) sin²(δ/2); for an ideal half-wave plate this is sin²(2θ). Record the maxima and minima.",
          checkpoint: "Four maxima and four minima per full turn, as sin²(2θ) predicts."
        },
        {
          title: "Estimate the retardance error",
          detail:
            "If the minima are not zero, the plate is not exactly half-wave at the source wavelength or the polarizers are not perfectly crossed. Use T_min at the plate minimum to bound the retardance error, and compare with the plate specification.",
          caution: "A multi-order plate can be half-wave at one wavelength and noticeably off at another."
        }
      ]
    },
    {
      id: "quarterwave",
      title: "Quarter-wave plate: circular light and handedness",
      purpose: "Generate circular polarization, verify it with a rotating analyser, and determine the handedness.",
      steps: [
        {
          title: "Set the plate at 45°",
          detail:
            "With the polarizer at 0°, place the quarter-wave plate at 45° and remove the analyser. The output should be circular. Rotate a linear analyser through a full turn: the transmitted intensity should be nearly constant at half the input.",
          checkpoint: "Peak-to-peak variation of the analyser scan is less than 5 % of the mean."
        },
        {
          title: "Compare with 0° and 90°",
          detail:
            "At plate angles 0° and 90° the linear input lies along a principal axis, so the output remains linear. The analyser scan should show deep nulls. This contrast between 0°/90° and 45° is the signature of a quarter-wave plate.",
          checkpoint: "Nulls at 0°/90°, flat response at 45°."
        },
        {
          title: "Determine the handedness",
          detail:
            "Build a circular analyser: quarter-wave plate at 45° followed by a linear polarizer. Measure the transmitted intensity for the two possible relative orientations of the two quarter-wave plates. The orientation that transmits is the handedness of the generated state; the other should be close to the extinction floor.",
          caution: "Label the input face of each plate; flipping a plate reverses the handedness interpretation."
        },
        {
          title: "Check wavelength sensitivity",
          detail:
            "If a second source is available, repeat at the other wavelength. The ellipticity will degrade if the plate is not quarter-wave there. Record the degradation as a fraction of the peak-to-peak analyser modulation.",
          checkpoint: "The degradation is consistent with the plate's specified retardance at the second wavelength."
        }
      ]
    },
    {
      id: "stress",
      title: "Stress birefringence in glass and coverslip",
      purpose: "Turn an ordinary sample into a visible retarder and interpret the fringe pattern.",
      steps: [
        {
          title: "Set a dark-field polariscope",
          detail:
            "Cross the polarizers with no sample. Place the glass slide between them and rotate it. A stressed region brightens when its principal axes are at 45° to the polarizers and disappears when they are parallel to one of them.",
          checkpoint: "The sample has four bright orientations per turn if the stress is fixed in the sample frame."
        },
        {
          title: "Load the sample gently",
          detail:
            "Bend the slide or coverslip with a clean clamp or two supports. Increase the load slowly and watch the brightness change. Do not exceed the elastic limit; a cracked sample is a hazard and a bad measurement.",
          caution: "Glass edges are sharp; handle the slide by its faces and wear eye protection."
        },
        {
          title: "Observe the isochromatics",
          detail:
            "With white light, the retardance is wavelength dependent and coloured fringes appear. With a laser, the pattern is a set of dark and bright bands. Rotating the sample moves the isoclinics; changing the load moves the isochromatics.",
          checkpoint: "Increasing load increases the number of bands, as δ ∝ σ."
        },
        {
          title: "Estimate the retardance",
          detail:
            "At a bright region with the axes at 45°, measure the transmitted intensity relative to the parallel-polarizer maximum. Use T = sin²(δ/2) to estimate δ. Compare with the order-of-magnitude estimate from δ = 2πCσd/λ.",
          checkpoint: "The estimated δ increases monotonically with load and is of the expected order."
        }
      ]
    },
    {
      id: "cinema",
      title: "3D cinema stereo separation",
      purpose: "Build two polarization channels, measure leakage and crosstalk, and compare linear with circular under head tilt.",
      steps: [
        {
          title: "Project two channels",
          detail:
            "Set up two projector positions or two apertures on the bench, one carrying the left image and one the right. Encode them with orthogonal polarizers: +45° and −45° for linear, or a quarter-wave plate after each linear polarizer for circular. Use the polarization-preserving screen, not the white screen.",
          checkpoint: "With the room lights off, each channel alone is visible and the two are equally bright."
        },
        {
          title: "Measure the glasses",
          detail:
            "For each lens, measure the transmission of its own channel and of the opposite channel. Compute leakage = I_wrong/I_own and crosstalk = I_wrong/(I_own + I_wrong). Correct for the dark reading and for any ambient light.",
          caution: "The lens marked left must face the same way as the eye it will cover; reversing a circular lens swaps the channel."
        },
        {
          title: "Tilt the glasses",
          detail:
            "Repeat the measurement at head tilts of 0°, 10°, 20°, 30° and 40°. For linear glasses, record the rapid rise in leakage. For circular glasses, confirm that the leakage is essentially unchanged.",
          checkpoint: "Linear crosstalk at 30° is of order 25 %; circular crosstalk stays at the floor set by extinction and screen depolarization."
        },
        {
          title: "Compare screens",
          detail:
            "Repeat the 0° measurement on the white screen. The polarization should be largely scrambled: both eyes see both channels and the crosstalk approaches 50 %. This is the demonstration that a silver screen is an optical component, not a marketing detail.",
          checkpoint: "The white screen raises crosstalk dramatically while the glasses are unchanged."
        },
        {
          title: "Record the ghost image",
          detail:
            "With the glasses on, look at a high-contrast edge. The faint duplicate offset from the edge is the ghost. Correlate its visibility with the measured crosstalk and note that perception depends on image content, not only on the optical ratio.",
          caution: "Stop if the viewing causes discomfort; the demonstration is optical, not a endurance test."
        }
      ]
    },
    {
      id: "shutdown",
      title: "Shutdown and data archiving",
      purpose: "Leave the bench safe and the data traceable.",
      steps: [
        {
          title: "Block and switch off",
          detail:
            "Insert the beam block, then switch off the laser. Do not rely on the shutter alone. Allow the source to cool before moving it.",
          caution: "A switched-off laser may still emit if the interlock is bypassed; treat it as live until the key is off."
        },
        {
          title: "Secure the optics",
          detail:
            "Cap or bag the wave plates, replace lens caps, and return the polarizers to their cases. Do not touch optical surfaces with fingers; use lens tissue and the recommended solvent only.",
          checkpoint: "No unsecured mount can fall, and no plate is left on a bare table."
        },
        {
          title: "Archive the data",
          detail:
            "Save the raw scans with the analyser zero, plate labels, wavelength, detector gain and dark reading. A Malus fit without the zero reference is not reproducible.",
          checkpoint: "A second person could repeat the scan from the notes alone."
        }
      ]
    }
  ],

  observations: [
    {
      id: "obs-malus",
      title: "Analyser angle versus transmitted intensity",
      purpose: "Test Malus's law and locate the angular zero from the minima.",
      columns: [
        { key: "angle", label: "Analyser angle", unit: "°", type: "number" },
        { key: "signal", label: "Detector signal", unit: "V", type: "number" },
        { key: "dark", label: "Dark signal", unit: "V", type: "number" },
        { key: "corrected", label: "Corrected intensity", unit: "V", type: "number" },
        { key: "note", label: "Observation", type: "text" }
      ],
      guidance:
        "Take 19 points from 0° to 180° in 10° steps, plus a repeat at 0° to check drift. Keep the detector and gain fixed. Measure the dark signal with the beam blocked at the start and end.",
      formula: "I(\\theta)=I_0\\cos^2(\\theta-\\theta_0)+I_{\\mathrm{dark}}"
    },
    {
      id: "obs-waveplate",
      title: "Wave-plate angle versus state and ellipticity",
      purpose: "Map how a retarder converts a linear input into linear, elliptical and circular output.",
      columns: [
        { key: "plate", label: "Plate", type: "text" },
        { key: "angle", label: "Plate angle", unit: "°", type: "number" },
        { key: "max", label: "Analyser max", unit: "V", type: "number" },
        { key: "min", label: "Analyser min", unit: "V", type: "number" },
        { key: "nullAngle", label: "Null angle", unit: "°", type: "number" },
        { key: "ellipticity", label: "Ellipticity sign", type: "text" },
        { key: "note", label: "Observation", type: "text" }
      ],
      guidance:
        "For each plate angle, rotate the analyser through 180° and record the maximum, minimum and the angle of the minimum. A deep null means linear output; a shallow null means elliptical or circular output. Use the same input power throughout.",
      formula: "T_{\\min}/T_{\\max}=\\tan^2\\chi"
    },
    {
      id: "obs-glasses",
      title: "Glasses extinction and stereo crosstalk",
      purpose: "Quantify per-eye leakage for linear and circular glasses, with and without head tilt.",
      columns: [
        { key: "tech", label: "Technology", type: "text" },
        { key: "tilt", label: "Head tilt", unit: "°", type: "number" },
        { key: "eye", label: "Eye", type: "text" },
        { key: "own", label: "Own channel", unit: "V", type: "number" },
        { key: "other", label: "Opposite channel", unit: "V", type: "number" },
        { key: "leak", label: "Leakage", unit: "%", type: "number" },
        { key: "xt", label: "Crosstalk", unit: "%", type: "number" }
      ],
      guidance:
        "Measure each lens separately with only one channel illuminated at a time. Repeat at 0°, 10°, 20°, 30° and 40° of tilt. Dark-correct every reading and keep the projector power fixed. Record the screen type.",
      formula: "\\mathrm{XT}=I_{\\mathrm{other}}/(I_{\\mathrm{own}}+I_{\\mathrm{other}})"
    }
  ],

  analysis: [
    {
      id: "an-malus",
      title: "Fit the Malus curve",
      method:
        "Fit I = I₀ cos²(θ − θ₀) + I_dark to the scan. Because the model is nonlinear in θ₀, either scan θ₀ on a fine grid and use linear regression of I on cos²(θ − θ₀) at each trial, or use a general least-squares minimiser. Report the best θ₀, I₀, I_dark and R².",
      formula: "I(\\theta)=I_0\\cos^2(\\theta-\\theta_0)+I_{\\mathrm{dark}}",
      steps: [
        "Subtract the measured dark reading from each point (or fit it as a free parameter and compare).",
        "Grid θ₀ from −5° to 5° in 0.1° steps; for each θ₀, regress I on x = cos²(θ − θ₀).",
        "Choose the θ₀ with the smallest residual sum of squares; report the slope as I₀.",
        "Plot residuals against θ. A systematic trend means the model is incomplete (drift, saturation or stray light).",
        "Compare θ₀ with the mechanical zero from the crossed position; the difference is the scale offset."
      ],
      expected:
        "θ₀ within 1° of the crossed-position zero, I_dark within a few per cent of the measured dark reading, R² > 0.995 for a clean scan."
    },
    {
      id: "an-extinction",
      title: "Extinction ratio and its uncertainty",
      method:
        "Use the dark-corrected maximum and minimum of the analyser scan. Compute ER in dB and propagate the uncertainties of the two readings. State the wavelength and the beam geometry, because both affect the result.",
      formula: "ER_{\\mathrm{dB}}=10\\log_{10}(I_{\\max}/I_{\\min}),\\qquad \\sigma_{ER}=\\frac{10}{\\ln10}\\sqrt{(\\sigma_{\\max}/I_{\\max})^2+(\\sigma_{\\min}/I_{\\min})^2}",
      steps: [
        "Average several readings at the maximum and at the minimum; use the standard error of each mean.",
        "Subtract the dark offset before forming the ratio; never form the ratio of raw readings.",
        "Propagate the uncertainties in quadrature using the logarithmic derivative.",
        "Repeat at half power to test for detector nonlinearity.",
        "Compare with the expected order of magnitude for the polarizer type and with the manufacturer's value if one is available."
      ],
      expected:
        "A pair of good dichroic polarizers should reach the high 20s to 30s of dB on a clean bench; a lower value usually indicates stray light or misalignment rather than a defective polarizer."
    },
    {
      id: "an-retardance",
      title: "Retardance from transmission between crossed polarizers",
      method:
        "Place the plate at 45° between crossed polarizers and measure the transmitted intensity relative to the parallel-polarizer maximum. Invert T = sin²(δ/2). Repeat at several wavelengths if available to see the dispersion.",
      formula: "T=\\sin^2(2\\theta)\\sin^2(\\delta/2),\\qquad \\delta=2\\arcsin\\sqrt{T}\\ \\ (\\theta=45^\\circ)",
      steps: [
        "Cross the polarizers and record the residual transmission (the floor).",
        "Insert the plate at 45° and record the maximum transmission over a small angle sweep around 45°.",
        "Correct both readings for the dark offset and for the floor.",
        "Invert to δ and convert to waves: δ/360°.",
        "Compare the result with the plate label and with the thickness estimate d = δλ/(2πΔn)."
      ],
      expected:
        "A nominal quarter-wave plate should return δ ≈ 90° ± a few degrees at its design wavelength; a half-wave plate δ ≈ 180°. A large discrepancy suggests the wrong wavelength or a multi-order plate."
    },
    {
      id: "an-stokes",
      title: "Stokes parameters from measurements",
      method:
        "Measure the six analyser settings, dark-correct, and form S₀…S₃. Compute DoP, azimuth and ellipticity. Propagate the intensity uncertainties into the derived quantities and check the redundancy S₀ = I₀ + I₉₀ = I₄₅ + I₁₃₅.",
      formula: "S_0=I_0+I_{90},\\ S_1=I_0-I_{90},\\ S_2=I_{45}-I_{135},\\ S_3=I_R-I_L",
      steps: [
        "Calibrate the linear analyser zero and the circular analyser orientation first.",
        "Measure all six intensities with the same input power and gain.",
        "Check the redundancy; a mismatch larger than the combined uncertainty indicates a drift or a mis-set analyser.",
        "Compute DoP and compare with 1 for a nominally pure input; a value below 1 quantifies the depolarization of the source or the sample.",
        "Place the state on the Poincaré sphere and compare its position with the prediction from the Jones chain."
      ],
      expected:
        "A polarizer followed by a quarter-wave plate at 45° should give |S₃|/S₀ close to 1 and S₁, S₂ close to 0. A linear state should give S₃ close to 0."
    },
    {
      id: "an-crosstalk",
      title: "Stereo crosstalk and contrast",
      method:
        "For each eye and each tilt, measure the own-channel and opposite-channel intensities. Compute leakage, crosstalk and contrast. Plot crosstalk against tilt for linear and circular glasses and compare with the model.",
      formula: "\\mathrm{XT}=\\frac{I_{\\mathrm{leak}}}{I_{\\mathrm{want}}+I_{\\mathrm{leak}}},\\qquad C=\\frac{I_{\\mathrm{want}}}{I_{\\mathrm{leak}}}",
      steps: [
        "Dark-correct and subtract ambient light measured with the projector blocked.",
        "Measure one channel at a time to avoid confusing leakage with stray light.",
        "Compute per-eye crosstalk, then average the two eyes only after checking that they agree.",
        "Fit the linear data to XT(β) from the derivation and extract the effective extinction ε and depolarization p.",
        "Compare linear and circular at the same tilt and screen; the difference is the head-tilt term."
      ],
      expected:
        "Linear crosstalk rises from the extinction floor at 0° to roughly 25 % at 30°; circular crosstalk stays near the floor set by ε and screen depolarization. A white screen pushes both towards 50 %."
    }
  ],

  errors: [
    {
      source: "Finite polarizer extinction",
      type: "systematic",
      effect: "Puts a floor under every null, so the measured extinction ratio is worse than the true pair ratio and the fitted Malus minima are lifted.",
      mitigation:
        "Use the best pair available, keep the beam centred and collimated, and report the floor rather than subtracting it silently. Compare the measured ER with the expected order of magnitude."
    },
    {
      source: "Angular zero and backlash in the rotation mounts",
      type: "systematic",
      effect: "Shifts the Malus curve horizontally and makes the crossed position depend on the direction of approach, which biases θ₀ and the extinction angle.",
      mitigation:
        "Approach every setting from the same direction, average clockwise and anticlockwise readings, and fit θ₀ as a free parameter instead of trusting the engraving."
    },
    {
      source: "Detector nonlinearity and dark offset",
      type: "systematic",
      effect: "Flattens the top of the Malus curve, inflates the apparent extinction ratio and distorts the Stokes parameters.",
      mitigation:
        "Measure the dark reading with the beam blocked, keep the signal well below saturation, and repeat the scan at half power with a neutral-density filter."
    },
    {
      source: "Beam wander on rotation",
      type: "systematic",
      effect: "The spot moves on the detector as a mount turns, producing an intensity change that is not polarization and can mimic a false null or a false maximum.",
      mitigation:
        "Centre the beam on each rotation axis, keep every element normal to the beam, and use an aperture or a large-area detector so that small displacements do not change the collected power."
    },
    {
      source: "Wave-plate retardance error and wavelength mismatch",
      type: "systematic",
      effect: "A plate that is not exactly quarter- or half-wave at the operating wavelength produces elliptical rather than circular or linear output, reducing the measured modulation depth.",
      mitigation:
        "Record the design wavelength, measure the retardance in phase 5, and treat the plate as a calibrated component rather than an ideal one."
    },
    {
      source: "Screen depolarization and viewing geometry",
      type: "systematic",
      effect: "A non-polarization-preserving screen or an off-axis viewing position mixes the stereo channels and raises crosstalk independently of the glasses.",
      mitigation:
        "Use the polarization-preserving screen for the cinema phase, keep the detector near the screen normal, and repeat the measurement on the white screen to demonstrate the difference."
    },
    {
      source: "Stray light and ambient pickup",
      type: "random",
      effect: "Adds an unpolarized background that lifts the minima and biases the Stokes parameters towards lower DoP.",
      mitigation:
        "Shield the detector, use an aperture and a band-pass filter if available, and measure the ambient background with the laser blocked."
    }
  ],

  applications: [
    {
      title: "Liquid-crystal displays",
      body:
        "Each pixel is a polarization modulator between two polarizers. The liquid crystal rotates the polarization by an amount set by the applied voltage; the analyser converts that rotation into brightness. The same algebra as the bench, repeated a few million times."
    },
    {
      title: "Photoelastic stress analysis",
      body:
        "A polariscope turns mechanical stress into visible fringes. Engineers use it to find stress concentrations in glass, polymer and composite parts, and to validate finite-element models without attaching a single strain gauge."
    },
    {
      title: "Ellipsometry",
      body:
        "The change in polarization on reflection gives the thickness and refractive index of films down to sub-nanometre scale. Semiconductor metrology, optical coating design and surface science all depend on it."
    },
    {
      title: "Polarimetric imaging",
      body:
        "Recording several polarization channels separates surface reflections from subsurface scattering, reveals material orientation and improves contrast in haze or glare. It is used in remote sensing, biomedical imaging and machine vision."
    },
    {
      title: "3D cinema and stereo displays",
      body:
        "Passive polarization, active shutters and spectral multiplexing all solve the same problem: deliver two independent images to two eyes. The choice is an engineering trade between head-tilt tolerance, screen cost, brightness and glasses complexity."
    },
    {
      title: "Quantum information",
      body:
        "Polarization is a natural qubit. BB84, quantum erasure and Bell tests all use the two-dimensional polarization space, with wave plates as unitary gates and polarizers as projective measurements."
    }
  ],

  questions,

  references: cited(
    "goldstein",
    "hecht",
    "bornwolf",
    "saleh",
    "fowles",
    "thorlabs_edu",
    "edmund_optics",
    "taylor",
    "bevington",
    "nielsen",
    "loudon",
    "griffiths"
  ),

  related: ["quantum-eraser", "quantum-key-distribution", "michelson-interferometer"],

  status: {
    content: true,
    simulation: true,
    procedure: true,
    analysis: true,
    questions: true,
    references: true,
    validation: true
  }
};

export default content;
export { content as polarizationExperiment };
