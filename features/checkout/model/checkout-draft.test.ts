import { afterEach, describe, expect, it } from "vitest";

import { type CheckoutDraft, clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft } from "./checkout-draft";

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

afterEach(() => window.sessionStorage.clear());

describe("checkout draft", () => {
  it("round-trips through the tab's storage", () => {
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
    window.sessionStorage.setItem("myjourny:checkout-draft", "{not json");
    expect(loadCheckoutDraft()).toBeNull();
  });
});
