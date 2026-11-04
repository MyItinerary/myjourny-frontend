import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommunityGuidelinesContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/components/home/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/legal", () => ({
  useCommunityGuidelinesViewModel: () => ({
    data: {
      title: "Community Guidelines and Reviews Policy",
      lastUpdated: "[DATE]",
      companyAgreementText: "MyJourny runs on trust.",
      agreementNoticeText: "",
      tableOfContents: [],
      sections: [],
    },
    activeSectionId: "short-version",
    backHref: "/legal",
    backLabel: "All legal documents",
    onSectionSelect: vi.fn(),
  }),
  CommunityGuidelinesView: ({ data }: { data: { title: string } }) => (
    <div data-testid="mock-community-view">{data.title}</div>
  ),
}));

describe("CommunityGuidelinesContent", () => {
  it("renders HomeNav, CommunityGuidelinesView, and Footer", () => {
    render(<CommunityGuidelinesContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-community-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-community-view")).toHaveTextContent(
      "Community Guidelines and Reviews Policy"
    );
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
