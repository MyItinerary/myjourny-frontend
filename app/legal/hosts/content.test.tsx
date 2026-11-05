import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HostTermsContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/legal", () => ({
  useHostTermsViewModel: () => ({
    data: {
      title: "Host Terms",
      lastUpdated: "[DATE]",
      companyAgreementText: "These terms are an agreement between [COMPANY LEGAL NAME] and the host.",
      agreementNoticeText: "By applying to host, you accept these terms.",
      shortVersion: {
        title: "The short version",
        disclaimer: "Disclaimer",
        items: [],
      },
      tableOfContents: [],
      sections: [],
    },
    activeSectionId: "short-version",
    backHref: "/legal",
    backLabel: "All legal documents",
    onSectionSelect: vi.fn(),
  }),
  HostTermsView: ({ data }: { data: { title: string } }) => (
    <div data-testid="mock-host-terms-view">{data.title}</div>
  ),
}));

describe("HostTermsContent", () => {
  it("renders HomeNav, HostTermsView, and Footer", () => {
    render(<HostTermsContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-host-terms-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-host-terms-view")).toHaveTextContent("Host Terms");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
