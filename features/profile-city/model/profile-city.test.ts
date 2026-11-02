import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  currentPosition,
  fetchCityAt,
  locationPermission,
  POPULAR_CITIES,
  toCityChoice,
  useCitySearch,
} from "./profile-city";

const lagos = { name: "Lagos", region: "Lagos", country: "Nigeria", country_code: "NG", latitude: 6.45, longitude: 3.39 };
const london = { name: "London", region: "England", country: "United Kingdom", country_code: "GB", latitude: 51.5, longitude: -0.12 };

function stubNavigator(parts: { geolocation?: unknown; permissions?: unknown }) {
  for (const [name, value] of Object.entries(parts)) {
    Object.defineProperty(navigator, name, { configurable: true, value });
  }
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "geolocation");
  Reflect.deleteProperty(navigator, "permissions");
});

describe("toCityChoice", () => {
  it("describes a city by its region and country", () => {
    expect(toCityChoice(london)).toEqual({ key: "London|England|GB", name: "London", detail: "England, United Kingdom" });
  });

  it("doesn't repeat a city-state's name, and copes with missing parts", () => {
    expect(toCityChoice(lagos).detail).toBe("Nigeria");
    expect(toCityChoice({ ...lagos, region: null, country: null, country_code: null })).toEqual({
      key: "Lagos||",
      name: "Lagos",
      detail: "",
    });
  });

  it("offers twelve popular cities with unique keys", () => {
    expect(POPULAR_CITIES).toHaveLength(12);
    expect(new Set(POPULAR_CITIES.map((c) => c.key)).size).toBe(12);
    expect(POPULAR_CITIES[0]).toEqual({ key: "popular:Lagos", name: "Lagos", detail: "Lagos State, Nigeria" });
  });
});

describe("useCitySearch", () => {
  it("doesn't ask until two characters are typed", () => {
    const { result } = renderHookWithProviders(() => useCitySearch(" l "));
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("returns the matching cities as choices", async () => {
    let asked = "";
    server.use(
      http.get(apiUrl("/geo/cities"), ({ request }) => {
        asked = new URL(request.url).searchParams.get("q") ?? "";
        return HttpResponse.json([lagos, london]);
      }),
    );

    const { result } = renderHookWithProviders(() => useCitySearch(" lo "));

    await waitFor(() => expect(result.current.data?.map((c) => c.name)).toEqual(["Lagos", "London"]));
    expect(asked).toBe("lo");
  });
});

describe("fetchCityAt", () => {
  it("returns the city at a point", async () => {
    let params: URLSearchParams | null = null;
    server.use(
      http.get(apiUrl("/geo/reverse"), ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json(london);
      }),
    );

    await expect(fetchCityAt({ latitude: 51.5, longitude: -0.12 })).resolves.toMatchObject({ name: "London" });
    expect(params!.get("latitude")).toBe("51.5");
    expect(params!.get("longitude")).toBe("-0.12");
  });

  it("returns null when there is no city there, and throws when the lookup is down", async () => {
    server.use(http.get(apiUrl("/geo/reverse"), () => HttpResponse.json({ detail: "No city found" }, { status: 404 })));
    await expect(fetchCityAt({ latitude: 0, longitude: -30 })).resolves.toBeNull();

    server.use(http.get(apiUrl("/geo/reverse"), () => HttpResponse.json({ detail: "down" }, { status: 503 })));
    await expect(fetchCityAt({ latitude: 0, longitude: -30 })).rejects.toBeTruthy();
  });
});

describe("locationPermission", () => {
  it("reports what the browser says", async () => {
    stubNavigator({ geolocation: {}, permissions: { query: vi.fn().mockResolvedValue({ state: "granted" }) } });
    await expect(locationPermission()).resolves.toBe("granted");
  });

  it("is unknown when the browser can't say", async () => {
    await expect(locationPermission()).resolves.toBe("unknown");

    stubNavigator({ geolocation: {}, permissions: { query: vi.fn().mockRejectedValue(new TypeError("unsupported")) } });
    await expect(locationPermission()).resolves.toBe("unknown");
  });
});

describe("currentPosition", () => {
  it("resolves with the browser's coordinates", async () => {
    stubNavigator({
      geolocation: {
        getCurrentPosition: (ok: (p: unknown) => void) => ok({ coords: { latitude: 6.45, longitude: 3.39 } }),
      },
    });
    await expect(currentPosition()).resolves.toEqual({ latitude: 6.45, longitude: 3.39 });
  });

  it("says whether a failure was a refusal", async () => {
    const failWith = (code: number) =>
      stubNavigator({
        geolocation: {
          getCurrentPosition: (_ok: unknown, fail: (e: unknown) => void) => fail({ code, PERMISSION_DENIED: 1 }),
        },
      });

    failWith(1);
    await expect(currentPosition()).rejects.toEqual({ denied: true });
    failWith(3);
    await expect(currentPosition()).rejects.toEqual({ denied: false });
  });

  it("fails without a refusal when the browser has no geolocation", async () => {
    await expect(currentPosition()).rejects.toEqual({ denied: false });
  });
});
