import { describe, expect, it } from "vitest";

import {
  dateOfBirthToIso,
  fullPhoneNumber,
  isOldEnoughToGuide,
  isValidEmail,
  isValidPhoneNumber,
  fullNameOf,
  isStrongPassword,
  isValidCacNumber,
  isValidWebsite,
  normalizeWebsite,
  passwordChecks,
  splitName,
} from "./guide-application-rules";

describe("guide application rules", () => {
  it("accepts real email addresses only", () => {
    expect(isValidEmail("adaeze@example.com")).toBe(true);
    expect(isValidEmail("a@")).toBe(false);
    expect(isValidEmail("adaeze@example")).toBe(false);
  });

  it("joins the country code and digits, dropping a leading 0", () => {
    expect(fullPhoneNumber("+234", "0803 555 0199")).toBe("+2348035550199");
    expect(isValidPhoneNumber("+234", "0803 555 0199")).toBe(true);
    expect(isValidPhoneNumber("+234", "08a")).toBe(false);
    expect(isValidPhoneNumber("+234", "803 555 0199 1234 5")).toBe(false);
  });

  it("turns the picker's DD/MM/YYYY into an ISO date, and refuses dates that don't exist", () => {
    expect(dateOfBirthToIso("12/03/1994")).toBe("1994-03-12");
    expect(dateOfBirthToIso("31/02/1994")).toBeNull();
    expect(dateOfBirthToIso("1994-03-12")).toBeNull();
    expect(dateOfBirthToIso("")).toBeNull();
  });

  it("needs guides to be 18 by today", () => {
    const today = new Date(2026, 10, 9);
    expect(isOldEnoughToGuide("2008-11-09", today)).toBe(true);
    expect(isOldEnoughToGuide("2008-11-10", today)).toBe(false);
  });
});

describe("names", () => {
  it("joins first and last name, and splits an account's name back", () => {
    expect(fullNameOf(" Amara ", "Okafor ")).toBe("Amara Okafor");
    expect(splitName("Amara Grace Okafor")).toEqual({ firstName: "Amara", lastName: "Grace Okafor" });
    expect(splitName("")).toEqual({ firstName: "", lastName: "" });
  });
});

describe("password rules", () => {
  it("checks each rule the form lists", () => {
    expect(passwordChecks("").map((c) => c.met)).toEqual([false, false, false, false]);
    expect(passwordChecks("abc def").map((c) => c.met)).toEqual([false, false, false, false]);
    expect(passwordChecks("Lagos2026!").map((c) => c.met)).toEqual([true, true, true, true]);
    expect(passwordChecks("x".repeat(31))[0].met).toBe(false);
  });

  it("is strong only when every rule is met", () => {
    expect(isStrongPassword("Lagos2026!")).toBe(true);
    expect(isStrongPassword("lagos2026!")).toBe(false);
    expect(isStrongPassword("Lagos 2026!")).toBe(false);
  });
});

describe("website and CAC number", () => {
  it("accepts a domain with or without https, and refuses words", () => {
    expect(isValidWebsite("samuel.com")).toBe(true);
    expect(isValidWebsite("https://samuel.com/tours")).toBe(true);
    expect(isValidWebsite("samuel")).toBe(false);
    expect(normalizeWebsite(" samuel.com ")).toBe("https://samuel.com");
    expect(normalizeWebsite("")).toBeNull();
  });

  it("accepts RC and BN numbers only", () => {
    expect(isValidCacNumber("RC1234566")).toBe(true);
    expect(isValidCacNumber("bn 3456789")).toBe(true);
    expect(isValidCacNumber("1234566")).toBe(false);
    expect(isValidCacNumber("RC12")).toBe(false);
  });
});
