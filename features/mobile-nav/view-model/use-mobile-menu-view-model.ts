import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/auth/session-store";
import { isHostAccount, useLogout, useMe } from "@/lib/queries/auth";
import { useUnreadNotificationsCount } from "@/lib/queries/notifications";

export type MobileMenuLink = {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  href: string;
  badge?: number;
};

export type MobileMenuViewModel = {
  /** The Switch to hosting button's target; null for anyone who isn't a host. */
  hostingHref: string | null;
  links: MobileMenuLink[];
  /** Become a guide; null for hosts, who already are one. */
  guide: MobileMenuLink | null;
  auth: { label: string; icon: string };
  onClose: () => void;
  onAuth: () => void;
};

/** The phone profile menu (Figma 2726:10536 signed out, 2726:11290 signed in). Mount it only while open. */
export function useMobileMenuViewModel({ onClose }: { onClose: () => void }): MobileMenuViewModel {
  const { user } = useSession();
  const router = useRouter();
  const logout = useLogout();
  const unreadCount = useUnreadNotificationsCount();

  // The sheet covers the page, so the page behind it shouldn't scroll.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const { data: me } = useMe();
  const signedIn = user !== null;
  // Hosts get Switch to hosting; everyone else (signed out included) is invited to become a guide.
  // Until a signed-in account has loaded, neither shows, so the wrong one never flashes up.
  const role = !signedIn ? "guest" : me === undefined ? "unknown" : isHostAccount(me) ? "host" : "guest";
  const accountHref = (href: string) => (signedIn ? href : "/login");

  return {
    hostingHref: role === "host" ? "/host/dashboard" : null,
    links: [
      { id: "my-experiences", label: "My experiences", icon: "/icons/nav/experiences.png", href: "/my-experiences" },
      {
        id: "notifications",
        label: "Notifications",
        icon: "/icons/nav/notifications.png",
        href: accountHref("/notifications"),
        badge: unreadCount > 0 ? unreadCount : undefined,
      },
      { id: "language", label: "Language and Currency", sublabel: "English/USD", icon: "/icons/nav/language.png", href: "#" },
      { id: "account-settings", label: "Account settings", icon: "/icons/nav/account-settings.png", href: accountHref("/profile") },
      { id: "help", label: "Help center", icon: "/icons/nav/help.png", href: "#" },
    ],
    guide:
      role !== "guest"
        ? null
        : {
            id: "guide",
            label: "Become a guide",
            sublabel: "Make extra income from what you already love doing",
            icon: "/icons/nav/become-guide.png",
            href: "/become-a-guide",
          },
    auth: signedIn
      ? { label: "Logout", icon: "/icons/nav/logout.png" }
      : { label: "Login or create account", icon: "/icons/nav/login.png" },
    onClose,
    onAuth: () => {
      onClose();
      if (signedIn) logout.mutate(undefined, { onSuccess: () => router.push("/login") });
      else router.push("/login");
    },
  };
}
