"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, Users } from "lucide-react";

import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/session-store";
import {
  type Booking,
  useBooking,
  useCancellationRequest,
  useRequestCancellation,
} from "@/lib/queries/bookings";
import { useExperienceDetail } from "@/lib/queries/experiences";
import { cn } from "@/lib/utils";

function money(amount: string | number | null | undefined, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 2 }).format(
    Number(amount ?? 0)
  );
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  confirmed: { text: "Confirmed", className: "bg-green-100 text-green-800" },
  pending: { text: "Awaiting payment", className: "bg-amber-100 text-amber-800" },
  cancelled: { text: "Cancelled", className: "bg-[#F4F2EE] text-[#6F6B72]" },
  expired: { text: "Expired", className: "bg-[#F4F2EE] text-[#6F6B72]" },
  completed: { text: "Completed", className: "bg-[#F4F2EE] text-[#130404]" },
};

function canRequestCancellation(booking: Booking) {
  return booking.status === "confirmed" || booking.status === "pending";
}

// A customer's booking: what they paid for, the cancellation policy they
// agreed to, and a way to ask for a cancellation. Refunds are decided by
// MyJourny support under that policy, never automatically.
export function BookingDetail({ bookingId }: { bookingId: string }) {
  const { user } = useSession();
  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const { data: experience } = useExperienceDetail(booking?.experience_id ?? "");
  const { data: cancellation } = useCancellationRequest(bookingId);
  const requestCancellation = useRequestCancellation(bookingId);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");

  if (!user) {
    return (
      <Shell>
        <p className="text-[#6F6B72]">
          <Link href="/login" className="font-medium text-brand">Sign in</Link> to see this booking.
        </p>
      </Shell>
    );
  }
  if (isLoading) {
    return (
      <Shell>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
      </Shell>
    );
  }
  if (isError || !booking) {
    return (
      <Shell>
        <p className="text-lg font-medium text-[#130404]">We couldn&apos;t find this booking.</p>
      </Shell>
    );
  }

  const currency = booking.currency ?? "NGN";
  const status = STATUS_LABEL[booking.status] ?? STATUS_LABEL.confirmed;
  const openRequest = cancellation?.status === "open" ? cancellation : null;
  const refunded = Number(booking.refunded_amount ?? 0);
  const sessionDate = booking.requested_datetime
    ? new Date(booking.requested_datetime).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <Shell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-[28px] font-extrabold leading-tight text-[#130404]">
            {experience?.title ?? "Your booking"}
          </h1>
          <p className="mt-1 text-sm text-[#6F6B72]">Booking {booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-sm font-medium", status.className)}>
          {status.text}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-[#130404]">
        {sessionDate && (
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" /> {sessionDate}
          </span>
        )}
        {booking.party_size && (
          <span className="flex items-center gap-2">
            <Users className="size-4" /> {booking.party_size} guest{booking.party_size === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <section className="mt-8 rounded-2xl border border-border p-6">
        <h2 className="font-sans text-lg font-bold text-[#130404]">Receipt</h2>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          {(booking.line_items ?? []).map((line, i) => (
            <div key={`${line.kind}-${i}`} className="flex justify-between">
              <span className="text-[#6F6B72]">
                {line.label}
                {(line.kind === "ticket" || line.kind === "addon") && line.quantity > 1 ? ` × ${line.quantity}` : ""}
              </span>
              <span className={line.kind === "discount" ? "text-green-700" : "text-[#130404]"}>
                {money(line.amount, currency)}
              </span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-3 font-semibold text-[#130404]">
            <span>{booking.payment_status === "unpaid" ? "Total" : "Paid"}</span>
            <span>{money(booking.price_total, currency)}</span>
          </div>
          {refunded > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Refunded</span>
              <span>−{money(refunded, currency)}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border p-6">
        <h2 className="font-sans text-lg font-bold text-[#130404]">Cancellation policy</h2>
        <p className="mt-3 whitespace-pre-line text-sm text-[#130404]">
          {booking.cancellation_policy_snapshot ||
            "This experience has no written cancellation policy. Our support team will review any request."}
        </p>
        <p className="mt-3 text-xs text-[#6F6B72]">
          This is the policy shown when you booked. MyJourny support reviews every cancellation request against it
          and decides any refund.
        </p>

        {openRequest ? (
          <div className="mt-5 rounded-xl bg-[#F4F2EE] p-4 text-sm text-[#130404]">
            <p className="font-medium">Cancellation requested</p>
            <p className="mt-1 text-[#6F6B72]">
              Sent {new Date(openRequest.created_at).toLocaleDateString()}. We&apos;ll email you once support has
              reviewed it.
            </p>
          </div>
        ) : canRequestCancellation(booking) ? (
          showForm ? (
            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                requestCancellation.mutate(reason.trim(), { onSuccess: () => setShowForm(false) });
              }}
            >
              <label htmlFor="cancel-reason" className="text-sm font-medium text-[#130404]">
                Why do you want to cancel?
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={2000}
                className="rounded-xl border border-[#E0DFDD] p-3 text-sm"
                placeholder="e.g. My plans changed"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={reason.trim().length < 3 || requestCancellation.isPending}
                  className="bg-[#2C0101] text-white hover:bg-[#2C0101]/90"
                >
                  {requestCancellation.isPending ? "Sending…" : booking.payment_status === "unpaid" ? "Cancel booking" : "Request cancellation"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Keep my booking
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" className="mt-5" onClick={() => setShowForm(true)}>
              {booking.payment_status === "unpaid" ? "Cancel booking" : "Request cancellation"}
            </Button>
          )
        ) : null}
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="hidden lg:block">
        <HomeNav />
      </div>
      <main className="mx-auto w-full max-w-[720px] px-6 py-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-[#6F6B72] hover:text-[#130404]">
          <ChevronLeft className="size-4" /> Home
        </Link>
        {children}
      </main>
      <Footer />
    </div>
  );
}
