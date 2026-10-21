import type { HostBooking } from "./bookings.types";
import { sampleBookings } from "./sample-bookings";

// itin doesn't list a host's bookings to a host token yet (its portal API is
// admin-only), so every host sees "No bookings here". Replace this with the
// real query once that API exists.
//
// While the design is reviewed, `?preview=full` shows the design's six sample
// bookings. That's off in production builds.
export function useHostBookings(preview: string | null, today: string | null): HostBooking[] {
  return preview === "full" && process.env.NODE_ENV !== "production" && today ? sampleBookings(today) : [];
}
