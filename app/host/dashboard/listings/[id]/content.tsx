"use client";

import { HostListingDetailView, HostPageHeaderView, useHostListingDetailViewModel } from "@/features/host-portal";

export function HostListingDetailContent({ id }: { id: string }) {
  const vm = useHostListingDetailViewModel(id);
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostListingDetailView vm={vm} />
    </>
  );
}
