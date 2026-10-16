import { describe, expect, it } from "vitest";

import {
  blankDraft, bookLabel, checklistFor, doneCountOf, metaLine, photoHint, photoLabel,
  priceBreakdown, searchPlaces, sectionsDone, slotSummary, upcomingDates, wordCount,
} from "./listing-draft";

const complete = () => ({
  ...blankDraft(),
  title: "Lagos Island Photowalk", hook: "Three hours", desc: "x".repeat(81),
  cat: "Art & creativity", tags: ["a", "b", "c"], cue: "The yellow gate", meetPhoto: "blob:m",
  whenType: "recurring" as const, days: ["Sat"], slots: ["16:00"],
  price: "9000", maxG: "8", inc: ["Photos"], exc: ["Lunch"], fitness: "Easy", ageMin: "12",
  photos: ["a", "b", "c", "d"],
});

describe("sectionsDone", () => {
  it("starts with nothing done", () => {
    expect(doneCountOf(blankDraft())).toBe(0);
  });

  it("counts all eight once everything is filled", () => {
    expect(doneCountOf(complete())).toBe(8);
    expect(checklistFor(complete()).every((c) => c.ok)).toBe(true);
  });

  it("needs three tags, an 80-character description and four photos", () => {
    const d = { ...complete(), tags: ["a", "b"], desc: "short", photos: ["a"] };
    expect(sectionsDone(d)).toMatchObject({ 1: false, 2: false, 8: false });
  });

  it("lets an on-request listing skip start times", () => {
    expect(sectionsDone({ ...complete(), whenType: "request", slots: [] })[4]).toBe(true);
    expect(sectionsDone({ ...complete(), whenType: "once", slots: [] })[4]).toBe(false);
  });
});

describe("helpers", () => {
  it("counts words", () => {
    expect(wordCount("  one two  three ")).toBe(3);
    expect(wordCount("")).toBe(0);
  });

  it("finds landmarks by name and returns none for an empty search", () => {
    expect(searchPlaces("freedom").map((p) => p.name)).toEqual(["Freedom Park"]);
    expect(searchPlaces("  ")).toEqual([]);
  });

  it("lists the next five Saturdays at the first start time", () => {
    const dates = upcomingDates(complete(), new Date(2026, 8, 19));
    expect(dates).toHaveLength(5);
    expect(dates[0]).toContain("Sat");
    expect(dates[0]).toContain("19 Sept");
    expect(dates[0].endsWith("16:00")).toBe(true);
  });

  it("skips weeks when it runs every two weeks", () => {
    const dates = upcomingDates({ ...complete(), every: 2 }, new Date(2026, 8, 19));
    expect(dates[1]).toContain("3 Oct");
  });

  it("summarises the schedule", () => {
    expect(slotSummary(complete())).toBe("Sat at 16:00");
    expect(slotSummary(blankDraft())).toBe("No days picked yet");
  });

  it("splits a full group into what guests pay, our cut and what the host keeps", () => {
    expect(priceBreakdown(complete())).toEqual({
      line: "8 guests at ₦9,000 = ₦72,000",
      gross: "₦72,000", commission: "₦10,800", net: "₦61,200", perSeat: "₦7,650",
    });
    expect(priceBreakdown(blankDraft()).line).toBe("Fill in a group size and a price");
  });

  it("describes the meta line, photos and booking type", () => {
    expect(metaLine({ ...complete(), dur: "3", area: "Island" })).toBe("3 hours · Up to 8 · Island, Lagos");
    expect([photoLabel(0), photoLabel(1), photoLabel(3)]).toEqual(["No photos yet", "1 photo", "3 photos"]);
    expect(photoHint(0)).toMatch(/at least four to publish/);
    expect(photoHint(2)).toBe("You need at least four. You have 2.");
    expect(photoHint(4)).toMatch(/Enough to publish/);
    expect([bookLabel("instant"), bookLabel("request"), bookLabel("")]).toEqual(["Book now", "Request to book", "How they book, not set"]);
  });
});
