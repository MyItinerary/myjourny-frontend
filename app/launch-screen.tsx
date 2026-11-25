"use client";

import { LaunchScreenView, useLaunchScreenViewModel } from "@/features/app-launch";

// The installed app's launch screen (only shows when opened from the home screen).
export function LaunchScreen() {
  const vm = useLaunchScreenViewModel();
  return <LaunchScreenView {...vm} />;
}
