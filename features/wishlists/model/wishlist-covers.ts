import { useQueries } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { WishlistCollectionOut, WishlistExperienceOut } from "@/lib/queries/wishlists";

import type { WishlistCoverLayout } from "./wishlist-covers.types";

const GRID_TILES = 4;

/** One image for one experience, a 2×2 grid for more (at most four, even when there are more). */
export function coverLayout(itemCount: number, images: (string | null)[] | undefined, fallback: string | null): WishlistCoverLayout {
  if (itemCount <= 0) return { kind: "empty" };
  if (itemCount === 1) return { kind: "single", src: images?.[0] ?? fallback };
  // Until the collection's images arrive, the API's single cover holds the first tile.
  const known = images ?? [fallback];
  return { kind: "grid", tiles: Array.from({ length: GRID_TILES }, (_, i) => known[i] ?? null) };
}

/** Each collection's experience images, by collection id (undefined until loaded). The list only
 * carries one cover image, so each collection's experiences are fetched, under the same cache key
 * the collection page uses, so opening one doesn't fetch it again. */
export function useWishlistCoverImages(collections: Pick<WishlistCollectionOut, "id" | "item_count">[]) {
  const results = useQueries({
    queries: collections.map((collection) => ({
      queryKey: ["wishlist-experiences", collection.id],
      queryFn: async () => {
        const { data } = await apiClient.get<WishlistExperienceOut[]>(`/wishlists/${collection.id}/experiences`);
        return Array.isArray(data) ? data : [];
      },
      enabled: collection.item_count > 0,
      staleTime: 60_000,
    })),
  });
  return Object.fromEntries(
    collections.map((collection, i) => [collection.id, results[i]?.data?.map((exp) => exp.imageUrl)]),
  ) as Record<string, (string | null)[] | undefined>;
}

/** Each collection's cover, by collection id: what My wishlists and the save dialog both show. */
export function useWishlistCoverLayouts(
  collections: Pick<WishlistCollectionOut, "id" | "item_count" | "cover_image_url">[],
): Record<string, WishlistCoverLayout> {
  const images = useWishlistCoverImages(collections);
  return Object.fromEntries(
    collections.map((c) => [c.id, coverLayout(c.item_count, images[c.id], c.cover_image_url)]),
  );
}
