import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  type BookingBarProps,
  type EventBookingCardProps,
  type EventBookingData,
  formatMoneyCompact,
  useEventBookingCardViewModel,
} from "@/features/booking";
import { captureReferral, type ShareDialogViewModel, useShareDialogViewModel } from "@/features/share";
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
  /** The collapsed mobile bar. */
  bar: BookingBarProps;
  /** The question whose answer is open. */
  openQuestionId: string | null;
  onToggleQuestion: (id: string) => void;
  mobileBookingOpen: boolean;
  onOpenMobileBooking: () => void;
  /** The bar's button: gets the tickets picked, or pulls the sheet up when none are. */
  onBookFromBar: () => void;
  onCloseMobileBooking: () => void;
  saved: boolean;
  onToggleSave: () => void;
  /** Opens the share dialog. */
  onShare: () => void;
  share: ShareDialogViewModel;
  similar: SimilarEventCard[];
};

const PLACEHOLDER_IMAGE = "/images/home/experiences/kayaking.jpg";

/** State for the event page: the event, its ticket card, the open question,
 * the wishlist toggle and sharing. */
export function useEventDetailsViewModel(id: string): EventDetailsViewModel {
  const { data: event, isLoading, isError } = useEventDetail(id);
  const gallery = useExperienceGalleryViewModel({ images: event?.images });
  // Until a question is picked, the first one is open; null means all shut.
  const [pickedQuestionId, setPickedQuestionId] = useState<string | null | undefined>(undefined);
  const openQuestionId = pickedQuestionId === undefined ? (event?.questions[0]?.id ?? null) : pickedQuestionId;
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  // HARD-CODED stand-in. TODO(backend): saved events stay on this device until the events API has wishlists.
  const [saved, setSaved] = useState(false);

  const booking = useEventBookingCardViewModel({
    data: event?.booking ?? NO_TICKETS,
    // HARD-CODED stand-in. TODO(backend/admin): event checkout needs the events API, ticket stock and
    // payment; until then say so.
    onBook: () => toast.info("Ticket sales for this event open soon."),
  });

  const money = (amount: number) => formatMoneyCompact(amount, event?.booking.currency ?? "NGN");
  const open = event?.booking.tiers.filter((tier) => tier.status === "available") ?? [];
  const cheapest = open.reduce<number | null>((min, tier) => (min === null || tier.amount < min ? tier.amount : min), null);
  // "Sat, 14 Nov 2026" → "Sat 14 Nov"; the first part of "Doors 6:00pm · Music from 7:00pm".
  const shortDate = event?.dateLabel.replace(",", "").replace(/\s+\d{4}$/, "");
  const doors = event?.booking.date.subtitle?.split(" · ")[0];
  const scarce = event?.booking.tiers.find((tier) => tier.status === "available" && tier.marker?.tone === "urgency");
  const left = scarce?.marker?.label.match(/^(\d+) left/)?.[1];

  // A visitor who arrived through someone's referral link keeps that code.
  useEffect(() => {
    captureReferral(window.location.search);
  }, []);

  const share = useShareDialogViewModel({
    path: `/events/${id}`,
    title: event?.title ?? "this event",
    imageUrl: event?.images[0] ?? null,
    kind: "event",
  });

  return {
    status: isLoading ? "loading" : isError || !event ? "error" : "ready",
    event: event ?? null,
    gallery,
    booking,
    bar: {
      summary: `From ${money(cheapest ?? 0)} per ticket`,
      detail: [shortDate, doors].filter(Boolean).join(" · ") || null,
      urgency: left && scarce ? `${left} left in ${scarce.name}` : null,
      actionLabel: "Get tickets",
      actionDisabled: open.length === 0,
    },
    openQuestionId,
    onToggleQuestion: (questionId) => setPickedQuestionId(openQuestionId === questionId ? null : questionId),
    mobileBookingOpen,
    onOpenMobileBooking: () => setMobileBookingOpen(true),
    onBookFromBar: () => {
      if (!booking.action.disabled) booking.action.onClick();
      else setMobileBookingOpen(true);
    },
    onCloseMobileBooking: () => setMobileBookingOpen(false),
    saved,
    onToggleSave: () => setSaved((value) => !value),
    onShare: share.onOpen,
    share,
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
