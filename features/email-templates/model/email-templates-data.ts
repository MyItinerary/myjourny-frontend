import type {
  BookingCancelledEmailData,
  BookingConfirmedEmailData,
  EmailCatalogItem,
  PasswordResetEmailData,
  PaymentConfirmedEmailData,
  TodayReminderEmailData,
  VerifyEmailEmailData,
} from "./email-templates.types";

export const EMAIL_LOGO_SRC = "/images/email-templates/3.png";
export const EMAIL_HERO_1_SRC = "/images/email-templates/1.png";
export const EMAIL_HERO_2_SRC = "/images/email-templates/2.png";

export const DEFAULT_HOST_AVATAR = "/images/home/why-book-with-us/Verified-hosts.jpg";

export const DEFAULT_PASSWORD_RESET_EMAIL: PasswordResetEmailData = {
  id: "password-reset",
  eyebrow: "PASSWORD RESET",
  title: "Let's get you back in",
  subtitle:
    "Happens to the best of us. Here's your code to set a new password and get back to discovering:",
  resetUrl: "https://myjourny.app/reset?t=9k2mxa71",
  buttonLabel: "Reset password",
  expiresInMinutes: 30,
  securityNote:
    "Wasn't you? No action needed, your password stays exactly as it is unless this code gets used.",
  signOffPrefix: "See you out there.",
  signOffTeam: "From MyJourny",
  footerNotice: "This is an automated security message, replies to this address aren't monitored.",
  helpEmail: "support@myjourny.app",
  copyright: "© 2026 MyJourny Ltd. Lagos, Nigeria.",
};

export const DEFAULT_BOOKING_CONFIRMED_EMAIL: BookingConfirmedEmailData = {
  id: "booking-confirmed",
  eyebrow: "BOOKING CONFIRMED",
  title: "Your next experience starts Saturday",
  subtitle:
    "Sunrise Kayaking at Tarkwa Bay is locked in. Here's everything you need for the day.",
  date: "Sat, 24 August",
  time: "6:00 AM · 2.5 hrs",
  guestsCount: 2,
  confirmationCode: "MJ-84213",
  ticketUrl: "https://myjourny.app/bookings/MJ-84213",
  calendarUrl: "https://myjourny.app/bookings/MJ-84213/calendar",
  host: {
    name: "Kayak Thrills",
    avatarUrl: DEFAULT_HOST_AVATAR,
    isVerified: true,
  },
  includedItems: [
    "Kayak, paddle & life jacket.",
    "Safety briefing",
    "Fresh coconut water",
  ],
  cancelUntilText: "Sat, 1 August, 6:00 AM",
  manageBookingUrl: "https://myjourny.app/bookings/MJ-84213/manage",
  explorerCountNote: "6 other explorers are joining this sunrise. See you on the water.",
  signOffPrefix: "Go make a story,",
  signOffTeam: "MyJourny team",
  footerNotice: "This confirms your booking, keep it for your records.",
  helpEmail: "support@myjourny.app",
  copyright: "© 2026 MyJourny Ltd. Lagos, Nigeria.",
};

export const DEFAULT_TODAY_REMINDER_EMAIL: TodayReminderEmailData = {
  id: "today-reminder",
  eyebrow: "TODAY",
  title: "Today: Sunrise Kayaking, 6:00am",
  subtitle: "Everything for this morning, in one place.",
  timeAndDuration: "6:00am, 2.5 hours",
  meetingPoint: "Tarkwa Bay Jetty, look for the blue boathouse.",
  contactNote: "Kayak is in a green vest · ",
  contactPhone: "0803 000 0000",
  bringNote: "Bring: swimwear or clothes you don't mind getting wet, sunscreen.",
  checkInCode: "MJ-84213",
  directionsUrl: "https://myjourny.app/bookings/MJ-84213/directions",
  locationName: "Tarkwa Bay",
  locationState: "Lagos state",
  host: {
    name: "Kayak Thrills",
    avatarUrl: DEFAULT_HOST_AVATAR,
    isVerified: true,
  },
  includedItems: [
    "Kayak, paddle & life jacket.",
    "Safety briefing",
    "Fresh coconut water",
  ],
  whatsappNote: "Running behind? Message Tobi on WhatsApp, he's expecting you and would rather know.",
  signOffPrefix: "See you at the jetty,",
  signOffTeam: "MyJourny team",
  footerNotice: "This is a copy of what's already in your MyJourny app and WhatsApp.",
  helpEmail: "support@myjourny.app",
  copyright: "© 2026 MyJourny Ltd. Lagos, Nigeria.",
};

