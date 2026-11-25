/** How a collection's cover looks on My wishlists (after Airbnb's wishlist cards). */
export type WishlistCoverLayout =
  /** Nothing saved yet. */
  | { kind: "empty" }
  /** One experience: its main image fills the cover. */
  | { kind: "single"; src: string | null }
  /** Two or more: a 2×2 grid of the first four images; null tiles show grey. Always four tiles. */
  | { kind: "grid"; tiles: (string | null)[] };
