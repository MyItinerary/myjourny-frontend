import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useDeleteAccountViewModel } from "./use-delete-account-view-model";

const signOutLocally = vi.fn();
vi.mock("@/lib/queries/profile", () => ({ signOutLocally: (...args: unknown[]) => signOutLocally(...args) }));
const toastError = vi.fn();
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));

const none = { upcoming_bookings: 0, open_refund_requests: 0, hosted_upcoming_bookings: 0, pending_payouts: 0 };

function stubApi({ blockers = none, deleteStatus = 204, deleteBody = null as Record<string, unknown> | null } = {}) {
  let deletes = 0;
  server.use(
    http.get(apiUrl("/auth/me/deletion-preview"), () =>
      HttpResponse.json({
        upcoming_booking_count: blockers.upcoming_bookings,
        review_count: 0,
        can_delete: !Object.values(blockers).some(Boolean),
        blockers,
      }),
    ),
    http.delete(apiUrl("/auth/me"), () => {
      deletes += 1;
      return deleteStatus === 204
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json(deleteBody, { status: deleteStatus });
    }),
  );
  return { deletes: () => deletes };
}

const onClose = vi.fn();
const onDeactivateInstead = vi.fn();
const render = (open = true) =>
  renderHookWithProviders(() =>
    useDeleteAccountViewModel({ open, email: "ada@example.com", onClose, onDeactivateInstead }),
  );

afterEach(() => vi.clearAllMocks());

describe("useDeleteAccountViewModel", () => {
  it("blocks the next step while a booking or refund is unresolved", async () => {
    stubApi({ blockers: { ...none, upcoming_bookings: 1, open_refund_requests: 1 } });
    const { result } = render();
    expect(result.current.checking).toBe(true);

    await waitFor(() => expect(result.current.blockers).toHaveLength(2));
    expect(result.current.blockers.map((b) => b.key)).toEqual(["upcoming", "refunds"]);
    expect(result.current.canContinue).toBe(false);
  });

  it("deletes after DELETE is typed, then signs out", async () => {
    const api = stubApi();
    const { result } = render();
    await waitFor(() => expect(result.current.canContinue).toBe(true));

    act(() => result.current.onContinue());
    expect(result.current.step).toBe(2);
    // Nothing happens until the word is typed.
    act(() => result.current.onConfirm());
    expect(result.current.canConfirm).toBe(false);
    act(() => result.current.onDraftChange(" delete "));
    expect(result.current.canConfirm).toBe(true);
    act(() => result.current.onConfirm());

    await waitFor(() => expect(signOutLocally).toHaveBeenCalled());
    expect(api.deletes()).toBe(1);
  });

  it("goes back to the blockers when the server refuses", async () => {
    stubApi({
      deleteStatus: 409,
      deleteBody: { detail: "Before deleting…", blockers: { ...none, upcoming_bookings: 2 } },
    });
    const { result } = render();
    await waitFor(() => expect(result.current.canContinue).toBe(true));
    act(() => result.current.onContinue());
    act(() => result.current.onDraftChange("DELETE"));
    act(() => result.current.onConfirm());

    await waitFor(() => expect(result.current.step).toBe(1));
    expect(result.current.blockers[0].title).toBe("You have 2 upcoming bookings");
    expect(result.current.canContinue).toBe(false);
    expect(result.current.draft).toBe("");
    expect(signOutLocally).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("reports any other failure", async () => {
    stubApi({ deleteStatus: 500, deleteBody: { detail: "Server on fire" } });
    const { result } = render();
    await waitFor(() => expect(result.current.canContinue).toBe(true));
    act(() => result.current.onContinue());
    act(() => result.current.onDraftChange("DELETE"));
    act(() => result.current.onConfirm());

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Server on fire"));
    expect(result.current.step).toBe(2);
  });

  it("resets on close, back and deactivate instead", async () => {
    stubApi();
    const { result } = render();
    await waitFor(() => expect(result.current.canContinue).toBe(true));
    act(() => result.current.onContinue());
    act(() => result.current.onDraftChange("DEL"));
    act(() => result.current.onBack());
    expect(result.current.step).toBe(1);

    act(() => result.current.onContinue());
    act(() => result.current.onClose());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({ step: 1, draft: "" });

    act(() => result.current.onDeactivateInstead());
    expect(onDeactivateInstead).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("doesn't check anything while closed", () => {
    const { result } = render(false);
    expect(result.current).toMatchObject({ open: false, checking: false, email: "ada@example.com" });
  });
});
