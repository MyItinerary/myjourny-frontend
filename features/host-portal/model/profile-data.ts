import { emptyProfile } from "./empty-profile";
import type { HostProfile } from "./profile.types";
import { SAMPLE_PROFILE } from "./sample-profile";

// itin doesn't serve a host their profile, verification or payout details yet
// (its portal API is admin-only), so a host sees their own name and email and
// everything else as still to do. Replace this with the real query once that
// API exists.
//
// While the design is reviewed, `?preview=full` shows the design's host. That's
// off in production builds.
export function useHostProfile(
  preview: string | null,
  user: { fullName: string | null; email: string | null } | null,
): HostProfile {
  return preview === "full" && process.env.NODE_ENV !== "production" ? SAMPLE_PROFILE : emptyProfile(user);
}
