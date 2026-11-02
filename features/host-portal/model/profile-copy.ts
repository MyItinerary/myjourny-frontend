import type { PayoutSchedule, ProfilePaneKey } from "./profile.types";

export const PROFILE_PANES: { key: ProfilePaneKey; label: string; icon: "person" | "card" | "shield" | "bell" | "globe" | "doc" }[] = [
  { key: "personal", label: "Personal information", icon: "person" },
  { key: "public", label: "Your public profile", icon: "card" },
  { key: "verify", label: "Verification", icon: "shield" },
  { key: "notify", label: "Notifications", icon: "bell" },
  { key: "payouts", label: "Payouts", icon: "globe" },
  { key: "tax", label: "Tax and documents", icon: "doc" },
  { key: "security", label: "Login and security", icon: "shield" },
];

export const PANE_COPY: Record<ProfilePaneKey, { title: string; sub: string }> = {
  personal: { title: "Personal information", sub: "Only you and MyJourny see this. Guests see your public profile instead." },
  public: { title: "Your public profile", sub: "This is the page a guest reads before they decide whether to trust you with a Saturday." },
  verify: {
    title: "Verification",
    sub: "You host as an individual, which is all most hosts ever need. A registered business adds one badge and opens up company bookings.",
  },
  notify: { title: "Notifications", sub: "Pick where each thing reaches you. Booking requests always reach WhatsApp, whatever else you turn off." },
  payouts: { title: "Payouts", sub: "One Naira account, paid within 24 hours of each experience or batched on Tuesdays." },
  tax: { title: "Tax and documents", sub: "We do not file anything for you. We give you the paper you need when someone asks for it." },
  security: { title: "Login and security", sub: "How you get in, and where you are currently signed in." },
};

export const NOTIFICATION_CHANNELS = ["WhatsApp", "SMS", "Email", "Push"] as const;

export const NOTIFICATION_NOTE =
  "Booking requests always go to WhatsApp. That one cannot be turned off, since a missed request costs you the booking.";

export const PAYOUT_SCHEDULES: { key: PayoutSchedule; label: string; sub: string }[] = [
  { key: "booking", label: "After every experience", sub: "Money lands within 24 hours of the walk finishing. More messages from your bank." },
  { key: "weekly", label: "All together on Tuesdays", sub: "One payment a week covering everything that cleared. Easier to reconcile." },
];

export const SETUP_NOTE = "You cannot be paid until these three are done.";

/** What the "Close your account" card says, given what's still in the way. */
export function closingCopy({ upcoming, guests }: { upcoming: number; guests: number }): string {
  const tax = "Your reviews and your earnings history stay with us for six years for tax.";
  if (upcoming <= 0) return `You have no bookings still to come, so nothing stands in the way. ${tax}`;
  const bookings = `${upcoming} ${upcoming === 1 ? "booking" : "bookings"} still to come and ${guests} ${guests === 1 ? "guest" : "guests"} holding tickets`;
  return `You have ${bookings}. We cannot close the account until those dates have passed or you cancel them, and cancelling them refunds every guest and shows on your profile. ${tax}`;
}