export const DEFAULT_PAYMENT_CONFIRMED_EMAIL: PaymentConfirmedEmailData = {
  id: "payment-confirmed",
  eyebrow: "PAYMENT CONFIRMED",
  title: "You're all set for Tarkwa Bay",
  subtitle:
    "Your payment for Sunrise Kayaking at Tarkwa Bay has gone through. Here's your receipt.",
  totalChargedFormatted: "₦32,000",
  experienceTitle: "Sunrise Kayaking at Tarkwa Bay",
  guestsBreakdown: "₦16,000 × 2 guests",
  itemPriceFormatted: "₦32,000",
  totalPriceFormatted: "₦32,000",
  paymentMethod: "Verve •••• 4821",
  dateCharged: "Fri, 1 August 2026",
  receiptNumber: "RCP-260801-4213",
  checkInCode: "MJ-84213",
  downloadReceiptUrl: "https://myjourny.app/receipts/RCP-260801-4213",
  billingEmail: "billing@myjourny.app",
  signOffTeam: "MyJourny team",
  footerNotice:
    "Keep this receipt for your records, it may be used for expense or tax purposes. MyJourny Ltd is the merchant of record for this transaction.",
  copyright: "© 2026 MyJourny Ltd. Lagos, Nigeria.",
};

export const DEFAULT_BOOKING_CANCELLED_EMAIL: BookingCancelledEmailData = {
  id: "booking-cancelled",
  eyebrow: "BOOKING CANCELLED",
  title: "This booking's been cancelled",
  subtitle:
    "Dawn Yoga at Millennium Park on Sat, 14 February is no longer happening. Here's what that means for your refund.",
  cancelledBy: "You, 3 days ago",
  refundAmountFormatted: "₦5,000",
  refundStatus: "Arrived Feb 12 · Bank transfer",
  policyNote:
    "You cancelled within the free window, so the full amount was returned automatically, no action needed on your end.",
  browsePrompt: "Your city's still full of things to do when you're ready",
  browseUrl: "https://myjourny.app/experiences",
  billingEmail: "billing@myjourny.app",
  bookingCode: "MJ-10552",
  signOffPrefix: "Until next time,",
  signOffTeam: "MyJourny Team",
  footerNotice: "This confirms the cancellation of booking MJ-10552.",
  helpEmail: "support@myjourny.app",
  copyright: "© 2026 MyJourny Ltd. Lagos, Nigeria.",
};

export const DEFAULT_VERIFY_EMAIL_EMAIL: VerifyEmailEmailData = {
  id: "verify-email",
  eyebrow: "VERIFY YOUR EMAIL",
  title: "Your journey starts here",
  subtitle: "One quick step before you start exploring, confirm this is your email address.",
  verifyUrl: "https://myjourny.app/reset?t=9k2mxa71",
  buttonLabel: "Verify email",
  expiresInHours: 24,
  discoveryNote:
    "Once verified, you'll be ready to browse and book real experiences in Lagos and Abuja, hosted by people who actually live there.",
  unrecognizedNote: "Didn't create a MyJourny account? You can safely ignore this email.",
  signOffPrefix: "Can't wait to see where you go,",
  signOffTeam: "The MyJourny Team",
  footerNotice: "This is an automated message, replies to this address aren't monitored.",
  helpEmail: "support@myjourny.app",
  copyright: "© 2026 MyJourny Ltd. Lagos, Nigeria.",
};

export const EMAIL_TEMPLATES_CATALOG: EmailCatalogItem[] = [
  {
    id: "password-reset",
    title: "Password Reset",
    eyebrow: "Security",
    description: "One-time password reset code and secure magic link",
    heroImageSrc: EMAIL_HERO_1_SRC,
  },
  {
    id: "booking-confirmed",
    title: "Booking Confirmed",
    eyebrow: "Bookings",
    description: "Confirmation with date, time, host info and inclusions",
    heroImageSrc: EMAIL_HERO_2_SRC,
  },
  {
    id: "today-reminder",
    title: "Today's Experience",
    eyebrow: "Schedule",
    description: "Morning reminder with check-in code, meeting point and map",
    heroImageSrc: EMAIL_HERO_2_SRC,
  },
  {
    id: "payment-confirmed",
    title: "Payment Confirmed",
    eyebrow: "Billing",
    description: "Payment receipt with charge summary and card details",
    heroImageSrc: EMAIL_HERO_1_SRC,
  },
  {
    id: "booking-cancelled",
    title: "Booking Cancelled",
    eyebrow: "Refunds",
    description: "Cancellation status, refund amount and browse CTA",
    heroImageSrc: EMAIL_HERO_1_SRC,
  },
  {
    id: "verify-email",
    title: "Verify Your Email",
    eyebrow: "Onboarding",
    description: "Welcome email verification to activate traveller account",
    heroImageSrc: EMAIL_HERO_1_SRC,
  },
];
