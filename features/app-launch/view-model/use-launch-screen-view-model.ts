import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/** Long enough for the first page's requests to start, and not to flash. */
export const MIN_VISIBLE_MS = 400;
/** If the first page never settles, stop covering it anyway. */
export const MAX_VISIBLE_MS = 10_000;

export type LaunchScreenViewModel = {
  /** The first page has loaded its data, so the launch screen fades away (for good). */
  ready: boolean;
};

/**
 * The installed app's launch screen: it stays over the first page from the moment it opens
 * until that page has loaded its data, like the sign-in loader.
 */
export function useLaunchScreenViewModel(): LaunchScreenViewModel {
  const fetching = useIsFetching();
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);

  // Give the first page a moment to start its requests, and give up after a while.
  useEffect(() => {
    const min = setTimeout(() => setSettled(true), MIN_VISIBLE_MS);
    const max = setTimeout(() => setReady(true), MAX_VISIBLE_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, []);

  return { ready: ready || (settled && fetching === 0) };
}
