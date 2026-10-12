import { describe, expect, it } from "vitest";

import { resolveGalleryImages } from "./experience-gallery";

describe("resolveGalleryImages", () => {
  it("keeps the photos in the order the API sends them", () => {
    expect(resolveGalleryImages({ images: ["a.jpg", "b.jpg", "c.jpg"], cover_image_url: "b.jpg" })).toEqual([
      "a.jpg",
      "b.jpg",
      "c.jpg",
    ]);
  });

  it("falls back to the cover when there is no photo list", () => {
    expect(resolveGalleryImages({ images: [], cover_image_url: "cover.jpg" })).toEqual(["cover.jpg"]);
    expect(resolveGalleryImages({ images: null, cover_image_url: "cover.jpg" })).toEqual(["cover.jpg"]);
  });

  it("drops blanks and repeats", () => {
    expect(resolveGalleryImages({ images: ["a.jpg", "", "a.jpg", "b.jpg"] })).toEqual(["a.jpg", "b.jpg"]);
  });

  it("is empty when the experience has no photos or has not loaded", () => {
    expect(resolveGalleryImages({ images: [], cover_image_url: null })).toEqual([]);
    expect(resolveGalleryImages(undefined)).toEqual([]);
  });
});
