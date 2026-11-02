"use client";

import { ExperiencePageView, useExperiencePageViewModel } from "@/features/experience-page";

export function ExperienceDetailContent({ id }: { id: string }) {
  const vm = useExperiencePageViewModel(id);
  return <ExperiencePageView {...vm} />;
}
