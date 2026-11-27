import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import { formatAmount, payoutStatusLabel, sessionDate, statementCsv } from "../model/earnings";
import { useHostEarnings } from "../model/earnings-data";
import type { EarningsRow, EarningsStat } from "../model/earnings.types";
import type { HostPageHeader } from "./use-host-home-view-model";

export type HostEarningsViewModel = {
  loading: boolean;
  error: string | null;
  header: HostPageHeader;
  stats: EarningsStat[];
  rows: EarningsRow[];
  none: boolean;
  noneMessage: string;
  onDownload: () => void;
};

export function useHostEarningsViewModel(): HostEarningsViewModel {
  const earnings = useHostEarnings();
  const bookings = earnings.data?.bookings ?? [];
  const totals = earnings.data?.totals ?? [];

  const onDownload = () => {
    if (bookings.length === 0) {
      toast.info("There's nothing to put in a statement yet.");
      return;
    }
    const blob = new Blob([statementCsv(bookings)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "myjourny-earnings-statement.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats: EarningsStat[] = totals.flatMap((total) => [
    { label: `${total.currency} earned`, value: formatAmount(total.earned, total.currency), note: "All time" },
    { label: `${total.currency} pending`, value: formatAmount(total.pending, total.currency), note: "Awaiting payout" },
    { label: `${total.currency} paid out`, value: formatAmount(total.paid_out, total.currency), note: "Ledger total" },
  ]);

  const rows: EarningsRow[] = bookings.map((booking) => ({
    id: booking.booking_id,
    booking: booking.booking_id,
    experience: booking.experience_title,
    date: sessionDate(booking.session_at),
    currency: booking.currency,
    earned: formatAmount(booking.earned, booking.currency),
    pending: formatAmount(booking.pending, booking.currency),
    paidOut: formatAmount(booking.paid_out, booking.currency),
    status: booking.payout_status,
    statusLabel: payoutStatusLabel(booking.payout_status),
  }));

  return {
    loading: earnings.isPending,
    error: earnings.isError ? apiErrorMessage(earnings.error, "Couldn't load your earnings. Please try again.") : null,
    header: {
      title: "Earnings",
      subtitle: earnings.isPending
        ? "Loading your earnings"
        : earnings.isError
          ? "Your earnings could not be loaded"
          : totals.length
            ? "Ledger totals, shown separately by currency"
            : "Nothing earned yet",
      actions: [{ label: "Download statement", onClick: onDownload, primary: false }],
    },
    stats,
    rows,
    none: !earnings.isPending && bookings.length === 0,
    noneMessage: earnings.isError
      ? "Your earnings could not be loaded. Please try again."
      : "When a guest books, their ledger amounts and payout status will appear here.",
    onDownload,
  };
}
