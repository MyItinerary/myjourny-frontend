import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { saveCheckoutDraft } from "@/features/checkout";
import {
  type BookingBarProps,
  type BookingPanelViewModel,
  type GuestBookingDetails,
  guestLoginHref,
  safeExternalUrl,
  toExperienceBookingBar,
  useBookingPanelViewModel,
} from "@/features/booking";
import {
  type ExperienceDetailsViewModel,
  useExperienceDetail,
  useExperienceDetailsViewModel,
} from "@/features/experience-details";
import { type ExperienceReviewsViewModel, useExperienceReviewsViewModel } from "@/features/reviews";
import { type ExperienceGalleryViewModel, useExperienceGalleryViewModel } from "@/features/experience-gallery";
import { captureReferral, type ShareDialogViewModel, useShareDialogViewModel } from "@/features/share";
import { useSession } from "@/lib/auth/session-store";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  formatDuration,
  useExperiencePrices,
  useFilteredExperiences,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";
import { useMyWishlistedIds } from "@/lib/queries/wishlists";

import { buildExperiencePage } from "../model/experience-page";
import type { ExperiencePageContent } from "../model/experience-page.types";

// "YYYY-MM-DD" (itin's event_start_date) parsed as a local date, not UTC:
// `new Date("YYYY-MM-DD")` would shift the day back in negative-offset zones.
function parseIsoDateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export type ExperiencePageViewModel = {
  status: "loading" | "error" | "ready";
  content: ExperiencePageContent | null;
  gallery: ExperienceGalleryViewModel;
  /** Fit, itinerary, lists, description and location, worked out from the experience. */
  details: ExperienceDetailsViewModel;
  reviews: ExperienceReviewsViewModel;
  /** The listing books on the host's own site: the card and the bar give way to a link. */
  externalBooking: { url: string | null; signedIn: boolean; loginHref: string } | null;
  /** The session isn't known yet, so neither card is shown (the external card words its link by who is signed in). */
  awaitingSession: boolean;
  booking: BookingPanelViewModel;
  /** The collapsed mobile bar. */
  bar: BookingBarProps;
  mobileBookingOpen: boolean;
  onOpenMobileBooking: () => void;
  /** The bar's button: starts the booking, or pulls the sheet up when the selection can't be booked yet. */
  onBookFromBar: () => void;
  onCloseMobileBooking: () => void;
  saved: boolean;
  onToggleSave: () => void;
  saveModalOpen: boolean;
  onCloseSaveModal: () => void;
  /** Opens the share dialog. */
  onShare: () => void;
  share: ShareDialogViewModel;
  similar: ReturnType<typeof experienceMatchToCardProps>[];
  /** Set on the preview page: the listing as travellers will see it, with nothing that books, saves or shares. */
  preview: { status: string; onClose: () => void } | null;
};

const STATUS_LABELS: Record<string, string> = { ACTIVE: "Live", INACTIVE: "Not live", DRAFT: "Draft" };

export const PREVIEW_BOOK_LABEL = "Preview only";

/** State for the experience page: the experience, its booking card, the
 * wishlist, sharing and the similar experiences. A preview shows the same
 * page but can't be booked, saved or shared. */
