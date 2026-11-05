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
  paidAmount: number;
  currency: string;
  paidAtFormatted: string;
  experienceTitle: string;
  experienceLocation?: string | null;
  experienceImageUrl?: string | null;
  sessionDateTimeFormatted: string;
  meetingLocation?: string | null;
  totalPriceFormatted: string;
  partySizeLabel?: string | null;
  taxesAndFeesNote?: string | null;
  receiptUrl?: string | null;
  status?: "paid" | "pending" | "refunded";
}

export function formatMoney(amount: number | string, currency = "NGN"): string {
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(num)) return "₦0";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${currency.toUpperCase()} ${num.toLocaleString()}`;
  }
}
