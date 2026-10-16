export type EmailTemplateId =
  | "password-reset"
  | "booking-confirmed"
  | "today-reminder"
  | "payment-confirmed"
  | "booking-cancelled"
  | "verify-email";

export type EmailViewMode = "preview" | "code" | "all";
export type EmailViewport = "desktop" | "mobile";

export const EMAIL_LOGO_SRC = "/images/email-templates/3.png";
export const EMAIL_HERO_1_SRC = "/images/email-templates/1.png";
export const EMAIL_HERO_2_SRC = "/images/email-templates/2.png";
export const DEFAULT_HOST_AVATAR = "/images/home/why-book-with-us/Verified-hosts.jpg";

export interface EmailSocialLinks {
  tiktokUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export interface EmailTemplateShellProps {
  heroImageSrc: string;
  logoSrc?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  signOffPrefix?: string;
  signOffTeam?: string;
  socialLinks?: EmailSocialLinks;
  footerNotice: string;
  footerHelpEmail?: string;
  footerCopyright?: string;
  children: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
}

export interface PasswordResetEmailData {
  id: "password-reset";
  eyebrow: string;
  title: string;
  subtitle: string;
  resetUrl: string;
  buttonLabel: string;
  expiresInMinutes: number;
  securityNote: string;
  signOffPrefix: string;
  signOffTeam: string;
  footerNotice: string;
  helpEmail: string;
  copyright: string;
}

export interface HostInfo {
  name: string;
  avatarUrl: string;
  isVerified?: boolean;
}

export interface BookingConfirmedEmailData {
  id: "booking-confirmed";
  eyebrow: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  guestsCount: number;
  confirmationCode: string;
  ticketUrl: string;
  calendarUrl?: string;
  host: HostInfo;
  includedItems: string[];
  cancelUntilText: string;
  manageBookingUrl: string;
  explorerCountNote: string;
  signOffPrefix: string;
  signOffTeam: string;
  footerNotice: string;
  helpEmail: string;
  copyright: string;
}

export interface TodayReminderEmailData {
  id: "today-reminder";
  eyebrow: string;
  title: string;
  subtitle: string;
  timeAndDuration: string;
  meetingPoint: string;
  contactNote: string;
  contactPhone: string;
  bringNote: string;
  checkInCode: string;
  directionsUrl: string;
  locationName: string;
  locationState: string;
  host: HostInfo;
  includedItems: string[];
  whatsappNote: string;
  signOffPrefix: string;
  signOffTeam: string;
  footerNotice: string;
  helpEmail: string;
  copyright: string;
}

export interface PaymentConfirmedEmailData {
  id: "payment-confirmed";
  eyebrow: string;
  title: string;
  subtitle: string;
  totalChargedFormatted: string;
  experienceTitle: string;
  guestsBreakdown: string;
  itemPriceFormatted: string;
  totalPriceFormatted: string;
  paymentMethod: string;
  dateCharged: string;
  receiptNumber: string;
  checkInCode: string;
  downloadReceiptUrl: string;
  billingEmail: string;
  signOffPrefix?: string;
  signOffTeam: string;
  footerNotice: string;
  copyright: string;
}

export interface BookingCancelledEmailData {
  id: "booking-cancelled";
  eyebrow: string;
  title: string;
  subtitle: string;
  cancelledBy: string;
  refundAmountFormatted: string;
  refundStatus: string;
  policyNote: string;
  browsePrompt: string;
  browseUrl: string;
  billingEmail: string;
  bookingCode: string;
  signOffPrefix: string;
  signOffTeam: string;
  footerNotice: string;
  helpEmail: string;
  copyright: string;
}

export interface VerifyEmailEmailData {
  id: "verify-email";
  eyebrow: string;
  title: string;
  subtitle: string;
  verifyUrl: string;
  buttonLabel: string;
  expiresInHours: number;
  discoveryNote: string;
  unrecognizedNote: string;
  signOffPrefix: string;
  signOffTeam: string;
  footerNotice: string;
  helpEmail: string;
  copyright: string;
}

export interface EmailCatalogItem {
  id: EmailTemplateId;
  title: string;
  eyebrow: string;
  description: string;
  heroImageSrc: string;
}
