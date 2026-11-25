"use client";

import { ExperiencePageView, useExperiencePreviewViewModel } from "@/features/experience-page";

export function ExperiencePreviewContent({ id }: { id: string }) {
  const vm = useExperiencePreviewViewModel(id);
  return <ExperiencePageView {...vm} />;
}
