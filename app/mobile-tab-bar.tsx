"use client";

import { MobileTabBarView, useMobileTabBarViewModel } from "@/features/mobile-nav";
import { MobileSearchModalView, useSearchBarViewModel } from "@/features/search";

// The phone bottom bar, and the one search sheet every phone search entry opens.
export function MobileTabBar() {
  const vm = useMobileTabBarViewModel();
  const search = useSearchBarViewModel({ variant: "hero", onClose: vm.onCloseSearch });
  return (
    <>
      <MobileTabBarView visible={vm.visible} tabs={vm.tabs} onOpenSearch={vm.onOpenSearch} />
      {vm.searchOpen && <MobileSearchModalView {...search} />}
    </>
  );
}
