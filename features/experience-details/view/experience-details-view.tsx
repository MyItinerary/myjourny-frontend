"use client";

import Link from "next/link";
import { ChevronLeft, Heart, Share2, Star } from "lucide-react";

import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { DetailActions, DetailBreadcrumbs } from "@/components/shared/detail-page-parts";
import { SaveToCollectionModal } from "@/components/wishlists/save-to-collection-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingBarView, ExperienceBookingCardView } from "@/features/booking";
import { ExperienceGalleryView } from "@/features/experience-gallery";
import { cn } from "@/lib/utils";

import type { ExperienceDetailsViewModel } from "../view-model/use-experience-details-view-model";
import { ExperienceReviewsView } from "./experience-reviews-view";
import { ExperienceSectionsView } from "./experience-sections-view";

function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1512px] px-6 py-8 lg:px-20">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-6 h-[300px] w-full rounded-[20px] lg:h-[479px]" />
    </div>
  );
}

function LoadError() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="text-lg font-medium text-foreground">Couldn&apos;t load this experience</p>
      <Link href="/" className="text-brand">
        Back to home
      </Link>
    </div>
  );
}

/** The new experience page (Figma "Experience details" 2532:48478). */
export function ExperienceDetailsView(vm: ExperienceDetailsViewModel) {
  const { content, status } = vm;

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

      {status === "loading" && <Loading />}
      {status === "error" && <LoadError />}

      {status === "ready" && content && (
        <>
          <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-7 px-6 pb-12 lg:px-20 lg:pt-9">
            <header className="flex flex-col gap-4 lg:gap-[19px]">
              <div className="hidden lg:block">
                <DetailBreadcrumbs items={[{ label: "Home page", href: "/" }, { label: content.title }]} />
              </div>
              <div className="flex flex-col gap-3.5">
                <h1 className="font-heading text-2xl font-extrabold text-foreground lg:text-[32px]">
                  {content.title}
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-sans text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      
                      {content.durationLabel}
                    </span>
                    {content.rating !== null && (
                      <>
                        <span aria-hidden>•</span>
                        <span className="flex items-center gap-1.5">
                          <Star className="size-[14px] fill-brand text-brand" aria-hidden />
                          {content.rating.toFixed(1)}
                          {content.location ? ` · ${content.location}` : ""}
                        </span>
                      </>
                    )}
                    {content.rating === null && content.location && (
                      <>
                        <span aria-hidden>•</span>
                        <span>{content.location}</span>
                      </>
                    )}
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

            <ExperienceGalleryView {...vm.gallery} alt={content.title} />

            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
              <div className="flex min-w-0 flex-col gap-6">
                <ExperienceSectionsView content={content} />
                <ExperienceReviewsView {...vm.reviews} />
              </div>

              <ExperienceBookingCardView
                {...vm.booking}
                className="sticky top-[124px] hidden lg:flex"
              />
            </div>
          </main>

          {vm.similar.length > 0 && (
            <ExperienceRailSection
              heading="Similar experiences"
              items={vm.similar}
              cardVariant="vertical"
              // The page lives in a 1512px column with 80px sides, not the
              // homepage grid, so the rail lines up with the content above.
              containerClassName="mx-auto w-full max-w-[1512px] px-6 pt-[77px] pb-[77px] lg:px-20 lg:pb-[79px]"
              bleedClassName="-mr-6 lg:-mr-20"
            />
          )}

          <BookingBarView priceFrom={vm.priceFrom} onBookNow={vm.onOpenMobileBooking} />

          {/* Mobile bottom sheet: the same booking card as the sidebar. */}
          {vm.mobileBookingOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                aria-label="Close booking"
                onClick={vm.onCloseMobileBooking}
                className="absolute inset-0 bg-black/40"
              />
              <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[32px]">
                <ExperienceBookingCardView
                  {...vm.booking}
                  className="rounded-b-none border-b-0"
                  onClose={vm.onCloseMobileBooking}
                />
              </div>
            </div>
          )}

          <SaveToCollectionModal
            experienceId={content.id}
            experienceTitle={content.title}
            isOpen={vm.saveModalOpen}
            onClose={vm.onCloseSaveModal}
          />
        </>
      )}

      <Footer />
    </div>
  );
}
