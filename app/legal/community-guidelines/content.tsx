"use client";

import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import {
  CommunityGuidelinesView,
  useCommunityGuidelinesViewModel,
} from "@/features/legal";

export function CommunityGuidelinesContent() {
  const vm = useCommunityGuidelinesViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <div className="flex-1">
        <CommunityGuidelinesView {...vm} />
      </div>
      <Footer />
    </div>
  );
}
