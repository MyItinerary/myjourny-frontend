import { describe, expect, it } from "vitest";

import type { ExperienceDetail } from "@/lib/queries/experiences";

import { buildExperienceDetails } from "./experience-details";

const base: ExperienceDetail = { id: "exp-1", status: "ACTIVE", title: "Sunrise Kayaking" };

describe("buildExperienceDetails", () => {
  it("carries the title, rating, duration and location", () => {
    const content = buildExperienceDetails(
      { ...base, rating: 4, city: "Lagos", country: "Nigeria", headline: "Paddle at dawn" },
      "1 hour",
    );
    expect(content).toMatchObject({
      id: "exp-1",
      title: "Sunrise Kayaking",
      headline: "Paddle at dawn",
      rating: 4,
      durationLabel: "1 hour",
      location: "Lagos, Nigeria",
      place: { name: "Lagos", detail: "Lagos, Nigeria" },
    });
  });

  it("leaves out everything the experience has no data for", () => {
    const content = buildExperienceDetails(base, "Flexible");
    expect(content).toMatchObject({
      about: null,
      facts: [],
      itinerary: [],
      highlights: [],
      included: [],
      notIncluded: [],
      safetyNotes: [],
      location: "",
      rating: null,
      host: { id: null, name: "Your host", verified: false },
    });
  });

  it("builds the before-you-book facts from the requirements, group size and cancellation policy", () => {
    const { facts } = buildExperienceDetails(
      {
        ...base,
        requirements: { fitness: "High activity.", accessibility: "Partly accessible.", age: "Ages 10 and over" },
        group_size_min: 2,
        group_size_max: 8,
        cancellation_policy: "Full refund up to 24 hours before.",
      },
      "1 hour",
    );
    expect(facts.map((f) => [f.icon, f.title, f.body])).toEqual([
      ["fitness", "Fitness level", "High activity."],
      ["accessibility", "Accessibility", "Partly accessible."],
      ["age", "Age", "Ages 10 and over"],
      ["group", "Group size", "Up to 8 guests, minimum 2"],
      ["cancellation", "Cancellation", "Full refund up to 24 hours before."],
    ]);
  });

  it("falls back to the energy level and the safety info for fitness and accessibility", () => {
    const { facts } = buildExperienceDetails(
      { ...base, energy_level: "high", group_size_max: 1, safety_info: { mobilityAccessibility: "Step-free." } },
      "1 hour",
    );
    expect(facts.map((f) => [f.id, f.body])).toEqual([
      ["fitness", "High energy"],
      ["accessibility", "Step-free."],
      ["group", "Up to 1 guests"],
    ]);
  });

  it("trims the lists and drops blanks", () => {
    const content = buildExperienceDetails(
      {
        ...base,
        what_you_will_do: [" Meet the guide ", ""],
        why_you_will_like_this: ["Calm water"],
        whats_included: ["Kayak"],
        whats_not_included: ["Tips"],
        safety_info: { notes: ["Life jackets are mandatory"] },
      },
      "1 hour",
    );
    expect(content.itinerary).toEqual(["Meet the guide"]);
    expect(content.highlights).toEqual(["Calm water"]);
    expect(content.included).toEqual(["Kayak"]);
    expect(content.notIncluded).toEqual(["Tips"]);
    expect(content.safetyNotes).toEqual(["Life jackets are mandatory"]);
  });

  it("describes the host", () => {
    const content = buildExperienceDetails(
      { ...base, host: { id: "h1", display_name: "Kayak Thrills", is_verified: true, headline: "Eight years on the bay" } },
      "1 hour",
    );
    expect(content.host).toEqual({ id: "h1", name: "Kayak Thrills", verified: true, blurb: "Eight years on the bay" });
  });
});
