"use client";

import { ExperienceDetailsView, useExperienceDetailsViewModel } from "@/features/experience-details";

export function ExperienceDetailContent({ id }: { id: string }) {
  const vm = useExperienceDetailsViewModel(id);
  return <ExperienceDetailsView {...vm} />;
}
