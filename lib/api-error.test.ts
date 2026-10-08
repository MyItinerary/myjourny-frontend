import { describe, expect, it } from "vitest";

import { apiErrorMessage } from "./api-error";

const axiosError = (detail: unknown) => ({ response: { data: { detail } } });

describe("apiErrorMessage", () => {
  it("returns a string detail as-is", () => {
    expect(apiErrorMessage(axiosError("Email already registered"), "fallback")).toBe(
      "Email already registered",
    );
  });

  it("joins the msg fields of a FastAPI 422 validation array", () => {
    const detail = [
      { type: "missing", loc: ["body", "email"], msg: "Field required" },
      { type: "value_error", loc: ["body", "password"], msg: "Too short" },
    ];
    expect(apiErrorMessage(axiosError(detail), "fallback")).toBe("Field required, Too short");
  });

  it("falls back when the array has no usable messages", () => {
    expect(apiErrorMessage(axiosError([{ type: "x" }, null]), "fallback")).toBe("fallback");
  });

  it.each([undefined, null, new Error("network"), { response: {} }, axiosError(42)])(
    "falls back for %p",
    (error) => {
      expect(apiErrorMessage(error, "Something went wrong")).toBe("Something went wrong");
    },
  );
});
