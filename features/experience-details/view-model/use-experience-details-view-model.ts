import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { saveCheckoutDraft } from "@/features/checkout";
import {
  type BookingCardInfoRow,
  type ExperienceBookingCardProps,
  type GuestBookingDetails,
  formatPrice,
  useExperienceBookingCardViewModel,
} from "@/features/booking";
import { type ExperienceGalleryViewModel, useExperienceGalleryViewModel } from "@/features/experience-gallery";
import { useSession } from "@/lib/auth/session-store";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  formatDuration,
  useExperienceDetail,
  useExperiencePrices,
  useFilteredExperiences,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";
import { useMyWishlistedIds } from "@/lib/queries/wishlists";

import { buildExperienceDetails } from "../model/experience-details";
import type { ExperienceDetailsContent } from "../model/experience-details.types";
import { SAMPLE_REVIEWS } from "../model/sample-reviews";
import { type ExperienceReviewsViewModel, useExperienceReviewsViewModel } from "./use-experience-reviews-view-model";

// "YYYY-MM-DD" (itin's event_start_date) parsed as a local date, not UTC:
// `new Date("YYYY-MM-DD")` would shift the day back in negative-offset zones.
function parseIsoDateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export type ExperienceDetailsViewModel = {
  status: "loading" | "error" | "ready";
  content: ExperienceDetailsContent | null;
  gallery: ExperienceGalleryViewModel;
  reviews: ExperienceReviewsViewModel;
  booking: ExperienceBookingCardProps;
  /** "₦16,000", for the mobile bar. */
  priceFrom: string;
  mobileBookingOpen: boolean;
  onOpenMobileBooking: () => void;
  onCloseMobileBooking: () => void;
  saved: boolean;
  onToggleSave: () => void;
  saveModalOpen: boolean;
  onCloseSaveModal: () => void;
  onShare: () => void;
  onBack: () => void;
  similar: ReturnType<typeof experienceMatchToCardProps>[];
};

/** State for the experience page: the experience, its booking card, the
 * wishlist, sharing and the similar experiences. */
export function useExperienceDetailsViewModel(id: string): ExperienceDetailsViewModel {
  const router = useRouter();
  const { user, hydrated } = useSession();
  // Guests see the whole page and the booking card; "Book now" takes them
  // through the email step and the payment page. Signed-in users go straight
  // to the payment provider.
  const isAccount = user !== null;
  const isGuest = hydrated && !isAccount;
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const { data: experience, isLoading, isError } = useExperienceDetail(id);
  const gallery = useExperienceGalleryViewModel(experience);
  const { data: prices } = useExperiencePrices(id);
  const minPrice = (prices ?? []).reduce(
    (min, p) => (min === null || p.amount < min ? p.amount : min),
    null as number | null,
  );
  const currency = experience?.currency ?? "NGN";
  const durationLabel = formatDuration(experience?.duration_minutes) || "Flexible";

  // Recommendations need a profile; guests get the best-rated experiences.
  const similarQuery = useRecommendedExperiences({ offset: 0, limit: 10, enabled: isAccount });
  const guestSimilarQuery = useFilteredExperiences({ sort: "rating_desc", limit: 10, enabled: isGuest });
  const similar = isAccount
    ? (similarQuery.data ?? []).filter((m) => m.experience_id !== id).map(experienceMatchToCardProps)
    : (guestSimilarQuery.data?.items ?? []).filter((item) => item.id !== id).map(experienceListItemToCardProps);

  const { data: wishlistIds } = useMyWishlistedIds();
  const reviews = useExperienceReviewsViewModel(SAMPLE_REVIEWS);

  const onGuestBook = isGuest && experience
    ? (details: GuestBookingDetails) => {
        saveCheckoutDraft({
          experienceId: experience.id,
          guideId: details.guideId,
          selection: details.selection,
          title: experience.title,
          imageUrl: gallery.images[0] ?? null,
          rating: experience.rating ?? null,
          when: details.when,
          guests: details.guests,
          ticketsLabel: details.ticketsLabel,
          total: details.total,
          currency: details.currency,
          durationLabel: details.durationLabel,
        });
        router.push("/checkout");
      }
    : undefined;

  const info: BookingCardInfoRow[] = experience?.cancellation_policy
    ? [{ id: "cancellation", icon: "cancellation", title: "Cancellation policy", body: experience.cancellation_policy }]
    : [];

  const booking = useExperienceBookingCardViewModel({
    experienceId: id,
    guideId: experience?.guide_id,
    prices: prices ?? [],
    currency,
    durationLabel: experience?.duration_minutes ? durationLabel : "",
    eventStartDate: experience?.event_start_date ? parseIsoDateLocal(experience.event_start_date) : null,
    availableSpots: experience?.group_size_max ?? undefined,
    minSpots: experience?.group_size_min ?? 1,
    schedule: experience ?? undefined,
    onGuestBook,
    info,
  });

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: experience?.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      // The visitor closed the share sheet, or the clipboard is blocked.
    }
  };

  return {
    status: isLoading ? "loading" : isError || !experience ? "error" : "ready",
    content: experience ? buildExperienceDetails(experience, durationLabel) : null,
    gallery,
    reviews,
    booking,
    priceFrom: formatPrice(minPrice ?? 0, currency),
    mobileBookingOpen,
    onOpenMobileBooking: () => setMobileBookingOpen(true),
    onCloseMobileBooking: () => setMobileBookingOpen(false),
    saved: wishlistIds?.has(id) ?? false,
    onToggleSave: () => setSaveModalOpen(true),
    saveModalOpen,
    onCloseSaveModal: () => setSaveModalOpen(false),
    onShare,
    onBack: () => (window.history.length > 1 ? router.back() : router.push("/")),
    similar,
  };
}
