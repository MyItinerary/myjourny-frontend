"use client";

import { HostCalendarView, HostPageHeaderView, useHostCalendarViewModel } from "@/features/host-portal";

export function HostCalendarContent() {
  const vm = useHostCalendarViewModel();
  return (
    <>
      <HostPageHeaderView {...vm.header} />
      <HostCalendarView vm={vm} />
    </>
  );
}
