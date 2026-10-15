import type { EmptyPitch, ExampleListing, SellPoint } from "./home-copy.types";

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

export const EMPTY_SUBTITLE = "You are approved. Nothing listed yet.";

// The pitch for a host with nothing listed yet. Copy from the design.
export const EMPTY_PITCH: EmptyPitch = {
  eyebrow: "You are approved",
  heading: "You already know how to do the thing, now sell it to eight people at once.",
  body: "A private shoot at ₦50,000 is one client and three hours. The same three hours as a photowalk for eight people at ₦10,000 is ₦80,000, and you keep ₦68,000 of it.",
  cta: "Create your first experience",
};

export const EXAMPLES_COPY = {
  heading: "Three that work in your category",
  body: "Photography, Lagos. Open one and we will fill in the shape of it for you, then you change the words.",
};

// Stand-in photos until the design system imagery is brought across.
export const EXAMPLES: ExampleListing[] = [
  {
    imageUrl: "/images/home/cities/abuja.jpg",
    eyebrow: "Art & creativity",
    title: "Golden hour portrait walk",
    sub: "Six people, three streets, everyone leaves with ten edited photos.",
    money: "8 guests × ₦10,000 = ₦80,000",
  },
  {
    imageUrl: "/images/home/cities/jos.jpg",
    eyebrow: "Street life",
    title: "Market to plate, on camera",
    sub: "Shoot the market, then eat what you bought. Two hours.",
    money: "6 guests × ₦12,000 = ₦72,000",
  },
  {
    imageUrl: "/images/home/experiences/kayaking.jpg",
    eyebrow: "Water activity",
    title: "Boat morning, film only",
    sub: "One boat, one roll of film each, back before the heat.",
    money: "5 guests × ₦18,000 = ₦90,000",
  },
];

export const SELL_POINTS: SellPoint[] = [
  {
    n: "1",
    title: "Sell the feeling, not the schedule",
    body: 'Nobody books "six locations in three hours". They book leaving with photos they will actually post.',
  },
  {
    n: "2",
    title: "One landmark beats any address",
    body: "The yellow gate beside Freedom Park. If a guest cannot find you, the review says so.",
  },
  {
    n: "3",
    title: "Price the seat, not your day",
    body: "Work out your day rate, divide it by the group, add a little back for the work of running it.",
  },
];

export const QUICK_ACTIONS = [
  { label: "List an experience", to: "listings/new" },
  { label: "Change your payout account", to: "profile" },
  { label: "How should I price this", to: "help" },
  { label: "Report a problem with a booking", to: "bookings" },
] as const;
