import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BecomeAGuideContent } from "./content";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer" />,
}));

describe("BecomeAGuideContent", () => {
  it("renders the become a guide content wrapper", () => {
    render(<BecomeAGuideContent />);
    expect(
      screen.getByRole("heading", { name: /You built the audience\. Start earning from it\./i })
    ).toBeInTheDocument();
  });
});
