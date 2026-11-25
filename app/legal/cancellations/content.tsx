"use client";

import { Footer } from "@/features/footer";
import { HomeNav } from "@/components/home/home-nav";
import { CancellationView, useCancellationViewModel } from "@/features/legal";

export function CancellationContent() {
  const vm = useCancellationViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <div className="flex-1">
        <CancellationView {...vm} />
      </div>
      <Footer />
    </div>
  );
}
