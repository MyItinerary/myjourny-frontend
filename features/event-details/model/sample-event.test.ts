import { describe, expect, it } from "vitest";

import { SAMPLE_EVENT, SAMPLE_EVENT_ID } from "./sample-event";

describe("SAMPLE_EVENT", () => {
  it("is the event served at /events/sample", () => {
    expect(SAMPLE_EVENT.id).toBe(SAMPLE_EVENT_ID);
  });

  it("has unique ids inside every list, so the page can key on them", () => {
    for (const list of [
      SAMPLE_EVENT.included,
      SAMPLE_EVENT.goodToKnow,
      SAMPLE_EVENT.lineup,
      SAMPLE_EVENT.questions,
      SAMPLE_EVENT.schedule,
      SAMPLE_EVENT.moreWays,
      SAMPLE_EVENT.pastEvents,
      SAMPLE_EVENT.booking.tiers,
    ]) {
      expect(new Set(list.map((item) => item.id)).size).toBe(list.length);
    }
  });

  it("points every category card at a category page", () => {
    for (const way of SAMPLE_EVENT.moreWays) expect(way.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("sells at least one open ticket tier", () => {
    expect(SAMPLE_EVENT.booking.tiers.some((tier) => tier.status === "available")).toBe(true);
  });
});
