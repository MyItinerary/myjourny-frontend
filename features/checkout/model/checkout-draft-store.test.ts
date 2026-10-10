import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useCheckoutDraft } from "./checkout-draft-store";

afterEach(() => window.sessionStorage.clear());

describe("useCheckoutDraft", () => {
  it("reads the saved draft", () => {
    window.sessionStorage.setItem("myjourny:checkout-draft", JSON.stringify({ experienceId: "exp-1" }));
    expect(renderHook(() => useCheckoutDraft()).result.current).toMatchObject({ experienceId: "exp-1" });
  });

  it("is null with nothing saved or a corrupt entry", () => {
    expect(renderHook(() => useCheckoutDraft()).result.current).toBeNull();
    window.sessionStorage.setItem("myjourny:checkout-draft", "{oops");
    expect(renderHook(() => useCheckoutDraft()).result.current).toBeNull();
  });
});
