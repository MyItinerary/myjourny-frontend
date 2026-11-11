import { describe, expect, it } from "vitest";

import type { ExperienceDetail } from "@/features/experience-details";

import { buildExperiencePage, MORE_WAYS } from "./experience-page";

const base: ExperienceDetail = { id: "exp-1", status: "ACTIVE", title: "Sunrise Kayaking" };

describe("buildExperiencePage", () => {
  it("carries the title, rating, duration and location", () => {
    const content = buildExperiencePage(
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
      city: "Lagos",
      place: { name: "Lagos", detail: "Lagos, Nigeria" },
    });
  });

  it("leaves out what the experience has no data for", () => {
    expect(buildExperiencePage(base, "Flexible")).toMatchObject({
      included: [],
      notIncluded: [],
      location: "",
      rating: null,
      city: null,
      host: { id: null, name: "Your host", verified: false },
    });
  });

  it("trims the inclusion lists and drops blanks", () => {
    const content = buildExperiencePage({ ...base, whats_included: [" Kayak ", ""], whats_not_included: ["Tips"] }, "1 hour");
    expect(content.included).toEqual(["Kayak"]);
    expect(content.notIncluded).toEqual(["Tips"]);
  });

  it("describes the host", () => {
    const content = buildExperiencePage(
      { ...base, host: { id: "h1", display_name: "Kayak Thrills", is_verified: true, headline: "Eight years on the bay" } },
      "1 hour",
    );
    expect(content.host).toEqual({ id: "h1", name: "Kayak Thrills", verified: true, blurb: "Eight years on the bay", note: null });
  });

  it("carries the host's own line and tags only when they set them", () => {
    const content = buildExperiencePage({ ...base, host_note: " See you at the jetty ", tags: ["Small group", " ", "Golden hour"] }, "1 hour");
    expect(content.host.note).toBe("See you at the jetty");
    expect(content.tags).toEqual(["Small group", "Golden hour"]);
    expect(buildExperiencePage({ ...base, host_note: " " }, "1 hour")).toMatchObject({ host: { note: null }, tags: [] });
  });

  it("offers experience categories, not event categories", () => {
    expect(buildExperiencePage(base, "1 hour").moreWays).toBe(MORE_WAYS);
    expect(MORE_WAYS.map((way) => way.slug)).toEqual(["local-food-drinks", "nature-outdoors", "art-creativity", "nightlife"]);
  });
});
