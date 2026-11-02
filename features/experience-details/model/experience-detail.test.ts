import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { experienceDetailQueryKey, useExperienceDetail } from "./experience-detail";

describe("useExperienceDetail", () => {
  it("fetches the experience with its new fields", async () => {
    server.use(
      http.get(apiUrl("/experiences/exp-1"), () =>
        HttpResponse.json({
          id: "exp-1",
          status: "ACTIVE",
          title: "Lagoon kayak and breakfast",
          accessibility: "not_confirmed",
          highlights: ["Sunrise paddle"],
          has_external_booking: false,
        }),
      ),
    );
    const { result } = renderHookWithProviders(() => useExperienceDetail("exp-1"));

    await waitFor(() => expect(result.current.data?.title).toBe("Lagoon kayak and breakfast"));
    expect(result.current.data?.accessibility).toBe("not_confirmed");
    expect(result.current.data?.highlights).toEqual(["Sunrise paddle"]);
  });

  it("waits for an id", () => {
    const { result } = renderHookWithProviders(() => useExperienceDetail(""));
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("keeps the cache key other screens share", () => {
    expect(experienceDetailQueryKey("exp-1")).toEqual(["experiences", "detail", "exp-1"]);
  });
});
