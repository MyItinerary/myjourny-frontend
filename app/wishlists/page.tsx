import type { Metadata } from "next";
import { WishlistsContent } from "./content";

export const metadata: Metadata = {
  title: "My Wishlists | MyJourny",
  description: "Browse and organize your saved experiences into custom collections.",
};

export default function WishlistsPage() {
  return <WishlistsContent />;
}
