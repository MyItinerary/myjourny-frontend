import { useSyncExternalStore } from "react";

import { dateKey } from "../model/calendar";

const subscribe = () => () => {};
const hourNow = () => Math.floor(Date.now() / 3_600_000);

/** Today's date ("YYYY-MM-DD"), once on the client; null while rendering on the
 * server, so what depends on it never differs between the two. */
export function useToday(): string | null {
  const hour = useSyncExternalStore(subscribe, hourNow, () => null);
  return hour === null ? null : dateKey(new Date(hour * 3_600_000));
}
