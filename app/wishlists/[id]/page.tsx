import type { Metadata } from "next";
import { WishlistDetailContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Wishlist Collection | MyJourny" };
}

export default async function WishlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WishlistDetailContent id={id} />;
}
