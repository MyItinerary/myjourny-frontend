import { describe, expect, it } from "vitest";

import { blankDraft } from "./listing-draft";
import { draftSummary } from "./listing-summary";

describe("draftSummary", () => {
  it("says what is not added yet on a blank draft", () => {
    const s = draftSummary(blankDraft());
    expect(s[1]).toEqual([
      { label: "Title", value: "Not added" },
      { label: "Short description", value: "Not added" },
      { label: "Long description", value: "Not added" },
    ]);
    expect(s[4]).toEqual([{ label: "Schedule", value: "Not added" }]);
    expect(s[7]).toContainEqual({ label: "Safety rules", value: "Not agreed yet" });
    expect(s[8]).toEqual([
      { label: "Photos", value: "Not added" },
      { label: "Photo rights", value: "Not agreed yet" },
    ]);
  });

  it("reads back what the host entered, in plain words", () => {
    const s = draftSummary({
      ...blankDraft(),
      title: "Lagos photowalk",
      desc: "one two three",
      cats: ["Art & creativity"],
      subs: ["Photography walk"],
      tags: ["Walking", "Golden hour"],
      locations: [{ name: "Freedom Park", lat: 6.45, lng: 3.39 }, { name: "Tinubu Square", lat: 6.46, lng: 3.38 }],
      meetPhoto: "x.jpg",
      whenType: "recurring",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      every: 1,
      slots: ["16:00"],
      dur: "3",
      minG: "2",
      maxG: "8",
      price: "10000",
      inc: ["Photos", ""],
      fitness: "easy",
      agePolicy: "minimum_age",
      ageMin: "12",
      swim: "Guests don't need to know how to swim.",
      access: "partly_accessible",
      safetyAgreed: true,
      photos: ["a", "b"],
    });
    expect(s[1][2]).toEqual({ label: "Long description", value: "3 words" });
    expect(s[2]).toContainEqual({ label: "Tags", value: "Walking, Golden hour" });
    expect(s[3]).toContainEqual({ label: "Locations", value: "Freedom Park, Tinubu Square" });
    expect(s[3]).toContainEqual({ label: "Meeting point photo", value: "Added" });
    expect(s[4]).toEqual([
      { label: "Schedule", value: "Repeating schedule" },
      { label: "Days", value: "Every day" },
      { label: "How often", value: "Every day" },
      { label: "Time", value: "4:00pm – 7:00pm" },
      { label: "Until", value: "No end date" },
    ]);
    expect(s[5]).toEqual([
      { label: "Guests", value: "2 to 8" },
      { label: "Price per person", value: "₦10,000" },
      { label: "Private group", value: "No" },
    ]);
    expect(s[6]).toContainEqual({ label: "Included", value: "Photos" });
    expect(s[7]).toContainEqual({ label: "Who can come", value: "From a set age: 12" });
    expect(s[7]).toContainEqual({ label: "Guests need to swim", value: "No" });
    expect(s[7]).toContainEqual({ label: "Safety rules", value: "Agreed" });
    expect(s[8]).toContainEqual({ label: "Photos", value: "2 photos" });
  });

  it("reads a one off and an on-request schedule", () => {
    expect(draftSummary({ ...blankDraft(), whenType: "once", date: "2030-06-12", slots: ["10:00"], dur: "2" })[4]).toEqual([
      { label: "Schedule", value: "One off" },
      { label: "Date", value: "Wednesday 12 June" },
      { label: "Time", value: "10:00am – 12:00pm" },
    ]);
    expect(draftSummary({ ...blankDraft(), whenType: "request" })[4]).toEqual([{ label: "Schedule", value: "Only on request" }]);
  });
});
