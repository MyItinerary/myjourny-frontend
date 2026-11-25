import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import type { HostAccess } from "./host-access";
import { useHostListings } from "./listings-data";

const access = vi.hoisted(() => ({ current: "approved" as HostAccess }));
vi.mock("./host-access", () => ({ useHostAccess: () => access.current }));

const KAYAK = {
  id: "e1",
  status: "ACTIVE",
  title: "Lagoon kayak and breakfast",
  city: "Lagos",
  duration_minutes: 180,
  interest_tags: ["nature-outdoors", "beaches-waterfronts"],
  price_from: 15000,
  cover_image_url: "https://res.cloudinary.com/demo/kayak.jpg",
  missing_for_publish: [],
};

beforeEach(() => {
  access.current = "approved";
  server.use(
    http.get(apiUrl("/guide/experiences"), () => HttpResponse.json([KAYAK])),
    http.get(apiUrl("/categories"), () =>
      HttpResponse.json([
        { id: 1, parent_id: null, slug: "nature-outdoors", text: "Nature & outdoors", category_type: "interest", is_active: true,
          children: [{ id: 2, parent_id: 1, slug: "beaches-waterfronts", text: "Beaches & waterfronts", category_type: "interest", is_active: true }] },
      ]),
    ),
  );
});
afterEach(() => vi.unstubAllEnvs());

describe("useHostListings", () => {
  it("loads the guide's own listings from itin, with category names", async () => {
    const { result } = renderHookWithProviders(() => useHostListings(null));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.listings).toHaveLength(1));
    expect(result.current.loading).toBe(false);
    await waitFor(() => expect(result.current.listings[0].cat).toBe("Nature & outdoors"));
    expect(result.current.listings[0]).toMatchObject({ title: "Lagoon kayak and breakfast", status: "Live", price: 15000, subcat: "Beaches & waterfronts" });
  });

  it("asks itin nothing until the account is known to be a guide", () => {
    access.current = "checking";
    const { result } = renderHookWithProviders(() => useHostListings(null));
    expect(result.current).toEqual({ listings: [], loading: false });
  });

  it("shows the eight sample listings for ?preview=full", () => {
    expect(renderHookWithProviders(() => useHostListings("full")).result.current.listings).toHaveLength(8);
  });

  it("ignores the preview in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    access.current = "checking";
    expect(renderHookWithProviders(() => useHostListings("full")).result.current.listings).toEqual([]);
  });
});
