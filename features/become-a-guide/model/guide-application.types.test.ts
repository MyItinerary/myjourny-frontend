import { describe, expect, it } from "vitest";

import { COUNTRIES, DEFAULT_APPLICATION_DATA, VERIFICATION_TYPES } from "./guide-application.types";

describe("guide-application.types", () => {
  it("starts as an individual in Nigeria's dialling code, with no country picked yet", () => {
    expect(DEFAULT_APPLICATION_DATA).toMatchObject({ verificationType: "individual", countryCode: "+234", country: "", firstName: "", lastName: "" });
  });

  it("offers the two ways to run a business and a list of countries", () => {
    expect(VERIFICATION_TYPES.map((t) => t.label)).toEqual(["As an individual", "As a business"]);
    expect(COUNTRIES).toContain("Nigeria");
  });
});
