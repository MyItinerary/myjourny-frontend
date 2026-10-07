"use client";

import { CategoryContent } from "@/app/categories/[slug]/content";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { useSession } from "@/lib/auth/session-store";
import { popularExperiences } from "@/lib/mock-data/home";
import {
  experienceMatchToCardProps,
  uniqueMatches,
  useInfiniteRecommendedExperiences,
} from "@/lib/queries/experiences";

// One grid page: 4 rows of the 4-col layout.
const PAGE_SIZE = 16;

// "See more" target of the home page's "Popular experiences near you"
// section (Figma 2353:15947 desktop / 2353:16337 mobile). Same listing
// layout as a category page, fed by the same recommendations the home
// section uses — signed-in users get live data near their location, guests
// the mock list (itin's experience endpoints are auth-only).
export function PopularExperiencesContent() {
  const { user } = useSession();
  const isAccount = user !== null;

  const geolocation = useGeolocation();
  const hasCoords = typeof geolocation === "object";

  const query = useInfiniteRecommendedExperiences({
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
    pageSize: PAGE_SIZE,
    enabled: isAccount && geolocation !== "pending",
  });

  const items = isAccount ? uniqueMatches(query.data?.pages).map(experienceMatchToCardProps) : popularExperiences;

  return (
    <CategoryContent
      label="Popular experiences near you"
      items={items}
      isLoading={isAccount && (geolocation === "pending" || query.isPending)}
      moreLabel="Show more"
      // Guests get the mock list, which the grid pages through locally.
      loadMore={
        isAccount
          ? {
              hasMore: query.hasNextPage,
              isLoading: query.isFetchingNextPage,
              onLoadMore: () => query.fetchNextPage(),
            }
          : undefined
      }
    />
  );
}
