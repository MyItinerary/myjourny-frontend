import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EmailTemplateShellView } from "./email-template-shell-view";

describe("EmailTemplateShellView", () => {
  const defaultProps = {
    heroImageSrc: "/images/email-templates/1.png",
    logoSrc: "/images/email-templates/3.png",
    eyebrow: "SECURITY",
    title: "Test Heading",
    subtitle: "Test Subtitle message",
    signOffPrefix: "Take care,",
    signOffTeam: "The Team",
    footerNotice: "Automated test message.",
    footerHelpEmail: "help@test.com",
    footerCopyright: "© 2026 Test Co",
  };

  it("renders heading, eyebrow, subtitle, and children", () => {
    renderWithProviders(
      <EmailTemplateShellView {...defaultProps}>
        <div data-testid="child-content">Email specific content</div>
      </EmailTemplateShellView>,
    );

    expect(screen.getByText("SECURITY")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Test Heading" })).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle message")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders footer notice and help email link", () => {
    renderWithProviders(
      <EmailTemplateShellView {...defaultProps}>
        <div>Body</div>
      </EmailTemplateShellView>,
    );

    expect(screen.getByText("Automated test message.")).toBeInTheDocument();
    expect(screen.getByText("help@test.com")).toBeInTheDocument();
  });
});
