import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { clearAuth, setAuth } from "@/lib/auth/session-store";
import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  WEATHER_LINE,
  beforeYouBookItems,
  descriptionParagraphs,
  experienceLocation,
  fitAndLogistics,
  listSections,
  meetingLandmark,
  itinerarySteps,
  mapEmbedUrl,
  meetingPointLocation,
  useMyBookingForExperience,
} from "./experience-details";

const base = { id: "exp-1", city: "Lagos", country: "Nigeria" };

afterEach(() => clearAuth());

describe("itinerarySteps", () => {
  it("uses the itinerary, skipping steps without a title", () => {
    const steps = itinerarySteps({
      ...base,
      itinerary: [{ title: "Board the canoe", description: "Life jackets on" }, { title: "  " }],
      what_you_will_do: ["Ignored"],
    });
    expect(steps).toEqual([{ title: "Board the canoe", description: "Life jackets on" }]);
  });

  it("falls back to what you'll do as title-only steps", () => {
    expect(itinerarySteps({ ...base, itinerary: null, what_you_will_do: ["Canoe ride", ""] })).toEqual([
      { title: "Canoe ride", description: null },
    ]);
  });

  it("is empty when the experience has neither", () => {
    expect(itinerarySteps(base)).toEqual([]);
  });
});

describe("beforeYouBookItems", () => {
  it("lists only what the experience says, and leaves the cancellation policy to the booking card", () => {
    const items = beforeYouBookItems({
      ...base,
      group_size_max: 6,
      duration_minutes: 90,
      requirements: { fitness_level: "Moderate", age: "12+" },
      whats_included: ["Life jacket", "Water"],
      what_to_bring: " Sunscreen ",
      cancellation_policy: "Free cancellation up to 24 hours before",
    });
    expect(items.map((item) => [item.label, item.description])).toEqual([
      ["Group size", "Up to 6 guests per booking"],
      ["Total time spent", "This experience runs about 1h 30m"],
      ["Guest requirements", "Fitness: Moderate · Age: 12+"],
      ["What's included", "Life jacket, Water"],
    ]);
  });

  it("leaves the old requirements to Fit and logistics once the listing has it", () => {
    const items = beforeYouBookItems({ ...base, requirements: { fitness_level: "Moderate" }, accessibility: "not_confirmed" });
    expect(items.find((item) => item.kind === "requirements")).toBeUndefined();
  });

  it("states the minimum and maximum guests together", () => {
    const groupSize = (group_size_min?: number | null, group_size_max?: number | null) =>
      beforeYouBookItems({ ...base, group_size_min, group_size_max }).find((item) => item.kind === "guests")?.description;
    expect(groupSize(3, 8)).toBe("3–8 guests per booking");
    expect(groupSize(3, null)).toBe("At least 3 guests per booking");
    expect(groupSize(4, 4)).toBe("Exactly 4 guests per booking");
    expect(groupSize(1, null)).toBeUndefined();
  });

  it("lists what isn't included and the guide's safety notes", () => {
    const items = beforeYouBookItems({
      ...base,
      whats_not_included: ["Transport", " "],
      safety_info: { riskLevel: "LOW", notes: ["Life jackets provided"], emergencyGuidance: "Guide carries a first-aid kit" },
    });
    expect(items.map((item) => [item.label, item.description])).toEqual([
      ["Not included", "Transport"],
      ["Safety", "Life jackets provided · Guide carries a first-aid kit"],
    ]);
  });

  it("skips the placeholder safety info itin sends when the guide set none", () => {
    const items = beforeYouBookItems({
      ...base,
      safety_info: {
        riskLevel: "UNKNOWN",
        notes: ["Safety info not available"],
        emergencyGuidance: "Follow general travel safety disclaimer.",
      },
    });
    expect(items).toEqual([]);
  });

  it("has no generic payment, pickup or packing copy", () => {
    expect(beforeYouBookItems(base)).toEqual([]);
  });
});

describe("experienceLocation", () => {
  it("shows the booked traveller's exact pin, instructions and directions", () => {
    const location = experienceLocation(
      { ...base, latitude: 6.5, longitude: 3.39 },
      { latitude: 6.495852, longitude: 3.392337, instructions: "Blue gate at the jetty" },
    );
    expect(location).toMatchObject({
      mode: "exact",
      label: "Lagos, Nigeria",
      instructions: "Blue gate at the jetty",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=6.495852,3.392337",
    });
    expect(location?.mode === "exact" && location.embedUrl).toContain("marker=6.495852%2C3.392337");
  });

  it("keeps instructions alone when the meeting point has no coordinates", () => {
    expect(experienceLocation(base, { instructions: "Call on arrival" })).toEqual({
      mode: "exact-text",
      label: "Lagos, Nigeria",
      instructions: "Call on arrival",
    });
  });

  it("shows only the area, without a pin, before booking", () => {
    const location = experienceLocation({ ...base, latitude: 6.5, longitude: 3.39 });
    expect(location?.mode).toBe("approximate");
    expect(location?.mode === "approximate" && location.embedUrl).not.toContain("marker");
  });

  it("falls back to the city label, or nothing", () => {
    expect(experienceLocation(base)).toEqual({ mode: "label", label: "Lagos, Nigeria" });
    expect(experienceLocation({ id: "exp-1" })).toBeNull();
  });
});

