"use client";

import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { TermsView, useTermsViewModel } from "@/features/legal";

export function TermsContent() {
  const vm = useTermsViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <div className="flex-1">
        <TermsView {...vm} />
      </div>
      <Footer />
    </div>
  );
}
