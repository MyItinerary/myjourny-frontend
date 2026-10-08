import { act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import type { ExperienceSessions } from "../model/booking.types";
import { dateKey, parseDateKey } from "../model/sessions";
import { useSessionChoice } from "./use-session-choice";

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dateKey(d);
};

const scheduled = (sessions: ExperienceSessions["sessions"]): ExperienceSessions => ({
  timezone: "Africa/Lagos",
  scheduled: true,
  sessions,
});

const session = (localDate: string, time: string, extra: Partial<ExperienceSessions["sessions"][0]> = {}) => ({
  starts_at: `${localDate}T${time}Z`,
  local_date: localDate,
  local_time: `${time}:00`,
  seats_left: 10,
  sold_out: false,
  ...extra,
});

describe("useSessionChoice", () => {
  it("defaults to the first day with an open session", () => {
    const data = scheduled([
      session(day(3), "08:00", { sold_out: true, seats_left: 0 }),
      session(day(5), "08:00", { seats_left: 2 }),
      session(day(5), "13:00"),
    ]);
    const { result } = renderHookWithProviders(() => useSessionChoice(data));

    expect(result.current.selectedDate).toEqual(parseDateKey(day(5)));
    expect(result.current.options.map((o) => [o.label, o.note, o.selected])).toEqual([
      ["8:00 AM", "2 left", true],
      ["1:00 PM", null, false],
    ]);
    expect(result.current.request).toEqual({ requested_datetime: `${day(5)}T08:00Z` });
    expect(result.current.isDateSelectable(parseDateKey(day(3)))).toBe(false);
    expect(result.current.isDateSelectable(parseDateKey(day(5)))).toBe(true);
  });

  it("picks another day and session", () => {
    const data = scheduled([session(day(3), "08:00"), session(day(4), "08:00"), session(day(4), "13:00")]);
    const { result } = renderHookWithProviders(() => useSessionChoice(data));

    act(() => result.current.onSelectDate(parseDateKey(day(4))));
    act(() => result.current.onPickSession(`${day(4)}T13:00Z`));

    expect(result.current.request).toEqual({ requested_datetime: `${day(4)}T13:00Z` });
    expect(result.current.dateLabel).not.toBe("Select dates");
  });

  it("says when every session is sold out", () => {
    const data = scheduled([session(day(3), "08:00", { sold_out: true, seats_left: 0 })]);
    const { result } = renderHookWithProviders(() => useSessionChoice(data));
    expect(result.current.allSoldOut).toBe(true);
    expect(result.current.noSessions).toBe(false);
  });

  it("labels a session over several days with its date range", () => {
    const data = {
      ...scheduled([session("2030-06-01", "08:00", { end_local_date: "2030-06-03" })]),
      length_days: 3,
    };
    const { result } = renderHookWithProviders(() => useSessionChoice(data));
    expect(result.current.dateLabel).toBe("June 1 – June 3");
    expect(result.current.lengthDays).toBe(3);
  });

  it("shows sold-out sessions as disabled", () => {
    const data = scheduled([session(day(3), "08:00"), session(day(3), "13:00", { sold_out: true, seats_left: 0 })]);
    const { result } = renderHookWithProviders(() => useSessionChoice(data));
    expect(result.current.options[1]).toMatchObject({ disabled: true, note: "Sold out" });
  });

  it("says when a schedule has nothing coming up", () => {
    const { result } = renderHookWithProviders(() => useSessionChoice(scheduled([])));
    expect(result.current.noSessions).toBe(true);
    expect(result.current.request).toBeNull();
    expect(result.current.dateLabel).toBe("Select dates");
  });

  it("books unscheduled experiences by date, from tomorrow or the event date", () => {
    const unscheduled = { timezone: "Africa/Lagos", scheduled: false, sessions: [] };
    const plain = renderHookWithProviders(() => useSessionChoice(unscheduled)).result.current;
    const event = renderHookWithProviders(() => useSessionChoice(unscheduled, parseDateKey(day(9)))).result.current;

    expect(plain.scheduled).toBe(false);
    expect(plain.selectedDate).toEqual(parseDateKey(day(1)));
    // The server books noon on that date in the experience's zone.
    expect(plain.request).toEqual({ requested_date: day(1) });
    expect(plain.isDateSelectable(parseDateKey(day(0)))).toBe(false);
    expect(event.selectedDate).toEqual(parseDateKey(day(9)));
  });

  it("counts days from the experience's today, not the browser's", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    // 23:30 UTC on 1 June: already 2 June in Lagos.
    vi.setSystemTime(new Date("2030-06-01T23:30:00Z"));
    const unscheduled = { timezone: "Africa/Lagos", scheduled: false, sessions: [] };
    const { result } = renderHookWithProviders(() => useSessionChoice(unscheduled));

    expect(result.current.selectedDate).toEqual(parseDateKey("2030-06-03"));
    expect(result.current.isDateSelectable(parseDateKey("2030-06-02"))).toBe(false);
    expect(result.current.timezoneNote).toBe("Times are Lagos time.");
  });

  it("falls back to the browser's day before sessions load", () => {
    const { result } = renderHookWithProviders(() => useSessionChoice(undefined));
    expect(result.current.timezoneNote).toBe("Times are local to the experience.");
    expect(result.current.selectedDate).toEqual(parseDateKey(day(1)));
  });
});

afterEach(() => {
  vi.useRealTimers();
});
