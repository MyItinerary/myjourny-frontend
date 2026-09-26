"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

function ExperienceDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 200;

  return (
    <section>
      <h2 className="font-heading text-2xl font-bold text-[#130404]">About this experience</h2>
      <p className="mt-3 font-sans text-base leading-[26px] text-[#6F6B72]">
        {isLong && !expanded ? `${description.slice(0, 200)}... ` : description}{" "}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-medium text-[#F5032D] underline underline-offset-2 hover:opacity-85 cursor-pointer"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </p>
    </section>
  );
}

export function ExperienceDetailContent({ id }: { id: string }) {
  const router = useRouter();
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
        <button
          type="button"
          aria-label="Back"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm cursor-pointer"
        >
          <ChevronLeft className="size-5 text-foreground" />
        </button>
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
              <ExperienceDescription description={experience.description} />
            )}

            <div className="flex flex-col gap-4 rounded-[16px] border border-[#E7E7E7] bg-white p-[20px] sm:flex-row sm:items-center sm:gap-[20px] self-stretch">
              <div className="flex flex-1 items-center gap-3.5">
                <Avatar className="size-[52px] shrink-0">
                  <AvatarImage src={undefined} alt={experience.host?.display_name ?? "Host"} />
                  <AvatarFallback className="bg-[#F4F2EE] font-sans text-lg font-semibold text-[#333134]">
                    {(experience.host?.display_name ?? "H")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-[16px] font-medium leading-[24px] text-[#333134]">
                      {experience.host?.display_name ?? "Your host"}
                    </span>
                    {experience.host?.is_verified && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        className="h-[13.333px] w-[13.333px] shrink-0"
                      >
                        <path
                          d="M5.41667 7.41667L6.75 8.75L9.75 5.75M11.3508 2.749C11.4881 3.08102 11.7516 3.34493 12.0834 3.48271L13.2468 3.96465C13.5789 4.10219 13.8427 4.366 13.9802 4.69804C14.1177 5.03008 14.1177 5.40316 13.9802 5.73521L13.4986 6.89787C13.361 7.23006 13.3608 7.60352 13.499 7.93555L13.9798 9.09786C14.048 9.26232 14.0831 9.4386 14.0831 9.61663C14.0831 9.79466 14.0481 9.97095 13.98 10.1354C13.9118 10.2999 13.812 10.4494 13.6861 10.5752C13.5602 10.7011 13.4107 10.8009 13.2462 10.869L12.0836 11.3506C11.7516 11.4879 11.4877 11.7514 11.3499 12.0832L10.868 13.2467C10.7304 13.5787 10.4666 13.8425 10.1346 13.9801C9.80257 14.1176 9.42951 14.1176 9.09748 13.9801L7.93486 13.4985C7.60282 13.3613 7.22988 13.3616 6.89805 13.4993L5.7346 13.9805C5.40275 14.1177 5.03001 14.1176 4.69825 13.9802C4.36648 13.8428 4.10283 13.5793 3.96521 13.2476L3.48315 12.0837C3.34587 11.7517 3.08236 11.4878 2.75056 11.35L1.58711 10.8681C1.25522 10.7306 0.991504 10.467 0.853921 10.1351C0.716339 9.80326 0.716152 9.43035 0.853403 9.09836L1.33498 7.9357C1.47217 7.60365 1.47189 7.2307 1.3342 6.89885L0.853315 5.73452C0.785135 5.57007 0.750029 5.39379 0.75 5.21575C0.749971 5.03772 0.785022 4.86143 0.853149 4.69696C0.921275 4.53248 1.02114 4.38303 1.14705 4.25717C1.27295 4.1313 1.42242 4.03148 1.58691 3.9634L2.74953 3.48181C3.08125 3.34465 3.34499 3.08147 3.48287 2.75004L3.96479 1.58654C4.10232 1.2545 4.36612 0.990689 4.69815 0.853153C5.03018 0.715616 5.40325 0.715616 5.73528 0.853153L6.8979 1.33474C7.22994 1.47194 7.60287 1.47166 7.9347 1.33396L9.09865 0.853899C9.43063 0.71644 9.80362 0.716468 10.1356 0.853978C10.4676 0.991487 10.7313 1.25522 10.8689 1.58718L11.3509 2.75102L11.3508 2.749Z"
                          stroke="#02A078"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="font-sans text-[14px] font-normal leading-[22px] text-[#6F6B72]">
                    Verified guide, Your safety and satisfaction are well guaranteed
                  </p>
                </div>
              </div>

              <div className="hidden h-[48px] w-px bg-[#E7E7E7] sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[9.333px] bg-[#F4F2EE] p-[9.333px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 18 22"
                    fill="none"
                    className="h-[19.444px] w-[15.556px] shrink-0"
                  >
                    <path
                      d="M8.74995 20.4167C9.72217 15.5556 16.5277 14.99 16.5277 8.75001C16.5277 4.45446 13.0455 0.972229 8.74995 0.972229C4.4544 0.972229 0.972168 4.45446 0.972168 8.75001C0.972168 14.99 7.77772 15.5556 8.74995 20.4167Z"
                      stroke="#6F6B72"
                      strokeWidth="1.94444"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.74995 11.6667C10.3608 11.6667 11.6666 10.3608 11.6666 8.75001C11.6666 7.13918 10.3608 5.83334 8.74995 5.83334C7.13912 5.83334 5.83328 7.13918 5.83328 8.75001C5.83328 10.3608 7.13912 11.6667 8.74995 11.6667Z"
                      stroke="#6F6B72"
                      strokeWidth="1.94444"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[16px] font-medium leading-[24px] text-[#333134]">
                    {experience.city ?? "Location"}
                  </span>
                  <p className="font-sans text-[14px] font-normal leading-[22px] text-[#6F6B72]">
                    {location || experience.country || "Location details"}
                  </p>
                </div>
              </div>
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
            availableSpots={experience.group_size_max ?? undefined}
            minSpots={experience.group_size_min ?? 1}
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
              availableSpots={experience.group_size_max ?? undefined}
              minSpots={experience.group_size_min ?? 1}
              onClose={() => setMobileBookingOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
