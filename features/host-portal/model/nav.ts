import type { HostNavKey } from "./host-portal.types";

/** Where the host portal lives. */
export const HOST_PORTAL_BASE = "/host/dashboard";

export type HostNavItem = {
  key: HostNavKey;
  label: string;
  href: string;
  /** Glyph name in the design system icon set. */
  icon: "dash" | "list" | "cal" | "book" | "earn" | "prof" | "help";
};

export const HOST_NAV_ITEMS: HostNavItem[] = [
  { key: "dashboard", label: "Home", icon: "dash", href: HOST_PORTAL_BASE },
  { key: "listings", label: "Listings", icon: "list", href: `${HOST_PORTAL_BASE}/listings` },
  { key: "calendar", label: "Calendar", icon: "cal", href: `${HOST_PORTAL_BASE}/calendar` },
  { key: "bookings", label: "Bookings", icon: "book", href: `${HOST_PORTAL_BASE}/bookings` },
  { key: "earnings", label: "Earnings", icon: "earn", href: `${HOST_PORTAL_BASE}/earnings` },
  { key: "profile", label: "Profile", icon: "prof", href: `${HOST_PORTAL_BASE}/profile` },
  { key: "help", label: "Help", icon: "help", href: `${HOST_PORTAL_BASE}/help` },
];

/** The current destination, matched by route prefix so Listings stays active
 * inside the builder (listings/new, listings/<id>). Home only matches itself. */
export function activeNavKey(pathname: string | null): HostNavKey | null {
  if (!pathname) return null;
  const path = pathname.replace(/\/+$/, "");
  if (path === HOST_PORTAL_BASE) return "dashboard";
  const match = HOST_NAV_ITEMS.find(
    (item) => item.key !== "dashboard" && (path === item.href || path.startsWith(`${item.href}/`)),
  );
  return match?.key ?? null;
}

/** "99+" past 99; nothing for zero. */
export function countLabel(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}
