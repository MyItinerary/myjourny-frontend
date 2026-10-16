import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { PasswordResetEmailView } from "./password-reset-email-view";
import { mockPasswordResetEmail } from "./test-fixtures";

describe("PasswordResetEmailView", () => {
  it("renders title, reset button and expiry notice", () => {
    renderWithProviders(<PasswordResetEmailView data={mockPasswordResetEmail} />);

    expect(screen.getByText("PASSWORD RESET")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Let's get you back in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reset password" })).toHaveAttribute(
      "href",
      mockPasswordResetEmail.resetUrl,
    );
    expect(screen.getByText(/30 minutes/)).toBeInTheDocument();
  });

  it("renders fallback URL and security note", () => {
    renderWithProviders(<PasswordResetEmailView data={mockPasswordResetEmail} />);

    expect(screen.getByText(mockPasswordResetEmail.securityNote)).toBeInTheDocument();
    expect(screen.getByText(/Button not working\? Paste this into your browser/)).toBeInTheDocument();
  });
});
