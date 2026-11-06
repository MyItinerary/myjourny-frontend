import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BecomeAGuideNav } from "./become-a-guide-nav";

describe("BecomeAGuideNav", () => {
  it("renders logo and back to experiences link", () => {
    render(<BecomeAGuideNav />);

    expect(screen.getByRole("link", { name: /MyJourny home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Back to experiences/i })).toHaveAttribute("href", "/experiences");
    expect(screen.getByRole("link", { name: /Profile/i })).toHaveAttribute("href", "/profile");
  });
});
