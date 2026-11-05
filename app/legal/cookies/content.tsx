"use client";

import { Footer } from "@/features/footer";
import { HomeNav } from "@/components/home/home-nav";
import { CookieView, useCookieViewModel } from "@/features/legal";

export function CookieContent() {
  const vm = useCookieViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <div className="flex-1">
        <CookieView {...vm} />
      </div>
      <Footer />
    </div>
  );
}
