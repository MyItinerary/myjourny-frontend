import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  addDaysToKey,
  dateKey,
  formatSessionTime,
  parseDateKey,
  todayIn,
  useExperienceSessions,
  zoneCity,
} from "./sessions";

describe("date helpers", () => {
  it("round-trips a calendar day", () => {
    const day = new Date(2030, 5, 1, 15, 30);
    expect(dateKey(day)).toBe("2030-06-01");
    expect(parseDateKey("2030-06-01")).toEqual(new Date(2030, 5, 1));
  });

  it("formats session times on a 12-hour clock", () => {
    expect(formatSessionTime("09:00:00")).toBe("9:00 AM");
    expect(formatSessionTime("00:30:00")).toBe("12:30 AM");
    expect(formatSessionTime("12:00:00")).toBe("12:00 PM");
    expect(formatSessionTime("18:45:00")).toBe("6:45 PM");
  });

  it("finds today in another time zone", () => {
    // 23:30 UTC on 1 June is already 2 June in Lagos, still 1 June in Los Angeles.
    const now = new Date("2030-06-01T23:30:00Z");
    expect(todayIn("Africa/Lagos", now)).toBe("2030-06-02");
    expect(todayIn("America/Los_Angeles", now)).toBe("2030-06-01");
  });

  it("moves dates and names zones", () => {
    expect(addDaysToKey("2030-06-30", 1)).toBe("2030-07-01");
    expect(zoneCity("America/Los_Angeles")).toBe("Los Angeles");
    expect(zoneCity("UTC")).toBe("UTC");
  });

});

describe("useExperienceSessions", () => {
  it("loads the next 90 days of sessions", async () => {
    let params: URLSearchParams | null = null;
    server.use(
      http.get(apiUrl("/experiences/exp-1/sessions"), ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ timezone: "Africa/Lagos", scheduled: true, sessions: [] });
      }),
    );

    const { result } = renderHookWithProviders(() => useExperienceSessions("exp-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.scheduled).toBe(true);
    expect(params!.get("from")).toBe(dateKey(new Date()));
    expect(params!.get("to")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("waits for an experience id", () => {
    const { result } = renderHookWithProviders(() => useExperienceSessions(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});
