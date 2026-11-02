"use client";

import { HostHelpView, HostPageHeaderView, useHostHelpViewModel } from "@/features/host-portal";

export function HostHelpContent() {
  const vm = useHostHelpViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostHelpView vm={vm} />
    </>
  );
}
