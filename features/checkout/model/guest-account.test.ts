import { describe, expect, it } from "vitest";

import { isEmailTakenError } from "./guest-account";

const failure = (detail: unknown) => ({ response: { data: { detail } } });

describe("isEmailTakenError", () => {
  it("recognises the already-registered response", () => {
    expect(isEmailTakenError(failure("Email already registered"))).toBe(true);
  });

  it("is false for other failures", () => {
    expect(isEmailTakenError(failure("Weak password"))).toBe(false);
    expect(isEmailTakenError(failure(["not", "a string"]))).toBe(false);
    expect(isEmailTakenError(new Error("network"))).toBe(false);
    expect(isEmailTakenError(null)).toBe(false);
  });
});
