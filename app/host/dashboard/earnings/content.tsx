"use client";

import { HostEarningsView, HostPageHeaderView, useHostEarningsViewModel } from "@/features/host-portal";

export function HostEarningsContent() {
  const vm = useHostEarningsViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostEarningsView vm={vm} />
    </>
  );
}
