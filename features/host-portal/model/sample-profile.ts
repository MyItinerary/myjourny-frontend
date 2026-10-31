import type { HostProfile, ProfileRow } from "./profile.types";

const row = (label: string, value: string, action: string, extra: Partial<ProfileRow> = {}): ProfileRow => ({ label, value, action, ...extra });

// Tunde, the host the design follows. Used only for the `?preview=full` view
// while itin has no host API.
export const SAMPLE_PROFILE: HostProfile = {
  setup: null,
  verifyLeft: 1,
  rows: {
    personal: [
      row("Legal name", "Tunde Oluwaseun Bakare", "Edit"),
      row("What guests call you", "Tunde", "Edit", { help: "Your first name only is shown on listings and in the guest app." }),
      row("Phone number", "+234 803 555 0199", "Edit", {
        help: "Booking requests reach you here on WhatsApp. Guests only see it 24 hours before an experience.",
      }),
      row("Email address", "t***e@gmail.com", "Edit"),
      row("City", "Lagos", "Edit"),
      row("Home address", "Not provided", "Add", { muted: true, help: "Never shown to guests. We only need it if you register a business later." }),
    ],
    public: [
      row("Profile photo", "A photo of your face, taken in daylight", "Change"),
      row("About you", "58 words, mentions nine years on the island", "Edit"),
      row("What you do", "Photographer", "Edit"),
      row("Years doing this", "9", "Edit"),
      row("Languages", "English, Yoruba, Pidgin", "Edit"),
      row("Community tab", "Your 11 past experiences are listed", "View"),
    ],
    verify: [
      row("Identity", "NIN checked on 2 March 2026", "View", { chip: { text: "Verified", kind: "Live" } }),
      row("Identity selfie", "Taken on webcam, 2 March 2026", "View", { chip: { text: "Verified", kind: "Live" } }),
      row("Bank account name", "BAKARE TUNDE OLUWASEUN matches your NIN", "View", { chip: { text: "Matched", kind: "Live" } }),
      row("Registered business", "You host as an individual", "Set up", {
        chip: { text: "Not set up", kind: "Draft" },
        help: "A CAC number adds a Registered business badge, makes you eligible for company and agency bookings, and raises your payout limit. Nothing is taken away if you never do it.",
      }),
      row("Certifications", "None on file", "Upload", {
        muted: true,
        help: "Optional, and only relevant for water, fitness and food. When you have one it gets a badge on the listing.",
      }),
    ],
    payouts: [
      row("Bank account", "Guaranty Trust Bank · 0123456789", "Edit", { chip: { text: "Name matches your ID", kind: "Live" } }),
      row("Account name", "BAKARE TUNDE OLUWASEUN", "View"),
      row("Next payout", "₦68,000 on Tuesday 22 September", "See earnings", { link: "earnings" }),
      row("Commission", "15 percent of every booking, one rate, nothing else taken", "How this works", { link: "help" }),
    ],
    tax: [
      row("TIN", "12345678-0001", "Edit"),
      row("VAT", "Not registered", "Edit", { help: "Only relevant once you turn over more than ₦25 million a year." }),
      row("Who this paper is for", "A landlord, a visa application, or your accountant", "View", { muted: true }),
    ],
    security: [
      row("Password", "Last changed 4 months ago", "Change"),
      row("Code sent to your phone when you sign in", "On, to +234 803 555 0199", "Turn off", { chip: { text: "On", kind: "Live" } }),
      row("Where you are signed in", "This laptop, and a phone in Lagos", "See all"),
    ],
  },
  notifications: [
    { label: "Someone asks to book", channels: [true, true, true, true] },
    { label: "A guest cancels", channels: [true, true, true, true] },
    { label: "Money lands in your account", channels: [true, false, true, false] },
    { label: "A review comes in", channels: [false, false, true, true] },
    { label: "Tips and things we have changed", channels: [false, false, true, false] },
  ],
  schedule: "weekly",
  statements: [
    { year: "2026, so far", sub: "₦1,046,000 earned · ₦156,900 commission" },
    { year: "2025", sub: "You were not hosting yet" },
  ],
  documents: [
    { name: "National identity number", sub: "NIN slip · uploaded 2 March 2026", checked: true, action: "View" },
    { name: "Identity selfie", sub: "Taken on webcam · 2 March 2026", checked: true, action: "View" },
    { name: "Bank account", sub: "GTBank · name matched your NIN", checked: true, action: "View" },
    { name: "CAC certificate", sub: "You host as an individual, this is optional", checked: false, action: "Upload" },
  ],
  preview: {
    name: "Tunde Bakare",
    line: "Photographer · Lagos · hosting since 2026",
    badges: ["Verified host", "Replies in an hour", "4.9 from 128 guests"],
    bio: "I have been photographing Lagos Island for nine years, long before it was on anyone's list. I know which walls catch the light at five o'clock and which streets are quiet on a Saturday. You do not need a camera or any idea how to pose. I will tell you where to stand.",
    languages: "English, Yoruba and Pidgin",
  },
  closing: { upcoming: 4, guests: 11 },
};
