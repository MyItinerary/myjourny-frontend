import { describe, expect, it } from "vitest";

import type { ListingDraft } from "./listing-draft.types";
import {
  basicsWritten, blankDraft, capWords, descLengthOk, wordCountLine, descShortBy, checklistFor, doneCountOf, firstIncomplete, metaLine, photoHint, photoLabel,
  isChoice, FITNESS_LEVELS, needsAge, priceBreakdown, sectionsDone, slotSummary, upcomingDates, wordCount,
  endTime, formatTime, hoursBetween, TIME_OPTIONS, timeChoices, timeRange,
} from "./listing-draft";

const complete = (): ListingDraft => ({
  ...blankDraft(),
  title: "Lagos Island Photowalk", hook: "Three hours", desc: Array.from({ length: 500 }, (_, i) => `w${i}`).join(" "),
  cats: ["Art & creativity"], subs: ["Photography walk"], tags: ["a", "b", "c"], cue: "The yellow gate", meetPhoto: "https://res.cloudinary.com/m.jpg",
  locations: [{ name: "Freedom Park", lat: 6.45, lng: 3.39 }],
  whenType: "recurring" as const, days: ["Sat"], slots: ["16:00"],
  price: "9000", maxG: "8", refund: "full_refund_until", refundHours: "24", inc: ["Photos"], exc: ["Lunch"],
  fitness: "easy", agePolicy: "minimum_age", ageMin: "12", access: "not_confirmed", safetyAgreed: true, photoRightsAgreed: true,
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

  it("needs a category, a long enough description and four photos", () => {
    const d = { ...complete(), cats: [], desc: "short", photos: ["a"] };
    expect(sectionsDone(d)).toMatchObject({ 1: false, 2: false, 8: false });
  });

  it("needs a tag and a subcategory too, unless the categories picked have no subcategories", () => {
    expect(sectionsDone({ ...complete(), tags: [] })[2]).toBe(false);
    expect(sectionsDone({ ...complete(), subs: [] })[2]).toBe(false);
    expect(sectionsDone({ ...complete(), subs: [] }, false)[2]).toBe(true);
  });

  it("lets an on-request experience skip start times", () => {
    expect(sectionsDone({ ...complete(), whenType: "request", slots: [] })[4]).toBe(true);
    expect(sectionsDone({ ...complete(), whenType: "once", slots: [] })[4]).toBe(false);
  });

  it("needs a one-off's date and a repeating schedule's days", () => {
    expect(sectionsDone({ ...complete(), whenType: "once", date: "", slots: ["16:00"] })[4]).toBe(false);
    expect(sectionsDone({ ...complete(), whenType: "once", date: "2026-12-05", slots: ["16:00"] })[4]).toBe(true);
    expect(sectionsDone({ ...complete(), days: [] })[4]).toBe(false);
  });

  it("needs at least one location pinned on the map", () => {
    expect(sectionsDone({ ...complete(), locations: [{ name: "the old fig tree", lat: null, lng: null }] })[3]).toBe(false);
    expect(sectionsDone({ ...complete(), locations: [{ name: "the old fig tree", lat: null, lng: null }, { name: "Freedom Park", lat: 6.45, lng: 3.39 }] })[3]).toBe(true);
    expect(sectionsDone({ ...complete(), locations: [] })[3]).toBe(false);
  });

  it("doesn't ask for a refund policy: a new draft follows ours", () => {
    expect(sectionsDone({ ...complete(), refund: "" })[5]).toBe(true);
    expect(blankDraft()).toMatchObject({ refund: "full_refund_until", refundHours: "24" });
  });

  it("needs real choices for fit, and an age only when the policy has one", () => {
    expect(sectionsDone({ ...complete(), ageMin: "" })[7]).toBe(false);
    expect(sectionsDone({ ...complete(), agePolicy: "all_ages", ageMin: "" })[7]).toBe(true);
    // A draft saved when these were free text doesn't count.
    expect(sectionsDone({ ...complete(), fitness: "Easy, light walking" as ListingDraft["fitness"] })[7]).toBe(false);
    expect(sectionsDone({ ...complete(), access: "" })[7]).toBe(false);
  });

  it("needs the safety declaration ticked", () => {
    expect(sectionsDone({ ...complete(), safetyAgreed: false })[7]).toBe(false);
  });

  it("needs the photo rights ticked as well as four photos", () => {
    expect(sectionsDone({ ...complete(), photoRightsAgreed: false })[8]).toBe(false);
  });
});

