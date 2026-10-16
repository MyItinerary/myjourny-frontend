import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { mockVerifyEmailEmail } from "./test-fixtures";
import { VerifyEmailView } from "./verify-email-view";

describe("VerifyEmailView", () => {
  it("renders verify heading, button and 24 hours expiry", () => {
    renderWithProviders(<VerifyEmailView data={mockVerifyEmailEmail} />);

    expect(screen.getByText("VERIFY YOUR EMAIL")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your journey starts here" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Verify email" })).toHaveAttribute(
      "href",
      mockVerifyEmailEmail.verifyUrl,
    );
    expect(screen.getByText(/24 hours/)).toBeInTheDocument();
  });

  it("renders discovery explanation and fallback link", () => {
    renderWithProviders(<VerifyEmailView data={mockVerifyEmailEmail} />);

    expect(screen.getByText(mockVerifyEmailEmail.discoveryNote)).toBeInTheDocument();
    expect(screen.getByText(mockVerifyEmailEmail.unrecognizedNote)).toBeInTheDocument();
  });
});
