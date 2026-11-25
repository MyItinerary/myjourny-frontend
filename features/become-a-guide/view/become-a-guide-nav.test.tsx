import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BecomeAGuideNav } from "./become-a-guide-nav";

describe("BecomeAGuideNav", () => {
  it("renders logo, back to experiences and the Get Started button", () => {
    render(<BecomeAGuideNav onStartApplication={() => {}} />);

    expect(screen.getByRole("link", { name: /MyJourny home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Back to experiences/i })).toHaveAttribute("href", "/experiences");
    expect(screen.getByRole("button", { name: "Get Started" })).toBeInTheDocument();
  });

  it("starts the application when Get Started is clicked", () => {
    const onStartApplication = vi.fn();
    render(<BecomeAGuideNav onStartApplication={onStartApplication} />);

    fireEvent.click(screen.getByRole("button", { name: "Get Started" }));

    expect(onStartApplication).toHaveBeenCalledTimes(1);
  });
});