describe("helpers", () => {
  it("counts words", () => {
    expect(wordCount("  one two  three ")).toBe(3);
    expect(wordCount("")).toBe(0);
  });

  it("knows itin's choices from free text, and which age policies need an age", () => {
    expect(isChoice(FITNESS_LEVELS, "moderate")).toBe(true);
    expect(isChoice(FITNESS_LEVELS, "Moderate")).toBe(false);
    expect([needsAge("minimum_age"), needsAge("adult_required_under"), needsAge("all_ages"), needsAge("")]).toEqual([true, true, false, false]);
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
  });
});

describe("firstIncomplete", () => {
  it("is the first required step not filled in, or the last step once all eight are", () => {
    expect(firstIncomplete(blankDraft())).toBe(1);
    expect(firstIncomplete({ ...complete(), cue: "" })).toBe(3);
    expect(firstIncomplete({ ...complete(), photos: [] })).toBe(8);
    expect(firstIncomplete(complete())).toBe(11);
  });
});

describe("start times", () => {
  it("lists every half hour and keeps an odd value", () => {
    expect(TIME_OPTIONS).toHaveLength(48);
    expect(timeChoices("16:00")).toBe(TIME_OPTIONS);
    expect(timeChoices("16:10")).toContain("16:10");
  });

  it("words a time and the range it covers", () => {
    expect(formatTime("00:30")).toBe("12:30am");
    expect(formatTime("16:00")).toBe("4:00pm");
    expect(formatTime("soon")).toBe("soon");
    expect(timeRange("16:00", "3")).toBe("4:00pm – 7:00pm");
    expect(timeRange("22:00", "3")).toBe("10:00pm – 1:00am");
    expect(timeRange("", "3")).toBe("");
    expect(timeRange("16:00", "")).toBe("");
  });
});

describe("the long description's length", () => {
  const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");

  it("needs between 100 and 1,000 words", () => {
    expect(descLengthOk(words(99))).toBe(false);
    expect(descLengthOk(words(100))).toBe(true);
    expect(descLengthOk(words(1000))).toBe(true);
    expect(descLengthOk(words(1001))).toBe(false);
  });

  it("cuts text off after the limit, keeping its spacing, and leaves shorter text alone", () => {
    expect(capWords("one  two\nthree four", 3)).toBe("one  two\nthree");
    expect(capWords("one two ", 3)).toBe("one two ");
    expect(capWords("", 3)).toBe("");
  });

  it("counts and says how many words are left to write", () => {
    expect(wordCountLine(1000, 1000)).toBe("1,000 of 1,000 words");
    expect(wordCountLine(40, 100)).toBe("40 of 100 words");
    expect(descShortBy(0)).toBeNull();
    expect(descShortBy(40)).toBe("Write at least 100 words. 60 to go.");
    expect(descShortBy(100)).toBeNull();
  });

  it("calls step 1 written only with a title, a short description and a long one of the right length", () => {
    const d = { ...blankDraft(), title: "Walk", hook: "Six streets.", desc: words(500) };
    expect(basicsWritten(d)).toBe(true);
    expect(basicsWritten({ ...d, hook: "  " })).toBe(false);
    expect(basicsWritten({ ...d, desc: words(60) })).toBe(false);
  });
});

describe("start and end times", () => {
  it("works out the end from the start and how long it lasts, past midnight too", () => {
    expect(endTime("16:00", "3")).toBe("19:00");
    expect(endTime("16:00", "1.5")).toBe("17:30");
    expect(endTime("22:00", "3")).toBe("01:00");
    expect(endTime("", "3")).toBe("");
    expect(endTime("16:00", "")).toBe("");
  });

  it("works out how long it lasts from the start and the end, an earlier end being the next day", () => {
    expect(hoursBetween("16:00", "19:00")).toBe("3");
    expect(hoursBetween("16:00", "17:30")).toBe("1.5");
    expect(hoursBetween("22:00", "01:00")).toBe("3");
    expect(hoursBetween("16:00", "16:00")).toBe("24");
    expect(hoursBetween("", "19:00")).toBe("");
  });
});
