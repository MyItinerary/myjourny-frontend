import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { startSignInLoader, stopSignInLoader, useSignInLoaderState } from "./sign-in-loader-store";

afterEach(() => stopSignInLoader());

describe("sign-in loader store", () => {
  it("is off until a sign-in starts, and remembers where it started", () => {
    const { result } = renderHook(() => useSignInLoaderState());
    expect(result.current).toBeNull();

    act(() => startSignInLoader("/login"));

    expect(result.current).toMatchObject({ fromPath: "/login" });
    expect(typeof result.current?.startedAt).toBe("number");
  });

  it("starts from the current page when none is given", () => {
    window.history.pushState({}, "", "/onboarding");
    const { result } = renderHook(() => useSignInLoaderState());

    act(() => startSignInLoader());

    expect(result.current?.fromPath).toBe("/onboarding");
  });

  it("turns off when stopped", () => {
    const { result } = renderHook(() => useSignInLoaderState());
    act(() => startSignInLoader("/login"));

    act(() => stopSignInLoader());

    expect(result.current).toBeNull();
  });
});
