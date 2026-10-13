// Public API of the email-templates feature. Outside code imports only from here.

export type {
  BookingCancelledEmailData,
  BookingConfirmedEmailData,
  EmailCatalogItem,
  EmailSocialLinks,
  EmailTemplateId,
  EmailTemplateShellProps,
  EmailViewMode,
  EmailViewport,
  HostInfo,
  PasswordResetEmailData,
  PaymentConfirmedEmailData,
  TodayReminderEmailData,
  VerifyEmailEmailData,
} from "./model/email-templates.types";

export {
  DEFAULT_BOOKING_CANCELLED_EMAIL,
  DEFAULT_BOOKING_CONFIRMED_EMAIL,
  DEFAULT_PASSWORD_RESET_EMAIL,
  DEFAULT_PAYMENT_CONFIRMED_EMAIL,
  DEFAULT_TODAY_REMINDER_EMAIL,
  DEFAULT_VERIFY_EMAIL_EMAIL,
  EMAIL_HERO_1_SRC,
  EMAIL_HERO_2_SRC,
  EMAIL_LOGO_SRC,
  EMAIL_TEMPLATES_CATALOG,
} from "./model/email-templates-data";

export type {
  EmailTemplatesViewModel,
  UseEmailTemplatesViewModelProps,
} from "./view-model/use-email-templates-view-model";
export { useEmailTemplatesViewModel } from "./view-model/use-email-templates-view-model";

export { EmailTemplateShellView } from "./view/email-template-shell-view";
export { PasswordResetEmailView } from "./view/password-reset-email-view";
export { BookingConfirmedEmailView } from "./view/booking-confirmed-email-view";
export { TodayReminderEmailView } from "./view/today-reminder-email-view";
export { PaymentConfirmedEmailView } from "./view/payment-confirmed-email-view";
export { BookingCancelledEmailView } from "./view/booking-cancelled-email-view";
export { VerifyEmailView } from "./view/verify-email-view";
export { EmailTemplatesPreviewView } from "./view/email-templates-preview-view";
