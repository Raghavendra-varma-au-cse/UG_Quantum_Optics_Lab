import { refs } from "./references";
import type { MathChapter, Reference } from "./types";

/**
 * Mathematics for Experimental Optics.
 *
 * Ten chapters that supply exactly the mathematics used by the experiments in
 * this laboratory: phasors, matrices, Maxwell waves, interference, Gaussian
 * beams, Fourier optics, statistics, Hilbert space, density matrices and
 * polarization calculus. Every formula is consistent with the implementations
 * in src/lib/physics.
 */

const R = (id: string): Reference => {
  const reference = refs[id];
  if (!reference) throw new Error(`Unknown reference id: ${id}`);
  return reference;
};

export const MATHEMATICS_CHAPTERS: MathChapter[] = [
  /* ------------------------------------------------------------------ */
  /* 01 — Trigonometry and complex numbers                              */
  /* ------------------------------------------------------------------ */
  {
    id: "trigonometry-and-complex-numbers",
    number: "01",
    title: "Trigonometry and Complex Numbers",
    kicker: "The arithmetic of phase",
    summary:
      "Harmonic fields, phasors and Euler's relation are the arithmetic behind every interference and polarization calculation in the laboratory. This chapter builds complex arithmetic from the unit circle, shows why intensities are squared moduli, and turns optical path difference into phase.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "A photodetector never reports a complex number. It reports a time-averaged intensity. Yet almost every calculation in this laboratory is done with complex amplitudes, because they turn the addition of oscillations into the addition of vectors and the propagation of a wave into multiplication by a phase factor."
      },
      {
        type: "p",
        text: "A scalar, monochromatic plane wave travelling along +z can be written E(z,t) = E₀ cos(ωt − kz + φ). The angular frequency ω = 2πf has units rad s⁻¹, the wavenumber k = 2π/λ has units rad m⁻¹, and φ is a constant phase in radians. Because cos θ = Re(e^{iθ}), we may replace the real oscillation by the complex field Ẽ(z,t) = E₀ exp[i(ωt − kz + φ)] and recover the physical field at the end by taking the real part. The complex amplitude Ẽ = E₀e^{iφ} freezes time and position; it is called a phasor. The convention throughout these chapters is exp[+i(ωt − kz)]; a different sign convention changes the sign of every phase but never an intensity."
      },
      {
        type: "eq",
        latex:
          "E(z,t)=\\operatorname{Re}\\left[\\tilde{E}\\,e^{i(\\omega t-kz)}\\right],\\qquad \\tilde{E}=E_0e^{i\\varphi}",
        number: "1.1",
        note: "E₀ is in V m⁻¹, ω in rad s⁻¹, k in rad m⁻¹, φ in rad."
      },
      {
        type: "p",
        text: "Euler's relation places the phasor on the unit circle. Its modulus |Ẽ| is the field amplitude in V m⁻¹ and its argument arg Ẽ is the phase in radians. Multiplication multiplies moduli and adds arguments, so multiplying by e^{iδ} rotates a phasor by δ without changing its length. The conjugate Ẽ* reflects it in the real axis. Division subtracts arguments. These three facts are enough to do almost all of wave optics."
      },
      {
        type: "table",
        caption: "Complex arithmetic and its geometric meaning.",
        head: ["Operation", "Rule", "Geometric meaning"],
        rows: [
          ["Addition", "(a + ib) + (c + id) = (a + c) + i(b + d)", "Tip-to-tail vector sum"],
          ["Multiplication", "(a + ib)(c + id) = (ac − bd) + i(ad + bc)", "Rotate by arg, scale by modulus"],
          ["Conjugate", "z* = a − ib", "Reflection in the real axis"],
          ["Modulus", "|z| = √(a² + b²)", "Length of the phasor"],
          ["Argument", "arg z = atan2(b, a)", "Angle from the positive real axis"],
          ["Reciprocal", "1/z = z*/|z|²", "Inverse rotation and inverse scale"]
        ],
        align: ["l", "l", "l"]
      },
      {
        type: "callout",
        tone: "misconception",
        title: "The imaginary part is not thrown away because it is unphysical",
        body:
          "The physical field is the real part, but Maxwell's equations are linear with real coefficients. Taking the real part therefore commutes with addition, differentiation, and multiplication by real material constants. Calculating with Ẽ and taking Re at the end is exact for linear media. Intensity is the exception: it is proportional to the squared modulus |Ẽ|², not to [Re Ẽ]². The latter oscillates at 2ω and averages to |Ẽ|²/2. Confusing the two is the most common factor-of-two error in the laboratory."
      },
      {
        type: "p",
        text: "Two coherent fields at the same point add as complex amplitudes, E = E₁ + E₂. If E₁ = A₁e^{iφ₁} and E₂ = A₂e^{iφ₂}, the intensity is proportional to |E|² = A₁² + A₂² + 2A₁A₂ cos δ, with δ = φ₁ − φ₂. The first two terms are the intensities the beams would produce separately and the third is the interference term. It is positive for constructive interference, negative for destructive interference, and zero when the fields are in quadrature. The phase of the sum follows from the same triangle: tan φ = (A₁ sin φ₁ + A₂ sin φ₂)/(A₁ cos φ₁ + A₂ cos φ₂), with the quadrant fixed by atan2 rather than by the arctangent alone."
      },
      {
        type: "eq",
        latex:
          "I=|E_1+E_2|^2=I_1+I_2+2\\sqrt{I_1I_2}\\,\\cos\\delta",
        number: "1.3"
      },
      {
        type: "p",
        text: "Phase differences in the laboratory almost always come from a path difference. A wave that travels an extra distance Δ in a medium of refractive index n accumulates phase δ = k₀nΔ = 2πnΔ/λ₀, where λ₀ is the vacuum wavelength in metres. In a Michelson interferometer the light traverses each arm twice, so Δ = 2(L₁ − L₂) and one complete fringe corresponds to a mirror movement of λ/2. The sign convention is bookkeeping: only cos δ enters the intensity, so reversing the sign of δ changes nothing measurable."
      },
      {
        type: "derivation",
        derivationId: "d-m01-phasor-sum"
      },
      {
        type: "numeric",
        title: "Two beams of unequal intensity at 60°",
        statement:
          "Two mutually coherent beams of the same colour overlap on a detector with I₁ = 1.0 mW cm⁻² and I₂ = 3.0 mW cm⁻². Their relative phase is 60°. Find the total intensity, the maximum and minimum intensities reached as the phase is scanned, and the fringe visibility.",
        latex:
          "I=1+3+2\\sqrt{3}\\cos 60^\\circ=4+\\sqrt{3}=5.73\\ \\mathrm{mW\\,cm^{-2}}",
        result:
          "I = 5.73 mW cm⁻². The scanned maximum is 4 + 2√3 = 7.46 and the minimum is 4 − 2√3 = 0.54 mW cm⁻², so V = (7.46 − 0.54)/(7.46 + 0.54) = 0.866. The same value follows directly from V = 2√(I₁I₂)/(I₁ + I₂) = 2√3/4."
      },
      {
        type: "numeric",
        title: "One fringe from a quarter-micrometre mirror move",
        statement:
          "A Michelson mirror is translated by d = 0.250 µm in air (n = 1) while the source is a 500 nm laser. What optical path difference is accumulated, what phase change does the detector see, and how many fringes pass?",
        latex:
          "\\Delta=2d=0.500\\ \\mu\\mathrm{m},\\qquad \\delta=\\frac{2\\pi\\Delta}{\\lambda_0}=\\frac{2\\pi(0.500)}{0.500}=2\\pi",
        result:
          "One full fringe. In general N = 2d/λ₀ = 2(0.250)/0.500 = 1.0. The factor two is the round trip, not a convention. The same relation inverted is the basis of Michelson wavelength measurement: λ₀ = 2d/N."
      }
    ],
    equations: [
      {
        id: "m01-e1",
        latex: "e^{i\\theta}=\\cos\\theta+i\\sin\\theta",
        name: "Euler's relation",
        symbols: [
          { symbol: "\\theta", meaning: "Phase angle", unit: "rad" },
          { symbol: "i", meaning: "Imaginary unit, i² = −1", unit: "dimensionless" }
        ],
        interpretation:
          "A phase is a rotation of the unit circle. Real part is cosine, imaginary part is sine, so a harmonic oscillation is the shadow of a uniformly rotating phasor.",
        assumptions: ["Angles measured in radians", "Real-valued physical fields recovered with Re"],
        usedIn: ["Phasor addition", "Jones calculus", "Beam-splitter phases", "Fourier transforms"],
        numericExample: {
          statement: "At θ = 60°, cos θ = 0.500 and sin θ = 0.866, so e^{iπ/3} = 0.500 + 0.866i.",
          latex: "e^{i\\pi/3}=0.500+0.866i"
        }
      },
      {
        id: "m01-e2",
        latex:
          "\\tilde{E}(z,t)=E_0\\,e^{i(\\omega t-kz+\\varphi)}",
        name: "Complex scalar plane wave",
        symbols: [
          { symbol: "E_0", meaning: "Peak field amplitude", unit: "V m⁻¹" },
          { symbol: "\\omega", meaning: "Angular frequency, 2πf", unit: "rad s⁻¹" },
          { symbol: "k", meaning: "Wavenumber, 2π/λ", unit: "rad m⁻¹" },
          { symbol: "\\varphi", meaning: "Constant phase offset", unit: "rad" },
          { symbol: "z", meaning: "Propagation coordinate", unit: "m" },
          { symbol: "t", meaning: "Time", unit: "s" }
        ],
        interpretation:
          "A monochromatic wave is a phasor whose phase advances with time and retreats with distance. The physical field is the real part.",
        assumptions: ["Scalar field", "Monochromatic", "Homogeneous, non-absorbing medium", "Plane wave along +z"],
        usedIn: ["Interference", "Coherence", "Michelson and Mach–Zehnder models"],
        numericExample: {
          statement: "A 1.0 V m⁻¹ field at 633 nm has k = 9.93 × 10⁶ rad m⁻¹ and ω = 2.98 × 10¹⁵ rad s⁻¹.",
          latex: "k=\\frac{2\\pi}{633\\ \\mathrm{nm}}=9.93\\times10^6\\ \\mathrm{rad\\,m^{-1}}"
        }
      },
      {
        id: "m01-e3",
        latex:
          "I=I_1+I_2+2\\sqrt{I_1I_2}\\cos\\delta",
        name: "Two-beam interference intensity",
        symbols: [
          { symbol: "I_1,I_2", meaning: "Intensities of the individual beams", unit: "W m⁻²" },
          { symbol: "I", meaning: "Total intensity", unit: "W m⁻²" },
          { symbol: "\\delta", meaning: "Relative phase, φ₁ − φ₂", unit: "rad" }
        ],
        interpretation:
          "Intensities add, but so does a cross term. The cross term is the physical interference and is absent only when the beams are incoherent or orthogonally polarized.",
        assumptions: ["Same frequency", "Same polarization", "Mutually coherent over the integration time", "Linear detector"],
        usedIn: ["Michelson", "Mach–Zehnder", "Young's slits", "Coherence measurements"],
        numericExample: {
          statement: "Equal beams with δ = 60° give I = 2I₀(1 + 0.5) = 3I₀, i.e. 75% of the 4I₀ maximum.",
          latex: "I=2I_0(1+\\cos 60^\\circ)=3I_0"
        }
      },
      {
        id: "m01-e4",
        latex:
          "\\delta=\\frac{2\\pi n\\Delta}{\\lambda_0}=k_0n\\Delta",
        name: "Phase from optical path difference",
        symbols: [
          { symbol: "\\Delta", meaning: "Geometric path difference", unit: "m" },
          { symbol: "n", meaning: "Refractive index of the medium", unit: "dimensionless" },
          { symbol: "\\lambda_0", meaning: "Vacuum wavelength", unit: "m" },
          { symbol: "k_0", meaning: "Vacuum wavenumber", unit: "rad m⁻¹" }
        ],
        interpretation:
          "One vacuum wavelength of path difference is one full cycle of phase. A medium multiplies the accumulated phase by n because the wavelength inside is λ₀/n.",
        assumptions: ["Non-dispersive over the source bandwidth", "Negligible absorption", "Path difference stable during detection"],
        usedIn: ["Fringe counting", "Refractive-index measurement", "Thermal expansion", "Coherence length"],
        numericExample: {
          statement: "Δ = 1.0 µm at λ₀ = 500 nm gives δ = 2π(1.0)/0.500 = 4π, two full fringes.",
          latex: "\\delta=2\\pi\\frac{1.0\\ \\mu\\mathrm{m}}{0.500\\ \\mu\\mathrm{m}}=4\\pi"
        }
      },
      {
        id: "m01-e5",
        latex: "|z|^2=zz^*=a^2+b^2",
        name: "Squared modulus",
        symbols: [
          { symbol: "z", meaning: "Complex amplitude a + ib", unit: "varies" },
          { symbol: "z^*", meaning: "Complex conjugate a − ib", unit: "varies" }
        ],
        interpretation:
          "The squared modulus removes the phase and leaves the quantity a detector can measure. For a field amplitude it is proportional to intensity; for a quantum amplitude it is a probability.",
        assumptions: ["Same complex amplitude convention on both factors"],
        usedIn: ["Intensity", "Born rule", "Jones-vector intensity", "Fourier power spectra"],
        numericExample: {
          statement: "For z = 3 + 4i, |z|² = 9 + 16 = 25 and |z| = 5.",
          latex: "|3+4i|^2=25"
        }
      }
    ],
    derivations: [
      {
        id: "d-m01-phasor-sum",
        title: "From two phasors to the cosine interference law",
        intro:
          "The interference law is not a separate postulate. It is the squared modulus of a sum of two complex amplitudes.",
        steps: [
          {
            label: "1",
            text: "Write each field at the observation point as a complex amplitude with its own magnitude and phase.",
            latex: "E_1=A_1e^{i\\varphi_1},\\qquad E_2=A_2e^{i\\varphi_2}"
          },
          {
            label: "2",
            text: "Add the amplitudes and factor out the mean phase, defining δ = φ₁ − φ₂.",
            latex:
              "E_1+E_2=e^{i\\bar{\\varphi}}\\left(A_1e^{i\\delta/2}+A_2e^{-i\\delta/2}\\right),\\qquad \\bar{\\varphi}=\\frac{\\varphi_1+\\varphi_2}{2}"
          },
          {
            label: "3",
            text: "Multiply the sum by its conjugate. The cross terms are the only place the relative phase survives.",
            latex:
              "|E_1+E_2|^2=A_1^2+A_2^2+A_1A_2\\left(e^{i\\delta}+e^{-i\\delta}\\right)"
          },
          {
            label: "4",
            text: "Use Euler's relation to replace the exponential pair by a cosine.",
            latex: "e^{i\\delta}+e^{-i\\delta}=2\\cos\\delta"
          },
          {
            label: "5",
            text: "Identify the intensity with the squared modulus and write each amplitude squared as the corresponding individual intensity.",
            latex: "I=I_1+I_2+2\\sqrt{I_1I_2}\\cos\\delta"
          }
        ],
        result: {
          latex: "I=I_1+I_2+2\\sqrt{I_1I_2}\\cos(\\varphi_1-\\varphi_2)",
          text:
            "The interference term is the real part of the cross-correlation of the two complex amplitudes. It is maximal for δ = 0, minimal for δ = π, and vanishes at quadrature."
        },
        assumptions: [
          "Both fields have the same optical frequency",
          "Both fields have the same polarization",
          "The relative phase is stable over the detector integration time",
          "The detector responds to intensity, not to field"
        ]
      }
    ],
    problems: [
      {
        id: "m01-p1",
        type: "mcq",
        difficulty: 1,
        topic: "Complex multiplication",
        prompt: "Evaluate the product (3 + 4i)(1 − 2i).",
        options: ["−5 + 10i", "11 − 2i", "11 + 10i", "5 − 2i"],
        answerIndex: 1,
        answer:
          "Expand: 3(1) + 3(−2i) + 4i(1) + 4i(−2i) = 3 − 6i + 4i + 8 = 11 − 2i. The modulus is √125 = 11.18 and the argument is atan2(−2, 11) = −10.3°.",
        explanation:
          "Use i² = −1 for the last term: 4i × (−2i) = −8i² = +8.",
        marks: 2
      },
      {
        id: "m01-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Two-beam intensity",
        prompt:
          "Two coherent, co-polarized beams with I₁ = 2.0 W m⁻² and I₂ = 8.0 W m⁻² overlap with a relative phase of π/2. What total intensity is measured, and what is the fringe visibility when the phase is scanned?",
        answer:
          "At δ = π/2 the cosine vanishes, so I = I₁ + I₂ = 10.0 W m⁻². The scanned maximum is 2 + 8 + 2√16 = 18 W m⁻² and the minimum is 2 W m⁻². Hence V = (18 − 2)/(18 + 2) = 0.80, which also equals 2√(I₁I₂)/(I₁ + I₂) = 8/10.",
        numeric: { value: 10, tolerance: 0.01, unit: "W m⁻²" },
        marks: 3
      },
      {
        id: "m01-p3",
        type: "numerical",
        difficulty: 2,
        topic: "Phase from path difference",
        prompt:
          "A path difference of 1.50 µm is introduced at a vacuum wavelength of 600 nm. Express the accumulated phase in units of π rad. If the two beams have equal intensity, is the interference constructive or destructive?",
        answer:
          "δ = 2πΔ/λ₀ = 2π(1.50/0.600) = 5π rad. Since cos 5π = −1, equal beams cancel: the interference is destructive. Equivalently, the path difference is 2.5 wavelengths, a half-integer number of wavelengths.",
        numeric: { value: 5, tolerance: 0.01, unit: "π rad" },
        marks: 3
      },
      {
        id: "m01-p4",
        type: "short",
        difficulty: 2,
        topic: "Real part versus modulus",
        prompt:
          "Why may a calculation be performed with complex fields and the real part taken only at the end, and why is intensity computed from |E|² rather than from [Re E]²?",
        answer:
          "For linear media, Maxwell's equations have real coefficients, so Re commutes with addition, differentiation, and multiplication by real constants such as ε and μ. A linear combination of complex solutions therefore has a real part that is the corresponding linear combination of the real solutions. Intensity, however, is quadratic in the field and a detector averages over many optical cycles. Writing E = E₀cos(ωt + φ), the cycle average of E² is E₀²/2, while |Ẽ|² = E₀². The two differ by the factor ½ that is absorbed into the proportionality constant between intensity and |Ẽ|².",
        explanation:
          "The key distinction is linear operations (which commute with Re) versus quadratic detection (which does not).",
        marks: 3
      },
      {
        id: "m01-p5",
        type: "derivation",
        difficulty: 3,
        topic: "Phasor addition",
        prompt:
          "Two phasors have unequal amplitudes A₁ and A₂ and phases φ₁ and φ₂. Derive expressions for the squared modulus of their sum and for the phase of the sum.",
        answer:
          "Let δ = φ₁ − φ₂. Then |A₁e^{iφ₁} + A₂e^{iφ₂}|² = A₁² + A₂² + 2A₁A₂cos δ. For the phase, write the sum in components: X = A₁cos φ₁ + A₂cos φ₂ and Y = A₁sin φ₁ + A₂sin φ₂, so φ = atan2(Y, X). Expanding the square gives the same result as the cosine law for a triangle with sides A₁ and A₂ and included angle δ.",
        explanation:
          "Do not take arctan(Y/X) without a quadrant check; atan2 is the correct function.",
        marks: 4
      },
      {
        id: "m01-p6",
        type: "mcq",
        difficulty: 1,
        topic: "Multiplication as rotation",
        prompt: "Multiplying a phasor by i has what effect?",
        options: [
          "It doubles the intensity",
          "It advances the phase by 180°",
          "It advances the phase by 90° without changing the modulus",
          "It changes the frequency by a factor of two"
        ],
        answerIndex: 2,
        answer:
          "i = e^{iπ/2}, so multiplication adds π/2 to the argument and multiplies the modulus by 1. The field amplitude is unchanged, so the intensity is unchanged.",
        explanation:
          "This is exactly the phase convention used for reflection at a beam splitter in the quantum-optics module.",
        marks: 1
      }
    ],
    references: [R("hecht"), R("bornwolf"), R("fowles"), R("saleh")],
    related: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "polarization-3d-cinema",
      "vectors-and-matrices",
      "waves-and-maxwell"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 02 — Vectors and matrices                                          */
  /* ------------------------------------------------------------------ */
  {
    id: "vectors-and-matrices",
    number: "02",
    title: "Vectors and Matrices",
    kicker: "The grammar of optical transformations",
    summary:
      "Vectors describe fields, directions and states; matrices describe what optical elements do to them. This chapter develops dot and cross products, matrix algebra, determinants and inverses, rotations, and the eigenvalue problem that identifies the directions an element leaves unchanged.",
    interactive: "abcd",
    blocks: [
      {
        type: "lead",
        text: "A vector in this laboratory is usually a short list of numbers: the transverse components of an electric field, a Jones vector, a Stokes vector, or the coordinates of a ray. A matrix is a linear rule that turns one such list into another. Once both are understood, a stack of optical elements becomes a single product of matrices."
      },
      {
        type: "p",
        text: "The dot product measures projection and overlap. For real vectors a·b = |a||b|cos θ, so it answers the question “how much of b lies along a?”. For complex vectors the same idea becomes the inner product with a conjugate, which is the subject of Chapter 08. The cross product produces a vector orthogonal to both inputs, with magnitude equal to the area of the parallelogram they span and direction given by the right-hand rule. It appears whenever a direction must be constructed from two others, for example the Poynting vector S = E × H and the Lorentz force qv × B."
      },
      {
        type: "eq",
        latex:
          "\\mathbf{a}\\cdot\\mathbf{b}=\\sum_i a_ib_i=|\\mathbf{a}||\\mathbf{b}|\\cos\\theta,\\qquad \\mathbf{a}\\times\\mathbf{b}=\\begin{pmatrix}a_yb_z-a_zb_y\\\\ a_zb_x-a_xb_z\\\\ a_xb_y-a_yb_x\\end{pmatrix}",
        number: "2.1"
      },
      {
        type: "steps",
        items: [
          {
            title: "Read the matrix as a map",
            body:
              "A 2×2 matrix turns a two-component vector into another two-component vector. In the Jones calculus the input holds the complex transverse field components and the matrix holds the action of a polarizer, a wave plate or a rotator. The columns of the matrix are the images of the basis vectors."
          },
          {
            title: "Compose in optical order",
            body:
              "Composition is matrix multiplication. With column vectors the matrix of the element encountered last stands on the left, so a beam passing first through M₁ and then through M₂ is described by M₂M₁. The identity matrix leaves a vector unchanged."
          },
          {
            title: "Test invertibility with the determinant",
            body:
              "The determinant measures how the map scales areas. det M = 0 means the map collapses two dimensions into one, which is exactly what an ideal polarizer does. A nonzero determinant guarantees an inverse, and for a 2×2 matrix the inverse is M⁻¹ = (1/det M)[[M₂₂, −M₁₂], [−M₂₁, M₁₁]]."
          }
        ]
      },
      {
        type: "eq",
        latex:
          "\\begin{pmatrix}b_1\\\\ b_2\\end{pmatrix}=\\begin{pmatrix}M_{11}&M_{12}\\\\ M_{21}&M_{22}\\end{pmatrix}\\begin{pmatrix}a_1\\\\ a_2\\end{pmatrix},\\qquad \\det M=M_{11}M_{22}-M_{12}M_{21}",
        number: "2.2"
      },
      {
        type: "p",
        text: "A rotation is the simplest nontrivial matrix. Explicitly, R(θ) = [[cos θ, −sin θ], [sin θ, cos θ]]. It is orthogonal, RᵀR = I, and has determinant +1. It preserves lengths and angles, so it changes orientation without changing intensity. Rotated optical elements are built from it: an element whose principal axes are at angle θ is M(θ) = R(θ) M(0) R(−θ). This similarity transformation is the reason a wave plate at 22.5° can rotate linear polarization by 45° in Chapter 10. A reflection, by contrast, has determinant −1 and reverses handedness."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "Matrix order is not a stylistic choice",
        body:
          "A half-wave plate followed by a polarizer is not the same experiment as the polarizer followed by the plate. The first can transmit light that the second blocks. With column vectors the product must be written M_total = M_last ⋯ M_first. Checking a calculated result against a physical argument — does this order make sense? — catches most sign and ordering mistakes."
      },
      {
        type: "p",
        text: "An eigenvector of a square matrix is a direction that the matrix only scales: Mv = λv. The scale factor λ is the eigenvalue. In optics, eigenvectors are the polarization states that pass through a retarder unchanged in form, or the normal modes of a cavity. For a 2×2 matrix the eigenvalues solve the characteristic equation λ² − (tr M)λ + det M = 0, whose discriminant is (tr M)² − 4 det M. Real symmetric matrices always have real eigenvalues and orthogonal eigenvectors; this is the finite-dimensional seed of the spectral theorem used in Chapter 08."
      },
      {
        type: "eq",
        latex:
          "M\\mathbf{v}=\\lambda\\mathbf{v},\\qquad \\lambda^2-(\\operatorname{tr}M)\\lambda+\\det M=0",
        number: "2.5"
      },
      {
        type: "derivation",
        derivationId: "d-m02-rotation"
      },
      {
        type: "numeric",
        title: "Dot, cross and angle",
        statement:
          "For a = (1, 2, 3) and b = (4, −5, 6), compute a·b, a×b, the angle between them, and verify that the cross product is orthogonal to a.",
        latex:
          "\\mathbf{a}\\cdot\\mathbf{b}=4-10+18=12,\\qquad \\mathbf{a}\\times\\mathbf{b}=(27,\\,6,\\,-13)",
        result:
          "|a| = √14 = 3.742 and |b| = √77 = 8.775, so cos θ = 12/(3.742 × 8.775) = 0.3655 and θ = 68.6°. Orthogonality check: a·(a×b) = 27 + 12 − 39 = 0. The cross-product magnitude |a×b| = √(729 + 36 + 169) = 30.56 equals |a||b| sin θ = 3.742 × 8.775 × 0.9308 = 30.56."
      },
      {
        type: "numeric",
        title: "Eigenvalues of a symmetric 2×2 matrix",
        statement:
          "Find the eigenvalues and eigenvectors of M = [[2, 1], [1, 2]] and describe what the matrix does geometrically.",
        latex:
          "\\lambda^2-4\\lambda+3=0\\;\\Rightarrow\\;\\lambda=3,\\,1",
        result:
          "The eigenvalues are 3 and 1. For λ = 3, (2−3)x + y = 0 gives y = x, so v₃ = (1, 1)/√2. For λ = 1, x + y = 0 gives v₁ = (1, −1)/√2. The matrix stretches the +45° direction by 3 and leaves the −45° direction unchanged; since the eigenvectors are orthogonal, M is symmetric and orthogonally diagonalisable: M = R(45°) diag(3, 1) R(−45°)."
      }
    ],
    equations: [
      {
        id: "m02-e1",
        latex:
          "\\mathbf{a}\\cdot\\mathbf{b}=\\sum_i a_ib_i,\\qquad \\mathbf{a}\\times\\mathbf{b}=\\begin{pmatrix}a_yb_z-a_zb_y\\\\ a_zb_x-a_xb_z\\\\ a_xb_y-a_yb_x\\end{pmatrix}",
        name: "Dot and cross products",
        symbols: [
          { symbol: "\\mathbf{a},\\mathbf{b}", meaning: "Real three-vectors", unit: "varies" },
          { symbol: "\\theta", meaning: "Angle between the vectors", unit: "rad" }
        ],
        interpretation:
          "The dot product is the projection of one vector on another; the cross product is the oriented area they span. Together they decompose any vector into components parallel and perpendicular to a reference direction.",
        assumptions: ["Euclidean three-dimensional space", "Right-handed coordinate system for the cross product"],
        usedIn: ["Poynting vector", "Ray directions", "Surface normals", "Polarization bases"],
        numericExample: {
          statement: "(1, 2, 3)·(4, −5, 6) = 12 and (1, 2, 3)×(4, −5, 6) = (27, 6, −13).",
          latex: "\\mathbf{a}\\cdot\\mathbf{b}=12"
        }
      },
      {
        id: "m02-e2",
        latex:
          "\\mathbf{b}=M\\mathbf{a},\\qquad b_i=\\sum_j M_{ij}a_j",
        name: "Matrix acting on a vector",
        symbols: [
          { symbol: "M", meaning: "Linear map, for example a Jones matrix", unit: "dimensionless" },
          { symbol: "\\mathbf{a},\\mathbf{b}", meaning: "Input and output vectors", unit: "varies" }
        ],
        interpretation:
          "Each output component is a weighted sum of all input components. The columns of M are the images of the basis vectors.",
        assumptions: ["Linear response", "Fixed, stable element during the measurement"],
        usedIn: ["Jones calculus", "Beam-splitter transformations", "Ray transfer matrices"],
        numericExample: {
          statement: "A 45° rotator sends (1, 0) to (1, 1)/√2.",
          latex: "R(45^\\circ)\\begin{pmatrix}1\\\\0\\end{pmatrix}=\\frac{1}{\\sqrt2}\\begin{pmatrix}1\\\\1\\end{pmatrix}"
        }
      },
      {
        id: "m02-e3",
        latex:
          "\\det M=M_{11}M_{22}-M_{12}M_{21},\\qquad M^{-1}=\\frac{1}{\\det M}\\begin{pmatrix}M_{22}&-M_{12}\\\\ -M_{21}&M_{11}\\end{pmatrix}",
        name: "Determinant and inverse",
        symbols: [
          { symbol: "\\det M", meaning: "Area scaling factor of the map", unit: "dimensionless" },
          { symbol: "M^{-1}", meaning: "Matrix that undoes M", unit: "dimensionless" }
        ],
        interpretation:
          "A zero determinant means the map is not invertible: distinct input states are collapsed onto one output line. An ideal polarizer is exactly such a map.",
        assumptions: ["Square matrix", "det M ≠ 0 for the inverse"],
        usedIn: ["Polarizer analysis", "Solving linear systems", "Change of basis"],
        numericExample: {
          statement: "For [[1, 2], [3, 4]], det = −2 and the inverse is [[−2, 1], [1.5, −0.5]].",
          latex: "\\det\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}=-2"
        }
      },
      {
        id: "m02-e4",
        latex:
          "R(\\theta)=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\ \\sin\\theta&\\cos\\theta\\end{pmatrix},\\qquad R(\\theta)^{\\mathsf T}R(\\theta)=I",
        name: "Rotation matrix",
        symbols: [
          { symbol: "\\theta", meaning: "Counter-clockwise rotation angle", unit: "rad" },
          { symbol: "R", meaning: "Rotation matrix acting on a column vector", unit: "dimensionless" }
        ],
        interpretation:
          "A rotation preserves length and relative angle. It is the similarity transformation used to express an optical element in a rotated coordinate frame.",
        assumptions: ["Active rotation of the vector", "Right-handed coordinate system"],
        usedIn: ["Rotated wave plates", "Polarizer orientation", "Coordinate changes"],
        numericExample: {
          statement: "R(90°)(1, 0) = (0, 1), and the length is unchanged.",
          latex: "R(90^\\circ)\\begin{pmatrix}1\\\\0\\end{pmatrix}=\\begin{pmatrix}0\\\\1\\end{pmatrix}"
        }
      },
      {
        id: "m02-e5",
        latex:
          "M\\mathbf{v}=\\lambda\\mathbf{v},\\qquad \\lambda^2-(\\operatorname{tr}M)\\lambda+\\det M=0",
        name: "Eigenvalue equation for a 2×2 matrix",
        symbols: [
          { symbol: "\\lambda", meaning: "Eigenvalue", unit: "depends on M" },
          { symbol: "\\mathbf{v}", meaning: "Eigenvector (eigenpolarization)", unit: "depends on M" },
          { symbol: "\\operatorname{tr}M", meaning: "Trace, M₁₁ + M₂₂", unit: "depends on M" }
        ],
        interpretation:
          "Eigenvectors are the directions that survive an element without changing character. In polarization they are the eigenpolarizations; their eigenvalues are complex transmission factors.",
        assumptions: ["2×2 matrix", "Eigenvectors normalisable"],
        usedIn: ["Retarder axes", "Cavity modes", "Stability analysis", "Density-matrix diagonalisation"],
        numericExample: {
          statement: "M = [[2, 1], [1, 2]] has trace 4 and determinant 3, so λ = 3 and λ = 1.",
          latex: "\\lambda^2-4\\lambda+3=(\\lambda-3)(\\lambda-1)"
        }
      }
    ],
    derivations: [
      {
        id: "d-m02-rotation",
        title: "A rotation preserves length",
        intro:
          "Orthogonality is not assumed; it follows from the explicit form of the rotation matrix.",
        steps: [
          {
            label: "1",
            text: "Apply R(θ) to a vector (x, y).",
            latex: "\\begin{pmatrix}x'\\\\ y'\\end{pmatrix}=\\begin{pmatrix}x\\cos\\theta-y\\sin\\theta\\\\ x\\sin\\theta+y\\cos\\theta\\end{pmatrix}"
          },
          {
            label: "2",
            text: "Form the squared length of the rotated vector.",
            latex: "x'^2+y'^2=(x\\cos\\theta-y\\sin\\theta)^2+(x\\sin\\theta+y\\cos\\theta)^2"
          },
          {
            label: "3",
            text: "Expand both squares.",
            latex:
              "x^2\\cos^2\\theta-2xy\\sin\\theta\\cos\\theta+y^2\\sin^2\\theta+x^2\\sin^2\\theta+2xy\\sin\\theta\\cos\\theta+y^2\\cos^2\\theta"
          },
          {
            label: "4",
            text: "The cross terms cancel and the remaining coefficients combine using cos²θ + sin²θ = 1.",
            latex: "x'^2+y'^2=x^2(\\cos^2\\theta+\\sin^2\\theta)+y^2(\\sin^2\\theta+\\cos^2\\theta)"
          },
          {
            label: "5",
            text: "Conclude that the length, and therefore the intensity of a Jones vector, is unchanged.",
            latex: "x'^2+y'^2=x^2+y^2"
          }
        ],
        result: {
          latex: "|R(\\theta)\\mathbf{v}|=|\\mathbf{v}|,\\qquad R^{\\mathsf T}R=I",
          text:
            "A rotation is an orthogonal matrix. Its determinant is +1, so it preserves orientation as well as length; a reflection would preserve length but have determinant −1."
        },
        assumptions: ["Real vector components", "Euclidean inner product", "θ measured in radians"]
      }
    ],
    problems: [
      {
        id: "m02-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Dot and cross products",
        prompt:
          "For a = (2, −1, 3) and b = (1, 4, −2), compute a·b and the magnitude of a×b. What is the angle between the vectors?",
        answer:
          "a·b = 2 − 4 − 6 = −8. The cross product is ((−1)(−2) − 3(4), 3(1) − 2(−2), 2(4) − (−1)(1)) = (2 − 12, 3 + 4, 8 + 1) = (−10, 7, 9), whose magnitude is √(100 + 49 + 81) = √230 = 15.17. With |a| = √14 = 3.742 and |b| = √21 = 4.583, cos θ = −8/(3.742 × 4.583) = −0.4665, so θ = 117.8°.",
        numeric: { value: 15.17, tolerance: 0.02, unit: "same units as a and b" },
        marks: 3
      },
      {
        id: "m02-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Inverse and determinant",
        prompt:
          "Find the determinant and inverse of M = [[2, 5], [1, 3]]. Verify your inverse by multiplying it by M.",
        answer:
          "det M = 6 − 5 = 1, so M⁻¹ = [[3, −5], [−1, 2]]. Check: [[3, −5], [−1, 2]] [[2, 5], [1, 3]] = [[6 − 5, 15 − 15], [−2 + 2, −5 + 6]] = I. Because the determinant is 1, the map preserves area.",
        numeric: { value: 1, tolerance: 0, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "m02-p3",
        type: "derivation",
        difficulty: 2,
        topic: "Eigenvalues",
        prompt:
          "Derive the characteristic equation for a 2×2 matrix and use it to find the eigenvalues of M = [[4, 2], [1, 3]].",
        answer:
          "Mv = λv implies (M − λI)v = 0. A nonzero v exists only if det(M − λI) = 0. For 2×2, det(M − λI) = (M₁₁ − λ)(M₂₂ − λ) − M₁₂M₂₁ = λ² − (tr M)λ + det M. Here tr M = 7 and det M = 12 − 2 = 10, so λ² − 7λ + 10 = 0 = (λ − 5)(λ − 2). The eigenvalues are 5 and 2.",
        marks: 4
      },
      {
        id: "m02-p4",
        type: "mcq",
        difficulty: 2,
        topic: "Matrix composition",
        prompt:
          "Light passes through element A and then element B. With column vectors, which product represents the combined action?",
        options: ["AB", "BA", "A + B", "A⁻¹B"],
        answerIndex: 1,
        answer:
          "The output of A is the input of B: v_out = B(A v_in) = (BA)v_in. The last element stands on the left. Matrix multiplication does not commute in general, so AB would describe the reverse order.",
        explanation:
          "Write the sequence on the physical beam path and then read the matrices from right to left.",
        marks: 2
      },
      {
        id: "m02-p5",
        type: "mcq",
        difficulty: 1,
        topic: "Determinant",
        prompt: "An ideal linear polarizer is represented by a 2×2 Jones matrix. What is its determinant?",
        options: ["1", "0", "−1", "It depends on the input polarization"],
        answerIndex: 1,
        answer:
          "A polarizer maps every input Jones vector onto a single output direction. Two independent input directions collapse onto one line, so the area scaling factor is zero. A zero determinant means the map has no inverse: information about the input polarization is lost.",
        explanation:
          "Determinants describe area scaling; collapse to a line is area zero.",
        marks: 1
      },
      {
        id: "m02-p6",
        type: "short",
        difficulty: 2,
        topic: "Orthogonal matrices",
        prompt:
          "Show that the 2×2 rotation matrix is orthogonal and explain the physical consequence for a Jones vector.",
        answer:
          "RᵀR = [[c, s], [−s, c]][[c, −s], [s, c]] = [[c² + s², −cs + sc], [−sc + cs, s² + c²]] = I. Hence Rᵀ = R⁻¹ and |Rv|² = (Rv)ᵀ(Rv) = vᵀRᵀRv = vᵀv = |v|². Physically, rotating the coordinate axes (or the element) cannot change the transmitted intensity of a lossless element.",
        marks: 3
      }
    ],
    references: [R("nielsen"), R("goldstein"), R("hecht"), R("fowles")],
    related: [
      "polarization-3d-cinema",
      "mach-zehnder-interferometer",
      "trigonometry-and-complex-numbers",
      "linear-algebra-and-hilbert-spaces",
      "polarization-mathematics"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 03 — Waves and Maxwell                                             */
  /* ------------------------------------------------------------------ */
  {
    id: "waves-and-maxwell",
    number: "03",
    title: "Waves and Maxwell's Equations",
    kicker: "Where the optical field comes from",
    summary:
      "Maxwell's equations in vacuum predict a transverse wave travelling at c, with mutually perpendicular E and B fields in phase. This chapter derives the wave equation, relates field amplitude to measurable intensity through the Poynting vector, and fixes the units and orders of magnitude used throughout the laboratory.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "Interference, polarization and diffraction are all consequences of one classical field obeying Maxwell's equations. Before counting photons it is worth knowing exactly what the classical wave is, how fast it travels, which way its fields point, and how much power it carries."
      },
      {
        type: "p",
        text: "In a charge-free, current-free, linear medium the electric field satisfies the wave equation. The equation says that the curvature of the field in space is proportional to its second derivative in time; the constant of proportionality has dimensions of speed squared. Its simplest solutions are harmonic waves propagating without changing shape. In one dimension, E(z,t) = E₀cos(ωt − kz + φ), with phase velocity v = ω/k. In vacuum v = c = 299 792 458 m s⁻¹ exactly; in a medium of refractive index n the phase velocity is c/n and the wavelength is λ₀/n."
      },
      {
        type: "eq",
        latex:
          "\\nabla^2\\mathbf{E}-\\frac{1}{v^2}\\frac{\\partial^2\\mathbf{E}}{\\partial t^2}=0",
        number: "3.1",
        note: "∇² is the Laplacian in m⁻²; v is the phase velocity in m s⁻¹."
      },
      {
        type: "p",
        text: "A plane wave is the idealised solution in which surfaces of constant phase are planes. Its complex form is E = E₀ exp[i(ωt − k·r)], with wavevector k pointing along the propagation direction and |k| = 2π/λ. Maxwell's equations force the field to be transverse: k·E = 0. They also fix the magnetic field, B = (1/v) k̂ × E, so E, B and k form a right-handed orthogonal triad. In vacuum |E| = c|B| at every instant; the two fields are in phase, not 90° apart. The ratio |E|/|H| is the wave impedance Z₀ = √(μ₀/ε₀) ≈ 376.7 Ω in vacuum."
      },
      {
        type: "callout",
        tone: "principle",
        title: "The displacement current completes the wave equation",
        body:
          "The four Maxwell equations are Gauss's law for electricity, Gauss's law for magnetism, Faraday's law, and the Ampère–Maxwell law. In vacuum with no sources the first two say that field lines close or extend to infinity; the last two couple changing electric and magnetic fields. The displacement current term ε₀∂E/∂t in the Ampère–Maxwell law is the term Maxwell added: without it a changing electric field could not generate a magnetic field and no electromagnetic wave could propagate. In a medium the equations are supplemented by constitutive relations D = εE and B = μH."
      },
      {
        type: "eq",
        latex:
          "\\begin{aligned}\\nabla\\cdot\\mathbf{E}&=\\frac{\\rho}{\\varepsilon_0},&\\nabla\\cdot\\mathbf{B}&=0,\\\\ \\nabla\\times\\mathbf{E}&=-\\frac{\\partial\\mathbf{B}}{\\partial t},&\\nabla\\times\\mathbf{B}&=\\mu_0\\mathbf{J}+\\mu_0\\varepsilon_0\\frac{\\partial\\mathbf{E}}{\\partial t}\\end{aligned}",
        number: "3.3",
        note: "SI form in vacuum; ρ is C m⁻³ and J is A m⁻²."
      },
      {
        type: "p",
        text: "Energy transport is described by the Poynting vector S = E × H, whose magnitude is power per unit area in W m⁻² and whose direction is the direction of propagation. For a harmonic plane wave in vacuum S oscillates at 2ω, but no detector in this laboratory can follow an optical cycle. The measured intensity is the cycle average, I = ½ε₀cE₀² = E₀²/(2Z₀), where E₀ is the peak field in V m⁻¹. This is the bridge between the field description and every power meter, photodiode and camera in the lab."
      },
      {
        type: "eq",
        latex:
          "\\mathbf{S}=\\mathbf{E}\\times\\mathbf{H},\\qquad I=\\langle|\\mathbf{S}|\\rangle=\\frac{1}{2}\\varepsilon_0cE_0^2=\\frac{E_0^2}{2Z_0}",
        number: "3.4"
      },
      {
        type: "callout",
        tone: "misconception",
        title: "E and B are in phase and both are transverse",
        body:
          "A common diagram draws E and B with a 90° phase difference, as if one were the derivative of the other. For a plane wave in a lossless medium they reach their maxima together. Nor is B negligible: |B| = |E|/c, which is small in SI units only because c is large. A 1 V m⁻¹ optical field carries a magnetic field of about 3.3 nT, comparable to weak laboratory magnetic fluctuations, yet the electric force on an electron is c times larger."
      },
      {
        type: "derivation",
        derivationId: "d-m03-maxwell-wave"
      },
      {
        type: "numeric",
        title: "Field amplitude of a weak beam",
        statement:
          "A plane wave in vacuum has a peak electric field of 1.00 V m⁻¹. Find its intensity and the peak magnetic field. Compare the magnetic field with Earth's roughly 50 µT field.",
        latex:
          "I=\\frac{1}{2}(8.854\\times10^{-12})(2.998\\times10^8)(1.00)^2=1.33\\times10^{-3}\\ \\mathrm{W\\,m^{-2}}",
        result:
          "I = 1.33 mW m⁻² = 1.33 × 10⁻³ W m⁻². B₀ = E₀/c = 3.34 × 10⁻⁹ T = 3.34 nT, about 15 000 times smaller than Earth's field. The optical field is weak in magnetic terms but its frequency is enormous, so the induced currents and the delivered power are still measurable."
      },
      {
        type: "numeric",
        title: "Field amplitude of a milliwatt beam",
        statement:
          "A 1.00 mW laser beam has a circular diameter of 1.00 mm. Assuming a uniform intensity across the beam, find the intensity, the peak electric field and the peak magnetic field.",
        latex:
          "A=\\pi(0.500\\times10^{-3})^2=7.854\\times10^{-7}\\ \\mathrm{m^2},\\qquad I=\\frac{10^{-3}}{A}=1.27\\times10^3\\ \\mathrm{W\\,m^{-2}}",
        result:
          "I = 1.27 kW m⁻². Then E₀ = √(2IZ₀) = √(2 × 1273 × 376.7) = 979 V m⁻¹, and B₀ = E₀/c = 3.27 µT. A real Gaussian beam has a peak intensity twice this uniform-beam estimate, so its peak field is larger by √2."
      }
    ],
    equations: [
      {
        id: "m03-e1",
        latex:
          "\\nabla^2\\mathbf{E}-\\frac{1}{v^2}\\frac{\\partial^2\\mathbf{E}}{\\partial t^2}=0",
        name: "Electromagnetic wave equation",
        symbols: [
          { symbol: "\\mathbf{E}", meaning: "Electric field vector", unit: "V m⁻¹" },
          { symbol: "v", meaning: "Phase velocity in the medium", unit: "m s⁻¹" },
          { symbol: "\\nabla^2", meaning: "Laplacian operator", unit: "m⁻²" }
        ],
        interpretation:
          "A disturbance propagates at speed v. In vacuum v = c = 1/√(μ₀ε₀); in a medium v = c/n.",
        assumptions: ["Linear, isotropic, homogeneous, non-absorbing medium", "No free charge or current in the region"],
        usedIn: ["Plane waves", "Gaussian beams", "Diffraction", "Pulse propagation"],
        numericExample: {
          statement: "In vacuum v = 1/√(μ₀ε₀) = 2.998 × 10⁸ m s⁻¹.",
          latex: "c=\\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}}"
        }
      },
      {
        id: "m03-e2",
        latex:
          "\\mathbf{E}=\\mathbf{E}_0e^{i(\\omega t-\\mathbf{k}\\cdot\\mathbf{r})},\\qquad \\mathbf{k}\\cdot\\mathbf{E}_0=0,\\qquad |\\mathbf{E}_0|=v|\\mathbf{B}_0|",
        name: "Transverse plane wave",
        symbols: [
          { symbol: "\\mathbf{k}", meaning: "Wavevector, direction of propagation", unit: "rad m⁻¹" },
          { symbol: "\\omega", meaning: "Angular frequency", unit: "rad s⁻¹" },
          { symbol: "\\mathbf{E}_0,\\mathbf{B}_0", meaning: "Peak field vectors", unit: "V m⁻¹, T" }
        ],
        interpretation:
          "Plane waves are transverse: the electric field is perpendicular to the propagation direction. The magnetic field is perpendicular to both and smaller by a factor v.",
        assumptions: ["Plane wave", "Isotropic medium", "Lossless propagation"],
        usedIn: ["Polarization", "Interference", "Poynting vector", "Beam propagation"],
        numericExample: {
          statement: "For E₀ = 979 V m⁻¹, B₀ = 979/c = 3.27 µT.",
          latex: "B_0=\\frac{E_0}{c}=3.27\\ \\mu\\mathrm{T}"
        }
      },
      {
        id: "m03-e3",
        latex:
          "\\nabla\\cdot\\mathbf{E}=\\frac{\\rho}{\\varepsilon_0},\\quad \\nabla\\cdot\\mathbf{B}=0,\\quad \\nabla\\times\\mathbf{E}=-\\frac{\\partial\\mathbf{B}}{\\partial t},\\quad \\nabla\\times\\mathbf{B}=\\mu_0\\mathbf{J}+\\mu_0\\varepsilon_0\\frac{\\partial\\mathbf{E}}{\\partial t}",
        name: "Maxwell's equations in vacuum",
        symbols: [
          { symbol: "\\rho", meaning: "Volume charge density", unit: "C m⁻³" },
          { symbol: "\\mathbf{J}", meaning: "Current density", unit: "A m⁻²" },
          { symbol: "\\varepsilon_0", meaning: "Vacuum permittivity", unit: "F m⁻¹" },
          { symbol: "\\mu_0", meaning: "Vacuum permeability", unit: "H m⁻¹" }
        ],
        interpretation:
          "The curl equations couple electric and magnetic fields. The displacement-current term μ₀ε₀∂E/∂t is what allows a changing electric field to sustain a propagating wave.",
        assumptions: ["SI units", "Vacuum form; replace ε₀, μ₀ by ε, μ in a medium"],
        usedIn: ["Wave equation", "Refractive index", "Impedance", "Boundary conditions"],
        numericExample: {
          statement: "The displacement-current coefficient μ₀ε₀ = 1/c² = 1.113 × 10⁻¹⁷ s² m⁻².",
          latex: "\\mu_0\\varepsilon_0=\\frac{1}{c^2}"
        }
      },
      {
        id: "m03-e4",
        latex:
          "Z_0=\\sqrt{\\frac{\\mu_0}{\\varepsilon_0}}\\approx376.7\\ \\Omega,\\qquad \\frac{|\\mathbf{E}|}{|\\mathbf{H}|}=Z_0",
        name: "Wave impedance of free space",
        symbols: [
          { symbol: "Z_0", meaning: "Characteristic impedance of vacuum", unit: "Ω" },
          { symbol: "\\mathbf{H}", meaning: "Magnetic field strength", unit: "A m⁻¹" }
        ],
        interpretation:
          "The impedance fixes how much electric field accompanies a given magnetic field. It converts between field amplitudes and power flow.",
        assumptions: ["Plane wave in vacuum", "Far from sources"],
        usedIn: ["Intensity calibration", "Antenna and detector matching", "Reflection coefficients"],
        numericExample: {
          statement: "A 1 V m⁻¹ field has H = 1/376.7 = 2.65 mA m⁻¹.",
          latex: "H=\\frac{E}{Z_0}=2.65\\ \\mathrm{mA\\,m^{-1}}"
        }
      },
      {
        id: "m03-e5",
        latex:
          "\\mathbf{S}=\\mathbf{E}\\times\\mathbf{H},\\qquad I=\\langle S\\rangle=\\frac{1}{2}\\varepsilon_0cE_0^2",
        name: "Poynting vector and cycle-averaged intensity",
        symbols: [
          { symbol: "\\mathbf{S}", meaning: "Instantaneous power flux density", unit: "W m⁻²" },
          { symbol: "I", meaning: "Time-averaged intensity", unit: "W m⁻²" },
          { symbol: "E_0", meaning: "Peak electric-field amplitude", unit: "V m⁻¹" }
        ],
        interpretation:
          "Power flows perpendicular to both E and H. Detectors average the rapidly oscillating instantaneous flux, leaving an intensity proportional to the squared field amplitude.",
        assumptions: ["Plane wave", "Linear medium", "Detector bandwidth much smaller than optical frequency"],
        usedIn: ["Beam power", "Optical tweezers", "Detector calibration", "Laser safety"],
        numericExample: {
          statement: "E₀ = 1 V m⁻¹ gives I = 1.33 mW m⁻².",
          latex: "I=\\frac{(1)^2}{2(376.7)}=1.33\\times10^{-3}\\ \\mathrm{W\\,m^{-2}}"
        }
      }
    ],
    derivations: [
      {
        id: "d-m03-maxwell-wave",
        title: "Deriving the wave equation from Maxwell's equations",
        intro:
          "Take the curl of Faraday's law and use the Ampère–Maxwell law to eliminate the magnetic field.",
        steps: [
          {
            label: "1",
            text: "Start from the vacuum Maxwell equations with no sources.",
            latex:
              "\\nabla\\cdot\\mathbf{E}=0,\\quad \\nabla\\cdot\\mathbf{B}=0,\\quad \\nabla\\times\\mathbf{E}=-\\frac{\\partial\\mathbf{B}}{\\partial t},\\quad \\nabla\\times\\mathbf{B}=\\mu_0\\varepsilon_0\\frac{\\partial\\mathbf{E}}{\\partial t}"
          },
          {
            label: "2",
            text: "Take the curl of both sides of Faraday's law.",
            latex:
              "\\nabla\\times(\\nabla\\times\\mathbf{E})=-\\frac{\\partial}{\\partial t}(\\nabla\\times\\mathbf{B})"
          },
          {
            label: "3",
            text: "Use the vector identity for the curl of a curl and the fact that ∇·E = 0.",
            latex:
              "\\nabla\\times(\\nabla\\times\\mathbf{E})=\\nabla(\\nabla\\cdot\\mathbf{E})-\\nabla^2\\mathbf{E}=-\\nabla^2\\mathbf{E}"
          },
          {
            label: "4",
            text: "Substitute the Ampère–Maxwell expression for ∇×B.",
            latex:
              "-\\nabla^2\\mathbf{E}=-\\frac{\\partial}{\\partial t}\\left(\\mu_0\\varepsilon_0\\frac{\\partial\\mathbf{E}}{\\partial t}\\right)"
          },
          {
            label: "5",
            text: "Rearrange and identify the speed of the wave.",
            latex:
              "\\nabla^2\\mathbf{E}=\\mu_0\\varepsilon_0\\frac{\\partial^2\\mathbf{E}}{\\partial t^2},\\qquad c=\\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}}"
          }
        ],
        result: {
          latex: "\\nabla^2\\mathbf{E}-\\frac{1}{c^2}\\frac{\\partial^2\\mathbf{E}}{\\partial t^2}=0",
          text:
            "The electric field obeys a wave equation with speed c. The magnetic field obeys the same equation, and the two are locked together by Faraday's law and the Ampère–Maxwell law."
        },
        assumptions: [
          "Vacuum, or a linear medium with constant ε and μ",
          "No free charge or current in the propagation region",
          "Fields varying slowly compared with interatomic response times"
        ]
      }
    ],
    problems: [
      {
        id: "m03-p1",
        type: "numerical",
        difficulty: 2,
        topic: "Intensity from field",
        prompt:
          "A plane wave in vacuum has a peak electric field of 10.0 V m⁻¹. Calculate its intensity and peak magnetic field.",
        answer:
          "I = ½ε₀cE₀² = 0.5 × 8.854 × 10⁻¹² × 2.998 × 10⁸ × 100 = 0.1327 W m⁻². Equivalently I = E₀²/(2Z₀) = 100/(753.4) = 0.1327 W m⁻². B₀ = E₀/c = 10/2.998 × 10⁸ = 3.34 × 10⁻⁸ T = 33.4 nT.",
        numeric: { value: 0.1327, tolerance: 0.001, unit: "W m⁻²" },
        marks: 3
      },
      {
        id: "m03-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Wavelength, frequency and wavenumber",
        prompt:
          "For light of vacuum wavelength 500 nm, compute the frequency, angular frequency and wavenumber. What is the photon energy?",
        answer:
          "f = c/λ = 2.998 × 10⁸/500 × 10⁻⁹ = 5.996 × 10¹⁴ Hz. ω = 2πf = 3.767 × 10¹⁵ rad s⁻¹. k = 2π/λ = 1.257 × 10⁷ rad m⁻¹. Photon energy E = hf = 6.626 × 10⁻³⁴ × 5.996 × 10¹⁴ = 3.973 × 10⁻¹⁹ J = 2.48 eV.",
        numeric: { value: 5.996e14, tolerance: 1e11, unit: "Hz" },
        marks: 3
      },
      {
        id: "m03-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Field geometry",
        prompt: "For a plane electromagnetic wave in vacuum, which statement is correct?",
        options: [
          "E and B are parallel and oscillate 90° out of phase",
          "E and B are perpendicular, both perpendicular to k, and in phase",
          "E is longitudinal and B is transverse",
          "B leads E by 90° and |E| = c|B|"
        ],
        answerIndex: 1,
        answer:
          "Maxwell's equations give k·E = 0 and B = (1/c)k̂ × E. Thus E and B are both transverse to k and perpendicular to each other. In a lossless medium they reach their maxima together, and their magnitudes are related by |E| = c|B|.",
        explanation:
          "The 90° phase difference appears in the near field of a source or in a conducting medium, not in a propagating vacuum plane wave.",
        marks: 1
      },
      {
        id: "m03-p4",
        type: "derivation",
        difficulty: 2,
        topic: "Displacement current",
        prompt:
          "Derive what Maxwell's equations would imply without the displacement-current term, and explain why electromagnetic waves would not propagate.",
        answer:
          "Without the ε₀∂E/∂t term, the curl of B would be μ₀J, which is zero in a charge-free region. Taking the curl of Faraday's law gives ∇×(∇×E) = −∂(∇×B)/∂t = 0, and the vector identity reduces this to −∇²E = 0 because ∇·E = 0. The result is Laplace's equation, which has no propagating wave solutions: a static field configuration can satisfy it, but a disturbance cannot travel. The displacement current allows a changing electric field to generate a magnetic field, closing the loop in which a changing B generates E and a changing E generates B. It also makes the equations consistent with charge conservation.",
        marks: 3
      },
      {
        id: "m03-p5",
        type: "short",
        difficulty: 2,
        topic: "Poynting vector",
        prompt:
          "A plane wave propagates along +z with E along +x. Explain how to determine the direction of B and of the Poynting vector, and give both directions.",
        answer:
          "B = (1/c)ẑ × E. Since ẑ × x̂ = ŷ, B points along +y. Then S = E × H = x̂ × ŷ ∝ ẑ, so power flows along +z, the propagation direction. Equivalently, the triad (E, B, k) is right-handed and E × B points along k. A common error is to reverse B; that would make S point backwards, contradicting the known propagation direction.",
        marks: 2
      },
      {
        id: "m03-p6",
        type: "numerical",
        difficulty: 2,
        topic: "Power and area",
        prompt:
          "A laser delivers 5.0 mW into a circular spot of diameter 2.0 mm. What is the average intensity? If the beam is Gaussian with the same total power and a 1/e² radius of 1.0 mm, what is the peak intensity?",
        answer:
          "Uniform estimate: area = π(1.0 × 10⁻³)² = 3.142 × 10⁻⁶ m², so I = 5.0 × 10⁻³/3.142 × 10⁻⁶ = 1.59 × 10³ W m⁻². For a Gaussian beam, I(r) = (2P/πw²)exp(−2r²/w²), so the peak is I₀ = 2P/(πw²) = 2 × 5.0 × 10⁻³/(π × 10⁻⁶) = 3.18 × 10³ W m⁻², exactly twice the uniform estimate.",
        numeric: { value: 3.18e3, tolerance: 20, unit: "W m⁻²" },
        marks: 3
      }
    ],
    references: [R("bornwolf"), R("hecht"), R("fowles"), R("saleh")],
    related: [
      "michelson-interferometer",
      "polarization-3d-cinema",
      "optical-tweezers",
      "trigonometry-and-complex-numbers",
      "interference-and-coherence"
    ]
  }
,

  /* ------------------------------------------------------------------ */
  /* 04 — Interference and coherence                                    */
  /* ------------------------------------------------------------------ */
  {
    id: "interference-and-coherence",
    number: "04",
    title: "Interference and Coherence",
    kicker: "When two waves can keep a promise",
    summary:
      "Two beams interfere only if their relative phase is stable long enough to be recorded. This chapter derives the two-beam intensity law, defines optical path difference, visibility and coherence length, and separates the two independent reasons a fringe pattern can fade: unequal intensities and incomplete coherence.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "Interference is the simplest measurement in optics and the most demanding: it compares two phases by converting a phase difference into an intensity. Everything else in this chapter follows from asking how well that comparison can survive an imperfect source, an unequal beam splitter and a moving mirror."
      },
      {
        type: "p",
        text: "Consider two scalar fields of the same frequency and polarization reaching the same detector point. Their complex amplitudes are E₁ and E₂. Because the detector averages over many optical cycles and over a finite response time, the measured intensity is proportional to the time-averaged squared modulus of the sum. Expanding the square gives three terms: the two individual intensities and a cross term that depends on the relative phase. If the fields are mutually coherent and the path difference is fixed, the cross term is 2√(I₁I₂)cos δ. If the relative phase fluctuates randomly over the integration time, the cross term averages to zero and only the sum of the intensities remains. Partial coherence is the intermediate case, described by a factor |γ| between zero and one."
      },
      {
        type: "eq",
        latex:
          "\\begin{aligned}I&=I_1+I_2+2\\sqrt{I_1I_2}\\,|\\gamma|\\cos\\delta,\\\\ \\delta&=\\frac{2\\pi n\\Delta}{\\lambda_0},\\qquad \\Delta=2(L_1-L_2)\\ \\text{(Michelson)}\\end{aligned}",
        number: "4.1",
        note: "I in W m⁻², Δ in m, λ₀ in m, δ in rad; |γ| is dimensionless."
      },
      {
        type: "p",
        text: "In a Michelson interferometer the light travels each arm twice, so a mirror displacement d changes the optical path difference by 2d. One complete fringe therefore corresponds to d = λ/2, and counting N fringes while a mirror moves gives λ = 2d/N. The same factor of two appears in the refractive-index measurement: evacuating a cell of length t changes the optical path by 2(n − 1)t, so N = 2(n − 1)t/λ. These relations are the working equations of the Michelson experiment in this laboratory."
      },
      {
        type: "p",
        text: "Fringe visibility quantifies how deep the modulation is. It is defined as V = (I_max − I_min)/(I_max + I_min), which is one for perfect cancellation at the minimum and zero for a flat pattern. With two beams of intensities I₁ and I₂ and a degree of coherence |γ|, the maximum occurs at cos δ = +1 and the minimum at cos δ = −1, giving V = 2√(I₁I₂)|γ|/(I₁ + I₂). The first factor is a beam-balance penalty; the second is a coherence penalty. A laboratory measurement cannot separate them without an independent estimate of the intensity ratio, which is why both beam powers are recorded."
      },
      {
        type: "eq",
        latex:
          "V=\\frac{I_{\\max}-I_{\\min}}{I_{\\max}+I_{\\min}}=\\frac{2\\sqrt{I_1I_2}}{I_1+I_2}\\,|\\gamma|",
        number: "4.2"
      },
      {
        type: "h",
        text: "Coherence in time and space",
        id: "coherence-time-space"
      },
      {
        type: "p",
        text: "Coherence has two independent aspects. Temporal coherence describes the correlation between the field at one point at two different times; it is set by the source spectrum. The normalized field autocorrelation γ(τ) = ⟨E(t)E*(t+τ)⟩/⟨|E(t)|²⟩ is the quantitative measure, and its modulus is the factor |γ| that appears in the interference law. A source with bandwidth Δλ has a coherence time τ_c and a coherence length L_c = cτ_c beyond which the phase relationship is lost. For a Gaussian spectral profile the laboratory convention used here is L_c = λ₀²/Δλ with Δλ the full width at half maximum, which gives the order of magnitude correctly for a real laser or lamp. Spatial coherence describes the correlation between two transverse points at the same time; it is set by the source size and determines whether extended-source fringes are visible across a wide aperture."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "Low visibility does not always mean low coherence",
        body:
          "A perfectly coherent pair of beams with a 10:1 intensity ratio has V = 2√10/11 = 0.575. If the observed visibility is 0.5, the cause may be beam imbalance rather than a short coherence length. Conversely, a white-light source can give sharp fringes near zero path difference and no fringes a few micrometres away. Always measure the beam powers and scan the path difference before attributing a washed-out pattern to coherence."
      },
      {
        type: "derivation",
        derivationId: "d-m04-visibility"
      },
      {
        type: "numeric",
        title: "Visibility from beam balance and coherence",
        statement:
          "Two beams of intensities 1.0 and 4.0 mW cm⁻² interfere. First assume perfect coherence, then assume |γ| = 0.5. Find the maximum, minimum and visibility in each case.",
        latex:
          "I_{\\max}=5+2(2)|\\gamma|=5+4|\\gamma|,\\qquad I_{\\min}=5-4|\\gamma|",
        result:
          "For |γ| = 1: I_max = 9.0, I_min = 1.0, V = 0.80. For |γ| = 0.5: I_max = 7.0, I_min = 3.0, V = 0.40. Notice that I_max + I_min = 2(I₁ + I₂) = 10 in both cases: coherence redistributes intensity between maximum and minimum but does not change the total power."
      },
      {
        type: "numeric",
        title: "Coherence length of a filtered laser",
        statement:
          "A 632.8 nm He–Ne laser is followed by a filter with a 0.0010 nm bandwidth. Estimate the coherence length and coherence time. Repeat for a 0.10 nm bandwidth.",
        latex:
          "L_c=\\frac{(632.8\\times10^{-9})^2}{1.0\\times10^{-12}}=0.400\\ \\mathrm{m}",
        result:
          "For Δλ = 0.0010 nm, L_c = 0.400 m and τ_c = L_c/c = 1.34 ns. For Δλ = 0.10 nm, L_c = 4.00 mm and τ_c = 13.4 ps. The interferometer can tolerate an arm imbalance comparable to L_c; beyond that the visibility envelope falls and fringe counting becomes unreliable."
      }
    ],
    equations: [
      {
        id: "m04-e1",
        latex:
          "I=I_1+I_2+2\\sqrt{I_1I_2}\\,|\\gamma|\\cos\\delta",
        name: "Two-beam interference with partial coherence",
        symbols: [
          { symbol: "I_1,I_2", meaning: "Individual beam intensities", unit: "W m⁻²" },
          { symbol: "\\delta", meaning: "Relative phase", unit: "rad" },
          { symbol: "|\\gamma|", meaning: "Degree of coherence, 0 to 1", unit: "dimensionless" }
        ],
        interpretation:
          "The interference term is the overlap of the two fields. It is largest when the beams are balanced and mutually coherent, and vanishes when their relative phase is random.",
        assumptions: ["Same frequency", "Same polarization", "Stationary statistics over the integration time"],
        usedIn: ["Michelson", "Mach–Zehnder", "Young's slits", "Quantum eraser"],
        numericExample: {
          statement: "Equal beams with |γ| = 1 and δ = 60° give I = 3I₀.",
          latex: "I=2I_0(1+\\cos60^\\circ)=3I_0"
        }
      },
      {
        id: "m04-e2",
        latex:
          "\\delta=\\frac{2\\pi n\\Delta}{\\lambda_0},\\qquad \\Delta=2(L_1-L_2)",
        name: "Phase from optical path difference",
        symbols: [
          { symbol: "\\Delta", meaning: "Optical path difference", unit: "m" },
          { symbol: "n", meaning: "Refractive index", unit: "dimensionless" },
          { symbol: "L_1,L_2", meaning: "Michelson arm lengths", unit: "m" }
        ],
        interpretation:
          "A path difference of one wavelength is one fringe. In a Michelson the round trip doubles the mirror displacement.",
        assumptions: ["Air or vacuum arms unless n is stated", "Collimated beams", "Small angular tilt"],
        usedIn: ["Fringe counting", "Wavelength measurement", "Refractive index of gases"],
        numericExample: {
          statement: "A 0.25 µm mirror move at 500 nm gives Δ = 0.50 µm and δ = 2π.",
          latex: "\\delta=2\\pi\\frac{0.500}{0.500}=2\\pi"
        }
      },
      {
        id: "m04-e3",
        latex:
          "V=\\frac{I_{\\max}-I_{\\min}}{I_{\\max}+I_{\\min}}=\\frac{2\\sqrt{I_1I_2}}{I_1+I_2}|\\gamma|",
        name: "Fringe visibility",
        symbols: [
          { symbol: "V", meaning: "Visibility, 0 to 1", unit: "dimensionless" },
          { symbol: "I_{\\max},I_{\\min}", meaning: "Intensities at constructive and destructive settings", unit: "W m⁻²" }
        ],
        interpretation:
          "Visibility is the normalized depth of the intensity modulation. It combines beam balance and coherence into one measurable number.",
        assumptions: ["Sinusoidal fringe profile", "Constant total power during the scan", "Detector linear in intensity"],
        usedIn: ["Coherence measurement", "Interferometer alignment", "Quantum eraser visibility"],
        numericExample: {
          statement: "I₁ = 1, I₂ = 4, |γ| = 1 gives V = 4/5 = 0.80.",
          latex: "V=\\frac{2\\sqrt4}{5}=0.80"
        }
      },
      {
        id: "m04-e4",
        latex:
          "L_c=\\frac{\\lambda_0^2}{\\Delta\\lambda},\\qquad \\tau_c=\\frac{L_c}{c}",
        name: "Coherence length and time (Gaussian-spectrum convention)",
        symbols: [
          { symbol: "L_c", meaning: "Coherence length", unit: "m" },
          { symbol: "\\tau_c", meaning: "Coherence time", unit: "s" },
          { symbol: "\\Delta\\lambda", meaning: "Spectral full width at half maximum", unit: "m" }
        ],
        interpretation:
          "The coherence length is the path-difference scale over which the fringe visibility envelope falls. It is inversely proportional to spectral bandwidth: broader spectrum, shorter coherence.",
        assumptions: ["Gaussian spectral profile", "Δλ ≪ λ₀", "Single transverse mode"],
        usedIn: ["Michelson", "White-light interferometry", "Optical coherence tomography"],
        numericExample: {
          statement: "λ₀ = 632.8 nm and Δλ = 0.001 nm give L_c = 0.400 m.",
          latex: "L_c=\\frac{(632.8\\ \\mathrm{nm})^2}{0.001\\ \\mathrm{nm}}=0.400\\ \\mathrm{m}"
        }
      },
      {
        id: "m04-e5",
        latex:
          "\\gamma(\\tau)=\\frac{\\langle E(t)E^*(t+\\tau)\\rangle}{\\langle|E(t)|^2\\rangle}",
        name: "Complex degree of temporal coherence",
        symbols: [
          { symbol: "\\gamma(\\tau)", meaning: "Normalized field autocorrelation at delay τ", unit: "dimensionless" },
          { symbol: "\\tau", meaning: "Time delay between the two paths", unit: "s" }
        ],
        interpretation:
          "Coherence is a correlation function. Its modulus is what appears in the interference law; its phase gives the mean relative phase between the two paths.",
        assumptions: ["Stationary field", "Ergodic averaging", "Same polarization"],
        usedIn: ["Coherence theory", "Fourier-transform spectroscopy", "Visibility envelope"],
        numericExample: {
          statement: "For a Gaussian spectrum, |γ(τ)| = exp(−τ²/τ_c²); at τ = τ_c it has fallen to 1/e.",
          latex: "|\\gamma(\\tau_c)|=e^{-1}=0.368"
        }
      }
    ],
    derivations: [
      {
        id: "d-m04-visibility",
        title: "Visibility from maximum and minimum intensity",
        intro:
          "The visibility formula follows from evaluating the interference law at the two phase settings that give the extrema.",
        steps: [
          {
            label: "1",
            text: "At constructive interference cos δ = +1, so the intensity is maximal.",
            latex: "I_{\\max}=I_1+I_2+2\\sqrt{I_1I_2}|\\gamma|"
          },
          {
            label: "2",
            text: "At destructive interference cos δ = −1, so the intensity is minimal.",
            latex: "I_{\\min}=I_1+I_2-2\\sqrt{I_1I_2}|\\gamma|"
          },
          {
            label: "3",
            text: "Subtract the minimum from the maximum.",
            latex: "I_{\\max}-I_{\\min}=4\\sqrt{I_1I_2}|\\gamma|"
          },
          {
            label: "4",
            text: "Add them.",
            latex: "I_{\\max}+I_{\\min}=2(I_1+I_2)"
          },
          {
            label: "5",
            text: "Divide and simplify.",
            latex: "V=\\frac{I_{\\max}-I_{\\min}}{I_{\\max}+I_{\\min}}=\\frac{2\\sqrt{I_1I_2}}{I_1+I_2}|\\gamma|"
          }
        ],
        result: {
          latex: "V=\\frac{2\\sqrt{r}}{1+r}|\\gamma|,\\qquad r=\\frac{I_1}{I_2}",
          text:
            "The visibility is a product of a balance factor and a coherence factor. It is maximal at r = 1 and |γ| = 1, where V = 1."
        },
        assumptions: ["Sinusoidal phase scan", "Constant beam powers", "No stray light reaching the detector"]
      }
    ],
    problems: [
      {
        id: "m04-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Fringe counting",
        prompt:
          "A Michelson mirror is translated by 0.100 mm while 316 fringes pass a fixed reference point. What is the wavelength?",
        answer:
          "λ = 2d/N = 2(0.100 × 10⁻³)/316 = 6.33 × 10⁻⁷ m = 633 nm. The factor two is the round trip along the arm. If the count were 316.1, λ = 632.8 nm.",
        numeric: { value: 633, tolerance: 2, unit: "nm" },
        marks: 2
      },
      {
        id: "m04-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Visibility",
        prompt:
          "Two coherent beams with I₁ = 1.0 mW cm⁻² and I₂ = 9.0 mW cm⁻² interfere. What is the visibility? What intensity ratio would give V = 0.95?",
        answer:
          "V = 2√9/(1 + 9) = 6/10 = 0.60. For V = 0.95, write r = I₁/I₂; then 2√r/(1 + r) = 0.95. Squaring gives 4r = 0.9025(1 + r)², a quadratic with t = √r: 0.95t² − 2t + 0.95 = 0. The roots are t = 0.724 and t = 1.381, so r = 0.524 or r = 1.91. A ratio within about 1.9:1 is needed.",
        numeric: { value: 0.6, tolerance: 0.01, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "m04-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Coherence length",
        prompt: "Which change increases the coherence length of a source at fixed central wavelength?",
        options: [
          "Increasing the spectral bandwidth",
          "Decreasing the spectral bandwidth",
          "Increasing the source power",
          "Increasing the beam diameter"
        ],
        answerIndex: 1,
        answer:
          "L_c = λ₀²/Δλ, so a narrower spectrum gives a longer coherence length. Power affects photon flux, not coherence; beam diameter affects spatial coherence, not the temporal coherence length at fixed spectrum.",
        explanation:
          "Coherence length is a spectral property. Filtering a source increases L_c at the cost of power.",
        marks: 1
      },
      {
        id: "m04-p4",
        type: "short",
        difficulty: 2,
        topic: "White-light fringes",
        prompt:
          "Why are white-light interference fringes visible only near zero optical path difference?",
        answer:
          "White light contains a broad range of wavelengths. At a path difference Δ, each wavelength accumulates a different phase 2πΔ/λ. Away from Δ = 0 the maxima for different wavelengths fall at different positions and the patterns wash out after a path difference comparable to the coherence length, which for visible white light is only a few micrometres. Near Δ = 0 all wavelengths are simultaneously near constructive interference, producing a broad envelope with a central white fringe and a few coloured side fringes.",
        marks: 3
      },
      {
        id: "m04-p5",
        type: "derivation",
        difficulty: 2,
        topic: "Visibility",
        prompt:
          "Derive the visibility of two partially coherent beams and show that it is unity only when the beams are balanced and fully coherent.",
        answer:
          "I_max = I₁ + I₂ + 2√(I₁I₂)|γ| and I_min = I₁ + I₂ − 2√(I₁I₂)|γ|. Therefore V = 4√(I₁I₂)|γ|/[2(I₁ + I₂)] = 2√(I₁I₂)|γ|/(I₁ + I₂). Let r = I₁/I₂. Then V = 2√r|γ|/(1 + r). By AM–GM, 2√r ≤ 1 + r with equality only at r = 1; and |γ| ≤ 1 with equality only for full coherence. Hence V = 1 requires both r = 1 and |γ| = 1.",
        marks: 4
      },
      {
        id: "m04-p6",
        type: "numerical",
        difficulty: 2,
        topic: "Refractive index from fringes",
        prompt:
          "A 50.0 mm gas cell is evacuated and 47 fringes pass at λ = 633 nm. Find n − 1 for the gas.",
        answer:
          "N = 2(n − 1)t/λ, so n − 1 = Nλ/(2t) = 47 × 633 × 10⁻⁹/(2 × 0.0500) = 2.98 × 10⁻⁴. The refractive index is 1.000298. For air at atmospheric pressure the accepted value is about 2.9 × 10⁻⁴, so the count is physically reasonable.",
        numeric: { value: 2.98e-4, tolerance: 0.05e-4, unit: "dimensionless" },
        marks: 3
      }
    ],
    references: [R("bornwolf"), R("hecht"), R("fowles"), R("saleh")],
    related: [
      "michelson-interferometer",
      "mach-zehnder-interferometer",
      "quantum-eraser",
      "trigonometry-and-complex-numbers",
      "gaussian-beams-and-abcd",
      "density-matrices-and-measurement"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 05 — Gaussian beams and ABCD                                       */
  /* ------------------------------------------------------------------ */
  {
    id: "gaussian-beams-and-abcd",
    number: "05",
    title: "Gaussian Beams and ABCD Matrices",
    kicker: "Diffraction with a ruler",
    summary:
      "A laser beam is not a ray and not a plane wave: it is a solution of the paraxial wave equation whose waist, curvature and Rayleigh range are linked. This chapter derives the Gaussian beam parameters, introduces the complex q parameter, and shows how a single 2×2 matrix propagates q through lenses and free space.",
    interactive: "gaussian",
    blocks: [
      {
        type: "lead",
        text: "Geometric optics says a lens focuses a parallel beam to a point. Diffraction says the spot has a finite size and the beam diverges afterwards. The Gaussian beam is the simplest model that contains both statements, and the ABCD matrix is the simplest bookkeeping that connects them."
      },
      {
        type: "p",
        text: "In the paraxial approximation the field is written as a slowly varying envelope times a carrier exp[i(ωt − kz)], and the envelope obeys a paraxial wave equation. Its lowest-order solution is the Gaussian beam. The beam radius w(z) is the distance from the axis at which the field amplitude has fallen to 1/e of its on-axis value, so the intensity has fallen to 1/e². The radius of curvature R(z) describes the spherical wavefront. The Rayleigh range z_R is the distance over which the beam area doubles; at z = z_R the radius is √2 w₀. The divergence half-angle in the far field is θ = λ/(πw₀n)."
      },
      {
        type: "eq",
        latex:
          "\\begin{aligned}w(z)&=w_0\\sqrt{1+\\left(\\frac{z}{z_R}\\right)^2},\\\\ R(z)&=z\\left[1+\\left(\\frac{z_R}{z}\\right)^2\\right],\\\\ z_R&=\\frac{\\pi w_0^2n}{\\lambda},\\qquad \\theta=\\frac{\\lambda}{\\pi w_0n}\\end{aligned}",
        number: "5.1",
        note: "w₀, w, z, z_R, R in m; λ in m; n dimensionless; θ in rad."
      },
      {
        type: "p",
        text: "The three real functions w, R and z_R are packaged into one complex quantity, the q parameter, defined by 1/q = 1/R − iλ/(πnw²). At the waist q = i z_R, where R is infinite and the wavefront is flat. The real part of 1/q gives curvature; the imaginary part gives the inverse beam area. This is not a trick of notation: q obeys a simple propagation law because the paraxial equation is invariant under the same transformations."
      },
      {
        type: "eq",
        latex:
          "\\frac{1}{q(z)}=\\frac{1}{R(z)}-\\frac{i\\lambda}{\\pi n w(z)^2},\\qquad q(z)=z+iz_R",
        number: "5.2"
      },
      {
        type: "p",
        text: "Any paraxial optical system — free space, a thin lens, a curved mirror, a dielectric interface — is described by a 2×2 ray matrix with determinant one (in a homogeneous medium). The q parameter transforms by a Möbius law, q′ = (Aq + B)/(Cq + D). This single rule replaces the separate propagation of w and R. Free space of length d has B = d; a thin lens of focal length f has C = −1/f. The determinant condition AD − BC = 1 preserves the optical invariant and guarantees that the transformed beam still satisfies the paraxial equation."
      },
      {
        type: "eq",
        latex:
          "\\begin{pmatrix}A&B\\\\ C&D\\end{pmatrix},\\qquad q'=\\frac{Aq+B}{Cq+D},\\qquad AD-BC=1",
        number: "5.3"
      },
      {
        type: "table",
        caption: "ABCD matrices for the elements used in this laboratory.",
        head: ["Element", "Matrix", "Determinant"],
        rows: [
          ["Free space, length d", "[[1, d], [0, 1]]", "1"],
          ["Thin lens, focal length f", "[[1, 0], [−1/f, 1]]", "1"],
          ["Flat dielectric interface", "[[1, 0], [0, n₁/n₂]]", "n₁/n₂"],
          ["Spherical mirror, radius R", "[[1, 0], [−2/R, 1]]", "1"]
        ],
        align: ["l", "l", "r"]
      },
      {
        type: "callout",
        tone: "misconception",
        title: "A smaller waist does not mean a better-collimated beam",
        body:
          "Focusing harder always increases divergence: θ = λ/(πw₀n). A 1 µm waist at 1064 nm has a Rayleigh range of only 2.95 mm and diverges by 19.4°, while a 1 mm waist at 633 nm stays collimated for nearly 5 m. The product w₀θ = λ/(πn) is fixed by diffraction. In an optical trap this trade-off is the reason a tight focus gives a large gradient force but a very short working distance."
      },
      {
        type: "derivation",
        derivationId: "d-m05-q"
      },
      {
        type: "numeric",
        title: "Rayleigh range and divergence of a tight focus",
        statement:
          "A 1064 nm laser is focused to a 1.00 µm waist in air. Find the Rayleigh range, the beam radius at z = z_R, the far-field divergence half-angle and the depth of focus 2z_R.",
        latex:
          "z_R=\\frac{\\pi(1.00\\times10^{-6})^2}{1064\\times10^{-9}}=2.95\\times10^{-3}\\ \\mathrm{m}",
        result:
          "z_R = 2.95 mm. At z = z_R, w = √2 × 1.00 = 1.41 µm. The divergence is θ = 1064 nm/(π × 1.00 µm) = 0.339 rad = 19.4°, and the depth of focus is 5.91 mm. The beam area doubles and the peak intensity halves over each Rayleigh range."
      },
      {
        type: "numeric",
        title: "Focusing a collimated beam with a 100 mm lens",
        statement:
          "A 633 nm beam with a 1.00 mm waist is incident on a 100 mm focal-length lens, with the waist at the lens. Find the Rayleigh range before the lens, the focused waist, the waist position and the intensity gain.",
        latex:
          "z_R=\\frac{\\pi(1.00\\times10^{-3})^2}{633\\times10^{-9}}=4.96\\ \\mathrm{m}",
        result:
          "Since z_R = 4.96 m ≫ f = 0.100 m, the lens is in the collimated regime. The focused waist is w₀′ ≈ w₀/[1 + (z_R/f)²]^{1/2} = 1.00 mm/49.65 = 20.1 µm, located at z′ = f/[1 + (f/z_R)²] = 99.96 mm, essentially the focal plane. The intensity gain is (w₀/w₀′)² = 2470."
      }
    ],
    equations: [
      {
        id: "m05-e1",
        latex:
          "z_R=\\frac{\\pi w_0^2n}{\\lambda},\\qquad \\theta=\\frac{\\lambda}{\\pi w_0n}",
        name: "Rayleigh range and far-field divergence",
        symbols: [
          { symbol: "z_R", meaning: "Rayleigh range", unit: "m" },
          { symbol: "w_0", meaning: "Beam waist radius (1/e field)", unit: "m" },
          { symbol: "\\theta", meaning: "Far-field half-angle", unit: "rad" },
          { symbol: "n", meaning: "Refractive index of the medium", unit: "dimensionless" }
        ],
        interpretation:
          "The Rayleigh range is the collimated length; the divergence is the far-field spreading angle. Their product with the waist is fixed by diffraction.",
        assumptions: ["Paraxial", "Fundamental Gaussian mode", "Homogeneous medium", "Scalar approximation"],
        usedIn: ["Optical tweezers", "Laser focusing", "Fibre coupling", "Resonator design"],
        numericExample: {
          statement: "w₀ = 1 µm and λ = 1064 nm give z_R = 2.95 mm and θ = 0.339 rad.",
          latex: "z_R=2.95\\ \\mathrm{mm}"
        }
      },
      {
        id: "m05-e2",
        latex:
          "w(z)=w_0\\sqrt{1+\\left(\\frac{z}{z_R}\\right)^2}",
        name: "Gaussian beam radius",
        symbols: [
          { symbol: "w(z)", meaning: "1/e field radius at position z", unit: "m" },
          { symbol: "z", meaning: "Distance from the waist", unit: "m" }
        ],
        interpretation:
          "The beam narrows to w₀ at the waist and widens hyperbolically. At one Rayleigh range the radius has grown by √2.",
        assumptions: ["Fundamental Gaussian mode", "Waist at z = 0", "Paraxial propagation"],
        usedIn: ["Beam profiling", "Trap stiffness", "Fibre mode matching"],
        numericExample: {
          statement: "At z = z_R, w = √2 w₀ = 1.41 µm for a 1 µm waist.",
          latex: "w(z_R)=\\sqrt2\\,w_0"
        }
      },
      {
        id: "m05-e3",
        latex:
          "R(z)=z\\left[1+\\left(\\frac{z_R}{z}\\right)^2\\right]",
        name: "Radius of curvature of the wavefront",
        symbols: [
          { symbol: "R(z)", meaning: "Wavefront radius of curvature", unit: "m" },
          { symbol: "z", meaning: "Distance from the waist", unit: "m" }
        ],
        interpretation:
          "At the waist the wavefront is flat (R infinite). Far away it approaches a spherical wave centred on the waist. The magnitude is minimal at z = z_R.",
        assumptions: ["Paraxial", "Gaussian mode", "Real beam radius"],
        usedIn: ["Lens design", "Cavity stability", "Interferometric mode matching"],
        numericExample: {
          statement: "At z = z_R, |R| = 2z_R = 5.91 mm for the 1 µm waist at 1064 nm.",
          latex: "R(z_R)=2z_R"
        }
      },
      {
        id: "m05-e4",
        latex:
          "\\frac{1}{q}=\\frac{1}{R}-\\frac{i\\lambda}{\\pi n w^2},\\qquad q=z+iz_R",
        name: "Complex beam parameter",
        symbols: [
          { symbol: "q", meaning: "Complex beam parameter", unit: "m" },
          { symbol: "R", meaning: "Wavefront curvature", unit: "m" },
          { symbol: "w", meaning: "Beam radius", unit: "m" }
        ],
        interpretation:
          "One complex number stores both the curvature and the width of the beam. Its real part controls phase fronts; its imaginary part controls intensity.",
        assumptions: ["Paraxial", "Gaussian mode", "No truncation by apertures"],
        usedIn: ["ABCD propagation", "Resonator eigenmodes", "Mode matching"],
        numericExample: {
          statement: "At the waist q = i z_R = 2.95i mm for the 1064 nm focus.",
          latex: "q(0)=2.95i\\ \\mathrm{mm}"
        }
      },
      {
        id: "m05-e5",
        latex:
          "q'=\\frac{Aq+B}{Cq+D},\\qquad AD-BC=1",
        name: "ABCD transformation of the q parameter",
        symbols: [
          { symbol: "A,B,C,D", meaning: "Ray-matrix elements", unit: "dimensionless (B in m, C in m⁻¹)" },
          { symbol: "q", meaning: "Input complex beam parameter", unit: "m" }
        ],
        interpretation:
          "Propagation through any paraxial system is a Möbius transformation of q. The same 2×2 matrix acts on ray vectors (r, r′).",
        assumptions: ["Paraxial", "Determinant one for lossless systems in a uniform medium", "Thin elements"],
        usedIn: ["Lens focusing", "Telescopes", "Optical cavities", "Trap design"],
        numericExample: {
          statement: "Free space d followed by a lens f gives M = [[1 − d/f, d], [−1/f, 1]].",
          latex: "M=L(f)P(d)=\\begin{pmatrix}1-d/f&d\\\\ -1/f&1\\end{pmatrix}"
        }
      }
    ],
    derivations: [
      {
        id: "d-m05-q",
        title: "Recovering w(z) and R(z) from the q parameter",
        intro:
          "The Gaussian beam parameters are the real and imaginary parts of 1/q. The algebra is elementary but worth doing once explicitly.",
        steps: [
          {
            label: "1",
            text: "Define q at the waist, where the wavefront is flat and the beam radius is w₀.",
            latex: "q(0)=iz_R,\\qquad z_R=\\frac{\\pi n w_0^2}{\\lambda}"
          },
          {
            label: "2",
            text: "Free-space propagation adds the distance travelled.",
            latex: "q(z)=q(0)+z=z+iz_R"
          },
          {
            label: "3",
            text: "Invert q and rationalise the denominator.",
            latex:
              "\\frac{1}{q}=\\frac{1}{z+iz_R}=\\frac{z-iz_R}{z^2+z_R^2}"
          },
          {
            label: "4",
            text: "Identify the real part with 1/R.",
            latex:
              "\\frac{1}{R}=\\frac{z}{z^2+z_R^2}\\;\\Rightarrow\\;R=z\\left[1+\\left(\\frac{z_R}{z}\\right)^2\\right]"
          },
          {
            label: "5",
            text: "Identify the imaginary part with −λ/(πnw²).",
            latex:
              "\\frac{\\lambda}{\\pi n w^2}=\\frac{z_R}{z^2+z_R^2}"
          },
          {
            label: "6",
            text: "Substitute z_R and simplify to obtain the beam radius.",
            latex:
              "w^2=\\frac{\\lambda}{\\pi n}\\frac{z^2+z_R^2}{z_R}=w_0^2\\left[1+\\left(\\frac{z}{z_R}\\right)^2\\right]"
          }
        ],
        result: {
          latex:
            "w(z)=w_0\\sqrt{1+\\left(\\frac{z}{z_R}\\right)^2},\\qquad R(z)=z\\left[1+\\left(\\frac{z_R}{z}\\right)^2\\right]",
          text:
            "The q parameter is not an extra physical assumption. It is a compact encoding of the two real functions that solve the paraxial wave equation."
        },
        assumptions: ["Paraxial approximation", "Fundamental Gaussian mode", "Homogeneous medium of index n"]
      }
    ],
    problems: [
      {
        id: "m05-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Rayleigh range",
        prompt:
          "A 633 nm beam has a waist of 0.500 mm in air. Calculate its Rayleigh range and far-field divergence half-angle.",
        answer:
          "z_R = πw₀²/λ = π(0.500 × 10⁻³)²/(633 × 10⁻⁹) = 1.241 m. θ = λ/(πw₀) = 633 × 10⁻⁹/(π × 0.500 × 10⁻³) = 4.03 × 10⁻⁴ rad = 0.0231°.",
        numeric: { value: 1.24, tolerance: 0.01, unit: "m" },
        marks: 2
      },
      {
        id: "m05-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Beam radius",
        prompt:
          "For a Gaussian beam with w₀ = 1.00 mm, what is the radius at z = 2z_R? What fraction of the peak intensity remains on axis there?",
        answer:
          "w = w₀√(1 + 4) = √5 × 1.00 mm = 2.24 mm. The on-axis intensity scales as 1/w², so I/I₀ = 1/5 = 0.200: 20% of the peak remains.",
        numeric: { value: 2.24, tolerance: 0.01, unit: "mm" },
        marks: 3
      },
      {
        id: "m05-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Diffraction trade-off",
        prompt:
          "You focus a laser to a smaller waist with a higher-numerical-aperture lens. What happens to the far-field divergence?",
        options: [
          "It decreases in proportion to the waist",
          "It stays the same because the wavelength is unchanged",
          "It increases inversely with the waist",
          "It becomes zero inside the Rayleigh range"
        ],
        answerIndex: 2,
        answer:
          "θ = λ/(πw₀n). The product w₀θ is fixed by the wavelength and medium, so halving the waist doubles the divergence. This is the diffraction limit, not an imperfection of the lens.",
        explanation:
          "A tighter focus buys a smaller spot at the cost of a shorter Rayleigh range and a larger spreading angle.",
        marks: 1
      },
      {
        id: "m05-p4",
        type: "numerical",
        difficulty: 3,
        topic: "Lens focusing",
        prompt:
          "A 1064 nm beam with w₀ = 0.500 mm is focused by a lens of focal length 200 mm, with the waist at the lens. Find z_R, the focused waist and its position.",
        answer:
          "z_R = π(0.500 × 10⁻³)²/(1064 × 10⁻⁹) = 0.738 m. Then z_R/f = 3.69, so w₀′ = w₀/√(1 + 3.69²) = 0.500 mm/3.824 = 131 µm. The waist sits at z′ = f/(1 + (f/z_R)²) = 200 mm/1.0734 = 186 mm from the lens.",
        numeric: { value: 131, tolerance: 2, unit: "µm" },
        marks: 4
      },
      {
        id: "m05-p5",
        type: "short",
        difficulty: 2,
        topic: "q parameter",
        prompt:
          "What information is stored in the complex q parameter, and why is a single complex number enough for a paraxial Gaussian beam?",
        answer:
          "The real part of 1/q gives the wavefront curvature 1/R and the imaginary part gives −λ/(πnw²), hence the beam radius w. A paraxial monochromatic beam of fixed frequency has only two transverse scales at each plane — width and curvature — because the paraxial wave equation is second order in the transverse coordinates and first order in z. The Gaussian family is closed under ABCD propagation, so q evolves without generating higher-order modes.",
        marks: 3
      },
      {
        id: "m05-p6",
        type: "derivation",
        difficulty: 2,
        topic: "ABCD matrices",
        prompt:
          "Derive the ABCD matrix for free propagation by d followed by a thin lens of focal length f, and verify its determinant.",
        answer:
          "A ray is described by (r, r′). Free space gives r → r + d r′, r′ → r′, so P(d) = [[1, d], [0, 1]]. A thin lens changes the slope by −r/f without changing r, so L(f) = [[1, 0], [−1/f, 1]]. The combined matrix is L(f)P(d) = [[1, d], [−1/f, 1 − d/f]]. Its determinant is 1(1 − d/f) − d(−1/f) = 1, as required for a lossless system in a uniform medium.",
        marks: 4
      }
    ],
    references: [R("saleh"), R("hecht"), R("goodman"), R("bornwolf")],
    related: [
      "optical-tweezers",
      "fourier-optics",
      "interference-and-coherence",
      "fourier-transforms",
      "waves-and-maxwell"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 06 — Fourier transforms                                            */
  /* ------------------------------------------------------------------ */
  {
    id: "fourier-transforms",
    number: "06",
    title: "Fourier Transforms",
    kicker: "From shape to spatial frequency",
    summary:
      "A lens turns an object into its spatial-frequency spectrum, and a computer does the same with an FFT. This chapter defines the Fourier transform and its inverse, collects the pairs used in Fourier optics, proves the convolution theorem, and connects continuous transforms to sampling and the discrete FFT.",
    interactive: "fourier",
    blocks: [
      {
        type: "lead",
        text: "Every image can be read in two ways: as a distribution of brightness in space, or as a sum of sinusoidal gratings of different periods and orientations. The Fourier transform is the dictionary between the two readings. In a 4f optical processor the dictionary is written by physics, with a lens doing the calculation at the speed of light."
      },
      {
        type: "p",
        text: "For a two-dimensional field U(x, y), the spatial Fourier transform is defined with spatial frequencies f_x and f_y in cycles per metre. The inverse transform differs only by the sign in the exponent and a factor of one; the pair is symmetric. A plane-wave component exp[i2π(f_xx + f_yy)] is the elementary grating of the decomposition. The squared modulus |Ũ|² is the power spectrum, which is what a camera records at the Fourier plane. In optics the transform is usually written with the optical coordinates f_x = x_f/(λf) and f_y = y_f/(λf), where x_f and y_f are physical coordinates at the back focal plane of a lens of focal length f."
      },
      {
        type: "eq",
        latex:
          "\\tilde U(f_x,f_y)=\\iint U(x,y)\\,e^{-i2\\pi(f_xx+f_yy)}\\,dx\\,dy",
        number: "6.1",
        note: "U in V m⁻¹, x and y in m, f_x and f_y in cycles m⁻¹; Ũ has units V m."
      },
      {
        type: "p",
        text: "Three pairs do most of the work. A rectangular slit of width a transforms to a sinc envelope a sinc(a f_x), whose first zero is at f_x = 1/a. A Gaussian transforms to a Gaussian: a field radius w₀ in space becomes a field radius λf/(πw₀) at the focal plane, so a tight object gives a broad spectrum and vice versa. A periodic grating transforms to a comb of discrete orders at f_x = m/d for period d. These three cover slits, beams and gratings, which is most of what the laboratory uses."
      },
      {
        type: "p",
        text: "The convolution theorem is the reason spatial filtering works. Convolution in space becomes multiplication in frequency: transforming U * V gives Ũ times Ṽ. A lens with a finite aperture multiplies the spectrum by a transfer function, which is equivalent to convolving the image with the aperture's point-spread function. Parseval's theorem says that the total energy computed in space equals the total energy computed in frequency, so a filter that removes frequency components removes exactly their share of the power."
      },
      {
        type: "eq",
        latex:
          "\\widetilde{U*V}=\\tilde U\\,\\tilde V,\\qquad \\iint|U|^2\\,dx\\,dy=\\iint|\\tilde U|^2\\,df_x\\,df_y",
        number: "6.2"
      },
      {
        type: "p",
        text: "A camera or computer samples the field on a grid of pitch Δx. The sampling theorem says that a spatial frequency above f_Nyq = 1/(2Δx) cannot be represented and will appear folded to a lower frequency. The discrete Fourier transform of N samples is a sum; the fast Fourier transform computes it in N log₂N operations rather than N². The transform's frequency spacing is 1/(NΔx), set by the record length, not by the number of samples alone. Zero padding interpolates the spectrum but does not create resolution that the record did not contain."
      },
      {
        type: "eq",
        latex:
          "\\tilde U_k=\\sum_{n=0}^{N-1}U_n\\,e^{-i2\\pi kn/N},\\qquad f_{\\mathrm{Nyq}}=\\frac{1}{2\\Delta x}",
        number: "6.3"
      },
      {
        type: "callout",
        tone: "misconception",
        title: "A lens does not form the Fourier transform everywhere",
        body:
          "The back focal plane of a lens contains the Fraunhofer transform only when the input is illuminated coherently and the quadratic phase factor is handled correctly. For an object placed at the front focal plane, the field at the back focal plane is the transform multiplied by a quadratic phase; the intensity is the squared modulus of the transform. For an arbitrary object distance the plane of the transform moves, and a 4f system is used to place the object and the Fourier plane at the two focal planes with unit magnification. A camera at the Fourier plane records |Ũ|², not the complex spectrum, so the phase must be recovered by interferometry or by a phase-retrieval algorithm."
      },
      {
        type: "derivation",
        derivationId: "d-m06-lens-ft"
      },
      {
        type: "numeric",
        title: "First zero of a slit diffraction pattern",
        statement:
          "A 100 µm wide slit is placed in the front focal plane of a lens with f = 200 mm and illuminated at λ = 633 nm. Where is the first zero of the sinc pattern in the back focal plane?",
        latex:
          "x_0=\\frac{\\lambda f}{a}=\\frac{(633\\times10^{-9})(0.200)}{100\\times10^{-6}}=1.27\\times10^{-3}\\ \\mathrm{m}",
        result:
          "The first zero is 1.27 mm from the axis. The m-th zero is at mλf/a, so the fringe spacing in the sinc envelope grows linearly with order index but the zeros are equally spaced for a single slit. A slit twice as wide would halve every distance in the pattern."
      },
      {
        type: "numeric",
        title: "Gaussian to Gaussian",
        statement:
          "A Gaussian beam of waist 1.00 mm is Fourier-transformed by a lens of focal length 500 mm at λ = 633 nm. Find the 1/e² intensity radius at the focal plane.",
        latex:
          "w_f=\\frac{\\lambda f}{\\pi w_0}=\\frac{(633\\times10^{-9})(0.500)}{\\pi(1.00\\times10^{-3})}=1.01\\times10^{-4}\\ \\mathrm{m}",
        result:
          "w_f = 101 µm. The Fourier transform of a Gaussian is a Gaussian, so the focal spot has no rings or sidelobes. The product w₀w_f = λf/π is fixed by the lens and wavelength; a smaller input waist produces a larger focal spot."
      }
    ],
    equations: [
      {
        id: "m06-e1",
        latex:
          "\\tilde U(f_x,f_y)=\\iint U(x,y)e^{-i2\\pi(f_xx+f_yy)}dx\\,dy",
        name: "Two-dimensional Fourier transform",
        symbols: [
          { symbol: "U(x,y)", meaning: "Complex field in the object plane", unit: "V m⁻¹" },
          { symbol: "\\tilde U(f_x,f_y)", meaning: "Spatial spectrum", unit: "V m" },
          { symbol: "f_x,f_y", meaning: "Spatial frequencies", unit: "m⁻¹" }
        ],
        interpretation:
          "The spectrum gives the amplitude and phase of each sinusoidal grating component of the object. A lens maps f_x to a physical position x_f = λf f_x.",
        assumptions: ["Scalar field", "Coherent illumination", "Infinite or sufficiently large aperture"],
        usedIn: ["4f processor", "Fraunhofer diffraction", "Spatial filtering", "Image analysis"],
        numericExample: {
          statement: "A slit of width 100 µm has its first spectral zero at f_x = 1/a = 10 mm⁻¹.",
          latex: "f_{x,0}=\\frac{1}{a}=10\\ \\mathrm{mm^{-1}}"
        }
      },
      {
        id: "m06-e2",
        latex:
          "U(x,y)=\\iint\\tilde U(f_x,f_y)e^{+i2\\pi(f_xx+f_yy)}df_x\\,df_y",
        name: "Inverse Fourier transform",
        symbols: [
          { symbol: "U", meaning: "Reconstructed field", unit: "V m⁻¹" },
          { symbol: "\\tilde U", meaning: "Spectrum to be inverted", unit: "V m" }
        ],
        interpretation:
          "The inverse transform reconstructs the field by summing all plane-wave components with their amplitudes and phases. Removing a component in the Fourier plane removes it from the reconstruction.",
        assumptions: ["Same conventions as the forward transform", "Square-integrable field"],
        usedIn: ["Image reconstruction", "Filtering", "Phase retrieval"],
        numericExample: {
          statement: "Inverting the sinc spectrum of a slit returns the original rectangular slit.",
          latex: "\\mathcal F^{-1}\\{a\\,\\mathrm{sinc}(af_x)\\}=\\mathrm{rect}(x/a)"
        }
      },
      {
        id: "m06-e3",
        latex:
          "\\widetilde{U*V}=\\tilde U\\,\\tilde V",
        name: "Convolution theorem",
        symbols: [
          { symbol: "*", meaning: "Convolution in the spatial domain", unit: "varies" },
          { symbol: "\\tilde U,\\tilde V", meaning: "Fourier transforms of U and V", unit: "varies" }
        ],
        interpretation:
          "Blurring by a point-spread function is multiplication by a transfer function in frequency. Spatial filtering can therefore be designed in the frequency plane.",
        assumptions: ["Fourier transforms exist", "Linear shift-invariant system"],
        usedIn: ["Image formation", "4f filtering", "Apodisation", "Deconvolution"],
        numericExample: {
          statement: "Convolving slits of width 100 µm and 50 µm gives a trapezoid of total width 150 µm.",
          latex: "150\\ \\mu\\mathrm{m}=100\\ \\mu\\mathrm{m}+50\\ \\mu\\mathrm{m}"
        }
      },
      {
        id: "m06-e4",
        latex:
          "e^{-x^2/w_0^2}\\;\\longleftrightarrow\\;w_0\\sqrt{\\pi}\\,e^{-\\pi^2w_0^2f_x^2}",
        name: "Gaussian Fourier pair",
        symbols: [
          { symbol: "w_0", meaning: "1/e field radius in space", unit: "m" },
          { symbol: "f_x", meaning: "Spatial frequency", unit: "m⁻¹" }
        ],
        interpretation:
          "A Gaussian transforms to a Gaussian. The spatial and spectral widths are reciprocal: w₀ and 1/(πw₀) trade against each other.",
        assumptions: ["One-dimensional transform for clarity", "Infinite Gaussian (negligible truncation)"],
        usedIn: ["Gaussian beam focusing", "Mode matching", "Uncertainty relation"],
        numericExample: {
          statement: "w₀ = 1 mm gives a spectral 1/e field half-width of 1/(πw₀) = 0.318 mm⁻¹.",
          latex: "\\Delta f=\\frac{1}{\\pi w_0}"
        }
      },
      {
        id: "m06-e5",
        latex:
          "\\tilde U_k=\\sum_{n=0}^{N-1}U_n e^{-i2\\pi kn/N},\\qquad f_{\\mathrm{Nyq}}=\\frac{1}{2\\Delta x}",
        name: "Discrete Fourier transform and Nyquist frequency",
        symbols: [
          { symbol: "U_n", meaning: "Sampled field at pixel n", unit: "V m⁻¹" },
          { symbol: "\\tilde U_k", meaning: "DFT coefficient at frequency bin k", unit: "V m⁻¹" },
          { symbol: "\\Delta x", meaning: "Sample pitch", unit: "m" }
        ],
        interpretation:
          "The DFT is the sampled version of the continuous transform. Frequencies above the Nyquist limit alias to lower frequencies and cannot be recovered.",
        assumptions: ["Uniform sampling", "Finite record", "Periodic extension implied by the DFT"],
        usedIn: ["FFT analysis", "Camera sampling", "Fringe analysis", "Spatial filter simulation"],
        numericExample: {
          statement: "Δx = 10 µm gives f_Nyq = 50 cycles mm⁻¹.",
          latex: "f_{\\mathrm{Nyq}}=\\frac{1}{2(10\\ \\mu\\mathrm{m})}=50\\ \\mathrm{mm^{-1}}"
        }
      }
    ],
    derivations: [
      {
        id: "d-m06-lens-ft",
        title: "Why a lens produces a Fourier transform at its focal plane",
        intro:
          "The result follows from Fresnel diffraction and the quadratic phase of a thin lens. The essential step is the cancellation of the quadratic phase at the focal plane.",
        steps: [
          {
            label: "1",
            text: "Write the field just after a thin lens as the incident field times a quadratic phase factor.",
            latex: "U_{\\mathrm{lens}}(x,y)=U(x,y)\\,e^{-ik(x^2+y^2)/(2f)}"
          },
          {
            label: "2",
            text: "Propagate a distance f to the back focal plane using the Fresnel kernel.",
            latex:
              "U_f(x_f,y_f)=\\frac{e^{ikf}}{i\\lambda f}\\iint U_{\\mathrm{lens}}(x,y)e^{ik[(x_f-x)^2+(y_f-y)^2]/(2f)}dx\\,dy"
          },
          {
            label: "3",
            text: "Expand the quadratic distance term and collect the x² + y² part.",
            latex:
              "e^{ik(x_f^2+y_f^2)/(2f)}\\iint U(x,y)e^{-ik(xx_f+yy_f)/f}e^{ik(x^2+y^2)/(2f)}e^{-ik(x^2+y^2)/(2f)}dx\\,dy"
          },
          {
            label: "4",
            text: "The lens phase and the propagation phase cancel exactly.",
            latex:
              "e^{-ik(x^2+y^2)/(2f)}e^{+ik(x^2+y^2)/(2f)}=1"
          },
          {
            label: "5",
            text: "Recognise the remaining integral as a Fourier transform with spatial frequency f_x = x_f/(λf), f_y = y_f/(λf).",
            latex:
              "U_f(x_f,y_f)=\\frac{e^{ikf}}{i\\lambda f}e^{ik(x_f^2+y_f^2)/(2f)}\\tilde U\\left(\\frac{x_f}{\\lambda f},\\frac{y_f}{\\lambda f}\\right)"
          }
        ],
        result: {
          latex:
            "|U_f(x_f,y_f)|^2=\\frac{1}{\\lambda^2f^2}\\left|\\tilde U\\left(\\frac{x_f}{\\lambda f},\\frac{y_f}{\\lambda f}\\right)\\right|^2",
          text:
            "The intensity at the focal plane is the squared modulus of the Fourier transform, scaled by x_f = λf f_x. The residual quadratic phase disappears when intensity is recorded, which is why a camera sees the power spectrum directly."
        },
        assumptions: [
          "Paraxial / Fresnel diffraction",
          "Thin lens",
          "Coherent illumination",
          "Object at the front focal plane or a 4f geometry",
          "Scalar field"
        ]
      }
    ],
    problems: [
      {
        id: "m06-p1",
        type: "numerical",
        difficulty: 2,
        topic: "Diffraction scale",
        prompt:
          "A 50 µm slit is placed in a 4f system with f = 150 mm at λ = 633 nm. At what distance from the axis does the first sinc zero occur?",
        answer:
          "x₀ = λf/a = (633 × 10⁻⁹)(0.150)/(50 × 10⁻⁶) = 1.90 × 10⁻³ m = 1.90 mm. The second zero is at 3.80 mm, and so on. Halving the slit width doubles all these distances.",
        numeric: { value: 1.9, tolerance: 0.02, unit: "mm" },
        marks: 2
      },
      {
        id: "m06-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Grating orders",
        prompt:
          "A grating of period 20 µm is placed in the front focal plane of a lens with f = 150 mm at λ = 633 nm. Where does the first diffraction order appear in the back focal plane?",
        answer:
          "The grating frequency is f_x = 1/d = 1/(20 × 10⁻⁶) = 5.0 × 10⁴ m⁻¹. The first order appears at x = λf f_x = (633 × 10⁻⁹)(0.150)(5.0 × 10⁴) = 4.75 × 10⁻³ m = 4.75 mm. The second order is at 9.50 mm.",
        numeric: { value: 4.75, tolerance: 0.05, unit: "mm" },
        marks: 2
      },
      {
        id: "m06-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Convolution theorem",
        prompt:
          "A 4f processor multiplies the Fourier spectrum by a low-pass transmission function. What does this do to the image?",
        options: [
          "It convolves the image with the inverse transform of the filter, blurring it",
          "It multiplies the image by the filter function point by point",
          "It shifts the image sideways",
          "It changes the wavelength of the light"
        ],
        answerIndex: 0,
        answer:
          "Multiplication in the frequency domain is convolution in the spatial domain. A low-pass filter removes high spatial frequencies, which is equivalent to convolving the image with a broadened point-spread function — a blur.",
        explanation:
          "This is the convolution theorem in its optical form.",
        marks: 1
      },
      {
        id: "m06-p4",
        type: "numerical",
        difficulty: 2,
        topic: "Sampling",
        prompt:
          "A camera with 2048 pixels covers a 20.0 mm wide field. What is the pixel pitch, and what is the highest spatial frequency that can be represented without aliasing?",
        answer:
          "Δx = 20.0 mm/2048 = 9.77 µm. f_Nyq = 1/(2Δx) = 1/(2 × 9.77 × 10⁻⁶) = 5.12 × 10⁴ m⁻¹ = 51.2 cycles mm⁻¹. Finer fringes will alias and appear as coarser spurious fringes.",
        numeric: { value: 51.2, tolerance: 0.2, unit: "cycles mm⁻¹" },
        marks: 3
      },
      {
        id: "m06-p5",
        type: "short",
        difficulty: 2,
        topic: "Fourier plane",
        prompt:
          "Why does a camera at the Fourier plane of a 4f system record the power spectrum rather than the complex spectrum, and what consequence does this have for image reconstruction?",
        answer:
          "A camera responds to intensity, which is the squared modulus of the field, so the phase of Ũ is lost. The inverse transform of the recorded intensity alone is not the original image. Reconstruction therefore requires either interferometric holography, which supplies a reference wave and encodes phase as fringes, or a phase-retrieval algorithm that uses additional constraints such as finite support or non-negativity.",
        marks: 3
      },
      {
        id: "m06-p6",
        type: "derivation",
        difficulty: 3,
        topic: "Gaussian transform",
        prompt:
          "Show that the Fourier transform of exp(−x²/w₀²) is proportional to exp(−π²w₀²f²).",
        answer:
          "Complete the square in the exponent: −x²/w₀² − i2πfx = −(x/w₀ + iπw₀f)² + π²w₀²f². The integral over x of exp[−(x/w₀ + iπw₀f)²] is w₀√π by the Gaussian integral, with the complex shift leaving the result unchanged by contour deformation. Hence the transform is w₀√π exp(−π²w₀²f²), a Gaussian in frequency with 1/e half-width 1/(πw₀).",
        marks: 4
      }
    ],
    references: [R("goodman"), R("saleh"), R("hecht"), R("bornwolf")],
    related: [
      "fourier-optics",
      "gaussian-beams-and-abcd",
      "interference-and-coherence",
      "probability-and-statistics",
      "quantum-key-distribution"
    ]
  }
,

  /* ------------------------------------------------------------------ */
  /* 07 — Probability and statistics                                    */
  /* ------------------------------------------------------------------ */
  {
    id: "probability-and-statistics",
    number: "07",
    title: "Probability and Statistics",
    kicker: "What a measurement error actually means",
    summary:
      "Photon counting is random, least-squares fits are weighted averages, and every quoted uncertainty is a statement about a distribution. This chapter develops expectation and variance, the Poisson and Gaussian distributions, the central limit theorem, propagation of uncertainty and linear least squares.",
    interactive: "uncertainty",
    blocks: [
      {
        type: "lead",
        text: "An experiment that reports 632.8 nm without an uncertainty has reported half a result. The other half is a statement about how the number would scatter if the measurement were repeated. Probability theory supplies both the language and the arithmetic."
      },
      {
        type: "p",
        text: "A random variable X is described by a probability density p(x), with p(x)dx the probability of finding a value in a small interval. The expectation E[X] is the probability-weighted mean and the variance Var[X] = E[(X − μ)²] = E[X²] − μ² measures the spread. The standard deviation σ is the square root of the variance and has the same units as X. For a function f(X), the expectation is E[f(X)] = ∫f(x)p(x)dx; this rule, rather than any assumption of Gaussianity, is what makes error propagation work."
      },
      {
        type: "eq",
        latex:
          "\\mu=\\mathrm E[X]=\\int x\\,p(x)\\,dx,\\qquad \\sigma^2=\\mathrm{Var}[X]=\\mathrm E[X^2]-\\mu^2",
        number: "7.1"
      },
      {
        type: "p",
        text: "Photon counting follows the Poisson distribution when the arrivals are independent and the mean rate is constant. If the mean count in an interval is μ, the probability of exactly k counts is P(k) = μ^k e^{−μ}/k!, and both the mean and the variance equal μ. The shot-noise standard deviation is therefore √μ, so the relative noise is 1/√μ: a hundred photons give 10% noise and ten thousand give 1%. The Gaussian distribution is the large-μ limit of the Poisson distribution and also the limiting distribution of a sum of many independent random contributions, which is the central limit theorem. For N repeated measurements the standard error of the mean is σ/√N, not σ."
      },
      {
        type: "p",
        text: "Error propagation follows from a first-order Taylor expansion. If y = f(x₁, …, x_n) and the uncertainties are independent, then σ_y² = Σ(∂f/∂x_i)²σ_i². For a product or quotient this becomes a sum of squared relative uncertainties; for a sum or difference the absolute uncertainties add in quadrature. Correlated inputs require the covariance terms and cannot be combined with this diagonal formula."
      },
      {
        type: "p",
        text: "A straight-line fit y = a + bx is the most common analysis in this laboratory. Minimising the sum of squared residuals gives b = S_xy/S_xx and a = ȳ − b x̄, where S_xy = Σ(x_i − x̄)(y_i − ȳ) and S_xx = Σ(x_i − x̄)². The residual standard deviation s_yx = √[Σ(y_i − a − bx_i)²/(N − 2)] estimates the noise, the slope standard error is s_yx/√S_xx, and r² measures the fraction of the variance explained by the fit. A high r² does not prove the model is correct; it only says the line explains the scatter."
      },
      {
        type: "eq",
        latex:
          "b=\\frac{S_{xy}}{S_{xx}},\\qquad a=\\bar y-b\\bar x,\\qquad \\sigma_b=\\frac{s_{yx}}{\\sqrt{S_{xx}}}",
        number: "7.3"
      },
      {
        type: "callout",
        tone: "misconception",
        title: "Averaging reduces random error, not systematic error",
        body:
          "The standard error σ/√N shrinks with the number of independent measurements, but a misaligned interferometer, a calibration offset or a mislabelled wavelength does not improve with repetition. Report random and systematic contributions separately. Also, σ/√N describes the scatter of the mean, not the scatter of individual readings; quoting it as if it were the spread of the data understates the variability of a single measurement."
      },
      {
        type: "derivation",
        derivationId: "d-m07-propagation"
      },
      {
        type: "numeric",
        title: "Poisson counts and shot noise",
        statement:
          "A detector records a mean of 4.0 photons per pulse. Find P(0), P(1) and the probability of at least one photon. Then compare the relative shot noise for mean counts of 100 and 10 000.",
        latex:
          "P(0)=e^{-4}=0.0183,\\qquad P(1)=4e^{-4}=0.0733",
        result:
          "P(≥1) = 1 − 0.0183 = 0.9817. For μ = 100, σ = 10 and σ/μ = 10%; for μ = 10 000, σ = 100 and σ/μ = 1%. The absolute noise grows as √μ while the relative noise falls as 1/√μ."
      },
      {
        type: "numeric",
        title: "Uncertainty of a Malus-law measurement",
        statement:
          "The transmitted power through a polarizer is P = P₀cos²θ. At θ = 45.0° ± 1.0°, with P₀ = 100.0 µW, find the transmitted power and its uncertainty. Neglect uncertainty in P₀.",
        latex:
          "P=100\\cos^2 45^\\circ=50.0\\ \\mu\\mathrm{W},\\qquad \\sigma_P=P_0|\\sin2\\theta|\\,\\sigma_\\theta",
        result:
          "σθ = 1.0° = 0.01745 rad and |sin 90°| = 1, so σ_P = 100 × 1 × 0.01745 = 1.75 µW. The result is P = 50.0 ± 1.8 µW, a relative uncertainty of 3.5% in P. At θ = 45° the derivative is maximal, so this is the worst angle at which to set the polarizer if small angle errors matter."
      },
      {
        type: "numeric",
        title: "A straight-line fit with three points",
        statement:
          "The points (x, y) = (0, 1.1), (1, 2.9), (2, 5.2) are fitted by y = a + bx. Find a, b, r² and the residual standard deviation.",
        latex:
          "b=\\frac{S_{xy}}{S_{xx}}=\\frac{4.10}{2.00}=2.05,\\qquad a=3.067-2.05(1)=1.017",
        result:
          "The fit is y = 1.017 + 2.05x. The residuals are +0.083, −0.167, +0.083 (sum zero), giving s_yx = 0.204 with one degree of freedom. The total sum of squares is 8.447, the residual sum of squares is 0.0417, and r² = 1 − 0.0417/8.447 = 0.995. A prediction at x = 3 is 7.17."
      }
    ],
    equations: [
      {
        id: "m07-e1",
        latex:
          "\\mu=\\mathrm E[X],\\qquad \\sigma^2=\\mathrm E[(X-\\mu)^2]=\\mathrm E[X^2]-\\mu^2",
        name: "Expectation and variance",
        symbols: [
          { symbol: "\\mu", meaning: "Population mean", unit: "same as X" },
          { symbol: "\\sigma^2", meaning: "Population variance", unit: "units of X squared" },
          { symbol: "\\mathrm E[\\cdot]", meaning: "Probability-weighted average", unit: "same as argument" }
        ],
        interpretation:
          "The mean locates the distribution; the variance measures its width. The second form is usually the easiest to compute from data.",
        assumptions: ["The distribution has finite first and second moments", "The integral or sum converges"],
        usedIn: ["Photon statistics", "Error analysis", "Least squares", "Quantum expectation values"],
        numericExample: {
          statement: "For a fair coin with outcomes 0 and 1, μ = 0.5 and σ² = 0.25.",
          latex: "\\sigma^2=0.5(0-0.5)^2+0.5(1-0.5)^2=0.25"
        }
      },
      {
        id: "m07-e2",
        latex:
          "P(k)=\\frac{\\mu^k e^{-\\mu}}{k!},\\qquad \\mathrm E[k]=\\mathrm{Var}[k]=\\mu",
        name: "Poisson distribution",
        symbols: [
          { symbol: "k", meaning: "Number of counts (non-negative integer)", unit: "counts" },
          { symbol: "\\mu", meaning: "Mean count in the interval", unit: "counts" }
        ],
        interpretation:
          "Independent random arrivals produce Poisson counts. The variance equals the mean, so the shot noise is √μ and the relative noise is 1/√μ.",
        assumptions: ["Independent events", "Constant mean rate", "Non-overlapping intervals", "Detection efficiency uniform"],
        usedIn: ["Photon counting", "Dark counts", "QKD", "Optical tweezers position detection"],
        numericExample: {
          statement: "μ = 4 gives P(0) = 0.0183 and P(1) = 0.0733.",
          latex: "P(0)=e^{-4}=0.0183"
        }
      },
      {
        id: "m07-e3",
        latex:
          "p(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/(2\\sigma^2)}",
        name: "Gaussian distribution",
        symbols: [
          { symbol: "\\mu", meaning: "Mean", unit: "same as x" },
          { symbol: "\\sigma", meaning: "Standard deviation", unit: "same as x" }
        ],
        interpretation:
          "The Gaussian is the large-count limit of the Poisson distribution and the limiting distribution of many independent additive contributions. About 68% of values lie within one σ of the mean and 95% within two.",
        assumptions: ["Finite variance", "Additive independent contributions or large Poisson mean"],
        usedIn: ["Error bars", "Confidence intervals", "Least squares", "Central limit theorem"],
        numericExample: {
          statement: "For μ = 0 and σ = 1, 68.3% of the probability lies between −1 and +1.",
          latex: "P(|x|<1\\sigma)=0.683"
        }
      },
      {
        id: "m07-e4",
        latex:
          "\\sigma_y^2=\\sum_i\\left(\\frac{\\partial f}{\\partial x_i}\\right)^2\\sigma_i^2",
        name: "Propagation of independent uncertainties",
        symbols: [
          { symbol: "\\sigma_y", meaning: "Uncertainty in the derived quantity", unit: "units of y" },
          { symbol: "\\partial f/\\partial x_i", meaning: "Sensitivity to input i", unit: "units of y per unit of x_i" },
          { symbol: "\\sigma_i", meaning: "Uncertainty in input i", unit: "units of x_i" }
        ],
        interpretation:
          "Uncertainties add in quadrature, weighted by sensitivity. A quantity that depends weakly on an input is insensitive to that input's error.",
        assumptions: ["Inputs independent", "Uncertainties small enough for a linear expansion", "No significant covariance"],
        usedIn: ["All laboratory error analysis", "Derived quantities", "Instrument specification"],
        numericExample: {
          statement: "f = xy with 2% and 3% relative errors has σ_f/f = √(0.02² + 0.03²) = 3.6%.",
          latex: "\\frac{\\sigma_f}{f}=\\sqrt{0.02^2+0.03^2}=0.036"
        }
      },
      {
        id: "m07-e5",
        latex:
          "b=\\frac{S_{xy}}{S_{xx}},\\qquad a=\\bar y-b\\bar x,\\qquad S_{xy}=\\sum_i(x_i-\\bar x)(y_i-\\bar y)",
        name: "Ordinary least-squares line",
        symbols: [
          { symbol: "b", meaning: "Fitted slope", unit: "units of y per unit of x" },
          { symbol: "a", meaning: "Fitted intercept", unit: "units of y" },
          { symbol: "S_{xy}", meaning: "Sample covariance numerator", unit: "units of x times y" }
        ],
        interpretation:
          "The line minimises the sum of squared vertical residuals. The slope is the covariance of x and y divided by the variance of x.",
        assumptions: ["Linear model", "Independent errors in y", "Negligible error in x", "Constant error variance"],
        usedIn: ["Wavelength calibration", "Trap stiffness", "Malus-law fit", "Fringe analysis"],
        numericExample: {
          statement: "For (0, 1.1), (1, 2.9), (2, 5.2), b = 2.05 and a = 1.02.",
          latex: "b=2.05,\\qquad a=1.02"
        }
      }
    ],
    derivations: [
      {
        id: "d-m07-propagation",
        title: "The propagation-of-error formula",
        intro:
          "The formula is a first-order Taylor expansion followed by a variance calculation. The independence assumption is what removes the cross terms.",
        steps: [
          {
            label: "1",
            text: "Expand f around the mean values to first order.",
            latex:
              "f(x_1,\\ldots,x_n)\\approx f(\\bar x_1,\\ldots,\\bar x_n)+\\sum_i\\frac{\\partial f}{\\partial x_i}\\,\\delta x_i"
          },
          {
            label: "2",
            text: "Subtract the mean value to obtain the fluctuation of f.",
            latex: "\\delta f\\approx\\sum_i\\frac{\\partial f}{\\partial x_i}\\,\\delta x_i"
          },
          {
            label: "3",
            text: "Square and take the expectation value.",
            latex:
              "\\sigma_f^2=\\sum_i\\left(\\frac{\\partial f}{\\partial x_i}\\right)^2\\langle\\delta x_i^2\\rangle+2\\sum_{i<j}\\frac{\\partial f}{\\partial x_i}\\frac{\\partial f}{\\partial x_j}\\langle\\delta x_i\\delta x_j\\rangle"
          },
          {
            label: "4",
            text: "For independent inputs the cross-correlations vanish and the diagonal terms are the variances.",
            latex:
              "\\langle\\delta x_i\\delta x_j\\rangle=0\\ (i\\ne j),\\qquad \\langle\\delta x_i^2\\rangle=\\sigma_i^2"
          },
          {
            label: "5",
            text: "The result is the quadrature sum.",
            latex:
              "\\sigma_f^2=\\sum_i\\left(\\frac{\\partial f}{\\partial x_i}\\right)^2\\sigma_i^2"
          }
        ],
        result: {
          latex:
            "\\sigma_f=\\sqrt{\\sum_i\\left(\\frac{\\partial f}{\\partial x_i}\\right)^2\\sigma_i^2}",
          text:
            "For a product f = xy this reduces to relative errors in quadrature; for a sum it reduces to absolute errors in quadrature. Correlated inputs require the covariance terms retained."
        },
        assumptions: [
          "Inputs are independent or their covariance is known",
          "Uncertainties are small compared with the curvature scale of f",
          "The means are the expansion points"
        ]
      }
    ],
    problems: [
      {
        id: "m07-p1",
        type: "numerical",
        difficulty: 2,
        topic: "Poisson statistics",
        prompt:
          "A photon counter records a mean of 9.0 counts per second. What is the probability of zero counts in one second? What is the relative shot noise of a one-second count?",
        answer:
          "P(0) = e^{−9} = 1.234 × 10⁻⁴. The standard deviation is √9 = 3 counts, so the relative noise is 3/9 = 33.3%. Averaging over 100 independent seconds would reduce the relative noise of the mean to 3/√100/9 = 3.33%.",
        numeric: { value: 1.234e-4, tolerance: 0.001e-4, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "m07-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Error propagation",
        prompt:
          "A resistor is measured as R = V/I with V = 5.00 ± 0.05 V and I = 0.200 ± 0.004 A. Find R and its uncertainty.",
        answer:
          "R = 5.00/0.200 = 25.0 Ω. The relative uncertainties are 0.05/5.00 = 1.0% and 0.004/0.200 = 2.0%. They add in quadrature: σ_R/R = √(0.01² + 0.02²) = 2.24%, so σ_R = 0.559 Ω. Report R = 25.0 ± 0.6 Ω.",
        numeric: { value: 25.0, tolerance: 0.1, unit: "Ω" },
        marks: 3
      },
      {
        id: "m07-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Standard error",
        prompt:
          "You repeat an independent measurement N times and average. How does the standard error of the mean scale with N?",
        options: ["It is independent of N", "It scales as 1/N", "It scales as 1/√N", "It scales as √N"],
        answerIndex: 2,
        answer:
          "The variance of the sum of N independent measurements is Nσ², so the variance of the mean is σ²/N and its standard deviation is σ/√N. The scatter of individual measurements remains σ.",
        explanation:
          "This is the central limit theorem combined with the variance of a sum.",
        marks: 1
      },
      {
        id: "m07-p4",
        type: "numerical",
        difficulty: 2,
        topic: "Least squares",
        prompt:
          "Fit y = a + bx to (1, 2.1), (2, 3.9), (3, 6.2), (4, 7.8). Find the slope, intercept and r².",
        answer:
          "x̄ = 2.5, ȳ = 5.0. S_xx = 5.0 and S_xy = 9.70, so b = 1.94 and a = 5.0 − 1.94(2.5) = 0.15. The residuals are 0.01, −0.13, 0.23, −0.11, with sum of squares 0.082. The total sum of squares is 18.9, so r² = 1 − 0.082/18.9 = 0.9957.",
        numeric: { value: 1.94, tolerance: 0.02, unit: "per unit x" },
        marks: 4
      },
      {
        id: "m07-p5",
        type: "short",
        difficulty: 2,
        topic: "Random versus systematic",
        prompt:
          "Distinguish random from systematic error and explain why averaging cannot remove the latter. Give an optical example of each.",
        answer:
          "Random error changes unpredictably between repetitions and averages toward zero, so the uncertainty of the mean falls as 1/√N. Systematic error shifts every reading in the same direction and does not average away; it must be calibrated or bounded by an independent check. An optical example of random error is photon shot noise on a photodiode; an example of systematic error is a wavelength scale that is offset because the laser is not at its nominal value, or a Michelson mirror tilt that biases fringe counts.",
        marks: 3
      },
      {
        id: "m07-p6",
        type: "derivation",
        difficulty: 3,
        topic: "Poisson variance",
        prompt:
          "Show that the Poisson distribution has variance equal to its mean.",
        answer:
          "Let P(k) = e^{−μ}μ^k/k!. The mean is ΣkP(k) = e^{−μ}Σkμ^k/k! = e^{−μ}μΣμ^{k−1}/(k−1)! = μ. For the second moment, Σk(k−1)P(k) = μ², so E[k²] = μ² + μ. Hence Var[k] = E[k²] − μ² = μ. The calculation uses the series Σμ^m/m! = e^μ and its derivatives; no Gaussian approximation is involved.",
        marks: 4
      }
    ],
    references: [R("taylor"), R("bevington"), R("saleh"), R("hecht")],
    related: [
      "optical-tweezers",
      "quantum-key-distribution",
      "interference-and-coherence",
      "fourier-transforms",
      "density-matrices-and-measurement"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 08 — Linear algebra and Hilbert spaces                             */
  /* ------------------------------------------------------------------ */
  {
    id: "linear-algebra-and-hilbert-spaces",
    number: "08",
    title: "Linear Algebra and Hilbert Spaces",
    kicker: "The geometry of quantum states",
    summary:
      "Quantum mechanics is linear algebra with a physical inner product. This chapter develops complex vector spaces, bras and kets, orthonormal bases, Hermitian and unitary operators, eigenvalues, spectral decomposition, commutators and the uncertainty relation.",
    interactive: "superposition",
    blocks: [
      {
        type: "lead",
        text: "A polarization state is a vector in a two-dimensional complex space. A measurement is an operator on that space. Once this identification is made, superposition, incompatible observables and the uncertainty relation stop being separate mysteries and become theorems about vectors and matrices."
      },
      {
        type: "p",
        text: "A quantum state is written as a ket |ψ⟩, an element of a complex vector space with an inner product. For a qubit the space is two-dimensional and a natural basis is {|0⟩, |1⟩}, realised in this laboratory by horizontal and vertical photon polarization. Any state is a linear combination |ψ⟩ = c₀|0⟩ + c₁|1⟩ with complex coefficients. The coefficients are not probabilities; they are amplitudes. The same vector can be expanded in any orthonormal basis, and the expansion coefficients are the inner products with the basis vectors."
      },
      {
        type: "eq",
        latex:
          "|\\psi\\rangle=\\sum_n c_n|n\\rangle,\\qquad c_n=\\langle n|\\psi\\rangle",
        number: "8.1"
      },
      {
        type: "p",
        text: "The bra ⟨φ| is the conjugate transpose of the ket |φ⟩. The inner product ⟨φ|ψ⟩ is a complex number; its conjugate is ⟨ψ|φ⟩, and its squared modulus is the probability of finding |ψ⟩ in state |φ⟩ after a projective measurement. Two states are orthogonal when their inner product is zero. An orthonormal basis satisfies ⟨m|n⟩ = δ_mn, and completeness reads Σ_n |n⟩⟨n| = I, so inserting the identity between two states reproduces the expansion coefficients. The norm ⟨ψ|ψ⟩ must be one for a physical state."
      },
      {
        type: "eq",
        latex:
          "\\langle\\phi|\\psi\\rangle=\\sum_n\\phi_n^*\\psi_n,\\qquad \\langle m|n\\rangle=\\delta_{mn},\\qquad \\sum_n|n\\rangle\\langle n|=I",
        number: "8.2"
      },
      {
        type: "p",
        text: "An operator A acts linearly on kets. Its adjoint A† is defined by ⟨φ|Aψ⟩ = ⟨A†φ|ψ⟩. Hermitian operators satisfy A† = A; they represent observables, have real eigenvalues, and have orthogonal eigenvectors. Unitary operators satisfy U†U = I; they represent closed-system evolution and preserve inner products and norms. The eigenvalue equation A|a⟩ = a|a⟩ selects the states that a measurement of A leaves unchanged in form. The set of eigenvalues is the set of possible outcomes. A Hermitian operator can be written as A = Σ_n a_n|a_n⟩⟨a_n|, the spectral decomposition, which is the matrix version of “expand in the eigenbasis”."
      },
      {
        type: "eq",
        latex:
          "A^{\\dagger}=A\\;\\Rightarrow\\;a\\in\\mathbb{R},\\qquad A|a_n\\rangle=a_n|a_n\\rangle,\\qquad A=\\sum_n a_n|a_n\\rangle\\langle a_n|",
        number: "8.3"
      },
      {
        type: "p",
        text: "Two observables are compatible when their operators commute, [A, B] = AB − BA = 0. Then they share a complete eigenbasis and can be measured simultaneously with arbitrary precision. When the commutator is nonzero, the products of uncertainties obey the Robertson relation ΔA ΔB ≥ ½|⟨[A, B]⟩|. For the Pauli operators, [σ_x, σ_y] = 2iσ_z, so Δσ_x Δσ_y ≥ |⟨σ_z⟩|. This is a statement about the state and the operators, not about clumsy apparatus."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "Global phase is invisible; relative phase is physical",
        body:
          "Multiplying an entire state by e^{iα} changes no probability, because both amplitude and conjugate receive the same factor. Multiplying only one component of a superposition by a phase changes the interference between them and is physically observable. In a Mach–Zehnder interferometer a phase plate in one arm does exactly this. Do not confuse the two operations."
      },
      {
        type: "derivation",
        derivationId: "d-m08-hermitian"
      },
      {
        type: "numeric",
        title: "Eigenvalues of a Hermitian matrix",
        statement:
          "Verify that M = [[1, i], [−i, 2]] is Hermitian and find its eigenvalues.",
        latex:
          "M^{\\dagger}=\\begin{pmatrix}1&i\\\\-i&2\\end{pmatrix}=M,\\qquad \\lambda^2-3\\lambda+1=0",
        result:
          "The trace is 3 and the determinant is 2 − (i)(−i) = 2 − 1 = 1, so λ = (3 ± √5)/2 = 2.618 and 0.382. Both eigenvalues are real, as required for a Hermitian matrix. The eigenvectors are orthogonal, and the spectral decomposition M = 2.618|a₁⟩⟨a₁| + 0.382|a₂⟩⟨a₂| reconstructs the matrix exactly."
      },
      {
        type: "numeric",
        title: "Expectation values and an uncertainty product",
        statement:
          "A qubit is in |ψ⟩ = cos30°|0⟩ + i sin30°|1⟩. Find ⟨σ_z⟩, ⟨σ_y⟩, Δσ_x, Δσ_y and the uncertainty product.",
        latex:
          "\\langle\\sigma_z\\rangle=|c_0|^2-|c_1|^2=0.75-0.25=0.50",
        result:
          "With c₀ = 0.866 and c₁ = 0.500i, ⟨σ_z⟩ = 0.50 and ⟨σ_y⟩ = 2 Im(c₀*c₁) = 0.866. For σ_x the expectation is 2 Re(c₀*c₁) = 0, so Δσ_x = 1. For σ_y, Δσ_y = √(1 − 0.866²) = 0.500. The product is 1 × 0.500 = 0.500, which exceeds the bound ½|⟨σ_z⟩| = 0.250. The state is not a minimum-uncertainty state for this pair."
      }
    ],
    equations: [
      {
        id: "m08-e1",
        latex:
          "|\\psi\\rangle=\\sum_n c_n|n\\rangle,\\qquad c_n=\\langle n|\\psi\\rangle",
        name: "Expansion in an orthonormal basis",
        symbols: [
          { symbol: "|\\psi\\rangle", meaning: "State vector (ket)", unit: "dimensionless" },
          { symbol: "c_n", meaning: "Complex amplitude in basis state n", unit: "dimensionless" },
          { symbol: "|n\\rangle", meaning: "Basis ket", unit: "dimensionless" }
        ],
        interpretation:
          "A state is a vector; its components depend on the chosen basis. The coefficients are probability amplitudes, not probabilities.",
        assumptions: ["Orthonormal basis", "Normalised state", "Finite-dimensional space for qubits"],
        usedIn: ["Qubit encoding", "Polarization", "Beam-splitter outputs", "Measurement"],
        numericExample: {
          statement: "|H⟩ = 1|H⟩ + 0|V⟩ and |D⟩ = (|H⟩ + |V⟩)/√2.",
          latex: "|D\\rangle=\\frac{1}{\\sqrt2}|H\\rangle+\\frac{1}{\\sqrt2}|V\\rangle"
        }
      },
      {
        id: "m08-e2",
        latex:
          "\\langle\\phi|\\psi\\rangle=\\sum_n\\phi_n^*\\psi_n,\\qquad \\langle\\psi|\\psi\\rangle=1",
        name: "Inner product and normalisation",
        symbols: [
          { symbol: "\\langle\\phi|", meaning: "Bra (conjugate transpose of the ket)", unit: "dimensionless" },
          { symbol: "\\langle\\phi|\\psi\\rangle", meaning: "Complex inner product", unit: "dimensionless" }
        ],
        interpretation:
          "The inner product measures overlap. Its squared modulus gives the probability of projecting one state onto the other. Orthogonal states have zero overlap.",
        assumptions: ["Complex vector space", "Positive-definite inner product", "Normalised states"],
        usedIn: ["Born rule", "State overlap", "Visibility", "Fidelity"],
        numericExample: {
          statement: "⟨H|V⟩ = 0 and ⟨D|D⟩ = 1.",
          latex: "\\langle H|V\\rangle=0"
        }
      },
      {
        id: "m08-e3",
        latex:
          "A^{\\dagger}=A,\\qquad A|a_n\\rangle=a_n|a_n\\rangle,\\qquad a_n\\in\\mathbb{R}",
        name: "Hermitian operator and eigenvalue equation",
        symbols: [
          { symbol: "A", meaning: "Observable operator", unit: "depends on observable" },
          { symbol: "a_n", meaning: "Eigenvalue (possible outcome)", unit: "depends on observable" },
          { symbol: "A^{\\dagger}", meaning: "Adjoint (conjugate transpose)", unit: "same as A" }
        ],
        interpretation:
          "Hermitian operators have real eigenvalues and orthogonal eigenvectors. The eigenvalues are the only values a measurement can return.",
        assumptions: ["Finite-dimensional or bounded operator", "Properly normalised eigenvectors"],
        usedIn: ["Pauli measurements", "Energy levels", "Photon polarization", "Spectral decomposition"],
        numericExample: {
          statement: "σ_z = diag(1, −1) is Hermitian with eigenvalues +1 and −1.",
          latex: "\\sigma_z=\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}"
        }
      },
      {
        id: "m08-e4",
        latex:
          "[A,B]=AB-BA,\\qquad \\Delta A\\,\\Delta B\\ge\\frac12|\\langle[A,B]\\rangle|",
        name: "Commutator and Robertson uncertainty relation",
        symbols: [
          { symbol: "[A,B]", meaning: "Commutator", unit: "product of operator units" },
          { symbol: "\\Delta A", meaning: "Standard deviation of A in the state", unit: "units of A" }
        ],
        interpretation:
          "Non-commuting observables cannot both have definite values in the same state. The product of their uncertainties is bounded by the expectation of their commutator.",
        assumptions: ["State normalised", "Operators Hermitian", "Variances finite"],
        usedIn: ["Uncertainty principle", "Incompatible measurements", "QKD security", "Entropic relations"],
        numericExample: {
          statement: "[σ_x, σ_y] = 2iσ_z gives Δσ_xΔσ_y ≥ |⟨σ_z⟩|.",
          latex: "[\\sigma_x,\\sigma_y]=2i\\sigma_z"
        }
      },
      {
        id: "m08-e5",
        latex:
          "\\sum_n|n\\rangle\\langle n|=I,\\qquad A=\\sum_n a_n|a_n\\rangle\\langle a_n|",
        name: "Completeness and spectral decomposition",
        symbols: [
          { symbol: "I", meaning: "Identity operator", unit: "dimensionless" },
          { symbol: "|a_n\\rangle\\langle a_n|", meaning: "Projector onto eigenstate n", unit: "dimensionless" }
        ],
        interpretation:
          "Inserting a complete set of states changes nothing. The spectral form expresses an observable as a weighted sum of projectors, one for each possible outcome.",
        assumptions: ["Complete orthonormal eigenbasis", "Hermitian operator for the spectral form"],
        usedIn: ["Born rule", "Projective measurement", "Density matrices", "Trace calculations"],
        numericExample: {
          statement: "For a qubit, |0⟩⟨0| + |1⟩⟨1| = I.",
          latex: "|0\\rangle\\langle0|+|1\\rangle\\langle1|=I"
        }
      }
    ],
    derivations: [
      {
        id: "d-m08-hermitian",
        title: "Hermitian operators have real eigenvalues",
        intro:
          "The proof uses only the definition of the inner product and the Hermiticity of the operator.",
        steps: [
          {
            label: "1",
            text: "Let |a⟩ be a normalised eigenvector with eigenvalue a.",
            latex: "A|a\\rangle=a|a\\rangle,\\qquad \\langle a|a\\rangle=1"
          },
          {
            label: "2",
            text: "Sandwich the operator between the eigenstate and its bra.",
            latex: "\\langle a|A|a\\rangle=a\\langle a|a\\rangle=a"
          },
          {
            label: "3",
            text: "Take the complex conjugate and use the Hermiticity of A.",
            latex:
              "\\langle a|A|a\\rangle^*=\\langle a|A^{\\dagger}|a\\rangle=\\langle a|A|a\\rangle"
          },
          {
            label: "4",
            text: "The left side is a*, the right side is a.",
            latex: "a^*=a"
          },
          {
            label: "5",
            text: "Therefore the eigenvalue is real.",
            latex: "a\\in\\mathbb{R}"
          }
        ],
        result: {
          latex: "A=A^{\\dagger}\\;\\Rightarrow\\;a=a^*",
          text:
            "Every Hermitian operator has real eigenvalues, so every possible measurement outcome is a real number. Eigenvectors belonging to distinct eigenvalues are orthogonal: if A|a⟩ = a|a⟩ and A|b⟩ = b|b⟩ with a ≠ b, then (a − b)⟨a|b⟩ = 0, so ⟨a|b⟩ = 0."
        },
        assumptions: ["A is Hermitian", "Eigenvectors are normalisable", "The inner product is positive definite"]
      }
    ],
    problems: [
      {
        id: "m08-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Eigenvalues",
        prompt: "Find the eigenvalues of the symmetric matrix M = [[3, 1], [1, 3]].",
        answer:
          "tr M = 6 and det M = 9 − 1 = 8, so λ² − 6λ + 8 = 0 = (λ − 4)(λ − 2). The eigenvalues are 4 and 2. The eigenvectors are (1, 1)/√2 and (1, −1)/√2, which are orthogonal.",
        numeric: { value: 4, tolerance: 0, unit: "dimensionless" },
        marks: 2
      },
      {
        id: "m08-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Normalisation and probability",
        prompt:
          "Normalise |ψ⟩ = (1, 2i) and find the probabilities of outcomes 0 and 1 in the computational basis.",
        answer:
          "⟨ψ|ψ⟩ = |1|² + |2i|² = 1 + 4 = 5, so |ψ⟩ = (1/√5)(1, 2i). The probability of outcome 0 is |1/√5|² = 1/5 and of outcome 1 is |2i/√5|² = 4/5. The probabilities sum to one as required.",
        numeric: { value: 0.2, tolerance: 0.001, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "m08-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Hermitian operators",
        prompt: "Which property is guaranteed for a Hermitian operator representing an observable?",
        options: [
          "Its eigenvalues are real and its eigenvectors are orthogonal",
          "Its eigenvalues are imaginary and its eigenvectors are parallel",
          "It is always the identity",
          "It always has a zero eigenvalue"
        ],
        answerIndex: 0,
        answer:
          "Hermiticity gives a = a* for every eigenvalue, so outcomes are real. For distinct eigenvalues a ≠ b, (a − b)⟨a|b⟩ = 0 forces ⟨a|b⟩ = 0, so the eigenvectors are orthogonal. Degenerate eigenvalues can be orthogonalised within the eigenspace.",
        explanation:
          "These two facts are what make the spectral decomposition and the Born rule work.",
        marks: 1
      },
      {
        id: "m08-p4",
        type: "short",
        difficulty: 2,
        topic: "Global phase",
        prompt:
          "Explain why multiplying a state by e^{iα} has no physical effect, while multiplying one component of a superposition by a phase does.",
        answer:
          "A global phase multiplies both the amplitude and its conjugate in every probability |⟨φ|ψ⟩|², so it cancels. It also cancels in expectation values ⟨ψ|A|ψ⟩. A relative phase changes the interference between components: for |ψ⟩ = c₀|0⟩ + e^{iφ}c₁|1⟩, the expectation of σ_x is 2 Re(c₀*e^{iφ}c₁), which depends on φ. A phase plate in one arm of an interferometer realizes exactly this relative phase.",
        marks: 3
      },
      {
        id: "m08-p5",
        type: "derivation",
        difficulty: 2,
        topic: "Orthogonal eigenvectors",
        prompt:
          "Prove that eigenvectors of a Hermitian operator belonging to distinct eigenvalues are orthogonal.",
        answer:
          "Let A|a⟩ = a|a⟩ and A|b⟩ = b|b⟩ with a ≠ b and both eigenvalues real. Compute ⟨b|A|a⟩ two ways. Directly it is a⟨b|a⟩. Using Hermiticity, ⟨b|A|a⟩ = ⟨Ab|a⟩ = b⟨b|a⟩. Subtract: (a − b)⟨b|a⟩ = 0. Since a ≠ b, ⟨b|a⟩ = 0.",
        marks: 4
      },
      {
        id: "m08-p6",
        type: "numerical",
        difficulty: 2,
        topic: "Expectation value",
        prompt:
          "For |+⟩ = (|0⟩ + |1⟩)/√2, compute ⟨σ_x⟩ and Δσ_x.",
        answer:
          "σ_x|+⟩ = |+⟩, so ⟨σ_x⟩ = 1. Since σ_x² = I, ⟨σ_x²⟩ = 1 and Δσ_x = √(1 − 1) = 0. The state is an eigenstate of σ_x, so a measurement of σ_x is certain. By contrast ⟨σ_z⟩ = 0 and Δσ_z = 1.",
        numeric: { value: 1, tolerance: 0, unit: "dimensionless" },
        marks: 2
      }
    ],
    references: [R("nielsen"), R("griffiths"), R("goldstein"), R("loudon")],
    related: [
      "mach-zehnder-interferometer",
      "quantum-key-distribution",
      "vectors-and-matrices",
      "density-matrices-and-measurement",
      "superposition-and-complex-amplitudes"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 09 — Density matrices and measurement                              */
  /* ------------------------------------------------------------------ */
  {
    id: "density-matrices-and-measurement",
    number: "09",
    title: "Density Matrices and Measurement",
    kicker: "States when you are not the whole story",
    summary:
      "A ket describes a pure state, but a photon that may have taken one of two paths, or a qubit entangled with its environment, needs a density matrix. This chapter defines the density operator, separates pure from mixed states, states the Born rule, and uses the partial trace to explain decoherence.",
    interactive: "density",
    blocks: [
      {
        type: "lead",
        text: "If a source emits horizontal photons half the time and vertical photons half the time, no single ket describes the beam. A density matrix does. It also describes a photon entangled with another photon, and it is the object that survives when part of a system is traced away."
      },
      {
        type: "p",
        text: "For a pure state |ψ⟩ the density operator is ρ = |ψ⟩⟨ψ|. For a statistical ensemble in which state |ψ_i⟩ occurs with probability p_i, the density operator is ρ = Σ_i p_i|ψ_i⟩⟨ψ_i|. It is Hermitian, positive semidefinite, and has unit trace. The diagonal element ρ_nn is the probability of outcome n in the basis used; the off-diagonal element ρ_mn measures coherence between basis states. A pure state has ρ² = ρ and Tr ρ² = 1. A mixed state has Tr ρ² < 1."
      },
      {
        type: "eq",
        latex:
          "\\rho=\\sum_i p_i|\\psi_i\\rangle\\langle\\psi_i|,\\qquad \\rho=\\rho^{\\dagger},\\qquad \\operatorname{Tr}\\rho=1",
        number: "9.1"
      },
      {
        type: "p",
        text: "Different ensembles can give the same density matrix. A 50/50 mixture of |H⟩ and |V⟩ has ρ = I/2, and so does a 50/50 mixture of |D⟩ and |A⟩, or of |R⟩ and |L⟩. No measurement can distinguish these preparations, because every prediction depends only on ρ. This is not a statement that the ensembles are identical in every metaphysical sense; it is a statement that quantum mechanics assigns them the same operational state. For a qubit, ρ = (I + r·σ)/2, where r is the Bloch vector with |r| ≤ 1. Pure states lie on the surface |r| = 1 and the maximally mixed state sits at r = 0."
      },
      {
        type: "eq",
        latex:
          "\\rho=\\frac{I+\\mathbf r\\cdot\\boldsymbol\\sigma}{2},\\qquad \\gamma=\\operatorname{Tr}\\rho^2=\\frac{1+|\\mathbf r|^2}{2}",
        number: "9.2"
      },
      {
        type: "p",
        text: "The Born rule gives the probability of outcome a for a projective measurement with projector Π_a = |a⟩⟨a| as P(a) = Tr(Π_a ρ) = ⟨a|ρ|a⟩. After the outcome is known, the state is updated to Π_aρΠ_a/P(a), which for a pure state is simply the projected ket renormalised. A measurement with a non-orthogonal set of outcomes is described by positive operator-valued measures (POVMs), but every projective measurement in this laboratory is a special case."
      },
      {
        type: "eq",
        latex:
          "P(a)=\\operatorname{Tr}(\\Pi_a\\rho)=\\langle a|\\rho|a\\rangle,\\qquad \\rho\\to\\frac{\\Pi_a\\rho\\Pi_a}{P(a)}",
        number: "9.3"
      },
      {
        type: "p",
        text: "When a system is entangled with an environment or with another photon, its reduced state is obtained by the partial trace over the unobserved subsystem. If ρ_AB is the joint state, then ρ_A = Tr_B ρ_AB. The reduced state can be mixed even when the joint state is pure. This is the mathematical content of decoherence: information leaks into correlations with the environment, and the local off-diagonal terms that would show interference shrink. The von Neumann entropy S = −Tr(ρ log₂ρ) quantifies the missing information in bits; it is zero for a pure state and one bit for a maximally mixed qubit."
      },
      {
        type: "callout",
        tone: "misconception",
        title: "A mixed state is not the same as a coherent superposition",
        body:
          "The state ½|H⟩⟨H| + ½|V⟩⟨V| has no off-diagonal coherence. A superposition (|H⟩ + |V⟩)/√2 has the same diagonal entries but off-diagonal entries of ½. A polarizer at 45° transmits half the light from the mixture but all of it from the superposition. The density matrices differ, and so do the measurements, even though a measurement in the H/V basis gives 50/50 in both cases. Mixedness is about coherence, not merely about outcome probabilities in one basis."
      },
      {
        type: "derivation",
        derivationId: "d-m09-partial-trace"
      },
      {
        type: "numeric",
        title: "Purity, entropy and the Bloch vector",
        statement:
          "For ρ = diag(0.75, 0.25), find the purity, the von Neumann entropy and the Bloch vector. Compare with the maximally mixed state.",
        latex:
          "\\gamma=0.75^2+0.25^2=0.625,\\qquad S=-0.75\\log_2 0.75-0.25\\log_2 0.25",
        result:
          "γ = 0.625 and S = 0.311 + 0.500 = 0.811 bits. The Bloch vector is r = (0, 0, 0.75 − 0.25) = (0, 0, 0.50), with length 0.50, consistent with γ = (1 + 0.25)/2 = 0.625. The maximally mixed state has γ = 0.5, S = 1 bit and r = 0."
      },
      {
        type: "numeric",
        title: "Measurement on a partially polarised ensemble",
        statement:
          "A source produces horizontal photons with probability 0.70 and vertical photons with probability 0.30, with no coherence between the possibilities. Find the probability of transmitting through a horizontal polarizer, the state after a transmission event, and the probability of a + outcome for a σ_x measurement. Contrast with the coherent state √0.70|H⟩ + √0.30|V⟩.",
        latex:
          "\\rho=0.70|H\\rangle\\langle H|+0.30|V\\rangle\\langle V|,\\qquad P(H)=\\operatorname{Tr}(|H\\rangle\\langle H|\\rho)=0.70",
        result:
          "For the mixture, P(H) = 0.70 and the transmitted state is pure |H⟩. For a σ_x measurement, P(+) = ½(1 + ⟨σ_x⟩) = ½ because the mixture has no off-diagonal coherence. For the coherent state the diagonal is the same but ρ_HV = √0.21 = 0.458, so ⟨σ_x⟩ = 0.916 and P(+) = 0.958. The two states are operationally different."
      }
    ],
    equations: [
      {
        id: "m09-e1",
        latex:
          "\\rho=\\sum_i p_i|\\psi_i\\rangle\\langle\\psi_i|,\\qquad \\operatorname{Tr}\\rho=1",
        name: "Density operator",
        symbols: [
          { symbol: "\\rho", meaning: "Density operator", unit: "dimensionless" },
          { symbol: "p_i", meaning: "Classical probability of state i", unit: "dimensionless" },
          { symbol: "|\\psi_i\\rangle", meaning: "Pure state in the ensemble", unit: "dimensionless" }
        ],
        interpretation:
          "The density operator encodes both quantum coherence and classical uncertainty about preparation. Every measurable prediction follows from it.",
        assumptions: ["Ensemble probabilities sum to one", "States normalised", "No correlations with an unlisted environment"],
        usedIn: ["Unpolarised light", "Decoherence", "Quantum eraser", "State tomography"],
        numericExample: {
          statement: "A 50/50 H/V mixture has ρ = diag(0.5, 0.5) = I/2.",
          latex: "\\rho=\\frac12\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}"
        }
      },
      {
        id: "m09-e2",
        latex:
          "\\gamma=\\operatorname{Tr}\\rho^2,\\qquad \\rho=\\frac{I+\\mathbf r\\cdot\\boldsymbol\\sigma}{2},\\qquad \\gamma=\\frac{1+|\\mathbf r|^2}{2}",
        name: "Purity and Bloch representation",
        symbols: [
          { symbol: "\\gamma", meaning: "Purity, 1 for pure and 1/2 for maximally mixed qubit", unit: "dimensionless" },
          { symbol: "\\mathbf r", meaning: "Bloch vector", unit: "dimensionless" },
          { symbol: "\\boldsymbol\\sigma", meaning: "Pauli vector (σ_x, σ_y, σ_z)", unit: "dimensionless" }
        ],
        interpretation:
          "Purity measures how far a qubit state is from the centre of the Bloch sphere. The length of the Bloch vector is a direct measure of coherence.",
        assumptions: ["Two-level system", "Trace-one Hermitian density matrix"],
        usedIn: ["Polarization state", "Decoherence", "State tomography", "Entanglement detection"],
        numericExample: {
          statement: "r = 0.5 gives γ = (1 + 0.25)/2 = 0.625.",
          latex: "\\gamma=\\frac{1+0.5^2}{2}=0.625"
        }
      },
      {
        id: "m09-e3",
        latex:
          "P(a)=\\operatorname{Tr}(\\Pi_a\\rho)=\\langle a|\\rho|a\\rangle",
        name: "Born rule for a density matrix",
        symbols: [
          { symbol: "P(a)", meaning: "Probability of outcome a", unit: "dimensionless" },
          { symbol: "\\Pi_a", meaning: "Projector onto outcome a", unit: "dimensionless" }
        ],
        interpretation:
          "The trace formula reduces to the squared overlap for a pure state and to a weighted average over the ensemble for a mixed state.",
        assumptions: ["Projective measurement", "Normalised density matrix", "Ideal detector"],
        usedIn: ["Polarization analysis", "QKD", "Bell tests", "Quantum eraser"],
        numericExample: {
          statement: "For ρ = diag(0.7, 0.3), P(H) = Tr(|H⟩⟨H|ρ) = 0.7.",
          latex: "P(H)=0.7"
        }
      },
      {
        id: "m09-e4",
        latex:
          "\\rho_A=\\operatorname{Tr}_B\\rho_{AB}=\\sum_j\\langle j|_B\\,\\rho_{AB}\\,|j\\rangle_B",
        name: "Partial trace",
        symbols: [
          { symbol: "\\rho_A", meaning: "Reduced state of subsystem A", unit: "dimensionless" },
          { symbol: "\\rho_{AB}", meaning: "Joint state of A and B", unit: "dimensionless" },
          { symbol: "|j\\rangle_B", meaning: "Basis of subsystem B", unit: "dimensionless" }
        ],
        interpretation:
          "Discarding subsystem B means averaging over its states. The result is the complete local description of A, and it can be mixed even when the joint state is pure.",
        assumptions: ["Bipartite Hilbert space", "Orthonormal basis for B", "Trace over the full B space"],
        usedIn: ["Entanglement", "Decoherence", "Quantum eraser", "Thermal states"],
        numericExample: {
          statement: "Tracing one half of a Bell state gives I/2.",
          latex: "\\operatorname{Tr}_B|\\Phi^+\\rangle\\langle\\Phi^+|=I/2"
        }
      },
      {
        id: "m09-e5",
        latex:
          "S=-\\operatorname{Tr}(\\rho\\log_2\\rho)=-\\sum_i\\lambda_i\\log_2\\lambda_i",
        name: "Von Neumann entropy",
        symbols: [
          { symbol: "S", meaning: "Entropy in bits", unit: "bit" },
          { symbol: "\\lambda_i", meaning: "Eigenvalues of ρ", unit: "dimensionless" }
        ],
        interpretation:
          "Entropy measures the missing information about which pure state was prepared, or equivalently the entanglement with the traced-out environment.",
        assumptions: ["0 log 0 = 0", "Eigenvalues sum to one", "Base-2 logarithm for bits"],
        usedIn: ["Decoherence", "Entanglement entropy", "QKD security", "Thermodynamics"],
        numericExample: {
          statement: "The maximally mixed qubit has S = 1 bit.",
          latex: "S=-2\\left(\\tfrac12\\log_2\\tfrac12\\right)=1\\ \\mathrm{bit}"
        }
      }
    ],
    derivations: [
      {
        id: "d-m09-partial-trace",
        title: "Tracing one half of a Bell state",
        intro:
          "A pure entangled state has a mixed reduced state. This is the central calculation behind decoherence and the quantum eraser.",
        steps: [
          {
            label: "1",
            text: "Write the Bell state.",
            latex: "|\\Phi^+\\rangle=\\frac{1}{\\sqrt2}\\left(|0\\rangle_A|0\\rangle_B+|1\\rangle_A|1\\rangle_B\\right)"
          },
          {
            label: "2",
            text: "Form the density operator.",
            latex:
              "\\rho_{AB}=\\frac12\\left(|00\\rangle\\langle00|+|00\\rangle\\langle11|+|11\\rangle\\langle00|+|11\\rangle\\langle11|\\right)"
          },
          {
            label: "3",
            text: "Use the partial-trace rule Tr_B(|a⟩⟨c| ⊗ |b⟩⟨d|) = ⟨b|d⟩|a⟩⟨c|.",
            latex: "\\operatorname{Tr}_B\\left(|a\\rangle\\langle c|\\otimes|b\\rangle\\langle d|\\right)=\\langle b|d\\rangle\\,|a\\rangle\\langle c|"
          },
          {
            label: "4",
            text: "Only the terms with matching B labels survive.",
            latex:
              "\\rho_A=\\frac12\\left(|0\\rangle\\langle0|\\langle0|0\\rangle+|1\\rangle\\langle1|\\langle1|1\\rangle\\right)"
          },
          {
            label: "5",
            text: "The result is the maximally mixed state.",
            latex: "\\rho_A=\\frac12\\left(|0\\rangle\\langle0|+|1\\rangle\\langle1|\\right)=\\frac{I}{2}"
          }
        ],
        result: {
          latex: "\\rho_A=\\frac{I}{2},\\qquad \\gamma=\\frac12,\\qquad S=1\\ \\mathrm{bit}",
          text:
            "The joint state is pure, but neither photon alone has a definite polarization. All the coherence is in the correlations between the two photons. If the second photon is lost to the environment, the first behaves exactly like unpolarised light."
        },
        assumptions: ["Ideal Bell state", "Bipartite tensor-product space", "Full trace over B"]
      }
    ],
    problems: [
      {
        id: "m09-p1",
        type: "numerical",
        difficulty: 2,
        topic: "Purity",
        prompt:
          "A qubit state has Bloch vector r = (0.40, 0.40, 0). Find its purity and its eigenvalues.",
        answer:
          "|r| = √(0.16 + 0.16) = 0.5657. Purity γ = (1 + |r|²)/2 = (1 + 0.32)/2 = 0.66. The eigenvalues are (1 ± |r|)/2 = 0.7828 and 0.2172, whose squares sum to 0.66. The state is mixed because |r| < 1.",
        numeric: { value: 0.66, tolerance: 0.01, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "m09-p2",
        type: "mcq",
        difficulty: 2,
        topic: "Mixture versus superposition",
        prompt:
          "Which pair of states has the same diagonal density-matrix elements but different off-diagonal elements?",
        options: [
          "|H⟩ and |V⟩",
          "A 50/50 H/V mixture and the state (|H⟩ + |V⟩)/√2",
          "|D⟩ and |A⟩",
          "Two orthogonal pure states"
        ],
        answerIndex: 1,
        answer:
          "Both have ρ_HH = ρ_VV = 0.5. The mixture has ρ_HV = 0, while the superposition has ρ_HV = 0.5. A 45° polarizer transmits 50% of the mixture but 100% of the superposition.",
        explanation:
          "Off-diagonal coherence is the part of the density matrix that a mixture lacks.",
        marks: 2
      },
      {
        id: "m09-p3",
        type: "numerical",
        difficulty: 2,
        topic: "Born rule",
        prompt:
          "For ρ = 0.7|H⟩⟨H| + 0.3|V⟩⟨V|, find the probability of transmission through a polarizer at 45° and the state after transmission.",
        answer:
          "The projector is Π_D = |D⟩⟨D|. P(D) = Tr(Π_Dρ) = 0.7|⟨D|H⟩|² + 0.3|⟨D|V⟩|² = 0.7(0.5) + 0.3(0.5) = 0.50. After transmission the state is |D⟩, a pure state. The mixture has no coherence, so the 45° result is just the average of the two 50% probabilities.",
        numeric: { value: 0.5, tolerance: 0.001, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "m09-p4",
        type: "short",
        difficulty: 2,
        topic: "Partial trace",
        prompt:
          "Explain how a pure joint state can give a mixed reduced state, and why this matters for interference.",
        answer:
          "If ρ_AB = |Ψ⟩⟨Ψ| is entangled, the reduced state ρ_A = Tr_B ρ_AB is generally mixed because the phases of A are correlated with which state B is in. Locally, the off-diagonal terms of ρ_A are suppressed by the overlap of the corresponding B states. Interference between two path states of A requires those B states to be indistinguishable; if they are orthogonal, the interference term vanishes. This is exactly the which-path mechanism in the quantum eraser.",
        marks: 3
      },
      {
        id: "m09-p5",
        type: "derivation",
        difficulty: 3,
        topic: "Purity of a mixture",
        prompt:
          "Show that a mixture of two orthogonal pure states with probabilities p and 1 − p has purity p² + (1 − p)² and entropy equal to the binary entropy.",
        answer:
          "In the basis of the two states, ρ = diag(p, 1 − p). Then ρ² = diag(p², (1 − p)²), so Tr ρ² = p² + (1 − p)². This equals 1 − 2p(1 − p), which is less than 1 unless p = 0 or 1. The entropy is S = −p log₂p − (1 − p)log₂(1 − p), maximal at p = ½ where S = 1 bit.",
        marks: 4
      },
      {
        id: "m09-p6",
        type: "numerical",
        difficulty: 2,
        topic: "Depolarising channel",
        prompt:
          "A pure state passes through a channel that replaces it with the maximally mixed state with probability p = 0.20: ρ = (1 − p)|ψ⟩⟨ψ| + p I/2. Find the purity.",
        answer:
          "The Bloch vector shrinks by the factor 1 − p, so |r| = 0.80. Purity γ = (1 + 0.64)/2 = 0.82. Equivalently the eigenvalues are 1 − p/2 = 0.90 and p/2 = 0.10, whose squares sum to 0.81 + 0.01 = 0.82.",
        numeric: { value: 0.82, tolerance: 0.01, unit: "dimensionless" },
        marks: 3
      }
    ],
    references: [R("nielsen"), R("griffiths"), R("loudon"), R("saleh")],
    related: [
      "quantum-eraser",
      "quantum-key-distribution",
      "linear-algebra-and-hilbert-spaces",
      "entanglement-and-tensor-products",
      "decoherence-which-path-and-complementarity"
    ]
  },

  /* ------------------------------------------------------------------ */
  /* 10 — Polarization mathematics                                      */
  /* ------------------------------------------------------------------ */
  {
    id: "polarization-mathematics",
    number: "10",
    title: "Polarization Mathematics",
    kicker: "Two components, one ellipse, four numbers",
    summary:
      "Polarization is the two-component complex vector carried by a light beam. This chapter develops Jones vectors and matrices, Malus's law, wave plates, Stokes parameters, the Poincaré sphere and Mueller matrices, and shows how each tool is used in the 3D-cinema and quantum-eraser experiments.",
    interactive: "jones",
    blocks: [
      {
        type: "lead",
        text: "A light beam has two transverse electric-field components. Their amplitudes and relative phase define an ellipse, and almost every polarization measurement is a projection onto a chosen direction. Jones calculus handles fully polarized light; Stokes vectors and Mueller matrices extend the bookkeeping to partially polarized light."
      },
      {
        type: "p",
        text: "For propagation along +z, the transverse field is E = (E_x, E_y), a complex two-vector called a Jones vector. Its squared norm |E_x|² + |E_y|² is proportional to intensity. A global phase is irrelevant, so a normalized Jones vector has three real degrees of freedom minus one for phase: two angles, the azimuth and the ellipticity. Linear horizontal and vertical states are (1, 0) and (0, 1); diagonal and antidiagonal states are (1, ±1)/√2; right and left circular states are (1, ±i)/√2 in the convention used by the polarization module. The sign of the imaginary part fixes handedness and must be stated whenever a convention is quoted."
      },
      {
        type: "eq",
        latex:
          "\\mathbf E=\\begin{pmatrix}E_x\\\\ E_y\\end{pmatrix},\\qquad I=|E_x|^2+|E_y|^2,\\qquad |\\mathbf E|=1\\ \\text{for a normalised state}",
        number: "10.1"
      },
      {
        type: "p",
        text: "A linear polarizer at angle θ transmits the component of the field along its axis. The output amplitude is E·û = E_xcos θ + E_ysin θ, so the intensity transmission for light already linearly polarized at angle α is cos²(θ − α). This is Malus's law. For unpolarized input, an ideal polarizer transmits exactly half the power regardless of angle, because the input has no preferred orientation. Two polarizers at relative angle θ transmit a fraction ½cos²θ of unpolarized input."
      },
      {
        type: "p",
        text: "A retarder (wave plate) has two principal axes with different refractive indices. It transmits both components but delays one relative to the other by a phase δ = 2π(n_s − n_f)d/λ. In the principal-axis frame its Jones matrix is diag(1, e^{iδ}); in the laboratory frame it is W(θ, δ) = R(θ) diag(1, e^{iδ}) R(−θ). A half-wave plate has δ = π and rotates linear polarization from α to 2θ − α. A quarter-wave plate has δ = π/2 and converts linear polarization at 45° to the fast axis into circular polarization. An ideal wave plate changes polarization but not intensity."
      },
      {
        type: "eq",
        latex:
          "W(\\theta,\\delta)=R(\\theta)\\begin{pmatrix}1&0\\\\0&e^{i\\delta}\\end{pmatrix}R(-\\theta),\\qquad \\delta=\\frac{2\\pi(n_s-n_f)d}{\\lambda}",
        number: "10.3",
        note: "δ in rad; n_s, n_f dimensionless; d and λ in m."
      },
      {
        type: "p",
        text: "Stokes parameters describe any beam, polarized or not. S₀ is the total intensity; S₁ is the excess of horizontal over vertical; S₂ is the excess of +45° over −45°; S₃ is the excess of right over left circular. For a pure state S₀² = S₁² + S₂² + S₃², and the degree of polarization is DOP = √(S₁² + S₂² + S₃²)/S₀. The normalized Stokes vector maps onto the Poincaré sphere: the azimuth is ½atan2(S₂, S₁) and the ellipticity angle is ½asin(S₃/S₀). Mueller matrices act on Stokes vectors and can describe depolarization, which Jones matrices cannot."
      },
      {
        type: "eq",
        latex:
          "\\begin{aligned}S_0&=|E_x|^2+|E_y|^2,&S_1&=|E_x|^2-|E_y|^2,\\\\ S_2&=2\\operatorname{Re}(E_xE_y^*),&S_3&=2\\operatorname{Im}(E_x^*E_y)\\end{aligned}",
        number: "10.4"
      },
      {
        type: "callout",
        tone: "misconception",
        title: "An ideal wave plate does not attenuate light",
        body:
          "A half-wave plate rotates the plane of polarization; a quarter-wave plate turns linear into circular. Neither changes the total intensity if it is ideal and antireflection-coated. A wave plate that appears to dim a beam is usually misaligned, reflecting, or absorbing at the coating. The retardance changes the relative phase, not the modulus of either component."
      },
      {
        type: "derivation",
        derivationId: "d-m10-hwp"
      },
      {
        type: "numeric",
        title: "Malus's law and unpolarized light",
        statement:
          "Unpolarized light of 100 µW passes through a horizontal polarizer and then a second polarizer at 30.0°. Find the power after each element. What is the extinction ratio if the second polarizer is rotated to 90.0° and the residual transmission is 0.10%?",
        latex:
          "P_1=\\frac{100}{2}=50.0\\ \\mu\\mathrm{W},\\qquad P_2=50.0\\cos^2 30^\\circ=37.5\\ \\mu\\mathrm{W}",
        result:
          "After the first polarizer, 50.0 µW; after the second, 37.5 µW. At 90° the ideal transmission is zero; a residual of 0.10% of 50 µW is 0.050 µW, giving an extinction ratio of 50/0.050 = 1000, or 30 dB."
      },
      {
        type: "numeric",
        title: "Half- and quarter-wave plates",
        statement:
          "A half-wave plate at 22.5° acts on horizontal polarization. What is the output polarization? What does a quarter-wave plate at 45° do to the same input? Give the Stokes vector in each case.",
        latex:
          "\\alpha_{\\mathrm{out}}=2(22.5^\\circ)-0^\\circ=45^\\circ",
        result:
          "The half-wave plate produces linear polarization at 45°, with Jones vector (1, 1)/√2 and Stokes vector (S₀, S₁, S₂, S₃) = (1, 0, 1, 0). The quarter-wave plate at 45° produces left circular polarization, (1, −i)/√2, with Stokes vector (1, 0, 0, −1). The intensity is unity in both cases; only the polarization state changes."
      }
    ],
    equations: [
      {
        id: "m10-e1",
        latex:
          "\\mathbf E=\\begin{pmatrix}E_x\\\\E_y\\end{pmatrix},\\qquad I=|E_x|^2+|E_y|^2",
        name: "Jones vector and intensity",
        symbols: [
          { symbol: "E_x,E_y", meaning: "Complex transverse field components", unit: "V m⁻¹" },
          { symbol: "I", meaning: "Intensity (up to a constant)", unit: "W m⁻²" }
        ],
        interpretation:
          "The Jones vector is the two-component complex amplitude of a fully polarized beam. Its squared norm is the intensity; its phase difference sets the polarization ellipse.",
        assumptions: ["Paraxial plane wave", "Fully polarized light", "Fixed propagation direction", "Linear medium"],
        usedIn: ["Polarization optics", "3D cinema", "Quantum eraser markers", "Wave-plate design"],
        numericExample: {
          statement: "|D⟩ = (1, 1)/√2 has intensity 1 and linear 45° polarization.",
          latex: "I=\\frac12+\\frac12=1"
        }
      },
      {
        id: "m10-e2",
        latex:
          "I(\\theta)=I_0\\cos^2(\\theta-\\alpha)",
        name: "Malus's law",
        symbols: [
          { symbol: "I_0", meaning: "Incident intensity after the first polarizer", unit: "W m⁻²" },
          { symbol: "\\theta", meaning: "Analyzer angle", unit: "rad" },
          { symbol: "\\alpha", meaning: "Incident linear polarization angle", unit: "rad" }
        ],
        interpretation:
          "A polarizer projects the field onto its axis. The transmitted intensity is the squared cosine of the angle between the field and the axis.",
        assumptions: ["Ideal polarizer", "Linear input polarization", "No depolarization"],
        usedIn: ["Polarizer alignment", "Extinction-ratio measurement", "3D cinema", "Bell tests"],
        numericExample: {
          statement: "θ − α = 30° gives I/I₀ = 0.75.",
          latex: "\\cos^2 30^\\circ=0.75"
        }
      },
      {
        id: "m10-e3",
        latex:
          "W(\\theta,\\delta)=R(\\theta)\\begin{pmatrix}1&0\\\\0&e^{i\\delta}\\end{pmatrix}R(-\\theta)",
        name: "Jones matrix of a retarder",
        symbols: [
          { symbol: "\\theta", meaning: "Fast-axis orientation", unit: "rad" },
          { symbol: "\\delta", meaning: "Retardance, 2πΔn d/λ", unit: "rad" },
          { symbol: "d", meaning: "Plate thickness", unit: "m" }
        ],
        interpretation:
          "The plate delays one principal component relative to the other, then the result is rotated back into the laboratory frame. A half-wave plate has δ = π; a quarter-wave plate δ = π/2.",
        assumptions: ["Ideal homogeneous retarder", "Normal incidence", "No reflection or absorption", "Single wavelength"],
        usedIn: ["Wave plates", "Polarization controllers", "Quantum-eraser markers", "Ellipsometry"],
        numericExample: {
          statement: "A half-wave plate at 22.5° sends H to 45° linear.",
          latex: "\\alpha_{\\mathrm{out}}=2(22.5^\\circ)-0^\\circ=45^\\circ"
        }
      },
      {
        id: "m10-e4",
        latex:
          "\\begin{aligned}S_0&=|E_x|^2+|E_y|^2,&S_1&=|E_x|^2-|E_y|^2,\\\\ S_2&=2\\operatorname{Re}(E_xE_y^*),&S_3&=2\\operatorname{Im}(E_x^*E_y)\\end{aligned}",
        name: "Stokes parameters",
        symbols: [
          { symbol: "S_0", meaning: "Total intensity", unit: "W m⁻²" },
          { symbol: "S_1", meaning: "Horizontal minus vertical", unit: "W m⁻²" },
          { symbol: "S_2", meaning: "+45° minus −45°", unit: "W m⁻²" },
          { symbol: "S_3", meaning: "Right minus left circular", unit: "W m⁻²" }
        ],
        interpretation:
          "Four real numbers replace the two complex components. They are exactly the quantities a set of six polarization measurements can determine.",
        assumptions: ["Quasi-monochromatic", "Transverse field", "Consistent handedness convention"],
        usedIn: ["Poincaré sphere", "Mueller calculus", "Depolarization", "State tomography"],
        numericExample: {
          statement: "For D = (1, 1)/√2: S = (1, 0, 1, 0).",
          latex: "S_2=2\\operatorname{Re}(1/2)=1"
        }
      },
      {
        id: "m10-e5",
        latex:
          "\\mathbf S'=M\\mathbf S,\\qquad \\mathrm{DOP}=\\frac{\\sqrt{S_1^2+S_2^2+S_3^2}}{S_0}",
        name: "Mueller matrix and degree of polarization",
        symbols: [
          { symbol: "M", meaning: "4×4 Mueller matrix", unit: "dimensionless" },
          { symbol: "\\mathbf S", meaning: "Stokes vector", unit: "W m⁻²" },
          { symbol: "\\mathrm{DOP}", meaning: "Degree of polarization, 0 to 1", unit: "dimensionless" }
        ],
        interpretation:
          "Mueller matrices act linearly on Stokes vectors and can reduce the DOP. Jones matrices preserve it because they describe only fully polarized input.",
        assumptions: ["Linear optical system", "Stokes vector in the same convention", "No nonlinear effects"],
        usedIn: ["Polarimetry", "Depolarizing samples", "LCD projection", "3D cinema glasses"],
        numericExample: {
          statement: "A horizontal polarizer acting on unpolarized light gives S = (0.5, 0.5, 0, 0) and DOP = 1.",
          latex: "\\mathrm{DOP}=\\frac{0.5}{0.5}=1"
        }
      }
    ],
    derivations: [
      {
        id: "d-m10-hwp",
        title: "A half-wave plate rotates linear polarization by twice its angle",
        intro:
          "The result follows from the rotated retarder matrix with δ = π. It is the single most useful formula in polarization alignment.",
        steps: [
          {
            label: "1",
            text: "In its principal-axis frame a half-wave plate has retardance π, so its matrix is diag(1, −1).",
            latex: "W_0=\\begin{pmatrix}1&0\\\\0&e^{i\\pi}\\end{pmatrix}=\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}"
          },
          {
            label: "2",
            text: "Rotate the matrix into the laboratory frame.",
            latex:
              "W(\\theta)=R(\\theta)W_0R(-\\theta)=\\begin{pmatrix}\\cos2\\theta&\\sin2\\theta\\\\ \\sin2\\theta&-\\cos2\\theta\\end{pmatrix}"
          },
          {
            label: "3",
            text: "Let the input be linear polarization at angle α.",
            latex: "\\mathbf E_{\\mathrm{in}}=\\begin{pmatrix}\\cos\\alpha\\\\ \\sin\\alpha\\end{pmatrix}"
          },
          {
            label: "4",
            text: "Multiply the matrix by the input vector.",
            latex:
              "\\mathbf E_{\\mathrm{out}}=\\begin{pmatrix}\\cos2\\theta\\cos\\alpha+\\sin2\\theta\\sin\\alpha\\\\ \\sin2\\theta\\cos\\alpha-\\cos2\\theta\\sin\\alpha\\end{pmatrix}"
          },
          {
            label: "5",
            text: "Use the cosine and sine subtraction identities.",
            latex:
              "\\mathbf E_{\\mathrm{out}}=\\begin{pmatrix}\\cos(2\\theta-\\alpha)\\\\ \\sin(2\\theta-\\alpha)\\end{pmatrix}"
          },
          {
            label: "6",
            text: "Read off the output angle.",
            latex: "\\alpha_{\\mathrm{out}}=2\\theta-\\alpha"
          }
        ],
        result: {
          latex: "\\alpha_{\\mathrm{out}}=2\\theta-\\alpha",
          text:
            "A half-wave plate at θ rotates linear polarization by 2(θ − α). At θ = 22.5° with horizontal input, the output is 45°; at θ = 45°, horizontal is rotated to vertical. A full rotation of the plate scans the output through 180°."
        },
        assumptions: ["Ideal half-wave retardance", "Normal incidence", "Lossless plate", "Linear input polarization"]
      }
    ],
    problems: [
      {
        id: "m10-p1",
        type: "numerical",
        difficulty: 1,
        topic: "Malus's law",
        prompt:
          "Linearly polarized light of 1.00 mW passes through an analyzer whose axis is at 30.0° to the polarization. What power is transmitted?",
        answer:
          "P = P₀cos²30° = 1.00 × 0.750 = 0.750 mW. The field amplitude falls by cos30° = 0.866 and the intensity by its square.",
        numeric: { value: 0.75, tolerance: 0.001, unit: "mW" },
        marks: 2
      },
      {
        id: "m10-p2",
        type: "numerical",
        difficulty: 2,
        topic: "Half-wave plate",
        prompt:
          "A half-wave plate has its fast axis at 30.0°. Linear polarization at 10.0° is incident. At what angle does the light emerge?",
        answer:
          "α_out = 2θ − α = 2(30.0°) − 10.0° = 50.0°. The rotation is 40°, twice the 20° angle between the input polarization and the plate axis.",
        numeric: { value: 50, tolerance: 0.1, unit: "degrees" },
        marks: 2
      },
      {
        id: "m10-p3",
        type: "mcq",
        difficulty: 1,
        topic: "Wave-plate action",
        prompt: "What does an ideal quarter-wave plate do to the total intensity of a beam?",
        options: [
          "It halves the intensity",
          "It leaves the intensity unchanged while changing the polarization state",
          "It doubles the intensity",
          "It extinguishes one polarization component completely"
        ],
        answerIndex: 1,
        answer:
          "A retarder changes only the relative phase of the two principal components. Its Jones matrix is unitary, so the squared norm — the intensity — is preserved. A polarizer, by contrast, removes a component and reduces the intensity.",
        explanation:
          "Unitarity is the matrix statement that no power is lost.",
        marks: 1
      },
      {
        id: "m10-p4",
        type: "numerical",
        difficulty: 2,
        topic: "Stokes parameters",
        prompt:
          "Find the Stokes vector of diagonal polarization D = (1, 1)/√2, its degree of polarization, and its Poincaré azimuth.",
        answer:
          "S₀ = 1, S₁ = ½ − ½ = 0, S₂ = 2 Re(½) = 1, S₃ = 2 Im(½) = 0. DOP = √(0 + 1 + 0)/1 = 1. The azimuth is ½atan2(1, 0) = 45°, as expected for diagonal linear polarization. The Poincaré point is (0, 1, 0) on the equator.",
        numeric: { value: 1, tolerance: 0.001, unit: "dimensionless" },
        marks: 3
      },
      {
        id: "m10-p5",
        type: "short",
        difficulty: 2,
        topic: "Mueller matrix",
        prompt:
          "Explain why an ideal polarizer always produces fully polarized output, even from unpolarized input. Use the Mueller matrix whose first row is (0.5, 0.5, 0, 0) acting on (1, 0, 0, 0) to support your argument.",
        answer:
          "S′ = (0.5, 0.5, 0, 0): the transmitted intensity is half the input and the light is now fully horizontally polarized. DOP = √(0.5²)/0.5 = 1. The polarizer projects every input state onto the same output direction, so no matter how random the input orientations were, the transmitted field has a single well-defined polarization. The reduction in intensity records the discarded component.",
        marks: 3
      },
      {
        id: "m10-p6",
        type: "derivation",
        difficulty: 2,
        topic: "Malus's law",
        prompt:
          "Derive Malus's law from the Jones vector of linear polarization and the projection onto an analyzer axis.",
        answer:
          "Let the input be E = E₀(cos α, sin α) and the analyzer axis be û = (cos θ, sin θ). The transmitted amplitude is E·û = E₀(cos α cos θ + sin α sin θ) = E₀cos(θ − α). The transmitted intensity is the squared modulus, I = I₀cos²(θ − α). At θ = α the transmission is unity; at θ = α + 90° it is zero.",
        marks: 3
      }
    ],
    references: [R("goldstein"), R("hecht"), R("saleh"), R("bornwolf")],
    related: [
      "polarization-3d-cinema",
      "quantum-eraser",
      "vectors-and-matrices",
      "trigonometry-and-complex-numbers",
      "density-matrices-and-measurement"
    ]
  }
];

export const MATHEMATICS_BY_ID: Record<string, MathChapter> = Object.fromEntries(
  MATHEMATICS_CHAPTERS.map((chapter) => [chapter.id, chapter])
);

export function getMathChapter(id: string): MathChapter | undefined {
  return MATHEMATICS_BY_ID[id];
}
