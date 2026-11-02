import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { DetailBreadcrumbs } from "@/components/shared/detail-page-parts";
import { EmptyStateView } from "@/features/empty-state";

import type { EventCategoryViewModel } from "../view-model/use-event-category-view-model";

/** An event category's page. Until the events API can list events by
 * category it says so, rather than showing experiences. */
export function EventCategoryView({ label }: EventCategoryViewModel) {
  return (
    <div className="flex flex-1 flex-col">
      <HomeNav />
      <main className="mx-auto w-full max-w-[1512px] px-6 pt-6 pb-12 lg:px-20 lg:pt-9">
        <DetailBreadcrumbs items={[{ label: "Home page", href: "/" }, { label: "Events" }, { label }]} />
        <h1 className="mt-4 font-heading text-2xl font-extrabold text-foreground lg:text-[32px]">{label} events</h1>
        <EmptyStateView
          imageSrc="/images/my-experiences/empty-experiences.png"
          title={`No ${label.toLowerCase()} events yet`}
          body="New events in this category will show up here as soon as they are listed."
          ctaLabel="Back to home"
          href="/"
        />
      </main>
      <Footer />
    </div>
  );
}
