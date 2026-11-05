import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CancellationContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/legal", () => ({
  useCancellationViewModel: () => ({
    data: {
      title: "Cancellation and Refund Policy",
      lastUpdated: "[DATE]",
      companyAgreementText: "This policy is part of our Terms of Use.",
      agreementNoticeText: "",
      shortVersion: {
        title: "The short version",
        disclaimer: "",
        items: [],
      },
      tableOfContents: [],
      sections: [],
    },
    activeSectionId: "short-version",
    onSectionSelect: vi.fn(),
  }),
  CancellationView: ({ data }: { data: { title: string } }) => (
    <div data-testid="mock-cancellation-view">{data.title}</div>
  ),
}));

describe("CancellationContent", () => {
  it("renders HomeNav, CancellationView, and Footer", () => {
    render(<CancellationContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-cancellation-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-cancellation-view")).toHaveTextContent("Cancellation and Refund Policy");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
