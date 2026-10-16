import { describe, expect, it } from "vitest";

import {
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
} from "./email-templates-data";

describe("email-templates-data model", () => {
  it("provides correct image paths for email backgrounds and logo", () => {
    expect(EMAIL_LOGO_SRC).toBe("/images/email-templates/3.png");
    expect(EMAIL_HERO_1_SRC).toBe("/images/email-templates/1.png");
    expect(EMAIL_HERO_2_SRC).toBe("/images/email-templates/2.png");
  });

  it("defines catalog containing all 6 templates", () => {
    expect(EMAIL_TEMPLATES_CATALOG).toHaveLength(6);
    const ids = EMAIL_TEMPLATES_CATALOG.map((item) => item.id);
    expect(ids).toContain("password-reset");
    expect(ids).toContain("booking-confirmed");
    expect(ids).toContain("today-reminder");
    expect(ids).toContain("payment-confirmed");
    expect(ids).toContain("booking-cancelled");
    expect(ids).toContain("verify-email");
  });

  it("has valid default data for password reset template", () => {
    expect(DEFAULT_PASSWORD_RESET_EMAIL.id).toBe("password-reset");
    expect(DEFAULT_PASSWORD_RESET_EMAIL.eyebrow).toBe("PASSWORD RESET");
    expect(DEFAULT_PASSWORD_RESET_EMAIL.buttonLabel).toBe("Reset password");
    expect(DEFAULT_PASSWORD_RESET_EMAIL.expiresInMinutes).toBe(30);
  });

  it("has valid default data for booking confirmed template", () => {
    expect(DEFAULT_BOOKING_CONFIRMED_EMAIL.id).toBe("booking-confirmed");
    expect(DEFAULT_BOOKING_CONFIRMED_EMAIL.eyebrow).toBe("BOOKING CONFIRMED");
    expect(DEFAULT_BOOKING_CONFIRMED_EMAIL.confirmationCode).toBe("MJ-84213");
    expect(DEFAULT_BOOKING_CONFIRMED_EMAIL.includedItems.length).toBeGreaterThan(0);
  });

  it("has valid default data for today reminder template", () => {
    expect(DEFAULT_TODAY_REMINDER_EMAIL.id).toBe("today-reminder");
    expect(DEFAULT_TODAY_REMINDER_EMAIL.eyebrow).toBe("TODAY");
    expect(DEFAULT_TODAY_REMINDER_EMAIL.checkInCode).toBe("MJ-84213");
    expect(DEFAULT_TODAY_REMINDER_EMAIL.locationName).toBe("Tarkwa Bay");
  });

  it("has valid default data for payment confirmed template", () => {
    expect(DEFAULT_PAYMENT_CONFIRMED_EMAIL.id).toBe("payment-confirmed");
    expect(DEFAULT_PAYMENT_CONFIRMED_EMAIL.eyebrow).toBe("PAYMENT CONFIRMED");
    expect(DEFAULT_PAYMENT_CONFIRMED_EMAIL.totalChargedFormatted).toBe("₦32,000");
  });

  it("has valid default data for booking cancelled template", () => {
    expect(DEFAULT_BOOKING_CANCELLED_EMAIL.id).toBe("booking-cancelled");
    expect(DEFAULT_BOOKING_CANCELLED_EMAIL.eyebrow).toBe("BOOKING CANCELLED");
    expect(DEFAULT_BOOKING_CANCELLED_EMAIL.refundAmountFormatted).toBe("₦5,000");
  });

  it("has valid default data for verify email template", () => {
    expect(DEFAULT_VERIFY_EMAIL_EMAIL.id).toBe("verify-email");
    expect(DEFAULT_VERIFY_EMAIL_EMAIL.eyebrow).toBe("VERIFY YOUR EMAIL");
    expect(DEFAULT_VERIFY_EMAIL_EMAIL.expiresInHours).toBe(24);
  });
});
