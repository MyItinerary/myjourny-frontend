import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatMoney, type ReceiptData } from "./receipt.types";

export interface ApiBookingResponse {
  id: string;
  paystack_reference?: string | null;
  experience_title?: string | null;
  party_size?: number | null;
  price_total?: string | number | null;
  currency?: string | null;
  payment_status?: "paid" | "pending" | "refunded" | "unpaid";
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

export function mapBookingToReceipt(booking: ApiBookingResponse): ReceiptData {
  const currency = booking.currency ?? "NGN";
  const partySize = booking.party_size ?? null;
  const total = typeof booking.price_total === "number"
    ? booking.price_total
    : parseFloat(String(booking.price_total || 0)) || 0;

  let paidAtFormatted = "Paid recently";
  if (booking.created_at) {
    const formattedDate = formatSafeDate(booking.created_at);
    const formattedTime = formatSafeTime(booking.created_at);
    if (formattedDate && formattedTime) {
      paidAtFormatted = `Paid on ${formattedDate} at ${formattedTime}`;
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
    orderNumber: `MJ-EV-${booking.id.slice(0, 5).toUpperCase()}`,
    paymentReference: booking.paystack_reference ?? `MJPAY-${booking.id.slice(0, 8).toUpperCase()}`,
    billedTo: booking.user_full_name ?? "Guest",
    paidAmount: total,
    currency,
    paidAtFormatted,
    experienceTitle: booking.experience_title ?? "Experience Booking",
    experienceLocation: location,
    experienceImageUrl: null,
    sessionDateTimeFormatted,
    meetingLocation: location,
    totalPriceFormatted: formatMoney(total, currency),
    partySizeLabel: partySize ? `${partySize} guest${partySize === 1 ? "" : "s"}` : null,
    taxesAndFeesNote: "Taxes and fees included",
    receiptUrl: booking.receipt_url ?? null,
    status: booking.payment_status === "paid" ? "paid" : "pending",
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
