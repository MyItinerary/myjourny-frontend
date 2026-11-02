"use client";

import { HostBookingsView, HostPageHeaderView, useHostBookingsViewModel } from "@/features/host-portal";

export function HostBookingsContent() {
  const vm = useHostBookingsViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostBookingsView vm={vm} />
    </>
  );
}
