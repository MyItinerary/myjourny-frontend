import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { OptionChip, PriceRangeControl, Stepper, ToggleRow } from "./filter-controls-view";

const quickRanges = [
  { label: "Under ₦10,000", min: null, max: 10000 },
  { label: "Over ₦50,000", min: 50000, max: null },
];

describe("OptionChip", () => {
  it("reports its selected state and clicks", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <OptionChip selected onClick={onClick}>
        Morning
      </OptionChip>,
    );

    const chip = screen.getByRole("button", { name: "Morning" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await user.click(chip);
    expect(onClick).toHaveBeenCalled();
  });

  it("can't be tapped when disabled", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <OptionChip selected={false} disabled onClick={onClick}>
        Hausa
      </OptionChip>,
    );

    await user.click(screen.getByRole("button", { name: "Hausa" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("PriceRangeControl", () => {
  it("shows open ends as ₦0 and the ceiling with a plus", () => {
    renderWithProviders(
      <PriceRangeControl price={{ min: null, max: null }} ceiling={100000} quickRanges={quickRanges} onChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("Minimum price amount")).toHaveValue("0");
    expect(screen.getByLabelText("Maximum price amount")).toHaveValue("100,000+");
  });

  it("applies and clears a quick range", async () => {
    const onChange = vi.fn();
    const { user, rerender } = renderWithProviders(
      <PriceRangeControl price={{ min: null, max: null }} ceiling={100000} quickRanges={quickRanges} onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Over ₦50,000" }));
    expect(onChange).toHaveBeenLastCalledWith({ min: 50000, max: null });

    rerender(
      <PriceRangeControl price={{ min: 50000, max: null }} ceiling={100000} quickRanges={quickRanges} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Over ₦50,000" }));
    expect(onChange).toHaveBeenLastCalledWith({ min: null, max: null });
  });

  it("treats the ends of the slider as no limit and never lets the thumbs cross", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <PriceRangeControl price={{ min: 20000, max: 40000 }} ceiling={100000} quickRanges={quickRanges} onChange={onChange} />,
    );

    fireEvent.change(screen.getByLabelText("Maximum price"), { target: { value: "100000" } });
    expect(onChange).toHaveBeenLastCalledWith({ min: 20000, max: null });

    fireEvent.change(screen.getByLabelText("Minimum price"), { target: { value: "0" } });
    expect(onChange).toHaveBeenLastCalledWith({ min: null, max: 40000 });

    fireEvent.change(screen.getByLabelText("Minimum price"), { target: { value: "60000" } });
    expect(onChange).toHaveBeenLastCalledWith({ min: 39000, max: 40000 });
  });

  it("parses typed amounts", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <PriceRangeControl price={{ min: null, max: null }} ceiling={100000} quickRanges={quickRanges} onChange={onChange} />,
    );

    fireEvent.change(screen.getByLabelText("Maximum price amount"), { target: { value: "25,000" } });
    expect(onChange).toHaveBeenLastCalledWith({ min: null, max: 25000 });
  });
});

describe("ToggleRow", () => {
  it("reports its state and flips on click", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<ToggleRow label="Verified host" on={false} onChange={onChange} />);

    const toggle = screen.getByRole("switch", { name: "Verified host" });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("Stepper", () => {
  it("steps up and down from its value", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Stepper label="Group size" value={3} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "More group size" }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole("button", { name: "Fewer group size" }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });
});
