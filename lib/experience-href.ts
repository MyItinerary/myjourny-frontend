/** Where a listing's page lives: events have their own at /events/{id}. */
export function experienceHref(id: string, kind?: string | null): string {
  return kind === "event" ? `/events/${id}` : `/experiences/${id}`;
}
