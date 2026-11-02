import type { ListingDetail } from "./listing-detail.types";
import { SAMPLE_LISTING_DETAILS } from "./sample-listing-details";

// itin has no host-facing listing API yet, so a real host has no detail to show.
// While the design is reviewed, `?preview=full` shows the design's sample
// listings. That's off in production builds.
export function useHostListingDetail(id: string, preview: string | null): ListingDetail | null {
  return preview === "full" && process.env.NODE_ENV !== "production" ? (SAMPLE_LISTING_DETAILS[id] ?? null) : null;
}
