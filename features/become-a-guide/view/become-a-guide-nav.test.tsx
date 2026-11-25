import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BecomeAGuideNav } from "./become-a-guide-nav";

describe("BecomeAGuideNav", () => {
  it("renders logo, back to experiences and the account settings link", () => {
    render(<BecomeAGuideNav profileLink={{ href: "/profile", label: "Account settings" }} />);

    expect(screen.getByRole("link", { name: /Myjourny home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Back to experiences/i })).toHaveAttribute("href", "/experiences");
    expect(screen.getByRole("link", { name: "Account settings" })).toHaveAttribute("href", "/profile");
  });

  it("offers to log in when signed out", () => {
    render(<BecomeAGuideNav profileLink={{ href: "/login?next=%2Fbecome-a-guide", label: "Log in" }} />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login?next=%2Fbecome-a-guide");
  });
});
