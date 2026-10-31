import Link from "next/link";
import { Heart, Home, Luggage, Search, UserRound } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

import type { MobileTabBarViewModel, MobileTabId } from "../view-model/use-mobile-tab-bar-view-model";

const ICONS: Record<MobileTabId, ComponentType<SVGProps<SVGSVGElement>>> = {
  home: Home,
  search: Search,
  wishlists: Heart,
  trips: Luggage,
  profile: UserRound,
};

/** Phone-only bottom navigation, with a spacer so it never covers the page's end. */
export function MobileTabBarView({ visible, tabs, onOpenSearch }: Pick<MobileTabBarViewModel, "visible" | "tabs" | "onOpenSearch">) {
  if (!visible) return null;
  return (
    <>
      <div aria-hidden className="h-[calc(64px+env(safe-area-inset-bottom))] lg:hidden" />
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7E7E7] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex h-16 max-w-[560px] items-stretch justify-around">
          {tabs.map((tab) => {
            const Icon = ICONS[tab.id];
            const className = cn(
              "flex h-full min-w-16 flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium",
              tab.active ? "text-brand" : "text-[#6F6B72]",
            );
            const content = (
              <>
                <Icon className="size-6" aria-hidden />
                {tab.label}
              </>
            );
            return (
              <li key={tab.id} className="flex">
                {tab.href === null ? (
                  <button type="button" onClick={onOpenSearch} aria-pressed={tab.active} className={className}>
                    {content}
                  </button>
                ) : (
                  <Link href={tab.href} aria-current={tab.active ? "page" : undefined} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
