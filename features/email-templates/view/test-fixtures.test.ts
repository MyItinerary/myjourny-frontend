import { describe, expect, it } from "vitest";

import {
  mockBookingCancelledEmail,
  mockBookingConfirmedEmail,
  mockEmailCatalog,
  mockPasswordResetEmail,
  mockPaymentConfirmedEmail,
  mockTodayReminderEmail,
  mockVerifyEmailEmail,
} from "./test-fixtures";

describe("test-fixtures", () => {
  it("provides valid mock data for all 6 email templates", () => {
    expect(mockPasswordResetEmail.id).toBe("password-reset");
    expect(mockBookingConfirmedEmail.id).toBe("booking-confirmed");
    expect(mockTodayReminderEmail.id).toBe("today-reminder");
    expect(mockPaymentConfirmedEmail.id).toBe("payment-confirmed");
    expect(mockBookingCancelledEmail.id).toBe("booking-cancelled");
    expect(mockVerifyEmailEmail.id).toBe("verify-email");
    expect(mockEmailCatalog).toHaveLength(6);
  });
});
