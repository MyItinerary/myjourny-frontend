"use client";

import { Footer } from "@/components/home/footer";
import { HomeNav } from "@/components/home/home-nav";
import { ReceiptView, useReceiptViewModel } from "@/features/receipt";

export function ReceiptContent({ bookingId }: { bookingId?: string }) {
  const vm = useReceiptViewModel({ bookingId });

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
