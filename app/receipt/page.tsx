import type { Metadata } from "next";

import { ReceiptGeneralContent } from "./content";

export const metadata: Metadata = {
  title: "Receipt | MyJourny",
  description: "View and download your official MyJourny booking receipt.",
};

export default function ReceiptGeneralPage() {
  return <ReceiptGeneralContent />;
}
