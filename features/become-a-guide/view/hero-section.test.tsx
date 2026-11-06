import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroSection } from "./hero-section";

describe("HeroSection", () => {
  it("renders hero heading, copy, and buttons", () => {
    const onStartApplication = vi.fn();
    const onScrollToHowItWorks = vi.fn();

    render(
      <HeroSection
        onStartApplication={onStartApplication}
        onScrollToHowItWorks={onScrollToHowItWorks}
      />
    );

    expect(
      screen.getByRole("heading", { name: /You built the audience\. Start earning from it\./i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Turn your city knowledge into income/i)).toBeInTheDocument();

    const startBtn = screen.getByRole("button", { name: /Start your application/i });
    fireEvent.click(startBtn);
    expect(onStartApplication).toHaveBeenCalledTimes(1);

    const howItWorksBtn = screen.getByRole("button", { name: /See how it works/i });
    fireEvent.click(howItWorksBtn);
    expect(onScrollToHowItWorks).toHaveBeenCalledTimes(1);
  });
});
