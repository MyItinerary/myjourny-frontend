import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { computeDatePresets, DatePickerCalendar } from "./date-picker-calendar";
import { renderWithProviders } from "@/test/utils/render";

describe("computeDatePresets", () => {
  it("computes Today, Tomorrow, and This weekend correctly", () => {
    const presets = computeDatePresets();
    expect(presets).toHaveLength(3);
    expect(presets.map((p) => p.label)).toEqual(["Today", "Tomorrow", "This weekend"]);
    expect(presets[0].date).toBeInstanceOf(Date);
    expect(presets[1].date).toBeInstanceOf(Date);
    expect(presets[2].date).toBeInstanceOf(Date);
  });
});

describe("DatePickerCalendar", () => {
  it("renders weekday labels and preset buttons", async () => {
    const onSelect = vi.fn();
    const presets = [
      { label: "Today", date: new Date(2030, 5, 1) },
      { label: "Tomorrow", date: new Date(2030, 5, 2) },
    ];

    const { user } = renderWithProviders(
      <DatePickerCalendar
        selectedDate={new Date(2030, 5, 1)}
        presets={presets}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();

    const todayButton = screen.getByRole("button", { name: "Today" });
    expect(todayButton).toBeInTheDocument();
    await user.click(todayButton);

    expect(onSelect).toHaveBeenCalledWith(presets[0].date);
  });

  it("navigates months and selects a date", async () => {
    const onSelect = vi.fn();
    const { user } = renderWithProviders(
      <DatePickerCalendar
        selectedDate={new Date(2030, 5, 15)}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText(/June 2030/)).toBeInTheDocument();

    // Click next month
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(/July 2030/)).toBeInTheDocument();

    // Click day 10
    const day10 = screen.getByRole("button", { name: "10" });
    await user.click(day10);

    expect(onSelect).toHaveBeenCalled();
  });

  it("disables dates prior to minDate", () => {
    const minDate = new Date(2030, 5, 10);
    renderWithProviders(
      <DatePickerCalendar
        selectedDate={new Date(2030, 5, 15)}
        minDate={minDate}
        onSelect={vi.fn()}
      />,
    );

    const day5 = screen.getByRole("button", { name: "5" });
    expect(day5).toBeDisabled();

    const day15 = screen.getByRole("button", { name: "15" });
    expect(day15).not.toBeDisabled();
  });
});
