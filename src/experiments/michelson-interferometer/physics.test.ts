import { describe, expect, it } from "vitest";
import {
  balanceVisibility,
  buildFringeField,
  coherenceEnvelopeAt,
  coherenceLengthOf,
  displacementPerFringeM,
  fractionalFringeAt,
  fringeOrderAt,
  fringesAcrossFieldM,
  fringesForTravel,
  gasCellFringes,
  gasCellIndexFromFringes,
  intensityAtOpd,
  observedVisibilityAt,
  opticalPathDifferenceM,
  ringsAcrossFieldM,
  thermalExpansionFromFringes,
  thermalFringes,
  travelForFringes,
  visibilityFromIntensities,
  wavelengthFromScan,
  wavelengthUncertainty
} from "./physics";
import { michelsonOPD } from "@/lib/physics/interference";

const LAMBDA_HENE = 632.8e-9;

describe("optical path difference", () => {
  it("is twice the arm difference and agrees with the shared relation", () => {
    expect(opticalPathDifferenceM(0.1, 0.10025)).toBeCloseTo(5.0e-4, 12);
    expect(opticalPathDifferenceM(0.1, 0.10025)).toBeCloseTo(michelsonOPD(0.10025, 0.1), 15);
  });

  it("reverses sign when the arms are exchanged", () => {
    expect(opticalPathDifferenceM(0.1, 0.10025)).toBeCloseTo(5.0e-4, 12);
    expect(opticalPathDifferenceM(0.10025, 0.1)).toBeCloseTo(-5.0e-4, 12);
  });

  it("keeps the fringe order equal to OPD over wavelength", () => {
    const opd = 50e-6;
    expect(fringeOrderAt(opd, LAMBDA_HENE)).toBeCloseTo(50e-6 / LAMBDA_HENE, 12);
    expect(fractionalFringeAt(2.25 * LAMBDA_HENE, LAMBDA_HENE)).toBeCloseTo(0.25, 12);
  });
});

describe("fringe period and visibility", () => {
  it("moves one fringe per λ/2 of mirror travel", () => {
    expect(fringesForTravel(LAMBDA_HENE / 2, LAMBDA_HENE)).toBeCloseTo(1, 12);
    expect(fringesForTravel(LAMBDA_HENE, LAMBDA_HENE)).toBeCloseTo(2, 12);
    expect(travelForFringes(1, LAMBDA_HENE)).toBeCloseTo(LAMBDA_HENE / 2, 12);
    expect(displacementPerFringeM(LAMBDA_HENE)).toBeCloseTo(LAMBDA_HENE / 2, 12);
  });

  it("goes bright at zero OPD and dark at OPD = λ/2 for equal coherent beams", () => {
    expect(intensityAtOpd(0, LAMBDA_HENE, Number.POSITIVE_INFINITY, 1, 1)).toBeCloseTo(1, 12);
    expect(intensityAtOpd(LAMBDA_HENE / 2, LAMBDA_HENE, Number.POSITIVE_INFINITY, 1, 1)).toBeCloseTo(
      0,
      12
    );
  });

  it("has visibility one for equal beams and full coherence", () => {
    expect(visibilityFromIntensities(1, 1, 1)).toBeCloseTo(1, 12);
    expect(balanceVisibility(1)).toBeCloseTo(1, 12);
    expect(observedVisibilityAt(1, 1, 0, 0.2)).toBeCloseTo(1, 12);
  });

  it("has visibility 0.8 for a 4:1 intensity ratio", () => {
    expect(visibilityFromIntensities(1, 0.25, 1)).toBeCloseTo(0.8, 12);
    expect(balanceVisibility(4)).toBeCloseTo(0.8, 12);
  });

  it("falls as the coherence envelope decays", () => {
    const lc = coherenceLengthOf(LAMBDA_HENE, 2e-12);
    expect(lc).toBeCloseTo(0.2002, 4);
    expect(coherenceEnvelopeAt(lc, lc)).toBeCloseTo(Math.exp(-1), 12);
    expect(observedVisibilityAt(1, 1, lc, lc)).toBeCloseTo(Math.exp(-1), 12);
  });
});

