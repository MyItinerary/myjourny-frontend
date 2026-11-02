import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useToday } from "./use-today";

afterEach(() => vi.useRealTimers());

describe("useToday", () => {
  it("is today's date on the client", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 10, 0));
    expect(renderHook(() => useToday()).result.current).toBe("2026-09-19");
  });
});
