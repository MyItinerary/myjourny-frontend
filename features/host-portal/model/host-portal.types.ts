export type HostNavKey = "dashboard" | "listings" | "calendar" | "bookings" | "earnings" | "profile" | "help";

/** verified: individual host. business: registered business. review: application
 * in review. info: more information needed. */
export type HostVerification = "verified" | "business" | "review" | "info";

export type HostSidebarData = {
  counts: { listings: number; bookings: number };
  host: {
    name: string;
    photoUrl: string | null;
    /** null until the host's verification state can be read. */
    verification: HostVerification | null;
    loading: boolean;
  };
};
