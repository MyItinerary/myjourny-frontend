import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useCategoryNames, useDeleteGuideExperience, useGuideExperience, useGuideExperiences } from "./guide-listings-api";

describe("guide listings api", () => {
  it("lists the guide's experiences", async () => {
    server.use(http.get(apiUrl("/guide/experiences"), () => HttpResponse.json([{ id: "e1", status: "ACTIVE", title: "Kayak" }])));
    const { result } = renderHookWithProviders(() => useGuideExperiences(true));
    await waitFor(() => expect(result.current.data).toEqual([{ id: "e1", status: "ACTIVE", title: "Kayak" }]));
  });

  it("waits while it isn't enabled", () => {
    const { result } = renderHookWithProviders(() => useGuideExperiences(false));
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("loads one listing from the guide endpoint", async () => {
    server.use(http.get(apiUrl("/guide/experiences/e1"), () => HttpResponse.json({ id: "e1", status: "INACTIVE", title: "Kayak" })));
    const { result } = renderHookWithProviders(() => useGuideExperience("e1", true));
    await waitFor(() => expect(result.current.data?.status).toBe("INACTIVE"));
  });

  it("deletes a listing and reloads the list", async () => {
    let lists = 0;
    let deleted = "";
    server.use(
      http.get(apiUrl("/guide/experiences"), () => {
        lists += 1;
        return HttpResponse.json([]);
      }),
      http.delete(apiUrl("/experiences/:id"), ({ params }) => {
        deleted = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHookWithProviders(() => ({ list: useGuideExperiences(true), remove: useDeleteGuideExperience() }));
    await waitFor(() => expect(lists).toBe(1));

    await act(() => result.current.remove.mutateAsync("e1"));

    expect(deleted).toBe("e1");
    await waitFor(() => expect(lists).toBe(2));
  });

  it("names categories and subcategories by slug", async () => {
    server.use(
      http.get(apiUrl("/categories"), () =>
        HttpResponse.json([
          { id: 1, parent_id: null, slug: "street-life", text: "Street life", category_type: "interest", is_active: true,
            children: [{ id: 2, parent_id: 1, slug: "neighborhood-walks", text: "Neighborhood walks", category_type: "interest", is_active: true }] },
        ]),
      ),
    );
    const { result } = renderHookWithProviders(() => useCategoryNames());
    await waitFor(() => expect(result.current).toEqual({ "street-life": "Street life", "neighborhood-walks": "Neighborhood walks" }));
  });
});
