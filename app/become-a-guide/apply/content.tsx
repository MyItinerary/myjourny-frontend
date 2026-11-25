"use client";

import {
  GuideApplicationView,
  useGuideApplicationViewModel,
} from "@/features/become-a-guide";

export function GuideApplicationContent() {
  const vm = useGuideApplicationViewModel();
  return <GuideApplicationView {...vm} />;
}
