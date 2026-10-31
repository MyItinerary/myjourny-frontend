import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ExperienceDetail } from "@/features/experience-details";

import { useExperiencePageViewModel } from "./use-experience-page-view-model";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const push = vi.fn();
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

const session = { user: null as { id: string } | null, hydrated: true };
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session }));

const wishlist = { ids: new Set<string>() };
vi.mock("@/lib/queries/wishlists", () => ({ useMyWishlistedIds: () => ({ data: wishlist.ids }) }));

const saveCheckoutDraft = vi.fn();
vi.mock("@/features/checkout", () => ({ saveCheckoutDraft: (...args: unknown[]) => saveCheckoutDraft(...args) }));

const queries = {
  detail: { data: undefined as ExperienceDetail | undefined, isLoading: false, isError: false },
};
vi.mock("@/features/experience-details", () => ({
  useExperienceDetail: () => queries.detail,
  useExperienceDetailsViewModel: () => ({ marker: "details" }),
}));
vi.mock("@/features/reviews", () => ({ useExperienceReviewsViewModel: () => ({ marker: "reviews" }) }));
vi.mock("@/lib/queries/experiences", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/queries/experiences")>()),
  useExperiencePrices: () => ({ data: [{ id: "p1", experience_id: "exp-1", label: "Adult", amount: 16000 }] }),
  useRecommendedExperiences: () => ({ data: [] }),
  useFilteredExperiences: () => ({
    data: {
      items: [
        { id: "exp-1", title: "This one" },
        { id: "exp-2", title: "Another" },
      ],
    },
  }),
}));

const bookingProps = vi.fn();
const panel = {
  booking: { available: true },
  card: {
    headline: { showFrom: false, amount: "₦16,000", unit: "per person" },
    button: { label: "Book now", disabled: false, loading: false, onClick: vi.fn() },
  },
  sessions: { noSessions: false, allSoldOut: false, options: [], selectedDate: null },
};
vi.mock("@/features/booking", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/booking")>()),
  useBookingPanelViewModel: (props: unknown) => {
    bookingProps(props);
    return panel;
  },
}));

const experience: ExperienceDetail = {
  id: "exp-1",
  guide_id: "g1",
  status: "ACTIVE",
  title: "Sunrise Kayaking",
  city: "Lagos",
  duration_minutes: 60,
  currency: "NGN",
  cancellation_policy: "Full refund up to 24 hours before.",
  refund_policy: "full_refund_until",
  free_cancellation_hours: 24,
  group_size_max: 8,
};

beforeEach(() => {
  vi.clearAllMocks();
  session.user = null;
  session.hydrated = true;
  wishlist.ids = new Set();
  panel.card.button.disabled = false;
  queries.detail = { data: experience, isLoading: false, isError: false };
});

