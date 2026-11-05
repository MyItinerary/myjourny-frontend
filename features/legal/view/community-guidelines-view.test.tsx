import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TermsData } from "../model/terms.types";
import { CommunityGuidelinesView } from "./community-guidelines-view";

const mockCommunityData: TermsData = {
  title: "Community Guidelines and Reviews Policy",
  lastUpdated: "[DATE]",
  companyAgreementText: "MyJourny runs on trust.",
  agreementNoticeText: "",
  shortVersion: {
    title: "The short version",
    variant: "numbered",
    items: [
      { id: "1", text: "**Be honest.** Say what is true." },
      { id: "2", text: "**Be respectful.**" },
    ],
  },
  tableOfContents: [
    { id: "short-version", label: "The short version" },
    { id: "section-a2", label: "A2. For everyone" },
    { id: "section-a8", label: "A8. What happens when guidelines are broken" },
  ],
  sections: [
    {
      id: "section-a2",
      eyebrow: "PART A",
      title: "Community Guidelines",
      items: [{ subheading: "A2. For everyone", text: "" }],
      bullets: ["Harass, threaten, or intimidate anyone."],
    },
    {
      id: "section-a8",
      title: "A8. What happens when guidelines are broken",
      items: [],
      enforcementSteps: [
        { number: 1, title: "Reminder", description: "A note explaining what went wrong" },
        { number: 5, title: "Remove", description: "We close your account", isHighlighted: true },
      ],
    },
  ],
};

describe("CommunityGuidelinesView", () => {
  const defaultProps = {
    data: mockCommunityData,
    activeSectionId: "short-version",
    onSectionSelect: vi.fn(),
  };

  it("renders page title and numbered short version items", () => {
    render(<CommunityGuidelinesView {...defaultProps} />);

    expect(
      screen.getByRole("heading", {
        name: "Community Guidelines and Reviews Policy",
        level: 1,
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Be honest.")).toBeInTheDocument();
    expect(screen.getAllByText("1")).toHaveLength(2);
  });

  it("renders enforcement steps card", () => {
    render(<CommunityGuidelinesView {...defaultProps} />);

    expect(screen.getByText("Reminder")).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  it("handles TOC navigation clicks", () => {
    render(<CommunityGuidelinesView {...defaultProps} />);

    const btn = screen.getByRole("button", { name: "A2. For everyone" });
    fireEvent.click(btn);
    expect(defaultProps.onSectionSelect).toHaveBeenCalledWith("section-a2");
  });
});
