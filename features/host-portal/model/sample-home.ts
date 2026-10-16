import { HOST_PORTAL_BASE } from "./nav";
import type { HostHomeData } from "./home.types";

const bookings = `${HOST_PORTAL_BASE}/bookings`;
const listings = `${HOST_PORTAL_BASE}/listings`;

// A host with a few weeks of history, as drawn in the design. Stand-in photos:
// the design system's placeholder imagery isn't in this repo.
// Used only for the `?preview=full` view while itin has no host API.
export const SAMPLE_HOME: HostHomeData = {
  stats: [
    { label: "Bookings coming up", value: "4", note: "6 guests tomorrow", tone: "muted" },
    { label: "Earned this month", value: "₦248,000", note: "up from ₦180,000 in August", tone: "green" },
    { label: "Waiting to be paid", value: "₦68,000", note: "in your bank by Tue 22 Sept", tone: "muted" },
    { label: "Your rating", value: "4.9", note: "from 128 guests", tone: "muted" },
  ],
  attention: [
    {
      id: "b1",
      title: "Amaka Eze wants 2 places on Saturday",
      sub: "Request to book · ₦20,000 · sent 22 hours ago",
      timer: "2h left",
      urgent: true,
      action: "Open",
      href: `${bookings}?booking=b1`,
    },
    {
      id: "b2",
      title: "Chidi Okafor has been waiting 2 days",
      sub: "Request to book · 3 places · ₦30,000",
      timer: "Late",
      urgent: false,
      action: "Open",
      href: `${bookings}?booking=b2`,
    },
    {
      id: "l1",
      title: "Lagos Island Photowalk is missing photos and tags",
      sub: "It cannot go live until both are done",
      timer: "2 to fix",
      urgent: false,
      action: "Finish it",
      href: `${listings}/new`,
    },
  ],
  listings: [
    {
      id: "l1",
      imageUrl: "/images/home/cities/lagos.jpg",
      status: "Live",
      title: "Lagos Island Photowalk",
      meta: "Sat 20 Sept · 6 of 8 booked",
      href: `${listings}/l1`,
    },
    {
      id: "l2",
      imageUrl: "/images/home/experiences/kayaking.jpg",
      status: "In review",
      title: "Sunset Kayak and Paint",
      meta: "Sent 2 days ago · ₦16,000",
      href: `${listings}/l2`,
    },
    {
      id: "l3",
      imageUrl: "/images/home/cities/ibadan.jpg",
      status: "Archived",
      title: "Harmattan Portrait Session",
      meta: "Ran 11 times · 4.9",
      href: `${listings}/l3`
    },
  ],
  earnings: {
    total: "₦1,046,000",
    months: [
      { month: "Apr", amountK: 96 },
      { month: "May", amountK: 132 },
      { month: "Jun", amountK: 158 },
      { month: "Jul", amountK: 204 },
      { month: "Aug", amountK: 180 },
      { month: "Sep", amountK: 248 },
    ],
  },
  next: {
    title: "Lagos Island Photowalk",
    when: "Tomorrow, Sat 20 Sept · 16:00 · 3 hours",
    guests: "6 of 8",
    payout: "₦51,000",
    meeting: "Meeting at the yellow gate beside Freedom Park",
    href: bookings,
  },
  reviews: [
    {
      name: "Ifeoma A.",
      stars: 5,
      when: "3 days ago",
      text: "Went in thinking I photograph badly. Left with eleven pictures I actually like and a sunburn.",
    },
    {
      name: "Segun O.",
      stars: 5,
      when: "last week",
      text: "Tunde knows every wall on that island. Found the gate immediately, the yellow one is hard to miss.",
    },
  ],
};
