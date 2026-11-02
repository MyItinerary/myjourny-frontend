import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHostHome } from "./home-data";

const state = vi.hoisted(() => ({
  preview: null as string | null,
  user: null as { fullName: string | null } | null,
}));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: state.user }) }));

beforeEach(() => {
  state.preview = null;
  state.user = { fullName: "Tunde Bakare" };
});
afterEach(() => vi.unstubAllEnvs());

describe("useHostHome", () => {
  it("is the nothing-listed-yet Home until itin has a host API", () => {
    const { result } = renderHook(() => useHostHome(state.preview));
    expect(result.current.state).toEqual({ kind: "empty" });
    expect(result.current.firstName).toBe("Tunde");
  });

  it("shows the sample Home for ?preview=full", () => {
    state.preview = "full";
    const { result } = renderHook(() => useHostHome(state.preview));
    expect(result.current.state.kind).toBe("full");
  });

  it("ignores the preview in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    state.preview = "full";
    expect(renderHook(() => useHostHome(state.preview)).result.current.state.kind).toBe("empty");
  });

  it("has no first name without one on the account", () => {
    state.user = { fullName: null };
    expect(renderHook(() => useHostHome(state.preview)).result.current.firstName).toBeNull();
    state.user = null;
    expect(renderHook(() => useHostHome(state.preview)).result.current.firstName).toBeNull();
  });
});
