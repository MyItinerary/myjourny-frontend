import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  DEFAULT_ACTIVITIES,
  DEFAULT_DESTINATIONS,
  FALLBACK_IMAGE,
  formatExperienceSubtitle,
  searchExperiencesQueryKey,
  useSearchExperiences,
} from "./search";

describe("search model constants & mappers", () => {
  it("provides default destinations, activities, and fallback image", () => {
    expect(DEFAULT_DESTINATIONS.length).toBeGreaterThan(0);
    expect(DEFAULT_ACTIVITIES.length).toBeGreaterThan(0);
    expect(FALLBACK_IMAGE).toBe("/images/home/experiences/kayaking.jpg");
  });

  it("builds consistent query keys", () => {
    const key = searchExperiencesQueryKey("Lagos", 5);
    expect(key).toEqual(["experiences", "filter", { search: "lagos", limit: 5 }]);
  });

  it("formats experience subtitle correctly", () => {
    expect(
      formatExperienceSubtitle({
        city: "Lagos",
        price_from: 15000,
        currency: "NGN",
      }),
    ).toBe("Lagos · from NGN 15,000");

    expect(
      formatExperienceSubtitle({
        city: null,
        price_from: 5000,
        currency: "USD",
      }),
    ).toBe("from USD 5,000");

    expect(
      formatExperienceSubtitle({
        city: "Abuja",
        headline: "Pottery workshop",
      }),
    ).toBe("Abuja · Pottery workshop");

    expect(
      formatExperienceSubtitle({
        city: null,
      }),
    ).toBe("Experience");
  });
});

describe("useSearchExperiences", () => {
  it("fetches experiences matching the search query", async () => {
    let capturedSearch: string | null = null;
    server.use(
      http.get(apiUrl("/experiences/filter"), ({ request }) => {
        capturedSearch = new URL(request.url).searchParams.get("search");
        return HttpResponse.json({
          items: [
            {
              id: "exp-1",
              title: "Nike Art Gallery Deep Dive",
              city: "Lagos",
              price_from: 15000,
              currency: "NGN",
            },
          ],
          total: 1,
        });
      }),
    );

    const { result } = renderHookWithProviders(() =>
      useSearchExperiences({ search: "Nike", limit: 5 }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedSearch).toBe("Nike");
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toBe("Nike Art Gallery Deep Dive");
  });

  it("does not fetch if search query is shorter than 2 characters", () => {
    const { result } = renderHookWithProviders(() =>
      useSearchExperiences({ search: "a", limit: 5 }),
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
