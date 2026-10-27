import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  type EventBookingCardProps,
  type EventBookingData,
  formatMoneyCompact,
  useEventBookingCardViewModel,
} from "@/features/booking";
import { type ExperienceGalleryViewModel, useExperienceGalleryViewModel } from "@/features/experience-gallery";

import { useEventDetail } from "../model/event-details";
import type { EventDetail } from "../model/event-details.types";

const NO_TICKETS: EventBookingData = { currency: "NGN", date: { title: "", subtitle: null }, tiers: [] };

export type SimilarEventCard = {
  id: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  duration: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  saveable: false;
};

export type EventDetailsViewModel = {
  status: "loading" | "error" | "ready";
  event: EventDetail | null;
  gallery: ExperienceGalleryViewModel;
  booking: EventBookingCardProps;
  /** "₦7,500", for the mobile bar. */
  priceFrom: string;
  /** The question whose answer is open. */
  openQuestionId: string | null;
  onToggleQuestion: (id: string) => void;
  mobileBookingOpen: boolean;
  onOpenMobileBooking: () => void;
  onCloseMobileBooking: () => void;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onBack: () => void;
  similar: SimilarEventCard[];
};

const PLACEHOLDER_IMAGE = "/images/home/experiences/kayaking.jpg";

/** State for the event page: the event, its ticket card, the open question,
 * the wishlist toggle and sharing. */
export function useEventDetailsViewModel(id: string): EventDetailsViewModel {
  const router = useRouter();
  const { data: event, isLoading, isError } = useEventDetail(id);
  const gallery = useExperienceGalleryViewModel({ images: event?.images });
  // Until a question is picked, the first one is open; null means all shut.
  const [pickedQuestionId, setPickedQuestionId] = useState<string | null | undefined>(undefined);
  const openQuestionId = pickedQuestionId === undefined ? (event?.questions[0]?.id ?? null) : pickedQuestionId;
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  // Saved events stay on this device until the events API has wishlists.
  const [saved, setSaved] = useState(false);

  const booking = useEventBookingCardViewModel({
    data: event?.booking ?? NO_TICKETS,
    // Event checkout needs the events API; until then say so.
    onBook: () => toast.info("Ticket sales for this event open soon."),
  });

  const open = event?.booking.tiers.filter((tier) => tier.status === "available") ?? [];
  const cheapest = open.reduce<number | null>((min, tier) => (min === null || tier.amount < min ? tier.amount : min), null);

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event?.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      // The visitor closed the share sheet, or the clipboard is blocked.
    }
  };

  return {
    status: isLoading ? "loading" : isError || !event ? "error" : "ready",
    event: event ?? null,
    gallery,
    booking,
    priceFrom: formatMoneyCompact(cheapest ?? 0, event?.booking.currency ?? "NGN"),
    openQuestionId,
    onToggleQuestion: (questionId) => setPickedQuestionId(openQuestionId === questionId ? null : questionId),
    mobileBookingOpen,
    onOpenMobileBooking: () => setMobileBookingOpen(true),
    onCloseMobileBooking: () => setMobileBookingOpen(false),
    saved,
    onToggleSave: () => setSaved((value) => !value),
    onShare,
    onBack: () => (window.history.length > 1 ? router.back() : router.push("/")),
    similar: (event?.similar ?? []).map((item) => ({
      id: item.id,
      href: `/events/${item.id}`,
      imageSrc: item.imageUrl ?? PLACEHOLDER_IMAGE,
      imageAlt: item.title,
      category: item.category,
      title: item.title,
      duration: item.duration,
      rating: item.rating,
      reviewCount: 0,
      priceFrom: item.priceFrom,
      currency: item.currency,
      saveable: false,
    })),
  };
}
