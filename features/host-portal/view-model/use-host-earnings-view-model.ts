import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  earningsRow,
  type EarningsRow,
  earningsSummary,
  RANGE_OPTIONS,
  rangeFor,
  statementCsv,
  transactionsIn,
} from "../model/earnings";
import { useHostEarnings } from "../model/earnings-data";
import type { EarningsRange, EarningsStat } from "../model/earnings.types";
import type { HostPageHeader } from "./use-host-home-view-model";
import { useToday } from "./use-today";

export type HostEarningsViewModel = {
  ready: boolean;
  header: HostPageHeader;
  /** "1 to 30 September 2026" */
  rangeLabel: string;
  range: EarningsRange;
  ranges: { value: EarningsRange; selected: boolean }[];
  onRange: (range: EarningsRange) => void;
  stats: EarningsStat[];
  /** "Our 15 percent" */
  commissionHeading: string;
  rows: EarningsRow[];
  /** Nothing earned in this range (or at all). */
  none: boolean;
  noneMessage: string;
  onDownload: () => void;
};

const EMPTY_STATS: EarningsStat[] = [
  { label: "Earned all time", value: "₦0", note: "nothing yet" },
  { label: "Clearing now", value: "₦0", note: "nothing on its way" },
  { label: "Already paid out", value: "₦0", note: "no payouts yet" },
  { label: "Next payout", value: "None yet", note: "batched weekly, every Tuesday" },
];

export function useHostEarningsViewModel(): HostEarningsViewModel {
  const preview = useSearchParams().get("preview");
  const today = useToday();
  const earnings = useHostEarnings(preview, today);
  const [range, setRange] = useState<EarningsRange>("This month");

  const span = rangeFor(range, today ?? "1970-01-01", earnings?.since ?? "your first booking");
  const shown = earnings ? transactionsIn(earnings.transactions, span.start, span.end) : [];

  // The statement is what's on screen: the bookings in this range.
  const onDownload = () => {
    if (shown.length === 0) {
      toast.info("There's nothing in this range to put in a statement.");
      return;
    }
    const blob = new Blob([statementCsv(shown)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `myjourny-statement-${range.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    ready: today !== null,
    header: {
      title: "Earnings",
      subtitle: earnings ? earningsSummary(earnings.monthEarned, earnings.clearing, true) : earningsSummary(0, 0, false),
      actions: [{ label: "Download statement", onClick: onDownload, primary: false }],
    },
    rangeLabel: span.label,
    range,
    ranges: RANGE_OPTIONS.map((value) => ({ value, selected: value === range })),
    onRange: setRange,
    stats: earnings?.stats ?? EMPTY_STATS,
    commissionHeading: "Our 15 percent",
    rows: shown.map(earningsRow),
    none: shown.length === 0,
    noneMessage: earnings
      ? "Nothing earned in this range."
      : "When a guest books and pays, it shows here with what we took and what you receive.",
    onDownload,
  };
}
