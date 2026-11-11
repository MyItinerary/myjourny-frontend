import { describe, expect, it } from "vitest";

import type { Category } from "@/lib/queries/categories";

import { blankDraft } from "./listing-draft";
import type { ListingDraft } from "./listing-draft.types";
import { draftFromExperience, interestTags, orderedPhotos, privatePrice, toExperiencePayload } from "./listing-payload";

const cat = (id: number, slug: string, text: string, children: Category[] = []): Category => ({
  id, parent_id: null, slug, text, category_type: "interest", is_active: true, children,
});
const TREE = [cat(1, "nature-outdoors", "Nature & outdoors", [cat(2, "beaches-waterfronts", "Beaches & waterfronts")])];

const draft = (over: Partial<ListingDraft> = {}): ListingDraft => ({
  ...blankDraft(),
  title: " Lagoon kayak and breakfast ",
  hook: "Paddle at sunrise",
  desc: "We meet at the jetty.",
  cat: "Nature & outdoors",
  sub: "Beaches & waterfronts",
  city: "Lagos",
  landmark: "Five Cowries jetty",
  lat: 6.44,
  lng: 3.42,
  cue: "The blue gate",
  meetPhoto: "https://res.cloudinary.com/demo/gate.jpg",
  whenType: "recurring",
  days: ["Sat", "Sun"],
  every: 2,
  slots: ["07:30", " "],
  dur: "3",
  minG: "2",
  maxG: "8",
  price: "15000",
  inc: ["Breakfast", ""],
  exc: ["Transport"],
  bring: ["Sunscreen"],
  fitness: "moderate",
  agePolicy: "minimum_age",
  ageMin: "12",
  access: "not_suitable",
  accessNote: "Steps down to the water",
  refund: "full_refund_until",
  refundHours: "24",
  weather: true,
  photos: ["a", "b", "c"],
  cover: 1,
  area: "Lekki",
  tags: ["Golden hour", "Small group"],
  swim: "You need to swim 50 metres",
  diet: ["Halal"],
  wear: ["Clothes that can get wet", " "],
  quote: "I'll be in the yellow life jacket",
  ...over,
});

describe("toExperiencePayload", () => {
  it("turns a repeating listing into what itin stores", () => {
    expect(toExperiencePayload(draft(), TREE, "2026-11-10")).toEqual({
      title: "Lagoon kayak and breakfast",
      status: "ACTIVE",
      headline: "Paddle at sunrise",
      description: "We meet at the jetty.",
      city: "Lagos",
      country: "Nigeria",
      currency: "NGN",
      latitude: 6.44,
      longitude: 3.42,
      duration_minutes: 180,
      group_size_min: 2,
      group_size_max: 8,
      interest_tags: ["nature-outdoors", "beaches-waterfronts"],
      schedule_type: "recurring",
      event_start_date: null,
      recurrence_type: "weekly",
      recurrence_interval: 2,
      recurrence_days: ["sat", "sun"],
      recurrence_start_date: "2026-11-10",
      recurrence_end_type: "never",
      recurrence_end_date: null,
      start_times: ["07:30"],
      cover_image_url: "b",
      images: ["b", "a", "c"],
      meeting_landmark: "Five Cowries jetty",
      meeting_instructions: "The blue gate",
      meeting_photo_url: "https://res.cloudinary.com/demo/gate.jpg",
      whats_included: ["Breakfast"],
      whats_not_included: ["Transport"],
      what_to_bring_items: ["Sunscreen"],
      fitness_level: "moderate",
      age_policy: "minimum_age",
      min_age: 12,
      accessibility: "not_suitable",
      accessibility_note: "Steps down to the water",
      weather_dependent: true,
      refund_policy: "full_refund_until",
      free_cancellation_hours: 24,
      area: "Lekki",
      tags: ["Golden hour", "Small group"],
      swim_requirement: "You need to swim 50 metres",
      dietary_options: ["Halal"],
      what_to_wear_items: ["Clothes that can get wet"],
      host_note: "I'll be in the yellow life jacket",
    });
  });

  it("sends the optional extras as empty when the host skipped them", () => {
    const payload = toExperiencePayload(draft({ area: "", tags: [], swim: " ", diet: [], wear: [""], quote: "" }), TREE, "2026-11-10");
    expect(payload).toMatchObject({ area: null, tags: [], swim_requirement: null, dietary_options: [], what_to_wear_items: [], host_note: null });
  });

  it("has a private group price only when the host set one", () => {
    expect([privatePrice({ priv: "60000" }), privatePrice({ priv: "" }), privatePrice({ priv: "0" })]).toEqual([60000, null, null]);
  });

  it("sends a one-off's date, and stops a repeating schedule on its end date", () => {
    const once = toExperiencePayload(draft({ whenType: "once", date: "2026-12-05", slots: ["16:00"] }), TREE, "2026-11-10");
    expect(once).toMatchObject({ schedule_type: "one_off", event_start_date: "2026-12-05", start_times: ["16:00"], recurrence_type: null });
    const ending = toExperiencePayload(draft({ until: "2027-03-31" }), TREE, "2026-11-10");
    expect(ending).toMatchObject({ recurrence_end_type: "on_date", recurrence_end_date: "2027-03-31" });
  });

  it("sends no schedule for a listing guests ask about", () => {
    expect(toExperiencePayload(draft({ whenType: "request" }), TREE, "2026-11-10")).toMatchObject({
      schedule_type: null,
      recurrence_type: null,
      start_times: null,
    });
  });

  it("leaves out an age the policy doesn't use, hours a refund doesn't need, and free text that isn't a choice", () => {
    const payload = toExperiencePayload(
      draft({ agePolicy: "all_ages", refund: "non_refundable", fitness: "Easy, light walking" as ListingDraft["fitness"] }),
      TREE,
      "2026-11-10",
    );
    expect(payload).toMatchObject({ min_age: null, free_cancellation_hours: null, fitness_level: null });
  });

  it("keeps within itin's limits", () => {
    const payload = toExperiencePayload(draft({ landmark: "x".repeat(200), inc: Array(12).fill("y".repeat(200)) }), TREE, "2026-11-10");
    expect(payload.meeting_landmark).toHaveLength(120);
    expect(payload.whats_included).toHaveLength(10);
    expect(payload.whats_included[0]).toHaveLength(140);
  });
});

