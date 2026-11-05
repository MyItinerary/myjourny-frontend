import type { DiscoverEvent, PosterEvent } from "./discovery-events.types";

// TODO(backend): events have no API yet (see lib/feature-flags.ts), so the events page shows this
// placeholder content. Cards don't link anywhere until events have detail pages to open.

export const POPULAR_EVENTS_TODAY: PosterEvent[] = [
  {
    id: "afro-futures-summit",
    category: "Talks & conferences",
    title: "Afro Futures Summit",
    dateLabel: "Sat 14 Nov · 9:00 AM",
    priceLabel: "Early bird · from ₦8,000",
    imageSrc: "/images/events/poster-1.png",
  },
  {
    id: "vinyl-and-jollof",
    category: "Music",
    title: "Vinyl and Jollof, a rooftop listening night",
    dateLabel: "Sat 7 Nov · 7:00 PM",
    priceLabel: "From ₦7,500",
    imageSrc: "/images/events/poster-2.png",
  },
  {
    id: "laugh-lagos-late",
    category: "Comedy",
    title: "Laugh Lagos Late, stand-up comedy",
    dateLabel: "Fri 6 Nov · 8:00 PM",
    priceLabel: "From ₦5,000",
    imageSrc: "/images/events/poster-3.png",
  },
  {
    id: "jazz-on-the-lawn",
    category: "Music",
    title: "Jazz on the Lawn",
    dateLabel: "Sat 21 Nov · 5:00 PM",
    priceLabel: "Sold out · join the waitlist",
    imageSrc: "/images/events/poster-4.png",
  },
  {
    id: "lagos-design-week",
    category: "Art & design",
    title: "Lagos Design Week",
    dateLabel: "Sat 14 – Sun 15 Nov",
    priceLabel: "From ₦6,000",
    imageSrc: "/images/events/poster-5.png",
  },
];

const IMAGE = "/images/events/discover-jazz-brunch.png";

function discoverEvent(
  id: string,
  title: string,
  month: string,
  day: string,
  whenLabel: string,
  priceLabel: string,
): DiscoverEvent {
  return { id, title, month, day, whenLabel, location: "Adeola Odeku Street, Victoria Island", priceLabel, imageSrc: IMAGE };
}

export const THIS_WEEKEND_EVENTS: DiscoverEvent[] = [
  discoverEvent("sunday-jazz-brunch", "Sunday jazz brunch", "Nov", "8", "Sun 8 Nov · 11:00 AM", "From ₦7,500"),
  discoverEvent("rooftop-listening", "Vinyl and Jollof, a rooftop listening night", "Nov", "7", "Sat 7 Nov · 7:00 PM", "From ₦7,500"),
  discoverEvent("street-food-night", "Lagos street food night market", "Nov", "7", "Sat 7 Nov · 6:00 PM", "Free"),
  discoverEvent("laugh-lagos", "Laugh Lagos Late, stand-up comedy", "Nov", "6", "Fri 6 Nov · 8:00 PM", "From ₦5,000"),
  discoverEvent("art-market", "Open-air art market and live painting", "Nov", "8", "Sun 8 Nov · 10:00 AM", "From ₦3,000"),
];

export const EARLY_BIRD_EVENTS: DiscoverEvent[] = [
  discoverEvent("afro-futures", "Afro Futures Summit", "Nov", "14", "Sat 14 Nov · 9:00 AM", "From ₦8,000"),
  discoverEvent("design-week", "Lagos Design Week", "Nov", "14", "Sat 14 Nov", "From ₦6,000"),
  discoverEvent("jazz-lawn", "Jazz on the Lawn", "Nov", "21", "Sat 21 Nov · 5:00 PM", "From ₦9,000"),
  discoverEvent("film-night", "Open-air film night", "Nov", "20", "Fri 20 Nov · 7:30 PM", "From ₦4,500"),
  discoverEvent("beach-party", "Afrobeats beach party", "Nov", "22", "Sun 22 Nov · 2:00 PM", "From ₦12,000"),
];

export const PICKED_FOR_YOU_EVENTS: DiscoverEvent[] = [
  EARLY_BIRD_EVENTS[1],
  THIS_WEEKEND_EVENTS[0],
  EARLY_BIRD_EVENTS[2],
  THIS_WEEKEND_EVENTS[3],
  EARLY_BIRD_EVENTS[0],
];

export const NEXT_WEEK_EVENTS: DiscoverEvent[] = [
  discoverEvent("wine-tasting", "Naija wine and cheese tasting", "Nov", "12", "Thu 12 Nov · 6:30 PM", "From ₦15,000"),
  discoverEvent("poetry-night", "Spoken word and poetry night", "Nov", "13", "Fri 13 Nov · 7:00 PM", "From ₦3,500"),
  discoverEvent("market-day", "Makers market day", "Nov", "14", "Sat 14 Nov · 10:00 AM", "Free"),
  discoverEvent("sunset-cruise", "Sunset boat cruise", "Nov", "14", "Sat 14 Nov · 4:30 PM", "From ₦20,000"),
  discoverEvent("run-club", "Lagoon sunrise run club", "Nov", "15", "Sun 15 Nov · 6:00 AM", "Free"),
];
