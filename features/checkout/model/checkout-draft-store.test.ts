import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useCheckoutDraft } from "./checkout-draft-store";

afterEach(() => window.localStorage.clear());

describe("useCheckoutDraft", () => {
  it("reads the saved draft", () => {
    window.localStorage.setItem(
      "myjourny:checkout-draft",
      JSON.stringify({ experienceId: "exp-1", savedAt: Date.now() }),
    );
    expect(renderHook(() => useCheckoutDraft()).result.current).toMatchObject({ experienceId: "exp-1" });
  });

  it("is null once the draft has gone stale", () => {
    window.localStorage.setItem(
      "myjourny:checkout-draft",
      JSON.stringify({ experienceId: "exp-1", savedAt: Date.now() - 2 * 60 * 60 * 1000 }),
    );
    expect(renderHook(() => useCheckoutDraft()).result.current).toBeNull();
  });

  it("is null with nothing saved or a corrupt entry", () => {
    expect(renderHook(() => useCheckoutDraft()).result.current).toBeNull();
    window.localStorage.setItem("myjourny:checkout-draft", "{oops");
    expect(renderHook(() => useCheckoutDraft()).result.current).toBeNull();
  });
});
