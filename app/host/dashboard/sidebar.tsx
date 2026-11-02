"use client";

import { HostSidebarView, useHostSidebarViewModel } from "@/features/host-portal";

export function HostSidebar() {
  const vm = useHostSidebarViewModel();
  return <HostSidebarView {...vm} />;
}
