"use client";

import Link from "next/link";
import { ChevronLeft, Heart, Share2 } from "lucide-react";

import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { DetailActions, DetailBreadcrumbs } from "@/components/shared/detail-page-parts";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingBarView, EventBookingCardView } from "@/features/booking";
import { ExperienceGalleryView } from "@/features/experience-gallery";
import { cn } from "@/lib/utils";

import type { EventDetailsViewModel } from "../view-model/use-event-details-view-model";
import { EventPastEventsView } from "./event-past-events-view";
import { EventPhotosView } from "./event-photos-view";
import { EventSectionsView } from "./event-sections-view";

function Dot() {
  return <span aria-hidden>•</span>;
}

/** The event page (Figma "Event details" 2470:39270). */
export function EventDetailsView(vm: EventDetailsViewModel) {
  const { event, status } = vm;

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-0">
      <div className="hidden lg:block">
        <HomeNav />
      </div>

      {/* Mobile compact header: back, wishlist, share. */}
      <div className="flex items-center justify-between px-6 py-4 lg:hidden">
        <button
          type="button"
          aria-label="Back"
          onClick={vm.onBack}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="size-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={vm.saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={vm.onToggleSave}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Heart className={cn("size-[18px]", vm.saved ? "fill-brand text-brand" : "text-foreground")} />
          </button>
          <button
            type="button"
            aria-label="Share"
            onClick={vm.onShare}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Share2 className="size-[18px] text-foreground" />
          </button>
        </div>
      </div>

      {status === "loading" && (
        <div className="mx-auto w-full max-w-[1512px] px-6 py-8 lg:px-20">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-6 h-[300px] w-full rounded-[20px] lg:h-[479px]" />
        </div>
      )}

      {status === "error" && (
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-4 px-6 py-24 text-center">
          <p className="text-lg font-medium text-foreground">Couldn&apos;t load this event</p>
          <Link href="/" className="text-brand">
            Back to home
          </Link>
        </div>
      )}

      {status === "ready" && event && (
        <>
          <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-7 px-6 pb-12 lg:px-20 lg:pt-9">
            <header className="flex flex-col gap-4 lg:gap-[19px]">
              <div className="hidden lg:block">
                <DetailBreadcrumbs items={[{ label: "Home page", href: "/" }, { label: event.title }]} />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-heading text-2xl font-extrabold text-foreground lg:text-[32px]">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-sans text-sm text-muted-foreground">
                    <span>{event.dateLabel}</span>
                    <Dot />
                    <span>{event.timeLabel}</span>
                    <Dot />
                    <span>{event.venueLabel}</span>
                  </p>
                  <DetailActions
                    className="hidden lg:flex"
                    saved={vm.saved}
                    onToggleSave={vm.onToggleSave}
                    onShare={vm.onShare}
                  />
                </div>
              </div>
            </header>

            {event.images.length > 0 ? (
              <ExperienceGalleryView {...vm.gallery} alt={event.title} />
            ) : (
              <EventPhotosView />
            )}

            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
              <div className="flex min-w-0 flex-col gap-6">
                <EventSectionsView
                  event={event}
                  openQuestionId={vm.openQuestionId}
                  onToggleQuestion={vm.onToggleQuestion}
                />
              </div>
              <EventBookingCardView {...vm.booking} className="sticky top-[124px] hidden lg:flex" />
            </div>
          </main>

          {event.pastEvents.length > 0 && <EventPastEventsView events={event.pastEvents} />}

          {vm.similar.length > 0 && (
            <ExperienceRailSection
              heading="Similar events"
              items={vm.similar}
              cardVariant="vertical"
              containerClassName="mx-auto w-full max-w-[1512px] px-6 pt-[77px] pb-[77px] lg:px-20 lg:pb-[79px]"
              bleedClassName="-mr-6 lg:-mr-20"
            />
          )}

          <BookingBarView
            priceFrom={vm.priceFrom}
            note={event.dateLabel}
            actionLabel="Get tickets"
            onBookNow={vm.onOpenMobileBooking}
          />

          {/* Mobile bottom sheet: the same ticket card as the sidebar. */}
          {vm.mobileBookingOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                aria-label="Close booking"
                onClick={vm.onCloseMobileBooking}
                className="absolute inset-0 bg-black/40"
              />
              <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[32px]">
                <EventBookingCardView
                  {...vm.booking}
                  className="rounded-b-none border-b-0"
                  onClose={vm.onCloseMobileBooking}
                />
              </div>
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
