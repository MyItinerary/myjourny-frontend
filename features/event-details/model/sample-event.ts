import type { EventDetail } from "./event-details.types";

/** `/events/sample` shows this event until itin has an events API. */
export const SAMPLE_EVENT_ID = "sample";

// Content from the design (Figma "Event details" 2470:39270).
export const SAMPLE_EVENT: EventDetail = {
  id: SAMPLE_EVENT_ID,
  title: "Afro Futures Summit",
  dateLabel: "Sat, 14 Nov 2026",
  timeLabel: "9:00AM to 5:00PM",
  venueLabel: "Harbour Hall, Victoria Island, Lagos.",
  city: "Lagos",
  images: [],
  about:
    "A day of talks and conversation on how African cities will grow over the next thirty years. Three sessions bring together architects, researchers and founders working on housing, transport and energy. Between sessions there is time to meet the speakers and the people next to you, and the day closes with a launch and refreshments. Come for one session or stay for all three.",
  organiser: {
    id: null,
    name: "Afro Futures Collective",
    verified: true,
    blurb: "Verified organiser, your tickets and your refund are guaranteed",
  },
  place: { name: "Victoria Island", detail: "Lagos island, Lagos" },
  included: [
    { id: "talks", icon: "talks", label: "All three sessions" },
    { id: "launch", icon: "launch", label: "Launch and refreshment" },
    { id: "gift", icon: "gift", label: "Name badge and gift bag" },
  ],
  goodToKnow: [
    { id: "entry", icon: "ticket", title: "Entry and ID", body: "Show your ticket QR at the door. Student tickets need a valid student ID." },
    { id: "access", icon: "accessibility", title: "Accessibility", body: "Not confirmed. Ask the organiser before you buy." },
    { id: "parking", icon: "parking", title: "Parking and getting there", body: "Marina car park is four minutes on foot. Drop-off on Marina Road." },
    { id: "transfer", icon: "transfer", title: "Ticket transfer", body: "You can send your ticket to a friend until Friday 13 November." },
    { id: "age", icon: "age", title: "Age", body: "18 and over. Under 18s need a parent or guardian's consent." },
    { id: "allowed", icon: "bag", title: "What's allowed", body: "Small bags only. No outside food or drinks." },
    { id: "dress", icon: "dress", title: "Dress code", body: "Come as you are. Layers help, the hall runs cool." },
    { id: "language", icon: "language", title: "Language", body: "English" },
  ],
  lineup: [
    { id: "amara", name: "Amara Okoye", role: "Architecture", bio: "Designs dense, walkable neighbourhoods.", imageUrl: null, tone: 1 },
    { id: "femi", name: "Dr. Femi Adeyemi", role: "Urban research", bio: "Studies how informal markets shape city life.", imageUrl: null, tone: 2 },
    { id: "ngozi", name: "Ngozi Bello", role: "Transport", bio: "Plans mass transit that people actually use.", imageUrl: null, tone: 3 },
    { id: "sani", name: "Dr. Sani Danjuma", role: "Energy", bio: "Builds solar grids for growing districts.", imageUrl: null, tone: 4 },
    { id: "kemi", name: "Kemi Lawal", role: "Housing", bio: "Finances homes for first-time owners.", imageUrl: null, tone: 5 },
    { id: "tobi", name: "Tobi Ajayi", role: "Founder", bio: "Runs a logistics startup across three cities.", imageUrl: null, tone: 1 },
  ],
  questions: [
    { id: "friend", question: "Can I buy a ticket for a friend?", answer: "Yes. Add their name and email at checkout, or send the ticket to them afterwards." },
    { id: "transfer", question: "Can tickets be transferred?", answer: "Yes. You can send your ticket to a friend until Friday 13 November." },
    { id: "cannot-come", question: "What if I can not come?", answer: "Full refund until Saturday 7 November, 6:00pm. After that, transfer your ticket to someone else." },
    { id: "launch", question: "Is the launch included?", answer: "Yes. The launch refreshment is included with every ticket." },
    { id: "parking", question: "Is there parking?", answer: "Paid parking at the Marina car park, four minutes on foot. Ride-hailing drop-off is on Marina Road." },
    { id: "cancelled", question: "What if the event is cancelled or moved?", answer: "If the organiser cancels, you are refunded in full. If it moves, your ticket moves with it, and you can ask for a refund if the new date does not work." },
  ],
  address: "Harbour Hall, 14 Marina Road, Victoria Island, Lagos",
  schedule: [
    { id: "doors", time: "8:30am", title: "Doors", detail: null, kind: "plain" },
    { id: "s1", time: "9:30am", title: "Session one", detail: "Amara Okoye and Dr. Femi Adeyemi", kind: "talk" },
    { id: "break1", time: "11:30am", title: "Break", detail: null, kind: "muted" },
    { id: "lunch", time: "12:30pm", title: "Lunch", detail: "Included with every ticket", kind: "muted" },
    { id: "s2", time: "1:30pm", title: "Session two", detail: "Ngozi Bello and Dr. Sani Danjuma", kind: "talk" },
    { id: "break2", time: "3:00pm", title: "Break", detail: null, kind: "muted" },
    { id: "s3", time: "3:30pm", title: "Session three", detail: "Kemi Lawal and Tobi Ajayi", kind: "talk" },
    { id: "launch", time: "4:30pm", title: "Launch and refreshments", detail: "Meet the speakers and the people next to you", kind: "launch" },
    { id: "close", time: "5:00pm", title: "Close", detail: null, kind: "plain" },
  ],
  moreWays: [
    { id: "food", slug: "local-food-drinks", title: "Local food & drinks", subtitle: "Street eats, cafés, and hidden spots" },
    { id: "nature", slug: "nature-outdoors", title: "Nature & outdoors", subtitle: "Trails, water, and open air" },
    { id: "art", slug: "art-creativity", title: "Art & creativity", subtitle: "Studios, galleries, and workshops" },
    { id: "music", slug: "nightlife", title: "Music & nightlife", subtitle: "Rooftops, live sets, late nights" },
  ],
  knowBeforeYouGo: [
    "Doors open at 8:30am and the first session starts at 9:30am. Arrive early to collect your badge, queues build up from 9:00am.",
    "Lunch is served between sessions. Tell the organiser about any dietary needs when you book.",
  ],
  pastEvents: [
    { id: "p1", title: "Afro Futures Summit 2025", caption: "Crowd in the main hall", imageUrl: null, tone: 2 },
    { id: "p2", title: "Salon: Cities and Sound", caption: "Small salon, 40 guests", imageUrl: null, tone: 3 },
    { id: "p3", title: "Afro Futures Summit 2024", caption: "Speakers on stage", imageUrl: null, tone: 4 },
    { id: "p4", title: "Salon: Water", caption: "Round-table evening", imageUrl: null, tone: 5 },
    { id: "p5", title: "Salon: Innovations in Tech", caption: "Networking session", imageUrl: null, tone: 5 },
    { id: "p6", title: "Salon: Art and Culture", caption: "Interactive workshop", imageUrl: null, tone: 2 },
  ],
  similar: [],
  booking: {
    currency: "NGN",
    date: { title: "Saturday 14 November 2026", subtitle: "Doors 8:30am · First session 9:30am" },
    tiers: [
      {
        id: "regular",
        name: "Regular",
        description: "General entry",
        amount: 10000,
        status: "available",
        marker: { tone: "urgency", label: "4 left at ₦10,000" },
        maxQuantity: 4,
      },
      {
        id: "vip",
        name: "VIP",
        description: "Priority entry, a reserved seat, a welcome drink",
        amount: 25000,
        status: "available",
        maxQuantity: 6,
      },
      {
        id: "table",
        name: "Table for 4",
        description: "A table of your own, entry for 4",
        amount: 80000,
        perPersonAmount: 20000,
        status: "available",
        maxQuantity: 2,
      },
    ],
  },
};