describe("useExperiencePageViewModel", () => {
  it("is ready with the experience's content, details, reviews and booking panel", () => {
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(result.current.status).toBe("ready");
    expect(result.current.content).toMatchObject({ title: "Sunrise Kayaking", durationLabel: "1 hour" });
    expect(result.current.details).toEqual({ marker: "details" });
    expect(result.current.reviews).toEqual({ marker: "reviews" });
    expect(result.current.bar).toEqual({
      summary: "₦16,000 per person",
      detail: null,
      urgency: null,
      actionLabel: "Book now",
    });
    expect(result.current.externalBooking).toBeNull();
  });

  it("feeds the booking panel the experience's limits and cancellation terms", () => {
    renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(bookingProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        experienceId: "exp-1",
        guideId: "g1",
        availableSpots: 8,
        cancellationPolicy: "Full refund up to 24 hours before.",
        refundPolicy: "full_refund_until",
        freeCancellationHours: 24,
      }),
    );
  });

  it("hands a listing that books on the host's site a link instead of the card", () => {
    queries.detail = {
      data: { ...experience, has_external_booking: true, booking_url: "https://host.test/book" },
      isLoading: false,
      isError: false,
    };
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(result.current.externalBooking).toEqual({
      url: "https://host.test/book",
      signedIn: false,
      loginHref: expect.stringContaining("/login"),
    });
  });

  it("waits for the session before showing either card", () => {
    session.hydrated = false;
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(result.current.awaitingSession).toBe(true);
  });

  it("reports loading and error", () => {
    queries.detail = { data: undefined, isLoading: true, isError: false };
    const { result, rerender } = renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(result.current.status).toBe("loading");
    queries.detail = { data: undefined, isLoading: false, isError: true };
    rerender();
    expect(result.current.status).toBe("error");
    expect(result.current.content).toBeNull();
  });

  it("shows other experiences as similar, never this one", () => {
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(result.current.similar.map((item) => item.id)).toEqual(["exp-2"]);
  });

  it("knows when the experience is wishlisted and opens the save modal", () => {
    wishlist.ids = new Set(["exp-1"]);
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(result.current.saved).toBe(true);
    act(() => result.current.onToggleSave());
    expect(result.current.saveModalOpen).toBe(true);
    act(() => result.current.onCloseSaveModal());
    expect(result.current.saveModalOpen).toBe(false);
  });

  it("opens and closes the mobile booking sheet", () => {
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    act(() => result.current.onOpenMobileBooking());
    expect(result.current.mobileBookingOpen).toBe(true);
    act(() => result.current.onCloseMobileBooking());
    expect(result.current.mobileBookingOpen).toBe(false);
  });

  it("starts the booking from the bar's button when it can be booked, else pulls the sheet up", () => {
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    act(() => result.current.onBookFromBar());
    expect(panel.card.button.onClick).toHaveBeenCalledTimes(1);
    expect(result.current.mobileBookingOpen).toBe(false);

    panel.card.button.disabled = true;
    const blocked = renderHook(() => useExperiencePageViewModel("exp-1"));
    act(() => blocked.result.current.onBookFromBar());
    expect(panel.card.button.onClick).toHaveBeenCalledTimes(1);
    expect(blocked.result.current.mobileBookingOpen).toBe(true);
  });

  it("saves a guest's pick as a checkout draft and goes to checkout", () => {
    renderHook(() => useExperiencePageViewModel("exp-1"));
    const { onGuestBook } = bookingProps.mock.lastCall![0] as { onGuestBook: (d: unknown) => void };
    onGuestBook({
      selection: { experience_id: "exp-1", items: [], addons: [] },
      guideId: "g1",
      when: "Saturday",
      guests: 2,
      ticketsLabel: "2 Adult",
      total: "₦32,000",
      currency: "NGN",
      durationLabel: "1 hour",
      hasTimeSlots: true,
      cancellationNote: "Full refund until Friday",
    });
    expect(saveCheckoutDraft).toHaveBeenCalledWith(
      expect.objectContaining({ experienceId: "exp-1", title: "Sunrise Kayaking", hasTimeSlots: true, cancellationNote: "Full refund until Friday" }),
    );
    expect(push).toHaveBeenCalledWith("/checkout");
  });

  it("books straight through for a signed-in user", () => {
    session.user = { id: "u1" };
    renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(bookingProps).toHaveBeenLastCalledWith(expect.objectContaining({ onGuestBook: undefined }));
  });

  it("remembers the referral code on the link the visitor arrived through", () => {
    window.history.pushState({}, "", "?ref=DANIEL10");
    renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(captureReferral).toHaveBeenCalledWith("?ref=DANIEL10");
    window.history.pushState({}, "", "/");
  });

  it("opens the share dialog for this page", () => {
    const { result } = renderHook(() => useExperiencePageViewModel("exp-1"));
    expect(shareOptions).toHaveBeenLastCalledWith(expect.objectContaining({ path: "/experiences/exp-1" }));
    act(() => result.current.onShare());
    expect(shareOpen).toHaveBeenCalled();
  });
});
