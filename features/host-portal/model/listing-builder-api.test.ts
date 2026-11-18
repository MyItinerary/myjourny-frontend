import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { builderHandlers, CLOUDINARY, FREEDOM_PARK } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  fetchListingForEdit,
  fetchPlacePin,
  searchPlaces,
  uploadPhoto,
  useInterestTree,
  usePlaceSearch,
  useSaveListing,
} from "./listing-builder-api";
import { blankDraft } from "./listing-draft";
import { toExperiencePayload } from "./listing-payload";

beforeEach(() => server.use(...builderHandlers()));

const payload = toExperiencePayload({ ...blankDraft(), title: "Lagoon kayak" }, [], "2026-11-10");

describe("place search", () => {
  it("asks itin (Google) for places in the listing's city, in one search session", async () => {
    let asked = "";
    server.use(
      http.get(apiUrl("/geo/places/autocomplete"), ({ request }) => {
        asked = request.url;
        return HttpResponse.json([{ place_id: "p1", name: "Freedom Park", area: "Old Broad Street, Lagos" }, { place_id: "p2", name: "Tafawa Balewa Square", area: null }]);
      }),
    );
    expect(await searchPlaces("freedom", "Lagos", "s1")).toEqual([
      { placeId: "p1", name: "Freedom Park", area: "Old Broad Street, Lagos" },
      { placeId: "p2", name: "Tafawa Balewa Square", area: "" },
    ]);
    const params = new URL(asked).searchParams;
    expect([params.get("q"), params.get("city"), params.get("session")]).toEqual(["freedom", "Lagos", "s1"]);
  });

  it("looks up a picked place's pin in the same session", async () => {
    let session = "";
    server.use(
      http.get(apiUrl("/geo/places/:id"), ({ request }) => {
        session = new URL(request.url).searchParams.get("session") ?? "";
        return HttpResponse.json({ place_id: "p1", latitude: 6.45, longitude: 3.39 });
      }),
    );
    expect(await fetchPlacePin("p1", "s1")).toEqual({ lat: 6.45, lng: 3.39 });
    expect(session).toBe("s1");
  });

  it("waits for three letters", async () => {
    const short = renderHookWithProviders(() => usePlaceSearch("fr", "Lagos", "s"));
    expect(short.result.current.fetchStatus).toBe("idle");
    const { result } = renderHookWithProviders(() => usePlaceSearch("freedom", "Lagos", "s"));
    await waitFor(() => expect(result.current.data?.[0]).toMatchObject({ name: FREEDOM_PARK.name, placeId: FREEDOM_PARK.placeId }));
  });
});

describe("uploads", () => {
  it("signs with itin and returns the Cloudinary link", async () => {
    expect(await uploadPhoto(new File(["kayak.jpg"], "kayak.jpg", { type: "image/jpeg" }))).toBe(`${CLOUDINARY}photo-1.jpg`);
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
      http.get(apiUrl("/experiences/e1/pricing"), () =>
        HttpResponse.json({ prices: [{ id: "p2", amount: "60000.00", pricing_unit: "per_booking" }, { id: "p1", amount: "9000.00", pricing_unit: "per_person" }] }),
      ),
    );
    expect(await fetchListingForEdit("e1")).toEqual({
      experience: { id: "e1", status: "ACTIVE", title: "Kayak" },
      prices: { price: 9000, privatePrice: 60000 },
    });
  });

  it("creates a new listing with its Adult ticket and private group price", async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post(apiUrl("/experiences/"), async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "e1", status: "ACTIVE", title: "Lagoon kayak" }, { status: 201 });
      }),
    );
    const { result } = renderHookWithProviders(() => useSaveListing());
    await act(() => result.current.mutateAsync({ id: null, payload, price: 15000, privatePrice: 60000 }));
    expect(sent).toMatchObject({
      title: "Lagoon kayak",
      prices: [
        { label: "Adult", amount: 15000, pricing_unit: "per_person" },
        { label: "Private group", amount: 60000, pricing_unit: "per_booking" },
      ],
    });
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
    await act(() => result.current.mutateAsync({ id: "e1", payload, price: 15000, privatePrice: null }));
    expect(calls).toEqual(["put"]);

    amount = "12000.00";
    await act(() => result.current.mutateAsync({ id: "e1", payload, price: 15000, privatePrice: null }));
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
    await act(() => result.current.mutateAsync({ id: "e1", payload, price: 15000, privatePrice: null }));
    expect(created).toEqual({ label: "Adult", amount: 15000, pricing_unit: "per_person" });
  });

  it("adds, changes and archives the private group ticket as the host sets and clears it", async () => {
    const calls: string[] = [];
    let prices: Record<string, string>[] = [{ id: "p1", amount: "15000.00", pricing_unit: "per_person" }];
    server.use(
      http.put(apiUrl("/experiences/e1"), () => HttpResponse.json({ id: "e1", status: "ACTIVE", title: "Lagoon kayak" })),
      http.get(apiUrl("/experiences/e1/pricing"), () => HttpResponse.json({ prices })),
      http.post(apiUrl("/experiences/e1/prices"), async ({ request }) => {
        calls.push(`post ${JSON.stringify(await request.json())}`);
        return HttpResponse.json({}, { status: 201 });
      }),
      http.patch(apiUrl("/experiences/e1/prices/p2"), async ({ request }) => {
        calls.push(`patch ${JSON.stringify(await request.json())}`);
        return HttpResponse.json({});
      }),
    );
    const { result } = renderHookWithProviders(() => useSaveListing());
    const save = (privatePrice: number | null) => act(() => result.current.mutateAsync({ id: "e1", payload, price: 15000, privatePrice }));

    await save(60000);
    expect(calls).toEqual(['post {"label":"Private group","amount":60000,"pricing_unit":"per_booking"}']);

    prices = [...prices, { id: "p2", amount: "60000.00", pricing_unit: "per_booking" }];
    calls.length = 0;
    await save(60000);
    expect(calls).toEqual([]);
    await save(55000);
    expect(calls).toEqual(['patch {"amount":55000}']);
    await save(null);
    expect(calls).toEqual(['patch {"amount":55000}', 'patch {"is_active":false}']);
  });
});
