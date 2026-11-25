import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { coverLayout, useWishlistCoverImages, useWishlistCoverLayouts } from "./wishlist-covers";

describe("coverLayout", () => {
  it("is empty with nothing saved", () => {
    expect(coverLayout(0, [], "/cover.jpg")).toEqual({ kind: "empty" });
  });

  it("shows the one experience's main image", () => {
    expect(coverLayout(1, ["/canoe.jpg"], "/cover.jpg")).toEqual({ kind: "single", src: "/canoe.jpg" });
    // Before its images load, the collection's own cover stands in.
    expect(coverLayout(1, undefined, "/cover.jpg")).toEqual({ kind: "single", src: "/cover.jpg" });
  });

  it("makes a 2×2 grid of the first four, even with more", () => {
    expect(coverLayout(6, ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg"], null)).toEqual({
      kind: "grid",
      tiles: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"],
    });
  });

  it("greys out the tiles it has no image for", () => {
    expect(coverLayout(2, ["/1.jpg", null], null)).toEqual({ kind: "grid", tiles: ["/1.jpg", null, null, null] });
    expect(coverLayout(3, undefined, "/cover.jpg")).toEqual({ kind: "grid", tiles: ["/cover.jpg", null, null, null] });
  });
});

describe("useWishlistCoverImages", () => {
  it("fetches the images of each collection with something in it", async () => {
    const requested = vi.fn();
    server.use(
      http.get(apiUrl("/wishlists/:id/experiences"), ({ params }) => {
        requested(params.id);
        return HttpResponse.json([
          { id: "i-1", experienceId: "e-1", title: "Canoe", imageUrl: "/canoe.jpg" },
          { id: "i-2", experienceId: "e-2", title: "Walk", imageUrl: null },
        ]);
      }),
    );
    const { result } = renderHookWithProviders(() =>
      useWishlistCoverImages([
        { id: "w-1", item_count: 2 },
        { id: "w-2", item_count: 0 },
      ]),
    );

    await waitFor(() => expect(result.current["w-1"]).toEqual(["/canoe.jpg", null]));
    expect(result.current["w-2"]).toBeUndefined();
    expect(requested).toHaveBeenCalledTimes(1);
    expect(requested).toHaveBeenCalledWith("w-1");
  });
});

describe("useWishlistCoverLayouts", () => {
  it("turns each collection into its cover", async () => {
    server.use(
      http.get(apiUrl("/wishlists/:id/experiences"), () =>
        HttpResponse.json([{ id: "i-1", experienceId: "e-1", title: "Canoe", imageUrl: "/canoe.jpg" }]),
      ),
    );
    const { result } = renderHookWithProviders(() =>
      useWishlistCoverLayouts([
        { id: "w-1", item_count: 1, cover_image_url: "/cover.jpg" },
        { id: "w-2", item_count: 0, cover_image_url: null },
      ]),
    );

    await waitFor(() => expect(result.current["w-1"]).toEqual({ kind: "single", src: "/canoe.jpg" }));
    expect(result.current["w-2"]).toEqual({ kind: "empty" });
  });
});
