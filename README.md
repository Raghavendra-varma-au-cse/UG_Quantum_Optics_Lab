# Quantum Optics Laboratory

[![Deploy to GitHub Pages](https://github.com/Raghavendra-varma-au-cse/UG_Quantum_Optics_Lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/Raghavendra-varma-au-cse/UG_Quantum_Optics_Lab/actions/workflows/deploy.yml)
[![Live laboratory](https://img.shields.io/badge/live-laboratory-14524A)](https://Raghavendra-varma-au-cse.github.io/UG_Quantum_Optics_Lab/)

An interactive undergraduate quantum optics laboratory: eight experiments, each with theory and derivations, a working
numerical bench, real alignment procedure, measurement templates, uncertainty analysis, a viva-level question bank and
local-first progress.

Built with Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS, Framer Motion, React Three Fiber, KaTeX,
Zustand and IndexedDB.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/ (also runs the scientific tests in CI)
npm run preview    # serve out/ locally
npm run typecheck  # tsc --noEmit
npm run test       # vitest (shared physics + experiment model tests)
```

Node 20.9+ is required by Next 16.

---

## Live site and deployment

**Repository:** <https://github.com/Raghavendra-varma-au-cse/UG_Quantum_Optics_Lab>  
**Live laboratory:** <https://Raghavendra-varma-au-cse.github.io/UG_Quantum_Optics_Lab/>

The site is a **fully static export** (`output: "export"`), specifically so it can be hosted on GitHub Pages. Every
experiment mode is a prerendered route:

```
/experiments/<slug>/              Understand
/experiments/<slug>/experiment/   Bench
/experiments/<slug>/master/       Questions and viva
/experiments/<slug>/practical/    Measurements and report
```

A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs the tests, builds with the repository base path, and
publishes `out/` to Pages. To enable it:

1. Create a **public** repository and push this project to `main`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Run the workflow (or push to `main`). The site appears at
   `https://<owner>.github.io/<repo>/` for a project site, or `https://<owner>.github.io/` for a user site.

For a project site the workflow sets `NEXT_PUBLIC_BASE_PATH=/UG_Quantum_Optics_Lab` automatically. For a user or
organisation site (`<owner>.github.io`) it uses an empty base path. Local builds default to no base path.

### Clone and run

```bash
git clone https://github.com/Raghavendra-varma-au-cse/UG_Quantum_Optics_Lab.git
cd UG_Quantum_Optics_Lab
npm ci
npm run dev
```

### Publish from the command line

```bash
gh auth login
gh repo create <repo-name> --public --source=. --remote=origin --push
```

The included workflow enables GitHub Pages on its first successful run, builds with the correct base path, and deploys
`out/`. If the Pages site already exists, no manual setting is required.


---

## What is real, and what is not

This is a teaching platform, so provenance is part of the interface.

| Label | Meaning |
| --- | --- |
| **Actual laboratory implementation** | The kit can exist in an undergraduate laboratory with the listed source and detector. |
| **Classical optical demonstration** | The same mathematics is demonstrated with coherent light. It is not a single-photon measurement unless a heralded source, SPAD and coincidence electronics are added. |
| **Theoretical / numerical simulation** | No commercial kit is assumed. Results are model outputs. |

Every simulation has a **Model** disclosure in the bench: the equations, the approximations, the validity range and what
it does **not** claim. Simulated measurements are labelled in tables, CSV files, charts and reports.

Hardware is marked `verified`, `partially-verified` or `unverified`. No SKU, datasheet value, citation or DOI is
invented. Where the physical kit label has not been checked, the configuration says so and must be completed from the
packing list. Thorlabs is referenced as a manufacturer of generic teaching optomechanics; this project is independent
and not endorsed by Thorlabs.

The 3D bench is a schematic arrangement, not a CAD model or a measured layout.

---

## Application structure

```
src/
  app/
    page.tsx                     Laboratory overview (live hero instrument, index, progression)
    experiments/                 Directory + [slug] Understand, /experiment, /master, /practical
    components/                  Searchable optical & optomechanical library + detail
    hardware/                    Inventory, verification status, per-experiment configuration
    instruments/                 Instrumentation reference + simulated oscilloscope
    mathematics/                 Ten chapters with interactive parameters and problems
    quantum-mechanics/           Eight foundations chapters connected to the experiments
    alignment/                   Beam-steering, focus and fringe alignment trainer
    practical/                   Practical mode index
    analysis/                    CSV import, regression, residuals, uncertainty
    notebook/                    Local-first laboratory records
    exam/                        Mixed seeded papers, practice, viva, attempt history
    progress/                    Per-mode progress and local data export
  components/
    ui/                          Typography, equations, controls, tables, figures
    sim/                         Shared SimulatorShell and model disclosure
    viz/                         Canvas intensity fields, Recharts scientific plots
    diagrams/                    Precise SVG optical layouts
    three/                       Lazy-loaded React Three Fiber bench
    experiments/                 Experiment page shell and mode navigation
    practical/ analysis/ exam/   Workspaces
  experiments/<slug>/
    content.ts                   Theory, equations, procedure, questions, references
    physics.ts                   Pure, unit-tested physical model
    physics.test.ts              Numerical validation
    Simulation.tsx               Client bench using the shared shell
  lib/
    physics/                     Shared interference, polarization, quantum, QKD,
                                 Fourier, Gaussian-beam and statistics engines
    content/                     Types, registry, curated references, hardware DB
    data/                        CSV, analysis, report generation, notebook types
    store/                       Zustand progress (persisted to IndexedDB)
    db.ts                        Versioned IndexedDB access
```

### Separation of concerns

- **Physics** is pure TypeScript with SI units and no React imports.
- **Content** is serialisable data; it contains no calculations that would drift from the model.
- **UI** renders data and physics results; it never invents a value.
- **State** for progress is Zustand + IndexedDB. Experiment-local state is React state.
- **Exports** preserve raw values; fitted values are separate.

---

## The eight experiments

| # | Experiment | Evidence label | Core model |
| --- | --- | --- | --- |
| 01 | Michelson interferometer | Actual lab | Two-beam interference, coherence envelope, fringe counting |
| 02 | Mach–Zehnder interferometer | Classical demonstration | Unitary beam-splitter matrices, complex amplitudes |
| 03 | Quantum bomb tester | Simulation | Ideal Elitzur–Vaidman probabilities, seeded Monte Carlo |
| 04 | Quantum eraser | Classical demonstration | Polarization marking, visibility/distinguishability |
| 05 | Polarization & 3D cinema | Actual lab | Jones calculus, Stokes/Poincaré, stereo channel separation |
| 06 | Fourier optics | Actual lab | Numerical 2D FFT in a Web Worker, 4f filtering |
| 07 | Quantum key distribution | Simulation | Stochastic BB84, intercept–resend, sifting, QBER, correction |
| 08 | Optical tweezers | Actual lab | Gaussian beam, Rayleigh force, Langevin Brownian motion |

Every experiment carries the same completion structure: content, simulation, procedure, analysis, questions, references
and validation. The `status` field in each content file is displayed in the Master panel.

---

## Scientific validation

Shared engine tests: `src/lib/physics/physics.test.ts`.

They check, among other things:

- Michelson fringe period and wavelength inversion (λ = 2Δd/N).
- Coherence envelope and visibility limits.
- Malus's law, Jones unitarity, half/quarter-wave plate action, Stokes/Poincaré round-trip.
- Beam-splitter unitarity and Mach–Zehnder probability conservation.
- Bomb-tester probabilities and the 1/4 interaction-free bound.
- D² + V² = 1 for pure which-path marking and conditional erasure.
- BB84 ideal QBER, ≈25% intercept–resend QBER, sifting fraction, determinism, parity correction.
- FFT delta/constant transforms, inversion, Parseval, unfiltered 4f reconstruction.
- Regression, standard error, confidence interval, histogram count conservation.
- Gaussian z_R, linear stiffness scaling, inward gradient force, equipartition variance.

Experiment modules add their own tests (`src/experiments/*/physics.test.ts`). Run all with `npm test`.

Tests validate the **model**, not a physical apparatus. Agreement with a real measurement requires the apparatus to be
characterised separately.

---

## Adding an experiment

1. Add a meta entry to `src/lib/content/registry.ts`.
2. Add a slug to `ExperimentSlug` in `src/lib/content/types.ts`.
3. Create `src/experiments/<slug>/content.ts` exporting `ExperimentContent`.
4. Implement `physics.ts` (pure) and tests.
5. Implement `Simulation.tsx` with the shared `SimulatorShell`, and register it in
   `src/components/experiments/SimulationHost.tsx`.
6. Add the content import to `src/lib/content/index.ts` and a 3D layout if useful.

Equations use KaTeX strings. Reference objects must come from the curated catalogue in `src/lib/content/references.ts`;
do not add an unverified DOI or page number.

---

## Accessibility, motion and performance

- Keyboard-native range inputs, radio groups, checkboxes and disclosure elements.
- Every canvas has a text alternative and numeric readouts duplicate the essential visual information.
- `prefers-reduced-motion` disables animation; no essential content is conveyed by motion alone.
- Heavy simulations are dynamically imported (`ssr: false`); the Fourier FFT runs in a Web Worker.
- 3D is loaded only when the student opens it.
- Charts are not rendered until their simulation component mounts.

---

## Privacy

No login and no server-side student data. Progress, datasets, notebook records and quiz attempts are stored in the
browser via IndexedDB. Export JSON/CSV/Markdown before clearing site data. Attachments are kept under 1.5 MB per file in
local storage; large data should remain in the laboratory's own file store.

---

## Known limitations

- Kit models and part numbers are intentionally unverified until checked against the physical label.
- Optical aberrations, thermal drift, vibration and detector non-linearity are generally not modelled.
- The quantum experiments are numerical/optical analogues unless a genuine single-photon source and coincidence setup
  are added; the text never implies otherwise.
- The 3D bench is illustrative geometry.
- The practical workspace computes statistical uncertainty; systematic error remains the student's responsibility.
- QKD privacy amplification in the simulation is a teaching construction, not a cryptographic implementation.

---

## Licence and attribution

Educational use. Third-party trademarks remain the property of their owners. References and manufacturer document
pointers are recorded in the per-experiment reference lists and in `src/lib/content/references.ts`.
