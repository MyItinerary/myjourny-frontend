import type { Metadata } from "next";

import { ReceiptContent } from "./content";

export const metadata: Metadata = {
  title: "Receipt | MyJourny",
  description: "View and download your official MyJourny booking receipt.",
};

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReceiptContent bookingId={id} />;
}
