import { Button } from "@/components/ui/button";

import type { ExperienceReviewsViewModel } from "../view-model/use-experience-reviews-view-model";
import { EarlyReviewsNotice, NewListingNotice, NoResultsNotice, ReviewsErrorNotice, ReviewsSkeleton } from "./reviews-notice-view";
import { ReviewRowView } from "./review-row-view";
import { ReviewsScoreView, ReviewsSummaryView } from "./reviews-score-view";
import { ReviewsToolbarView } from "./reviews-toolbar-view";

/** The score, what people say, search / sort / filter, and the written reviews. */
export function ExperienceReviewsView(vm: ExperienceReviewsViewModel) {
  const { display, rating, countLabel } = vm;
  const showScore = rating != null && (display === "populated" || display === "noResults" || display === "early");
  const showToolbar = display === "populated" || display === "noResults" || display === "early";

  return (
    <section aria-labelledby="reviews-heading" className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h2 id="reviews-heading" className="font-sans text-2xl font-semibold leading-tight text-[#333134] lg:text-[32px] lg:leading-[48px]">
          Reviews
        </h2>
        {countLabel && <span className="text-base leading-6 text-[#6F6B72]">{countLabel}</span>}
      </div>

      {showScore && (
        <div className="flex flex-col gap-5">
          <ReviewsScoreView rating={rating} countLabel={countLabel} breakdown={vm.breakdown} />
          {vm.summary && <ReviewsSummaryView summary={vm.summary} />}
        </div>
      )}

      {display === "early" && <EarlyReviewsNotice />}
      {display === "new" && <NewListingNotice />}
      {display === "error" && <ReviewsErrorNotice onRetry={vm.onRetry} />}
      {display === "loading" && <ReviewsSkeleton />}

      {showToolbar && <ReviewsToolbarView {...vm} />}

      {display === "noResults" && <NoResultsNotice onClear={vm.onClearFilters} />}

      {vm.reviews.length > 0 && (
        <ul className="flex flex-col">
          {vm.reviews.map((review) => (
            <ReviewRowView
              key={review.id}
              review={review}
              onToggleHelpful={vm.onToggleHelpful}
              onToggleExpanded={vm.onToggleExpanded}
            />
          ))}
        </ul>
      )}

      {vm.hasMore && (
        <Button variant="outline" size="cta" className="self-start px-6" disabled={vm.loadingMore} onClick={vm.onShowMore}>
          {vm.loadingMore ? "Loading…" : vm.moreLabel}
        </Button>
      )}
    </section>
  );
}
