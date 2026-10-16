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
  escapeHtml,
  generateBookingCancelledEmailHtml,
  generateBookingConfirmedEmailHtml,
  generateEmailHtmlForTemplate,
  generatePasswordResetEmailHtml,
  generatePaymentConfirmedEmailHtml,
  generateTodayReminderEmailHtml,
  generateVerifyEmailHtml,
  sanitizeUrl,
} from "./email-templates-html";

const mockContext = {
  passwordResetData: DEFAULT_PASSWORD_RESET_EMAIL,
  bookingConfirmedData: DEFAULT_BOOKING_CONFIRMED_EMAIL,
  todayReminderData: DEFAULT_TODAY_REMINDER_EMAIL,
  paymentConfirmedData: DEFAULT_PAYMENT_CONFIRMED_EMAIL,
  bookingCancelledData: DEFAULT_BOOKING_CANCELLED_EMAIL,
  verifyEmailData: DEFAULT_VERIFY_EMAIL_EMAIL,
};

describe("email-templates-html security helpers", () => {
  it("escapes syntactic HTML characters <, >, \", ', and &", () => {
    expect(escapeHtml('Tarkwa & Bay <"Sunset">')).toBe("Tarkwa &amp; Bay &lt;&quot;Sunset&quot;&gt;");
    expect(escapeHtml("it's a test")).toBe("it&#39;s a test");
    expect(escapeHtml(123)).toBe("123");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("sanitizes URLs to only allow https: and mailto: schemes", () => {
    expect(sanitizeUrl("https://myjourny.app/reset?token=xyz")).toBe(
      "https://myjourny.app/reset?token=xyz",
    );
    expect(sanitizeUrl("mailto:support@myjourny.app")).toBe("mailto:support@myjourny.app");
    expect(sanitizeUrl("javascript:alert(document.cookie)")).toBe("#");
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(sanitizeUrl("http://insecure.com")).toBe("#");
    expect(sanitizeUrl("")).toBe("#");
    expect(sanitizeUrl(null)).toBe("#");
    expect(sanitizeUrl(undefined)).toBe("#");
  });
});

describe("email-templates-html injection prevention", () => {
  it("escapes user-controlled text and prevents attribute injection with <, \", and &", () => {
    const maliciousPasswordReset = {
      ...DEFAULT_PASSWORD_RESET_EMAIL,
      title: 'Reset <script>alert("xss")</script> & continue',
      subtitle: 'Click "here" <now> & enjoy',
      buttonLabel: 'Click <me> & "test"',
      securityNote: 'Safety & "Privacy" <note>',
      resetUrl: 'javascript:alert("hacked")',
    };

    const html = generatePasswordResetEmailHtml(maliciousPasswordReset);

    // Raw script tags and angle brackets must not appear in the generated HTML
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain("Reset &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; continue");
    expect(html).toContain("Click &quot;here&quot; &lt;now&gt; &amp; enjoy");
    expect(html).toContain("Click &lt;me&gt; &amp; &quot;test&quot;");
    expect(html).toContain("Safety &amp; &quot;Privacy&quot; &lt;note&gt;");

    // Malicious URL must be replaced with '#' rather than rendered into href
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('href="#"');
  });

  it("escapes items, dates, and names with <, \", and & in booking confirmed", () => {
    const maliciousBooking = {
      ...DEFAULT_BOOKING_CONFIRMED_EMAIL,
      date: 'Sat & "Sun" <Weekend>',
      host: {
        name: 'Tunde & "Partner" <Guide>',
        avatarUrl: "/avatar.png",
        isVerified: true,
      },
      includedItems: ['Boat & "Paddles" <Gear>', "Snacks"],
      ticketUrl: 'javascript:alert("pwned")',
    };

    const html = generateBookingConfirmedEmailHtml(maliciousBooking);

    expect(html).toContain("Sat &amp; &quot;Sun&quot; &lt;Weekend&gt;");
    expect(html).toContain("Hosted by Tunde &amp; &quot;Partner&quot; &lt;Guide&gt;");
    expect(html).toContain("Boat &amp; &quot;Paddles&quot; &lt;Gear&gt;");
    expect(html).not.toContain('href="javascript:');
  });
});

describe("email-templates-html template generation and parity", () => {
  it("generates complete HTML for password reset with key content matching data", () => {
    const html = generatePasswordResetEmailHtml(DEFAULT_PASSWORD_RESET_EMAIL);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.title));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.eyebrow));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.subtitle));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.buttonLabel));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.resetUrl));
    expect(html).toContain(`${DEFAULT_PASSWORD_RESET_EMAIL.expiresInMinutes} minutes`);
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.securityNote));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.signOffPrefix));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.signOffTeam));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.footerNotice));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.helpEmail));
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.copyright));
    expect(html).toContain("max-width:600px");
  });

  it("generates complete HTML for booking confirmed with key content matching data", () => {
    const html = generateBookingConfirmedEmailHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL);

    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.title));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.eyebrow));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.subtitle));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.date));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.time));
    expect(html).toContain(String(DEFAULT_BOOKING_CONFIRMED_EMAIL.guestsCount));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.confirmationCode));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.ticketUrl));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.cancelUntilText));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.host.name));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CONFIRMED_EMAIL.manageBookingUrl));
    for (const item of DEFAULT_BOOKING_CONFIRMED_EMAIL.includedItems) {
      expect(html).toContain(escapeHtml(item));
    }
  });

  it("generates complete HTML for today reminder with key content matching data", () => {
    const html = generateTodayReminderEmailHtml(DEFAULT_TODAY_REMINDER_EMAIL);

    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.title));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.eyebrow));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.subtitle));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.checkInCode));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.directionsUrl));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.contactPhone));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.meetingPoint));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.locationName));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.locationState));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.host.name));
    expect(html).toContain(escapeHtml(DEFAULT_TODAY_REMINDER_EMAIL.whatsappNote));
  });

  it("generates complete HTML for payment confirmed with key content matching data", () => {
    const html = generatePaymentConfirmedEmailHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL);

    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.title));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.totalChargedFormatted));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.experienceTitle));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.guestsBreakdown));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.itemPriceFormatted));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.totalPriceFormatted));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.paymentMethod));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.dateCharged));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.receiptNumber));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.checkInCode));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.downloadReceiptUrl));
    expect(html).toContain(escapeHtml(DEFAULT_PAYMENT_CONFIRMED_EMAIL.billingEmail));
  });

  it("generates complete HTML for booking cancelled with key content matching data", () => {
    const html = generateBookingCancelledEmailHtml(DEFAULT_BOOKING_CANCELLED_EMAIL);

    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.title));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.cancelledBy));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.refundAmountFormatted));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.refundStatus));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.policyNote));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.browsePrompt));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.browseUrl));
    expect(html).toContain(escapeHtml(DEFAULT_BOOKING_CANCELLED_EMAIL.billingEmail));
  });

  it("generates complete HTML for verify email with key content matching data", () => {
    const html = generateVerifyEmailHtml(DEFAULT_VERIFY_EMAIL_EMAIL);

    expect(html).toContain(escapeHtml(DEFAULT_VERIFY_EMAIL_EMAIL.title));
    expect(html).toContain(escapeHtml(DEFAULT_VERIFY_EMAIL_EMAIL.verifyUrl));
    expect(html).toContain(`${DEFAULT_VERIFY_EMAIL_EMAIL.expiresInHours} hours`);
    expect(html).toContain(escapeHtml(DEFAULT_VERIFY_EMAIL_EMAIL.buttonLabel));
    expect(html).toContain(escapeHtml(DEFAULT_VERIFY_EMAIL_EMAIL.discoveryNote));
    expect(html).toContain(escapeHtml(DEFAULT_VERIFY_EMAIL_EMAIL.unrecognizedNote));
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
    expect(html).toContain(escapeHtml(DEFAULT_PASSWORD_RESET_EMAIL.title));
  });
});
