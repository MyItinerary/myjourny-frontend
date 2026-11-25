import { useCategoryNames, useGuideExperiences } from "./guide-listings-api";
import { toHostListing } from "./guide-listings";
import { useHostAccess } from "./host-access";
import type { HostListing } from "./listings.types";
import { SAMPLE_LISTINGS } from "./sample-listings";

export type HostListingsData = { listings: HostListing[]; loading: boolean };

/** True while developing with `?preview=full`: the design's sample host. */
export const isSample = (preview: string | null) => preview === "full" && process.env.NODE_ENV !== "production";

/** The guide's own listings from itin. While the design is reviewed,
 * `?preview=full` shows the design's eight sample listings instead; that's
 * off in production builds. */
export function useHostListings(preview: string | null): HostListingsData {
  const sample = isSample(preview);
  const access = useHostAccess();
  const guide = !sample && (access === "approved" || access === "pending" || access === "rejected");
  const { data, isLoading } = useGuideExperiences(guide);
  const names = useCategoryNames();

  if (sample) return { listings: SAMPLE_LISTINGS, loading: false };
  return { listings: (data ?? []).map((exp) => toHostListing(exp, names)), loading: guide && isLoading };
}
