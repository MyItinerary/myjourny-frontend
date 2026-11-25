"use client";

import type { ReactNode } from "react";

import { HostGuardView, useHostGuardViewModel } from "@/features/host-portal";

export function HostGuard({ children }: { children: ReactNode }) {
  const vm = useHostGuardViewModel();
  return <HostGuardView {...vm}>{children}</HostGuardView>;
}
