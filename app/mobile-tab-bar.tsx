"use client";

import { MobileTabBarView, useMobileTabBarViewModel } from "@/features/mobile-nav";

// The phone bottom bar (home page only).
export function MobileTabBar() {
  const vm = useMobileTabBarViewModel();
  return <MobileTabBarView {...vm} />;
}
