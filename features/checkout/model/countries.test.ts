import { describe, expect, it } from "vitest";

import { COUNTRIES, DEFAULT_COUNTRY, isValidPhone, toE164 } from "./countries";

const nigeria = DEFAULT_COUNTRY;
const britain = COUNTRIES.find((c) => c.iso === "GB")!;

describe("countries", () => {
  it("defaults to Nigeria, +234", () => {
    expect(nigeria).toEqual({ iso: "NG", name: "Nigeria", dial: "234" });
  });

  it("lists each country once, with a calling code", () => {
    expect(new Set(COUNTRIES.map((c) => c.iso)).size).toBe(COUNTRIES.length);
    expect(COUNTRIES.every((c) => /^\d{1,4}$/.test(c.dial) && c.name)).toBe(true);
  });
});

describe("isValidPhone", () => {
  it("takes 10 or 11 digits for Nigeria", () => {
    expect(isValidPhone(nigeria, "7016377711")).toBe(true);
    expect(isValidPhone(nigeria, "07016377711")).toBe(true);
    expect(isValidPhone(nigeria, "12345")).toBe(false);
    expect(isValidPhone(nigeria, "701637771122")).toBe(false);
  });

  it("takes a plausible length elsewhere", () => {
    expect(isValidPhone(britain, "7911123456")).toBe(true);
    expect(isValidPhone(britain, "12345")).toBe(false);
    expect(isValidPhone(britain, "123456789012345")).toBe(false);
  });
});

describe("toE164", () => {
  it("prefixes the calling code and drops the leading 0", () => {
    expect(toE164(nigeria, "7016377711")).toBe("+2347016377711");
    expect(toE164(nigeria, "07016377711")).toBe("+2347016377711");
    expect(toE164(britain, "7911123456")).toBe("+447911123456");
  });
});
