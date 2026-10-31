import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { fetchEvent, useEventDetail } from "./event-details";
import { SAMPLE_EVENT, SAMPLE_EVENT_ID } from "./sample-event";

describe("fetchEvent", () => {
  it("serves the sample event without a request", async () => {
    await expect(fetchEvent(SAMPLE_EVENT_ID)).resolves.toBe(SAMPLE_EVENT);
  });

  it("serves the sample's similar events as the sample page, under their own id", async () => {
    await expect(fetchEvent("sample-3")).resolves.toMatchObject({ id: "sample-3", title: SAMPLE_EVENT.title });
  });

  it("asks the events API for any other event", async () => {
    server.use(http.get(apiUrl("/events/ev-1"), () => HttpResponse.json({ ...SAMPLE_EVENT, id: "ev-1", title: "Lagos Salon" })));
    await expect(fetchEvent("ev-1")).resolves.toMatchObject({ id: "ev-1", title: "Lagos Salon" });
  });
});

describe("useEventDetail", () => {
  it("loads an event", async () => {
    const { result } = renderHookWithProviders(() => useEventDetail(SAMPLE_EVENT_ID));
    await waitFor(() => expect(result.current.data?.title).toBe("Afro Futures Summit"));
  });

  it("surfaces an API error", async () => {
    server.use(http.get(apiUrl("/events/missing"), () => HttpResponse.json({}, { status: 404 })));
    const { result } = renderHookWithProviders(() => useEventDetail("missing"));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does nothing without an id", () => {
    const { result } = renderHookWithProviders(() => useEventDetail(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});
