import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { Addons, DaysRow, PromoCode } from "./experience-booking-card-extras";

describe("experience booking card extras", () => {
  it("steps the days within 1 to 60", async () => {
    const onChange = vi.fn();
    const { user, rerender } = renderWithProviders(<DaysRow days={{ show: true, value: 3, onChange }} />);
    await user.click(screen.getByRole("button", { name: "Increase days" }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole("button", { name: "Decrease days" }));
    expect(onChange).toHaveBeenLastCalledWith(2);
    rerender(<DaysRow days={{ show: true, value: 1, onChange }} />);
    expect(screen.getByRole("button", { name: "Decrease days" })).toBeDisabled();
  });

  it("toggles add-ons", async () => {
    const onToggle = vi.fn();
    const { user } = renderWithProviders(
      <Addons addons={[{ id: "lunch", label: "Lunch", priceLabel: "₦1,500.00 / person", checked: false, onToggle }]} />,
    );
    await user.click(screen.getByRole("checkbox", { name: /Lunch/ }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("folds the promo field away until asked for, then applies the code", async () => {
    const onApply = vi.fn();
    const onInputChange = vi.fn();
    const { user } = renderWithProviders(
      <PromoCode promo={{ input: "", onInputChange, onApply, message: null }} />,
    );
    expect(screen.queryByRole("textbox", { name: "Promo code" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Have a promo code?" }));
    await user.type(screen.getByRole("textbox", { name: "Promo code" }), "S");
    expect(onInputChange).toHaveBeenCalledWith("S");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalled();
  });

  it("keeps the promo field open to show the result of a code", () => {
    renderWithProviders(
      <PromoCode promo={{ input: "SAVE10", onInputChange: vi.fn(), onApply: vi.fn(), message: { text: "SAVE10 applied", ok: true } }} />,
    );
    expect(screen.getByText("SAVE10 applied")).toBeInTheDocument();
  });
});
