import type { HostListing } from "./listings.types";
import { SAMPLE_LISTINGS } from "./sample-listings";

// itin doesn't list a host's own experiences to a host token yet (its portal
// API is admin-only), so every host sees "Nothing here yet". Replace this with
// the real query once that API exists.
//
// While the design is reviewed, `?preview=full` shows the design's eight sample
// listings. That's off in production builds.
export function useHostListings(preview: string | null): HostListing[] {
  return preview === "full" && process.env.NODE_ENV !== "production" ? SAMPLE_LISTINGS : [];
}
