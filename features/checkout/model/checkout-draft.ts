import type { PricingSelection } from "@/features/booking";

/** What a guest picked on the experience page, kept for the checkout steps. */
export type CheckoutDraft = {
  experienceId: string;
  guideId: string;
  selection: PricingSelection;
  title: string;
  imageUrl: string | null;
  rating: number | null;
  when: string;
  guests: number;
  ticketsLabel: string;
  /** Formatted, e.g. "₦16,000.00". */
  total: string;
  currency: string;
  durationLabel: string;
  /** What they'd typed, kept when they leave to reset a password. */
  contact?: { phone: string; countryIso: string };
};

export const CHECKOUT_DRAFT_KEY = "myjourny:checkout-draft";

/** A draft this old is dropped: the prices and seats it was made for are stale. */
export const CHECKOUT_DRAFT_TTL_MS = 60 * 60 * 1000;

type Stored = CheckoutDraft & { savedAt: number };

// localStorage, not sessionStorage: resetting a password sends them to their
// email, and the link there opens in a new tab that must still find the booking.
export function saveCheckoutDraft(draft: CheckoutDraft) {
  try {
    const stored: Stored = { ...draft, savedAt: Date.now() };
    window.localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(stored));
  } catch {
    // Storage blocked: checkout then sends them back to browsing.
  }
}

/** Parses what's stored, or null when there's nothing usable or it's too old. */
export function parseCheckoutDraft(raw: string | null, now = Date.now()): CheckoutDraft | null {
  if (!raw) return null;
  try {
    const { savedAt, ...draft } = JSON.parse(raw) as Stored;
    return typeof savedAt === "number" && now - savedAt <= CHECKOUT_DRAFT_TTL_MS ? draft : null;
  } catch {
    return null;
  }
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  try {
    return parseCheckoutDraft(window.localStorage.getItem(CHECKOUT_DRAFT_KEY));
  } catch {
    return null;
  }
}

/** Adds the contact details to the saved draft, if there is one. */
export function saveCheckoutContact(contact: NonNullable<CheckoutDraft["contact"]>) {
  const draft = loadCheckoutDraft();
  if (draft) saveCheckoutDraft({ ...draft, contact });
}

export function clearCheckoutDraft() {
  try {
    window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}
