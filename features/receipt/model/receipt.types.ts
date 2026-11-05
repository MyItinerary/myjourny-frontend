export interface ReceiptLineItem {
  id?: string;
  label: string;
  quantity?: number;
  unitPrice?: number | string;
  amount: number | string;
}

export interface ReceiptData {
  orderNumber: string;
  paymentReference: string;
  billedTo: string;
  paidAmount: number | string;
  currency: string;
  paidAtFormatted: string;
  experienceTitle: string;
  experienceLocation: string;
  experienceImageUrl?: string | null;
  sessionDateTimeFormatted: string;
  meetingLocation: string;
  totalPriceFormatted: string;
  unitPriceFormatted?: string;
  partySizeLabel?: string;
  taxesAndFeesNote?: string;
  receiptUrl?: string | null;
  status?: "paid" | "pending" | "refunded";
}

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
  totalPriceFormatted: "₦16,000",
  unitPriceFormatted: "₦16,000",
  partySizeLabel: "1 Adult",
  taxesAndFeesNote: "Taxes and fees included",
  status: "paid",
};

export function formatNaira(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(num)) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(num);
}
