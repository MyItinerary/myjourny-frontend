import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TermsData } from "../model/terms.types";
import { CancellationView } from "./cancellation-view";

const mockCancellationData: TermsData = {
  title: "Cancellation and Refund Policy",
  lastUpdated: "[DATE]",
  companyAgreementText: "This policy is part of our Terms of Use. It tells you when you get your money back.",
  agreementNoticeText: "",
  shortVersion: {
    title: "The short version",
    disclaimer: "",
    items: [
      {
        id: "short-1",
        text: "Before you pay, every listing shows its cancellation policy.",
      },
      {
        id: "short-2",
        text: "If a host cancels, you get a **full refund**.",
      },
    ],
  },
  tableOfContents: [
    { id: "short-version", label: "The short version" },
    { id: "section-1", label: "1. How cancellation works" },
    { id: "section-2", label: "2. Changes, grace period, and late bookings" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. How cancellation works",
      items: [
        {
          number: "1.1",
          text: "MyJourny applies each host's policy for them.",
        },
        {
          number: "1.3",
          text: "A refund is of the **full price you paid**, unless this policy says a percentage.",
        },
      ],
    },
    {
      id: "section-2",
      number: "2.",
      title: "2. Changes, grace period, and late bookings",
      items: [
        {
          number: "2.1",
          boldPrefix: "Changing the date.",
          text: "You can ask to move your booking to another date.",
        },
      ],
    },
  ],
};

describe("CancellationView", () => {
  it("renders page header, short version, and sections", () => {
    render(
      <CancellationView
        data={mockCancellationData}
        activeSectionId="short-version"
        backHref="/legal"
        backLabel="All legal documents"
        onSectionSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { level: 1, name: "Cancellation and Refund Policy" })).toBeInTheDocument();
    expect(screen.getByText(/This policy is part of our Terms of Use/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "The short version" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "1. How cancellation works" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "2. Changes, grace period, and late bookings" })).toBeInTheDocument();
  });

  it("calls onSectionSelect when a TOC button is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <CancellationView
        data={mockCancellationData}
        activeSectionId="short-version"
        backHref="/legal"
        backLabel="All legal documents"
        onSectionSelect={handleSelect}
      />
    );

    const section1Btn = screen.getByRole("button", { name: "1. How cancellation works" });
    fireEvent.click(section1Btn);

    expect(handleSelect).toHaveBeenCalledWith("section-1");
  });

  it("renders back link to all legal documents", () => {
    render(
      <CancellationView
        data={mockCancellationData}
        activeSectionId="short-version"
        backHref="/legal"
        backLabel="All legal documents"
        onSectionSelect={vi.fn()}
      />
    );

    const backLink = screen.getByRole("link", { name: /all legal documents/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/legal");
  });
});
