import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { MobileTabBarViewModel } from "../view-model/use-mobile-tab-bar-view-model";

/**
 * Phone-only bottom navigation, with a spacer so it never covers the end of the page. It slides
 * away while you scroll down (and is unreachable then), and back when you scroll up.
 */
export function MobileTabBarView({ visible, hidden, tabs }: MobileTabBarViewModel) {
  if (!visible) return null;
  return (
    <>
      <div aria-hidden className="h-[calc(72px+env(safe-area-inset-bottom))] lg:hidden" />
      <nav
        aria-label="Main"
        aria-hidden={hidden || undefined}
        inert={hidden}
        data-hidden={hidden}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-[#E7E7E7] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden",
          hidden && "translate-y-full",
        )}
      >
        <ul className="mx-auto flex h-[72px] max-w-[560px] items-center justify-around px-2">
          {tabs.map((tab) => (
            <li key={tab.id} className="flex">
              <Link
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-xs font-medium transition-transform active:scale-95",
                  tab.active ? "bg-[#F4F2EE] text-[#1F1F1F]" : "text-[#747474]",
                )}
              >
                {/* The desktop pills' artwork: 44px, cropped to a 32px window. */}
                <span aria-hidden className="relative block size-8 overflow-hidden">
                  <Image src={tab.icon} alt="" width={44} height={44} className="absolute -top-1.5 -left-1.5 size-11 max-w-none" />
                </span>
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
