import { describe, expect, it } from "vitest";

import { distanceKm, nearestCity } from "./nearby";

const lagos = { id: "lagos", city: "Lagos, Nigeria", description: "28 experiences" };
const abuja = { id: "abuja", city: "Abuja, Nigeria", description: "20 experiences" };
const ibadan = { id: "ibadan", city: "Ibadan, Nigeria", description: "20 experiences" };
const unknown = { id: "atlantis", city: "Atlantis", description: "1 experience" };

describe("nearby", () => {
  it("measures distance on the globe", () => {
    // Lagos to Abuja is roughly 520 km as the crow flies.
    expect(distanceKm({ latitude: 6.5244, longitude: 3.3792 }, { latitude: 9.0765, longitude: 7.3986 })).toBeGreaterThan(500);
    expect(distanceKm({ latitude: 6.5244, longitude: 3.3792 }, { latitude: 6.5244, longitude: 3.3792 })).toBe(0);
  });

  it("picks the closest listed city", () => {
    const lekki = { latitude: 6.4474, longitude: 3.4723 };
    expect(nearestCity(lekki, [abuja, ibadan, lagos])).toBe(lagos);
    const gwarinpa = { latitude: 9.1099, longitude: 7.4042 };
    expect(nearestCity(gwarinpa, [lagos, ibadan, abuja])).toBe(abuja);
  });

  it("only picks from the cities that are listed, and skips ones it has no centre for", () => {
    const lekki = { latitude: 6.4474, longitude: 3.4723 };
    expect(nearestCity(lekki, [unknown, ibadan])).toBe(ibadan);
    expect(nearestCity(lekki, [unknown])).toBeNull();
    expect(nearestCity(lekki, [])).toBeNull();
  });
});
