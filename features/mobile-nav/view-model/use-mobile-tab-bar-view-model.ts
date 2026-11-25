import { usePathname } from "next/navigation";

import { eventsEnabled } from "@/lib/feature-flags";

export type MobileTabId = "home" | "experiences" | "events" | "wishlists";

export type MobileTab = {
  id: MobileTabId;
  label: string;
  href: string;
  /** The desktop nav pill's illustration. */
  icon: string;
  active: boolean;
};

export type MobileTabBarViewModel = {
  /** On the pages its tabs open (Home, Experiences, Events, My wishlists), so it stays put as you
   * move between them; deeper pages (a listing, a results page) have their own bars. */
  visible: boolean;
  tabs: MobileTab[];
};

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/** The phone bottom bar: the desktop nav's sections, with its pictures. */
export function useMobileTabBarViewModel(): MobileTabBarViewModel {
  const pathname = usePathname() ?? "/";
  const tabs: MobileTab[] = [
    { id: "home" as const, label: "Home", href: "/", icon: "/icons/nav/home.png", active: pathname === "/" },
    { id: "experiences" as const, label: "Experiences", href: "/experiences", icon: "/icons/nav/experiences.png", active: under(pathname, "/experiences") },
    { id: "events" as const, label: "Events", href: "/events", icon: "/icons/nav/events.png", active: under(pathname, "/events") },
    { id: "wishlists" as const, label: "My wishlists", href: "/wishlists", icon: "/icons/nav/wishlist.png", active: under(pathname, "/wishlists") },
  ].filter((tab) => tab.id !== "events" || eventsEnabled());

  return { visible: tabs.some((tab) => tab.href === pathname), tabs };
}
