import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useProfileCityViewModel } from "./use-profile-city-view-model";

const locationPermission = vi.fn();
const currentPosition = vi.fn();
vi.mock("../model/profile-city", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../model/profile-city")>()),
  locationPermission: () => locationPermission(),
  currentPosition: () => currentPosition(),
}));

const accra = { name: "Accra", region: "Greater Accra Region", country: "Ghana", country_code: "GH", latitude: 5.6, longitude: -0.19 };
const london = { name: "London", region: "England", country: "United Kingdom", country_code: "GB", latitude: 51.5, longitude: -0.12 };

type City = typeof accra;
type Api = { cities?: City[] | number; reverse?: City | number; saveStatus?: number };

function stubApi({ cities = [], reverse = 404, saveStatus = 200 }: Api = {}) {
  const calls = { searches: [] as string[], reverses: 0, saved: [] as unknown[] };
  server.use(
    http.get(apiUrl("/geo/cities"), ({ request }) => {
      calls.searches.push(new URL(request.url).searchParams.get("q") ?? "");
      return typeof cities === "number" ? HttpResponse.json({ detail: "down" }, { status: cities }) : HttpResponse.json(cities);
    }),
    http.get(apiUrl("/geo/reverse"), () => {
      calls.reverses += 1;
      return typeof reverse === "number" ? HttpResponse.json({ detail: "none" }, { status: reverse }) : HttpResponse.json(reverse);
    }),
    http.put(apiUrl("/profile/me"), async ({ request }) => {
      calls.saved.push(await request.json());
      return HttpResponse.json({ message: "Profile updated successfully" }, { status: saveStatus });
    }),
  );
  return calls;
}

const onClose = vi.fn();
const onSaved = vi.fn();
const onError = vi.fn();

function setup(
  options: { city?: string | null; ready?: boolean; open?: boolean } = {},
  { reactStrictMode = false } = {},
) {
  return renderHookWithProviders(
    () => useProfileCityViewModel({ city: "Lagos", ready: true, open: true, onClose, onSaved, onError, ...options }),
    { reactStrictMode },
  );
}

beforeEach(() => {
  locationPermission.mockResolvedValue("prompt");
  currentPosition.mockResolvedValue({ latitude: 5.6, longitude: -0.19 });
});
afterEach(() => vi.clearAllMocks());