describe("helpers", () => {
  it("finds category slugs by name, and nothing for a category itin doesn't have", () => {
    expect(interestTags(TREE, "Nature & outdoors", "")).toEqual(["nature-outdoors"]);
    expect(interestTags(TREE, "Water activity", "Kayak and canoe")).toEqual([]);
  });

  it("puts the cover first", () => {
    expect(orderedPhotos({ photos: ["a", "b", "c"], cover: 2 })).toEqual(["c", "a", "b"]);
    expect(orderedPhotos({ photos: [], cover: 0 })).toEqual([]);
  });
});

describe("draftFromExperience", () => {
  it("reads a listing back into the builder", () => {
    const d = draftFromExperience(
      {
        id: "e1",
        status: "INACTIVE",
        title: "Lagoon kayak",
        headline: "Paddle at sunrise",
        interest_tags: ["nature-outdoors", "beaches-waterfronts"],
        city: "Lagos",
        latitude: 6.44,
        longitude: 3.42,
        meeting_landmark: "Five Cowries jetty",
        schedule_type: "recurring",
        recurrence_days: ["sat"],
        recurrence_interval: 2,
        start_times: ["07:30:00"],
        duration_minutes: 90,
        group_size_max: 8,
        whats_included: ["Breakfast"],
        fitness_level: "moderate",
        age_policy: "adults_only",
        accessibility: "not_suitable",
        refund_policy: "full_refund_until",
        free_cancellation_hours: 48,
        images: ["a", "b"],
        area: "Lekki",
        tags: ["Golden hour"],
        swim_requirement: "No swimming needed",
        dietary_options: ["Vegetarian"],
        what_to_wear_items: ["Sandals"],
        host_note: "See you at the jetty",
      },
      TREE,
      { price: 15000, privatePrice: 60000 },
    );
    expect(d).toMatchObject({
      editingId: "e1",
      title: "Lagoon kayak",
      cat: "Nature & outdoors",
      sub: "Beaches & waterfronts",
      lat: 6.44,
      whenType: "recurring",
      days: ["Sat"],
      every: 2,
      slots: ["07:30"],
      dur: "1.5",
      maxG: "8",
      price: "15000",
      priv: "60000",
      area: "Lekki",
      tags: ["Golden hour"],
      swim: "No swimming needed",
      diet: ["Vegetarian"],
      wear: ["Sandals"],
      quote: "See you at the jetty",
      inc: ["Breakfast"],
      exc: [""],
      fitness: "moderate",
      agePolicy: "adults_only",
      access: "not_suitable",
      refund: "full_refund_until",
      refundHours: "48",
      photos: ["a", "b"],
      cover: 0,
    });
  });

  it("treats a listing with no schedule as on request, and ignores values the builder doesn't offer", () => {
    const d = draftFromExperience({ id: "e2", status: "ACTIVE", title: "Pottery", fitness_level: "extreme", cover_image_url: "c" }, [], { price: null, privatePrice: null });
    expect(d).toMatchObject({ whenType: "request", fitness: "", price: "", priv: "", photos: ["c"], cat: "", tags: [], wear: [""], quote: "" });
  });
});
