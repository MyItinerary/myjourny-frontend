import { useMemo, useSyncExternalStore } from "react";

import { CHECKOUT_DRAFT_KEY, type CheckoutDraft, parseCheckoutDraft } from "./checkout-draft";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const read = () => {
  try {
    return window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
  } catch {
    return null;
  }
};

/** The draft saved by the experience page; null on the server, when there is
 * none, and when it has gone stale. */
export function useCheckoutDraft(): CheckoutDraft | null {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => parseCheckoutDraft(raw), [raw]);
}
