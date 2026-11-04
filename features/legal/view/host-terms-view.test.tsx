import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TermsData } from "../model/terms.types";
import { HostTermsView } from "./host-terms-view";

const mockHostTermsData: TermsData = {
  title: "Host Terms",
  lastUpdated: "[DATE]",
  companyAgreementText: "These terms are an agreement between [COMPANY LEGAL NAME] and the host.",
  agreementNoticeText: "By applying to host, you accept these terms.",
  shortVersion: {
    title: "The short version",
    disclaimer: "This summary is for convenience.",
    items: [
      {
        id: "short-1",
        text: "You run the experience. We bring the guests.",
      },
      {
        id: "short-2",
        text: "You keep **85%**. We take **15%**.",
      },
    ],
  },
  tableOfContents: [
    { id: "short-version", label: "The short version" },
    { id: "section-1", label: "1. Who can host" },
    { id: "section-2", label: "2. Our role, and yours" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. Who can host",
      items: [
        {
          number: "1.1",
          text: "You must be at least 18.",
        },
      ],
    },
    {
      id: "section-2",
      number: "2.",
      title: "2. Our role, and yours",
      items: [
        {
          number: "2.1",
          text: "MyJourny is a marketplace.",
        },
        {
          number: "2.2",
          boldPrefix: "You are an independent host.",
          text: "You are not our employee.",
        },
      ],
    },
  ],
};

describe("HostTermsView", () => {
  it("renders page title, agreement notice, short version, and sections", () => {
    render(
      <HostTermsView
        data={mockHostTermsData}
        activeSectionId="short-version"
        backHref="/legal"
        backLabel="All legal documents"
        onSectionSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { level: 1, name: "Host Terms" })).toBeInTheDocument();
    expect(screen.getByText(/These terms are an agreement/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "The short version" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "1. Who can host" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "2. Our role, and yours" })).toBeInTheDocument();
  });

  it("calls onSectionSelect when a TOC button is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <HostTermsView
        data={mockHostTermsData}
        activeSectionId="short-version"
        backHref="/legal"
        backLabel="All legal documents"
        onSectionSelect={handleSelect}
      />
    );

    const section1Btn = screen.getByRole("button", { name: "1. Who can host" });
    fireEvent.click(section1Btn);

    expect(handleSelect).toHaveBeenCalledWith("section-1");
  });

  it("renders back link to all legal documents", () => {
    render(
      <HostTermsView
        data={mockHostTermsData}
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
