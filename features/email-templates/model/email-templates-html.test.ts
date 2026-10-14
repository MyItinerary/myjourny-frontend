import { describe, expect, it } from "vitest";

import {
  DEFAULT_BOOKING_CANCELLED_EMAIL,
  DEFAULT_BOOKING_CONFIRMED_EMAIL,
  DEFAULT_PASSWORD_RESET_EMAIL,
  DEFAULT_PAYMENT_CONFIRMED_EMAIL,
  DEFAULT_TODAY_REMINDER_EMAIL,
  DEFAULT_VERIFY_EMAIL_EMAIL,
} from "./email-templates-data";
import {
  generateBookingCancelledEmailHtml,
  generateBookingConfirmedEmailHtml,
  generateEmailHtmlForTemplate,
  generatePasswordResetEmailHtml,
  generatePaymentConfirmedEmailHtml,
  generateTodayReminderEmailHtml,
  generateVerifyEmailHtml,
} from "./email-templates-html";

const mockContext = {
  passwordResetData: DEFAULT_PASSWORD_RESET_EMAIL,
  bookingConfirmedData: DEFAULT_BOOKING_CONFIRMED_EMAIL,
  todayReminderData: DEFAULT_TODAY_REMINDER_EMAIL,
  paymentConfirmedData: DEFAULT_PAYMENT_CONFIRMED_EMAIL,
  bookingCancelledData: DEFAULT_BOOKING_CANCELLED_EMAIL,
  verifyEmailData: DEFAULT_VERIFY_EMAIL_EMAIL,
};

describe("email-templates-html", () => {
  it("generates complete HTML for password reset", () => {
    const html = generatePasswordResetEmailHtml(DEFAULT_PASSWORD_RESET_EMAIL);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain(DEFAULT_PASSWORD_RESET_EMAIL.title);
    expect(html).toContain(DEFAULT_PASSWORD_RESET_EMAIL.buttonLabel);
    expect(html).toContain(DEFAULT_PASSWORD_RESET_EMAIL.resetUrl);
    expect(html).toContain(`${DEFAULT_PASSWORD_RESET_EMAIL.expiresInMinutes} minutes`);
    expect(html).toContain(DEFAULT_PASSWORD_RESET_EMAIL.securityNote);
    expect(html).toContain("max-width:600px");
  });

  it("generates complete HTML for booking confirmed", () => {
    const html = generateBookingConfirmedEmailHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL);

    expect(html).toContain(DEFAULT_BOOKING_CONFIRMED_EMAIL.title);
    expect(html).toContain(DEFAULT_BOOKING_CONFIRMED_EMAIL.date);
    expect(html).toContain(DEFAULT_BOOKING_CONFIRMED_EMAIL.confirmationCode);
    expect(html).toContain(DEFAULT_BOOKING_CONFIRMED_EMAIL.ticketUrl);
    expect(html).toContain(DEFAULT_BOOKING_CONFIRMED_EMAIL.cancelUntilText);
    expect(html).toContain(DEFAULT_BOOKING_CONFIRMED_EMAIL.host.name);
  });

  it("generates complete HTML for today reminder", () => {
    const html = generateTodayReminderEmailHtml(DEFAULT_TODAY_REMINDER_EMAIL);

    expect(html).toContain(DEFAULT_TODAY_REMINDER_EMAIL.title);
    expect(html).toContain(DEFAULT_TODAY_REMINDER_EMAIL.checkInCode);
    expect(html).toContain(DEFAULT_TODAY_REMINDER_EMAIL.directionsUrl);
    expect(html).toContain(DEFAULT_TODAY_REMINDER_EMAIL.contactPhone);
    expect(html).toContain(DEFAULT_TODAY_REMINDER_EMAIL.meetingPoint);
  });

  it("generates complete HTML for payment confirmed", () => {
    const html = generatePaymentConfirmedEmailHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL);

    expect(html).toContain(DEFAULT_PAYMENT_CONFIRMED_EMAIL.title);
    expect(html).toContain(DEFAULT_PAYMENT_CONFIRMED_EMAIL.totalChargedFormatted);
    expect(html).toContain(DEFAULT_PAYMENT_CONFIRMED_EMAIL.receiptNumber);
    expect(html).toContain(DEFAULT_PAYMENT_CONFIRMED_EMAIL.downloadReceiptUrl);
    expect(html).toContain(DEFAULT_PAYMENT_CONFIRMED_EMAIL.billingEmail);
  });

  it("generates complete HTML for booking cancelled", () => {
    const html = generateBookingCancelledEmailHtml(DEFAULT_BOOKING_CANCELLED_EMAIL);

    expect(html).toContain(DEFAULT_BOOKING_CANCELLED_EMAIL.title);
    expect(html).toContain(DEFAULT_BOOKING_CANCELLED_EMAIL.refundAmountFormatted);
    expect(html).toContain(DEFAULT_BOOKING_CANCELLED_EMAIL.refundStatus);
    expect(html).toContain(DEFAULT_BOOKING_CANCELLED_EMAIL.browseUrl);
  });

  it("generates complete HTML for verify email", () => {
    const html = generateVerifyEmailHtml(DEFAULT_VERIFY_EMAIL_EMAIL);

    expect(html).toContain(DEFAULT_VERIFY_EMAIL_EMAIL.title);
    expect(html).toContain(DEFAULT_VERIFY_EMAIL_EMAIL.verifyUrl);
    expect(html).toContain(`${DEFAULT_VERIFY_EMAIL_EMAIL.expiresInHours} hours`);
    expect(html).toContain(DEFAULT_VERIFY_EMAIL_EMAIL.buttonLabel);
  });

  it("generates HTML for each template id via generateEmailHtmlForTemplate", () => {
    const templates = [
      "password-reset",
      "booking-confirmed",
      "today-reminder",
      "payment-confirmed",
      "booking-cancelled",
      "verify-email",
    ] as const;

    for (const id of templates) {
      const html = generateEmailHtmlForTemplate(id, mockContext);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("max-width:600px");
    }
  });

  it("defaults to password reset when unknown id is passed", () => {
    // @ts-expect-error Testing fallback for unknown id
    const html = generateEmailHtmlForTemplate("unknown-id", mockContext);
    expect(html).toContain(DEFAULT_PASSWORD_RESET_EMAIL.title);
  });
});
