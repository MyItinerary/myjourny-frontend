import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { clearAuth, setAuth } from "@/lib/auth/session-store";
import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import type { ExperienceDetailsFields } from "../model/experience-details.types";
import { useExperienceDetailsViewModel } from "./use-experience-details-view-model";

const makoko: ExperienceDetailsFields = {
  id: "exp-1",
  city: "Lagos",
  country: "Nigeria",
  latitude: 6.5,
  longitude: 3.39,
  itinerary: [{ title: "Board the canoe" }],
  rating: 4.82,
};

afterEach(() => clearAuth());

describe("useExperienceDetailsViewModel", () => {
  it("is empty while the experience loads", () => {
    const { result } = renderHookWithProviders(() => useExperienceDetailsViewModel("exp-1", undefined));
    expect(result.current).toMatchObject({ itinerary: [], beforeYouBook: [], rating: null, location: null });
  });

  it("shows a guest the area, the itinerary and the real rating", () => {
    const { result } = renderHookWithProviders(() => useExperienceDetailsViewModel("exp-1", makoko));
    expect(result.current.itinerary).toEqual([{ title: "Board the canoe" }]);
    expect(result.current.rating).toBe("4.8");
    expect(result.current.location?.mode).toBe("approximate");
    expect(result.current.isBooked).toBe(false);
  });

  it("gives the fit details, lists, landmark and description", () => {
    const { result } = renderHookWithProviders(() =>
      useExperienceDetailsViewModel("exp-1", {
        ...makoko,
        fitness_level: "easy",
        highlights: ["Sunrise paddle"],
        meeting_landmark: "The blue gate",
        description: "One.\n\nTwo.",
      }),
    );
    expect(result.current.fit.map((item) => item.value)).toEqual(["Easy"]);
    expect(result.current.lists.map((section) => section.title)).toEqual(["Highlights"]);
    expect(result.current.landmark).toEqual({ text: "The blue gate", photoUrl: null });
    expect(result.current.description.paragraphs).toEqual(["One.", "Two."]);
    expect(result.current.description.long).toBe(false);
  });

  it("cuts a long description short until Show more", () => {
    const { result } = renderHookWithProviders(() =>
      useExperienceDetailsViewModel("exp-1", { ...makoko, description: "word ".repeat(120) }),
    );
    expect(result.current.description).toMatchObject({ long: true, expanded: false });
    expect(result.current.description.paragraphs[0].endsWith("…")).toBe(true);
    act(() => result.current.description.onToggle());
    expect(result.current.description.expanded).toBe(true);
    expect(result.current.description.paragraphs[0].endsWith("…")).toBe(false);
  });

  it("says there's no rating rather than making one up", () => {
    const { result } = renderHookWithProviders(() =>
      useExperienceDetailsViewModel("exp-1", { ...makoko, rating: null }),
    );
    expect(result.current.rating).toBeNull();
  });

  it("switches to the exact meeting point once the traveller has booked", async () => {
    setAuth({ access_token: "a", refresh_token: "r" }, { id: "u-1", email: null, fullName: null, avatarUrl: null });
    server.use(
      http.get(apiUrl("/bookings/"), () =>
        HttpResponse.json([
          {
            id: "b-1",
            experience_id: "exp-1",
            status: "confirmed",
            meeting_point: { latitude: 6.495852, longitude: 3.392337, instructions: "Blue gate" },
          },
        ]),
      ),
    );
    const { result } = renderHookWithProviders(() => useExperienceDetailsViewModel("exp-1", makoko));
    await waitFor(() => expect(result.current.location?.mode).toBe("exact"));
    expect(result.current.isBooked).toBe(true);
  });
});
