import { useGuideExperience, useCategoryNames } from "./guide-listings-api";
import { toHostListing, toListingDetail } from "./guide-listings";
import type { ListingDetail } from "./listing-detail.types";
import type { HostListing } from "./listings.types";
import { isSample } from "./listings-data";
import { SAMPLE_LISTING_DETAILS } from "./sample-listing-details";
import { SAMPLE_LISTINGS } from "./sample-listings";

export type HostListingDetailData = { listing: HostListing | null; detail: ListingDetail | null; loading: boolean };

/** One of the guide's listings, whatever its status. `?preview=full` shows the
 * design's sample listings instead; that's off in production builds. */
export function useHostListingDetail(id: string, preview: string | null): HostListingDetailData {
  const sample = isSample(preview);
  const { data, isLoading } = useGuideExperience(id, !sample);
  const names = useCategoryNames();

  if (sample) {
    return { listing: SAMPLE_LISTINGS.find((l) => l.id === id) ?? null, detail: SAMPLE_LISTING_DETAILS[id] ?? null, loading: false };
  }
  return {
    listing: data ? toHostListing(data, names) : null,
    detail: data ? toListingDetail(data) : null,
    loading: isLoading,
  };
}
