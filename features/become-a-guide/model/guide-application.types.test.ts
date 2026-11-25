import { describe, expect, it } from "vitest";
import {
  DEFAULT_APPLICATION_DATA,
  NIGERIAN_CITIES,
} from "./guide-application.types";

describe("guide-application.types", () => {
  it("provides valid defaults with individual verification and Lagos default city", () => {
    expect(DEFAULT_APPLICATION_DATA.verificationType).toBe("individual");
    expect(DEFAULT_APPLICATION_DATA.city).toBe("Lagos");
    expect(DEFAULT_APPLICATION_DATA.countryCode).toBe("+234");
  });

  it("exports city options including major Nigerian cities", () => {
    expect(NIGERIAN_CITIES).toContain("Lagos");
    expect(NIGERIAN_CITIES).toContain("Abuja");
  });
});
