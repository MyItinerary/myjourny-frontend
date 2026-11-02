import type { HostProfile, ProfileRow } from "./profile.types";

const NOT_PROVIDED = "Not provided";

const row = (label: string, value: string, action: string, extra: Partial<ProfileRow> = {}): ProfileRow => ({ label, value, action, ...extra });
const todo = (label: string, value: string, action: string, extra: Partial<ProfileRow> = {}) =>
  row(label, value, action, { muted: true, ...extra });

/** "t***e@gmail.com": enough to recognise, not enough to read out. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`}@${domain}`;
}

/** What the profile shows before itin can say more: the account's own name and
 * email, and everything else as still to do. */
export function emptyProfile(user: { fullName: string | null; email: string | null } | null): HostProfile {
  const name = user?.fullName?.trim() ?? "";
  const first = name.split(/\s+/)[0] ?? "";

  return {
    setup: [
      { title: "Confirm who you are", body: "Your NIN or driver licence, and one selfie. Takes about four minutes.", pane: "verify", done: false },
      { title: "Write your public profile", body: "A photo of your face and a few lines about what you do. Guests book people.", pane: "public", done: false },
      { title: "Add the account we pay into", body: "Nigerian bank account. The name has to match your ID.", pane: "payouts", done: false },
    ],
    verifyLeft: 3,
    rows: {
      personal: [
        row("Legal name", name || NOT_PROVIDED, name ? "Edit" : "Add", name ? {} : { muted: true }),
        row("What guests call you", first || NOT_PROVIDED, first ? "Edit" : "Add", {
          ...(first ? {} : { muted: true }),
          help: "Your first name only is shown on listings and in the guest app.",
        }),
        todo("Phone number", NOT_PROVIDED, "Add", {
          help: "Booking requests reach you here on WhatsApp. Guests only see it 24 hours before an experience.",
        }),
        user?.email ? row("Email address", maskEmail(user.email), "Edit") : todo("Email address", NOT_PROVIDED, "Add"),
        todo("City", NOT_PROVIDED, "Add"),
        todo("Home address", NOT_PROVIDED, "Add", { help: "Never shown to guests. We only need it if you register a business later." }),
      ],
      public: [
        todo("Profile photo", "Not added yet", "Add"),
        todo("About you", "Not written yet", "Add"),
        todo("What you do", NOT_PROVIDED, "Add"),
        todo("Years doing this", NOT_PROVIDED, "Add"),
        todo("Languages", NOT_PROVIDED, "Add"),
        todo("Community tab", "No past experiences yet", "View"),
      ],
      verify: [
        row("Identity", "Not started", "Start", { chip: { text: "To do", kind: "In review" } }),
        row("Identity selfie", "Not started", "Start", { chip: { text: "To do", kind: "In review" } }),
        row("Bank account name", "Add a bank account first", "Add", { chip: { text: "To do", kind: "In review" } }),
        row("Registered business", "You host as an individual", "Set up", {
          chip: { text: "Not set up", kind: "Draft" },
          help: "A CAC number adds a Registered business badge, makes you eligible for company and agency bookings, and raises your payout limit. Nothing is taken away if you never do it.",
        }),
        todo("Certifications", "None on file", "Upload", {
          help: "Optional, and only relevant for water, fitness and food. When you have one it gets a badge on the listing.",
        }),
      ],
      payouts: [
        todo("Bank account", "No account added yet", "Add"),
        todo("Account name", "Shows once you add an account", "View"),
        row("Next payout", "Nothing to pay out yet", "See earnings", { link: "earnings" }),
        row("Commission", "15 percent of every booking, one rate, nothing else taken", "How this works", { link: "help" }),
      ],
      tax: [
        todo("TIN", NOT_PROVIDED, "Add"),
        row("VAT", "Not registered", "Edit", { help: "Only relevant once you turn over more than ₦25 million a year." }),
        todo("Who this paper is for", "A landlord, a visa application, or your accountant", "View"),
      ],
      security: [
        row("Password", "Change it whenever you like", "Change"),
        todo("Code sent to your phone when you sign in", "Off", "Turn on"),
        row("Where you are signed in", "This device", "See all"),
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
    statements: [{ year: "This year, so far", sub: "Nothing earned yet" }],
    documents: [
      { name: "National identity number", sub: "Not sent yet", checked: false, action: "Upload" },
      { name: "Identity selfie", sub: "Not sent yet", checked: false, action: "Upload" },
      { name: "Bank account", sub: "No account added yet", checked: false, action: "Add" },
      { name: "CAC certificate", sub: "You host as an individual, this is optional", checked: false, action: "Upload" },
    ],
    preview: {
      name: name || "Your name",
      line: "Your trade · Your city · hosting since this year",
      badges: [],
      bio: "A few lines about what you do will show here.",
      languages: "the languages you add",
    },
    closing: { upcoming: 0, guests: 0 },
  };
}
