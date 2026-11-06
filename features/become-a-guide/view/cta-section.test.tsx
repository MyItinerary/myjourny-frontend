import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CtaSection } from "./cta-section";

describe("CtaSection", () => {
  it("renders heading and start application button", () => {
    const onStartApplication = vi.fn();
    render(<CtaSection onStartApplication={onStartApplication} />);

    expect(
      screen.getByRole("heading", { name: /Start making money off/i })
    ).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /Start your application/i });
    fireEvent.click(button);
    expect(onStartApplication).toHaveBeenCalledTimes(1);
  });
});
