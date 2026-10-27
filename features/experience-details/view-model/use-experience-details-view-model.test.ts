import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ExperienceDetail } from "@/lib/queries/experiences";

import { useExperienceDetailsViewModel } from "./use-experience-details-view-model";

const push = vi.fn();
const back = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const session = { user: null as { id: string } | null, hydrated: true };
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session }));

const wishlist = { ids: new Set<string>() };
vi.mock("@/lib/queries/wishlists", () => ({ useMyWishlistedIds: () => ({ data: wishlist.ids }) }));

const saveCheckoutDraft = vi.fn();
vi.mock("@/features/checkout", () => ({ saveCheckoutDraft: (...args: unknown[]) => saveCheckoutDraft(...args) }));

const queries = {
  detail: { data: undefined as ExperienceDetail | undefined, isLoading: false, isError: false },
};
vi.mock("@/lib/queries/experiences", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/queries/experiences")>()),
  useExperienceDetail: () => queries.detail,
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
vi.mock("@/features/booking", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/booking")>()),
  useExperienceBookingCardViewModel: (props: unknown) => {
    bookingProps(props);
    return { marker: "card" };
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
  group_size_max: 8,
};

beforeEach(() => {
  vi.clearAllMocks();
  session.user = null;
  wishlist.ids = new Set();
  queries.detail = { data: experience, isLoading: false, isError: false };
});

describe("useExperienceDetailsViewModel", () => {
  it("is ready with the experience's content and booking card", () => {
    const { result } = renderHook(() => useExperienceDetailsViewModel("exp-1"));
    expect(result.current.status).toBe("ready");
    expect(result.current.content).toMatchObject({ title: "Sunrise Kayaking", durationLabel: "1 hour" });
    expect(result.current.booking).toEqual({ marker: "card" });
    expect(result.current.priceFrom).toBe("₦16,000.00");
    expect(result.current.reviews.count).toBeGreaterThan(0);
  });

  it("feeds the booking card the experience's limits and its cancellation policy", () => {
    renderHook(() => useExperienceDetailsViewModel("exp-1"));
    expect(bookingProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        experienceId: "exp-1",
        guideId: "g1",
        availableSpots: 8,
        info: [expect.objectContaining({ icon: "cancellation", body: "Full refund up to 24 hours before." })],
      }),
    );
  });

  it("reports loading and error", () => {
    queries.detail = { data: undefined, isLoading: true, isError: false };
    const { result, rerender } = renderHook(() => useExperienceDetailsViewModel("exp-1"));
    expect(result.current.status).toBe("loading");
    queries.detail = { data: undefined, isLoading: false, isError: true };
    rerender();
    expect(result.current.status).toBe("error");
    expect(result.current.content).toBeNull();
  });

  it("shows other experiences as similar, never this one", () => {
    const { result } = renderHook(() => useExperienceDetailsViewModel("exp-1"));
    expect(result.current.similar.map((item) => item.id)).toEqual(["exp-2"]);
  });

  it("knows when the experience is wishlisted and opens the save modal", () => {
    wishlist.ids = new Set(["exp-1"]);
    const { result } = renderHook(() => useExperienceDetailsViewModel("exp-1"));
    expect(result.current.saved).toBe(true);
    expect(result.current.saveModalOpen).toBe(false);
    act(() => result.current.onToggleSave());
    expect(result.current.saveModalOpen).toBe(true);
    act(() => result.current.onCloseSaveModal());
    expect(result.current.saveModalOpen).toBe(false);
  });

  it("opens and closes the mobile booking sheet", () => {
    const { result } = renderHook(() => useExperienceDetailsViewModel("exp-1"));
    act(() => result.current.onOpenMobileBooking());
    expect(result.current.mobileBookingOpen).toBe(true);
    act(() => result.current.onCloseMobileBooking());
    expect(result.current.mobileBookingOpen).toBe(false);
  });

  it("saves a guest's pick as a checkout draft and goes to checkout", () => {
    renderHook(() => useExperienceDetailsViewModel("exp-1"));
    const { onGuestBook } = bookingProps.mock.lastCall![0] as { onGuestBook: (d: unknown) => void };
    onGuestBook({
      selection: { experience_id: "exp-1", items: [], addons: [] },
      guideId: "g1",
      when: "Saturday",
      guests: 2,
      ticketsLabel: "2 Adult",
      total: "₦32,000.00",
      currency: "NGN",
      durationLabel: "1 hour",
    });
    expect(saveCheckoutDraft).toHaveBeenCalledWith(expect.objectContaining({ experienceId: "exp-1", title: "Sunrise Kayaking" }));
    expect(push).toHaveBeenCalledWith("/checkout");
  });

  it("books straight through for a signed-in user", () => {
    session.user = { id: "u1" };
    renderHook(() => useExperienceDetailsViewModel("exp-1"));
    expect(bookingProps).toHaveBeenLastCalledWith(expect.objectContaining({ onGuestBook: undefined }));
  });

  it("goes back in history, or home without any", () => {
    const { result } = renderHook(() => useExperienceDetailsViewModel("exp-1"));
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    act(() => result.current.onBack());
    expect(back).toHaveBeenCalled();
    vi.spyOn(window.history, "length", "get").mockReturnValue(1);
    act(() => result.current.onBack());
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shares through the share sheet, or copies the link", async () => {
    const { result } = renderHook(() => useExperienceDetailsViewModel("exp-1"));
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    await act(() => result.current.onShare());
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: "Sunrise Kayaking" }));

    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await act(() => result.current.onShare());
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });
});
