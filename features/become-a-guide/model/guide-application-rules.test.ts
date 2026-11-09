import { describe, expect, it } from "vitest";

import {
  dateOfBirthToIso,
  fullPhoneNumber,
  isOldEnoughToGuide,
  isValidEmail,
  isValidPhoneNumber,
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
