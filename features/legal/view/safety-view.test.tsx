import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TermsData } from "../model/terms.types";
import { SafetyView } from "./safety-view";

const mockSafetyData: TermsData = {
  title: "Safety Guide",
  lastUpdated: "[DATE]",
  companyAgreementText: "Most experiences on Myjourny go well.",
  agreementNoticeText: "",
  tableOfContents: [
    { id: "section-1", label: "1. How safety works on Myjourny" },
    { id: "section-12", label: "12. Safe guiding: a plain checklist for guides" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. How safety works on Myjourny",
      intro: "It helps to know who does what.",
      items: [],
      bullets: ["Guides run their experiences."],
    },
    {
      id: "section-12",
      number: "12.",
      title: "12. Safe guiding: a plain checklist for guides",
      items: [
        {
          subheading: "Before you list",
          text: "",
          isChecklist: true,
          bullets: ["Hold the permits and upload them."],
        },
      ],
    },
  ],
};

describe("SafetyView", () => {
  const defaultProps = {
    data: mockSafetyData,
    activeSectionId: "section-1",
    onSectionSelect: vi.fn(),
  };

  it("renders page title, agreement text, and section 1 bullets", () => {
    render(<SafetyView {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Safety Guide", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Most experiences on Myjourny go well.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "1. How safety works on Myjourny", level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("Guides run their experiences.")).toBeInTheDocument();
  });

  it("renders checklist section with subheading and items", () => {
    render(<SafetyView {...defaultProps} />);

    expect(
      screen.getByRole("heading", {
        name: "12. Safe guiding: a plain checklist for guides",
        level: 2,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Before you list", level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText("Hold the permits and upload them.")).toBeInTheDocument();
  });

  it("handles TOC navigation clicks", () => {
    render(<SafetyView {...defaultProps} />);

    const btn = screen.getByRole("button", {
      name: "12. Safe guiding: a plain checklist for guides",
    });
    fireEvent.click(btn);
    expect(defaultProps.onSectionSelect).toHaveBeenCalledWith("section-12");
  });
});
