/** Events are built but not live: they need events set up on the admin dashboard
 * and an events API first. Set NEXT_PUBLIC_EVENTS_ENABLED=true to show them.
 * Lives in lib/ so server pages can read it without pulling in client code. */
export function eventsEnabled(
  // Spelled out so Next inlines it for client code too; a bare process.env is empty in the browser.
  env: Record<string, string | undefined> = { NEXT_PUBLIC_EVENTS_ENABLED: process.env.NEXT_PUBLIC_EVENTS_ENABLED },
): boolean {
  return env.NEXT_PUBLIC_EVENTS_ENABLED === "true";
}
