"use client";

import { HostHomeView, HostPageHeaderView, useHostHomeViewModel } from "@/features/host-portal";

export function HostHomeContent() {
  const vm = useHostHomeViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostHomeView {...vm} />
    </>
  );
}
