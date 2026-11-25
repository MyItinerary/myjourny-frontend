import { useQuery } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { MAX_VISIBLE_MS, MIN_VISIBLE_MS, useLaunchScreenViewModel } from "./use-launch-screen-view-model";

describe("useLaunchScreenViewModel", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("covers the page when the app opens, and goes after a moment when nothing is loading", () => {
    const { result } = renderHookWithProviders(() => useLaunchScreenViewModel());
    expect(result.current.ready).toBe(false);

    act(() => vi.advanceTimersByTime(MIN_VISIBLE_MS));
    expect(result.current.ready).toBe(true);
  });

  it("waits for the first page's data before going", async () => {
    let resolve: (value: string) => void = () => {};
    const pending = new Promise<string>((r) => (resolve = r));
    const { result } = renderHookWithProviders(() => {
      useQuery({ queryKey: ["home"], queryFn: () => pending });
      return useLaunchScreenViewModel();
    });

    act(() => vi.advanceTimersByTime(MIN_VISIBLE_MS * 3));
    expect(result.current.ready).toBe(false);

    await act(async () => {
      resolve("ready");
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(result.current.ready).toBe(true);
  });

  it("gives up after the safety timeout if the page never settles", () => {
    const { result } = renderHookWithProviders(() => {
      useQuery({ queryKey: ["slow"], queryFn: () => new Promise<string>(() => {}) });
      return useLaunchScreenViewModel();
    });

    act(() => vi.advanceTimersByTime(MAX_VISIBLE_MS));
    expect(result.current.ready).toBe(true);
  });
});