export function useExperiencePageViewModel(id: string, { preview = false } = {}): ExperiencePageViewModel {
  const router = useRouter();
  const { user, hydrated } = useSession();
  // Guests see the whole page and the booking card; "Book now" takes them
  // through the email step and the payment page. Signed-in users go straight
  // to the payment provider.
  const isAccount = user !== null;
  const isGuest = hydrated && !isAccount && !preview;
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const { data: experience, isLoading, isError } = useExperienceDetail(id);
  const gallery = useExperienceGalleryViewModel(experience);
  const { data: prices } = useExperiencePrices(id);
  const currency = experience?.currency ?? "NGN";
  const durationLabel = formatDuration(experience?.duration_minutes) || "Flexible";

  // Recommendations need a profile; guests get the best-rated experiences.
  const similarQuery = useRecommendedExperiences({ offset: 0, limit: 10, enabled: isAccount && !preview });
  const guestSimilarQuery = useFilteredExperiences({ sort: "rating_desc", limit: 10, enabled: isGuest });
  const similar = preview
    ? []
    : isAccount
    ? (similarQuery.data ?? []).filter((m) => m.experience_id !== id).map(experienceMatchToCardProps)
    : (guestSimilarQuery.data?.items ?? []).filter((item) => item.id !== id).map(experienceListItemToCardProps);

  const { data: wishlistIds } = useMyWishlistedIds();
  const details = useExperienceDetailsViewModel(id, experience);
  const reviews = useExperienceReviewsViewModel(id, experience, {
    // Until the API serves the new review fields, dev builds show sample reviews on experiences that have none.
    preview: process.env.NODE_ENV !== "production",
  });

  const onGuestBook = isGuest && experience
    ? (picked: GuestBookingDetails) => {
        saveCheckoutDraft({
          experienceId: experience.id,
          guideId: picked.guideId,
          selection: picked.selection,
          title: experience.title,
          imageUrl: gallery.images[0] ?? null,
          rating: experience.rating ?? null,
          when: picked.when,
          guests: picked.guests,
          ticketsLabel: picked.ticketsLabel,
          total: picked.total,
          currency: picked.currency,
          durationLabel: picked.durationLabel,
          hasTimeSlots: picked.hasTimeSlots,
          cancellationNote: picked.cancellationNote,
        });
        router.push("/checkout");
      }
    : undefined;

  const panel = useBookingPanelViewModel({
    experienceId: id,
    guideId: experience?.guide_id,
    prices: prices ?? [],
    currency,
    durationLabel: experience?.duration_minutes ? durationLabel : "",
    eventStartDate: experience?.event_start_date ? parseIsoDateLocal(experience.event_start_date) : null,
    availableSpots: experience?.group_size_max ?? undefined,
    minSpots: experience?.group_size_min ?? 1,
    cancellationPolicy: experience?.cancellation_policy,
    refundPolicy: experience?.refund_policy,
    freeCancellationHours: experience?.free_cancellation_hours,
    agePolicy: experience?.age_policy,
    minAge: experience?.min_age,
    onGuestBook,
  });
  // The dates and tickets still work so the prices can be checked; only the button is off.
  const booking: BookingPanelViewModel = preview
    ? {
        ...panel,
        booking: { ...panel.booking, disabled: true, label: PREVIEW_BOOK_LABEL, onBook: () => {} },
        card: { ...panel.card, button: { label: PREVIEW_BOOK_LABEL, loading: false, disabled: true, onClick: () => {} } },
      }
    : panel;

  // A visitor who arrived through someone's referral link keeps that code.
  useEffect(() => {
    if (!preview) captureReferral(window.location.search);
  }, [preview]);

  const share = useShareDialogViewModel({
    path: `/experiences/${id}`,
    title: experience?.title ?? "this experience",
    imageUrl: gallery.images[0] ?? null,
    kind: "experience",
  });

  return {
    status: isLoading ? "loading" : isError || !experience ? "error" : "ready",
    content: experience ? buildExperiencePage(experience, durationLabel) : null,
    gallery,
    details,
    reviews,
    externalBooking: experience?.has_external_booking
      ? { url: safeExternalUrl(experience.booking_url), signedIn: isAccount, loginHref: guestLoginHref(experience.id) }
      : null,
    awaitingSession: !hydrated,
    booking,
    bar: toExperienceBookingBar(booking),
    mobileBookingOpen,
    onOpenMobileBooking: () => setMobileBookingOpen(true),
    onBookFromBar: () => {
      const { button } = booking.card;
      if (booking.booking.available && !button.disabled) button.onClick();
      else setMobileBookingOpen(true);
    },
    onCloseMobileBooking: () => setMobileBookingOpen(false),
    saved: wishlistIds?.has(id) ?? false,
    onToggleSave: () => setSaveModalOpen(true),
    saveModalOpen,
    onCloseSaveModal: () => setSaveModalOpen(false),
    onShare: share.onOpen,
    share,
    similar,
    preview: preview
      ? {
          status: experience ? (STATUS_LABELS[experience.status] ?? experience.status) : "",
          // The preview opens in its own tab, so closing it goes back to where it came from.
          onClose: () => window.close(),
        }
      : null,
  };
}
