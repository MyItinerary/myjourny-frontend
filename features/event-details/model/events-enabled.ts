/** Events are built but not live: they need events set up on the admin dashboard
 * and an events API first. Set NEXT_PUBLIC_EVENTS_ENABLED=true to show them. */
export function eventsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.NEXT_PUBLIC_EVENTS_ENABLED === "true";
}
