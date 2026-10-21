import { usePathname } from "next/navigation";

import type { HostNavKey, HostVerification } from "../model/host-portal.types";
import { useHostSidebarData } from "../model/host-sidebar-data";
import { activeNavKey, countLabel, HOST_NAV_ITEMS, type HostNavItem } from "../model/nav";
import { useRailOpen } from "../model/rail-store";

export type HostStatusTone = "green" | "amber" | "red";

export type HostStatus = {
  label: string;
  tone: HostStatusTone;
  glyph: "seal" | "clock" | "alert";
  /** Collapsed, the text is hidden, so these show it as a dot on the avatar. */
  dotOnAvatar: boolean;
};

const STATUS: Record<HostVerification, HostStatus> = {
  verified: { label: "Verified host", tone: "green", glyph: "seal", dotOnAvatar: false },
  business: { label: "Registered business", tone: "green", glyph: "seal", dotOnAvatar: false },
  review: { label: "Under review", tone: "amber", glyph: "clock", dotOnAvatar: true },
  info: { label: "More info needed", tone: "red", glyph: "alert", dotOnAvatar: true },
};

export type HostSidebarItem = HostNavItem & {
  active: boolean;
  /** "2", "99+"; null when there's nothing waiting. */
  badge: string | null;
};

export type HostSidebarViewModel = {
  open: boolean;
  onToggle: () => void;
  items: HostSidebarItem[];
  host: {
    name: string;
    photoUrl: string | null;
    initials: string;
    status: HostStatus | null;
    loading: boolean;
  };
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "H";

export function useHostSidebarViewModel(): HostSidebarViewModel {
  const pathname = usePathname();
  const [open, onToggle] = useRailOpen();
  const { counts, host } = useHostSidebarData();

  const active = activeNavKey(pathname);
  const badges: Partial<Record<HostNavKey, string | null>> = {
    listings: countLabel(counts.listings),
    bookings: countLabel(counts.bookings),
  };

  return {
    open,
    onToggle,
    items: HOST_NAV_ITEMS.map((item) => ({ ...item, active: item.key === active, badge: badges[item.key] ?? null })),
    host: {
      name: host.name,
      photoUrl: host.photoUrl,
      initials: initialsOf(host.name),
      status: host.verification ? STATUS[host.verification] : null,
      loading: host.loading,
    },
  };
}
