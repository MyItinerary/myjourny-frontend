import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useHostListingDetail } from "./listing-detail-data";

beforeEach(() => {
  server.use(
    http.get(apiUrl("/categories"), () => HttpResponse.json([])),
    http.get(apiUrl("/guide/experiences/e1"), () =>
      HttpResponse.json({ id: "e1", status: "INACTIVE", review_note: "Use a photo from the walk.", title: "Lagos Island Photowalk" }),
    ),
    http.get(apiUrl("/guide/experiences/gone"), () => HttpResponse.json({ detail: "Experience not found" }, { status: 404 })),
  );
});

describe("useHostListingDetail", () => {
  it("loads one of the guide's listings, even one we took down", async () => {
    const { result } = renderHookWithProviders(() => useHostListingDetail("e1", null));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.listing?.status).toBe("Taken down"));
    expect(result.current.detail?.banner?.title).toBe("We took this listing down");
  });

  it("finds nothing for a listing that isn't theirs", async () => {
    const { result } = renderHookWithProviders(() => useHostListingDetail("gone", null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.listing).toBeNull();
  });

  it("shows the design's sample listing for ?preview=full", () => {
    const { result } = renderHookWithProviders(() => useHostListingDetail("l1", "full"));
    expect(result.current.detail?.id).toBe("l1");
    expect(renderHookWithProviders(() => useHostListingDetail("nope", "full")).result.current.listing).toBeNull();
  });
});
