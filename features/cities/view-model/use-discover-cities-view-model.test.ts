import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useDiscoverCitiesViewModel } from "./use-discover-cities-view-model";

describe("useDiscoverCitiesViewModel", () => {
  it("shows every city with experiences, and none of the made-up ones while loading", async () => {
    server.use(
      http.get(apiUrl("/experiences/cities"), () =>
        HttpResponse.json([
          { slug: "lagos", name: "Lagos", country: "Nigeria", count: 25, image_url: null },
          { slug: "port-harcourt", name: "Port Harcourt", country: "Nigeria", count: 20, image_url: "https://cdn.example.com/ph.jpg" },
        ]),
      ),
    );
    const { result } = renderHookWithProviders(() => useDiscoverCitiesViewModel());

    expect(result.current).toEqual({ cities: [], show: true });
    await waitFor(() => expect(result.current.cities.map((c) => c.id)).toEqual(["lagos", "port-harcourt"]));
    expect(result.current.cities[1].imageSrc).toBe("https://cdn.example.com/ph.jpg");
  });

  it("hides the section when there are no cities or they can't load", async () => {
    server.use(http.get(apiUrl("/experiences/cities"), () => HttpResponse.json([])));
    const empty = renderHookWithProviders(() => useDiscoverCitiesViewModel());
    await waitFor(() => expect(empty.result.current.show).toBe(false));

    server.use(http.get(apiUrl("/experiences/cities"), () => HttpResponse.json({ detail: "down" }, { status: 500 })));
    const failed = renderHookWithProviders(() => useDiscoverCitiesViewModel());
    await waitFor(() => expect(failed.result.current.show).toBe(false), { timeout: 5000 });
  });
});
