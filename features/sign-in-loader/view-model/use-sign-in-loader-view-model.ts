import { useIsFetching } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { stopSignInLoader, useSignInLoaderState } from "../model/sign-in-loader-store";

/** Long enough not to flash, short enough not to feel slow. */
export const MIN_VISIBLE_MS = 400;
/** If the next page never settles, stop covering it anyway. */
export const MAX_VISIBLE_MS = 10_000;

export type SignInLoaderViewModel = { visible: boolean };

/** The full-screen loader between signing in and the page it leads to. It
 * stays until that page is open and has finished loading its data. */
export function useSignInLoaderViewModel(): SignInLoaderViewModel {
  const state = useSignInLoaderState();
  const pathname = usePathname();
  const fetching = useIsFetching();
  const arrived = !!state && pathname !== state.fromPath && fetching === 0;

  useEffect(() => {
    if (!state) return;
    const timeout = setTimeout(stopSignInLoader, Math.max(0, state.startedAt + MAX_VISIBLE_MS - Date.now()));
    return () => clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    if (!state || !arrived) return;
    const done = setTimeout(stopSignInLoader, Math.max(0, state.startedAt + MIN_VISIBLE_MS - Date.now()));
    return () => clearTimeout(done);
  }, [state, arrived]);

  // Nothing behind it should scroll while it covers the page.
  const visible = !!state;
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  return { visible };
}
