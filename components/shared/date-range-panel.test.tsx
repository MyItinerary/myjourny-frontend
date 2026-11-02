import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { DateRangePanel, rangePresets } from "./date-range-panel";

function setup(overrides: Partial<Parameters<typeof DateRangePanel>[0]> = {}) {
  const handlers = { onPick: vi.fn(), onPreset: vi.fn(), onAnyDate: vi.fn(), onClear: vi.fn(), onApply: vi.fn() };
  const view = renderWithProviders(
    <DateRangePanel range={{ start: new Date(2030, 10, 12), end: null }} {...handlers} {...overrides} />,
  );
  return { ...view, ...handlers };
}

describe("rangePresets", () => {
  it("starts with Tonight and ends with Any date", () => {
    const labels = rangePresets().map((p) => p.label);
    expect(labels).toEqual(["Tonight", "Tomorrow", "This weekend", "Next 7 days", "Next weekend", "Any date"]);
  });
});

describe("DateRangePanel", () => {
  it("shows two months and a caption that asks for the end date", () => {
    setup();

    expect(screen.getByText("November 2030")).toBeInTheDocument();
    expect(screen.getByText("December 2030")).toBeInTheDocument();
    expect(screen.getByText(/pick an end date/)).toBeInTheDocument();
  });

  it("describes the whole range once both ends are picked", () => {
    setup({ range: { start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) } });

    expect(screen.getByText(/Tuesday 12 November to Thursday 21 November/)).toBeInTheDocument();
  });

  it("reports day taps, multi-day and one-day quick picks, Any date, Clear and Apply", async () => {
    const { user, onPick, onPreset, onAnyDate, onClear, onApply } = setup();

    await user.click(screen.getAllByRole("button", { name: "20" })[0]);
    expect(onPick).toHaveBeenCalledWith(new Date(2030, 10, 20));

    await user.click(screen.getByRole("button", { name: "This weekend" }));
    const [start, end] = onPreset.mock.calls[0];
    expect(start.getDay()).toBe(6);
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);

    await user.click(screen.getByRole("button", { name: "Tomorrow" }));
    expect(onPreset.mock.calls[1][0]).toEqual(onPreset.mock.calls[1][1]);

    await user.click(screen.getByRole("button", { name: "Any date" }));
    expect(onAnyDate).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalled();
    await user.click(screen.getAllByRole("button", { name: /Apply/ })[0]);
    expect(onApply).toHaveBeenCalled();
  });

  it("can't apply without a start date, and mobile Apply can show the count", () => {
    setup({ range: { start: null, end: null }, mobileApplyLabel: "Show 12 events" });

    expect(screen.getAllByRole("button", { name: /Apply|Show 12 events/ })[0]).toBeDisabled();
    expect(screen.getByText("Show 12 events")).toBeInTheDocument();
  });
});
