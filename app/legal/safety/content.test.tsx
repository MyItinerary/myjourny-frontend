import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SafetyContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/legal", () => ({
  useSafetyViewModel: () => ({
    data: {
      title: "Safety Guide",
      lastUpdated: "[DATE]",
      companyAgreementText: "Most experiences go well.",
      agreementNoticeText: "",
      tableOfContents: [],
      sections: [],
    },
    activeSectionId: "section-1",
    onSectionSelect: vi.fn(),
  }),
  SafetyView: ({ data }: { data: { title: string } }) => (
    <div data-testid="mock-safety-view">{data.title}</div>
  ),
}));

describe("SafetyContent", () => {
  it("renders HomeNav, SafetyView, and Footer", () => {
    render(<SafetyContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-safety-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-safety-view")).toHaveTextContent("Safety Guide");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
