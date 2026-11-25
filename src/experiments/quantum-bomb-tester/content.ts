import type { ExperimentContent, Reference } from "@/lib/content/types";
import { REFERENCE_CATALOGUE } from "@/lib/content/references";

import { SIMULATION_SPEC } from "./physics";

/**
 * Raw LaTeX helper. It uses the template's `raw` segments so backslashes reach
 * KaTeX unchanged (`\frac` stays `\frac`, `\\` stays a row separator).
 */
function tex(parts: TemplateStringsArray, ...values: Array<string | number>): string {
  return parts.raw.map((part, i) => part + (values[i] ?? "")).join("");
}

function reference(id: string): Reference {
  const found = REFERENCE_CATALOGUE[id];
  if (!found) throw new Error(`Unknown reference id: ${id}`);
  return found;
}

const LATEX = {
  bs: tex`B(\eta)=\begin{pmatrix} t & i r \\ i r & t \end{pmatrix},\qquad t=\sqrt{1-\eta},\quad r=\sqrt{\eta}`,
  afterBs1: tex`|\psi_1\rangle=\frac{1}{\sqrt{2}}\bigl(|u\rangle+i\,|l\rangle\bigr)`,
  absorbed: tex`|\psi_2\rangle=\frac{1}{\sqrt{2}}\,|u\rangle\qquad(\text{lower amplitude removed})`,
  pExplosion: tex`P(\text{explosion}\mid\text{live})=\eta=\tfrac{1}{2}`,
  pD0: tex`P(D_0\mid\text{live})=(1-\eta_1)(1-\eta_2)=\tfrac{1}{4}`,
  pD1: tex`P(D_1\mid\text{live})=\tfrac{1}{4},\qquad P(D_1\mid\text{dud})=1`,
  pIf: tex`P_{\mathrm{IF}}=\tfrac{1}{4}\ \text{per live bomb}`,
  pCert: tex`P(\text{certified live}\mid\text{random bomb})=\tfrac{1}{2}\cdot\tfrac{1}{4}=\tfrac{1}{8}`,
  expected: tex`\mathbb{E}[N]=\frac{1}{P_{\mathrm{IF}}}=4\ \text{live bombs per certification}`,
  confidence: tex`P(\text{at least one }D_0\text{ in }n)=1-\left(\tfrac{3}{4}\right)^{n}`,
  classical: tex`P_{\mathrm{classical}}(\text{live identified without destruction})=0`,
  posterior: tex`P(\text{live}\mid n\times D_1)=\frac{(1/4)^n}{(1/4)^n+1}=\frac{1}{1+4^n}`
} as const;

