"use client";

import { Footer } from "@/features/footer";
import { useWishlistsPageViewModel, WishlistsPageView } from "@/features/wishlists";

export function WishlistsContent() {
  const vm = useWishlistsPageViewModel();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WishlistsPageView {...vm} />
      <Footer />
    </div>
  );
}
