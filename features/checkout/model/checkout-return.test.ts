import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { clearCheckoutReturn, isCheckoutReturnFresh, rememberCheckoutReturn, useCheckoutReturnHref } from "./checkout-return";

afterEach(() => window.localStorage.clear());

describe("checkout return", () => {
  it("sends them back to the checkout via log-in once remembered", () => {
    expect(renderHook(() => useCheckoutReturnHref()).result.current).toBe("/login");

    rememberCheckoutReturn();
    expect(renderHook(() => useCheckoutReturnHref()).result.current).toBe("/login?next=%2Fcheckout");

    clearCheckoutReturn();
    expect(renderHook(() => useCheckoutReturnHref()).result.current).toBe("/login");
  });

  it("forgets after an hour or on junk", () => {
    const now = 10 * 3_600_000;
    expect(isCheckoutReturnFresh(String(now - 59 * 60_000), now)).toBe(true);
    expect(isCheckoutReturnFresh(String(now - 61 * 60_000), now)).toBe(false);
    expect(isCheckoutReturnFresh("junk", now)).toBe(false);
    expect(isCheckoutReturnFresh(null, now)).toBe(false);
  });
});
