import { useQuery } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { startSignInLoader, stopSignInLoader } from "../model/sign-in-loader-store";
import { MAX_VISIBLE_MS, MIN_VISIBLE_MS, useSignInLoaderViewModel } from "./use-sign-in-loader-view-model";

const path = vi.hoisted(() => ({ current: "/login" }));
vi.mock("next/navigation", () => ({ usePathname: () => path.current }));

describe("useSignInLoaderViewModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    path.current = "/login";
  });
  afterEach(() => {
    stopSignInLoader();
    vi.useRealTimers();
  });

  it("is hidden until a sign-in starts", () => {
    const { result } = renderHookWithProviders(() => useSignInLoaderViewModel());

    expect(result.current.visible).toBe(false);
    act(() => startSignInLoader("/login"));
    expect(result.current.visible).toBe(true);
  });

  it("stays up on the login page, however long the sign-in takes", () => {
    const { result } = renderHookWithProviders(() => useSignInLoaderViewModel());
    act(() => startSignInLoader("/login"));

    act(() => vi.advanceTimersByTime(5_000));

    expect(result.current.visible).toBe(true);
  });

  it("goes once the next page is open and nothing is loading, after a minimum time", () => {
    const { result, rerender } = renderHookWithProviders(() => useSignInLoaderViewModel());
    act(() => startSignInLoader("/login"));

    path.current = "/";
    rerender();
    expect(result.current.visible).toBe(true);

    act(() => vi.advanceTimersByTime(MIN_VISIBLE_MS));
    expect(result.current.visible).toBe(false);
  });

  it("waits for the next page's data before going", async () => {
    let resolve: (value: string) => void = () => {};
    const pending = new Promise<string>((r) => (resolve = r));
    const { result, rerender } = renderHookWithProviders(() => {
      useQuery({ queryKey: ["home"], queryFn: () => pending, enabled: path.current === "/" });
      return useSignInLoaderViewModel();
    });
    act(() => startSignInLoader("/login"));

    path.current = "/";
    rerender();
    act(() => vi.advanceTimersByTime(MIN_VISIBLE_MS * 3));
    expect(result.current.visible).toBe(true);

    await act(async () => {
      resolve("ready");
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(result.current.visible).toBe(false);
  });

  it("gives up after the safety timeout", () => {
    const { result } = renderHookWithProviders(() => useSignInLoaderViewModel());
    act(() => startSignInLoader("/login"));

    act(() => vi.advanceTimersByTime(MAX_VISIBLE_MS));

    expect(result.current.visible).toBe(false);
  });

  it("stops the page behind it scrolling while it shows", () => {
    renderHookWithProviders(() => useSignInLoaderViewModel());

    act(() => startSignInLoader("/login"));
    expect(document.body.style.overflow).toBe("hidden");

    act(() => stopSignInLoader());
    expect(document.body.style.overflow).toBe("");
  });
});
