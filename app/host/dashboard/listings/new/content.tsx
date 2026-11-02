"use client";

import { HostListingBuilderView, HostPageHeaderView, useHostListingBuilderViewModel } from "@/features/host-portal";

export function HostListingBuilderContent() {
  const vm = useHostListingBuilderViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostListingBuilderView vm={vm} />
    </>
  );
}
