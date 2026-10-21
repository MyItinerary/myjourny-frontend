import { describe, expect, it } from "vitest";

import { closingCopy, NOTIFICATION_CHANNELS, PANE_COPY, PAYOUT_SCHEDULES, PROFILE_PANES } from "./profile-copy";

describe("profile copy", () => {
  it("has the seven panes, each with its heading and a line under it", () => {
    expect(PROFILE_PANES.map((p) => p.key)).toEqual(["personal", "public", "verify", "notify", "payouts", "tax", "security"]);
    for (const pane of PROFILE_PANES) {
      expect(PANE_COPY[pane.key].title).toBe(pane.label);
      expect(PANE_COPY[pane.key].sub.length).toBeGreaterThan(20);
    }
  });

  it("has four notification channels and two payout schedules", () => {
    expect(NOTIFICATION_CHANNELS).toEqual(["WhatsApp", "SMS", "Email", "Push"]);
    expect(PAYOUT_SCHEDULES.map((s) => s.key)).toEqual(["booking", "weekly"]);
  });
});

describe("closingCopy", () => {
  it("names what's holding up closing the account", () => {
    const text = closingCopy({ upcoming: 4, guests: 11 });
    expect(text).toContain("4 bookings still to come and 11 guests holding tickets");
    expect(text).toContain("cancelling them refunds every guest");
    expect(text).toContain("six years for tax");
  });

  it("says it in the singular", () => {
    expect(closingCopy({ upcoming: 1, guests: 1 })).toContain("1 booking still to come and 1 guest holding tickets");
  });

  it("says nothing stands in the way when nothing is booked", () => {
    expect(closingCopy({ upcoming: 0, guests: 0 })).toBe(
      "You have no bookings still to come, so nothing stands in the way. Your reviews and your earnings history stay with us for six years for tax.",
    );
  });
});