describe("wavelength recovery", () => {
  it("recovers HeNe 632.8 nm from a synthetic fringe count", () => {
    const fringeCount = 1580;
    const travel = travelForFringes(fringeCount, LAMBDA_HENE);
    expect(wavelengthFromScan(travel, fringeCount)).toBeCloseTo(LAMBDA_HENE, 12);
    expect(wavelengthFromScan(travel, fringeCount) * 1e9).toBeCloseTo(632.8, 9);
  });

  it("reproduces the 1000-fringe / 0.3164 mm example", () => {
    expect(wavelengthFromScan(0.3164e-3, 1000)).toBeCloseTo(632.8e-9, 14);
  });

  it("propagates travel and count uncertainties in quadrature", () => {
    const result = wavelengthUncertainty(LAMBDA_HENE, 0.5e-3, 5e-6, 1580, 1);
    expect(result.relative).toBeCloseTo(Math.sqrt(0.01 ** 2 + (1 / 1580) ** 2), 12);
    expect(result.absolute / LAMBDA_HENE).toBeCloseTo(result.relative, 12);
    expect(result.absolute * 1e9).toBeCloseTo(6.34, 1);
  });
});

describe("gas-cell refractive index", () => {
  it("inverts 92 fringes on a 100 mm cell at 632.8 nm to n ≈ 1.000291", () => {
    const n = gasCellIndexFromFringes(92, LAMBDA_HENE, 0.1);
    expect(n).toBeCloseTo(1.000291, 6);
    expect(n - 1).toBeCloseTo(2.911e-4, 7);
    expect(gasCellFringes(n - 1, LAMBDA_HENE, 0.1)).toBeCloseTo(92, 9);
  });

  it("is close to the typical 1 atm air value of 1.00029", () => {
    expect(gasCellIndexFromFringes(92, LAMBDA_HENE, 0.1)).toBeCloseTo(1.00029, 4);
  });
});

describe("thermal expansion", () => {
  it("inverts 120 fringes on a 0.500 m sample over 20 K", () => {
    const alpha = thermalExpansionFromFringes(120, LAMBDA_HENE, 0.5, 20);
    expect(alpha).toBeCloseTo(3.7968e-6, 10);
    expect(thermalFringes(alpha, 0.5, 20, LAMBDA_HENE)).toBeCloseTo(120, 9);
  });

  it("returns NaN for a zero temperature rise", () => {
    expect(Number.isNaN(thermalExpansionFromFringes(10, LAMBDA_HENE, 0.5, 0))).toBe(true);
  });
});

describe("fringe geometry and field", () => {
  it("counts straight fringes across the field", () => {
    const field = 0.016;
    const tilt = 200e-6;
    const spacing = LAMBDA_HENE / (2 * tilt);
    expect(fringesAcrossFieldM(field, LAMBDA_HENE, tilt)).toBeCloseTo(field / spacing, 12);
  });

  it("counts rings for the quadratic curvature model", () => {
    expect(ringsAcrossFieldM(0.016, LAMBDA_HENE, 20)).toBeCloseTo(
      (0.008 * 0.008) / (2 * 20 * LAMBDA_HENE),
      12
    );
  });

  it("returns a normalised 256-sample field in both geometries", () => {
    for (const geometry of ["circular", "straight"] as const) {
      const field = buildFringeField({
        armDifferenceM: 20e-6,
        wavelengthM: LAMBDA_HENE,
        bandwidthM: 2e-12,
        coherence: 1,
        intensityRatio: 1,
        tiltRad: geometry === "straight" ? 250e-6 : 0,
        geometry
      });
      expect(field.samples).toBe(256);
      expect(field.values).toHaveLength(256 * 256);
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let inRange = true;
      for (let i = 0; i < field.values.length; i++) {
        const value = field.values[i]!;
        if (value < 0 || value > 1) inRange = false;
        if (value < min) min = value;
        if (value > max) max = value;
      }
      expect(inRange).toBe(true);
      expect(max - min).toBeGreaterThan(0.5);
    }
  });
});
