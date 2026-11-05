import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PrivacyContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/legal", () => ({
  usePrivacyViewModel: () => ({
    data: {
      title: "Privacy Policy",
      lastUpdated: "[DATE]",
      companyAgreementText: "",
      agreementNoticeText: "",
      atAGlance: {
        title: "At a glance",
        items: [],
      },
      tableOfContents: [],
      sections: [],
    },
    activeSectionId: "at-a-glance",
    backHref: "/legal",
    backLabel: "All legal documents",
    onSectionSelect: vi.fn(),
  }),
  PrivacyView: ({ data }: { data: { title: string } }) => (
    <div data-testid="mock-privacy-view">{data.title}</div>
  ),
}));

describe("PrivacyContent", () => {
  it("renders HomeNav, PrivacyView, and Footer", () => {
    render(<PrivacyContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-privacy-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-privacy-view")).toHaveTextContent("Privacy Policy");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
