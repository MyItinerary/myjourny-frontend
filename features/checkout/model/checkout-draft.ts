import type { PricingSelection } from "@/features/booking";

/** What a guest picked on the experience page, kept for the checkout steps.
 * sessionStorage: it belongs to this tab's booking and shouldn't outlive it. */
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
};

const STORAGE_KEY = "myjourny:checkout-draft";

export function saveCheckoutDraft(draft: CheckoutDraft) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage blocked: checkout then sends them back to the experience.
  }
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
