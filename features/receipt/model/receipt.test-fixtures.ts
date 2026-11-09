import type { ReceiptData } from "./receipt.types";

export const SAMPLE_RECEIPT: ReceiptData = {
  orderNumber: "MJ-EV-48213",
  paymentReference: "MJPAY-7F3A91C2",
  billedTo: "Ireti George",
  paidAmount: 24000,
  currency: "NGN",
  paidAtFormatted: "Paid on Wednesday, 21 October 2026 at 2:32 PM",
  experienceTitle: "Sunrise Kayaking at Tarkwa Bay",
  experienceLocation: "Tarkwa Bay, Lagos",
  experienceImageUrl: null,
  sessionDateTimeFormatted: "Saturday, 14 November 2026. 9:00 AM to 5:00 PM",
  meetingLocation: "Tarkwa Bay, Lagos",
  totalPriceFormatted: "₦24,000",
  partySizeLabel: "1 guest",
  taxesAndFeesNote: "Taxes and fees included",
  status: "paid",
};
