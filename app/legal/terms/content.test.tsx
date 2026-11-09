import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TermsContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/legal", () => ({
  useTermsViewModel: () => ({
    data: {
      title: "Terms of Use",
      lastUpdated: "[DATE]",
      companyAgreementText: "Agreement text",
      agreementNoticeText: "Notice text",
      shortVersion: {
        title: "The short version",
        disclaimer: "Disclaimer",
        items: [],
      },
      tableOfContents: [],
      sections: [],
    },
    activeSectionId: "short-version",
    onSectionSelect: vi.fn(),
  }),
  TermsView: ({ data }: { data: { title: string } }) => (
    <div data-testid="mock-terms-view">{data.title}</div>
  ),
}));

describe("TermsContent", () => {
  it("renders HomeNav, TermsView, and Footer", () => {
    render(<TermsContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-terms-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-terms-view")).toHaveTextContent("Terms of Use");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
