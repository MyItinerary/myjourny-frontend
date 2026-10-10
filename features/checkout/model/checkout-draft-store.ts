import { useMemo, useSyncExternalStore } from "react";

import type { CheckoutDraft } from "./checkout-draft";

const STORAGE_KEY = "myjourny:checkout-draft";

const subscribe = () => () => {};
const read = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/** The draft saved by the experience page; null on the server and when there
 * is none. */
export function useCheckoutDraft(): CheckoutDraft | null {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
    } catch {
      return null;
    }
  }, [raw]);
}
