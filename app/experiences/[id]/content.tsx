"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Heart, MapPin, Share2 } from "lucide-react";

import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarIcon } from "@/components/icons/shared-icons";
import { ExperienceGallery } from "@/components/experiences/experience-gallery";
import { ExperienceBeforeYouBook } from "@/components/experiences/experience-before-you-book";
import { ExperienceItinerary } from "@/components/experiences/experience-itinerary";
import { ExperienceReviews } from "@/components/experiences/experience-reviews";
import {
  ExperienceBookingBar,
  ExperienceBookingPanel,
} from "@/components/experiences/experience-booking-panel";
import {
  experienceMatchToCardProps,
  formatDuration,
  useExperienceDetail,
  useExperiencePrices,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";
import { useSavedExperienceIds, useToggleSaved } from "@/lib/queries/saved";
import { cn } from "@/lib/utils";

// "YYYY-MM-DD" (itin's event_start_date) parsed as a local date, not UTC —
// splitting the parts avoids `new Date("YYYY-MM-DD")`'s UTC-midnight
// parsing shifting the day backward in negative-offset time zones.
function parseIsoDateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function ExperienceDetailContent({ id }: { id: string }) {
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const { data: experience, isLoading, isError } = useExperienceDetail(id);
  const { data: prices } = useExperiencePrices(id);
  const minPrice = (prices ?? []).reduce(
    (min, p) => (min === null || p.amount < min ? p.amount : min),
    null as number | null
  );
  const similarQuery = useRecommendedExperiences({ offset: 0, limit: 10 });
  const similarItems = (similarQuery.data ?? [])
    .filter((m) => m.experience_id !== id)
    .map(experienceMatchToCardProps);

  const { data: savedIds } = useSavedExperienceIds();
  const toggleSaved = useToggleSaved();
  const isSaved = savedIds?.has(id) ?? false;
  const handleToggleSaved = () => toggleSaved.mutate({ experienceId: id, isSaved });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-[352px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !experience) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-lg font-medium text-foreground">Couldn&apos;t load this experience</p>
        <Link href="/" className="text-brand">
          Back to home
        </Link>
      </div>
    );
  }

  const eventStartDate = experience.event_start_date
    ? parseIsoDateLocal(experience.event_start_date)
    : null;

  const images = experience.images?.length
    ? experience.images
    : experience.cover_image_url
      ? [experience.cover_image_url]
      : [];
  const durationLabel = formatDuration(experience.duration_minutes) || "Flexible";
  const location = [experience.city, experience.country].filter(Boolean).join(", ");

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-0">
      <div className="hidden lg:block">
        <HomeNav />
      </div>

      {/* Mobile compact header — back / wishlist / share, no full nav. */}
      <div className="flex items-center justify-between px-6 py-4 lg:hidden">
        <Link href="/" aria-label="Back" className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
          <ChevronLeft className="size-5 text-foreground" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleSaved}
            className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Heart className={cn("size-[18px]", isSaved ? "fill-brand text-brand" : "text-foreground")} />
          </button>
          <button type="button" aria-label="Share" className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Share2 className="size-[18px] text-foreground" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 py-4 lg:py-9">
        {/* Breadcrumb — desktop only, matches the reference screenshot. */}
        <p className="hidden text-sm text-muted-foreground lg:block">
          <Link href="/" className="text-brand">
            Home page
          </Link>{" "}
          / {experience.title} /
        </p>

        <div className="mt-2 hidden items-start justify-between gap-4 lg:flex">
          <h1 className="font-heading text-[32px] font-extrabold text-foreground">{experience.title}</h1>
          <div className="flex shrink-0 items-center gap-4 pt-2 text-sm font-medium text-foreground">
            <button type="button" onClick={handleToggleSaved} className="flex items-center gap-1.5">
              <Heart className={cn("size-4", isSaved && "fill-brand text-brand")} />
              {isSaved ? "Saved" : "Add to wishlist"}
            </button>
            <button type="button" className="flex items-center gap-1.5">
              <Share2 className="size-4" />
              Share
            </button>
          </div>
        </div>

        <h1 className="font-heading text-2xl font-extrabold text-foreground lg:hidden">{experience.title}</h1>
        {experience.headline && (
          <p className="mt-1 text-sm text-muted-foreground lg:hidden">{experience.headline}</p>
        )}

        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>{durationLabel}</span>
          <span aria-hidden>•</span>
          <span className="inline-flex items-center gap-1">
            <StarIcon className="size-[14px] fill-brand text-brand" />
            {(experience.rating ?? 0).toFixed(1)}
          </span>
          {location && (
            <>
              <span aria-hidden>·</span>
              <span>{location}</span>
            </>
          )}
        </p>

        <div className="mt-4 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
          <div className="flex flex-col gap-10">
            {images.length > 0 ? (
              <ExperienceGallery images={images} alt={experience.title} />
            ) : (
              <div className="aspect-[4/3] w-full rounded-2xl bg-muted lg:aspect-auto lg:h-[352px]" />
            )}

            {experience.description && (
              <section>
                <h2 className="font-heading text-xl font-bold text-foreground">About this experience</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{experience.description}</p>
              </section>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={experience.host?.display_name ? undefined : undefined} />
                  <AvatarFallback>{(experience.host?.display_name ?? "G")[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {experience.host?.display_name ?? "Your host"}
                  </p>
                  <p className="text-xs text-muted-foreground">Verified guide, your safety and satisfaction are well guaranteed</p>
                </div>
              </div>
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{experience.city}</p>
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                </div>
              )}
            </div>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">Before you book</h2>
              <div className="mt-4">
                <ExperienceBeforeYouBook experience={experience} />
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">Itinerary</h2>
              <div className="mt-4">
                <ExperienceItinerary />
              </div>
            </section>

            {location && (
              <section>
                <h2 className="font-heading text-xl font-bold text-foreground">Where you&apos;ll be</h2>
                <div className="relative mt-4 flex h-[280px] w-full items-center justify-center rounded-2xl bg-muted">
                  <div className="flex flex-col items-center gap-1 text-foreground">
                    <MapPin className="size-6 fill-brand text-brand" />
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">{location}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">ⓘ Exact meeting point shared after booking.</p>
              </section>
            )}

            <section>
              <ExperienceReviews rating={experience.rating} />
            </section>
          </div>

          <ExperienceBookingPanel
            className="sticky top-6 mt-8 hidden lg:mt-0 lg:flex"
            experienceId={experience.id}
            guideId={experience.guide_id}
            prices={prices ?? []}
            currency={experience.currency ?? "NGN"}
            durationLabel={durationLabel}
            eventStartDate={eventStartDate}
          />
        </div>
      </div>

      {similarItems.length > 0 && (
        <ExperienceRailSection
          heading="Similar experiences"
          items={similarItems}
          cardVariant="vertical"
          // This page lives in a 1200px column (px-6 at every breakpoint),
          // not the homepage's 1512px/lg:px-[306px] grid — match it here so
          // the heading and cards start at the same left edge as the
          // breadcrumb/gallery/reviews above, instead of the homepage's
          // wider default margins.
          containerClassName="mx-auto w-full max-w-[1200px] px-6 pt-[77px] pb-[77px] lg:pb-[79px]"
          bleedClassName="-mr-6"
        />
      )}

      <Footer />

      <ExperienceBookingBar
        priceFrom={minPrice ?? 0}
        currency={experience.currency ?? "NGN"}
        onBookNow={() => setMobileBookingOpen(true)}
      />

      {/* Mobile bottom sheet — reuses the same ExperienceBookingPanel form
          shown in the desktop sidebar rather than duplicating it. */}
      {mobileBookingOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setMobileBookingOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl">
            <ExperienceBookingPanel
              className="rounded-t-2xl rounded-b-none border-b-0"
              experienceId={experience.id}
              guideId={experience.guide_id}
              prices={prices ?? []}
              currency={experience.currency ?? "NGN"}
              durationLabel={durationLabel}
              eventStartDate={eventStartDate}
              onClose={() => setMobileBookingOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
