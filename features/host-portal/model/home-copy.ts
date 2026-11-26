import { COMMISSION_RATE } from "./earnings";
import type { EmptyPitch, SellPoint } from "./home-copy.types";

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** "Good morning", "Good afternoon" or "Good evening", by the hour. */
export function greetingFor(date: Date): string {
  const hour = date.getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** "Saturday 19 September" */
export function longDay(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}`;
}

/** "Saturday 19 September · three things need you today", or just the day when nothing does. */
export function fullSubtitle(date: Date, attentionCount: number): string {
  const day = longDay(date);
  if (attentionCount <= 0) return day;
  const n = NUMBER_WORDS[attentionCount] ?? String(attentionCount);
  return `${day} · ${n} ${attentionCount === 1 ? "thing needs" : "things need"} you today`;
}

export const EMPTY_SUBTITLE = "Nothing listed yet.";

/** What a host keeps of each booking, as a percentage. */
const KEEP_PERCENT = 100 - Math.round(COMMISSION_RATE * 100);

// The pitch for a host with nothing listed yet.
export const EMPTY_PITCH: EmptyPitch = {
  eyebrow: "Create your first experience",
  heading: "You probably do this often, now you can make some money out of it.",
  body: `When you list an experience, you get to keep ${KEEP_PERCENT}% of the payout and get paid the same day.`,
  cta: "Create your first experience",
};

export const TEMPLATES_COPY = {
  heading: "Templates you can start from",
};

/** The card that nudges a new host to get verified. Verification is where our review starts. */
export const SETUP_COPY = {
  heading: "Finish setting up",
  note: "We review every host before their experiences go live, and it starts here. You can build your first experience while we check.",
};

export const SELL_POINTS: SellPoint[] = [
  {
    n: "1",
    title: "Sell the feeling, not the schedule",
    body: "Guests don't book six stops in three hours. They book the photos they'll post and the story they'll tell.",
  },
  {
    n: "2",
    title: "Give one clear meeting point",
    body: "Name a landmark guests can spot, like the yellow gate beside Freedom Park. If they can't find you, it shows in your reviews.",
  },
  {
    n: "3",
    title: "Price per guest, not per day",
    body: "Take your day rate, divide it by the group size, then add a little for the work of running it.",
  },
];

export const QUICK_ACTIONS = [
  { label: "List an experience", to: "listings/new" },
  { label: "Change your payout account", to: "profile?pane=payouts" },
  { label: "How should I price this", to: "help?guide=1" },
  { label: "Report a problem with a booking", to: "bookings" },
] as const;