const content: ExperimentContent = {
  slug: "quantum-bomb-tester",
  number: "03",
  title: "Quantum Bomb Tester",
  shortTitle: "Bomb Tester",
  subtitle: "Interaction-free measurement after Elitzur and Vaidman",
  summary:
    "Test bombs with a Mach–Zehnder interferometer: a click in the dark port certifies a live bomb without detonating it.",
  principle:
    "An absorptive object removes one path amplitude; the surviving amplitude can no longer cancel at the dark port, so a dark-port click proves the object is there.",
  family: "Quantum foundations",
  difficulty: 2,
  duration: "2–3 h",

  evidence: {
    implementation: "simulation",
    headline: "Numerical thought experiment — no explosive device, no single-photon bench",
    detail:
      "This module is a numerical model of the ideal Elitzur–Vaidman experiment. No live explosive device and no single-photon kit are assumed. Probabilities, seeded batches, intervals and charts are model outputs, not laboratory measurements. A real demonstration would require a heralded single-photon source, a phase-stable interferometer, single-photon detectors and coincidence/timing logic; none of that is claimed to be present."
  },

  kit: {
    name: "Numerical model — no commercial kit assumed",
    manufacturer: "Not applicable",
    verification: "unverified",
    note:
      "Nothing is assumed to be on the bench. The 'bomb' is an abstract absorbing object and the detectors are ideal. A genuine single-photon demonstration requires a heralded source, interferometric stability at the scale of the photon coherence length and coincidence/detection logic. Any real laser analogue is a separate optical experiment and must follow the usual laser-safety rules."
  },

  hardware: [
    {
      itemId: "src-single-photon",
      quantity: "1",
      role: "unverified",
      note: "Not assumed present. A genuine run needs a heralded single-photon source (for example SPDC with a heralding detector) and a measured g²(0)."
    },
    {
      itemId: "src-attenuated-laser",
      quantity: "1",
      role: "unverified",
      note: "Not assumed present. An attenuated laser is a classical analogue only: its Poissonian photon statistics cannot certify single-photon behaviour."
    },
    {
      itemId: "bs-cube-50",
      quantity: "2",
      role: "unverified",
      note: "Not assumed present. A real interferometer needs two matched, low-loss 50:50 splitters; imbalance spoils the dark port."
    },
    {
      itemId: "det-spad",
      quantity: "2",
      role: "unverified",
      note: "Not assumed present. Single-photon counting with timing is required; a photodiode integrates many photons and cannot resolve single clicks."
    },
    {
      itemId: "mir-plane",
      quantity: "2",
      role: "unverified",
      note: "Not assumed present. Mirror phases and path lengths must be stable to a fraction of the wavelength over the run."
    }
  ],

  objectives: [
    "State the Elitzur–Vaidman question and explain why a classical probe cannot answer it non-destructively.",
    "Write the beam-splitter transformation and propagate a single-photon amplitude through both arms of a Mach–Zehnder interferometer.",
    "Show that a dud preserves destructive interference at the dark port while a live absorber removes one amplitude.",
    "Derive P(explosion) = 1/2, P(D0) = 1/4 and P(D1) = 1/4 for a live bomb in the ideal 50:50 model.",
    "Apply the decision rule D0 ⇒ live, D1 ⇒ inconclusive, and explain why it cannot produce a false positive in the ideal model.",
    "Quantify the 25% interaction-free efficiency, the expected number of trials and the confidence gained after n bombs.",
    "Distinguish carefully what 'interaction-free' establishes from what it does not.",
    "Specify the source, stability and detection requirements for a real single-photon implementation."
  ],

  concepts: [
    "Interaction-free measurement",
    "Probability amplitude",
    "Beam-splitter matrix",
    "Destructive interference",
    "Dark port",
    "Which-path information",
    "Post-selection",
    "Counterfactuality",
    "Single-photon source",
    "Coincidence detection"
  ],

  prerequisites: [
    "Two-beam interference and the meaning of a dark fringe",
    "Complex amplitudes (phasors) and the superposition principle",
    "The 2×2 beam-splitter transformation and unitarity",
    "Conditional probability and the binomial distribution",
    "The measurement postulate in its minimal, operational form",
    "Basic single-photon detection: clicks, dark counts and coincidence windows"
  ],

  sections: [
    {
      id: "the-question",
      number: "3.1",
      title: "The question Elitzur and Vaidman asked",
      kicker: "A test that should be impossible",
      blocks: [
        {
          type: "lead",
          text: "Suppose you are handed a box that may contain a live bomb. The bomb is triggered by absorbing a single photon. A dud is transparent. Can you find out which box you have without setting off the live one?"
        },
        {
          type: "p",
          text: "Classically the answer is no. Any probe that reaches the bomb has to interact with it: a live bomb absorbs the probe and explodes. The only classical test that does not destroy the bomb is no test at all. In 1993 Avshalom Elitzur and Lev Vaidman showed that quantum mechanics permits a third possibility. By placing the object in one arm of a Mach–Zehnder interferometer and looking only at the output ports, a single photon can certify that the object is there while the photon itself is detected in the port that would have been dark had the object been absent."
        },
        {
          type: "p",
          text: "The argument is not that the photon 'passed through the bomb harmlessly'. It is that the photon's amplitude had two terms, only one of which could be absorbed. When the photon is detected in the dark port, the term that would have taken the absorbing arm is missing. The remaining term could not cancel, and that failure of cancellation is the evidence."
        },
        {
          type: "callout",
          tone: "principle",
          title: "The core claim",
          body: "A null result at a port that should be dark can be as informative as a click. The interferometer converts 'the absorber is present' into 'the destructive interference is spoiled', and the photon that reports it never entered the absorbing arm."
        }
      ]
    },
    {
      id: "the-analogy",
      number: "3.2",
      title: "The bomb, the dud, and the limits of the analogy",
      kicker: "What the model actually contains",
      blocks: [
        {
          type: "p",
          text: "The word 'bomb' is a dramatic placeholder for a two-state object. In the model a live bomb is a perfect, instantaneous single-photon absorber on the lower arm, and absorption is declared to be an explosion. A dud is perfectly transparent. Nothing else about explosives — chemistry, fuses, blast, safety — is represented."
        },
        {
          type: "table",
          caption: "The two states of the abstract object",
          head: ["Object", "Action on the lower arm", "Effect in the model", "Physical stand-in"],
          rows: [
            ["Live bomb", "Absorbs one photon with unit probability", "Explosion if the photon takes that arm; otherwise the arm is empty", "Opaque card, beam block or detector that removes the arm"],
            ["Dud", "No interaction", "Both amplitudes reach the second splitter", "Empty path or transparent glass"]
          ]
        },
        {
          type: "p",
          text: "The analogy is exact at the level of amplitudes and probabilities, and it is misleading everywhere else. A real demonstration of interaction-free measurement uses a macroscopic absorber such as a mirror or an opaque object, not an explosive. What transfers is the logic: an object that could absorb a photon is detected by the change it makes to the interference, even when the detected photon did not go through it."
        },
        {
          type: "callout",
          tone: "misconception",
          title: "The bomb does not have to be a bomb",
          body: "The experiment tests the presence of an absorbing object. Calling it a bomb explains why non-destructive testing matters; it does not imply that any explosive was modelled, handled or required."
        }
      ]
    },
    {
      id: "amplitudes",
      number: "3.3",
      title: "Amplitudes through the Mach–Zehnder",
      kicker: "Two paths, one photon",
      blocks: [
        {
          type: "p",
          text: "A single photon enters port 0 of the first 50:50 beam splitter. We use the unitary convention of this laboratory, in which reflection carries a factor i:"
        },
        {
          type: "eq",
          latex: LATEX.bs,
          number: "3.1",
          note: "Lossless beam splitter with power reflectivity η. The factor i on reflection supplies the π/2 phase required by energy conservation."
        },
        {
          type: "diagram",
          kind: "mach-zehnder",
          caption: "The Mach–Zehnder layout. Path A is the upper arm, path B the lower arm. With no object and equal path lengths, the lower output (D0) is dark."
        },
        {
          type: "p",
          text: "For η = 1/2 the first splitter produces equal amplitudes on the two arms, with the lower arm carrying an extra i:"
        },
        {
          type: "eq",
          latex: LATEX.afterBs1,
          number: "3.2"
        },
        {
          type: "p",
          text: "Mirrors and propagation contribute phases. In the balanced, dark-port setting those phases are chosen so that the two contributions arrive at the second splitter with equal magnitude and opposite sign in the D0 output. This is an alignment condition, not an assumption about the photon: it is what makes the interferometer useful."
        },
        {
          type: "p",
          text: "The second 50:50 splitter recombines the arms. Writing u and l for the amplitudes arriving from the upper and lower arms, the outputs are a(D0) = (u + i l)/√2 and a(D1) = (i u + l)/√2. A dud supplies both amplitudes; a live bomb supplies only u."
        }
      ]
    },
    {
      id: "detectors",
      number: "3.4",
      title: "Reading the two detectors",
      kicker: "Dark port and bright port",
      blocks: [
        {
          type: "p",
          text: "The two output ports are not symmetric in what they tell you. D0 is the port that is dark when the interferometer is balanced and nothing is in the arms. D1 is the bright port. The experiment works because the presence of an absorber can make D0 click, while its absence keeps D0 silent."
        },
        {
          type: "table",
          caption: "Outcome, ideal probability, and what the observer may conclude",
          head: ["Outcome", "Live bomb", "Dud", "Observer's verdict"],
          rows: [
            ["Explosion", "1/2", "0", "Live — certain, but the bomb is destroyed"],
            ["D0 (dark port)", "1/4", "0", "Live — certain, non-destructive"],
            ["D1 (bright port)", "1/4", "1", "No conclusion"]
          ]
        },
        {
          type: "p",
          text: "The asymmetry between D0 and D1 is the whole experiment. A D0 click is impossible for a dud, so it is a certificate. A D1 click is possible for both, so it is not. The temptation to read D1 as 'dud' is the most common error in the subject; it would be a false negative with probability 1/4 for a live bomb."
        }
      ]
    },
    {
      id: "dud",
      number: "3.5",
      title: "A dud: interference is preserved",
      kicker: "The dark port stays dark",
      blocks: [
        {
          type: "p",
          text: "With a transparent dud, both amplitudes arrive at the second splitter. In the balanced setting the two contributions to D0 have equal magnitude and opposite phase, so they cancel exactly. All the amplitude leaves through D1. In the ideal model the dud therefore produces D1 with probability 1 and D0 with probability 0."
        },
        {
          type: "derivation",
          derivationId: "dud-amplitudes"
        },
        {
          type: "p",
          text: "This is ordinary two-beam interference, not a quantum peculiarity. The same cancellation makes the dark fringe of a classical interferometer dark. The quantum content appears only when the object is live and the two alternatives are no longer both available."
        },
        {
          type: "callout",
          tone: "caution",
          title: "A D1 click does not certify a dud",
          body: "A dud always gives D1, but a live bomb also gives D1 with probability 1/4. One D1 click therefore leaves the question open. Only repeated D1 clicks, with no explosion and no D0, make 'dud' increasingly likely — and even then it is an inference, not a proof."
        }
      ]
    },
    {
      id: "live",
      number: "3.6",
      title: "A live bomb: one amplitude is removed",
      kicker: "Where the certifying click comes from",
      blocks: [
        {
          type: "p",
          text: "A live bomb absorbs the photon if the photon takes the lower arm. That happens with probability 1/2, and in the story it detonates the bomb. If the photon takes the upper arm, the lower amplitude is removed: the object has done its work without absorbing this photon."
        },
        {
          type: "eq",
          latex: LATEX.absorbed,
          number: "3.3",
          note: "The surviving state is written in the original normalisation; its norm is 1/2 because we are conditioning on the photon having taken the upper arm."
        },
        {
          type: "p",
          text: "The surviving amplitude now meets the second splitter alone. With nothing to cancel it, it splits equally between the two output ports. Normalising the surviving branch gives 1/√2 at each port, so the unconditional probabilities are 1/4 at D0 and 1/4 at D1. A D0 click therefore occurs in the branch where the photon did not enter the absorbing arm."
        },
        {
          type: "derivation",
          derivationId: "live-amplitudes"
        },
        {
          type: "callout",
          tone: "principle",
          title: "The evidence is an absence",
          body: "When D0 clicks, the lower amplitude must have been removed. The only thing that can remove it is the live bomb. The photon that produced the click travelled the upper arm and never reached the object."
        }
      ]
    },
    {
      id: "accounting",
      number: "3.7",
      title: "Probability accounting",
      kicker: "1/2, 1/4, 1/4",
      blocks: [
        {
          type: "p",
          text: "The ideal model has three mutually exclusive outcomes for a live bomb and one effective outcome for a dud. Each row must sum to one; that is the first check on any implementation."
        },
        {
          type: "table",
          caption: "Ideal outcome probabilities",
          head: ["Bomb", "Explosion", "D0", "D1", "Sum"],
          rows: [
            ["Live", "1/2", "1/4", "1/4", "1"],
            ["Dud", "0", "0", "1", "1"],
            ["Random 50/50", "1/4", "1/8", "5/8", "1"]
          ],
          align: ["l", "r", "r", "r", "r"]
        },
        {
          type: "diagram",
          kind: "bomb-tester",
          caption: "The bomb tester. A live absorber sits in the lower arm. A D0 click certifies a live bomb; a D1 click is inconclusive; absorption on the lower arm is the explosion branch."
        },
        {
          type: "p",
          text: "The third row is the one a randomly chosen bomb produces. It follows from the 50/50 prior: P(explosion) = (1/2)(1/2) = 1/4, P(D0) = (1/2)(1/4) = 1/8, and P(D1) = (1/2)(1/4) + (1/2)(1) = 5/8. These sum to one, as they must."
        },
        {
          type: "eq",
          latex: LATEX.pD0,
          number: "3.4",
          note: "For the symmetric 50:50 case η1 = η2 = 1/2. More generally the dark port is exactly dark for a dud when the pair is complementary, η1 + η2 = 1; an arbitrary unbalanced pair leaves a residual D0 probability."
        },
        {
          type: "eq",
          latex: LATEX.pD1,
          number: "3.5"
        }
      ]
    },
    {
      id: "repetition",
      number: "3.8",
      title: "Repetition, confidence and the 25% efficiency",
      kicker: "Why one trial is rarely enough",
      blocks: [
        {
          type: "p",
          text: "A 1/4 success probability per live bomb is not a defect of the principle; it is the price of a symmetrical 50:50 split. One quarter of live bombs are certified non-destructively, one half explode, and one quarter give the inconclusive D1. The fractions are exact in the ideal model and are approached by the simulated batches as 1/√n."
        },
        {
          type: "eq",
          latex: LATEX.pIf,
          number: "3.6",
          note: "Conditional on the bomb being live. With a 50/50 population the unconditional rate is 1/8."
        },
        {
          type: "eq",
          latex: LATEX.expected,
          number: "3.7"
        },
        {
          type: "p",
          text: "Because trials on different bombs are independent, the chance of at least one interaction-free detection grows geometrically. Testing n live bombs gives the following confidence:"
        },
        {
          type: "table",
          caption: "Probability of at least one D0 among n live bombs",
          head: ["n live bombs", "P(at least one D0)", "Comment"],
          rows: [
            ["5", "0.763", "Most runs still fail"],
            ["10", "0.944", "A reasonable classroom batch"],
            ["20", "0.9968", "Failure is rare but not negligible"],
            ["50", "0.9999994", "Essentially certain in the model"],
            ["100", "> 0.999999999", "Limited by model assumptions, not by chance"]
          ],
          align: ["r", "r", "l"]
        },
        {
          type: "eq",
          latex: LATEX.confidence,
          number: "3.8"
        },
        {
          type: "p",
          text: "Kwiat, Weinfurter, Herzog, Zeilinger and Kasevich demonstrated the effect with single photons and an absorbing object in 1995. They and later authors also discussed arrangements that beat the 25% of the simple two-splitter pass: recycling the surviving photon, or using a chain of very weak splittings in a quantum-Zeno configuration, raises the interaction-free fraction and approaches unity as the number of cycles grows. The price is interferometric stability over more passes. This module models only the single 50:50 pass, so 1/4 is the bound it can demonstrate, not a claim about the best possible experiment."
        },
        {
          type: "callout",
          tone: "caution",
          title: "Efficiency is not the same as certainty",
          body: "A batch that produces no D0 has not disproved the effect. It is the expected outcome for a small number of live bombs, and it is also what a misaligned interferometer produces. Distinguishing the two requires the dark-port check with a known dud."
        }
      ]
    },
    {
      id: "classical",
      number: "3.9",
      title: "The classical comparison",
      kicker: "What the quantum protocol buys",
      blocks: [
        {
          type: "p",
          text: "A classical test must send a probe into the arm occupied by the bomb. A live bomb absorbs it and explodes; a dud lets it through. The test is decisive for a dud and fatal for a live bomb. There is no classical strategy that certifies a live bomb without destroying it, because the only classical signal that distinguishes the two is absorption."
        },
        {
          type: "table",
          caption: "Classical probing versus the quantum tester (ideal model)",
          head: ["Strategy", "Live bomb", "Dud", "Non-destructive live certificate"],
          rows: [
            ["Send a probe down the bomb arm", "Absorbed; explodes", "Probe passes", "Never"],
            ["Guess without probing", "No information", "No information", "Never (a guess is not a certificate)"],
            ["Mach–Zehnder, one pass", "1/2 explosion, 1/4 D0, 1/4 D1", "D1 always", "1/4 per live bomb"]
          ]
        },
        {
          type: "eq",
          latex: LATEX.classical,
          number: "3.9"
        },
        {
          type: "p",
          text: "The quantum advantage is therefore not a faster measurement of the same quantity. It is a different logical possibility: a certificate obtained from the failure of interference rather than from absorption. The cost is that the certificate is probabilistic and that most live bombs in a single pass are still destroyed."
        }
      ]
    },
    {
      id: "meaning",
      number: "3.10",
      title: "What 'interaction-free' does and does not mean",
      kicker: "A phrase that needs care",
      blocks: [
        {
          type: "p",
          text: "In the D0 branch the detected photon did not traverse the arm containing the absorber, and no photon was absorbed by the object. That is the precise, operational content of 'interaction-free'. It does not mean that the object had no effect on the photon, and it does not mean that the photon 'would have' taken the other arm in some hidden history."
        },
        {
          type: "list",
          items: [
            "What it does mean: in the subensemble selected by a D0 click, the photon's path did not include the absorber, and the absorber's presence changed the interference that made the click possible.",
            "What it does not mean: that the photon never interacted with the object in any sense. The object's ability to absorb is exactly what removed the amplitude; if the photon had taken that arm, it would have been absorbed.",
            "What it does not mean: that the result is counterfactual in the sense of 'nothing happened on the other path'. The other path's amplitude is absent only because the object could have absorbed there.",
            "What it does not mean: that a dud has been certified. A D1 click is compatible with both states of the object.",
            "What it does not mean: that the effect is classical. Attenuated laser light can reproduce the intensities, but a genuine single-photon certification requires photon-counting statistics."
          ]
        },
        {
          type: "callout",
          tone: "misconception",
          title: "Absence of a click is not absence of influence",
          body: "The bomb's presence is necessary for the D0 click. Remove the bomb and D0 goes dark. The photon avoided the object, but the object did not avoid the photon's state: it removed one branch of the amplitude."
        },
        {
          type: "p",
          text: "Interpretational language — 'the photon knew', 'the bomb was sensed without interaction', 'counterfactual communication' — should be kept separate from the operational statement. The operational statement is the one the simulation tests: conditional on D0, the object is live; conditional on D1, nothing is decided."
        }
      ]
    },
    {
      id: "implementation",
      number: "3.11",
      title: "Making it real: single-photon requirements",
      kicker: "From thought experiment to laboratory",
      blocks: [
        {
          type: "p",
          text: "A table-top version is possible, but it is a demanding single-photon experiment rather than a laser demonstration. The following requirements are the ones that most often decide whether the effect is visible at all."
        },
        {
          type: "table",
          caption: "Requirements for a real single-photon implementation",
          head: ["Requirement", "Why it matters", "Failure mode if unmet"],
          rows: [
            ["Heralded single-photon source", "The certification is a single-photon statement; a multi-photon pulse can mimic the statistics", "Classical intensity correlations; no genuine which-path logic"],
            ["Complementary splitters (η₁ + η₂ = 1)", "The dark port is exactly dark for a dud; the 50:50 pair is the symmetric case", "Residual D0 clicks with a dud; false positives"],
            ["Path stability within the coherence length", "The two amplitudes must keep a fixed relative phase over the run", "Fringes drift; the dark port wanders"],
            ["Single-photon detectors with timing", "A click must be attributed to one photon and one trial", "Accidental counts; unreadable per-trial outcomes"],
            ["Coincidence / veto logic", "Heralding and background rejection define the analysed subensemble", "Dark counts and stray light contaminate D0"],
            ["Low-loss, balanced arms", "Loss asymmetry reduces visibility and biases the ports", "Reduced D0 rate; apparent duds"]
          ]
        },
        {
          type: "p",
          text: "Even with all of this, the experiment is not a bomb tester in the literal sense. It tests whether an absorbing object is present in one arm. The ideal model in this module deliberately removes every imperfection so that the logical core is visible; the exclusions are listed in the simulation specification."
        },
        {
          type: "callout",
          tone: "lab",
          title: "Laser safety for any real analogue",
          body: "A real analogue uses a laser and is a real optical experiment. Use the lowest power that gives a usable signal, wear wavelength-appropriate eye protection, keep a beam block in the path at all times, align at low power, and never look into the beam or its specular reflections. The 'bomb' in a table-top analogue must be an inert absorber such as an opaque card or beam block — never an explosive."
        }
      ]
    }
  ],

  equations: [
    {
      id: "bs-transformation",
      latex: LATEX.bs,
      name: "Beam-splitter transformation",
      symbols: [
        { symbol: tex`B(\eta)`, meaning: "Unitary 2×2 beam-splitter matrix" },
        { symbol: tex`\eta`, meaning: "Power reflectivity", unit: "dimensionless" },
        { symbol: tex`t`, meaning: "Transmission amplitude, √(1−η)", unit: "dimensionless" },
        { symbol: tex`r`, meaning: "Reflection amplitude, √η", unit: "dimensionless" }
      ],
      interpretation:
        "A lossless splitter maps the two input modes to two output modes. The factor i on reflection encodes the π/2 phase shift required for energy conservation.",
      assumptions: ["Lossless", "Single transverse mode", "No polarization change"],
      usedIn: ["Amplitudes through the Mach–Zehnder", "Dud and live derivations"]
    },
    {
      id: "state-after-bs1",
      latex: LATEX.afterBs1,
      name: "State after the first beam splitter",
      symbols: [
        { symbol: tex`|\psi_1\rangle`, meaning: "Single-photon state after BS1" },
        { symbol: tex`|u\rangle`, meaning: "Upper-arm mode" },
        { symbol: tex`|l\rangle`, meaning: "Lower-arm mode" }
      ],
      interpretation:
        "A photon entering port 0 is split into equal upper and lower amplitudes, with a relative i between them. The two terms are the two alternatives whose interference the experiment uses.",
      assumptions: ["50:50 splitting", "Single photon", "Coherent source"],
      usedIn: ["Amplitudes through the Mach–Zehnder"]
    },
    {
      id: "state-with-absorber",
      latex: LATEX.absorbed,
      name: "State when the lower amplitude is absorbed",
      symbols: [
        { symbol: tex`|\psi_2\rangle`, meaning: "Surviving (unnormalised) state" },
        { symbol: tex`|u\rangle`, meaning: "Upper-arm mode" }
      ],
      interpretation:
        "A live bomb removes the lower term. The surviving upper amplitude can no longer cancel at the second splitter, so the dark port acquires a nonzero probability.",
      assumptions: ["Perfect absorption on the lower arm", "No absorption on the upper arm"],
      usedIn: ["A live bomb: one amplitude is removed"]
    },
    {
      id: "p-explosion",
      latex: LATEX.pExplosion,
      name: "Explosion probability for a live bomb",
      symbols: [
        { symbol: tex`P(\text{explosion}\mid\text{live})`, meaning: "Conditional probability of detonation", unit: "dimensionless" },
        { symbol: tex`\eta`, meaning: "Reflectivity of the first splitter", unit: "dimensionless" }
      ],
      interpretation:
        "The photon takes the absorbing arm with probability equal to the first splitter's reflectivity. At 50:50, half of all live bombs are destroyed on the first pass.",
      assumptions: ["Perfect absorber", "Single photon"],
      usedIn: ["Probability accounting", "Efficiency discussion"]
    },
    {
      id: "p-d0",
      latex: LATEX.pD0,
      name: "Interaction-free detection probability",
      symbols: [
        { symbol: tex`P(D_0\mid\text{live})`, meaning: "Probability of a dark-port click given a live bomb", unit: "dimensionless" },
        { symbol: tex`\eta_1,\eta_2`, meaning: "Reflectivities of the two splitters", unit: "dimensionless" }
      ],
      interpretation:
        "The photon survives the lower arm and then reaches D0. For matched 50:50 splitters the value is 1/4, the ideal interaction-free bound of this topology.",
      assumptions: ["Complementary splitters (η₁ + η₂ = 1)", "Perfect detectors", "Dark port aligned"],
      usedIn: ["Probability accounting", "Decision rule"],
      numericExample: { statement: "Matched 50:50 splitters: (1/2)(1/2) = 1/4." }
    },
    {
      id: "p-d1",
      latex: LATEX.pD1,
      name: "Bright-port probabilities",
      symbols: [
        { symbol: tex`P(D_1\mid\text{live})`, meaning: "Bright-port probability for a live bomb", unit: "dimensionless" },
        { symbol: tex`P(D_1\mid\text{dud})`, meaning: "Bright-port probability for a dud", unit: "dimensionless" }
      ],
      interpretation:
        "A dud always exits the bright port. A live bomb exits the bright port when the photon takes the upper arm and the surviving amplitude splits toward D1. Because both states can produce D1, that click is inconclusive.",
      assumptions: ["Matched 50:50 splitters", "Ideal detectors"],
      usedIn: ["Reading the two detectors", "Decision rule"]
    },
    {
      id: "p-interaction-free",
      latex: LATEX.pIf,
      name: "Interaction-free probability per live bomb",
      symbols: [
        { symbol: tex`P_{\mathrm{IF}}`, meaning: "Probability of certifying a live bomb without destroying it", unit: "dimensionless" }
      ],
      interpretation:
        "One quarter of live bombs yield a D0 certificate in a single 50:50 pass. The other three quarters either explode (1/2) or give an inconclusive D1 (1/4).",
      assumptions: ["One pass", "Matched 50:50 splitters"],
      usedIn: ["Repetition and efficiency"]
    },
    {
      id: "p-conclusive",
      latex: LATEX.pCert,
      name: "Conclusive identification for a random bomb",
      symbols: [
        { symbol: tex`P(\text{certified live}\mid\text{random bomb})`, meaning: "Probability that one random bomb is certified live non-destructively", unit: "dimensionless" }
      ],
      interpretation:
        "With a 50/50 prior, one eighth of all bombs tested produce a non-destructive live certificate. The remaining outcomes are destructive confirmation or no decision.",
      assumptions: ["50/50 prior", "One pass", "No false positives"],
      usedIn: ["Decision rule", "Batch statistics"]
    },
    {
      id: "expected-trials",
      latex: LATEX.expected,
      name: "Expected trials per interaction-free detection",
      symbols: [
        { symbol: tex`\mathbb{E}[N]`, meaning: "Mean number of live bombs tested per D0 certificate", unit: "bombs" },
        { symbol: tex`P_{\mathrm{IF}}`, meaning: "Interaction-free probability per live bomb", unit: "dimensionless" }
      ],
      interpretation:
        "For independent trials with success probability p, the mean waiting time is 1/p. At p = 1/4, four live bombs are needed on average for one certificate.",
      assumptions: ["Independent trials", "Constant p"],
      usedIn: ["Repetition and confidence"],
      numericExample: { statement: "p = 1/4 gives E[N] = 4 live bombs." }
    },
    {
      id: "confidence-after-n",
      latex: LATEX.confidence,
      name: "Confidence after n live bombs",
      symbols: [
        { symbol: tex`n`, meaning: "Number of live bombs tested", unit: "bombs" },
        { symbol: tex`3/4`, meaning: "Probability that one live bomb does not give D0", unit: "dimensionless" }
      ],
      interpretation:
        "The probability of at least one interaction-free detection rises geometrically with the number of live bombs. It never reaches exactly one for finite n.",
      assumptions: ["Independent bombs", "Constant p = 1/4"],
      usedIn: ["Repetition and confidence", "Analysis task 2"],
      numericExample: { statement: "n = 10 gives 1 − 0.75¹⁰ = 0.9437." }
    },
    {
      id: "classical-success",
      latex: LATEX.classical,
      name: "Classical non-destructive success probability",
      symbols: [
        { symbol: tex`P_{\mathrm{classical}}`, meaning: "Probability of identifying a live bomb without destroying it by a classical probe", unit: "dimensionless" }
      ],
      interpretation:
        "A classical probe must interact with the object. A live bomb absorbs it, so the non-destructive success probability is zero, not merely small.",
      assumptions: ["Classical probe", "Live bomb absorbs the probe"],
      usedIn: ["The classical comparison"]
    }
  ],

  derivations: [
    {
      id: "dud-amplitudes",
      title: "Amplitudes for a dud",
      intro:
        "Both arms are open. Propagate the two amplitudes to the second splitter and add them with the beam-splitter phases.",
      steps: [
        {
          label: "Input",
          text: "A single photon enters port 0. The input vector is (1, 0).",
          latex: tex`|\mathrm{in}\rangle=|0\rangle`
        },
        {
          label: "After BS1",
          text: "Apply the 50:50 matrix. The upper amplitude is 1/√2; the lower amplitude is i/√2.",
          latex: tex`|\psi_1\rangle=\frac{1}{\sqrt{2}}|u\rangle+\frac{i}{\sqrt{2}}|l\rangle`
        },
        {
          label: "Propagation",
          text: "Mirrors and path lengths add phases. In the balanced dark-port setting the relative phase is zero, so both amplitudes arrive with the same phase they had after BS1.",
          latex: tex`\phi_u-\phi_l=0`
        },
        {
          label: "At BS2, D0 output",
          text: "The upper amplitude is transmitted and the lower is reflected. The two terms have opposite sign and equal magnitude.",
          latex: tex`a_{D0}=\frac{1}{\sqrt{2}}\cdot\frac{1}{\sqrt{2}}+\frac{i}{\sqrt{2}}\cdot\frac{i}{\sqrt{2}}=\frac{1}{2}-\frac{1}{2}=0`
        },
        {
          label: "At BS2, D1 output",
          text: "The upper amplitude is reflected and the lower is transmitted. The two terms add in phase.",
          latex: tex`a_{D1}=\frac{i}{\sqrt{2}}\cdot\frac{1}{\sqrt{2}}+\frac{1}{\sqrt{2}}\cdot\frac{i}{\sqrt{2}}=\frac{i}{2}+\frac{i}{2}=i`
        },
        {
          label: "Probabilities",
          text: "Take |amplitude|². The dark port is exactly dark and the bright port fires with certainty.",
          latex: tex`P(D_0\mid\text{dud})=0,\qquad P(D_1\mid\text{dud})=1`
        }
      ],
      result: {
        latex: tex`P(D_0\mid\text{dud})=0,\qquad P(D_1\mid\text{dud})=1`,
        text: "A dud preserves both amplitudes; their destructive interference keeps D0 dark. This is the reference condition against which the live case is compared."
      },
      assumptions: [
        "Matched 50:50 splitters",
        "Equal arm losses and a fixed relative phase of zero",
        "Perfect detectors"
      ]
    },
    {
      id: "live-amplitudes",
      title: "Amplitudes for a live bomb",
      intro:
        "The lower arm is absorbing. Split the calculation into the branch where the photon is absorbed and the branch where it survives.",
      steps: [
        {
          label: "After BS1",
          text: "The state is the same as for the dud: equal upper and lower amplitudes.",
          latex: tex`|\psi_1\rangle=\frac{1}{\sqrt{2}}|u\rangle+\frac{i}{\sqrt{2}}|l\rangle`
        },
        {
          label: "Absorption branch",
          text: "The photon takes the lower arm with probability 1/2. The bomb absorbs it and, in the story, explodes. This branch produces no detector click.",
          latex: tex`P(\text{explosion})=\left|\frac{i}{\sqrt{2}}\right|^2=\frac{1}{2}`
        },
        {
          label: "Surviving branch",
          text: "With probability 1/2 the photon takes the upper arm. The lower term is removed, leaving an unnormalised amplitude 1/√2 on the upper mode.",
          latex: tex`|\psi_2\rangle=\frac{1}{\sqrt{2}}|u\rangle,\qquad \||\psi_2\rangle\|^2=\frac{1}{2}`
        },
        {
          label: "At BS2, D0",
          text: "Only the upper amplitude is present. Transmission to D0 gives amplitude 1/2.",
          latex: tex`a_{D0}=\frac{1}{\sqrt{2}}\cdot\frac{1}{\sqrt{2}}=\frac{1}{2}`
        },
        {
          label: "At BS2, D1",
          text: "Reflection to D1 gives amplitude i/2.",
          latex: tex`a_{D1}=\frac{i}{\sqrt{2}}\cdot\frac{1}{\sqrt{2}}=\frac{i}{2}`
        },
        {
          label: "Unconditional probabilities",
          text: "Square the amplitudes. Each output receives 1/4; the three live-bomb outcomes sum to one.",
          latex: tex`P(D_0\mid\text{live})=\frac{1}{4},\qquad P(D_1\mid\text{live})=\frac{1}{4},\qquad \frac{1}{2}+\frac{1}{4}+\frac{1}{4}=1`
        }
      ],
      result: {
        latex: tex`P(D_0\mid\text{live})=\tfrac{1}{4},\qquad P(D_1\mid\text{live})=\tfrac{1}{4},\qquad P(\text{explosion}\mid\text{live})=\tfrac{1}{2}`,
        text: "The D0 click occurs only in the surviving branch, so it certifies a live bomb without absorption. The D1 click is ambiguous because the same upper-arm survival can end at either port."
      },
      assumptions: [
        "Perfect absorption on the lower arm",
        "Matched 50:50 splitters",
        "No loss or dark counts"
      ]
    },
    {
      id: "decision-rule",
      title: "Overall success probability and the decision rule",
      intro:
        "Turn the outcome probabilities into an observer's rule, then count how often the rule is conclusive and how often it can be wrong.",
      steps: [
        {
          label: "Outcomes",
          text: "There are three records: explosion, D0 and D1. The observer does not know the bomb type when the record is written.",
          latex: tex`\mathcal{O}=\{\text{explosion},D_0,D_1\}`
        },
        {
          label: "Rule",
          text: "D0 is impossible for a dud, so it certifies live. An explosion also certifies live, destructively. D1 is produced by both states, so it certifies nothing.",
          latex: tex`D_0\Rightarrow\text{live},\qquad \text{explosion}\Rightarrow\text{live (destructive)},\qquad D_1\Rightarrow\text{no conclusion}`
        },
        {
          label: "Per live bomb",
          text: "The three probabilities are 1/2, 1/4 and 1/4. The non-destructive certificate is the D0 branch.",
          latex: tex`P_{\mathrm{IF}}=\frac{1}{4},\qquad P_{\text{destroy}}=\frac{1}{2},\qquad P_{\text{inconclusive}}=\frac{1}{4}`
        },
        {
          label: "Per random bomb",
          text: "Average over the 50/50 prior. One eighth of all bombs are certified non-destructively, one quarter explode, and five eighths are inconclusive.",
          latex: tex`P(\text{cert})=\frac{1}{8},\qquad P(\text{explosion})=\frac{1}{4},\qquad P(D_1)=\frac{5}{8}`
        },
        {
          label: "False positives",
          text: "A false positive would require D0 or an explosion from a dud. Both require the lower amplitude to be removed, which a transparent dud cannot do. In the ideal model the false-positive probability is exactly zero.",
          latex: tex`P(\text{conclude live}\mid\text{dud})=0`
        },
        {
          label: "What a D1 run teaches",
          text: "Repeated D1 clicks do not certify a dud, but they update the posterior. With P(D1|live)=1/4 and P(D1|dud)=1, n consecutive D1 clicks give the following posterior for a 50/50 prior.",
          latex: LATEX.posterior
        }
      ],
      result: {
        latex: tex`P_{\mathrm{IF}}=\frac{1}{4},\qquad P(\text{false positive})=0,\qquad P(\text{live}\mid n\times D_1)=\frac{1}{1+4^n}`,
        text: "The decision rule is asymmetric on purpose: it can certify live and can never certify a dud. 'Dud' is an inference from repeated inconclusive results, not a single-shot certificate."
      },
      assumptions: [
        "Ideal 50:50 interferometer",
        "50/50 prior for the posterior example",
        "Independent trials"
      ]
    }
  ],

  simulation: SIMULATION_SPEC,

  procedure: [
    {
      id: "define",
      title: "Define the states and the question",
      purpose: "Fix the hypotheses and the evidence before touching any control.",
      steps: [
        {
          title: "Write the two hypotheses",
          detail: "H_live: the object in the lower arm absorbs a photon. H_dud: it is transparent. Write down the three possible records: explosion, D0, D1."
        },
        {
          title: "State the cost asymmetry",
          detail: "A false 'dud' is dangerous; a false 'live' is merely wrong. A destructive confirmation is certain but ends the test. Decide what would count as a non-destructive certificate."
        },
        {
          title: "Predict before measuring",
          detail: "Before running the simulator, write your predicted probabilities for each hypothesis and each record. Commit to them; the comparison is the point of the exercise.",
          checkpoint: "You can state, in one sentence, which single outcome would certify a live bomb and why."
        }
      ]
    },
    {
      id: "align",
      title: "Align the interferometer and verify the dark port",
      purpose: "Establish the reference condition: no object, D0 dark.",
      steps: [
        {
          title: "Balance the arms",
          detail: "In the model, set the relative phase to zero. In a real analogue, adjust the path length until the D0 count is at its minimum and D1 at its maximum."
        },
        {
          title: "Measure the extinction",
          detail: "Record the ratio of D0 to D1 counts with no object. The ideal model gives zero; a real instrument gives a finite extinction ratio set by alignment, loss balance and dark counts."
        },
        {
          title: "Check reproducibility",
          detail: "Repeat the reference run with the same seed and confirm that the sequence is identical. Change the seed and confirm that it changes.",
          checkpoint: "With no object, D0 is dark and D1 carries essentially all the counts.",
          caution:
            "Any real analogue uses a laser. Keep the beam blocked when not measuring, use the lowest usable power, wear appropriate eyewear and never look into the beam."
        }
      ]
    },
    {
      id: "insert",
      title: "Insert the abstract absorber",
      purpose: "Introduce the object without revealing its state to the observer.",
      steps: [
        {
          title: "Place the object on one arm only",
          detail: "Conceptually place a perfect absorber on the lower arm. In a table-top analogue use an opaque card or beam block that interrupts the lower arm and nothing else."
        },
        {
          title: "Verify the interception",
          detail: "Confirm that the object removes the lower arm and leaves the upper arm untouched. An object that clips both arms destroys the interference for the wrong reason."
        },
        {
          title: "Hide the state",
          detail: "In 'Single trial' mode the simulator does not reveal whether the object is live or a dud until after the measurement. Keep the same discipline in a real run: the observer must not know the answer when recording the outcome.",
          checkpoint: "The object is on one arm, the other arm is clear, and the bomb type is hidden.",
          caution:
            "In a real analogue the 'bomb' is an inert absorber. Never use an explosive or a pyrotechnic device as a stand-in."
        }
      ]
    },
    {
      id: "record",
      title: "Record single-photon outcomes",
      purpose: "Acquire one unambiguous record per photon.",
      steps: [
        {
          title: "One photon per trial",
          detail: "Fire a single photon and record exactly one of: explosion (absorption on the object arm), D0, or D1. In the model, 'explosion' is a declared outcome, not a detector click."
        },
        {
          title: "Record before revealing",
          detail: "Write the outcome and the verdict first, then reveal the bomb type. This prevents the truth from contaminating the decision rule."
        },
        {
          title: "Note the nulls",
          detail: "If no detector fires in a real run, record that as a loss event, not as a D1. The ideal model has no such events; a real experiment does.",
          checkpoint: "Every row has exactly one outcome and a verdict that uses only the outcome."
        }
      ]
    },
    {
      id: "repeat",
      title: "Repeat and accumulate statistics",
      purpose: "Move from single events to frequencies and intervals.",
      steps: [
        {
          title: "Run a batch",
          detail: "Use at least 200 trials for a first look and 2000 or more before quoting a rate. Record the seed so the run can be reproduced."
        },
        {
          title: "Keep conditions fixed",
          detail: "Do not pool runs with different alignments, seeds or populations without recording the change. A drifted interferometer is a different experiment."
        },
        {
          title: "Track all three outcomes",
          detail: "Count explosions, D0 and D1 separately. A summary that reports only the D0 rate hides the explosion branch that dominates the cost.",
          checkpoint: "The three counts sum to the number of trials, and the live/dud totals sum to the same number."
        }
      ]
    },
    {
      id: "analyse",
      title: "Analyse, decide and state the limits",
      purpose: "Turn the records into a calibrated statement, not a slogan.",
      steps: [
        {
          title: "Compare frequencies with theory",
          detail: "Check P(D0|live), P(explosion|live) and P(D1|dud) against 1/4, 1/2 and 1. Include an interval, not just a point estimate."
        },
        {
          title: "Audit the decision rule",
          detail: "Count certified live, destructive confirmations, inconclusive results and false conclusions. In the ideal model the false count must be zero."
        },
        {
          title: "State what the model excludes",
          detail: "List the idealisations that would change a real experiment: loss, dark counts, multi-photon emission, misalignment and decoherence. A result quoted without these is overclaimed.",
          checkpoint: "You can quote an efficiency with an interval and name at least three reasons a real experiment would differ."
        }
      ]
    }
  ],

  observations: [
    {
      id: "trial-log",
      title: "Single-trial log",
      purpose: "Record each photon before revealing the object's state.",
      columns: [
        { key: "trial", label: "Trial", type: "number" },
        { key: "outcome", label: "Outcome", type: "text" },
        { key: "verdict", label: "Verdict from outcome alone", type: "text" },
        { key: "bomb", label: "Bomb type (revealed after)", type: "text" },
        { key: "interactionFree", label: "Interaction-free?", type: "number" }
      ],
      guidance:
        "One row per photon. Fill outcome and verdict before looking at the revealed bomb type. Code interaction-free as 1 for D0 and 0 otherwise.",
      formula: tex`\text{verdict}=f(\text{outcome only})`
    },
    {
      id: "cumulative",
      title: "Cumulative statistics",
      purpose: "Track the approach to the ideal probabilities and the growth of confidence.",
      columns: [
        { key: "n", label: "Trials", type: "number" },
        { key: "live", label: "Live bombs", type: "number" },
        { key: "d0", label: "D0", type: "number" },
        { key: "d1", label: "D1", type: "number" },
        { key: "explosions", label: "Explosions", type: "number" },
        { key: "rate", label: "D0 / live", type: "number" },
        { key: "ciLow", label: "Wilson low", type: "number" },
        { key: "ciHigh", label: "Wilson high", type: "number" }
      ],
      guidance:
        "Update after every 20 trials. Keep the seed fixed within a series. Compare the rate column with 0.250 and check that the interval narrows as 1/√n.",
      formula: tex`\hat p=\frac{N_{D_0}}{N_{\text{live}}}`
    }
  ],

  analysis: [
    {
      id: "frequencies",
      title: "Outcome frequencies against theory",
      method:
        "Compute the observed fractions of explosion, D0 and D1 separately for live and dud bombs. Compare each with the ideal table and report the absolute differences.",
      formula: tex`\hat P(o\mid k)=\frac{N_{o,k}}{N_k}`,
      steps: [
        "Tabulate the 2×3 contingency table of bomb type against outcome.",
        "Compute row-normalised fractions and their standard errors √(p(1−p)/n).",
        "Compare with 1/2, 1/4, 1/4 for live and 0, 0, 1 for dud.",
        "Comment on whether the deviations are consistent with sampling noise at your n."
      ],
      expected:
        "At a few hundred trials the fractions should be within about 0.05 of theory; the dud row should show no D0 or explosion at all."
    },
    {
      id: "confidence",
      title: "Confidence interval for the interaction-free rate",
      method:
        "Treat D0 among live bombs as a binomial proportion and compute a Wilson score interval. Wilson is preferable to the normal approximation because p is moderate and n may be small.",
      formula: tex`\frac{\hat p+\frac{z^2}{2n}\pm z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}`,
      steps: [
        "Count n_live and n_D0.",
        "Compute p̂ = n_D0 / n_live.",
        "Apply the Wilson formula with z = 1.96 for 95% confidence.",
        "Check whether 0.25 lies inside the interval and report the half-width.",
        "Repeat for n = 100, 500 and 2000 and confirm the expected 1/√n narrowing."
      ],
      expected:
        "The interval should cover 0.25 in most runs; its width should fall by roughly a factor of two when n is quadrupled."
    },
    {
      id: "decision",
      title: "Decision-rule audit",
      method:
        "Apply the rule D0 ⇒ live, explosion ⇒ live (destructive), D1 ⇒ no conclusion to every record, then compare the verdict with the hidden truth.",
      formula: tex`\text{false positive}=\#\{\text{verdict}=\text{live}\ \wedge\ \text{truth}=\text{dud}\}`,
      steps: [
        "Classify every trial by outcome and verdict.",
        "Count certified live, destructive confirmations and inconclusive results.",
        "Count false positives and false negatives.",
        "Explain why a false positive is impossible in the ideal model, and what imperfection would create one in a real experiment."
      ],
      expected:
        "False positives: zero. False negatives: the D1 live-bomb branch, which is not an error of the rule but an intrinsically inconclusive outcome."
    },
    {
      id: "expected-trials",
      title: "Expected trials and the geometric distribution",
      method:
        "Model the waiting time to the first D0 among live bombs as geometric with p = 1/4. Compare the observed waiting times with the predicted mean and distribution.",
      formula: tex`P(T=t)=(1-p)^{t-1}p,\qquad \mathbb{E}[T]=\frac{1}{p}=4`,
      steps: [
        "Record the index of the first D0 in a long live-bomb run.",
        "Repeat over several seeds and average the waiting times.",
        "Compare the mean with 4 and the histogram with the geometric prediction.",
        "Discuss why a run with no D0 is unsurprising at small n."
      ],
      expected:
        "The sample mean should be near 4 with a heavy right tail; the probability of no D0 in 10 live bombs is 0.056, not a failure of the apparatus."
    }
  ],

  errors: [
    {
      source: "Interferometer misalignment",
      type: "systematic",
      effect:
        "The dark port is not exactly dark with a dud, so D0 can click without an absorber. That destroys the certificate and creates false positives.",
      mitigation:
        "Align on the dark port with no object, record the extinction ratio, and reject runs whose reference D0 rate is inconsistent with zero within its interval."
    },
    {
      source: "Detector dark counts",
      type: "statistical",
      effect:
        "Spurious D0 clicks appear at a rate set by the detector and the ambient light, mimicking interaction-free events.",
      mitigation:
        "Cool and gate the detectors, shield stray light, measure the dark-count rate with the source blocked, and use coincidence logic where a heralding photon is available."
    },
    {
      source: "Unbalanced path loss",
      type: "systematic",
      effect:
        "Unequal attenuation in the two arms reduces the visibility and biases the ports. A dud no longer cancels exactly at D0 and a live bomb's 1/4 is distorted.",
      mitigation:
        "Measure and balance the throughput of both arms, use matched optics, and include the measured visibility in the reported model rather than quoting the ideal 1/4."
    },
    {
      source: "Multi-photon emission",
      type: "systematic",
      effect:
        "An attenuated laser can deliver two photons in one trial. The statistics then reflect a classical mixture, not a single-photon certificate.",
      mitigation:
        "Use a heralded SPDC source, measure g²(0), and keep the mean photon number per pulse far below one. Label any attenuated-laser result as a classical analogue."
    },
    {
      source: "False modelling assumptions",
      type: "systematic",
      effect:
        "Treating the ideal 1/4 as an experimental result overstates what was measured and hides the gap between the thought experiment and the bench.",
      mitigation:
        "Declare the model, list its exclusions, and report simulated and measured quantities under separate labels. Never present a model output as a measurement."
    },
    {
      source: "Analogy overreach",
      type: "systematic",
      effect:
        "Describing the absorber as a real bomb, or the result as 'testing a bomb without touching it', claims more than the experiment supports and invites unsafe or sensational readings.",
      mitigation:
        "Call it an abstract absorber, state that no explosive is involved, and keep the operational claim separate from the dramatic framing."
    }
  ],

  applications: [
    {
      title: "Interaction-free imaging",
      body:
        "The same dark-port logic can image a light-sensitive object while absorbing fewer photons than a conventional exposure. The object is inferred from the change in interference, not from photons that reached it."
    },
    {
      title: "Counterfactual communication and protocols",
      body:
        "Elitzur–Vaidman-type protocols motivate communication schemes in which the informational carrier need not traverse the channel containing the object. The interpretation is debated; the operational resource is the interferometric post-selection."
    },
    {
      title: "Quantum sensing and dark-port metrology",
      body:
        "A null at a dark port is an exquisitely sensitive detector of any perturbation that breaks the balance. The same principle underlies precision measurements of phase, loss and the presence of small absorbers."
    },
    {
      title: "Pedagogy of measurement",
      body:
        "The experiment is a compact lesson in post-selection, conditional probability and the difference between a state and a record. It is one of the clearest examples of an inference drawn from an absence."
    }
  ],

  questions: [
    {
      id: "q01",
      type: "mcq",
      difficulty: 1,
      topic: "Decision rule",
      prompt:
        "With a live bomb, a photon can exit at D0 or D1. Why does only a D0 click certify that the bomb is live?",
      options: [
        "D0 is the brighter detector, so its click is more reliable.",
        "A dud always sends the photon to D1; D0 is impossible unless the lower amplitude was removed, which only a live absorber does. D1 is also possible with a live bomb, so it is ambiguous.",
        "D1 clicks are caused only by detector noise.",
        "D0 clicks prove that the photon passed through the bomb without being absorbed."
      ],
      answerIndex: 1,
      answer:
        "A dud preserves both amplitudes and they cancel at D0, so a dud can never produce D0. A live bomb removes the lower amplitude, and the surviving upper amplitude can reach D0 with probability 1/4. D1, however, is produced both by a dud and by a live bomb whose photon took the upper arm, so it decides nothing.",
      explanation:
        "The certificate comes from the impossibility of D0 for a dud, not from the brightness of the detector. Option 4 is the classic misconception: the D0 photon did not pass through the bomb.",
      marks: 2
    },
    {
      id: "q02",
      type: "mcq",
      difficulty: 1,
      topic: "Efficiency",
      prompt: "Why is the ideal single-pass interaction-free probability 1/4 rather than 1?",
      options: [
        "Because the photon is absorbed with probability 1/2 and, when it survives, the remaining amplitude splits equally at the second beam splitter, so only half of the survivors reach D0.",
        "Because single-photon detectors are only 25% efficient.",
        "Because the bomb explodes with probability 3/4.",
        "Because the beam splitters are lossy."
      ],
      answerIndex: 0,
      answer:
        "The first splitter sends the photon to the absorbing arm with probability 1/2. In the surviving half, the second splitter sends the remaining amplitude to D0 with probability 1/2. The product is 1/4.",
      explanation:
        "The other 3/4 are the explosion branch (1/2) and the inconclusive D1 branch (1/4). No detector inefficiency is involved in the ideal 1/4.",
      marks: 2
    },
    {
      id: "q03",
      type: "mcq",
      difficulty: 1,
      topic: "Dud case",
      prompt: "A dud is placed in the lower arm. What does the ideal interferometer do?",
      options: [
        "It blocks one path, so D0 and D1 each click with probability 1/2.",
        "It preserves both amplitudes; they cancel at D0, so D1 clicks with probability 1.",
        "It shifts the phase so fringes appear at D0.",
        "It absorbs half the photon and sends the rest to D0."
      ],
      answerIndex: 1,
      answer:
        "A dud is transparent, so both amplitudes arrive at the second splitter. In the balanced setting they cancel at D0 and add at D1. The dud therefore gives D1 with certainty and D0 never.",
      explanation:
        "This is ordinary destructive interference. It is the reference condition that makes the live-bomb D0 click meaningful.",
      marks: 2
    },
    {
      id: "q04",
      type: "mcq",
      difficulty: 2,
      topic: "Decision rule",
      prompt:
        "A click at D1 is recorded and the bomb has not exploded. What can the observer conclude from that click alone?",
      options: [
        "The bomb is a dud.",
        "The bomb is live.",
        "Nothing: a dud always gives D1, but a live bomb also gives D1 when the photon takes the upper arm and exits the bright port.",
        "The interferometer is misaligned."
      ],
      answerIndex: 2,
      answer:
        "D1 is compatible with both hypotheses. A dud gives it with probability 1; a live bomb gives it with probability 1/4. One click therefore cannot decide, and treating it as 'dud' would be wrong in a quarter of live-bomb trials.",
      explanation:
        "Repeated D1 clicks do shift the posterior toward dud, but they never certify it in a finite number of trials.",
      marks: 2
    },
    {
      id: "q05",
      type: "mcq",
      difficulty: 2,
      topic: "Probability accounting",
      prompt:
        "Bombs are drawn 50/50 live and dud. What is the probability that one trial certifies a live bomb without destroying it?",
      options: ["1/8", "1/4", "1/2", "3/4"],
      answerIndex: 0,
      answer:
        "P(live) × P(D0|live) = (1/2)(1/4) = 1/8. The other outcomes are explosion (1/4), inconclusive D1 from a live bomb (1/8) and D1 from a dud (1/2).",
      explanation:
        "The conditional rate per live bomb is 1/4, but a random bomb is live only half the time.",
      marks: 2
    },
    {
      id: "q06",
      type: "mcq",
      difficulty: 2,
      topic: "Which-path information",
      prompt:
        "The second beam splitter is removed, so the two paths reach detectors without recombining. What happens to the bomb test?",
      options: [
        "D0 becomes dark for a dud, so certification still works.",
        "Which-path information is available; both bomb types give D0 or D1 with probability 1/2 and no interaction-free certification is possible.",
        "The bomb no longer interacts with the photon.",
        "The photon always reaches D1."
      ],
      answerIndex: 1,
      answer: "Without the second splitter there is no recombination and no destructive interference. The path is marked by which detector fires, so the outputs are 1/2 and 1/2 for either bomb type. D0 no longer certifies anything.",
      explanation:
        "The experiment depends on erasing the path information at BS2. Removing BS2 is a which-path measurement.",
      marks: 2
    },
    {
      id: "q07",
      type: "mcq",
      difficulty: 3,
      topic: "Efficiency",
      prompt:
        "Why can you not simply replace the first 50:50 splitter with a 1:99 splitter to reduce the explosion probability, keeping the rest of the single-pass interferometer unchanged?",
      options: [
        "A single unbalanced pair no longer gives a perfectly dark port for a dud, so a D0 click would no longer certify a live bomb. Improved schemes use a sequence of weak splittings with a recombining interferometer.",
        "Because 1:99 splitters do not exist.",
        "Because the photon would be absorbed every time.",
        "Because D0 and D1 would swap labels."
      ],
      answerIndex: 0,
      answer: "A perfectly dark D0 for a dud requires the two amplitudes at BS2 to have equal magnitude, which for a single pair means complementary splitting ratios, η1 + η2 = 1. The symmetric 50:50 pair is the special case. An unbalanced pair leaves a residual D0 probability for a dud and destroys the certificate. Kwiat-type improvements change the topology, not just one ratio.",
      explanation:
        "The 25% figure is a property of the symmetric 50:50 two-splitter topology, not a universal law.",
      marks: 3
    },
    {
      id: "q08",
      type: "mcq",
      difficulty: 1,
      topic: "Classical comparison",
      prompt:
        "In a classical test, a probe is sent along the path occupied by the bomb. What is the probability of identifying a live bomb without destroying it?",
      options: ["0", "1/4", "1/2", "1"],
      answerIndex: 0,
      answer:
        "A live bomb absorbs the probe by definition, so a classical probe that reaches it destroys it. The non-destructive success probability is zero, not merely small.",
      explanation:
        "This is the gap the quantum protocol exploits: the D0 certificate is obtained without absorption.",
      marks: 1
    },
    {
      id: "q09",
      type: "numerical",
      difficulty: 1,
      topic: "Expected counts",
      prompt: "You test 100 live bombs in the ideal 50:50 model. How many interaction-free detections do you expect?",
      answer:
        "25. Each live bomb gives D0 with probability 1/4, so the expectation is 100 × 1/4 = 25. The standard deviation is √(100 × 1/4 × 3/4) = 4.33.",
      numeric: { value: 25, tolerance: 0.5, unit: "detections" },
      explanation: "Expectation is linear; the binomial spread is not zero, so any single run will differ.",
      marks: 2
    },
    {
      id: "q10",
      type: "numerical",
      difficulty: 2,
      topic: "Confidence",
      prompt: "What is the probability of at least one D0 detection when 10 live bombs are tested?",
      answer:
        "1 − (3/4)^10 = 1 − 0.05631 = 0.9437. There is still about a 5.6% chance of no interaction-free detection in the run.",
      numeric: { value: 0.9437, tolerance: 0.002 },
      explanation: "Use the complement: every one of the 10 trials must fail to give D0.",
      marks: 2
    },
    {
      id: "q11",
      type: "numerical",
      difficulty: 2,
      topic: "Confidence",
      prompt: "Repeat the previous question for 20 live bombs.",
      answer: "1 − (3/4)^20 = 1 − 0.003171 = 0.99683.",
      numeric: { value: 0.99683, tolerance: 0.001 },
      explanation: "The failure probability falls by another factor of 0.75^10 ≈ 0.056.",
      marks: 2
    },
    {
      id: "q12",
      type: "numerical",
      difficulty: 1,
      topic: "Expected trials",
      prompt:
        "On average, how many live bombs must be tested to obtain one interaction-free detection?",
      answer: "The geometric mean is 1/p = 1/(1/4) = 4 live bombs per detection.",
      numeric: { value: 4, tolerance: 0, unit: "bombs" },
      explanation: "This is the mean of a geometric distribution, not a guarantee for any particular run.",
      marks: 1
    },
    {
      id: "q13",
      type: "numerical",
      difficulty: 2,
      topic: "Expected counts",
      prompt:
        "You test 500 bombs drawn from a 50/50 live/dud population. How many D0 clicks do you expect?",
      answer:
        "P(D0) = (1/2)(1/4) = 1/8, so the expectation is 500/8 = 62.5 D0 clicks.",
      numeric: { value: 62.5, tolerance: 0.5, unit: "clicks" },
      explanation: "Only the live half can contribute, and only a quarter of those give D0.",
      marks: 2
    },
    {
      id: "q14",
      type: "numerical",
      difficulty: 3,
      topic: "Bayesian inference",
      prompt:
        "A bomb has produced three D1 clicks in a row and has not exploded. With a 50/50 prior, what is the posterior probability that it is live?",
      answer:
        "P(live|3 D1) = (1/4)^3 / ((1/4)^3 + 1) = (1/64)/(1/64 + 1) = 1/65 = 0.01538. The evidence strongly favors dud, but does not prove it.",
      numeric: { value: 0.01538, tolerance: 0.001 },
      explanation:
        "A dud gives D1 with probability 1; a live bomb gives it with probability 1/4. Each D1 click multiplies the likelihood ratio by 4 in favor of dud.",
      marks: 3
    },
    {
      id: "q15",
      type: "numerical",
      difficulty: 2,
      topic: "Probability",
      prompt:
        "Three independent live bombs are tested. What is the probability that none of them explodes?",
      answer: "P(no explosion in 3) = (1/2)^3 = 1/8 = 0.125.",
      numeric: { value: 0.125, tolerance: 0.001 },
      explanation:
        "Survival of a live bomb has probability 1/2 per trial. This is separate from the probability of a D0 click.",
      marks: 2
    },
    {
      id: "q16",
      type: "short",
      difficulty: 2,
      topic: "Amplitudes",
      prompt: "Write the state of the photon immediately after the first 50:50 beam splitter and explain each term.",
      answer:
        "|ψ1⟩ = (1/√2)|u⟩ + (i/√2)|l⟩. The first term is the amplitude on the upper arm, the second the amplitude on the lower arm. The factor i comes from the reflection convention; the equal magnitudes encode the 50:50 split. The two terms are the alternatives whose interference the second splitter will test.",
      explanation: "State the normalisation explicitly: (1/√2)² + |i/√2|² = 1.",
      marks: 2
    },
    {
      id: "q17",
      type: "short",
      difficulty: 2,
      topic: "Dud case",
      prompt: "Show that a transparent dud makes the D0 port exactly dark.",
      answer:
        "At BS2 the D0 amplitude is the sum of the transmitted upper amplitude and the reflected lower amplitude. For a 50:50 splitter these are 1/2 and −1/2, so they cancel. Hence a(D0) = 0 and P(D0|dud) = 0.",
      explanation: "The cancellation depends on complementary splitting ratios (η₁ + η₂ = 1) and a fixed relative phase.",
      marks: 2
    },
    {
      id: "q18",
      type: "short",
      difficulty: 2,
      topic: "Interaction-free measurement",
      prompt: "When D0 clicks, what happened to the bomb, and what happened to the photon?",
      answer:
        "The bomb did not absorb the photon and did not explode. The photon travelled the upper arm, so it never entered the absorbing arm. The bomb's presence removed the lower amplitude and thus prevented cancellation at D0. The detected photon avoided the object; the object still changed the state.",
      explanation: "Keep the two claims separate: no absorption, but a real effect on the interference.",
      marks: 2
    },
    {
      id: "q19",
      type: "short",
      difficulty: 2,
      topic: "Interpretation",
      prompt: "Define 'interaction-free' precisely for this experiment.",
      answer:
        "In the subensemble selected by a D0 click, the detected photon did not traverse the arm containing the absorber, and no photon was absorbed by the object. It does not mean that the object had no effect on the state, nor that the photon 'would have' taken the other path in a hidden history.",
      explanation: "The precise claim is about the detected branch and the absence of absorption.",
      marks: 3
    },
    {
      id: "q20",
      type: "short",
      difficulty: 3,
      topic: "Interpretation",
      prompt: "If the photon never enters the absorbing arm, why is the bomb necessary for the D0 click?",
      answer:
        "Remove the bomb and the lower amplitude returns. The two amplitudes then cancel at D0, so D0 goes dark. The D0 click exists only because the live bomb removed one term. The bomb's presence is necessary even though the detected photon did not reach it.",
      explanation: "The effect is on the amplitude, not on the detected photon's trajectory.",
      marks: 3
    },
    {
      id: "q21",
      type: "short",
      difficulty: 2,
      topic: "Implementation",
      prompt: "Why must the two interferometer arms be stable to a fraction of the wavelength?",
      answer:
        "The dark port relies on a fixed relative phase between the two amplitudes. A path change of λ/2 flips the interference condition; smaller drifts reduce the extinction and make D0 clicks ambiguous. The relevant scale is the source coherence length, and for a single photon it is the coherence length of its wavepacket.",
      explanation: "Mechanical and thermal drift are the usual limits on the run time.",
      marks: 2
    },
    {
      id: "q22",
      type: "short",
      difficulty: 3,
      topic: "Decision rule",
      prompt: "Why is a dud never certified by a single trial, even in the ideal model?",
      answer:
        "A dud gives D1 with certainty, but a live bomb also gives D1 with probability 1/4. Since the observer does not know the type, a D1 record is compatible with both. Only repeated D1 clicks raise the posterior in favor of dud, and in a finite run it remains below 1.",
      explanation: "The asymmetry of the rule is deliberate: live can be certified, dud can only be inferred.",
      marks: 3
    },
    {
      id: "q23",
      type: "derivation",
      difficulty: 2,
      topic: "Dud derivation",
      prompt:
        "Derive P(D0|dud)=0 and P(D1|dud)=1 for a balanced Mach–Zehnder with a transparent object.",
      answer:
        "Start from |ψ1⟩ = (1/√2)(|u⟩ + i|l⟩). With equal arm phases, the amplitudes at BS2 are a(D0) = (1/2) + (i)(i)/2 = 1/2 − 1/2 = 0 and a(D1) = i/2 + i/2 = i. Squaring gives P(D0)=0 and P(D1)=1.",
      explanation:
        "Show the two contributions explicitly; the relative i is what turns the second term into a minus sign at D0.",
      marks: 4
    },
    {
      id: "q24",
      type: "derivation",
      difficulty: 3,
      topic: "Live derivation",
      prompt:
        "Derive P(explosion)=1/2, P(D0)=1/4 and P(D1)=1/4 for a live bomb.",
      answer:
        "The lower amplitude is i/√2, so absorption has probability 1/2. In the surviving branch the state is (1/√2)|u⟩. At BS2 the D0 amplitude is (1/√2)(1/√2) = 1/2 and the D1 amplitude is i/2. Squaring gives 1/4 each. The three probabilities sum to 1.",
      explanation:
        "Do not forget that the surviving state is unnormalised: its norm is 1/2, and the 1/4 probabilities are unconditional.",
      marks: 4
    },
    {
      id: "q25",
      type: "derivation",
      difficulty: 2,
      topic: "Confidence",
      prompt:
        "Show that the probability of at least one D0 among n live bombs is 1 − (3/4)^n.",
      answer:
        "Each live bomb independently gives no D0 with probability 1 − 1/4 = 3/4. The probability that all n fail is (3/4)^n. The complement is 1 − (3/4)^n.",
      explanation: "Independence is the key assumption; it fails if the same bomb is reused after a D1 without resetting the state.",
      marks: 3
    },
    {
      id: "q26",
      type: "derivation",
      difficulty: 3,
      topic: "Bayesian inference",
      prompt:
        "Derive the posterior P(live | n consecutive D1 clicks) = 1/(1+4^n) for a 50/50 prior.",
      answer:
        "By Bayes, P(live|n D1) = P(n D1|live)P(live) / [P(n D1|live)P(live) + P(n D1|dud)P(dud)]. With P(D1|live)=1/4, P(D1|dud)=1 and equal priors, this is (1/4)^n / [(1/4)^n + 1] = 1/(1+4^n).",
      explanation: "The equal priors cancel. Each additional D1 multiplies the odds against live by 4.",
      marks: 4
    },
    {
      id: "q27",
      type: "viva",
      difficulty: 2,
      topic: "Interpretation",
      prompt:
        "A visitor says: 'The photon must have known the bomb was there.' How do you respond?",
      answer:
        "Avoid the intentional language. The photon's state is a superposition of two amplitudes. A live bomb removes one amplitude, so the remaining amplitude no longer cancels at the dark port. Nothing needs to 'know' anything: the change in the state is sufficient to change the detection probability. Whether one wants to call this a form of counterfactuality is an interpretive question, not an operational one.",
      explanation:
        "Separate the mathematical account from the metaphor. The operational prediction is what the experiment tests.",
      marks: 3
    },
    {
      id: "q28",
      type: "viva",
      difficulty: 3,
      topic: "Foundations",
      prompt:
        "What does the experiment establish about counterfactual reasoning, and what does it not establish?",
      answer:
        "It establishes that a D0 click is impossible without the absorber, even though the detected photon did not traverse the absorbing arm. It does not establish that the photon 'took' the other path in a hidden sense, nor that information travelled backward, nor that the object was unaffected. Claims about counterfactual communication require additional protocol assumptions and remain interpretively debated.",
      explanation:
        "Stick to the conditional statement: given D0, the absorber was present and the photon did not traverse that arm.",
      marks: 3
    },
    {
      id: "q29",
      type: "viva",
      difficulty: 3,
      topic: "Efficiency",
      prompt:
        "Explain conceptually how Kwiat and co-workers improved on the 25% efficiency without inventing a new physical effect.",
      answer:
        "They changed the interferometer topology. Recycling the surviving photon or using a chain of very weak splittings means the photon is repeatedly given a small chance to be absorbed, while the interference condition still reveals the object. The interaction-free fraction rises toward unity as the number of cycles grows, at the cost of more passes and stricter stability. The physical resource is still single-photon interference and absorption.",
      explanation:
        "No new effect is needed; the improvement is in how the single photon is routed and post-selected.",
      marks: 3
    },
    {
      id: "q30",
      type: "troubleshooting",
      difficulty: 2,
      topic: "False positives",
      prompt:
        "In a real analogue, D0 clicks are recorded even with no object in either arm. List the likely causes and a diagnostic order.",
      answer:
        "Likely causes: misalignment of the second splitter or a mirror, unequal beam-splitter ratios, stray light reaching D0, detector dark counts, and a path difference outside the coherence length. Diagnose by blocking the source (dark counts), then checking the extinction with a known dud (alignment and balance), then shielding and gating (stray light), then measuring the splitter ratios.",
      explanation:
        "Always establish the no-object dark-port reference before attributing a D0 to an object.",
      marks: 3
    },
    {
      id: "q31",
      type: "troubleshooting",
      difficulty: 2,
      topic: "Missing signal",
      prompt:
        "With a known absorber on the lower arm, D0 never clicks. What should you check?",
      answer:
        "Check that the absorber really intercepts the lower arm only, that the interferometer is aligned and the path difference is within the coherence length, that the second splitter is present and balanced, that the detectors are live and correctly gated, and that the source is actually delivering single photons. A D0 rate consistent with zero can be a real null or a broken apparatus; the dud reference distinguishes them.",
      explanation:
        "A missing D0 branch is often an alignment or loss problem, not evidence against the effect.",
      marks: 3
    },
    {
      id: "q32",
      type: "troubleshooting",
      difficulty: 3,
      topic: "Accidentals",
      prompt:
        "The D0 rate is higher than 1/4 of the live-bomb rate, and it grows when the source power is increased. What is the likely explanation?",
      answer:
        "Multi-photon emission or accidental coincidences. At higher power, two photons can be present in one trial; one can take each arm, or one can trigger a detector while another contributes background. The result is a classical mixture that mimics extra D0 clicks. Reduce the mean photon number, use a heralded source, and tighten the coincidence window.",
      explanation:
        "A rate that scales nonlinearly with power is a signature of multi-photon or accidental contributions.",
      marks: 3
    },
    {
      id: "q33",
      type: "instrumentation",
      difficulty: 2,
      topic: "Hardware",
      prompt:
        "List the minimum hardware for a genuine single-photon bomb-tester demonstration and the role of each item.",
      answer:
        "A heralded single-photon source (SPDC crystal, pump, heralding detector), two matched 50:50 beam splitters, two mirrors on stable mounts, an inert absorber on one arm, two single-photon detectors (SPADs) with timing, coincidence/timing electronics, and shielding from stray light. A photodiode alone cannot resolve single clicks.",
      explanation:
        "The source and the coincidence logic are what make the experiment single-photon rather than a classical intensity demonstration.",
      marks: 3
    },
    {
      id: "q34",
      type: "instrumentation",
      difficulty: 3,
      topic: "Detection",
      prompt:
        "Why is coincidence or heralding logic necessary in a real implementation?",
      answer:
        "It defines the analysed single-photon event. The herald announces that a photon pair was created; the detection of one photon in the idler arm gates the analysis of the signal arm. Coincidence windows reject dark counts and ambient light that are not correlated with the source, and they prevent uncorrelated clicks from being counted as D0 events.",
      explanation:
        "Without gating, the D0 rate is contaminated by background and the certificate is lost.",
      marks: 3
    },
    {
      id: "bomb-x01",
      type: "mcq",
      difficulty: 2,
      topic: "Experimental perspective",
      prompt:
        "A group wants to move the bomb tester from a numerical model to a genuine single-photon demonstration. Which requirement most directly makes the experiment single-photon rather than a classical intensity measurement?",
      options: [
        "Replacing the photodiode with a camera so the beam profile can be recorded.",
        "Using a heralded single-photon source with a herald detector and coincidence logic, so each analysed event is known to contain one photon.",
        "Increasing the laser power so that the dark port is easier to see.",
        "Removing the second beam splitter to avoid its insertion loss."
      ],
      answerIndex: 1,
      answer:
        "A heralded source plus coincidence gating defines the single-photon event: the herald announces that a photon pair was created, and detection of the partner gates the signal arm. Single-photon detectors with timing are needed to resolve individual clicks. Low-loss, phase-stable optics and matched 50:50 splitters preserve the dark port, but they do not by themselves make the statistics single-photon. A camera or photodiode integrates many photons, more laser power makes the state more classical, and removing BS2 destroys the interference.",
      explanation:
        "Every item in the list matters for a real experiment, but the heralded source and coincidence logic are the defining change. An attenuated laser is a classical analogue even when its mean photon number is below one.",
      marks: 2
    },
    {
      id: "bomb-x02",
      type: "instrumentation",
      difficulty: 2,
      topic: "Dark-port verification",
      prompt:
        "Before inserting the object, how do you verify that the interferometer's dark port is actually dark, and what quantities should be recorded?",
      answer:
        "With no object in either arm, align the two paths to equal optical length within the source coherence length and adjust the second splitter or a mirror for minimum D0 and maximum D1. Record the counts N_D0 and N_D1 over a fixed integration time, form the extinction ratio N_D0/N_D1 (or the visibility), and compare N_D0 with the dark-count floor measured with the source blocked. Also record the stability of the ratio over the intended run time. Accept the reference only if D0 is consistent with the dark-count background; otherwise a later D0 click cannot be interpreted as an interaction-free certificate.",
      explanation:
        "The reference run defines what 'dark' means for this apparatus. Without it, a D0 click has no calibrated significance.",
      hint: "Block the source first, then open it. That separates detector background from optical leakage.",
      marks: 3
    },
    {
      id: "bomb-x03",
      type: "mcq",
      difficulty: 2,
      topic: "False positives",
      prompt:
        "Why do detector dark counts create false positives in the bomb test, even when the interferometer is perfectly aligned?",
      options: [
        "They raise the photon energy above the absorption threshold of the bomb.",
        "A dark count in D0 is indistinguishable from a real D0 photon, so it can be scored as an interaction-free detection when no absorber removed the lower amplitude.",
        "They change the beam-splitter ratio away from 50:50.",
        "They make a dud absorb the photon on the lower arm."
      ],
      answerIndex: 1,
      answer: "A dark count is a detector event with no photon behind it. The observer's rule D0 ⇒ live cannot distinguish it from a genuine D0 click. With a dud the true D0 rate is zero, so every D0 event is background, stray light or misalignment rather than a certificate. Mitigate by cooling and gating the detector, shielding the port, using coincidence with a herald, and measuring the residual dark-count rate so it can be subtracted or bounded.",
      explanation:
        "A false positive is an apparent certificate, so the dark-count floor sets the confidence of any single D0 click. It does not change the beam-splitter physics.",
      marks: 2
    },
    {
      id: "bomb-x04",
      type: "mcq",
      difficulty: 2,
      topic: "Interpretation trap",
      prompt:
        "A student's log reads 'D1 → dud'. The bomb is later revealed to have been live. What was the error?",
      options: [
        "D1 is the dark port, and a live bomb cannot reach it.",
        "D1 is the bright port and a live bomb reaches it with probability 1/4 when the photon takes the upper arm; a dud also reaches it with probability 1, so the click was inconclusive rather than proof of a dud.",
        "A live bomb always explodes before any detector can fire.",
        "D1 clicks are produced only by detector noise."
      ],
      answerIndex: 1,
      answer:
        "P(D1|live) = 1/4 and P(D1|dud) = 1. A D1 click therefore favours dud by a likelihood ratio of 4, but it does not prove it; the live-bomb branch remains possible. Repeated D1 clicks update the posterior as 1/(1+4^n), and only D0 certifies live. No finite run certifies a dud with certainty in the ideal model.",
      explanation:
        "The decision rule is asymmetric on purpose. D1 is an inconclusive record, not a malfunction and not a dud certificate.",
      marks: 2
    },
    {
      id: "bomb-x05",
      type: "short",
      difficulty: 3,
      topic: "Dud, loss and absorption",
      prompt:
        "In the ideal model a dud never clicks D0. In a real experiment a dud can produce D0-like events. Distinguish loss from absorption and explain what each does to the inference.",
      answer:
        "In the ideal model a dud is transparent: both amplitudes arrive at the second splitter and cancel at D0, so P(D0|dud) = 0. Absorption on the lower arm is the live object's action; it removes that amplitude and spoils the cancellation, which is what makes D0 informative. Loss is any other removal of light — scattering, finite splitter transmission, detector inefficiency — and it can occur on either arm. Loss also spoils the balance and can make D0 click with a dud, but it does not certify the object's presence. A D0 click therefore supports 'live' only when all other loss and background channels are characterised and excluded; otherwise the observed rate is a lower bound on the true interaction-free rate.",
      explanation:
        "The certificate requires that the only thing capable of removing the lower amplitude is the object. Loss and absorption look similar in the count rate but have different evidential status.",
      marks: 3
    },
    {
      id: "bomb-x06",
      type: "viva",
      difficulty: 1,
      topic: "Analogy",
      prompt:
        "A headline says the experiment 'tests a bomb without touching it'. What is actually tested, and where does the analogy break?",
      answer:
        "The experiment tests whether an absorbing object is present in one arm of an interferometer, by the change it produces in the interference at the output ports. In the model the object is a perfect single-photon absorber and absorption is declared an explosion; no explosive, fuse, chemistry or blast is represented. A real demonstration uses an inert absorber such as an opaque card, a beam block or a mirror. The analogy is useful because it captures the cost asymmetry between destructive and non-destructive testing and the logic of a null result. It breaks if it is read as a claim about actual explosives, macroscopic safety or a real bomb being handled.",
      explanation:
        "Keep the operational claim — absorber present or absent — separate from the dramatic framing.",
      marks: 2
    },
    {
      id: "bomb-x07",
      type: "numerical",
      difficulty: 2,
      topic: "Confidence",
      prompt:
        "A batch contains 12 live bombs, each tested once in the ideal 50:50 model. What is the probability of at least one D0 detection? Give the value to four decimal places.",
      answer:
        "1 − (3/4)^12 = 1 − 0.031676 = 0.9683. Each live bomb fails to give D0 with probability 3/4, so the chance that all twelve fail is 0.0317; the complement is the detection confidence.",
      numeric: { value: 0.9683, tolerance: 0.001, unit: "probability" },
      explanation: "Use the complement. The result is a property of the batch, not a guarantee for any one bomb.",
      marks: 2
    },
    {
      id: "bomb-x08",
      type: "numerical",
      difficulty: 3,
      topic: "Non-ideal detection",
      prompt:
        "The optics are ideal, but each detector registers a photon with probability 0.60 and there are no dark counts. What is the expected number of live bombs that must be tested per registered D0 click? A trial with no registered click is discarded.",
      answer:
        "P(registered D0 | live) = P(D0|live) × efficiency = (1/4)(0.60) = 0.15. The mean waiting time is 1/0.15 = 6.667 live bombs per registered D0. Equivalently, the observed interaction-free rate per live bomb falls from 0.25 to 0.15.",
      numeric: { value: 6.667, tolerance: 0.02, unit: "live bombs" },
      explanation:
        "Detector inefficiency is a loss channel: it reduces the rate but does not create false positives when dark counts are zero. If the two detectors differ, use the D0 detector's efficiency for this rate.",
      marks: 3
    },
    {
      id: "bomb-x09",
      type: "viva",
      difficulty: 3,
      topic: "Applications and meaning",
      prompt:
        "Interaction-free imaging and counterfactual communication are often cited as applications. State what the bomb-tester logic actually supplies in each case, and what 'interaction-free' does not mean.",
      answer:
        "In interaction-free imaging, the object is inferred from the change in interference at a dark port. In the subensemble selected by a D0 click, the detected photons did not traverse the object arm, so a light-sensitive sample can in principle be imaged with fewer absorbed photons. In counterfactual communication protocols, the same post-selection idea constrains where the informational carrier travels, but the protocols require additional assumptions and their interpretation is debated. 'Interaction-free' does not mean that the object had no effect on the state: its ability to absorb is exactly what removed the amplitude. It does not mean that no photon could have interacted, that a dud has been certified, or that information travelled without any physical support.",
      explanation:
        "Separate the operational resource — dark-port post-selection — from the interpretational claims built on top of it.",
      marks: 4
    },
    {
      id: "bomb-x10",
      type: "viva",
      difficulty: 3,
      topic: "Efficiency bound",
      prompt:
        "A colleague claims that 25% is a fundamental law of nature for interaction-free measurement. Correct them, with the probability argument and the route to higher efficiency.",
      answer:
        "For the single 50:50 Mach–Zehnder the first splitter sends the photon to the absorbing arm with probability 1/2, which is the explosion branch. In the surviving half, the second splitter sends the remaining amplitude to D0 with probability 1/2. The product is 1/4; the other 3/4 are the explosion branch (1/2) and the inconclusive D1 branch (1/4). This 25% is a property of the topology, not a universal law. Recycling the surviving photon, or using a chain of weak splittings with a recombining interferometer, raises the interaction-free fraction toward unity as the number of cycles grows, at the cost of more passes and stricter phase stability. Simply unbalancing one splitter of a single pair does not work, because it spoils the dark port for a dud.",
      explanation:
        "Distinguish the single-pass bound from the asymptotic behaviour of improved schemes. The physical resource is still single-photon interference and absorption.",
      marks: 4
    }
  ],

  references: [
    "elitzur1993",
    "kwiat1995",
    "loudon",
    "nielsen",
    "griffiths",
    "hecht",
    "bornwolf",
    "saleh",
    "fowles",
    "taylor",
    "thorlabs_edu",
    "nist_sp800_22"
  ].map(reference),

  related: ["mach-zehnder-interferometer", "quantum-eraser", "quantum-key-distribution"],

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
export { content };
