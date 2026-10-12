import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  blockersFromError,
  describeBlockers,
  previewBlockers,
  useDeleteAccount,
  useDeletionPreview,
} from "./account-deletion";

const none = { upcoming_bookings: 0, open_refund_requests: 0, hosted_upcoming_bookings: 0, pending_payouts: 0 };

describe("useDeletionPreview", () => {
  it("loads what blocks deletion, only while enabled", async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl("/auth/me/deletion-preview"), () => {
        calls += 1;
        return HttpResponse.json({ upcoming_booking_count: 1, review_count: 0, can_delete: false });
      }),
    );
    const off = renderHookWithProviders(() => useDeletionPreview(false));
    expect(off.result.current.fetchStatus).toBe("idle");

    const on = renderHookWithProviders(() => useDeletionPreview(true));
    await waitFor(() => expect(on.result.current.data?.upcoming_booking_count).toBe(1));
    expect(calls).toBe(1);
  });
});

describe("useDeleteAccount", () => {
  it("deletes the account", async () => {
    let deleted = false;
    server.use(
      http.delete(apiUrl("/auth/me"), () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHookWithProviders(() => useDeleteAccount());
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleted).toBe(true);
  });
});

describe("blockersFromError", () => {
  it("reads the blockers from a 409 and ignores other errors", () => {
    const blockers = { ...none, upcoming_bookings: 2 };
    expect(blockersFromError({ response: { status: 409, data: { detail: "x", blockers } } })).toEqual(blockers);
    expect(blockersFromError({ response: { status: 500, data: {} } })).toBeNull();
    expect(blockersFromError(new Error("offline"))).toBeNull();
  });
});

describe("previewBlockers", () => {
  it("uses the server's blockers, or the booking count from an older server", () => {
    const blockers = { ...none, open_refund_requests: 1 };
    expect(previewBlockers({ upcoming_booking_count: 0, review_count: 0, blockers })).toEqual(blockers);
    expect(previewBlockers({ upcoming_booking_count: 2, review_count: 0 })).toEqual({ ...none, upcoming_bookings: 2 });
    expect(previewBlockers(undefined)).toEqual(none);
  });
});

describe("describeBlockers", () => {
  it("is empty when nothing blocks", () => {
    expect(describeBlockers(none)).toEqual([]);
  });

  it("says what to do about each blocker", () => {
    const notes = describeBlockers({
      upcoming_bookings: 1,
      open_refund_requests: 2,
      hosted_upcoming_bookings: 0,
      pending_payouts: 3,
    });
    expect(notes.map((n) => [n.key, n.title])).toEqual([
      ["upcoming", "You have an upcoming booking"],
      ["refunds", "2 refunds are still being reviewed"],
      ["hosting", "Your experiences still have bookings or payouts to settle"],
    ]);
    expect(notes[0].body).toMatch(/^Cancel it first/);
    expect(notes[2].body).toMatch(/Contact support/);
  });

  it("counts several bookings and a single refund", () => {
    const notes = describeBlockers({ ...none, upcoming_bookings: 3, open_refund_requests: 1 });
    expect(notes[0].title).toBe("You have 3 upcoming bookings");
    expect(notes[0].body).toMatch(/^Cancel them first/);
    expect(notes[1].title).toBe("A refund is still being reviewed");
  });
});
