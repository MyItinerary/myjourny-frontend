import { useSyncExternalStore } from "react";

const KEY = "myjourny:checkout-return";
const TTL_MS = 60 * 60 * 1000;

/** Remember that this person left the checkout to reset a password, so the
 * end of that flow can take them back to it. */
export function rememberCheckoutReturn() {
  try {
    window.localStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: they finish at the normal log-in page.
  }
}

export function clearCheckoutReturn() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Whether `stored` (the saved timestamp) is recent enough to act on. */
export function isCheckoutReturnFresh(stored: string | null, now = Date.now()): boolean {
  const at = Number(stored);
  return !!stored && Number.isFinite(at) && now - at <= TTL_MS;
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const read = () => {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

/** Where the log-in page should send them after resetting: the checkout if
 * they came from there, else nowhere special. */
export function useCheckoutReturnHref(): string {
  const stored = useSyncExternalStore(subscribe, read, () => null);
  return isCheckoutReturnFresh(stored) ? `/login?next=${encodeURIComponent("/checkout")}` : "/login";
}
