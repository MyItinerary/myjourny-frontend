import { afterEach, describe, expect, it, vi } from "vitest";

import { useHostProfile, verificationSubmitted } from "./profile-data";
import { SAMPLE_PROFILE } from "./sample-profile";

afterEach(() => vi.unstubAllEnvs());

describe("useHostProfile", () => {
  it("is the account's own details, with the rest still to do", () => {
    const profile = useHostProfile(null, { fullName: "Tunde Bakare", email: "tunde@gmail.com" });
    expect(profile.setup).toHaveLength(3);
    expect(profile.rows.personal[0].value).toBe("Tunde Bakare");
  });

  it("shows the design's host for ?preview=full", () => {
    expect(useHostProfile("full", null)).toBe(SAMPLE_PROFILE);
  });

  it("ignores the preview in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(useHostProfile("full", null)).not.toBe(SAMPLE_PROFILE);
  });
});

describe("verificationSubmitted", () => {
  const task = (pane: "verify" | "public", done: boolean) => ({ title: "", body: "", pane, done });

  it("is true once the identity step is done, or nothing is left to set up", () => {
    expect(verificationSubmitted({ setup: [task("verify", true), task("public", false)] })).toBe(true);
    expect(verificationSubmitted({ setup: null })).toBe(true);
  });

  it("is false while the identity step is still to do", () => {
    expect(verificationSubmitted({ setup: [task("verify", false), task("public", true)] })).toBe(false);
  });
});
