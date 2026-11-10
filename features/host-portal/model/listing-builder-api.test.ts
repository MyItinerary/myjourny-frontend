import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { builderHandlers, CLOUDINARY, FREEDOM_PARK } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { fetchListingForEdit, searchPlaces, uploadPhoto, useInterestTree, usePlaceSearch, useSaveListing } from "./listing-builder-api";
import { blankDraft } from "./listing-draft";
import { toExperiencePayload } from "./listing-payload";

beforeEach(() => server.use(...builderHandlers()));

const payload = toExperiencePayload({ ...blankDraft(), title: "Lagoon kayak" }, [], "2026-11-10");

describe("place search", () => {
  it("finds places in Nigeria with their map pins", async () => {
    let asked = "";
    server.use(
      http.get("https://nominatim.openstreetmap.org/search", ({ request }) => {
        asked = request.url;
        return HttpResponse.json([{ display_name: "Freedom Park, Old Broad Street, Lagos Island, Lagos", lat: "6.45", lon: "3.39" }]);
      }),
    );
    expect(await searchPlaces("freedom", "Lagos")).toEqual([{ name: "Freedom Park", area: "Old Broad Street, Lagos Island", lat: 6.45, lng: 3.39 }]);
    expect(new URL(asked).searchParams.get("q")).toBe("freedom, Lagos");
    expect(new URL(asked).searchParams.get("countrycodes")).toBe("ng");
  });

  it("waits for three letters", async () => {
    const short = renderHookWithProviders(() => usePlaceSearch("fr", "Lagos"));
    expect(short.result.current.fetchStatus).toBe("idle");
    const { result } = renderHookWithProviders(() => usePlaceSearch("freedom", "Lagos"));
    await waitFor(() => expect(result.current.data?.[0]).toMatchObject({ name: FREEDOM_PARK.name, lat: FREEDOM_PARK.lat }));
  });
});

describe("uploads", () => {
  it("signs with itin and returns the Cloudinary link", async () => {
    expect(await uploadPhoto(new File(["kayak.jpg"], "kayak.jpg", { type: "image/jpeg" }))).toBe(`${CLOUDINARY}kayak.jpg`);
  });

  it("fails when Cloudinary refuses", async () => {
    server.use(http.post("https://api.cloudinary.com/v1_1/demo/image/upload", () => new HttpResponse(null, { status: 400 })));
    await expect(uploadPhoto(new File(["x"], "x.jpg"))).rejects.toThrow("Photo upload failed");
  });
});

describe("categories", () => {
  it("is ready once the request finishes, even with none", async () => {
    const { result } = renderHookWithProviders(() => useInterestTree());
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.tree).toEqual([]);
  });
});

describe("saving", () => {
  it("loads a listing and its price for editing", async () => {
    server.use(
      http.get(apiUrl("/guide/experiences/e1"), () => HttpResponse.json({ id: "e1", status: "ACTIVE", title: "Kayak" })),
      http.get(apiUrl("/experiences/e1/pricing"), () => HttpResponse.json({ prices: [{ id: "p1", amount: "9000.00" }] })),
    );
    expect(await fetchListingForEdit("e1")).toEqual({ experience: { id: "e1", status: "ACTIVE", title: "Kayak" }, price: 9000 });
  });

  it("creates a new listing with its Adult ticket", async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post(apiUrl("/experiences/"), async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "e1", status: "ACTIVE", title: "Lagoon kayak" }, { status: 201 });
      }),
    );
    const { result } = renderHookWithProviders(() => useSaveListing());
    await act(() => result.current.mutateAsync({ id: null, payload, price: 15000 }));
    expect(sent).toMatchObject({ title: "Lagoon kayak", prices: [{ label: "Adult", amount: 15000, pricing_unit: "per_person" }] });
  });

  it("saves an edit, and changes the ticket only when the price changed", async () => {
    const calls: string[] = [];
    let amount = "15000.00";
    server.use(
      http.put(apiUrl("/experiences/e1"), () => {
        calls.push("put");
        return HttpResponse.json({ id: "e1", status: "ACTIVE", title: "Lagoon kayak" });
      }),
      http.get(apiUrl("/experiences/e1/pricing"), () => HttpResponse.json({ prices: [{ id: "p1", amount }] })),
      http.patch(apiUrl("/experiences/e1/prices/p1"), () => {
        calls.push("patch");
        return HttpResponse.json({});
      }),
    );
    const { result } = renderHookWithProviders(() => useSaveListing());
    await act(() => result.current.mutateAsync({ id: "e1", payload, price: 15000 }));
    expect(calls).toEqual(["put"]);

    amount = "12000.00";
    await act(() => result.current.mutateAsync({ id: "e1", payload, price: 15000 }));
    expect(calls).toEqual(["put", "put", "patch"]);
  });

  it("adds a ticket to a listing that has none", async () => {
    let created: unknown = null;
    server.use(
      http.put(apiUrl("/experiences/e1"), () => HttpResponse.json({ id: "e1", status: "ACTIVE", title: "Lagoon kayak" })),
      http.get(apiUrl("/experiences/e1/pricing"), () => HttpResponse.json({ prices: [] })),
      http.post(apiUrl("/experiences/e1/prices"), async ({ request }) => {
        created = await request.json();
        return HttpResponse.json({}, { status: 201 });
      }),
    );
    const { result } = renderHookWithProviders(() => useSaveListing());
    await act(() => result.current.mutateAsync({ id: "e1", payload, price: 15000 }));
    expect(created).toEqual({ label: "Adult", amount: 15000, pricing_unit: "per_person" });
  });
});
