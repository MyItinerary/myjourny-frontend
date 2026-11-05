export interface ReceiptLineItem {
  id?: string;
  label: string;
  quantity?: number;
  unitPrice?: number | string;
  amount: number | string;
}

export interface ReceiptData {
  orderNumber?: string | null;
  paymentReference?: string | null;
  billedTo?: string | null;
  paidAmount: number;
  currency?: string | null;
  paidAtFormatted?: string | null;
  experienceTitle: string;
  experienceLocation?: string | null;
  experienceImageUrl?: string | null;
  sessionDateTimeFormatted: string;
  meetingLocation?: string | null;
  totalPriceFormatted: string;
  partySizeLabel?: string | null;
  taxesAndFeesNote?: string | null;
  receiptUrl?: string | null;
  status: "paid" | "pending" | "refunded" | "unpaid";
}

export function formatMoney(amount: number | string, currency?: string | null): string {
  const code = (currency || "").toUpperCase();
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  const locale = code === "NGN" ? "en-NG" : "en-US";

  if (isNaN(num)) {
    if (!code) return "0";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(0);
    } catch {
      return `${code} 0`;
    }
  }

  if (!code) {
    return num.toLocaleString();
  }

  try {
    const isWholeNgn = code === "NGN" && num % 1 === 0;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: isWholeNgn ? 0 : (num % 1 === 0 ? 0 : 2),
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${code} ${num.toLocaleString()}`;
  }
}
