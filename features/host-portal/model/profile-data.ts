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
/** The host has sent us their ID and selfie, so there's something for us to review.
 * A profile with nothing left to set up has long since sent it. */
export function verificationSubmitted(profile: Pick<HostProfile, "setup">): boolean {
  return profile.setup === null || profile.setup.some((task) => task.pane === "verify" && task.done);
}

export function useHostProfile(
  preview: string | null,
  user: { fullName: string | null; email: string | null } | null,
): HostProfile {
  return preview === "full" && process.env.NODE_ENV !== "production" ? SAMPLE_PROFILE : emptyProfile(user);
}
