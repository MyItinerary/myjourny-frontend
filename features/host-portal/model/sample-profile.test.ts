import { describe, expect, it } from "vitest";

import { SAMPLE_PROFILE } from "./sample-profile";

describe("SAMPLE_PROFILE", () => {
  it("is a host who has finished setting up", () => {
    expect(SAMPLE_PROFILE.setup).toBeNull();
    expect(SAMPLE_PROFILE.verifyLeft).toBe(1);
    expect(SAMPLE_PROFILE.closing).toEqual({ upcoming: 4, guests: 11 });
  });

  it("has rows for every pane that has them", () => {
    expect(Object.keys(SAMPLE_PROFILE.rows).sort()).toEqual(["payouts", "personal", "public", "security", "tax", "verify"]);
    expect(SAMPLE_PROFILE.rows.personal).toHaveLength(6);
    expect(SAMPLE_PROFILE.rows.verify).toHaveLength(5);
  });

  it("links Next payout to earnings and Commission to help", () => {
    const links = SAMPLE_PROFILE.rows.payouts.filter((r) => r.link).map((r) => [r.label, r.link]);
    expect(links).toEqual([["Next payout", "earnings"], ["Commission", "help"]]);
  });

  it("fills the notification matrix, the payout choice and the documents", () => {
    expect(SAMPLE_PROFILE.notifications).toHaveLength(5);
    expect(SAMPLE_PROFILE.notifications[0].channels).toEqual([true, true, true, true]);
    expect(SAMPLE_PROFILE.schedule).toBe("weekly");
    expect(SAMPLE_PROFILE.documents.filter((d) => d.checked)).toHaveLength(3);
    expect(SAMPLE_PROFILE.preview.badges).toHaveLength(3);
  });
});
