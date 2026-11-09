"use client";

import { BecomeAGuideView, useBecomeAGuideViewModel } from "@/features/become-a-guide";

export function BecomeAGuideContent() {
  const vm = useBecomeAGuideViewModel();
  return <BecomeAGuideView {...vm} />;
}
