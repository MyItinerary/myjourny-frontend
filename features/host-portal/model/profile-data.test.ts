import { afterEach, describe, expect, it, vi } from "vitest";

import { useHostProfile } from "./profile-data";
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
