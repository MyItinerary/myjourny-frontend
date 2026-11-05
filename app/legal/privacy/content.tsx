"use client";

import { Footer } from "@/features/footer";
import { HomeNav } from "@/components/home/home-nav";
import { PrivacyView, usePrivacyViewModel } from "@/features/legal";

export function PrivacyContent() {
  const vm = usePrivacyViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <div className="flex-1">
        <PrivacyView {...vm} />
      </div>
      <Footer />
    </div>
  );
}
