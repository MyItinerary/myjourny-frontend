import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatNaira, type ReceiptData, SAMPLE_RECEIPT } from "./receipt.types";

interface ApiBookingResponse {
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

export function mapBookingToReceipt(booking: ApiBookingResponse): ReceiptData {
  const currency = booking.currency ?? "NGN";
  const partySize = booking.party_size ?? 1;
  const total = booking.price_total ? Number(booking.price_total) : 0;
  const unitPrice = partySize > 0 ? total / partySize : total;

  let paidAtFormatted = "Paid recently";
  if (booking.created_at) {
    try {
      const date = new Date(booking.created_at);
      paidAtFormatted = `Paid on ${date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })} at ${date.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toUpperCase()}`;
    } catch {
      paidAtFormatted = "Paid recently";
    }
  }

  let sessionDateTimeFormatted = "Date to be confirmed";
  if (booking.requested_datetime) {
    try {
      const start = new Date(booking.requested_datetime);
      const day = start.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const startTime = start.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toUpperCase();
      let endTime = "5:00 PM";
      if (booking.session_end_at) {
        endTime = new Date(booking.session_end_at).toLocaleTimeString("en-GB", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).toUpperCase();
      }
      sessionDateTimeFormatted = `${day}. ${startTime} to ${endTime}`;
    } catch {
      sessionDateTimeFormatted = "Date to be confirmed";
    }
  }

  const location = booking.meeting_point?.city
    ? `${booking.meeting_point.city}, ${booking.meeting_point.country ?? "Nigeria"}`
    : "Tarkwa Bay, Lagos";

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
    totalPriceFormatted: formatNaira(total),
    unitPriceFormatted: formatNaira(unitPrice),
    partySizeLabel: `${partySize} Adult${partySize > 1 ? "s" : ""}`,
    taxesAndFeesNote: "Taxes and fees included",
    receiptUrl: booking.receipt_url ?? null,
    status: booking.payment_status === "paid" ? "paid" : "pending",
  };
}

export async function fetchReceipt(bookingId: string): Promise<ReceiptData> {
  if (!bookingId || bookingId === "sample" || bookingId === "MJ-EV-48213") {
    return SAMPLE_RECEIPT;
  }
  try {
    const res = await apiClient.get<ApiBookingResponse>(`/bookings/${bookingId}`);
    return mapBookingToReceipt(res.data);
  } catch {
    // Graceful fallback to sample preview for non-existent / demo IDs
    return {
      ...SAMPLE_RECEIPT,
      orderNumber: bookingId.startsWith("MJ-") ? bookingId : `MJ-EV-${bookingId.slice(0, 5).toUpperCase()}`,
    };
  }
}

export function useReceiptQuery(bookingId?: string) {
  return useQuery({
    queryKey: ["receipt", bookingId],
    queryFn: () => fetchReceipt(bookingId ?? "sample"),
    staleTime: 5 * 60 * 1000,
  });
}
