"use client";

import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { HostTermsView, useHostTermsViewModel } from "@/features/legal";

export function HostTermsContent() {
  const vm = useHostTermsViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <div className="flex-1">
        <HostTermsView {...vm} />
      </div>
      <Footer />
    </div>
  );
}
