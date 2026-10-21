"use client";

import { HostListingsView, HostPageHeaderView, useHostListingsViewModel } from "@/features/host-portal";

export function HostListingsContent() {
  const vm = useHostListingsViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostListingsView vm={vm} />
    </>
  );
}
