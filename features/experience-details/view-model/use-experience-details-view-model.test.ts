import { waitFor } from "@testing-library/react";
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
