import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReadNextCards } from "./read-next-cards";

describe("ReadNextCards", () => {
  const mockItems = [
    {
      eyebrow: "YOUR PRIVACY",
      title: "Privacy Policy",
      description: "What we collect and your rights.",
      href: "/legal/privacy",
    },
    {
      eyebrow: "FOR GUESTS",
      title: "Terms of Use",
      description: "Booking, paying, and events.",
      href: "/legal/terms",
    },
  ];

  it("renders the read next title and cards with links", () => {
    render(<ReadNextCards title="Read next" items={mockItems} />);

    expect(screen.getByRole("heading", { name: "Read next", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("YOUR PRIVACY")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Privacy Policy", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("What we collect and your rights.")).toBeInTheDocument();

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "/legal/privacy");

    const termsLink = screen.getByRole("link", { name: /terms of use/i });
    expect(termsLink).toHaveAttribute("href", "/legal/terms");
  });

  it("renders document questions and previous versions link when provided", () => {
    render(
      <ReadNextCards
        items={mockItems}
        documentQuestions={{
          text: "Questions? Email [DPO EMAIL].",
          previousVersionsText: "Previous versions",
          previousVersionsHref: "/archive",
        }}
      />
    );

    expect(screen.getByText(/Questions\? Email/)).toBeInTheDocument();
    const prevLink = screen.getByRole("link", { name: "Previous versions" });
    expect(prevLink).toHaveAttribute("href", "/archive");
  });
});
