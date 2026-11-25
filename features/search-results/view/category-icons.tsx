import {
  Activity,
  BookOpen,
  Flag,
  Flower2,
  Gamepad2,
  Heart,
  MapPin,
  Palette,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trees,
  Truck,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { ListingType } from "../model/search-results.types";

const ICONS: Record<string, LucideIcon> = {
  "local-food-drinks": Truck,
  "culture-history": Flag,
  "nature-outdoors": Trees,
  "art-creativity": Palette,
  "wellness-calm": Heart,
  "street-life": MapPin,
  "events-live-shows": Ticket,
  "water-activity": Waves,
  "fitness-movement": Activity,
  "games-social": Gamepad2,
  "fandom-subculture": Sparkles,
  "faith-spirituality": Flower2,
  "books-ideas": BookOpen,
  "fashion-style": ShoppingBag,
};

/** The icon a category carries in the panel; every event category gets the ticket. */
export function CategoryIcon({ slug, kind, className }: { slug: string; kind: ListingType; className?: string }) {
  const Icon = kind === "events" ? Ticket : (ICONS[slug] ?? Sparkles);
  return <Icon aria-hidden className={className ?? "size-5"} />;
}
