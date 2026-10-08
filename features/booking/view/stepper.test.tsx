import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { Stepper } from "./stepper";

describe("Stepper", () => {
  it("steps within its bounds", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Stepper label="Adult" value={1} min={1} max={2} onChange={onChange} />);

    expect(screen.getByRole("button", { name: "Decrease Adult" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Increase Adult" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("stops at the maximum", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Stepper label="days" value={3} min={1} max={3} onChange={onChange} />);

    expect(screen.getByRole("button", { name: "Increase days" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Decrease days" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });
});
