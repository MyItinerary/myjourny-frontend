"use client";

import { CategoryContent } from "@/app/categories/[slug]/content";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { useSession } from "@/lib/auth/session-store";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  uniqueMatches,
  useInfiniteFilteredExperiences,
  useInfiniteRecommendedExperiences,
} from "@/lib/queries/experiences";

// One grid page: 4 rows of the 4-col layout.
const PAGE_SIZE = 16;

// "See more" target of the home page's popular section (Figma 2353:15947
// desktop / 2353:16337 mobile). Same listing layout as a category page.
// Signed-in users get the same location-aware recommendations as the home
// section; guests get the best-rated experiences from the public listing.
export function PopularExperiencesContent() {
  const { user, hydrated } = useSession();
  const isAccount = user !== null;
  const isGuest = hydrated && !isAccount;

  const geolocation = useGeolocation();
  const hasCoords = typeof geolocation === "object";

  const accountQuery = useInfiniteRecommendedExperiences({
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
    pageSize: PAGE_SIZE,
    enabled: isAccount && geolocation !== "pending",
  });
  const guestQuery = useInfiniteFilteredExperiences({ sort: "rating_desc", pageSize: PAGE_SIZE, enabled: isGuest });

  const query = isAccount ? accountQuery : guestQuery;
  const items = isAccount
    ? uniqueMatches(accountQuery.data?.pages).map(experienceMatchToCardProps)
    : (guestQuery.data?.pages ?? []).flatMap((p) => p.items).map(experienceListItemToCardProps);

  return (
    <CategoryContent
      label={isAccount ? "Popular experiences near you" : "Popular experiences"}
      items={items}
      total={isAccount ? undefined : guestQuery.data?.pages[0]?.total}
      isLoading={!hydrated || (isAccount && geolocation === "pending") || query.isPending}
      moreLabel="Show more"
      loadMore={{
        hasMore: query.hasNextPage,
        isLoading: query.isFetchingNextPage,
        onLoadMore: () => query.fetchNextPage(),
      }}
    />
  );
}
