import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatMoney, type ReceiptData } from "./receipt.types";

export interface ApiBookingResponse {
  id: string;
  order_number?: string | null;
  paystack_reference?: string | null;
  experience_title?: string | null;
  party_size?: number | null;
  price_total?: string | number | null;
  currency?: string | null;
  payment_status?: "paid" | "pending" | "refunded" | "unpaid" | "partial";
  requested_datetime?: string | null;
  session_end_at?: string | null;
  created_at?: string | null;
  receipt_url?: string | null;
  user_full_name?: string | null;
  meeting_point?: {
    city?: string | null;
    country?: string | null;
    instructions?: string | null;
  } | null;
}

function formatSafeDate(dateString?: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSafeTime(dateString?: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

function parseSafeAmount(value?: string | number | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    return isNaN(value) ? null : value;
  }
  const cleanStr = String(value).replace(/[^0-9.-]+/g, "");
  if (!cleanStr) return null;
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? null : parsed;
}

export function mapBookingToReceipt(booking: ApiBookingResponse): ReceiptData {
  const currency = booking.currency ?? null;
  const partySize = booking.party_size ?? null;
  const total = parseSafeAmount(booking.price_total);

  const rawStatus = booking.payment_status;
  const status: "paid" | "pending" | "refunded" | "unpaid" =
    rawStatus === "paid"
      ? "paid"
      : rawStatus === "refunded"
      ? "refunded"
      : rawStatus === "unpaid"
      ? "unpaid"
      : "pending";

  let paidAtFormatted: string | null = null;
  if (status === "paid") {
    if (booking.created_at) {
      const formattedDate = formatSafeDate(booking.created_at);
      const formattedTime = formatSafeTime(booking.created_at);
      if (formattedDate && formattedTime) {
        paidAtFormatted = `Paid on ${formattedDate} at ${formattedTime}`;
      } else {
        paidAtFormatted = "Paid";
      }
    } else {
      paidAtFormatted = "Paid";
    }
  }

  let sessionDateTimeFormatted = "Date to be confirmed";
  if (booking.requested_datetime) {
    const formattedDate = formatSafeDate(booking.requested_datetime);
    const startTime = formatSafeTime(booking.requested_datetime);
    const endTime = formatSafeTime(booking.session_end_at);

    if (formattedDate && startTime) {
      sessionDateTimeFormatted = endTime
        ? `${formattedDate}. ${startTime} to ${endTime}`
        : `${formattedDate} at ${startTime}`;
    }
  }

  let location: string | null = null;
  if (booking.meeting_point?.city) {
    location = booking.meeting_point.country
      ? `${booking.meeting_point.city}, ${booking.meeting_point.country}`
      : booking.meeting_point.city;
  }

  return {
    orderNumber: booking.order_number ?? booking.id ?? null,
    paymentReference: booking.paystack_reference ?? null,
    billedTo: booking.user_full_name ?? null,
    paidAmount: total,
    currency,
    paidAtFormatted,
    experienceTitle: booking.experience_title ?? "Experience Booking",
    experienceLocation: location,
    experienceImageUrl: null,
    sessionDateTimeFormatted,
    meetingLocation: location,
    totalPriceFormatted: total !== null ? formatMoney(total, currency) : null,
    partySizeLabel: partySize ? `${partySize} guest${partySize === 1 ? "" : "s"}` : null,
    taxesAndFeesNote: null,
    receiptUrl: booking.receipt_url ?? null,
    status,
  };
}

export async function fetchReceipt(bookingId: string): Promise<ReceiptData> {
  const res = await apiClient.get<ApiBookingResponse>(`/bookings/${bookingId}`);
  return mapBookingToReceipt(res.data);
}

export function useReceiptQuery(bookingId?: string) {
  return useQuery({
    queryKey: ["receipt", bookingId],
    queryFn: () => fetchReceipt(bookingId!),
    enabled: Boolean(bookingId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
