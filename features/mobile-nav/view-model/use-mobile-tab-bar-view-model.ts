import { usePathname } from "next/navigation";

import { useSession } from "@/lib/auth/session-store";

import { closeMobileSearch, openMobileSearch, useMobileSearchOpen } from "./mobile-search-store";

export type MobileTabId = "home" | "search" | "wishlists" | "trips" | "profile";

export type MobileTab = {
  id: MobileTabId;
  label: string;
  /** Null for Search, which opens the search sheet instead of a page. */
  href: string | null;
  active: boolean;
};

export type MobileTabBarViewModel = {
  /** Hidden where a page has its own bottom bar or flow (booking, checkout, sign-in, host portal). */
  visible: boolean;
  tabs: MobileTab[];
  searchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
};

const HIDDEN_ON = ["/experiences/", "/checkout", "/bookings/", "/login", "/onboarding", "/host", "/verify-email", "/email-templates"];

export function tabBarVisible(pathname: string): boolean {
  return !HIDDEN_ON.some((prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix));
}

/** The phone bottom bar: Home, Search, Wishlists, Trips and Profile. */
export function useMobileTabBarViewModel(): MobileTabBarViewModel {
  const pathname = usePathname() ?? "/";
  const { user } = useSession();
  const searchOpen = useMobileSearchOpen();
  const signedIn = user !== null;
  const under = (...prefixes: string[]) => prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const tabs: MobileTab[] = [
    { id: "home", label: "Home", href: "/", active: !searchOpen && pathname === "/" },
    { id: "search", label: "Search", href: null, active: searchOpen || under("/search") },
    { id: "wishlists", label: "Wishlists", href: signedIn ? "/wishlists" : "/login", active: !searchOpen && under("/wishlists") },
    { id: "trips", label: "Trips", href: signedIn ? "/my-experiences" : "/login", active: !searchOpen && under("/my-experiences") },
    {
      id: "profile",
      label: signedIn ? "Profile" : "Log in",
      href: signedIn ? "/profile" : "/login",
      active: !searchOpen && under("/profile", "/notifications"),
    },
  ];

  return {
    visible: tabBarVisible(pathname),
    tabs,
    searchOpen,
    onOpenSearch: openMobileSearch,
    onCloseSearch: closeMobileSearch,
  };
}
