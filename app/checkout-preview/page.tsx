import { Metadata } from "next";
import { ConfirmDetailsPanel } from "@/components/checkout/confirm-details-panel";

export const metadata: Metadata = {
  title: "Confirm your details and pay | MyJourny",
  description: "Review and confirm your experience booking details.",
};

export default function CheckoutPreviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <ConfirmDetailsPanel />
    </div>
  );
}
