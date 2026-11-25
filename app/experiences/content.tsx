"use client";

import { ExperiencesPageView, useExperiencesPageViewModel } from "@/features/discovery";

export function ExperiencesContent() {
  const vm = useExperiencesPageViewModel();
  return <ExperiencesPageView {...vm} />;
}
