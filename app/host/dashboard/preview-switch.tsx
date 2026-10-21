"use client";

import { HostPreviewSwitchView, useHostPreviewSwitchViewModel } from "@/features/host-portal";

export function HostPreviewSwitch() {
  const vm = useHostPreviewSwitchViewModel();
  return <HostPreviewSwitchView {...vm} />;
}
