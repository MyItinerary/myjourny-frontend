"use client";

import { HomeView, useHomeViewModel } from "@/features/home";

export function HomeContent() {
  const vm = useHomeViewModel();
  return <HomeView {...vm} />;
}
