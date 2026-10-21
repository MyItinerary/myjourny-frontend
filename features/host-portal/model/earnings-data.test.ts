import { afterEach, describe, expect, it, vi } from "vitest";

import { useHostEarnings } from "./earnings-data";

afterEach(() => vi.unstubAllEnvs());

describe("useHostEarnings", () => {
  it("has nothing until itin has a host API", () => {
    expect(useHostEarnings(null, "2026-09-19")).toBeNull();
  });

  it("shows the design's numbers for ?preview=full", () => {
    expect(useHostEarnings("full", "2026-09-19")?.transactions).toHaveLength(6);
  });

  it("waits for today to be known, and ignores the preview in production", () => {
    expect(useHostEarnings("full", null)).toBeNull();
    vi.stubEnv("NODE_ENV", "production");
    expect(useHostEarnings("full", "2026-09-19")).toBeNull();
  });
});
