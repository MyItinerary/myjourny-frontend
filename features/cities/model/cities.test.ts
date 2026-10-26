import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { toCityDestination, toCityTile, useExperienceCities } from "./cities";

const lagos = { slug: "lagos", name: "Lagos", country: "Nigeria", count: 25, image_url: "https://cdn.example.com/lekki.jpg" };
const umuahia = { slug: "umuahia", name: "Umuahia", country: "Nigeria", count: 1, image_url: "https://cdn.example.com/farm.jpg" };

describe("toCityTile", () => {
  it("uses our own photo for a city we have one for, and the best experience's cover otherwise", () => {
    expect(toCityTile(lagos)).toEqual({ id: "lagos", name: "Lagos", country: "Nigeria", imageSrc: "/images/home/cities/lagos.jpg" });
    expect(toCityTile(umuahia).imageSrc).toBe("https://cdn.example.com/farm.jpg");
  });

  it("falls back to a default photo when a new city has no cover yet", () => {
    expect(toCityTile({ ...umuahia, image_url: null, country: null })).toMatchObject({
      imageSrc: "/images/home/cities/lagos.jpg",
      country: "",
    });
  });
});

describe("toCityDestination", () => {
  it("names the city with its country and how many experiences it has", () => {
    expect(toCityDestination(lagos)).toEqual({ id: "lagos", city: "Lagos, Nigeria", description: "25 experiences" });
    expect(toCityDestination({ ...umuahia, country: null })).toEqual({
      id: "umuahia",
      city: "Umuahia",
      description: "1 experience",
    });
  });
});

describe("useExperienceCities", () => {
  it("loads the cities that have experiences", async () => {
    server.use(http.get(apiUrl("/experiences/cities"), () => HttpResponse.json([lagos, umuahia])));
    const { result } = renderHookWithProviders(() => useExperienceCities());

    await waitFor(() => expect(result.current.data).toEqual([lagos, umuahia]));
  });
});
