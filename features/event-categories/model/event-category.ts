/** "music-concerts" → "Music Concerts": a readable name for a category slug. */
export function eventCategoryLabel(slug: string): string {
  return slug
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/** Where an event category lives. Experience categories live under /categories. */
export function eventCategoryHref(slug: string): string {
  return `/events/categories/${slug}`;
}
