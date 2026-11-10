import { describe, expect, it } from "vitest";

import { cadenceOf, durationLabel, listingStatusOf, missingLine, toHostListing, toListingDetail } from "./guide-listings";
import type { GuideExperience } from "./guide-listings.types";

const exp = (over: Partial<GuideExperience> = {}): GuideExperience => ({
  id: "e1",
  status: "ACTIVE",
  title: "Lagoon kayak and breakfast",
  city: "Lagos",
  duration_minutes: 180,
  group_size_min: 2,
  group_size_max: 8,
  interest_tags: ["nature-outdoors", "beaches-waterfronts"],
  schedule_type: "recurring",
  recurrence_days: ["sat", "sun"],
  start_times: ["07:30:00"],
  price_from: 15000,
  rating: 4.86,
  cover_image_url: "https://res.cloudinary.com/demo/kayak.jpg",
  missing_for_publish: [],
  ...over,
});

const NAMES = { "nature-outdoors": "Nature & outdoors", "beaches-waterfronts": "Beaches & waterfronts" };

describe("listingStatusOf", () => {
  it("names each state the way the guide thinks of it", () => {
    expect(listingStatusOf({ status: "ACTIVE" })).toBe("Live");
    expect(listingStatusOf({ status: "INACTIVE", review_note: "Blurry photos" })).toBe("Taken down");
    expect(listingStatusOf({ status: "INACTIVE" })).toBe("Incomplete");
    expect(listingStatusOf({ status: "DRAFT" })).toBe("Draft");
  });
});

describe("toHostListing", () => {
  it("fills a row of the listings table", () => {
    expect(toHostListing(exp(), NAMES)).toEqual({
      id: "e1",
      imageUrl: "https://res.cloudinary.com/demo/kayak.jpg",
      title: "Lagoon kayak and breakfast",
      sub: "Lagos · 3 hours",
      cat: "Nature & outdoors",
      subcat: "Beaches & waterfronts",
      status: "Live",
      price: 15000,
      next: "Sat and Sun at 07:30",
      bookings: "-",
      rating: "4.9",
      future: 0,
      note: undefined,
    });
  });

  it("says why a listing was taken down", () => {
    expect(toHostListing(exp({ status: "INACTIVE", review_note: "Use a photo from the trip." }), NAMES).note).toBe(
      "Taken down: Use a photo from the trip.",
    );
  });

  it("says what an incomplete listing still needs", () => {
    expect(toHostListing(exp({ status: "INACTIVE", missing_for_publish: ["pin", "photo"] }), NAMES).note).toBe(
      "Still needs a map pin and a photo",
    );
  });

  it("copes with a listing that has no photo, price, rating or category yet", () => {
    const row = toHostListing(exp({ cover_image_url: null, price_from: null, rating: null, interest_tags: [] }), NAMES);
    expect(row).toMatchObject({ imageUrl: "", price: 0, rating: "-", cat: "No category", subcat: "" });
  });
});

describe("labels", () => {
  it("writes durations plainly", () => {
    expect(durationLabel(60)).toBe("1 hour");
    expect(durationLabel(90)).toBe("90 minutes");
    expect(durationLabel(null)).toBe("");
  });

  it("describes the schedule", () => {
    expect(cadenceOf({ schedule_type: "one_off", start_times: ["16:00:00"] })).toBe("One date at 16:00");
    expect(cadenceOf({ schedule_type: "recurring", recurrence_days: ["mon", "wed", "fri"], start_times: [] })).toBe("Mon, Wed and Fri");
    expect(cadenceOf({ schedule_type: null })).toBe("Not set");
  });

  it("lists missing items in the guide's words", () => {
    expect(missingLine(["fitness", "age", "accessibility"])).toBe("how physical it is, the youngest age and getting around");
    expect(missingLine([])).toBe("");
  });
});

describe("toListingDetail", () => {
  it("shows a live listing's rules and offers to copy its link", () => {
    const detail = toListingDetail(
      exp({ age_policy: "minimum_age", min_age: 12, fitness_level: "moderate", weather_dependent: true, headline: "Paddle at sunrise" }),
    );
    expect(detail.hook).toBe("Paddle at sunrise");
    expect(detail.rules).toEqual([
      "Instant book",
      "2 to 8 guests",
      "3 hours",
      "Sat and Sun at 07:30",
      "12 and up",
      "Moderate",
      "We may move or cancel it",
    ]);
    expect(detail.actions.map((a) => a.action)).toEqual(["edit", "copy-link"]);
    expect(detail.banner).toBeUndefined();
  });

  it("puts our note in the banner of a listing we took down", () => {
    const detail = toListingDetail(exp({ status: "INACTIVE", review_note: "Use a photo from the trip." }));
    expect(detail.banner).toMatchObject({ kind: "rejected", title: "We took this listing down" });
    expect(detail.banner?.body).toContain("Use a photo from the trip.");
    expect(detail.actions.map((a) => a.action)).toEqual(["edit"]);
  });

  it("tells an incomplete listing what to add", () => {
    const detail = toListingDetail(exp({ status: "INACTIVE", missing_for_publish: ["photo"] }));
    expect(detail.banner).toMatchObject({ title: "Not live yet", body: "Add a photo and publish it to go live." });
  });
});
