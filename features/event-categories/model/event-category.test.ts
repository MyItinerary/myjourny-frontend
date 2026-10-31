import { describe, expect, it } from "vitest";

import { eventCategoryHref, eventCategoryLabel } from "./event-category";

describe("event categories", () => {
  it("makes a readable name from a slug", () => {
    expect(eventCategoryLabel("music-concerts")).toBe("Music Concerts");
    expect(eventCategoryLabel("talks")).toBe("Talks");
    expect(eventCategoryLabel("")).toBe("");
  });

  it("lives under /events/categories, not the experience categories", () => {
    expect(eventCategoryHref("music-concerts")).toBe("/events/categories/music-concerts");
  });
});
