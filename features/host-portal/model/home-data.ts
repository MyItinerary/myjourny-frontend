import { useSession } from "@/lib/auth/session-store";

import type { HostHomeState } from "./home.types";
import { SAMPLE_HOME } from "./sample-home";

// itin doesn't serve a host their bookings, earnings and listings yet (its
// portal API is admin-only), so every host sees the "approved, nothing listed"
// Home. Replace this with the real query once that API exists.
//
// While the design is reviewed, `?preview=full` shows the populated Home with
// the design's sample data. That's off in production builds.
export function useHostHome(preview: string | null): { state: HostHomeState; firstName: string | null } {
  const { user } = useSession();

  const first = user?.fullName?.trim().split(/\s+/)[0] ?? null;
  const state: HostHomeState =
    preview === "full" && process.env.NODE_ENV !== "production"
      ? { kind: "full", data: SAMPLE_HOME }
      : { kind: "empty" };

  return { state, firstName: first };
}
