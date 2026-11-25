import type { ExperimentContent, Reference } from "@/lib/content/types";
import { refs } from "@/lib/content/references";

const cite = (...ids: string[]): Reference[] =>
  ids.map((id) => {
    const entry = refs[id];
    if (!entry) throw new Error(`Unknown reference id: ${id}`);
    return entry;
  });

/**
 * Experiment 08 — Optical Tweezers.
 *
 * The prose distinguishes three things throughout: what a real trap does,
 * what this particular (unverified) kit configuration would require, and what
 * the paraxial point-dipole simulation computes. No measurement is claimed.
 */
export const opticalTweezers: ExperimentContent = {
  slug: "optical-tweezers",
  number: "08",
  title: "Optical Tweezers",
  shortTitle: "Optical Tweezers",
  subtitle: "Trapping and calibrating a micron-scale particle",
  summary:
    "Focus a Gaussian beam, balance gradient and scattering forces, and calibrate trap stiffness from Brownian motion.",
  principle:
    "A tightly focused beam exerts a gradient force toward the intensity maximum and a scattering force along propagation.",
  family: "Optical manipulation",
  difficulty: 3,
  duration: "4–6 h",
  evidence: {
    implementation: "actual",
    headline: "A real experiment, but alignment-critical and kit-dependent",
    detail:
      "Optical trapping is performed in undergraduate teaching laboratories and in research. A stable single-beam trap needs a high-numerical-aperture objective, a suitable near-infrared laser, a dilute sample and patient alignment; a marginal trap is the normal first outcome. The hardware below is a configuration specification for an unverified educational kit, not a validated bill of materials. The interactive model is a paraxial Gaussian beam with point-dipole (Rayleigh) forces and overdamped Brownian dynamics. Its outputs are model predictions, not calibration data from a physical trap."
  },
  kit: {
    name: "Educational optical-tweezers configuration",
    manufacturer: "Thorlabs",
    verification: "unverified",
    documentation: [
      {
        title: "Thorlabs educational kits, user guides and application notes",
        url: "https://www.thorlabs.com/",
        note:
          "Consult the printed guide and packing list of the actual kit. A model-specific document link must be recorded once the kit label is verified; none is asserted here."
      }
    ],
    note:
      "The experiment is genuinely undergraduate-accessible, but the exact source, objective, dichroic and sample supplied with any teaching kit must be verified before purchase or use. The 1064 nm laser, high-NA oil objective and dilute microsphere suspension are treated as configuration items to be confirmed, not as verified part numbers. No measured power, transmission, NA or trap stiffness is claimed."
  },
  hardware: [
    {
      itemId: "src-diode-1064",
      quantity: "1",
      role: "unverified",
      note: "Assumed near-infrared source. Verify wavelength, output power, polarisation and beam quality; 1064 nm is chosen for low water absorption, not because any particular unit was tested."
    },
    {
      itemId: "src-he-ne",
      quantity: "1",
      role: "recommended",
      note: "Visible alignment laser. Use at low power and with the IR source shuttered; never assume the visible beam traces the IR beam exactly."
    },
    {
      itemId: "lens-objective-100x",
      quantity: "1",
      role: "unverified",
      note: "High-NA oil-immersion objective is the trapping lens. Verify NA, immersion medium, working distance, coverslip correction and transmission at 1064 nm."
    },
    {
      itemId: "lens-objective-10x",
      quantity: "1",
      role: "kit",
      note: "Lower-NA objective for bright-field viewing and coarse sample navigation."
    },
    {
      itemId: "lens-tube",
      quantity: "1",
      role: "kit",
      note: "Forms the image on the camera together with the objective."
    },
    {
      itemId: "lens-tube-mount",
      quantity: "1",
      role: "kit",
      note: "Keeps the tube lens and camera parfocal with the sample plane."
    },
    {
      itemId: "sample-bead-suspension",
      quantity: "1",
      role: "unverified",
      note: "Dilute dielectric microspheres. Verify diameter, refractive index, concentration and surfactant; a 0.4 µm silica or polystyrene bead is a typical starting point."
    },
    {
      itemId: "sample-coverslip",
      quantity: "1",
      role: "kit",
      note: "Sample chamber. Coverslip thickness must match the objective correction; seal the chamber to reduce evaporation and drift."
    },
    {
      itemId: "sample-stage",
      quantity: "1",
      role: "kit",
      note: "XY sample positioning with fine control; the stage, not the trap, is moved to test restoring forces."
    },
    {
      itemId: "translation-stage",
      quantity: "1",
      role: "kit",
      note: "Micrometre translation for focus and for calibrated stage-displacement tests."
    },
    {
      itemId: "det-camera",
      quantity: "1",
      role: "kit",
      note: "Bright-field monitoring and coarse bead tracking. A camera is not a calibrated position detector without a scale and blur correction."
    },
    {
      itemId: "filter-bandpass",
      quantity: "1",
      role: "kit",
      note: "Blocks the trapping laser from the camera while passing the illumination band. Verify the blocking OD at 1064 nm."
    },
    {
      itemId: "filter-nd",
      quantity: "1",
      role: "kit",
      note: "Attenuates the alignment beam and protects the camera; do not use an ND filter as the primary laser-safety device."
    },
    {
      itemId: "mir-plane",
      quantity: "2",
      role: "kit",
      note: "Steers the beam into the objective and sets the beam height."
    },
    {
      itemId: "kinematic-mount",
      quantity: "2",
      role: "kit",
      note: "Two-axis steering of the input beam; small angular changes move the focus substantially."
    },
    {
      itemId: "optical-table",
      quantity: "1",
      role: "kit",
      note: "Damped surface for a stable trap; vibration and thermal drift are visible in the calibration data."
    },
    {
      itemId: "beam-block",
      quantity: "2",
      role: "kit",
      note: "Catch the through-beam and any stray reflections. Place blocks before raising power."
    },
    {
      itemId: "inst-safety-glasses",
      quantity: "1 per person",
      role: "kit",
      note: "Wavelength-specific eyewear for the actual source. Verify the marked wavelength range and optical density; ordinary laser goggles for 532 nm are not adequate for 1064 nm."
    },
    {
      itemId: "inst-shutter",
      quantity: "1",
      role: "kit",
      note: "Mechanical shutter with a remote switch at the bench; the default state is closed."
    },
    {
      itemId: "lab-jack",
      quantity: "1",
      role: "kit",
      note: "Brings the sample stage to the objective working distance without tilting the optical axis."
    },
    {
      itemId: "det-power-meter",
      quantity: "1",
      role: "kit",
      note: "Measures power before the objective and, with a suitable sample-plane arrangement, estimates the power delivered to the trap. Head calibration and wavelength correction matter."
    }
  ],
  objectives: [
    "Explain optical trapping as momentum transfer between a focused field and a dielectric particle, and distinguish the gradient and scattering contributions.",
    "Compute the waist, Rayleigh range, divergence, focal intensity and focal volume of a Gaussian beam from its power and wavelength.",
    "Decide whether a given particle, medium and beam can form a single-beam trap by comparing the maximum gradient force with the scattering force.",
    "Build a beam path that overfills the objective back aperture and forms a diffraction-limited focus in a sealed sample chamber.",
    "Observe a trapped bead, test it by translating the stage, and recognise the difference between a real trap, sticking to the glass and a radiation-pressure push.",
    "Acquire a seeded or measured Brownian position trace with a stated sample rate and bandwidth.",
    "Calibrate trap stiffness from the position variance (equipartition) and from the power spectral density (corner frequency), and compare the two.",
    "Measure a force–displacement curve, estimate the escape force and propagate uncertainties.",
    "Assess photodamage and heating risks and choose power, wavelength and exposure time defensibly."
  ],
  concepts: [
    "Radiation pressure",
    "Gradient force",
    "Scattering force",
    "Gaussian beam",
    "Rayleigh regime",
    "Optical potential",
    "Trap stiffness",
    "Brownian motion",
    "Equipartition",
    "Power spectral density"
  ],
  prerequisites: [
    "Ray optics: refraction, lenses and numerical aperture.",
    "Diffraction and the Gaussian beam: waist, Rayleigh range and diffraction limit.",
    "Optical momentum and radiation pressure.",
    "Vector calculus: gradient of a scalar field and harmonic approximation.",
    "Basic statistics: mean, variance, histogram, least-squares fitting and uncertainty propagation.",
    "Fourier reasoning: power spectral density, sampling and aliasing.",
    "Langevin-type reasoning or a first course in statistical mechanics.",
    "Safe handling of Class 3B/4 lasers and high-NA microscope objectives."
  ],
  sections: [
    {
      id: "history-of-tweezers",
      number: "1",
      title: "A light touch",
      kicker: "Why optical trapping matters",
      blocks: [
        {
          type: "lead",
          text: "In 1970 Arthur Ashkin showed that a focused laser beam can accelerate and trap micrometre-sized dielectric spheres. Sixteen years later, with Dziedzic, Bjorkholm and Chu, he demonstrated the single-beam gradient trap that we now call optical tweezers. The idea is counter-intuitive: light carries momentum, and a transparent particle can take momentum from the field without absorbing it."
        },
        {
          type: "p",
          text: "The consequences reach far beyond a curious demonstration. A trapped bead is a handle on the microscopic world: it can pull on a DNA molecule, stall a molecular motor, probe the stiffness of a cell membrane or measure the viscosity of a few microlitres of fluid. Because the trap is calibrated in force rather than in displacement, it turns a microscope into a piconewton instrument. Optical tweezers are now routine in biophysics, and the 2018 Nobel Prize in Physics recognised Ashkin's work on optical manipulation."
        },
        {
          type: "p",
          text: "A teaching version is genuinely accessible, but it is not forgiving. The trap exists in three dimensions only when the inward gradient force exceeds the along-beam scattering force, which requires a tightly focused beam and a particle whose refractive index is higher than its surroundings. A high-NA objective, a clean Gaussian beam, a dilute sample and a stable stage are not optional refinements — they are the experiment."
        },
        {
          type: "callout",
          tone: "principle",
          title: "Two forces, one focus",
          body:
            "A dielectric sphere in a light field feels a gradient force toward regions of higher intensity and a scattering force along the direction of propagation. The gradient force provides the trap; the scattering force pushes the particle downstream and sets how much gradient is needed for stability."
        },
        {
          type: "callout",
          tone: "note",
          title: "What this page claims",
          body:
            "The apparatus and procedure describe a real experiment. The listed kit is an unverified educational configuration. All numbers produced by the simulation are model outputs from a paraxial Gaussian beam and a point-dipole particle; they are not measurements and cannot replace calibration of a physical trap."
        }
      ]
    },
    {
      id: "gaussian-propagation",
      number: "2",
      title: "The beam that does the work",
      kicker: "Gaussian propagation",
      blocks: [
        {
          type: "p",
          text: "A single-mode laser focused by a good objective is, to first order, a TEM₀₀ Gaussian beam. Its transverse intensity is a bell curve whose 1/e² radius w(z) is smallest at the waist w₀ and grows quadratically near the focus, then linearly in the far field. The scale that separates those regimes is the Rayleigh range z_R, the distance over which the beam area doubles."
        },
        {
          type: "eq",
          latex: String.raw`z_R = \frac{\pi w_0^2 n_m}{\lambda_0}`,
          number: "2",
          note: "The medium index n_m appears because the wavelength in the medium is λ₀/n_m. For a waist of 0.5 µm at 1064 nm in water, z_R ≈ 0.98 µm."
        },
        {
          type: "eq",
          latex: String.raw`w(z) = w_0\sqrt{1+\left(\frac{z}{z_R}\right)^2}`,
          number: "1"
        },
        {
          type: "p",
          text: "The far-field half-angle is θ = λ₀/(π w₀ n_m). This is the Gaussian-beam divergence, not the geometric cone angle of the objective. A small waist therefore implies a large divergence: the same diffraction that lets you concentrate light also makes the beam spread quickly after the focus."
        },
        { type: "diagram", kind: "gaussian-beam", caption: "Figure 8.1 — Gaussian envelope w(z), Rayleigh range and waist. The drawing uses a strongly exaggerated divergence so that the scale is visible." },
        {
          type: "numeric",
          title: "How paraxial is a tight focus?",
          statement:
            "Take λ₀ = 1064 nm, w₀ = 0.5 µm and n_m = 1.33. Compute z_R and the far-field half-angle θ.",
          latex: String.raw`z_R=\frac{\pi(0.5\,\mu\mathrm{m})^2(1.33)}{1.064\,\mu\mathrm{m}},\qquad \theta=\frac{\lambda_0}{\pi w_0 n_m}`,
          result:
            "z_R ≈ 0.98 µm and θ ≈ 0.51 rad ≈ 29°. The Gaussian formula is being used well outside the paraxial regime, so it is a qualitative guide at high NA, not a precise field model."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "A small waist is not a narrow ray",
          body:
            "Students often picture a 0.5 µm focus as a thin pencil that stays thin. It does not: z_R is only about 1 µm, so the beam is already several times wider a few micrometres away. The strong axial variation is exactly what produces the axial gradient — and what makes tight focusing hard."
        },
        {
          type: "derivation",
          derivationId: "gaussian-from-wave"
        }
      ]
    },
    {
      id: "intensity-focal-volume",
      number: "3",
      title: "Intensity, focal volume and numerical aperture",
      blocks: [
        {
          type: "p",
          text: "The intensity at the focus is not the laser power divided by the waist area; the Gaussian peak is twice the average over the beam area. The factor of two matters when you compare a calculation with a power-meter reading."
        },
        {
          type: "eq",
          latex: String.raw`I(r,z)=\frac{2P}{\pi w(z)^2}\exp\!\left(-\frac{2r^2}{w(z)^2}\right),\qquad I_0=I(0,0)=\frac{2P}{\pi w_0^2}`,
          number: "3"
        },
        {
          type: "p",
          text: "A useful estimate of the focal volume is V ≈ π w₀² z_R, the cylinder that contains most of the light before the beam area doubles. For w₀ = 0.5 µm and z_R = 0.98 µm this is about 0.8 µm³, comparable to the volume of a small bacterium. The intensity is therefore enormous for a modest laser power."
        },
        {
          type: "numeric",
          title: "Peak intensity of a teaching trap",
          statement: "100 mW is focused to w₀ = 0.5 µm. What is the peak intensity in W/m² and MW/cm²?",
          latex: String.raw`I_0=\frac{2(0.100\ \mathrm{W})}{\pi(0.5\times10^{-6}\ \mathrm{m})^2}`,
          result:
            "I₀ ≈ 2.5 × 10¹¹ W/m² = 25 MW/cm². This is why heating, two-photon absorption and sample damage must be considered even when the total power is only a tenth of a watt."
        },
        {
          type: "p",
          text: "The objective is characterised by its numerical aperture NA = n sin θ, where θ is the half-angle of the cone it accepts. For a diffraction-limited focus the waist scales approximately as w₀ ≈ 0.61 λ₀/NA. This is the relation used to link the NA and waist controls in the simulation; it is a useful rule of thumb, not an exact vector-diffraction result."
        },
        {
          type: "eq",
          latex: String.raw`\mathrm{NA}=n_m\sin\theta,\qquad w_0\approx\frac{0.61\,\lambda_0}{\mathrm{NA}}`,
          number: "4",
          note: "The 0.61 factor is the Airy-disc half-width convention. Different texts absorb different prefactors; what matters is the inverse scaling with NA."
        },
        {
          type: "table",
          caption: "Nominal waist at 1064 nm for several objectives (0.61 λ/NA)",
          head: ["NA", "w₀ (µm)", "z_R in water (µm)", "Comment"],
          rows: [
            ["0.4", "1.62", "10.5", "Long working distance; weak axial gradient"],
            ["0.8", "0.81", "2.6", "Usable for larger beads; still not a tight trap"],
            ["1.2", "0.54", "1.15", "Water/oil immersion territory"],
            ["1.4", "0.46", "0.84", "Oil immersion; aberration control is critical"]
          ],
          align: ["r", "r", "r", "l"]
        },
        {
          type: "callout",
          tone: "note",
          title: "The paraxial model stops being quantitative",
          body:
            "For NA above roughly 0.7 the paraxial Gaussian is no longer an accurate description of the focal field. Vector Debye theory or a full electromagnetic solver is needed. The simulation deliberately stays with the paraxial model and flags the approximation, because the goal is to expose the force balance, not to predict a real trap to within 10%."
        }
      ]
    },
    {
      id: "momentum-and-radiation-pressure",
      number: "4",
      title: "Momentum, radiation pressure and the two forces",
      blocks: [
        {
          type: "p",
          text: "A photon of angular frequency ω carries momentum ħk = h/λ in the propagation direction. A beam of power P delivers momentum at a rate P/c. If the light is absorbed, the force on the absorber is P/c; if it is perfectly reflected back, the momentum change is twice as large and the force is 2P/c. For 100 mW these are 0.33 nN and 0.67 nN — the same order as the forces that hold a bead in a trap."
        },
        {
          type: "table",
          caption: "Three ways to think about the same momentum transfer",
          head: ["Process", "Momentum change", "Force scale for 100 mW", "Relevance"],
          rows: [
            ["Absorption", "one photon momentum", "P/c ≈ 0.33 nN", "Heating and photodamage"],
            ["Specular reflection", "two photon momenta", "2P/c ≈ 0.67 nN", "Radiation-pressure push"],
            ["Off-axis scattering by a transparent sphere", "direction changed, magnitude nearly conserved", "depends on angle", "Gradient force from redirected rays"]
          ]
        },
        {
          type: "p",
          text: "For a transparent particle the interesting effect is not absorption but redirection. Rays crossing a dielectric sphere are refracted, and the change in their momentum direction is balanced by a force on the sphere. When the intensity is non-uniform, the redirection is asymmetric and the net force has a component toward the brighter region. That is the gradient force. The component along the beam, from the light that leaves the trap with forward momentum, is the scattering force."
        },
        {
          type: "callout",
          tone: "principle",
          title: "The trap is a potential well made of light",
          body:
            "The conservative part of the optical force can be written as minus the gradient of a potential proportional to intensity. The particle sits at the bottom of that well. The scattering force is non-conservative: it tilts the well downstream and, if it is large enough, removes the minimum altogether."
        },
        {
          type: "p",
          text: "In a medium the bookkeeping of momentum is subtler (the Abraham–Minkowski question), but the measurable force on a sphere is not ambiguous: it follows from the Maxwell stress tensor. For this experiment the practical statement is enough: optical forces are of order pN for milliwatt-to-watt beams focused to micrometre spots, and they compete directly with Stokes drag and Brownian motion."
        }
      ]
    },
    {
      id: "gradient-force-section",
      number: "5",
      title: "The gradient force",
      blocks: [
        {
          type: "p",
          text: "The gradient force is proportional to the gradient of the intensity and to the excess polarisability of the particle relative to the medium. For a small sphere it is conveniently written with the Clausius–Mossotti factor K and the radius a."
        },
        {
          type: "eq",
          latex: String.raw`\mathbf{F}_{\mathrm{grad}}=\frac{2\pi n_m a^3}{c}\,K\,\nabla I,\qquad K=\frac{m^2-1}{m^2+2},\quad m=\frac{n_p}{n_m}`,
          number: "5",
          note: "Valid in the Rayleigh regime a ≪ λ_m. The force points up the intensity gradient when K > 0, i.e. when the particle has the higher refractive index."
        },
        {
          type: "eq",
          latex: String.raw`\alpha=4\pi\epsilon_0 n_m^2 a^3\,\frac{m^2-1}{m^2+2},\qquad \mathbf{F}_{\mathrm{grad}}=\frac{\alpha}{2n_m\epsilon_0 c}\nabla I`,
          number: "7",
          note: "The n_m² factor makes the two forms equivalent. The compact form in Eq. (5) is the one used in the simulation."
        },
        {
          type: "p",
          text: "Because K changes sign with the index contrast, so does the force. A hollow or low-index particle (n_p < n_m) is pushed toward the dark, not the bright. This is not a failure of the theory; it is a useful check that a real trap is not simply 'light pushes everything toward the focus'."
        },
        {
          type: "numeric",
          title: "How hard does the focus pull?",
          statement:
            "For a 0.4 µm diameter silica sphere (a = 0.2 µm, n_p = 1.45) in water at 1064 nm, with P = 150 mW and w₀ = 0.46 µm, estimate the maximum inward gradient force.",
          latex: String.raw`F_{\mathrm{grad,max}}=\frac{2\pi n_m a^3K}{c}\frac{2I_0}{w_0}e^{-1/2}`,
          result:
            "K ≈ 0.059, I₀ ≈ 4.4 × 10¹¹ W/m² and F_grad,max ≈ 1.5 × 10⁻¹¹ N ≈ 15 pN. The scattering force for the same parameters is about 14 pN, so the escape margin is only of order 1 pN. This is why the Rayleigh model is a warning as much as a prediction."
        },
        { type: "derivation", derivationId: "gradient-harmonic" },
        {
          type: "callout",
          tone: "misconception",
          title: "The gradient force is not a photon 'hitting' the bead",
          body:
            "In the ray picture the force comes from refraction: rays are bent by the sphere and the sphere recoils. In the wave picture it comes from the induced dipole interacting with a non-uniform field. Both descriptions are approximations to the same Maxwell stress. Do not add a separate 'pushing force from photons hitting the front face' on top of the gradient force; that double-counts the same momentum transfer."
        }
      ]
    },
    {
      id: "scattering-force-section",
      number: "6",
      title: "The scattering force",
      blocks: [
        {
          type: "p",
          text: "The scattering force arises because light that leaves the particle has, on average, a forward momentum component. It points along the propagation direction and is proportional to the local intensity and to the scattering cross-section."
        },
        {
          type: "eq",
          latex: String.raw`F_{\mathrm{scat}}=\frac{n_m\sigma I}{c},\qquad \sigma=\frac{128\pi^5a^6}{3\lambda_m^4}\left(\frac{m^2-1}{m^2+2}\right)^2`,
          number: "6",
          note: "λ_m = λ₀/n_m. The a⁶ dependence is the signature of Rayleigh scattering: halving the radius reduces the scattering force by a factor of 64."
        },
        {
          type: "p",
          text: "The strong size dependence explains a practical trade-off. Small particles scatter weakly and are easy to trap, but they are hard to see and their Brownian motion is large. Large particles are easy to see but scatter strongly and move into the ray-optics regime, where the Rayleigh formula no longer applies. The best bead is the one that is just large enough to track and small enough for the gradient to win."
        },
        {
          type: "table",
          caption: "Gradient versus scattering",
          head: ["Property", "Gradient force", "Scattering force"],
          rows: [
            ["Direction", "toward the intensity maximum", "along the beam"],
            ["Scaling with intensity", "∇I", "I"],
            ["Scaling with radius", "a³", "a⁶"],
            ["Sign for n_p > n_m", "inward, trapping", "forward, destabilising"],
            ["Conservative?", "yes, from a potential", "no"],
            ["Role", "creates the trap", "tilts and can destroy it"]
          ]
        },
        {
          type: "p",
          text: "Because the gradient force falls off away from the focus while the scattering force stays on the optical axis, the stable trapping point is displaced slightly downstream of the geometric focus. The particle sits where the axial gradient just balances the scattering push. Removing the scattering term would put the equilibrium exactly at the focus; retaining it is what makes the trap a three-dimensional balance rather than a simple minimum of intensity."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Scattering is also heating",
          body:
            "The same absorption and scattering that produce the force deposit energy in the sample. A trap that is only marginally stable is often run at a power where heating and photodamage are already significant. Stability and sample health must be optimised together, not sequentially."
        }
      ]
    },
    {
      id: "trapping-regimes",
      number: "7",
      title: "Rayleigh, ray optics and the regime in between",
      blocks: [
        {
          type: "p",
          text: "The point-dipole formulas above assume a ≪ λ_m. When the particle is comparable to or larger than the wavelength, the field is no longer approximately uniform across the sphere and the dipole picture fails. For a ≫ λ_m the ray-optics picture becomes accurate: the sphere acts as a lens, and the net force is the vector sum of the momentum changes of many refracted rays."
        },
        {
          type: "table",
          caption: "Three regimes, one experiment",
          head: ["Regime", "Condition", "Force model", "What the simulation does"],
          rows: [
            ["Rayleigh", "a ≪ λ_m", "induced dipole; F ∝ a³∇I", "implemented"],
            ["Ray optics / Mie", "a ≳ λ_m", "ray tracing or Mie/GLMT; resonances possible", "not implemented; warning shown"],
            ["Geometric limit", "a ≫ λ_m", "ray optics with Fresnel coefficients", "not implemented"]
          ]
        },
        {
          type: "p",
          text: "The ray picture is worth understanding even when the simulation does not use it. A high-NA objective delivers rays over a wide cone. Rays that pass through the centre of the sphere are deflected less than rays near the edge, so the momentum transfer is asymmetric. The net result is a force toward the focus for a high-index sphere, with a forward component from the unscattered light. This is why high NA matters: a narrow cone produces weak asymmetry and a weak axial gradient."
        },
        {
          type: "p",
          text: "For particles of a few micrometres, Mie scattering and interference resonances can make the force oscillate with size and wavelength. A calibration performed on one bead size does not transfer naively to another. This is one of the reasons a real tweezers measurement reports the bead specification together with the stiffness."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "Do not use the Rayleigh formula for a 2 µm bead",
          body:
            "The a⁶ scattering and a³ gradient scalings are asymptotic results. Applying them to a particle larger than the wavelength produces numbers that look precise but are physically meaningless. The simulation therefore displays a size-parameter warning whenever a/λ_m is not small, and its quantitative readouts should then be read as trends only."
        }
      ]
    },
    {
      id: "three-dimensional-stability",
      number: "8",
      title: "Stability in three dimensions",
      blocks: [
        {
          type: "p",
          text: "A single-beam trap is stable only if the restoring force exceeds the scattering push everywhere the particle might wander, and if the axial curvature is positive. In the transverse direction the Gaussian profile provides a strong gradient. In the axial direction the intensity varies more slowly, so the axial gradient is weaker and the scattering force acts in the same direction as the displacement. The axial direction is therefore the hard one."
        },
        {
          type: "p",
          text: "A useful stability criterion compares the largest inward gradient force with the on-axis scattering force. If the maximum gradient cannot balance scattering, no equilibrium exists and the particle is pushed through the focus and away."
        },
        {
          type: "eq",
          latex: String.raw`F_{\mathrm{esc}}=F_{\mathrm{grad,max}}-F_{\mathrm{scat}},\qquad \text{stable single-beam trap}\iff F_{\mathrm{esc}}>0`,
          number: "10",
          note: "This is a necessary condition in the axial direction, not a sufficient one. Aberrations, drift and finite temperature can still destroy a marginal trap."
        },
        {
          type: "table",
          caption: "What improves or degrades single-beam stability",
          head: ["Change", "Effect on gradient", "Effect on scattering", "Net stability"],
          rows: [
            ["Higher NA / smaller w₀", "strongly increases", "increases weakly", "better"],
            ["Higher power", "linear increase", "linear increase", "margin improves only if gradient > scattering"],
            ["Larger particle", "grows as a³", "grows as a⁶", "worse in the Rayleigh regime"],
            ["Higher particle index", "increases", "increases as K²", "improves while K is small"],
            ["More viscosity", "no change", "no change", "slower escape, same force balance"],
            ["Spherical aberration", "reduces peak gradient", "roughly unchanged", "worse"]
          ]
        },
        {
          type: "p",
          text: "In practice the axial stiffness is smaller than the transverse stiffness, often by a factor of a few. A bead can look firmly trapped in the camera plane while sliding along the beam. Tests must therefore include an axial perturbation: translate the stage along z, or apply a known flow, and watch whether the bead returns."
        },
        {
          type: "callout",
          tone: "caution",
          title: "A trap that looks stable may be sticking",
          body:
            "A bead adhered to the coverslip also sits still. Distinguish the two by translating the stage: a trapped bead follows the focus and can be displaced from the glass surface, while a stuck bead stays with the glass. Reducing power is another test: a stuck bead remains, a trapped bead diffuses away."
        }
      ]
    },
    {
      id: "trap-potential-section",
      number: "9",
      title: "The trap as a potential well",
      blocks: [
        {
          type: "p",
          text: "Near the focus the conservative part of the optical force is harmonic. The corresponding potential is a parabola whose depth is proportional to the peak intensity and therefore to the laser power. Expressing that depth in units of k_B T connects the optics to the thermal kicks that the particle constantly receives."
        },
        {
          type: "eq",
          latex: String.raw`U(r)=-\frac{2\pi n_m a^3}{c}K\,I(r),\qquad \Delta U=\frac{2\pi n_m a^3}{c}K\,I_0,\qquad \frac{\Delta U}{k_BT}=\frac{\Delta U}{4.14\times10^{-21}\ \mathrm{J}}`,
          number: "9",
          note: "At T = 300 K, 1 k_B T = 4.14 × 10⁻²¹ J. The depth is measured from the focus to the intensity-zero asymptote."
        },
        {
          type: "p",
          text: "A depth of at least about 10 k_B T is a common rule of thumb for a trap that holds a particle for seconds against modest perturbations. Shallower traps are visibly intermittent: the bead escapes, is recaptured, and the position histogram develops non-Gaussian tails. Much deeper traps are easy to keep but deliver more power to the sample."
        },
        {
          type: "numeric",
          title: "Depth of the model trap",
          statement:
            "Using the 0.4 µm silica sphere, 150 mW and w₀ = 0.46 µm from the previous example, estimate ΔU/k_B T at 298 K.",
          latex: String.raw`\Delta U=\frac{2\pi n_m a^3K}{c}I_0`,
          result:
            "ΔU ≈ 5.8 × 10⁻¹⁸ J, or about 1.4 × 10³ k_B T. This is very deep. The number is dominated by the Rayleigh approximation being used at a ≈ λ_m/4; a real high-NA trap of the same bead is typically far shallower than this estimate. Treat the value as an upper-bound-style model output, not a measurement."
        },
        {
          type: "p",
          text: "The potential picture also explains escape. Adding a constant external force F_ext tilts the well, U_total = U_opt − F_ext x. The minimum moves downstream and the barrier on the upstream side shrinks. When the tilt exceeds the barrier, the particle has no bound state and escapes. The force at which this happens is the escape force."
        },
        {
          type: "callout",
          tone: "lab",
          title: "Depth is not directly observable",
          body:
            "You cannot read the potential depth from a camera image. You infer it from a model plus a force measurement, or you measure the escape force and compare it with a model of the well. The simulation displays a depth because it knows the potential it integrated; a real experiment does not have that luxury."
        }
      ]
    },
    {
      id: "brownian-motion",
      number: "10",
      title: "Brownian motion in a harmonic trap",
      blocks: [
        {
          type: "p",
          text: "A micrometre-scale bead in water is never still. Molecular collisions produce a rapidly fluctuating force whose statistics are set by the fluctuation–dissipation theorem. In the overdamped limit the bead's velocity is proportional to the instantaneous force, and its position performs an Ornstein–Uhlenbeck process in the trap."
        },
        {
          type: "eq",
          latex: String.raw`\gamma=6\pi\eta a,\qquad D=\frac{k_BT}{\gamma},\qquad \gamma\dot{x}=-kx+F_{\mathrm{ext}}+\xi(t)`,
          number: "11",
          note: "γ is the Stokes drag coefficient, D the diffusion coefficient and ξ a zero-mean Gaussian noise with ⟨ξ(t)ξ(t′)⟩ = 2γk_BT δ(t−t′)."
        },
        {
          type: "p",
          text: "The trap introduces a restoring force −kx. The competition between restoring and random forces sets a characteristic time τ = γ/k = 1/(2πf_c) and a characteristic displacement σ = √(k_BT/k). For the model parameters used above, γ ≈ 3.8 × 10⁻⁹ N s/m, D ≈ 1.1 µm²/s, σ ≈ 6 nm and τ ≈ 35 µs."
        },
        {
          type: "table",
          caption: "Three time scales in a tweezer measurement",
          head: ["Process", "Order of magnitude", "Consequence"],
          rows: [
            ["Momentum relaxation, m/γ", "≈ 20 ns for a 0.4 µm silica bead", "Overdamped description is excellent"],
            ["Trap relaxation, γ/k", "≈ 35 µs for k ≈ 1 × 10⁻⁴ N/m", "Need ≫ 100 kHz sampling for the full PSD"],
            ["Camera exposure / frame", "≈ 0.1–10 ms", "Video tracking sees a filtered, aliased trajectory"]
          ]
        },
        {
          type: "p",
          text: "The overdamped Langevin equation is the bridge between the optical model and the data. The simulation integrates it with a seeded Euler–Maruyama scheme. At each step the deterministic force is −kx plus any external force, and a Gaussian kick of variance 2D dt is added. The step must be much shorter than the trap relaxation time; otherwise the discrete trajectory has the right variance but the wrong spectrum."
        },
        {
          type: "callout",
          tone: "note",
          title: "The model's stochastic assumptions",
          body:
            "The noise is white, Gaussian and isotropic, the drag is the infinite-medium Stokes value, and there are no wall corrections, no hydrodynamic memory and no heating. A real bead near a coverslip experiences a larger drag and a position-dependent mobility. The simulation reproduces the statistics of an ideal trap, not the artefacts of a real one."
        }
      ]
    },
    {
      id: "equipartition-calibration",
      number: "11",
      title: "Calibration I — equipartition",
      blocks: [
        {
          type: "p",
          text: "The simplest stiffness calibration uses only the variance of the position. In thermal equilibrium the probability of finding the particle at x is proportional to exp(−U(x)/k_BT). For a harmonic well this is a Gaussian whose variance is k_BT/k. Measure the variance, divide, and you have k."
        },
        {
          type: "eq",
          latex: String.raw`\langle x^2\rangle=\frac{k_BT}{k},\qquad k=\frac{k_BT}{\langle x^2\rangle}`,
          number: "12",
          note: "One dimension only. For an isotropic transverse trap, ⟨x²⟩ = ⟨y²⟩ = k_BT/k; do not add the two variances unless you also adjust the estimator."
        },
        { type: "derivation", derivationId: "equipartition-derivation" },
        {
          type: "p",
          text: "The method is attractive because it needs no drag coefficient, no viscosity and no frequency calibration. It is also fragile. Any slow drift adds a low-frequency offset that inflates the variance and therefore underestimates k. Any electronic or video filtering removes high-frequency motion, which also changes the variance. The estimator is only as good as the stationarity and bandwidth of the record."
        },
        {
          type: "numeric",
          title: "What variance corresponds to a typical stiffness?",
          statement: "A trap has k = 1.0 × 10⁻⁴ N/m at T = 298 K. What is the rms displacement?",
          latex: String.raw`\sigma_x=\sqrt{\frac{k_BT}{k}}`,
          result:
            "σ_x ≈ 6.4 nm. A 6 nm rms motion is far below the optical resolution of a simple camera; a quadrant photodiode or interferometric detection is needed for a precise variance measurement."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Drift masquerades as temperature",
          body:
            "A 50 nm slow drift across a 10 s record can double the apparent variance of a 6 nm trap. Always high-pass the record above the drift band, or detrend it, and report the bandwidth used. Removing real low-frequency motion biases k upward; removing drift biases it downward. There is no free lunch."
        },
        {
          type: "callout",
          tone: "note",
          title: "Cross-check with the histogram",
          body:
            "Plot the position histogram on the same axes as a Gaussian with variance k_BT/k. A heavy-tailed or skewed histogram is a warning that the trap is not harmonic, the particle is sticking, or the record contains drift. The variance alone would hide all three."
        }
      ]
    },
    {
      id: "psd-calibration",
      number: "12",
      title: "Calibration II — power spectral density",
      blocks: [
        {
          type: "p",
          text: "The power spectral density separates the motion by frequency. A trapped Brownian particle has a Lorentzian spectrum: a flat plateau at low frequency, a corner at f_c = k/(2πγ), and a 1/f² roll-off above it. The corner frequency depends on both stiffness and drag, so the PSD route requires a known viscosity and radius — but it is far less sensitive to slow drift than the variance route."
        },
        {
          type: "eq",
          latex: String.raw`S_x(f)=\frac{4k_BT\gamma}{\gamma^2(2\pi)^2\left(f^2+f_c^2\right)},\qquad f_c=\frac{k}{2\pi\gamma}`,
          number: "13",
          note: "One-sided PSD in m²/Hz. The plateau is S(0) = 4k_BTγ/k²; the integral over all positive frequencies is k_BT/k, the variance."
        },
        { type: "derivation", derivationId: "psd-corner" },
        {
          type: "p",
          text: "On a log–log plot the plateau and the roll-off are both straight, and the corner is where they meet. A fit of the full Lorentzian uses all the data and is more robust than reading the half-power point by eye. The fit must exclude frequencies where the detector noise floor or aliasing dominates, and it must not extend beyond the calibrated bandwidth of the position detector."
        },
        {
          type: "table",
          caption: "Two calibration routes",
          head: ["Property", "Equipartition", "PSD / corner frequency"],
          rows: [
            ["Needs drag coefficient", "no", "yes"],
            ["Sensitive to drift", "strongly", "weakly, if low frequencies are excluded"],
            ["Needs long record", "moderately", "yes, for low-frequency resolution"],
            ["Detector bandwidth", "must capture all motion", "must be known and flat over the fit band"],
            ["Best for", "quick checks, stiff traps", "careful work, soft traps, video data"]
          ]
        },
        {
          type: "callout",
          tone: "misconception",
          title: "The Lorentzian has no peak at f_c",
          body:
            "The maximum of a Lorentzian is at zero frequency, not at the corner. The corner is the half-power point. A plot of f·S(f) does peak near f_c and is sometimes used to display the knee, but the raw PSD itself decreases monotonically."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Sampling and anti-aliasing",
          body:
            "A camera sampled at 100 Hz cannot see a 3 kHz corner. The measured spectrum will be aliased and the fitted corner meaningless. Use a detector and sample rate at least several times f_c, and apply an anti-aliasing filter before digitising."
        }
      ]
    },
    {
      id: "drag-and-escape",
      number: "13",
      title: "Drag, flow and the escape force",
      blocks: [
        {
          type: "p",
          text: "A trapped bead can also be calibrated by dragging it through the fluid at a known velocity. At low Reynolds number the drag is linear in velocity, F = γv, with γ = 6πηa for a sphere far from boundaries. The displacement of the bead from the trap centre is then a direct force readout: x = F/k."
        },
        {
          type: "p",
          text: "The same relation sets the escape force. Increase the flow (or the stage velocity) until the bead can no longer return to the focus. The largest force the trap can exert is the maximum of the gradient force minus the scattering force. Beyond that, the particle is swept away."
        },
        {
          type: "numeric",
          title: "How fast a flow can the model trap hold?",
          statement:
            "Take F_esc ≈ 1.5 pN for the 0.4 µm silica bead example and η = 1.0 mPa·s. What fluid velocity would produce that drag?",
          latex: String.raw`v=\frac{F_{\mathrm{esc}}}{6\pi\eta a}`,
          result:
            "v ≈ (1.5 × 10⁻¹²)/(3.8 × 10⁻⁹) ≈ 4 × 10⁻⁴ m/s ≈ 0.4 mm/s. This is a generous estimate because the drag near a coverslip is larger than the infinite-medium value and because the escape force itself is uncertain."
        },
        {
          type: "p",
          text: "Real beads are not isolated spheres in an infinite fluid. Within a few radii of the coverslip, the drag increases and becomes direction-dependent (Faxén corrections). A bead close to the surface also experiences an optical interaction with its image and can stick. These effects are deliberately absent from the simulation; they are a leading source of discrepancy in a real calibration."
        },
        {
          type: "callout",
          tone: "lab",
          title: "The force–displacement curve is the honest measurement",
          body:
            "Plot the restoring force against displacement over several trap widths. The slope near zero is k; the turnover is where the gradient stops growing; the zero-crossing beyond it is the escape point. A single variance number hides all of this structure."
        }
      ]
    },
    {
      id: "apparatus-safety",
      number: "14",
      title: "Apparatus, photodamage and the error budget",
      blocks: [
        {
          type: "p",
          text: "The optical train is short but each element has a job. The laser is expanded to overfill the objective back aperture so that the full NA is used. A dichroic sends the trapping beam into the objective while transmitting the visible illumination to the camera. The objective focuses the beam into a sealed sample chamber on a stable stage. A tube lens forms the image, and a band-pass filter removes the trapping light before the camera."
        },
        { type: "diagram", kind: "tweezers", caption: "Figure 8.2 — Single-beam trapping layout: beam expander, dichroic, high-NA objective, sample stage and camera. The alignment beam is shown separately in the procedure." },
        {
          type: "list",
          ordered: true,
          items: [
            "Source: a stable, single-mode near-infrared laser with a clean beam and a shutter.",
            "Beam conditioning: an expander that fills the objective back aperture without clipping; an iris marks the axis.",
            "Steering: two kinematic mirrors set the beam height and centre it on the objective.",
            "Dichroic: reflects the trap wavelength and transmits the illumination band; verify its edge and its damage threshold.",
            "Objective: high NA, corrected for the coverslip thickness, clean and free of oil on the wrong surfaces.",
            "Sample: dilute beads in a sealed chamber, at a depth where spherical aberration is tolerable.",
            "Detection: camera for alignment and coarse tracking; quadrant photodiode or interferometric detector for calibrated position.",
            "Safety: beam blocks on every unused port, a shutter at the bench, and eyewear rated for the actual wavelength."
          ]
        },
        { type: "diagram", kind: "optical-table", caption: "Figure 8.3 — Optical-table discipline: beam height, clamped posts, a translation stage with readable scale and a beam block at the end of every path." },
        {
          type: "h",
          text: "Heating and photodamage"
        },
        {
          type: "p",
          text: "Water absorbs very little at 1064 nm, which is why the wavelength is popular for biological samples. That does not make the focus harmless. The sample may contain dyes, proteins or oil with appreciable absorption; the high intensity can drive two-photon processes; and a trapped bead can act as a local absorber. Temperature rises of a few kelvin are enough to change viscosity, denature proteins or kill a cell."
        },
        {
          type: "p",
          text: "Keep the time-averaged power and the exposure time as low as the measurement allows. Use a shutter for idle periods, check the sample after trapping, and compare a trapped region with an untrapped control. If the trap only works at a power where the sample visibly deteriorates, the experiment is not viable — no calibration can rescue it."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Invisible light is still light",
          body:
            "1064 nm is invisible and can pass through the eye to the retina. Never look into the beam path, never rely on a visible alignment beam to prove the IR is blocked, and never wear eyewear rated only for the visible laser. Remove watches, rings and reflective jewellery before aligning. Close the shutter before changing any optic."
        },
        {
          type: "h",
          text: "Sources of error"
        },
        {
          type: "table",
          caption: "Error budget for a teaching trap",
          head: ["Source", "Type", "Effect", "Mitigation"],
          rows: [
            ["Stage and thermal drift", "systematic", "inflates variance, biases the PSD at low f", "wait for equilibrium; detrend; short records; stable table"],
            ["Viscous heating", "systematic", "lowers viscosity near the focus, changing f_c and D", "low power; measure temperature; vary power and look for drift"],
            ["Spherical aberration", "systematic", "reduces peak gradient and axial stiffness", "correct coverslip; minimise depth; use the specified immersion"],
            ["Particle sticking", "systematic", "adds a fixed offset and a spurious spring", "translate the stage; reduce power; fresh dilute sample"],
            ["Detector / camera calibration", "systematic", "wrong nm per pixel or wrong QPD gain", "calibrate with a stage or a known displacement"],
            ["Laser power drift", "random / systematic", "changes k during a run", "monitor a pick-off; allow warm-up; normalise"],
            ["Non-Rayleigh particle", "systematic / model", "Rayleigh formulas give the wrong size scaling", "record a/λ; use Mie/ray-optics or a smaller bead"]
          ]
        },
        {
          type: "callout",
          tone: "lab",
          title: "Alignment order that saves time",
          body:
            "Align the visible beam through the objective first, confirm the focus and the camera parfocality, then bring in the IR at low power and steer it onto the same focus. Never start by maximising IR power through an unverified path; a misaligned high-power beam is a hazard and a wasted afternoon."
        }
      ]
    }
  ],
  equations: [
    {
      id: "beam-radius",
      latex: String.raw`w(z)=w_0\sqrt{1+\left(\frac{z}{z_R}\right)^2}`,
      name: "Gaussian beam radius",
      symbols: [
        { symbol: "w(z)", meaning: "1/e² intensity radius at axial position z", unit: "m" },
        { symbol: "w_0", meaning: "waist radius at the focus", unit: "m" },
        { symbol: "z", meaning: "axial distance from the waist", unit: "m" },
        { symbol: "z_R", meaning: "Rayleigh range", unit: "m" }
      ],
      interpretation:
        "The beam is narrowest at the waist and widens hyperbolically. At z = z_R the area has doubled and the on-axis intensity has halved.",
      assumptions: ["Paraxial TEM₀₀ beam", "Homogeneous medium", "No aberrations or clipping"],
      usedIn: ["Beam map", "Force calculation", "Focal volume estimate"]
    },
    {
      id: "rayleigh-range",
      latex: String.raw`z_R=\frac{\pi w_0^2 n_m}{\lambda_0}`,
      name: "Rayleigh range",
      symbols: [
        { symbol: "n_m", meaning: "refractive index of the medium", unit: "dimensionless" },
        { symbol: "\\lambda_0", meaning: "vacuum wavelength", unit: "m" }
      ],
      interpretation:
        "The axial scale of the focus. A tighter waist shortens the Rayleigh range quadratically, which is why high NA improves transverse confinement at the cost of axial working distance.",
      assumptions: ["Paraxial Gaussian beam", "Negligible aberration"],
      usedIn: ["Focal volume", "Trap depth", "Beam map"],
      numericExample: { statement: "w₀ = 0.5 µm, n_m = 1.33, λ₀ = 1064 nm gives z_R ≈ 0.98 µm" }
    },
    {
      id: "gaussian-intensity",
      latex: String.raw`I(r,z)=\frac{2P}{\pi w(z)^2}\exp\!\left(-\frac{2r^2}{w(z)^2}\right)`,
      name: "Gaussian intensity distribution",
      symbols: [
        { symbol: "I", meaning: "intensity (power per unit area)", unit: "W m⁻²" },
        { symbol: "P", meaning: "beam power", unit: "W" },
        { symbol: "r", meaning: "radial distance from the axis", unit: "m" }
      ],
      interpretation:
        "The peak on axis is 2P/(πw²); the total power is obtained by integrating 2πrI(r) dr over the plane.",
      assumptions: ["TEM₀₀", "Paraxial", "Lossless medium", "Steady power"],
      usedIn: ["Force model", "Beam map", "Radial profile"],
      numericExample: { statement: "P = 100 mW, w₀ = 0.5 µm gives I₀ ≈ 2.5 × 10¹¹ W/m² = 25 MW/cm²" }
    },
    {
      id: "numerical-aperture",
      latex: String.raw`\mathrm{NA}=n_m\sin\theta,\qquad w_0\approx\frac{0.61\,\lambda_0}{\mathrm{NA}}`,
      name: "Numerical aperture and diffraction-limited waist",
      symbols: [
        { symbol: "\\theta", meaning: "half-angle of the focusing cone", unit: "rad" },
        { symbol: "\\mathrm{NA}", meaning: "numerical aperture", unit: "dimensionless" }
      ],
      interpretation:
        "A larger NA accepts a wider cone and produces a smaller focal spot. The 0.61 prefactor is the Airy half-width convention; it is an approximation to the vector focal field.",
      assumptions: ["Diffraction-limited objective", "Uniform illumination of the pupil", "Small aberration"],
      usedIn: ["Waist–NA link", "Spot-size estimate"]
    },
    {
      id: "gradient-force",
      latex: String.raw`\mathbf{F}_{\mathrm{grad}}=\frac{2\pi n_m a^3}{c}\frac{m^2-1}{m^2+2}\nabla I`,
      name: "Gradient force (Rayleigh sphere)",
      symbols: [
        { symbol: "a", meaning: "sphere radius", unit: "m" },
        { symbol: "c", meaning: "speed of light in vacuum", unit: "m s⁻¹" },
        { symbol: "m", meaning: "relative refractive index n_p/n_m", unit: "dimensionless" },
        { symbol: "\\nabla I", meaning: "intensity gradient", unit: "W m⁻³" }
      ],
      interpretation:
        "The force points toward increasing intensity when n_p > n_m, and away from it when n_p < n_m. It scales with particle volume.",
      assumptions: ["a ≪ λ_m", "Uniform internal field (dipole approximation)", "No saturation", "Non-absorbing sphere"],
      usedIn: ["Trap stiffness", "Potential", "Stability"],
      numericExample: { statement: "a = 0.2 µm, K = 0.059, I₀ = 4.4 × 10¹¹ W/m², w₀ = 0.46 µm gives F_grad,max ≈ 15 pN" }
    },
    {
      id: "scattering-force",
      latex: String.raw`F_{\mathrm{scat}}=\frac{n_m\sigma I}{c},\qquad \sigma=\frac{128\pi^5a^6}{3\lambda_m^4}\left(\frac{m^2-1}{m^2+2}\right)^2`,
      name: "Scattering force and Rayleigh cross-section",
      symbols: [
        { symbol: "\\sigma", meaning: "scattering cross-section", unit: "m²" },
        { symbol: "\\lambda_m", meaning: "wavelength in the medium λ₀/n_m", unit: "m" }
      ],
      interpretation:
        "The scattering force is along the beam and grows as a⁶, so it overtakes the a³ gradient force as particles get larger.",
      assumptions: ["Rayleigh sphere", "Single scattering", "No interference with reflected light", "Isotropic medium"],
      usedIn: ["Stability criterion", "Escape force", "Heating discussion"]
    },
    {
      id: "polarizability",
      latex: String.raw`\alpha=4\pi\epsilon_0 n_m^2a^3\frac{m^2-1}{m^2+2},\qquad \mathbf{F}_{\mathrm{grad}}=\frac{\alpha}{2n_m\epsilon_0 c}\nabla I`,
      name: "Polarisability and Clausius–Mossotti factor",
      symbols: [
        { symbol: "\\alpha", meaning: "excess dipole polarisability referred to the medium", unit: "C m² V⁻¹" },
        { symbol: "\\epsilon_0", meaning: "vacuum permittivity", unit: "F m⁻¹" },
        { symbol: "K", meaning: "Clausius–Mossotti factor", unit: "dimensionless" }
      ],
      interpretation:
        "K encapsulates the index contrast. It changes sign at index matching, so the force reverses for a lower-index particle.",
      assumptions: ["Sphere small compared with λ_m", "Linear, isotropic dielectric", "No permanent dipole"],
      usedIn: ["Force model", "Sign check"]
    },
    {
      id: "stiffness",
      latex: String.raw`k=\frac{4AI_0}{w_0^2},\qquad A=\frac{2\pi n_ma^3K}{c},\qquad k=\frac{16\,n_ma^3KP}{c\,w_0^4}`,
      name: "Transverse trap stiffness",
      symbols: [
        { symbol: "k", meaning: "transverse stiffness of the harmonic trap", unit: "N m⁻¹" },
        { symbol: "A", meaning: "gradient-force coefficient", unit: "N m³ W⁻¹" }
      ],
      interpretation:
        "For a fixed peak intensity, k scales as 1/w₀². For a fixed total power, the peak intensity itself scales as 1/w₀², so k scales as P/w₀⁴. Both statements are used in the laboratory; state which one you mean.",
      assumptions: ["|x| ≪ w₀", "Rayleigh sphere", "Paraxial Gaussian", "No saturation"],
      usedIn: ["Brownian simulation", "Calibration comparison"],
      numericExample: { statement: "P = 150 mW, w₀ = 0.46 µm, a = 0.2 µm, K = 0.059 gives k ≈ 1.1 × 10⁻⁴ N/m" }
    },
    {
      id: "potential",
      latex: String.raw`U(r)=-\frac{2\pi n_ma^3}{c}K\,I(r),\qquad \Delta U=\frac{2\pi n_ma^3}{c}K\,I_0,\qquad \frac{\Delta U}{k_BT}\ \text{is the depth in thermal units}`,
      name: "Optical potential and trap depth",
      symbols: [
        { symbol: "U", meaning: "conservative optical potential energy", unit: "J" },
        { symbol: "\\Delta U", meaning: "depth from focus to zero intensity", unit: "J" },
        { symbol: "k_B", meaning: "Boltzmann constant", unit: "J K⁻¹" }
      ],
      interpretation:
        "The well depth grows linearly with power and particle volume. Depths of order 10 k_B T are marginal; hundreds of k_B T are firm.",
      assumptions: ["Conservative gradient force", "Harmonic near the bottom", "No scattering tilt"],
      usedIn: ["Depth readout", "Escape discussion"]
    },
    {
      id: "escape",
      latex: String.raw`F_{\mathrm{esc}}=F_{\mathrm{grad,max}}-F_{\mathrm{scat}},\qquad F_{\mathrm{grad,max}}=A\frac{2I_0}{w_0}e^{-1/2}`,
      name: "Escape force",
      symbols: [
        { symbol: "F_{\\mathrm{esc}}", meaning: "net force margin against scattering", unit: "N" },
        { symbol: "F_{\\mathrm{grad,max}}", meaning: "largest inward gradient force, at r = w₀/2", unit: "N" }
      ],
      interpretation:
        "A positive value is necessary for a single-beam trap. It is not sufficient: axial curvature, aberration and drift can still destabilise the particle.",
      assumptions: ["Transverse Gaussian profile", "Rayleigh sphere", "On-axis scattering", "No aberration"],
      usedIn: ["Stability readout", "Flow test"]
    },
    {
      id: "drag-diffusion",
      latex: String.raw`\gamma=6\pi\eta a,\qquad D=\frac{k_BT}{\gamma}`,
      name: "Stokes drag and diffusion",
      symbols: [
        { symbol: "\\gamma", meaning: "drag coefficient", unit: "N s m⁻¹" },
        { symbol: "\\eta", meaning: "dynamic viscosity", unit: "Pa s" },
        { symbol: "D", meaning: "diffusion coefficient", unit: "m² s⁻¹" }
      ],
      interpretation:
        "Drag grows linearly with radius and viscosity; diffusion is inversely proportional to both. The Einstein relation ties the random motion to the same dissipation.",
      assumptions: ["Sphere far from walls", "Low Reynolds number", "Newtonian fluid", "No slip"],
      usedIn: ["Corner frequency", "Brownian simulation", "Escape flow"],
      numericExample: { statement: "a = 0.2 µm, η = 1.0 mPa·s, T = 298 K gives γ ≈ 3.8 × 10⁻⁹ N s/m and D ≈ 1.1 µm²/s" }
    },
    {
      id: "equipartition",
      latex: String.raw`\langle x^2\rangle=\frac{k_BT}{k},\qquad k=\frac{k_BT}{\langle x^2\rangle}`,
      name: "Equipartition calibration",
      symbols: [
        { symbol: "\\langle x^2\\rangle", meaning: "position variance in one dimension", unit: "m²" },
        { symbol: "T", meaning: "absolute temperature", unit: "K" }
      ],
      interpretation:
        "The thermal spread is a thermometer for the trap: a softer trap has a larger variance. Drift, filtering and finite bandwidth all bias the estimate.",
      assumptions: ["Thermal equilibrium", "Harmonic potential", "Stationary record", "Detector captures the full bandwidth"],
      usedIn: ["Variance calibration", "Histogram check"]
    },
    {
      id: "psd",
      latex: String.raw`S_x(f)=\frac{4k_BT\gamma}{\gamma^2(2\pi)^2\left(f^2+f_c^2\right)},\qquad f_c=\frac{k}{2\pi\gamma}`,
      name: "Lorentzian power spectral density and corner frequency",
      symbols: [
        { symbol: "S_x(f)", meaning: "one-sided displacement PSD", unit: "m² Hz⁻¹" },
        { symbol: "f", meaning: "frequency", unit: "Hz" },
        { symbol: "f_c", meaning: "corner frequency", unit: "Hz" }
      ],
      interpretation:
        "The spectrum is flat below f_c and falls as 1/f² above it. Fitting the Lorentzian gives k once γ is known. The integral of S over positive frequencies is the variance.",
      assumptions: ["Overdamped harmonic trap", "White Gaussian noise", "Stationary run", "Detector bandwidth and anti-aliasing known"],
      usedIn: ["PSD calibration", "Simulation validation"]
    },
    {
      id: "boltzmann",
      latex: String.raw`p(x)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\left(-\frac{x^2}{2\sigma^2}\right),\qquad \sigma^2=\frac{k_BT}{k}`,
      name: "Boltzmann distribution in a harmonic well",
      symbols: [
        { symbol: "p(x)", meaning: "probability density of position", unit: "m⁻¹" },
        { symbol: "\\sigma", meaning: "standard deviation of the position", unit: "m" }
      ],
      interpretation:
        "The position histogram of a well-behaved trapped bead is Gaussian. Deviations reveal drift, sticking, anharmonicity or a non-thermal perturbation.",
      assumptions: ["Equilibrium", "Harmonic U", "One dimension", "No position-dependent detection bias"],
      usedIn: ["Histogram overlay", "Equipartition derivation"]
    }
  ],
  derivations: [
    {
      id: "gaussian-from-wave",
      title: "The Gaussian beam from the paraxial wave equation",
      intro:
        "This is the standard derivation, included to show where w₀, z_R and the Gaussian profile come from rather than treating them as definitions.",
      steps: [
        {
          label: "1. Start from a monochromatic wave",
          text: "Write the scalar field as E = ψ(r,z) exp(ikz), with k = n_m ω/c. The exact Helmholtz equation is (∇² + k²)E = 0.",
          latex: String.raw`\left(\nabla_\perp^2+\partial_z^2+2ik\partial_z\right)\psi=0`
        },
        {
          label: "2. Paraxial approximation",
          text: "Assume the envelope varies slowly along z compared with the optical wavelength, so |∂²ψ/∂z²| ≪ |2k ∂ψ/∂z|. Drop the second axial derivative.",
          latex: String.raw`\nabla_\perp^2\psi+2ik\,\partial_z\psi=0`
        },
        {
          label: "3. Try a Gaussian ansatz",
          text: "Let the transverse profile remain Gaussian with a complex radius q(z): ψ ∝ exp[−ik r²/(2q)]. Substituting gives dq/dz = 1, so q(z) = q₀ + z.",
          latex: String.raw`\psi(r,z)\propto\exp\!\left(-\frac{ikr^2}{2q(z)}\right)`
        },
        {
          label: "4. Separate real and imaginary parts",
          text: "Write 1/q = 1/R − iλ/(πw²n_m). The imaginary part gives the beam radius; the real part gives the wavefront curvature R(z).",
          latex: String.raw`\frac{1}{q}=\frac{1}{R}-\frac{i\lambda_0}{\pi w^2 n_m}`
        },
        {
          label: "5. Impose the waist condition",
          text: "At z = 0 the wavefront is flat (R → ∞), so q₀ = i z_R with z_R = πw₀²n_m/λ₀. Then q(z) = z + i z_R.",
          latex: String.raw`q_0=iz_R,\qquad z_R=\frac{\pi w_0^2 n_m}{\lambda_0}`
        },
        {
          label: "6. Read off w(z)",
          text: "Inverting 1/q and taking the imaginary part gives 1/w² = 1/w₀² · 1/(1+(z/z_R)²), hence w(z) = w₀√(1+(z/z_R)²). The on-axis amplitude falls as 1/w, and the Gouy phase appears in the real part.",
          latex: String.raw`w(z)=w_0\sqrt{1+\left(\frac{z}{z_R}\right)^2}`
        }
      ],
      result: {
        latex: String.raw`I(r,z)=\frac{2P}{\pi w(z)^2}e^{-2r^2/w(z)^2},\qquad z_R=\frac{\pi w_0^2n_m}{\lambda_0}`,
        text: "A paraxial Gaussian beam is the lowest-order solution. Its waist and Rayleigh range are not independent: fixing the waist fixes the axial scale and the far-field divergence."
      },
      assumptions: [
        "Scalar paraxial propagation",
        "Homogeneous, isotropic, non-absorbing medium",
        "No clipping or aberration",
        "The paraxial approximation fails for NA ≳ 0.7"
      ]
    },
    {
      id: "gradient-harmonic",
      title: "From the gradient force to a harmonic stiffness",
      intro:
        "The trap is only approximately a spring. This derivation makes the approximation explicit and shows why the stiffness depends on the intensity curvature at the focus.",
      steps: [
        {
          label: "1. Write the radial force",
          text: "Use the compact Rayleigh form F_r = A dI/dr with A = 2πn_m a³K/c. The sign is carried by dI/dr.",
          latex: String.raw`F_r=A\frac{dI}{dr}`
        },
        {
          label: "2. Insert the Gaussian profile at z = 0",
          text: "I(r) = I₀ exp(−2r²/w₀²). Differentiate.",
          latex: String.raw`\frac{dI}{dr}=-\frac{4I_0r}{w_0^2}\exp\!\left(-\frac{2r^2}{w_0^2}\right)`
        },
        {
          label: "3. Expand for small displacement",
          text: "For |r| ≪ w₀, exp(−2r²/w₀²) ≈ 1. The force becomes linear in r.",
          latex: String.raw`F_r\simeq-\frac{4AI_0}{w_0^2}\,r`
        },
        {
          label: "4. Identify the spring constant",
          text: "Comparing with F = −kr gives k = 4AI₀/w₀². Substitute A and I₀ = 2P/(πw₀²).",
          latex: String.raw`k=\frac{8\pi n_ma^3K}{c}\frac{I_0}{w_0^2}=\frac{16n_ma^3KP}{c\,w_0^4}`
        },
        {
          label: "5. Check the range",
          text: "The expansion is valid only while the force remains approximately linear, roughly |r| < 0.2w₀. Beyond that the force saturates and then decreases; a dragged bead leaves the harmonic region before it escapes."
        }
      ],
      result: {
        latex: String.raw`U(r)\simeq\frac{1}{2}kr^2,\qquad k=\frac{4AI_0}{w_0^2}`,
        text: "A small particle near the focus behaves as if attached to a spring. The stiffness is proportional to the peak intensity and inversely proportional to the square of the waist at fixed intensity."
      },
      assumptions: [
        "Rayleigh sphere (a ≪ λ_m)",
        "Paraxial Gaussian",
        "|r| ≪ w₀",
        "No saturation, aberration or scattering tilt"
      ]
    },
    {
      id: "equipartition-derivation",
      title: "Equipartition calibration",
      intro:
        "A one-line statistical-mechanics result that becomes the most common tweezers calibration. The derivation also shows exactly which experimental conditions it assumes.",
      steps: [
        {
          label: "1. Boltzmann weight",
          text: "At thermal equilibrium the probability density of a coordinate x is proportional to exp(−U(x)/k_BT).",
          latex: String.raw`p(x)\propto e^{-U(x)/k_BT}`
        },
        {
          label: "2. Harmonic potential",
          text: "Near the trap centre U = ½kx². The distribution is Gaussian.",
          latex: String.raw`p(x)=\frac{1}{\sqrt{2\pi k_BT/k}}\exp\!\left(-\frac{kx^2}{2k_BT}\right)`
        },
        {
          label: "3. Compute the variance",
          text: "For a Gaussian, ⟨x²⟩ equals its variance. Equivalently, apply the equipartition theorem to the quadratic degree of freedom: ½k⟨x²⟩ = ½k_BT.",
          latex: String.raw`\langle x^2\rangle=\frac{k_BT}{k}`
        },
        {
          label: "4. Invert for k",
          text: "The measured variance gives the stiffness directly. No drag coefficient is needed.",
          latex: String.raw`k=\frac{k_BT}{\langle x^2\rangle}`
        },
        {
          label: "5. Estimate the statistical uncertainty",
          text: "For N independent samples the relative uncertainty of the variance is √(2/N). Correlated samples reduce the effective N to roughly the record length divided by the correlation time, N_eff ≈ T/τ = 2πf_cT.",
          latex: String.raw`\frac{\delta k}{k}\approx\sqrt{\frac{2}{N_{\mathrm{eff}}}}`
        }
      ],
      result: {
        latex: String.raw`k=\frac{k_BT}{\langle x^2\rangle},\qquad \frac{\delta k}{k}\approx\sqrt{\frac{2}{N_{\mathrm{eff}}}}`,
        text: "Measure a stationary, drift-free position record with a known bandwidth, compute the variance in one dimension, and divide k_BT by it. Report the bandwidth and record length with the result."
      },
      assumptions: [
        "Thermal equilibrium and stationarity",
        "Harmonic potential over the sampled range",
        "No drift or slowly varying offset",
        "Detector linear and calibrated in displacement",
        "Full motional bandwidth captured (or the filtering quantified)"
      ]
    },
    {
      id: "psd-corner",
      title: "The Lorentzian spectrum and its corner frequency",
      intro:
        "The PSD route follows from the same Langevin equation as the trajectory. The algebra is short and explains both the plateau and the roll-off.",
      steps: [
        {
          label: "1. Start from the Langevin equation",
          text: "For a harmonic trap with white noise, γẋ = −kx + ξ(t), with ⟨ξ⟩ = 0 and ⟨ξ(t)ξ(t′)⟩ = 2γk_BT δ(t−t′).",
          latex: String.raw`\gamma\dot{x}+kx=\xi(t)`
        },
        {
          label: "2. Fourier transform",
          text: "With X(f) = ∫x(t)e^{−i2πft}dt and the noise transform Ξ(f), the equation becomes algebraic.",
          latex: String.raw`(k-i2\pi f\gamma)X(f)=\Xi(f)`
        },
        {
          label: "3. Form the power spectrum",
          text: "The noise is white, so ⟨|Ξ(f)|²⟩ = 2γk_BT. Multiply X by its conjugate and take the expectation.",
          latex: String.raw`S_x(f)=\frac{2\gamma k_BT}{k^2+(2\pi f\gamma)^2}`
        },
        {
          label: "4. Normalise and identify f_c",
          text: "The one-sided spectrum is twice the two-sided density. Define f_c = k/(2πγ) and rearrange.",
          latex: String.raw`S_x(f)=\frac{4k_BT\gamma}{\gamma^2(2\pi)^2(f^2+f_c^2)},\qquad f_c=\frac{k}{2\pi\gamma}`
        },
        {
          label: "5. Check the limits",
          text: "At f = 0, S = 4k_BTγ/k². For f ≫ f_c, S ∝ 1/f². At f = f_c the density is half the plateau. Integrating over positive f returns the variance k_BT/k.",
          latex: String.raw`\int_0^\infty S_x(f)\,df=\frac{k_BT}{k}`
        }
      ],
      result: {
        latex: String.raw`f_c=\frac{k}{2\pi\gamma},\qquad k=2\pi\gamma f_c`,
        text: "Fit the Lorentzian, read the corner, and multiply by 2πγ. The result depends on the viscosity and radius through γ, so those must be known independently."
      },
      assumptions: [
        "Overdamped harmonic trap",
        "White Gaussian thermal noise",
        "Stationary record longer than 1/f_c",
        "Sampling above the Nyquist frequency of the motion",
        "No detector filtering or aliasing inside the fit band"
      ]
    }
  ],
  simulation: {
    model:
      "A paraxial TEM₀₀ Gaussian beam of adjustable power, wavelength and waist is focused in a homogeneous medium. A homogeneous dielectric sphere is treated as a point dipole (Rayleigh regime): the gradient force is F = (2π n_m a³K/c)∇I and the scattering force is F = n_m σI/c with the Rayleigh cross-section. The optical potential is U = −(2π n_m a³K/c)I. The particle's transverse motion is integrated with a seeded overdamped Euler–Maruyama Langevin scheme in a harmonic trap, with optional constant external force. Trap stiffness, depth, escape force, diffusion coefficient, corner frequency, position variance, histogram and PSD are computed from the same parameters. A calibration panel runs additional seeded records and reports the variance-derived stiffness beside the model value; the CSV contains simulated rows.",
    approximations: [
      "Paraxial Gaussian beam; no vector Debye focusing, apodisation or polarisation effects.",
      "Point-dipole (Rayleigh) particle response, valid only for a ≪ λ_m.",
      "Homogeneous sphere and medium; no core–shell structure, absorption or nonlinear response.",
      "Infinite-medium Stokes drag; no wall, Faxén or hydrodynamic-memory corrections.",
      "No heating, convection, thermophoresis, spherical aberration or optical binding.",
      "One transverse dimension for the Brownian record; axial dynamics are not integrated.",
      "The NA–waist link uses w₀ ≈ 0.61λ/NA and is a rule of thumb, not a vector focal field."
    ],
    validity: [
      "The force model is quantitative only while a/λ_m is small (the interface warns above 0.1 and shows the ratio).",
      "The harmonic stiffness is a small-displacement approximation, roughly |x| < 0.2w₀.",
      "The Brownian statistics are stationary only when a positive stiffness exists and the external force is below the escape value.",
      "A single-beam stability check uses the transverse gradient maximum against on-axis scattering; it does not model the full 3D axial landscape.",
      "The optical and thermal properties of a real sample are not represented."
    ],
    exclusions: [
      "No claim that any listed hardware produces a stable trap.",
      "No claim that the displayed stiffness, depth or corner frequency is a measured value.",
      "No calibration of a real detector, camera, stage or power meter.",
      "No biological viability, heating or photodamage prediction.",
      "No Mie, ray-optics or vector-diffraction results for large particles or high NA."
    ],
    validation: [
      "Unit tests verify z_R = πw₀²n/λ, w(0) = w₀, and that the radial intensity integrates to the beam power.",
      "The gradient force changes sign with the index contrast and peaks at r = w₀/2.",
      "Stiffness is linear in power and follows the stated waist scaling at fixed intensity.",
      "A long seeded Langevin run reproduces the equipartition variance within statistical tolerance.",
      "The fitted Lorentzian corner is checked against the model corner frequency.",
      "Drag, diffusion and escape-force identities are tested algebraically."
    ],
    stochastic:
      "Brownian records use mulberry32 seeded by the seed field plus a run label. The same seed and parameters reproduce the same trace to machine precision. This generator is for teaching reproducibility, not cryptography."
  },
  procedure: [
    {
      id: "safety",
      title: "Safety and laser controls",
      purpose: "Establish the control measures before any beam exists on the table.",
      steps: [
        {
          title: "Identify the actual hazard",
          detail:
            "Read the laser label: wavelength, maximum power, Class and emission indicator. Confirm the 1064 nm beam is invisible and that the eyewear is rated for that wavelength and power. Ordinary visible-laser goggles are not a substitute.",
          checkpoint: "Eyewear marked for the source wavelength and OD; everyone at the bench wears it.",
          caution: "Never look into the beam path or use a phone camera as a beam viewer."
        },
        {
          title: "Set the default state",
          detail:
            "Mount the mechanical shutter in the beam path before the first optic. Wire its switch where the operator stands. Leave it closed except during an actual measurement.",
          checkpoint: "Shutter closed with the key/switch in the safe state."
        },
        {
          title: "Block every path",
          detail:
            "Place beam blocks at the end of every possible beam path, including the unused port of the dichroic and the camera port. Remove reflective jewellery and watches. Keep the beam below eye level and never bend down into the plane.",
          caution: "A stray specular reflection from a kinematic mount screw can be as hazardous as the main beam."
        },
        {
          title: "Agree the alignment protocol",
          detail:
            "Two people minimum: one at the shutter, one at the optics. Announce 'shutter open' and 'shutter closed'. Align with the lowest power that is visible on an IR sensor card, never by eye.",
          checkpoint: "Protocol and roles stated aloud before the first beam."
        }
      ]
    },
    {
      id: "inventory",
      title: "Inventory and configuration check",
      purpose: "Verify that the unverified configuration really matches the intended experiment.",
      steps: [
        {
          title: "Record the source",
          detail:
            "Log manufacturer, model, serial, measured wavelength and output power. Measure power at the laser exit and after each added optic. A 1064 nm source with a damaged beam profile will not form a clean focus.",
          checkpoint: "Source wavelength, power and beam profile recorded."
        },
        {
          title: "Verify the objective",
          detail:
            "Record magnification, NA, immersion medium, working distance, coverslip correction and transmission at the trap wavelength. Inspect the front lens for oil, dust or scratches.",
          checkpoint: "Objective NA and immersion match the calculation; no damage visible."
        },
        {
          title: "Check the sample",
          detail:
            "Record bead material, nominal diameter, refractive index, concentration and surfactant. Dilute to a concentration where beads are sparse in the field of view. Sonicate briefly if the supplier recommends it.",
          checkpoint: "Bead specification and dilution recorded; no aggregates visible."
        },
        {
          title: "Verify the optics",
          detail:
            "Confirm the dichroic reflects 1064 nm and transmits the illumination band, the band-pass filter blocks 1064 nm, and the camera is not exposed to the trap beam. Check the beam expander and tube lens focal lengths.",
          checkpoint: "Dichroic and filter transmission/blocking verified by measurement or datasheet."
        }
      ]
    },
    {
      id: "beam",
      title: "Beam expansion and collimation",
      purpose: "Fill the objective back aperture with a collimated, centred Gaussian beam.",
      steps: [
        {
          title: "Set the height and axis",
          detail:
            "Establish a reference height with an iris or a pair of posts. Walk the beam with two mirrors until it is parallel to the table and passes through the centre of both irises.",
          checkpoint: "Beam centred on two irises separated by at least 30 cm."
        },
        {
          title: "Expand the beam",
          detail:
            "Use a beam expander or a pair of lenses to bring the 1/e² diameter to roughly the objective entrance pupil. Overfilling improves resolution but throws away power; underfilling wastes NA.",
          checkpoint: "Beam fills the back aperture without clipping; transmitted power measured."
        },
        {
          title: "Check collimation",
          detail:
            "Measure the beam diameter at two positions after the expander, or focus it with a long-focal-length lens and check the spot at several distances. A converging or diverging input shifts the focus and changes the effective waist.",
          checkpoint: "Diameter changes by less than a few percent over the available path."
        },
        {
          title: "Attenuate for alignment",
          detail:
            "Insert an ND filter or reduce the laser current before the objective. Keep a pick-off and power meter to monitor drift. Do not use the ND filter as the only eye protection.",
          checkpoint: "Sample-plane power at or below the alignment limit."
        }
      ]
    },
    {
      id: "objective",
      title: "Objective alignment and focus",
      purpose: "Form a diffraction-limited focus at the sample plane and image it on the camera.",
      steps: [
        {
          title: "Mount the dichroic and objective",
          detail:
            "Steer the beam into the dichroic so that it is centred on the objective entrance pupil. A beam that enters off-axis produces coma and a displaced focus. Use the back reflection to check centration at low power.",
          checkpoint: "Back reflection returns along the incoming beam within a few millimetres."
        },
        {
          title: "Establish bright-field imaging",
          detail:
            "Turn on the illumination, focus on a coverslip or a scratch, and bring the sample plane into focus on the camera. Adjust the tube lens and camera height so that the image is parfocal with the trapping focus.",
          checkpoint: "Sharp image of the coverslip surface; camera centred."
        },
        {
          title: "Find the focal spot",
          detail:
            "With the IR at low power, use an IR sensor card or a thin fluorescent layer to locate the focus. Translate the objective or stage through focus and note the direction of motion. Record the focus position.",
          checkpoint: "Focus located and its stage coordinate recorded."
        },
        {
          title: "Check the point-spread function",
          detail:
            "Image a sub-resolution fluorescent bead if available. An asymmetric or comet-shaped spot indicates aberration or misalignment. At high NA, coverslip thickness and immersion errors are visible here.",
          caution: "Do not judge focus from the IR beam on a white card; the card's fluorescence and the beam's invisibility mislead.",
          checkpoint: "PSF round and compact; no obvious coma or astigmatism."
        }
      ]
    },
    {
      id: "sample",
      title: "Sample loading and chamber",
      purpose: "Create a dilute, sealed, drift-resistant sample at the correct depth.",
      steps: [
        {
          title: "Prepare the chamber",
          detail:
            "Clean the coverslip, dry it, and seal a small volume of the diluted suspension between the coverslip and a slide or a commercial chamber. Avoid air bubbles and avoid drying at the edges.",
          checkpoint: "Chamber sealed; no bubbles in the field; bead density sparse."
        },
        {
          title: "Mount on the stage",
          detail:
            "Place the chamber on the stage with the coverslip facing the objective. Use the lab jack to bring the objective to its working distance without touching the glass.",
          caution: "Oil immersion objectives have a short working distance; raising the stage into the lens can scratch both."
        },
        {
          title: "Find a bead",
          detail:
            "Focus on the sample plane, reduce illumination to a comfortable level, and find an isolated bead away from the coverslip and from other beads. Record its position and appearance.",
          checkpoint: "Single isolated bead in focus; no nearby cluster."
        },
        {
          title: "Let it settle",
          detail:
            "Wait several minutes for thermal drift and stage creep to decay. Monitor the bead position with the shutter closed. If it drifts steadily, the chamber is evaporating or the stage is settling.",
          checkpoint: "Residual drift over one minute is small compared with the expected trap motion."
        }
      ]
    },
    {
      id: "observe",
      title: "Trap observation",
      purpose: "Establish that the bead is optically trapped rather than stuck or merely pushed.",
      steps: [
        {
          title: "Open at low power",
          detail:
            "Open the shutter at the lowest power that can capture a bead. Watch the bead move toward the focus. If it is pushed away, the gradient is too weak or the index contrast is wrong.",
          checkpoint: "Bead captured and held near the focus for several seconds."
        },
        {
          title: "Test with the stage",
          detail:
            "Translate the stage a few micrometres and watch whether the bead follows the focus or stays with the glass. A trapped bead returns when the stage is moved back; a stuck bead does not.",
          checkpoint: "Bead follows the focus and returns after a small stage displacement."
        },
        {
          title: "Test with power",
          detail:
            "Reduce the power slowly. A trapped bead begins to diffuse and then escapes; a stuck bead remains. Record the power at which the behaviour changes.",
          caution: "Do not slam the shutter repeatedly; thermal transients move the sample."
        },
        {
          title: "Check the axial direction",
          detail:
            "Move the stage along z through focus. A bead that disappears in one direction but remains fixed in the image plane may be trapped only transversely or stuck to the surface. Record the axial behaviour.",
          checkpoint: "Bead returns from small axial displacements; no evidence of sticking."
        }
      ]
    },
    {
      id: "calibrate",
      title: "Calibration and data acquisition",
      purpose: "Turn the observation into numbers with stated uncertainties.",
      steps: [
        {
          title: "Measure the sample-plane power",
          detail:
            "Measure power before the objective and correct for transmission. If possible, measure at a plane equivalent to the sample. Record the method and the correction factor.",
          checkpoint: "Power at the trap stated with an uncertainty and a measurement method."
        },
        {
          title: "Record the position trace",
          detail:
            "Acquire a stationary record at a known sample rate for at least 100 trap correlation times. Record the detector bandwidth, any filtering and the temperature. Repeat at three powers.",
          checkpoint: "Trace length, sample rate, bandwidth and temperature recorded."
        },
        {
          title: "Run the variance calibration",
          detail:
            "Detrend slowly varying drift, compute the variance in one dimension, and apply k = k_BT/⟨x²⟩. Compare with the histogram and with a Gaussian of the same variance.",
          checkpoint: "k from variance with a stated bandwidth and uncertainty."
        },
        {
          title: "Run the PSD calibration",
          detail:
            "Compute the one-sided PSD, fit a Lorentzian over a band that excludes the noise floor, and extract f_c. Compute k = 2πγf_c with the measured radius, viscosity and temperature.",
          checkpoint: "Fitted f_c and k agree with the variance result within the stated uncertainty — or the disagreement is explained."
        },
        {
          title: "Measure force versus displacement",
          detail:
            "Move the stage or apply a known flow in steps. Record the bead displacement and compute F = γv or F = kx in the linear region. Extend until the force turns over or the bead escapes.",
          checkpoint: "At least six points spanning the linear region; escape point identified."
        }
      ]
    },
    {
      id: "shutdown",
      title: "Shutdown and record",
      purpose: "Leave the laboratory safe and the data reproducible.",
      steps: [
        {
          title: "Close and power down",
          detail:
            "Close the shutter first, then reduce the laser current and switch off the source. Wait for the source to cool if the manufacturer requires it. Do not leave the trap running unattended.",
          checkpoint: "Shutter closed; source off; keys and switches in the safe state."
        },
        {
          title: "Clean the objective",
          detail:
            "Remove immersion oil with the recommended lens tissue and solvent. Cap the objective. Clean the stage and discard the sample chamber as chemical waste if required.",
          caution: "Never clean a high-NA objective with a dry tissue or an unknown solvent."
        },
        {
          title: "Archive the data",
          detail:
            "Save raw traces, calibration rows, metadata (seed, power, waist, bead specification, temperature, viscosity, bandwidth) and analysis scripts. A stiffness without its metadata is not reproducible.",
          checkpoint: "Raw data and metadata archived with a readable header."
        },
        {
          title: "Remove eyewear last",
          detail:
            "Keep eyewear on until the source is off and the beam path is confirmed dark. Then remove it and restore the bench.",
          checkpoint: "Bench dark, blocks in place, eyewear stored."
        }
      ]
    }
  ],
  observations: [
    {
      id: "power-displacement",
      title: "Power versus displacement",
      purpose:
        "Map the restoring force at several laser powers and locate the linear region and the turnover.",
      columns: [
        { key: "power_mw", label: "Power", unit: "mW", type: "number" },
        { key: "displacement_nm", label: "Bead displacement", unit: "nm", type: "number" },
        { key: "force_pn", label: "Restoring force", unit: "pN", type: "number" },
        { key: "direction", label: "Direction", type: "text" },
        { key: "note", label: "Observation", type: "text" }
      ],
      guidance:
        "Use at least six displacements per power, spanning roughly ±0.5w₀. Measure in both directions and average. Repeat at three powers. The slope near zero is the stiffness; note where the curve stops being linear.",
      formula: "F = kx near the focus; F = γv for a calibrated flow"
    },
    {
      id: "brownian-trace",
      title: "Brownian position trace",
      purpose:
        "Record the spontaneous motion of a trapped bead for variance and PSD analysis.",
      columns: [
        { key: "time_s", label: "Time", unit: "s", type: "number" },
        { key: "x_nm", label: "x position", unit: "nm", type: "number" },
        { key: "y_nm", label: "y position", unit: "nm", type: "number" },
        { key: "detector", label: "Detector", type: "text" },
        { key: "bandwidth_hz", label: "Bandwidth", unit: "Hz", type: "number" }
      ],
      guidance:
        "Acquire at least 10⁵ samples at a rate several times the expected corner frequency. Keep the trap power, temperature and stage fixed. Record a dark/noise trace with the bead removed or the trap blocked.",
      formula: "k = k_BT/⟨x²⟩; S_x(f) = 4k_BTγ/[γ²(2π)²(f²+f_c²)]"
    },
    {
      id: "calibration-runs",
      title: "Calibration runs",
      purpose:
        "Compare variance and PSD calibrations across powers and identify systematic disagreement.",
      columns: [
        { key: "run", label: "Run", type: "text" },
        { key: "power_mw", label: "Power", unit: "mW", type: "number" },
        { key: "waist_um", label: "w₀", unit: "µm", type: "number" },
        { key: "variance_nm2", label: "Variance", unit: "nm²", type: "number" },
        { key: "k_variance", label: "k (variance)", unit: "µN/m", type: "number" },
        { key: "k_psd", label: "k (PSD)", unit: "µN/m", type: "number" },
        { key: "fc_hz", label: "f_c", unit: "Hz", type: "number" },
        { key: "ratio", label: "k_var/k_psd", type: "number" }
      ],
      guidance:
        "At least five runs, with power varied and everything else fixed. Include one repeat at the same power to estimate run-to-run scatter. Record the seed for simulated runs and the file name for real ones.",
      formula: "k_var = k_BT/⟨x²⟩; k_PSD = 2πγf_c"
    }
  ],
  analysis: [
    {
      id: "variance-stiffness",
      title: "Stiffness from the position variance",
      method:
        "Detrend the trace, compute the variance in one transverse direction and apply equipartition. Propagate the uncertainty from the finite record length and the temperature.",
      formula: "k = k_BT/⟨x²⟩",
      steps: [
        "Plot the raw trace and remove obvious jumps, dropped frames or stage movements.",
        "High-pass or detrend only the drift band; record the cutoff.",
        "Compute ⟨x²⟩ and its statistical uncertainty using N_eff ≈ 2πf_cT.",
        "Divide k_BT by the variance and propagate the temperature and calibration uncertainties.",
        "Check the histogram against a Gaussian of the same variance."
      ],
      expected:
        "A stable trap gives a ratio near 1 between repeated runs. A drift-dominated record gives a low k and a heavy-tailed histogram."
    },
    {
      id: "psd-fit",
      title: "Lorentzian fit to the PSD",
      method:
        "Compute a one-sided PSD, fit S = A/(1+(f/f_c)²) over a band free of detector noise, and convert f_c to stiffness with the measured drag.",
      formula: "S_x(f) = 4k_BTγ/[γ²(2π)²(f²+f_c²)]; k = 2πγf_c",
      steps: [
        "Choose a segment length that gives enough low-frequency resolution below f_c.",
        "Average periodograms over segments to reduce scatter.",
        "Fit on log–log axes and exclude the noise floor and the anti-aliasing roll-off.",
        "Report f_c, the fit band and the residuals.",
        "Compare k_PSD with k_variance and explain any discrepancy."
      ],
      expected:
        "A good fit has residuals without structure and a corner within the calibrated band. A corner at the edge of the band usually means the sampling or bandwidth is inadequate."
    },
    {
      id: "force-curve",
      title: "Force versus displacement",
      method:
        "Convert stage or flow displacement into force and fit the linear region; identify the turnover and the escape point.",
      formula: "F = kx (linear); F = γv (drag)",
      steps: [
        "Calibrate the displacement scale with a stage micrometer or a known flow.",
        "Measure the bead displacement for at least six applied forces in each direction.",
        "Fit a straight line through the origin in the linear region and compare its slope with the variance result.",
        "Extend the measurement until the force saturates; mark the turnover.",
        "Do not extrapolate the linear fit beyond the turnover."
      ],
      expected:
        "The slope is the stiffness. A curve that flattens and then drops indicates the particle leaving the harmonic region; a discontinuous jump suggests sticking or escape."
    },
    {
      id: "escape-force",
      title: "Escape force and stability margin",
      method:
        "Increase a calibrated flow or stage velocity until the bead is released. Convert the release condition to force and compare it with the model's maximum gradient minus scattering.",
      formula: "F_esc = 6πηav_release; F_esc,model = F_grad,max − F_scat",
      steps: [
        "Start well below the expected escape force and increase in small steps.",
        "At each step, wait for the bead to reach a steady displacement and record it.",
        "Identify the last force at which the bead returns after a small perturbation.",
        "Repeat three times and report the spread, not just the mean.",
        "Compare with the model and attribute the difference to aberration, wall drag or non-Rayleigh scattering."
      ],
      expected:
        "The measured escape force is usually below the Rayleigh model for a bead comparable to the wavelength. A large discrepancy is information, not a failed experiment."
    },
    {
      id: "uncertainty",
      title: "Uncertainty budget and comparison",
      method:
        "Combine statistical and systematic uncertainties and decide whether the two calibration routes agree within them.",
      formula: "(δk/k)² = (δ⟨x²⟩/⟨x²⟩)² + (δT/T)² + (δγ/γ)² + (δf_c/f_c)²",
      steps: [
        "List every input: temperature, viscosity, radius, detector scale, fit band, drift cutoff.",
        "Separate random contributions (reduced by averaging) from systematic ones (not reduced).",
        "Propagate in quadrature for independent contributions; treat correlated ones explicitly.",
        "Compare k_variance, k_PSD and the force-curve slope on one plot with error bars.",
        "State which method you trust and why."
      ],
      expected:
        "A careful measurement agrees within roughly 10–20%; a teaching measurement may differ by a factor of two. The budget should identify which term dominates."
    }
  ],
  errors: [
    {
      source: "Stage and thermal drift",
      type: "systematic",
      effect:
        "Adds a slow offset to the position record, inflating the variance (lowering k_variance) and adding excess low-frequency power to the PSD.",
      mitigation:
        "Wait for thermal equilibrium, seal the chamber, use a damped table, detrend only the drift band, and keep records short enough that drift is negligible."
    },
    {
      source: "Viscous heating",
      type: "systematic",
      effect:
        "Local heating lowers the viscosity near the focus, so the measured corner frequency and diffusion coefficient shift; it can also move the sample by convection.",
      mitigation:
        "Use the lowest power that traps, measure the sample temperature if possible, repeat at several powers, and look for a power-dependent baseline drift."
    },
    {
      source: "Spherical aberration",
      type: "systematic",
      effect:
        "The focus elongates and the peak gradient drops, especially deep in the sample or with the wrong coverslip thickness. Axial stiffness is affected more than transverse stiffness.",
      mitigation:
        "Use the specified coverslip thickness and immersion, keep the trap close to the coverslip, and image the point-spread function to detect asymmetry."
    },
    {
      source: "Particle sticking",
      type: "systematic",
      effect:
        "A bead adhered to the glass has essentially infinite stiffness and zero Brownian variance; it can mimic a very stiff trap.",
      mitigation:
        "Translate the stage, reduce power, use a fresh dilute sample and a surfactant if appropriate, and check that the bead follows the focus."
    },
    {
      source: "Detector or camera calibration",
      type: "systematic",
      effect:
        "An incorrect nanometres-per-pixel or QPD gain scales the variance and the PSD amplitude, producing a wrong stiffness even when the statistics are perfect.",
      mitigation:
        "Calibrate the displacement scale with a stage micrometer or a known piezo step; verify linearity and bandwidth; record the calibration file."
    },
    {
      source: "Laser power drift",
      type: "random",
      effect:
        "The trap stiffness changes during a record, broadening the distribution and making the PSD non-stationary.",
      mitigation:
        "Allow the source to warm up, monitor a pick-off with a power meter, normalise or reject drifting segments, and record power before and after each run."
    },
    {
      source: "Non-Rayleigh particle",
      type: "systematic",
      effect:
        "For a ≈ λ_m or larger, the a³/a⁶ scalings and the point-dipole potential are wrong; Mie resonances and ray-optics effects dominate.",
      mitigation:
        "Record the size parameter a/λ_m, use a smaller bead for quantitative work, or compare with a Mie/ray-optics model. Do not present Rayleigh numbers as measurements for large beads."
    }
  ],
  applications: [
    {
      title: "Molecular motors and DNA mechanics",
      body:
        "A trapped bead attached to a DNA molecule or a motor protein measures piconewton forces and nanometre steps. The trap stiffness sets the force range, while the position detector sets the resolution."
    },
    {
      title: "Cell mechanics and mechanotransduction",
      body:
        "Micron-sized beads or functionalised probes pull on cell membranes and extracellular matrix to measure stiffness, adhesion and the cellular response to mechanical cues."
    },
    {
      title: "Microrheology",
      body:
        "A trapped bead embedded in a complex fluid reports the local viscoelastic response. The PSD and the drag coefficient become a probe of the medium rather than a calibration nuisance."
    },
    {
      title: "Nanomanipulation and assembly",
      body:
        "Optical forces position nanoparticles, nanowires and biological structures without contact. The same gradient that traps a bead can assemble or sort particles by size and refractive index."
    },
    {
      title: "Fundamental force sensing",
      body:
        "Optically levitated particles are used in precision force and torque sensing, tests of small-scale thermodynamics and searches for deviations from established physics, where the trap provides isolation from thermal contact."
    }
  ],
  questions: [
    {
      id: "q1",
      type: "mcq",
      difficulty: 1,
      topic: "Forces",
      prompt: "Which force provides the restoring pull toward the focus in a single-beam optical trap?",
      options: ["Scattering force", "Gradient force", "Stokes drag", "Gravitational force"],
      answerIndex: 1,
      answer:
        "The gradient force. It points toward increasing intensity for a particle with n_p > n_m and provides the three-dimensional restoring force. Scattering pushes along the beam and destabilises the axial direction.",
      marks: 1
    },
    {
      id: "q2",
      type: "mcq",
      difficulty: 1,
      topic: "Forces",
      prompt: "The scattering force on a transparent sphere points predominantly:",
      options: ["Toward the focus", "Opposite to the beam", "Along the beam", "Radially outward from the axis"],
      answerIndex: 2,
      answer:
        "Along the beam. Light leaves the particle with a net forward momentum, so the particle recoils in the direction of propagation. This is why the axial equilibrium sits slightly downstream of the focus.",
      marks: 1
    },
    {
      id: "q3",
      type: "mcq",
      difficulty: 1,
      topic: "Stability",
      prompt: "A single-beam trap is possible when the particle refractive index is:",
      options: ["Lower than the medium", "Equal to the medium", "Higher than the medium", "Independent of the medium"],
      answerIndex: 2,
      answer:
        "Higher than the medium. Then the Clausius–Mossotti factor is positive and the gradient force points up the intensity gradient. An index-matched particle feels no optical force; a lower-index particle is pushed toward the dark.",
      marks: 1
    },
    {
      id: "q4",
      type: "mcq",
      difficulty: 2,
      topic: "Gaussian beams",
      prompt: "If the waist is doubled while the wavelength and medium are unchanged, the Rayleigh range becomes:",
      options: ["Half as large", "The same", "Twice as large", "Four times as large"],
      answerIndex: 3,
      answer:
        "Four times as large, because z_R = πw₀²n/λ scales as w₀². A larger waist also reduces the divergence and the peak intensity for a fixed power.",
      marks: 1
    },
    {
      id: "q5",
      type: "short",
      difficulty: 2,
      topic: "Wavelength choice",
      prompt: "Why is 1064 nm a common choice for trapping biological samples?",
      answer:
        "Water and most biological material absorb relatively little near 1064 nm compared with visible or mid-infrared wavelengths, so heating per unit power is lower. The wavelength is also available from stable solid-state lasers. Absorption is not zero, however, and high focal intensity can still cause heating, two-photon excitation and photodamage; the choice reduces one risk rather than eliminating all of them.",
      marks: 3
    },
    {
      id: "q6",
      type: "short",
      difficulty: 2,
      topic: "Numerical aperture",
      prompt: "Why does a high-NA objective make trapping easier, and what does it cost?",
      answer:
        "A high NA produces a smaller waist and a steeper intensity gradient, so the gradient force grows strongly while the scattering force grows only weakly. The cost is a short working distance, sensitivity to coverslip thickness and immersion, larger spherical aberration with depth, and a smaller field of view. High NA also invalidates the paraxial Gaussian description, so vector diffraction is needed for quantitative work.",
      marks: 3
    },
    {
      id: "q7",
      type: "short",
      difficulty: 2,
      topic: "Validity",
      prompt: "What does the condition a ≪ λ mean physically, and what happens when it fails?",
      answer:
        "It means the applied field is nearly uniform across the particle, so the particle responds as an induced dipole. Then the gradient force scales as a³ and the scattering force as a⁶. When the particle is comparable to the wavelength, the field varies across its volume, retardation and interference within the particle matter, and Mie or ray-optics methods are required. The simple scaling laws then give qualitatively wrong forces.",
      marks: 3
    },
    {
      id: "q8",
      type: "numerical",
      difficulty: 2,
      topic: "Gaussian beams",
      prompt:
        "Calculate the Rayleigh range for w₀ = 0.5 µm, λ₀ = 1064 nm and n_m = 1.33.",
      answer:
        "z_R = πw₀²n_m/λ₀ = π(0.5 × 10⁻⁶)²(1.33)/(1064 × 10⁻⁹) ≈ 0.98 × 10⁻⁶ m ≈ 0.98 µm.",
      numeric: { value: 0.98, tolerance: 0.05, unit: "µm" },
      marks: 2
    },
    {
      id: "q9",
      type: "numerical",
      difficulty: 2,
      topic: "Numerical aperture",
      prompt:
        "A 1064 nm beam is focused by an objective of NA 1.2. Estimate the diffraction-limited waist using w₀ ≈ 0.61λ/NA.",
      answer:
        "w₀ ≈ 0.61 × 1064 nm / 1.2 ≈ 541 nm ≈ 0.54 µm. This is a rule-of-thumb estimate; vector focusing and aberration change the real spot.",
      numeric: { value: 0.54, tolerance: 0.02, unit: "µm" },
      marks: 2
    },
    {
      id: "q10",
      type: "numerical",
      difficulty: 3,
      topic: "Corner frequency",
      prompt:
        "A 1 µm diameter sphere is trapped with k = 1.0 × 10⁻⁴ N/m in water at η = 1.0 mPa·s. Calculate γ and f_c.",
      answer:
        "a = 0.5 µm, so γ = 6πηa = 6π(1.0 × 10⁻³)(0.5 × 10⁻⁶) ≈ 9.42 × 10⁻⁹ N s/m. Then f_c = k/(2πγ) = 1.0 × 10⁻⁴/(2π × 9.42 × 10⁻⁹) ≈ 1.69 × 10³ Hz.",
      numeric: { value: 1689, tolerance: 60, unit: "Hz" },
      marks: 3
    },
    {
      id: "q11",
      type: "numerical",
      difficulty: 2,
      topic: "Trap depth",
      prompt: "A model trap has a depth of 2.0 × 10⁻²⁰ J. Express it in k_BT at T = 300 K.",
      answer:
        "k_BT = 1.380649 × 10⁻²³ × 300 ≈ 4.142 × 10⁻²¹ J. The depth is 2.0 × 10⁻²⁰/4.142 × 10⁻²¹ ≈ 4.8 k_BT. This is a shallow trap by the usual 10 k_BT rule of thumb.",
      numeric: { value: 4.8, tolerance: 0.3, unit: "k_BT" },
      marks: 2
    },
    {
      id: "q12",
      type: "derivation",
      difficulty: 3,
      topic: "Gaussian beams",
      prompt:
        "Outline the derivation of the Gaussian beam from the paraxial wave equation, stating the approximation and the step where the Rayleigh range appears.",
      answer:
        "Start with E = ψ exp(ikz) in the Helmholtz equation, neglect ∂²ψ/∂z² compared with 2ik∂ψ/∂z, and obtain ∇⊥²ψ + 2ik∂ψ/∂z = 0. Insert a Gaussian ansatz with a complex radius q(z) and find dq/dz = 1. Writing 1/q = 1/R − iλ/(πw²n) and imposing a flat wavefront at the waist gives q₀ = iz_R with z_R = πw₀²n/λ. Separating real and imaginary parts yields w(z) = w₀√(1+(z/z_R)²) and R(z) = z(1+(z_R/z)²). The approximation is paraxial propagation; it fails for high NA.",
      marks: 5
    },
    {
      id: "q13",
      type: "derivation",
      difficulty: 3,
      topic: "Stiffness",
      prompt:
        "Derive the harmonic stiffness k = 4AI₀/w₀² for a Rayleigh particle near the focus.",
      answer:
        "With F_r = A dI/dr and I = I₀ exp(−2r²/w₀²), differentiation gives dI/dr = −(4I₀r/w₀²)exp(−2r²/w₀²). For |r| ≪ w₀ the exponential is approximately 1, so F_r ≈ −(4AI₀/w₀²)r. Comparing with F = −kr gives k = 4AI₀/w₀². Substituting A = 2πn_m a³K/c and I₀ = 2P/(πw₀²) gives k = 16n_m a³KP/(cw₀⁴). The approximation requires a Rayleigh sphere, a paraxial Gaussian and |r| ≪ w₀.",
      marks: 5
    },
    {
      id: "q14",
      type: "derivation",
      difficulty: 3,
      topic: "Calibration",
      prompt:
        "Derive the equipartition calibration k = k_BT/⟨x²⟩ and state two experimental conditions it requires.",
      answer:
        "In equilibrium p(x) ∝ exp(−U/k_BT). For a harmonic well U = ½kx², so p is Gaussian with variance k_BT/k. Therefore ⟨x²⟩ = k_BT/k and k = k_BT/⟨x²⟩. It requires a stationary, drift-free record and a detector that captures the full motional bandwidth (or a quantified filter correction), plus a harmonic potential over the sampled range.",
      marks: 5
    },
    {
      id: "q15",
      type: "derivation",
      difficulty: 3,
      topic: "PSD",
      prompt:
        "Derive the Lorentzian PSD and its corner frequency from the overdamped Langevin equation.",
      answer:
        "γẋ + kx = ξ with ⟨ξ(t)ξ(t′)⟩ = 2γk_BTδ(t−t′). Fourier transforming gives (k − i2πfγ)X = Ξ, so |X|² = |Ξ|²/(k² + (2πfγ)²). Using the white-noise spectrum and the one-sided convention yields S(f) = 4k_BTγ/[γ²(2π)²(f² + f_c²)] with f_c = k/(2πγ). The spectrum is flat below f_c and falls as 1/f² above it; its integral is k_BT/k.",
      marks: 5
    },
    {
      id: "q16",
      type: "viva",
      difficulty: 2,
      topic: "Calibration",
      prompt:
        "Why must the variance calibration be performed in the linear (harmonic) region of the trap?",
      answer:
        "The relation ⟨x²⟩ = k_BT/k assumes a quadratic potential. Away from the focus the force saturates and then decreases, so the potential is flatter than a parabola and the particle samples a larger region than equipartition would predict for the small-signal stiffness. The resulting k is a weighted average over the sampled potential, not the local stiffness. Check the histogram and keep the excursion well inside the linear region.",
      marks: 3
    },
    {
      id: "q17",
      type: "viva",
      difficulty: 2,
      topic: "Concepts",
      prompt: "Distinguish trap stiffness from trap depth.",
      answer:
        "Stiffness k is the curvature of the potential at its minimum, in N/m; it sets the thermal rms displacement √(k_BT/k) and the corner frequency. Depth ΔU is the energy difference between the minimum and the escape barrier, in joules or k_BT; it sets how much force or energy is needed to remove the particle. A trap can be stiff but shallow, or soft but deep, depending on the beam profile and the scattering force.",
      marks: 3
    },
    {
      id: "q18",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Alignment",
      prompt:
        "You see a bead but it is pushed along the beam and never captured. List four checks in a sensible order.",
      answer:
        "First confirm the particle has n_p > n_m and is not index-matched. Second check that the beam actually fills the objective back aperture and is centred; an underfilled or off-axis beam gives a weak, aberrated focus. Third check the focus is at the sample plane and that the bead is not stuck or out of the chamber. Fourth reduce the beam size/improve the objective correction and confirm the beam is not clipped or astigmatic. Also verify the wavelength and that the dichroic really sends the trap beam into the objective.",
      marks: 4
    },
    {
      id: "q19",
      type: "troubleshooting",
      difficulty: 3,
      topic: "Heating",
      prompt:
        "A bead is trapped at low power but escapes when the power is raised. Give two physical explanations and a test for each.",
      answer:
        "Heating can lower the viscosity and create convection that pushes the bead out; test by measuring the local temperature or repeating at a fixed power with different exposure times and looking for a drift signal. Alternatively, raising power can increase scattering faster than the gradient in a non-Rayleigh or aberrated trap, moving the equilibrium downstream until no bound state remains; test by measuring the force–displacement curve and checking whether the escape force grows with power. A third possibility is a power-dependent focus shift from thermal lensing in the sample or optics.",
      marks: 4
    },
    {
      id: "q20",
      type: "instrumentation",
      difficulty: 2,
      topic: "Apparatus",
      prompt: "What is the role of the dichroic in a tweezers microscope?",
      answer:
        "It separates the trapping wavelength from the imaging path. It reflects the near-infrared trap beam into the objective while transmitting the visible illumination to the camera (or vice versa, depending on the design). It must have high transmission/reflection at the correct wavelengths, a sharp edge, low absorption and a damage threshold above the local power. A wrong dichroic either loses trap power or leaks IR into the camera.",
      marks: 3
    },
    {
      id: "q21",
      type: "instrumentation",
      difficulty: 2,
      topic: "Power measurement",
      prompt:
        "Why measure the laser power at the sample plane rather than at the laser exit?",
      answer:
        "Every optic between the source and the sample absorbs or reflects some power, and the objective transmission at the trap wavelength may be much less than unity. The trap stiffness depends on the power actually delivered to the focus. Measuring at the exit overestimates the trap power and makes calibration and safety calculations wrong. A sample-plane equivalent measurement or a careful transmission correction is required.",
      marks: 3
    },
    {
      id: "q22",
      type: "short",
      difficulty: 2,
      topic: "Forces",
      prompt: "Explain why the stable trapping position lies slightly downstream of the geometric focus.",
      answer:
        "The scattering force always pushes along the beam. The gradient force is zero at the focus and points inward on either side. A stable equilibrium requires the upstream gradient to balance the downstream scattering push, so the particle sits where the axial gradient equals the scattering force, slightly downstream of the intensity maximum. Removing scattering would put the equilibrium exactly at the focus.",
      marks: 3
    },
    {
      id: "q23",
      type: "mcq",
      difficulty: 2,
      topic: "Calibration",
      prompt: "If the laser power is doubled in the harmonic regime, the corner frequency:",
      options: ["Is unchanged", "Doubles", "Halves", "Quadruples"],
      answerIndex: 1,
      answer:
        "Doubles. k is proportional to power, and f_c = k/(2πγ) with γ unchanged. The rms displacement falls by √2 because ⟨x²⟩ = k_BT/k.",
      marks: 1
    },
    {
      id: "q24",
      type: "mcq",
      difficulty: 2,
      topic: "Calibration",
      prompt: "If the viscosity is doubled at fixed stiffness and radius, the corner frequency and diffusion coefficient respectively:",
      options: ["Double, double", "Halve, halve", "Double, halve", "Halve, double"],
      answerIndex: 1,
      answer:
        "Both halve. γ = 6πηa doubles, so f_c = k/(2πγ) halves and D = k_BT/γ halves. The variance k_BT/k is unchanged.",
      marks: 1
    },
    {
      id: "q25",
      type: "short",
      difficulty: 2,
      topic: "PSD",
      prompt: "Why does the PSD have a plateau at low frequency and a 1/f² roll-off at high frequency?",
      answer:
        "Below the corner the trap relaxation is faster than the observation frequency, so the particle explores the full thermal distribution and the spectrum approaches the zero-frequency plateau set by k_BT and γ. Above the corner the inertia of the viscous response (in the overdamped sense, the finite relaxation time) filters the motion: the particle cannot follow fast noise, and the displacement amplitude falls as 1/f, giving a PSD that falls as 1/f².",
      marks: 3
    },
    {
      id: "q26",
      type: "short",
      difficulty: 3,
      topic: "Sampling",
      prompt: "What happens to a measured PSD if the sample rate is below twice the corner frequency, and how do you detect it?",
      answer:
        "High-frequency motion is aliased into lower frequencies, distorting the Lorentzian and usually flattening or artificially extending the high-frequency tail. The fitted corner becomes unreliable and often too low or too high depending on the noise. Detect it by comparing several sample rates, by checking for a white floor that does not fall with rate, and by using an analogue anti-aliasing filter before the ADC.",
      marks: 3
    },
    {
      id: "q27",
      type: "short",
      difficulty: 2,
      topic: "Detection",
      prompt: "Compare a camera and a quadrant photodiode for measuring trapped-bead position.",
      answer:
        "A camera gives a 2D image and is easy to align, but frame rates are low (tens to hundreds of Hz), exposure integrates the motion, and pixel blur and rolling shutter distort the spectrum. A quadrant photodiode or interferometric detector gives high bandwidth (kHz to MHz), excellent sub-nanometre resolution and low latency, but requires careful calibration of the displacement signal and is sensitive to interference and alignment. Use the camera for finding and coarse tracking, the QPD for calibration.",
      marks: 3
    },
    {
      id: "q28",
      type: "short",
      difficulty: 2,
      topic: "Apparatus",
      prompt: "Why is oil immersion used with a high-NA objective, and what practical error does it introduce?",
      answer:
        "Immersion oil has a refractive index close to glass, so rays at large angles are not totally internally reflected at the objective front surface and the full NA is usable. The practical error is that the oil, coverslip and sample must form a matched optical path; wrong oil index, bubbles, too much oil, or the wrong coverslip thickness introduce spherical aberration, reduce the peak gradient and shift the focus. Oil also spreads and must be cleaned.",
      marks: 3
    },
    {
      id: "q29",
      type: "short",
      difficulty: 3,
      topic: "Photodamage",
      prompt: "List three mechanisms by which a 1064 nm trap can damage a biological sample.",
      answer:
        "Linear absorption by water, proteins, dyes or the immersion medium raises the local temperature. Two- or multi-photon absorption at the high focal intensity can excite electronic states and produce reactive oxygen species. Optical forces and local heating can mechanically or thermally stress membranes and organelles. Indirect effects include convection, thermophoresis and oxygen depletion. The risk grows with power, exposure time and the presence of absorbers.",
      marks: 3
    },
    {
      id: "q30",
      type: "short",
      difficulty: 2,
      topic: "Stability",
      prompt: "Why is the axial stiffness usually smaller than the transverse stiffness?",
      answer:
        "The Gaussian intensity varies on the scale of w₀ transversely but on the scale of z_R axially, and z_R is larger than w₀. The axial gradient is therefore weaker. Scattering also acts along the axis and reduces the net axial restoring force. High NA improves the axial gradient but never makes it as strong as the transverse one in a simple Gaussian focus.",
      marks: 3
    },
    {
      id: "q31",
      type: "numerical",
      difficulty: 2,
      topic: "Escape force",
      prompt:
        "A model gives a maximum inward gradient force of 12 pN and an on-axis scattering force of 9 pN. What is the escape force?",
      answer: "F_esc = 12 − 9 = 3 pN. A positive margin means a single-beam equilibrium is possible; it does not guarantee stability against drift or aberration.",
      numeric: { value: 3, tolerance: 0.1, unit: "pN" },
      marks: 2
    },
    {
      id: "q32",
      type: "mcq",
      difficulty: 2,
      topic: "Regimes",
      prompt: "Which statement about the Rayleigh approximation is correct?",
      options: [
        "It is exact for all particle sizes if the laser is monochromatic.",
        "It requires a ≪ λ and gives F_grad ∝ a³ and F_scat ∝ a⁶.",
        "It requires a ≫ λ and is used for ray optics.",
        "It predicts no scattering force for a transparent sphere."
      ],
      answerIndex: 1,
      answer:
        "It requires the particle to be small compared with the wavelength, so the field is nearly uniform across it. Then the induced-dipole result gives a gradient force proportional to volume (a³) and a Rayleigh scattering cross-section proportional to a⁶/λ⁴.",
      marks: 1
    },
    {
      id: "q33",
      type: "short",
      difficulty: 2,
      topic: "Index contrast",
      prompt: "What happens to the optical force if the particle and medium are index-matched?",
      answer:
        "The Clausius–Mossotti factor K = (m²−1)/(m²+2) vanishes, so both the gradient and scattering forces from the dielectric response vanish to this order. The particle becomes invisible to the trap. A real particle may still feel weak forces from absorption, shape anisotropy or a slight index difference, but there is no useful dielectric trap.",
      marks: 2
    },
    {
      id: "q34",
      type: "short",
      difficulty: 2,
      topic: "Flow",
      prompt: "How does a uniform flow shift the equilibrium position of a trapped bead, and when does the bead escape?",
      answer:
        "The flow adds a constant drag force F = γv along the flow. The bead moves downstream until the trap's restoring force equals the drag. The shift is x = F/k in the linear region. As the flow increases, the operating point moves toward the inflection of the force–displacement curve; when the drag exceeds the maximum restoring force (the escape force), no equilibrium exists and the bead is swept away.",
      marks: 3
    },
    {
      id: "q35",
      type: "instrumentation",
      difficulty: 2,
      topic: "Apparatus",
      prompt: "What is the purpose of the beam expander in a tweezers setup?",
      answer:
        "It sets the beam diameter so that the objective back aperture is filled without clipping. Overfilling uses the full NA and gives the smallest focus, at the cost of transmitted power; underfilling produces a larger focus and a weaker gradient. The expander also allows the beam to be collimated and centred, which is essential for a round, aberration-free focal spot.",
      marks: 2
    },
    {
      id: "q36",
      type: "viva",
      difficulty: 3,
      topic: "Model validity",
      prompt:
        "Your simulation says a 2 µm bead is strongly trapped, but the real bead is pushed away. Give three reasons the model and experiment can disagree.",
      answer:
        "First, the Rayleigh model is invalid for a 2 µm bead at 1064 nm; Mie/ray-optics forces can differ in magnitude and even sign. Second, a large bead experiences stronger scattering and stronger axial push, and the paraxial Gaussian underestimates the tight axial gradient. Third, real effects absent from the model — spherical aberration, wall drag, sticking, heating-driven convection, and a beam that does not fill the objective — can dominate. The model is a teaching model, not a predictive design tool for that regime.",
      marks: 4
    },
    {
      id: "trap-x1",
      type: "mcq",
      difficulty: 2,
      topic: "Objective choice",
      prompt:
        "You must choose between two objectives for a 1064 nm trap: NA 0.6 (dry, long working distance) and NA 1.3 (oil immersion, short working distance). The bead is 0.4 µm in diameter and the total laser power is fixed. Which objective gives the stronger trap, and why?",
      options: [
        "NA 0.6, because the longer working distance reduces spherical aberration and therefore improves the gradient.",
        "NA 1.3, because the waist is roughly halved, so the stiffness rises steeply at fixed power even though the axial working distance shrinks.",
        "They are equivalent, because NA changes only the field of view and not the focal spot.",
        "NA 0.6, because a larger waist reduces scattering and therefore increases the escape force."
      ],
      answerIndex: 1,
      answer:
        "NA 1.3. At 1064 nm the diffraction-limited waists are approximately w₀ = 0.61λ/NA ≈ 1.08 µm for NA 0.6 and 0.50 µm for NA 1.3. At fixed power the peak intensity scales as 1/w₀², so the transverse stiffness k ∝ 1/w₀⁴ increases by roughly (1.08/0.50)⁴ ≈ 22, and the trap depth ∝ 1/w₀² increases by roughly 4.7. The higher-NA objective is the better choice provided the sample can tolerate oil immersion, the short working distance and the extra aberration from focusing through the coverslip. A beam that does not fill the high-NA pupil, or a badly corrected coverslip, can erase much of the theoretical gain.",
      explanation:
        "The strong scaling is the point: at fixed power, halving the waist increases the intensity fourfold and the intensity gradient a further fourfold. The cost is practical, not fundamental: working distance, immersion and aberration control.",
      marks: 3
    },
    {
      id: "trap-x2",
      type: "short",
      difficulty: 2,
      topic: "Sample preparation",
      prompt:
        "Describe how you would prepare and inspect the sample so that a single bead can be found and confidently identified as optically trapped rather than stuck to the coverslip.",
      answer:
        "Dilute the stock suspension until beads are sparse in the field of view, sonicate briefly if the supplier recommends it, and load a small volume into a clean chamber made with a #1.5 coverslip matched to the objective. Seal the chamber to slow evaporation, avoid bubbles, and let the stage and sample reach thermal equilibrium before measuring. Focus on the sample plane, use the lowest illumination that still gives a good image, and choose an isolated bead away from clusters and away from both glass surfaces. Then test the trap: translate the stage a few micrometres and check that the bead follows the focus and returns; reduce the power and check that a trapped bead begins to diffuse while a stuck bead remains; and move through focus to confirm axial capture. A bead that never diffuses, follows the glass rather than the focus, or survives the shutter being closed is stuck, not trapped.",
      marks: 4
    },
    {
      id: "trap-x3",
      type: "instrumentation",
      difficulty: 1,
      topic: "Camera calibration",
      prompt:
        "How do you calibrate a camera's micrometres-per-pixel scale at the sample plane, and why is the nominal 100× magnification not enough?",
      answer:
        "Put a stage micrometer or a calibrated grid in the sample plane and image it through the same objective, tube lens, camera, binning, ROI and digital-zoom settings used for the experiment. Measure a long baseline — at least several hundred pixels — in both directions, average repeated measurements and check for square pixels and distortion. For example, if a 100 µm interval spans 500 pixels, the scale is 0.20 µm/pixel. The nominal magnification is defined for a particular tube-lens focal length and camera distance; changing either, or changing the effective tube length, changes the scale. It also says nothing about pixel binning or rolling-shutter effects. A camera scale calibrated this way is adequate for coarse tracking, but nanometre calibration of a trap needs a quadrant photodiode or an interferometric detector with its own displacement calibration.",
      marks: 3
    },
    {
      id: "trap-x4",
      type: "instrumentation",
      difficulty: 2,
      topic: "Power measurement",
      prompt:
        "A power meter cannot be placed at the focus while the objective is in use. How do you estimate the power actually delivered to the trap, and which losses must be included?",
      answer:
        "Measure the power entering the objective and separately determine the transmission of the real optical train at the trap wavelength. The transmission includes the steering mirrors, dichroic, any ND or band-pass filters, the objective itself, the immersion oil, the coverslip and the sample medium. Measure it with a blank chamber or a plane equivalent to the sample plane, or remove the objective and place the head at the equivalent plane; do not assume the laser-exit power. Then P_trap = P_in × T, with the power-meter head calibrated at 1064 nm and kept below saturation. Record the measurement after the source has warmed up and monitor a pick-off during the run, because source drift and thermal changes in the optics both alter the delivered power. Finally, check that the beam still fills the back aperture at the measurement setting: clipping or an overfilled aperture changes both the delivered power and the effective NA.",
      marks: 4
    },
    {
      id: "trap-x5",
      type: "troubleshooting",
      difficulty: 2,
      topic: "No capture",
      prompt:
        "A bead enters the focus and is then accelerated downstream, disappearing from the field, especially when the power is raised. Diagnose the most likely cause and give three changes that could produce a stable trap.",
      answer:
        "The most likely cause is that the scattering force dominates the maximum inward gradient force, so there is no bound equilibrium; the particle is being pushed through the focus. A second possibility is that the index contrast is zero or negative, or that the beam is not actually focused at the sample (underfilled pupil, wrong coverslip correction, focus above or below the chamber). Increasing power does not fix scattering-dominated instability because both forces scale with intensity, so their ratio is unchanged. Remedies: use a smaller or higher-index-contrast bead so the gradient-to-scattering ratio improves; use a higher-NA objective and fill its back aperture so the waist and gradient are as tight as possible; verify the focus, coverslip thickness and immersion; and check that n_p > n_m. A larger trapping cone (higher NA) is usually more effective than more milliwatts.",
      marks: 4
    },
    {
      id: "trap-x6",
      type: "troubleshooting",
      difficulty: 3,
      topic: "Stability",
      prompt:
        "A bead appears trapped, but over a minute it drifts about 300 nm and occasionally jumps. Give a triage sequence that distinguishes stage/thermal drift, heating-driven convection and sticking to the coverslip, with one fix for each.",
      answer:
        "First close the shutter or block the trap and record the bead position for a minute: residual motion with the trap off is stage drift, chamber evaporation or building vibration. Second translate the stage: a trapped bead follows the focus and can be moved away from the glass; a stuck bead stays with the coverslip or snaps back to a fixed spot. Third vary the trap power and dwell time: a position that shifts or a baseline that moves only at high power points to heating, convection or thermal lensing in the sample or oil. Jumps that correlate with other beads or with dust suggest aggregates rather than a clean single-particle trap. Fixes: for drift, wait for thermal equilibrium, seal the chamber, improve the table isolation and detrend only the drift band; for heating, reduce power and dwell time, check absorbers and re-check the focus; for sticking, use a fresh dilute sample, a suitable surfactant and a bead away from the surfaces. If the jump rate depends on trap power, suspect a marginal axial trap rather than a dirty sample.",
      marks: 5
    },
    {
      id: "trap-x7",
      type: "mcq",
      difficulty: 2,
      topic: "Scaling",
      prompt:
        "At fixed total laser power, the beam waist is doubled while everything else is held constant. How do the transverse stiffness k and the trap depth ΔU/k_BT change in the Rayleigh regime?",
      options: [
        "k falls by 2, depth falls by 2.",
        "k falls by 4, depth falls by 4.",
        "k falls by 16, depth falls by 4.",
        "k falls by 16, depth falls by 2."
      ],
      answerIndex: 2,
      answer:
        "k falls by 16 and the depth falls by 4. At fixed power the peak intensity is I₀ = 2P/(πw₀²), so doubling the waist reduces I₀ by 4 and therefore reduces the depth (∝ I₀) by 4. The stiffness is k = 4AI₀/w₀², so the extra factor 1/w₀² makes k fall by 4 × 4 = 16. The alternative 1/w₀² scaling for k applies at fixed peak intensity, not at fixed power; confusing the two is a common calibration error.",
      explanation:
        "Depth ∝ P/w₀²; stiffness ∝ P/w₀⁴. A 10 k_BT depth criterion therefore depends on power and waist together, not on power alone.",
      marks: 2
    },
    {
      id: "trap-x8",
      type: "mcq",
      difficulty: 3,
      topic: "Calibration pitfalls",
      prompt:
        "A 60 s position record contains a slow 80 nm rms stage drift on top of a 6 nm thermal motion. Compare the variance calibration with a PSD fit above the drift band. Which statement is correct?",
      options: [
        "The drift averages out, so k_BT/⟨x²⟩ gives the correct stiffness; the PSD is biased instead.",
        "The drift inflates the measured variance, so k_BT/⟨x²⟩ underestimates k; a PSD fit restricted to frequencies above the drift band can be closer to the true stiffness.",
        "The drift reduces the measured variance, so k_BT/⟨x²⟩ overestimates k; the PSD is unaffected.",
        "Neither method can work with drift, because drift changes the temperature."
      ],
      answerIndex: 1,
      answer: "The drift adds a slow, independent contribution to the position variance: ⟨x²⟩_measured ≈ σ_thermal² + σ_drift². Since k = k_BT/⟨x²⟩, the inferred stiffness is too low. With σ_thermal = 6 nm and σ_drift = 80 nm, the variance is dominated by drift (about 6460 nm² versus 36 nm²), so the error is severe. A PSD separates the motion by frequency: if the drift is confined below the fit band and the detector bandwidth is known, the Lorentzian fit above that band can recover a much less biased corner frequency. The cost is that the low-frequency part of the Lorentzian is discarded, so the fit band and the drift cutoff must be reported. Drift does not change the thermodynamic temperature; it violates stationarity.",
      explanation:
        "Equipartition assumes a stationary record. Detrending or high-pass filtering can remove drift, but it also removes real low-frequency thermal motion; the choice must be stated and tested against a second method.",
      marks: 3
    },
    {
      id: "trap-x9",
      type: "numerical",
      difficulty: 2,
      topic: "Equipartition",
      prompt:
        "A trapped bead at T = 300 K has an rms displacement of 10 nm in one transverse direction. Estimate the trap stiffness in µN/m and in pN/nm.",
      answer:
        "The variance is σ² = (10 nm)² = 1.0 × 10⁻¹⁶ m². Equipartition gives k = k_BT/σ² = (1.380649 × 10⁻²³ × 300)/(1.0 × 10⁻¹⁶) ≈ 4.14 × 10⁻⁵ N/m. Since 1 µN/m = 10⁻⁶ N/m, k ≈ 41.4 µN/m. Since 1 pN/nm = 10⁻³ N/m, k ≈ 0.0414 pN/nm. The result assumes a stationary, drift-free record that captures the full thermal motion; a drift of even tens of nanometres would change it substantially.",
      numeric: { value: 41.4, tolerance: 3, unit: "µN/m" },
      marks: 3
    },
    {
      id: "trap-x10",
      type: "viva",
      difficulty: 3,
      topic: "Regimes and wavelength",
      prompt:
        "When is the Rayleigh dipole model adequate, when must you use ray optics, and why is 1064 nm often chosen for living cells? Include one photodamage caveat.",
      answer:
        "The Rayleigh model requires a ≪ λ_m: the applied field is nearly uniform across the sphere, which then responds as an induced dipole with F_grad ∝ a³ and F_scat ∝ a⁶. For particles comparable to the wavelength, Mie theory or a generalised Lorentz–Mie treatment is needed and resonances can make the force vary rapidly with size and wavelength. For a ≫ λ_m, ray optics with Fresnel refraction at the sphere surface becomes a good description: the sphere acts as a lens and the net force is the vector sum of the momentum changes of the refracted rays. A high-NA trap of a micron-scale bead is in the ray-optics or intermediate regime even though the paraxial Gaussian model may still be used for teaching. 1064 nm is popular for cells because water and most biological material absorb much less there than in the visible or ultraviolet, so heating per unit power is lower and phototoxicity is reduced. The caveat is that absorption is not zero: dyes, proteins, oil and the high focal intensity can still cause local heating, two-photon excitation and photodamage. Use the lowest power and shortest dwell that answer the question, and verify sample health rather than assuming that an invisible beam is harmless.",
      marks: 5
    }
  ],
  references: cite(
    "ashkin1970",
    "ashkin1986",
    "hecht",
    "saleh",
    "bornwolf",
    "fowles",
    "taylor",
    "bevington",
    "goodman",
    "thorlabs_edu",
    "thorlabs_kine",
    "edmund_optics"
  ),
  related: ["fourier-optics", "michelson-interferometer", "polarization-3d-cinema"],
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

export default opticalTweezers;
