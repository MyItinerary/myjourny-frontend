import { describe, expect, it } from "vitest";

import { MIN_PASSWORD_LENGTH, passwordChangeErrors, validatePasswordChange } from "./change-password";

const refusal = (status: number, detail: unknown) => ({ response: { status, data: { detail } } });

describe("validatePasswordChange", () => {
  it("accepts a long enough password that is confirmed", () => {
    expect(validatePasswordChange({ current: "old", next: "a-new-password", confirm: "a-new-password" })).toEqual({});
  });

  it("flags a short new password and a confirmation that differs", () => {
    expect(validatePasswordChange({ current: "old", next: "short", confirm: "shorter" })).toEqual({
      next: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
      confirm: "The passwords don't match.",
    });
  });

  it("says nothing about fields that are still empty", () => {
    expect(validatePasswordChange({ current: "", next: "", confirm: "" })).toEqual({});
  });
});

describe("passwordChangeErrors", () => {
  it("puts a wrong current password under that field", () => {
    expect(passwordChangeErrors(refusal(400, "Incorrect current password"))).toEqual({
      current: "That isn't your current password.",
    });
  });

  it("puts a reused password under the new password", () => {
    expect(passwordChangeErrors(refusal(400, "New password must differ from current password"))).toEqual({
      next: "Choose a password that is different from your current one.",
    });
  });

  it("puts a server-side length refusal under the new password", () => {
    const detail = [{ type: "string_too_short", loc: ["body", "new_password"], msg: "String should have at least 10 characters" }];
    expect(passwordChangeErrors(refusal(422, detail))).toEqual({
      next: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  });

  it("shows any other refusal for the whole form, in the server's words when it has some", () => {
    expect(passwordChangeErrors(refusal(400, "Account is locked"))).toEqual({ form: "Account is locked" });
    expect(passwordChangeErrors(refusal(422, [{ loc: ["body", "current_password"], msg: "Field required" }]))).toEqual({
      form: "Field required",
    });
    expect(passwordChangeErrors(new Error("Network Error"))).toEqual({
      form: "We couldn't change your password. Try again.",
    });
  });
});
