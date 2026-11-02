import { useSession } from "@/lib/auth/session-store";

import type { HostSidebarData } from "./host-portal.types";

// The host-facing counts and verification state aren't served to a host token
// yet (itin's portal API is admin-only today), so the rail shows what the
// session knows: the name and photo. Counts stay at zero (no pills or dots)
// and the status line stays out until verification can be read. Wire the
// real values in here once that API exists.
export function useHostSidebarData(): HostSidebarData {
  const { user, hydrated } = useSession();
  return {
    counts: { listings: 0, bookings: 0 },
    host: {
      name: user?.fullName?.trim() || user?.email || "Your account",
      photoUrl: user?.avatarUrl ?? null,
      verification: null,
      loading: !hydrated,
    },
  };
}
