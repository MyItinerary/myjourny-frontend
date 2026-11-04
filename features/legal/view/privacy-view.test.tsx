import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TermsData } from "../model/terms.types";
import { PrivacyView } from "./privacy-view";

const mockPrivacyData: TermsData = {
  title: "Privacy Policy",
  lastUpdated: "[DATE]",
  companyAgreementText: "",
  agreementNoticeText: "",
  atAGlance: {
    title: "At a glance",
    items: [
      {
        question: "Who is responsible for your data?",
        answer: "MyJourny is the controller.",
      },
      {
        question: "Do you sell my data?",
        answer: "No. We never sell it.",
      },
    ],
  },
  tableOfContents: [
    { id: "at-a-glance", label: "At a glance" },
    { id: "section-1", label: "1. Who we are" },
    { id: "section-4", label: "4. Why we use your data, and our legal basis" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. Who we are",
      items: [
        {
          text: "MyJourny is a service operated in Nigeria.",
        },
      ],
    },
    {
      id: "section-4",
      number: "4.",
      title: "4. Why we use your data, and our legal basis",
      items: [],
      table: {
        headers: ["What we do", "The data we use", "Our legal basis"],
        rows: [["Create account", "Account details", "Contract"]],
        note: "* Where basis is legitimate interest, you can object.",
      },
    },
  ],
};

describe("PrivacyView", () => {
  const defaultProps = {
    data: mockPrivacyData,
    activeSectionId: "at-a-glance",
    backHref: "/legal",
    backLabel: "All legal documents",
    onSectionSelect: vi.fn(),
  };

  it("renders page title, last updated, and At a glance section", () => {
    render(<PrivacyView {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("[DATE]")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "At a glance", level: 2 })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Who is responsible for your data?", level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText("No. We never sell it.")).toBeInTheDocument();
  });

  it("renders sections and embedded legal table", () => {
    render(<PrivacyView {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "1. Who we are", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("MyJourny is a service operated in Nigeria.")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "4. Why we use your data, and our legal basis", level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("What we do")).toBeInTheDocument();
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByText("* Where basis is legitimate interest, you can object.")).toBeInTheDocument();
  });

  it("calls onSectionSelect when a table of contents item is clicked", () => {
    const onSectionSelect = vi.fn();
    render(<PrivacyView {...defaultProps} onSectionSelect={onSectionSelect} />);

    const tocButton = screen.getByRole("button", { name: "1. Who we are" });
    fireEvent.click(tocButton);

    expect(onSectionSelect).toHaveBeenCalledWith("section-1");
  });

  it("renders the back navigation link", () => {
    render(<PrivacyView {...defaultProps} />);

    const backLink = screen.getByRole("link", { name: /all legal documents/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/legal");
  });
});
