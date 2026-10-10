import { describe, expect, it } from "vitest";

import { googleCalendarUrl } from "./calendar";

describe("googleCalendarUrl", () => {
  it("builds an event from the start and duration, reading a naive timestamp as UTC", () => {
    const url = new URL(googleCalendarUrl({ title: "Lagos Food Walk", startsAt: "2026-09-12T07:30:00", durationMinutes: 150 })!);

    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("text")).toBe("Lagos Food Walk");
    expect(url.searchParams.get("dates")).toBe("20260912T073000Z/20260912T100000Z");
  });

  it("defaults to an hour when the duration is unknown", () => {
    const url = new URL(googleCalendarUrl({ title: "Walk", startsAt: "2026-09-12T07:30:00Z" })!);
    expect(url.searchParams.get("dates")).toBe("20260912T073000Z/20260912T083000Z");
  });

  it("has no link without a usable start", () => {
    expect(googleCalendarUrl({ title: "Walk", startsAt: null })).toBeNull();
    expect(googleCalendarUrl({ title: "Walk", startsAt: "nonsense" })).toBeNull();
  });
});
