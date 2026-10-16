"use client";

import { HostPageHeaderView, HostProfileView, useHostProfileViewModel } from "@/features/host-portal";

export function HostProfileContent() {
  const vm = useHostProfileViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostProfileView vm={vm} />
    </>
  );
}
