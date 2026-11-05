import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TermsData } from "../model/terms.types";
import { CookieView } from "./cookie-view";

const mockCookieData: TermsData = {
  title: "Cookie Policy",
  lastUpdated: "[DATE]",
  companyAgreementText: "",
  agreementNoticeText: "",
  tableOfContents: [
    { id: "section-1", label: "1. What this policy covers" },
    { id: "section-3", label: "3. The four kinds we use" },
    { id: "section-6", label: "6. Your choices" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. What this policy covers",
      items: [
        {
          text: "This policy explains how MyJourny uses cookies.",
        },
      ],
    },
    {
      id: "section-3",
      number: "3.",
      title: "3. The four kinds we use",
      items: [],
      table: {
        headers: ["Type", "What it does", "Can I turn it off?"],
        rows: [["Strictly necessary", "Keeps you signed in", "No"]],
      },
    },
    {
      id: "section-6",
      number: "6.",
      title: "6. Your choices",
      items: [],
      actionCard: {
        label: "See or change what you've agreed to.",
        buttonText: "Manage cookie preferences",
      },
    },
  ],
  readNext: {
    title: "Read next",
    items: [
      {
        eyebrow: "YOUR PRIVACY",
        title: "Privacy Policy",
        description: "What we collect.",
        href: "/legal/privacy",
      },
    ],
  },
  documentQuestions: {
    text: "Questions about this document? Email dpo@myjourny.com.",
    previousVersionsText: "Previous versions",
    previousVersionsHref: "#",
  },
};

describe("CookieView", () => {
  const defaultProps = {
    data: mockCookieData,
    activeSectionId: "section-1",
    backHref: "/legal",
    backLabel: "All legal documents",
    onSectionSelect: vi.fn(),
    onManagePreferences: vi.fn(),
    isPreferencesOpen: false,
    preferences: {
      strictlyNecessary: true,
      preferences: true,
      analytics: false,
      personalisation: false,
    },
    openPreferences: vi.fn(),
    closePreferences: vi.fn(),
    onTogglePreference: vi.fn(),
    onAcceptAll: vi.fn(),
    onRejectNonEssential: vi.fn(),
    onSavePreferences: vi.fn(),
  };

  it("renders page title, last updated, and sections", () => {
    render(<CookieView {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Cookie Policy", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("[DATE]")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "1. What this policy covers", level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("This policy explains how MyJourny uses cookies.")).toBeInTheDocument();
  });

  it("renders table and action card button", () => {
    render(<CookieView {...defaultProps} />);

    expect(screen.getByText("Strictly necessary")).toBeInTheDocument();
    expect(screen.getByText("Keeps you signed in")).toBeInTheDocument();

    const manageBtn = screen.getByRole("button", { name: "Manage cookie preferences" });
    expect(manageBtn).toBeInTheDocument();
    fireEvent.click(manageBtn);
    expect(defaultProps.onManagePreferences).toHaveBeenCalledTimes(1);
  });

  it("renders preferences dialog when isPreferencesOpen is true", () => {
    render(<CookieView {...defaultProps} isPreferencesOpen={true} />);

    expect(screen.getByRole("dialog", { name: "Cookie preferences" })).toBeInTheDocument();
  });

  it("renders Read next cards and questions footer", () => {
    render(<CookieView {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Read next", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("YOUR PRIVACY")).toBeInTheDocument();
    expect(screen.getByText(/Questions about this document\?/)).toBeInTheDocument();
  });
});