describe("mapEmbedUrl", () => {
  it("frames a wider box for the area than for the exact pin", () => {
    const area = new URL(mapEmbedUrl(6.5, 3.39, { pin: false })).searchParams.get("bbox")!.split(",").map(Number);
    const pin = new URL(mapEmbedUrl(6.5, 3.39, { pin: true })).searchParams.get("bbox")!.split(",").map(Number);
    expect(area[2] - area[0]).toBeGreaterThan(pin[2] - pin[0]);
  });
});

describe("meetingPointLocation", () => {
  it("only returns an exact location", () => {
    expect(meetingPointLocation(null)).toBeNull();
    expect(meetingPointLocation({ city: "Lagos" })).toBeNull();
    expect(meetingPointLocation({ latitude: 6.49, longitude: 3.39, city: "Lagos" })?.mode).toBe("exact");
  });
});

describe("useMyBookingForExperience", () => {
  it("finds the signed-in traveller's confirmed booking for this experience", async () => {
    setAuth({ access_token: "a", refresh_token: "r" }, { id: "u-1", email: null, fullName: null, avatarUrl: null });
    let status: string | null = null;
    server.use(
      http.get(apiUrl("/bookings/"), ({ request }) => {
        status = new URL(request.url).searchParams.get("status");
        return HttpResponse.json([
          { id: "b-1", experience_id: "other", status: "confirmed" },
          { id: "b-2", experience_id: "exp-1", status: "confirmed", meeting_point: { instructions: "Jetty" } },
        ]);
      }),
    );
    const { result } = renderHookWithProviders(() => useMyBookingForExperience("exp-1"));
    await waitFor(() => expect(result.current.data?.id).toBe("b-2"));
    expect(status).toBe("confirmed");
  });

  it("doesn't ask for bookings as a guest", () => {
    const { result } = renderHookWithProviders(() => useMyBookingForExperience("exp-1"));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("fitAndLogistics", () => {
  it("shows what the host set, in plain words, with their notes", () => {
    const items = fitAndLogistics({
      ...base,
      fitness_level: "moderate",
      fitness_note: "Two hours of easy paddling",
      age_policy: "minimum_age",
      min_age: 12,
      accessibility: "not_confirmed",
      languages: ["en", "yo", "pcm"],
      weather_dependent: true,
      pickup_available: true,
      pickup_note: "Free pickup on Victoria Island",
    });
    expect(items.map((item) => [item.label, item.value, item.note])).toEqual([
      ["Fitness", "Moderate", "Two hours of easy paddling"],
      ["Age", "Ages 12+", null],
      ["Accessibility", "Not confirmed. Ask the host before you book.", null],
      ["Languages", "English, Yoruba, Nigerian Pidgin", null],
      ["Weather dependent", WEATHER_LINE, null],
      ["Pickup available", "Free pickup on Victoria Island", null],
    ]);
  });

  it("words each age policy", () => {
    const age = (age_policy: string, min_age?: number) =>
      fitAndLogistics({ ...base, age_policy, min_age }).find((item) => item.kind === "age")?.value;
    expect(age("all_ages")).toBe("All ages");
    expect(age("adults_only")).toBe("Adults only");
    expect(age("adult_required_under", 16)).toBe("Under 16s come with an adult");
    expect(age("minimum_age")).toBeUndefined();
  });

  it("shows an older listing's note on its own until a level is chosen", () => {
    const items = fitAndLogistics({ ...base, fitness_note: "Long walks on sand", age_note: "12 and over" });
    expect(items.map((item) => [item.label, item.value, item.note])).toEqual([
      ["Fitness", "Long walks on sand", null],
      ["Age", "12 and over", null],
    ]);
  });

  it("leaves out fitness that doesn't apply, and anything unset", () => {
    expect(fitAndLogistics({ ...base, fitness_level: "not_applicable", weather_dependent: false })).toEqual([]);
  });
});

describe("listSections", () => {
  it("lists the four sections in order, skipping empty ones and blank items", () => {
    const sections = listSections({
      ...base,
      highlights: ["Sunrise paddle", " "],
      what_to_bring_items: ["Sunscreen"],
      know_before_you_go: ["The start is at 6:00am"],
    });
    expect(sections.map((s) => [s.title, s.items])).toEqual([
      ["Highlights", ["Sunrise paddle"]],
      ["What to bring", ["Sunscreen"]],
      ["Know before you go", ["The start is at 6:00am"]],
    ]);
  });

  it("splits an older what-to-bring text into one item per line", () => {
    const [bring] = listSections({ ...base, what_to_bring: "A light layer\n\nSunscreen" });
    expect(bring).toEqual({ kind: "bring", title: "What to bring", items: ["A light layer", "Sunscreen"] });
  });
});

describe("descriptionParagraphs", () => {
  it("splits on blank lines and drops empty ones", () => {
    expect(descriptionParagraphs("First.\n\n  \nSecond,\nstill second.")).toEqual(["First.", "Second,\nstill second."]);
    expect(descriptionParagraphs(null)).toEqual([]);
  });
});

describe("meetingLandmark", () => {
  it("is the landmark and its photo, or null without a landmark", () => {
    expect(meetingLandmark({ ...base, meeting_landmark: " The blue gate ", meeting_photo_url: "https://img/gate.jpg" })).toEqual({
      text: "The blue gate",
      photoUrl: "https://img/gate.jpg",
    });
    expect(meetingLandmark({ ...base, meeting_photo_url: "https://img/gate.jpg" })).toBeNull();
  });
});
