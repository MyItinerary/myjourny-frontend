import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HostAccess } from "../model/host-access";
import { useHostGuardViewModel } from "./use-host-guard-view-model";

const state = vi.hoisted(() => ({ access: "checking" as HostAccess, query: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: state.replace }),
  usePathname: () => "/host/dashboard/listings",
  useSearchParams: () => new URLSearchParams(state.query),
}));
vi.mock("../model/host-access", () => ({ useHostAccess: () => state.access }));

beforeEach(() => {
  state.access = "checking";
  state.query = "";
  state.replace.mockReset();
});
afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

const render = () => renderHook(() => useHostGuardViewModel()).result.current;

describe("useHostGuardViewModel", () => {
  it("shows nothing while the account is checked", () => {
    expect(render()).toEqual({ ready: false, banner: null });
    expect(state.replace).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to log in and back to the same page", () => {
    state.access = "signed-out";
    expect(render().ready).toBe(false);
    expect(state.replace).toHaveBeenCalledWith("/login?next=%2Fhost%2Fdashboard%2Flistings");
  });

  it("sends a traveller to become a guide", () => {
    state.access = "traveller";
    expect(render().ready).toBe(false);
    expect(state.replace).toHaveBeenCalledWith("/become-a-guide");
  });

  it("lets an approved guide in with no banner", () => {
    state.access = "approved";
    expect(render()).toEqual({ ready: true, banner: null });
  });

  it("lets a guide in review look around, and says so", () => {
    state.access = "pending";
    const vm = render();
    expect(vm.ready).toBe(true);
    expect(vm.banner?.title).toBe("Your guide application is in review");
  });

  it("tells a guide whose application wasn't approved what to do", () => {
    state.access = "rejected";
    expect(render().banner?.body).toContain("hello@myjourny.io");
  });

  it("needs no account for the design's sample host while developing", () => {
    state.access = "signed-out";
    state.query = "preview=full";
    expect(render()).toEqual({ ready: true, banner: null });
    expect(state.replace).not.toHaveBeenCalled();
  });

  it("ignores the sample host in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    state.access = "signed-out";
    state.query = "preview=full";
    expect(render().ready).toBe(false);
    expect(state.replace).toHaveBeenCalled();
  });
});
