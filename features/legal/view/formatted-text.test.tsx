import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormattedText } from "./formatted-text";

describe("FormattedText", () => {
  it("returns null for empty text", () => {
    const { container } = render(<FormattedText text="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders plain text without formatting when no markers present", () => {
    render(<FormattedText text="Plain text without markers" />);
    expect(screen.getByText("Plain text without markers")).toBeInTheDocument();
  });

  it("renders bold text formatted in <strong> tags", () => {
    render(<FormattedText text="Here is **bold emphasis** text." />);
    const strong = screen.getByText("bold emphasis");
    expect(strong.tagName).toBe("STRONG");
    expect(strong).toHaveClass("font-bold text-[#130404]");
  });

  it("renders markdown links as Next.js Link components", () => {
    render(
      <FormattedText text="Please read our [Privacy Policy](/legal/privacy) for details." />
    );
    const link = screen.getByRole("link", { name: "Privacy Policy" });
    expect(link).toHaveAttribute("href", "/legal/privacy");
  });

  it("renders combined bold text and markdown links", () => {
    render(
      <FormattedText text="Contact **support** at [email](/contact) today." />
    );
    expect(screen.getByText("support")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "email" })).toHaveAttribute("href", "/contact");
  });
});
