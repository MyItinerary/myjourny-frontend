import { afterEach, describe, expect, it } from "vitest";

import {
  CHECKOUT_DRAFT_KEY,
  CHECKOUT_DRAFT_TTL_MS,
  type CheckoutDraft,
  clearCheckoutDraft,
  loadCheckoutDraft,
  parseCheckoutDraft,
  saveCheckoutContact,
  saveCheckoutDraft,
} from "./checkout-draft";

const draft: CheckoutDraft = {
  experienceId: "exp-1",
  guideId: "g-1",
  selection: { experience_id: "exp-1", items: [{ experience_price_id: "adult", quantity: 1 }], addons: [] },
  title: "Lagos Food Walk",
  imageUrl: null,
  rating: 4.5,
  when: "Tuesday, September 12 at 7:30 AM",
  guests: 1,
  ticketsLabel: "1 Adult",
  total: "₦16,000.00",
  currency: "NGN",
  durationLabel: "2.5 hours",
};

afterEach(() => window.localStorage.clear());

describe("checkout draft", () => {
  it("round-trips through storage", () => {
    saveCheckoutDraft(draft);
    expect(loadCheckoutDraft()).toEqual(draft);
  });

  it("is empty until saved and after clearing", () => {
    expect(loadCheckoutDraft()).toBeNull();
    saveCheckoutDraft(draft);
    clearCheckoutDraft();
    expect(loadCheckoutDraft()).toBeNull();
  });

  it("ignores a corrupt entry", () => {
    window.localStorage.setItem(CHECKOUT_DRAFT_KEY, "{not json");
    expect(loadCheckoutDraft()).toBeNull();
  });

  it("drops a draft older than an hour", () => {
    const raw = JSON.stringify({ ...draft, savedAt: 1_000 });
    expect(parseCheckoutDraft(raw, 1_000 + CHECKOUT_DRAFT_TTL_MS)).toEqual(draft);
    expect(parseCheckoutDraft(raw, 1_001 + CHECKOUT_DRAFT_TTL_MS)).toBeNull();
    expect(parseCheckoutDraft(JSON.stringify(draft), 1_000)).toBeNull();
  });

  it("keeps the contact details added to it", () => {
    saveCheckoutContact({ phone: "7016377711", countryIso: "NG" });
    expect(loadCheckoutDraft()).toBeNull();

    saveCheckoutDraft(draft);
    saveCheckoutContact({ phone: "7016377711", countryIso: "NG" });
    expect(loadCheckoutDraft()).toEqual({ ...draft, contact: { phone: "7016377711", countryIso: "NG" } });
  });
});
