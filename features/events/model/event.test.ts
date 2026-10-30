import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  ACCESSIBILITY_NOT_CONFIRMED,
  clockLabel,
  eventDateLine,
  goodToKnowRows,
  lineupCards,
  organiser,
  scheduleRows,
  useEventDetail,
  useRelatedListings,
  venueLine,
} from "./event";
import type { EventDetail } from "./event.types";

const base: EventDetail = { id: "evt-1", status: "ACTIVE", title: "Lagos Design Night", kind: "event" };

describe("useEventDetail and useRelatedListings", () => {
  it("fetch the event and its related listings", async () => {
    server.use(
      http.get(apiUrl("/experiences/evt-1"), () => HttpResponse.json({ ...base, venue_name: "Harbour Hall" })),
      http.get(apiUrl("/experiences/evt-1/related"), () =>
        HttpResponse.json({ similar: [{ id: "evt-2", title: "Abuja Design Week" }], past_by_organiser: [] }),
      ),
    );
    const detail = renderHookWithProviders(() => useEventDetail("evt-1"));
    const related = renderHookWithProviders(() => useRelatedListings("evt-1"));
    await waitFor(() => expect(detail.result.current.data?.venue_name).toBe("Harbour Hall"));
    await waitFor(() => expect(related.result.current.data?.similar[0].title).toBe("Abuja Design Week"));
  });
});

describe("clockLabel", () => {
  it("reads 24-hour times as am/pm", () => {
    expect(clockLabel("19:00:00")).toBe("7:00pm");
    expect(clockLabel("00:30")).toBe("12:30am");
    expect(clockLabel("12:05")).toBe("12:05pm");
  });
});

describe("eventDateLine", () => {
  it("gives the day and the start and end times", () => {
    expect(
      eventDateLine({ event_start_date: "2030-11-16", start_times: ["19:00:00"], duration_minutes: 240 }),
    ).toBe("Sat 16 November · 7:00pm – 11:00pm");
  });

  it("wraps past midnight", () => {
    expect(eventDateLine({ event_start_date: "2030-11-16", start_times: ["22:00:00"], duration_minutes: 180 })).toBe(
      "Sat 16 November · 10:00pm – 1:00am",
    );
  });

  it("spans the days of a multi-day event", () => {
    expect(
      eventDateLine({ event_start_date: "2030-11-15", event_end_date: "2030-11-17", start_times: ["10:00:00"] }),
    ).toBe("Fri 15 – Sun 17 November · from 10:00am");
  });

  it("is null without a date", () => {
    expect(eventDateLine({})).toBeNull();
  });
});

describe("venueLine", () => {
  it("joins the venue and area", () => {
    expect(venueLine({ venue_name: "Harbour Hall", area: "Lagos Island" })).toBe("Harbour Hall · Lagos Island");
    expect(venueLine({ venue_name: " ", area: null })).toBeNull();
  });
});

describe("scheduleRows", () => {
  it("orders the timeline and names who's on", () => {
    const rows = scheduleRows({
      schedule: [
        { time: "21:00", title: "Close", kind: "doors" },
        { time: "19:00", title: "Talks", kind: "session", people: ["Tolu", "Ada", "Kemi"] },
      ],
    });
    expect(rows).toEqual([
      { time: "7:00pm", title: "Talks", description: null, kind: "session", people: "Tolu, Ada and Kemi" },
      { time: "9:00pm", title: "Close", description: null, kind: "doors", people: null },
    ]);
  });
});

describe("lineupCards", () => {
  it("gives each person their initials for when there's no photo", () => {
    expect(lineupCards({ lineup: [{ name: "Tolu Adeyemi", role: "Architecture" }] })).toEqual([
      { name: "Tolu Adeyemi", role: "Architecture", bio: null, photoUrl: null, initials: "TA" },
    ]);
  });
});

describe("goodToKnowRows", () => {
  it("always says whether it's accessible, defaulting to ask the organiser", () => {
    expect(goodToKnowRows(base)).toEqual([{ key: "accessibility", title: "Accessibility", text: ACCESSIBILITY_NOT_CONFIRMED }]);
  });

  it("lists the organiser's rows in order", () => {
    const rows = goodToKnowRows({
      ...base,
      accessibility: "wheelchair_accessible",
      age_policy: "minimum_age",
      min_age: 18,
      languages: ["en"],
      good_to_know: {
        id_required: true,
        parking_text: "Free parking on site",
        transfer_allowed: true,
        transfer_deadline: "2030-11-06",
        whats_allowed: "No outside drinks",
        dress_code: "Smart casual",
      },
    });
    expect(rows.map((row) => [row.title, row.text])).toEqual([
      ["Entry and ID", "Bring a photo ID."],
      ["Accessibility", "Wheelchair accessible"],
      ["Parking and getting there", "Free parking on site"],
      ["Ticket transfer", "You can transfer your ticket until Wed 6 November."],
      ["Age", "Ages 18+"],
      ["What's allowed", "No outside drinks"],
      ["Dress code", "Smart casual"],
      ["Language", "English"],
    ]);
  });

  it("says when tickets can't be transferred", () => {
    const transfer = goodToKnowRows({ ...base, good_to_know: { transfer_allowed: false } }).find((row) => row.key === "transfer");
    expect(transfer?.text).toBe("Tickets can't be transferred to someone else.");
  });
});

describe("organiser", () => {
  it("is the picked guide, or MyJourny", () => {
    expect(
      organiser({ host: { id: "g-1", display_name: "Tolu Events", is_verified: false }, organiser_blurb: " Runs design nights " }),
    ).toEqual({ name: "Tolu Events", verified: false, blurb: "Runs design nights", avatarLetter: "T" });
    expect(organiser({ host: null })).toEqual({ name: "MyJourny", verified: true, blurb: null, avatarLetter: "M" });
  });
});
