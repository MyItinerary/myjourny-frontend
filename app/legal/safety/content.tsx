"use client";

import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { SafetyView, useSafetyViewModel } from "@/features/legal";

export function SafetyContent() {
  const vm = useSafetyViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <div className="flex-1">
        <SafetyView {...vm} />
      </div>
      <Footer />
    </div>
  );
}