describe("useProfileCityViewModel: the dialog", () => {
  it("offers the popular cities before anything is typed", () => {
    stubApi();
    const { result } = setup();

    expect(result.current.listLabel).toBe("Popular cities");
    expect(result.current.choices).toHaveLength(12);
    expect(result.current.canSave).toBe(false);
    expect(result.current.notice).toBeNull();
  });

  it("searches any city once typing pauses, and saves the one picked", async () => {
    const calls = stubApi({ cities: [london] });
    const { result } = setup();

    act(() => result.current.onSearchChange("l"));
    act(() => result.current.onSearchChange("lo"));
    act(() => result.current.onSearchChange("lon"));
    expect(result.current.searching).toBe(true);
    expect(result.current.listLabel).toBeNull();

    await waitFor(() => expect(result.current.choices.map((c) => c.name)).toEqual(["London"]));
    expect(result.current.searching).toBe(false);
    // One request for the settled text, none per keystroke.
    expect(calls.searches).toEqual(["lon"]);

    act(() => result.current.onSelect(result.current.choices[0]));
    expect(result.current.selectedKey).toBe("London|England|GB");
    act(() => result.current.onSave());

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith("Saved. Your city is London."));
    expect(calls.saved).toEqual([{ city: "London" }]);
    expect(onClose).toHaveBeenCalled();
    expect(result.current.search).toBe("");
  });

  it("drops the selection when the search text changes", async () => {
    stubApi({ cities: [london] });
    const { result } = setup();
    act(() => result.current.onSelect(result.current.choices[0]));
    expect(result.current.canSave).toBe(true);

    act(() => result.current.onSearchChange("lon"));

    expect(result.current.canSave).toBe(false);
    await waitFor(() => expect(result.current.searching).toBe(false));
  });

  it("says so when nothing matches or the search is down", async () => {
    stubApi({ cities: [] });
    const { result } = setup();
    act(() => result.current.onSearchChange("zzzz"));
    await waitFor(() => expect(result.current.notice).toMatch(/No city matches that/));

    stubApi({ cities: 503 });
    act(() => result.current.onSearchChange("accra"));
    await waitFor(() => expect(result.current.notice).toBe("City search is unavailable right now. Try again shortly."));
    expect(result.current.searching).toBe(false);
  });

  it("fills the city from the browser's location when asked", async () => {
    stubApi({ reverse: accra });
    const { result } = setup();

    await act(() => result.current.onUseMyLocation());

    expect(result.current.choices[0]).toMatchObject({ name: "Accra", detail: "Greater Accra Region, Ghana" });
    expect(result.current.selectedKey).toBe(result.current.choices[0].key);
    expect(result.current.canSave).toBe(true);
    expect(result.current.locating).toBe(false);
  });

  it("explains a blocked location, an unknown place and a failed lookup", async () => {
    stubApi({ reverse: 404 });
    const { result } = setup();

    currentPosition.mockRejectedValueOnce({ denied: true });
    await act(() => result.current.onUseMyLocation());
    expect(result.current.notice).toBe("Location is blocked for this site. Search for your city instead.");

    await act(() => result.current.onUseMyLocation());
    expect(result.current.notice).toBe("We couldn't work out your city. Search for it instead.");

    stubApi({ reverse: 503 });
    await act(() => result.current.onUseMyLocation());
    expect(result.current.notice).toBe("We couldn't work out your city. Search for it instead.");
    expect(result.current.canSave).toBe(false);

    act(() => result.current.onSearchChange("a"));
    expect(result.current.notice).toBeNull();
  });

  it("reports a failed save and keeps the dialog open", async () => {
    stubApi({ saveStatus: 500 });
    const { result } = setup();
    act(() => result.current.onSelect(result.current.choices[1]));

    act(() => result.current.onSave());

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("forgets the search and selection when closed", () => {
    stubApi();
    const { result } = setup();
    act(() => result.current.onSelect(result.current.choices[0]));

    act(() => result.current.onClose());

    expect(result.current.selectedKey).toBeNull();
    expect(onClose).toHaveBeenCalled();
  });

  it.each([
    ["a city", () => Promise.resolve({ latitude: 5.6, longitude: -0.19 })],
    ["an error", () => Promise.reject({ denied: true })],
  ])("ignores %s from a location lookup that finishes after closing", async (_, outcome) => {
    stubApi({ reverse: accra });
    let finish!: () => void;
    currentPosition.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)).then(outcome));
    const { result } = setup();

    act(() => void result.current.onUseMyLocation());
    expect(result.current.locating).toBe(true);
    act(() => result.current.onClose());
    await act(async () => finish());

    expect(result.current.selectedKey).toBeNull();
    expect(result.current.choices.map((c) => c.name)).not.toContain("Accra");
    expect(result.current.notice).toBeNull();
    expect(result.current.locating).toBe(false);
    expect(result.current.canSave).toBe(false);
  });
});

describe("useProfileCityViewModel: filling an empty city", () => {
  it("saves the detected city when the browser already shares location", async () => {
    locationPermission.mockResolvedValue("granted");
    const calls = stubApi({ reverse: accra });

    setup({ city: null, open: false });

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith("We set your city to Accra from your location. Use Edit to change it."),
    );
    expect(calls.saved).toEqual([{ city: "Accra" }]);
  });

  it("still detects the city under React Strict Mode", async () => {
    locationPermission.mockResolvedValue("granted");
    const calls = stubApi({ reverse: accra });

    setup({ city: null, open: false }, { reactStrictMode: true });

    await waitFor(() => expect(calls.saved).toEqual([{ city: "Accra" }]));
  });

  it.each(["prompt", "denied", "unknown"])("never asks for location when permission is %s", async (state) => {
    locationPermission.mockResolvedValue(state);
    const calls = stubApi({ reverse: accra });

    setup({ city: null, open: false });

    await waitFor(() => expect(locationPermission).toHaveBeenCalled());
    expect(currentPosition).not.toHaveBeenCalled();
    expect(calls.saved).toEqual([]);
  });

  it("leaves a saved city alone, and waits for the profile to load", async () => {
    locationPermission.mockResolvedValue("granted");
    const calls = stubApi({ reverse: accra });

    setup({ city: "Lagos", open: false });
    setup({ city: null, ready: false, open: false });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(locationPermission).not.toHaveBeenCalled();
    expect(calls.reverses).toBe(0);
  });

  it("stays quiet when no city can be worked out", async () => {
    locationPermission.mockResolvedValue("granted");
    const calls = stubApi({ reverse: 404 });
    setup({ city: null, open: false });
    await waitFor(() => expect(calls.reverses).toBe(1));

    currentPosition.mockRejectedValueOnce({ denied: false });
    setup({ city: null, open: false });
    await waitFor(() => expect(currentPosition).toHaveBeenCalledTimes(2));

    expect(calls.saved).toEqual([]);
    expect(onSaved).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
