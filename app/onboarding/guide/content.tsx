"use client";

import { HostPayoutOnboardingView, useHostPayoutOnboardingViewModel } from "@/features/host-portal";

export function GuidePayoutOnboardingContent() {
  const vm = useHostPayoutOnboardingViewModel();
  return <HostPayoutOnboardingView vm={vm} />;
}
