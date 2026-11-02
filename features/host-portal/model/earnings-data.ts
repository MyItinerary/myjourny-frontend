import type { HostEarnings } from "./earnings.types";
import { sampleEarnings } from "./sample-earnings";

// itin doesn't serve a host their earnings yet (its portal API is admin-only),
// so every host sees "Nothing earned yet". Replace this with the real query
// once that API exists.
//
// While the design is reviewed, `?preview=full` shows the design's numbers and
// six bookings. That's off in production builds.
export function useHostEarnings(preview: string | null, today: string | null): HostEarnings | null {
  return preview === "full" && process.env.NODE_ENV !== "production" && today ? sampleEarnings(today) : null;
}
