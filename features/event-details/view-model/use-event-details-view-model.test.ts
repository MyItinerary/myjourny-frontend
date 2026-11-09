import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_EVENT } from "../model/sample-event";
import type { EventDetail } from "../model/event-details.types";
import { useEventDetailsViewModel } from "./use-event-details-view-model";

const toast = { info: vi.fn(), success: vi.fn() };
const shareOpen = vi.fn();
const shareOptions = vi.fn();
const captureReferral = vi.fn();
vi.mock("@/features/share", () => ({
  captureReferral: (search: string) => captureReferral(search),
  useShareDialogViewModel: (options: unknown) => {
    shareOptions(options);
    return { onOpen: shareOpen };
  },
}));
vi.mock("sonner", () => ({ toast: { info: (m: string) => toast.info(m), success: (m: string) => toast.success(m) } }));

const query = { data: undefined as EventDetail | undefined, isLoading: false, isError: false };
vi.mock("../model/event-details", () => ({ useEventDetail: () => query }));

const bookingOptions = vi.fn();
const bookingAction = { label: "Get tickets", disabled: true, pending: false, onClick: vi.fn() };
vi.mock("@/features/booking", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/booking")>()),
  useEventBookingCardViewModel: (options: unknown) => {
    bookingOptions(options);
    return { marker: "card", action: bookingAction };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  query.data = SAMPLE_EVENT;
  query.isLoading = false;
  query.isError = false;
});

describe("useEventDetailsViewModel", () => {
  it("is ready with the event, its ticket card and the cheapest open price", () => {
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    expect(result.current.status).toBe("ready");
    expect(result.current.event?.title).toBe("Afro Futures Summit");
    expect(result.current.booking).toMatchObject({ marker: "card" });
    expect(result.current.bar).toEqual({
      summary: "From ₦10,000 per ticket",
      detail: "Sat 14 Nov · Doors 8:30am",
      urgency: "4 left in Regular",
      actionLabel: "Get tickets",
      actionDisabled: false,
    });
    expect(bookingOptions).toHaveBeenLastCalledWith(expect.objectContaining({ data: SAMPLE_EVENT.booking }));
  });

  it("reports loading and error", () => {
    query.data = undefined;
    query.isLoading = true;
    const { result, rerender } = renderHook(() => useEventDetailsViewModel("sample"));
    expect(result.current.status).toBe("loading");
    query.isLoading = false;
    query.isError = true;
    rerender();
    expect(result.current.status).toBe("error");
    expect(result.current.event).toBeNull();
  });

  it("opens the first question, then follows the visitor", () => {
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    const [first, second] = SAMPLE_EVENT.questions;
    expect(result.current.openQuestionId).toBe(first.id);
    act(() => result.current.onToggleQuestion(second.id));
    expect(result.current.openQuestionId).toBe(second.id);
    act(() => result.current.onToggleQuestion(second.id));
    expect(result.current.openQuestionId).toBeNull();
  });

  it("toggles the wishlist heart and the mobile booking sheet", () => {
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    act(() => result.current.onToggleSave());
    expect(result.current.saved).toBe(true);
    act(() => result.current.onToggleSave());
    expect(result.current.saved).toBe(false);
    act(() => result.current.onOpenMobileBooking());
    expect(result.current.mobileBookingOpen).toBe(true);
    act(() => result.current.onCloseMobileBooking());
    expect(result.current.mobileBookingOpen).toBe(false);
  });

  it("says ticket sales open soon until the events API can sell", () => {
    renderHook(() => useEventDetailsViewModel("sample"));
    const { onBook } = bookingOptions.mock.lastCall![0] as { onBook: () => void };
    onBook();
    expect(toast.info).toHaveBeenCalledWith("Ticket sales for this event open soon.");
  });

  it("gets the tickets from the bar's button when some are picked, else pulls the sheet up", () => {
    bookingAction.disabled = false;
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    act(() => result.current.onBookFromBar());
    expect(bookingAction.onClick).toHaveBeenCalledTimes(1);
    expect(result.current.mobileBookingOpen).toBe(false);

    bookingAction.disabled = true;
    const none = renderHook(() => useEventDetailsViewModel("sample"));
    act(() => none.result.current.onBookFromBar());
    expect(bookingAction.onClick).toHaveBeenCalledTimes(1);
    expect(none.result.current.mobileBookingOpen).toBe(true);
  });

  it("links similar events to their own pages, without a save button", () => {
    query.data = {
      ...SAMPLE_EVENT,
      similar: [
        { id: "ev-2", title: "Salon: Water", category: "TALKS", imageUrl: null, duration: "3 hours", rating: 4, priceFrom: 5000, currency: "NGN" },
      ],
    };
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    expect(result.current.similar).toEqual([
      expect.objectContaining({ id: "ev-2", href: "/events/ev-2", saveable: false, title: "Salon: Water" }),
    ]);
  });

  it("remembers the referral code on the link the visitor arrived through", () => {
    window.history.pushState({}, "", "?ref=DANIEL10");
    renderHook(() => useEventDetailsViewModel("sample"));
    expect(captureReferral).toHaveBeenCalledWith("?ref=DANIEL10");
    window.history.pushState({}, "", "/");
  });

  it("opens the share dialog for this page", () => {
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    expect(shareOptions).toHaveBeenLastCalledWith(expect.objectContaining({ path: "/events/sample" }));
    act(() => result.current.onShare());
    expect(shareOpen).toHaveBeenCalled();
  });
});
