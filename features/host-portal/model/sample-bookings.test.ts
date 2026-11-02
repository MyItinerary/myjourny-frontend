import { describe, expect, it } from "vitest";

import { sampleBookings } from "./sample-bookings";

const bookings = sampleBookings("2026-09-19");

describe("sampleBookings", () => {
  it("has a booking in every tab, two of them requests", () => {
    expect(bookings.map((b) => b.tab).sort()).toEqual(["Cancelled", "Completed", "Requests", "Requests", "Upcoming", "Upcoming"]);
    expect(bookings.filter((b) => b.isRequest)).toHaveLength(2);
    expect(bookings.filter((b) => b.isRequest).every((b) => b.deadline)).toBe(true);
  });

  it("places dates relative to today", () => {
    const byId = Object.fromEntries(bookings.map((b) => [b.id, b]));
    expect(byId.b1).toMatchObject({ when: "tomorrow", date: "Sun 20 Sept" });
    expect(byId.b2.when).toBe("later");
    expect(byId.b4.when).toBe("past");
    expect(byId.b1.line).toBe("Photowalk · Sun 20 Sept, 16:00");
  });

  it("gives every booking four facts, and the cancelled one its story", () => {
    expect(bookings.every((b) => b.facts.length === 4)).toBe(true);
    const cancelled = bookings.find((b) => b.tab === "Cancelled")!;
    expect(cancelled.timeline).toHaveLength(4);
    expect(cancelled.cancelNote).toContain("does not count against you");
    expect(cancelled.facts[3].value).toBe("₦0");
    expect(bookings.filter((b) => b.tab !== "Cancelled").every((b) => b.timeline.length === 0)).toBe(true);
  });
});
