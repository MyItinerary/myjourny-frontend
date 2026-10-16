export type EarningsRange = "This month" | "Last month" | "Last 3 months" | "This year" | "Everything";

export type EarningsStat = { label: string; value: string; note: string };

export type EarningsTransaction = {
  /** "MJ-4471" */
  ref: string;
  /** "Photowalk · Ifeoma Adeyemi, 4 places" */
  what: string;
  /** Local date, "YYYY-MM-DD". */
  date: string;
  /** What the guests paid, in naira. */
  gross: number;
  /** Cleared: in the host's bank. Clearing: on its way. */
  status: "Cleared" | "Clearing";
};

export type HostEarnings = {
  stats: EarningsStat[];
  /** "March 2026": where "Everything" starts. */
  since: string;
  monthEarned: number;
  clearing: number;
  transactions: EarningsTransaction[];
};
