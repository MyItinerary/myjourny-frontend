import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CookieContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/legal", () => ({
  useCookieViewModel: () => ({
    data: {
      title: "Cookie Policy",
      lastUpdated: "[DATE]",
      companyAgreementText: "",
      agreementNoticeText: "",
      tableOfContents: [],
      sections: [],
    },
    activeSectionId: "section-1",
    onSectionSelect: vi.fn(),
    onManagePreferences: vi.fn(),
  }),
  CookieView: ({ data }: { data: { title: string } }) => (
    <div data-testid="mock-cookie-view">{data.title}</div>
  ),
}));

describe("CookieContent", () => {
  it("renders HomeNav, CookieView, and Footer", () => {
    render(<CookieContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-cookie-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-cookie-view")).toHaveTextContent("Cookie Policy");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
