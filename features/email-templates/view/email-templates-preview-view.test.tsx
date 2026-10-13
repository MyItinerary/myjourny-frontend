import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import {
  mockBookingCancelledEmail,
  mockBookingConfirmedEmail,
  mockEmailCatalog,
  mockPasswordResetEmail,
  mockPaymentConfirmedEmail,
  mockTodayReminderEmail,
  mockVerifyEmailEmail,
} from "./test-fixtures";
import type { EmailTemplatesViewModel } from "../view-model/use-email-templates-view-model";
import { EmailTemplatesPreviewView } from "./email-templates-preview-view";

function makeViewModel(overrides: Partial<EmailTemplatesViewModel> = {}): EmailTemplatesViewModel {
  return {
    activeTemplateId: "password-reset",
    viewMode: "preview",
    viewport: "desktop",
    catalog: mockEmailCatalog,
    copied: false,
    passwordResetData: mockPasswordResetEmail,
    bookingConfirmedData: mockBookingConfirmedEmail,
    todayReminderData: mockTodayReminderEmail,
    paymentConfirmedData: mockPaymentConfirmedEmail,
    bookingCancelledData: mockBookingCancelledEmail,
    verifyEmailData: mockVerifyEmailEmail,
    onSelectTemplate: vi.fn(),
    onSelectViewMode: vi.fn(),
    onSelectViewport: vi.fn(),
    onCopyHtml: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("EmailTemplatesPreviewView", () => {
  it("renders header and tabs for templates", () => {
    const vm = makeViewModel();
    renderWithProviders(<EmailTemplatesPreviewView {...vm} />);

    expect(screen.getByRole("heading", { name: "Email Templates" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Single Template" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View All 6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Password Reset" })).toBeInTheDocument();
  });

  it("handles template switching and view mode change", async () => {
    const onSelectTemplate = vi.fn();
    const onSelectViewMode = vi.fn();
    const vm = makeViewModel({ onSelectTemplate, onSelectViewMode });

    const { user } = renderWithProviders(<EmailTemplatesPreviewView {...vm} />);

    await user.click(screen.getByRole("button", { name: "Booking Confirmed" }));
    expect(onSelectTemplate).toHaveBeenCalledWith("booking-confirmed");

    await user.click(screen.getByRole("button", { name: "View All 6" }));
    expect(onSelectViewMode).toHaveBeenCalledWith("all");
  });

  it("handles copying template HTML", async () => {
    const onCopyHtml = vi.fn().mockResolvedValue(undefined);
    const vm = makeViewModel({ onCopyHtml });

    const { user } = renderWithProviders(<EmailTemplatesPreviewView {...vm} />);

    await user.click(screen.getByRole("button", { name: /Copy HTML/ }));
    expect(onCopyHtml).toHaveBeenCalled();
  });

  it("handles viewport switcher clicks", async () => {
    const onSelectViewport = vi.fn();
    const vm = makeViewModel({ onSelectViewport });

    const { user } = renderWithProviders(<EmailTemplatesPreviewView {...vm} />);

    await user.click(screen.getByLabelText("Mobile view"));
    expect(onSelectViewport).toHaveBeenCalledWith("mobile");

    await user.click(screen.getByLabelText("Desktop view"));
    expect(onSelectViewport).toHaveBeenCalledWith("desktop");
  });

  it("renders each template correctly when selected", () => {
    const templates = [
      { id: "booking-confirmed", expected: "Your next experience starts Saturday" },
      { id: "today-reminder", expected: "Today: Sunrise Kayaking, 6:00am" },
      { id: "payment-confirmed", expected: "You're all set for Tarkwa Bay" },
      { id: "booking-cancelled", expected: "This booking's been cancelled" },
      { id: "verify-email", expected: "Your journey starts here" },
    ] as const;

    for (const t of templates) {
      const vm = makeViewModel({ activeTemplateId: t.id });
      const { unmount } = renderWithProviders(<EmailTemplatesPreviewView {...vm} />);
      expect(screen.getByRole("heading", { name: t.expected })).toBeInTheDocument();
      unmount();
    }
  });

  it("renders all 6 templates when viewMode is 'all'", () => {
    const vm = makeViewModel({ viewMode: "all" });
    renderWithProviders(<EmailTemplatesPreviewView {...vm} />);

    expect(screen.getByRole("heading", { name: "All 6 Email Templates" })).toBeInTheDocument();
    expect(screen.getByText("Template 1 · Password Reset")).toBeInTheDocument();
    expect(screen.getByText("Template 2 · Booking Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Template 3 · Today's Experience")).toBeInTheDocument();
    expect(screen.getByText("Template 4 · Payment Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Template 5 · Booking Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Template 6 · Verify Your Email")).toBeInTheDocument();
  });
});
