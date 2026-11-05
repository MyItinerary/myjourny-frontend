"use client";

import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { ReceiptView, useReceiptViewModel } from "@/features/receipt";

export function ReceiptGeneralContent() {
  const vm = useReceiptViewModel();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />
      <main className="flex-1">
        <ReceiptView {...vm} />
      </main>
      <Footer />
    </div>
  );
}
