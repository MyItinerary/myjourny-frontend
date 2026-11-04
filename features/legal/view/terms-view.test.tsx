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
    { id: "part-2", label: "PART II: EVENTS AND TICKETS", isPartHeading: true },
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

  it("renders the title, last updated, and introductory text", () => {
    render(<TermsView {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText(/These terms are an agreement between you/)).toBeInTheDocument();
  });

  it("renders the table of contents navigation items", () => {
    render(<TermsView {...defaultProps} />);

    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "The short version" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "1. What MyJourny is, and what it is not" })
    ).toBeInTheDocument();
    expect(screen.getByText("PART II: EVENTS AND TICKETS")).toBeInTheDocument();
  });

  it("invokes onSectionSelect when a table of contents item is clicked", () => {
    const onSectionSelect = vi.fn();
    render(<TermsView {...defaultProps} onSectionSelect={onSectionSelect} />);

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

  it("renders terms sections and bold prefixes", () => {
    render(<TermsView {...defaultProps} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "1. What MyJourny is, and what it is not" })
    ).toBeInTheDocument();
    expect(screen.getByText("The host is the seller.")).toBeInTheDocument();
    expect(screen.getByText("Instant booking.")).toBeInTheDocument();
  });

  it("renders back link to all legal documents", () => {
    render(<TermsView {...defaultProps} />);

    const backLink = screen.getByRole("link", { name: "All legal documents" });
    expect(backLink).toHaveAttribute("href", "/legal");
  });
});
