import type { HostListing } from "./listings.types";

// Eight listings across every status, as drawn in the design. Stand-in photos.
// Used only for the `?preview=full` view while itin has no host API.
export const SAMPLE_LISTINGS: HostListing[] = [
  { id: "l1", imageUrl: "/images/home/cities/lagos.jpg", title: "Lagos Island Photowalk", sub: "Lagos Island · 3 hours", cat: "Art & creativity", subcat: "Photography walk", status: "Live", price: 10000, next: "Sat 20 Sept", bookings: "6 of 8", rating: "4.9", future: 4 },
  { id: "l2", imageUrl: "/images/home/experiences/kayaking.jpg", title: "Sunset Kayak and Paint", sub: "Lekki · 4 hours", cat: "Water activity", subcat: "Kayak and canoe", status: "In review", price: 16000, next: "Not set", bookings: "0", rating: "-", future: 0 },
  { id: "l3", imageUrl: "/images/home/cities/ibadan.jpg", title: "Harmattan Portrait Session", sub: "Ikoyi · 2 hours", cat: "Art & creativity", subcat: "Photography walk", status: "Archived", price: 14000, next: "Ended", bookings: "11 total", rating: "4.9", future: 0 },
  { id: "l4", imageUrl: "/images/home/cities/abuja.jpg", title: "Night Market Walk", sub: "Yaba · 2 hours", cat: "Street life", subcat: "Night market walk", status: "Draft", price: 7500, next: "Not set", bookings: "0", rating: "-", future: 0 },
  { id: "l5", imageUrl: "/images/home/cities/calabar.jpg", title: "Film Only Boat Morning", sub: "Five Cowrie Creek · 3 hours", cat: "Water activity", subcat: "Boat cruise", status: "Sold out", price: 18000, next: "Sun 21 Sept", bookings: "5 of 5", rating: "5.0", future: 1 },
  { id: "l6", imageUrl: "/images/home/cities/kaduna.jpg", title: "Freedom Park Portraits", sub: "Lagos Island · 90 minutes", cat: "Art & creativity", subcat: "Photography walk", status: "Hidden", price: 9000, next: "Paused", bookings: "2 upcoming", rating: "4.8", future: 2 },
  { id: "l7", imageUrl: "/images/home/cities/jos.jpg", title: "Makoko Boat Stories", sub: "Makoko · 3 hours", cat: "Culture & history", subcat: "Storytelling evening", status: "Paused", price: 12000, next: "Back 1 Oct", bookings: "0", rating: "4.7", future: 0 },
  { id: "l8", imageUrl: "/images/home/cities/bauchi.jpg", title: "Sunrise Beach Yoga and Photos", sub: "Elegushi · 2 hours", cat: "Wellness & calm", subcat: "Yoga", status: "Rejected", price: 8000, next: "Not set", bookings: "0", rating: "-", future: 0 },
];
