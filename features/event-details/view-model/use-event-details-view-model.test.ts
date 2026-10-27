import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_EVENT } from "../model/sample-event";
import type { EventDetail } from "../model/event-details.types";
import { useEventDetailsViewModel } from "./use-event-details-view-model";

const push = vi.fn();
const back = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back }) }));
const toast = { info: vi.fn(), success: vi.fn() };
vi.mock("sonner", () => ({ toast: { info: (m: string) => toast.info(m), success: (m: string) => toast.success(m) } }));

const query = { data: undefined as EventDetail | undefined, isLoading: false, isError: false };
vi.mock("../model/event-details", () => ({ useEventDetail: () => query }));

const bookingOptions = vi.fn();
vi.mock("@/features/booking", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/booking")>()),
  useEventBookingCardViewModel: (options: unknown) => {
    bookingOptions(options);
    return { marker: "card" };
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
    expect(result.current.booking).toEqual({ marker: "card" });
    expect(result.current.priceFrom).toBe("₦10,000");
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

  it("goes back in history, or home without any", () => {
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    act(() => result.current.onBack());
    expect(back).toHaveBeenCalled();
    vi.spyOn(window.history, "length", "get").mockReturnValue(1);
    act(() => result.current.onBack());
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shares through the share sheet, or copies the link", async () => {
    const { result } = renderHook(() => useEventDetailsViewModel("sample"));
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    await act(() => result.current.onShare());
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: "Afro Futures Summit" }));
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await act(() => result.current.onShare());
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });
});
