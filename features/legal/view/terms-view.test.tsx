import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TermsData } from "../model/terms.types";
import { TermsView } from "./terms-view";

const mockTermsData: TermsData = {
  title: "Terms of Use",
  lastUpdated: "[DATE]",
  companyAgreementText: "These terms are an agreement between you and [COMPANY LEGAL NAME].",
  agreementNoticeText: "By creating an account or making a booking, you agree to these terms.",
  shortVersion: {
    title: "The short version",
    disclaimer: "This summary is for convenience. The full terms below are what apply.",
    items: [
      {
        id: "short-1",
        text: "MyJourny is a marketplace. Hosts run the experiences.",
      },
    ],
  },
  tableOfContents: [
    { id: "short-version", label: "The short version" },
    { id: "section-1", label: "1. What MyJourny is, and what it is not" },
    { id: "section-2", label: "2. Your account" },
    { id: "section-11", label: "11. Acceptable use" },
    { id: "part-b", label: "PART II: EVENTS AND TICKETS", isPartHeading: true },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. What MyJourny is, and what it is not",
      items: [
        {
          number: "1.1",
          text: "MyJourny is an online marketplace.",
        },
        {
          number: "1.2",
          boldPrefix: "The host is the seller.",
          text: "When you book, the agreement is with the host.",
        },
      ],
    },
    {
      id: "section-2",
      number: "2.",
      title: "2. Your account",
      items: [
        {
          number: "2.1",
          boldPrefix: "Instant booking.",
          text: "You must be at least 18.",
        },
      ],
    },
    {
      id: "section-11",
      number: "11.",
      title: "11. Acceptable use",
      intro: "You must not:",
      bullets: ["break the law", "give false information"],
      items: [],
    },
    {
      id: "part-b",
      eyebrow: "PART B",
      title: "Events and tickets",
      intro: "Part B applies when you buy a ticket to an event.",
      items: [
        {
          boldPrefix: "B1. The organiser is the seller.",
          text: "The event is run by the organiser.",
        },
        {
          boldPrefix: "B7. Cancellations and changes by the organiser.",
          text: "",
          bullets: [
            {
              boldPrefix: "Cancelled:",
              text: "You receive a full refund automatically.",
            },
          ],
        },
      ],
    },
  ],
};

describe("TermsView", () => {
  const defaultProps = {
    data: mockTermsData,
    activeSectionId: "short-version",
    backHref: "/legal",
    backLabel: "All legal documents",
    onSectionSelect: vi.fn(),
  };

  it("renders the page header, TOC navigation, and back link", () => {
    const onSectionSelect = vi.fn();
    render(<TermsView {...defaultProps} onSectionSelect={onSectionSelect} />);

    // Header and agreement notice
    expect(screen.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText(/These terms are an agreement between you/)).toBeInTheDocument();

    // Table of contents
    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "The short version" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "1. What MyJourny is, and what it is not" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PART II: EVENTS AND TICKETS" })).toBeInTheDocument();

    // Back link
    const backLink = screen.getByRole("link", { name: "All legal documents" });
    expect(backLink).toHaveAttribute("href", "/legal");

    // Click TOC item
    const button = screen.getByRole("button", { name: "2. Your account" });
    fireEvent.click(button);
    expect(onSectionSelect).toHaveBeenCalledWith("section-2");
  });

  it("renders the short version summary card with check items", () => {
    render(<TermsView {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 2, name: "The short version" })).toBeInTheDocument();
    expect(
      screen.getByText(/MyJourny is a marketplace\. Hosts run the experiences\./)
    ).toBeInTheDocument();
    expect(
      screen.getByText("This summary is for convenience. The full terms below are what apply.")
    ).toBeInTheDocument();
  });

  it("renders terms sections with bold prefixes, intro, and bullets", () => {
    render(<TermsView {...defaultProps} />);

    // Numbered sections and bold lead-ins
    expect(
      screen.getByRole("heading", { level: 2, name: "1. What MyJourny is, and what it is not" })
    ).toBeInTheDocument();
    expect(screen.getByText("The host is the seller.")).toBeInTheDocument();
    expect(screen.getByText("Instant booking.")).toBeInTheDocument();

    // Acceptable use bullets
    expect(screen.getByText("You must not:")).toBeInTheDocument();
    expect(screen.getByText("break the law")).toBeInTheDocument();
    expect(screen.getByText("give false information")).toBeInTheDocument();

    // Part B
    expect(screen.getByText("PART B")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Events and tickets" })).toBeInTheDocument();
    expect(screen.getByText("Part B applies when you buy a ticket to an event.")).toBeInTheDocument();
    expect(screen.getByText("B1. The organiser is the seller.")).toBeInTheDocument();
    expect(screen.getByText("Cancelled:")).toBeInTheDocument();
  });

  it("renders atAGlance card when present and section table when present", () => {
    const dataWithAtAGlanceAndTable: TermsData = {
      ...mockTermsData,
      shortVersion: undefined,
      companyAgreementText: "",
      agreementNoticeText: "",
      atAGlance: {
        title: "At a glance",
        items: [
          {
            question: "Who is responsible?",
            answer: "MyJourny is responsible.",
          },
        ],
      },
      sections: [
        {
          id: "section-table-test",
          title: "Data Table Section",
          items: [],
          table: {
            headers: ["Col 1", "Col 2"],
            rows: [["Val 1", "Val 2"]],
            note: "Table note here",
          },
        },
      ],
    };

    render(
      <TermsView
        {...defaultProps}
        data={dataWithAtAGlanceAndTable}
        activeSectionId="at-a-glance"
      />
    );

    expect(screen.getByRole("heading", { level: 2, name: "At a glance" })).toBeInTheDocument();
    expect(screen.getByText("Who is responsible?")).toBeInTheDocument();
    expect(screen.getByText("MyJourny is responsible.")).toBeInTheDocument();
    expect(screen.getByText("Col 1")).toBeInTheDocument();
    expect(screen.getByText("Val 1")).toBeInTheDocument();
    expect(screen.getByText("Table note here")).toBeInTheDocument();
  });

  it("renders actionCard and readNext section when provided", () => {
    const handleManagePreferences = vi.fn();
    const dataWithActionAndReadNext: TermsData = {
      ...mockTermsData,
      sections: [
        {
          id: "section-action",
          title: "Choices",
          items: [],
          actionCard: {
            label: "Cookie choices",
            buttonText: "Manage choices",
          },
        },
      ],
      readNext: {
        title: "Read next",
        items: [
          {
            eyebrow: "PRIVACY",
            title: "Privacy Info",
            description: "Details here",
            href: "/legal/privacy",
          },
        ],
      },
    };

    render(
      <TermsView
        {...defaultProps}
        data={dataWithActionAndReadNext}
        onManagePreferences={handleManagePreferences}
      />
    );

    const btn = screen.getByRole("button", { name: "Manage choices" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleManagePreferences).toHaveBeenCalledTimes(1);

    expect(screen.getByRole("heading", { level: 2, name: "Read next" })).toBeInTheDocument();
    expect(screen.getByText("Privacy Info")).toBeInTheDocument();
  });
});
