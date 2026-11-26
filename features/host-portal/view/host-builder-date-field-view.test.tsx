import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { DateFieldModel } from "../view-model/use-host-listing-builder-view-model";
import { DateField } from "./host-builder-date-field-view";

const field = (over: Partial<DateFieldModel> = {}): DateFieldModel => ({
  value: null,
  selected: null,
  min: new Date(2030, 0, 1),
  open: false,
  onOpenChange: vi.fn(),
  onPick: vi.fn(),
  onClear: null,
  ...over,
});

describe("DateField", () => {
  it("looks like an input until opened, and asks to open on a click", async () => {
    const f = field();
    render(<DateField label="Date" field={f} />);
    expect(screen.getByRole("button", { name: "Date: not picked" })).toHaveTextContent("Pick a date");
    expect(screen.queryByRole("group", { name: "Pick a date" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Date: not picked" }));
    expect(f.onOpenChange).toHaveBeenCalledWith(true);
  });

  it("shows the booking calendar when open, without its availability key, and picks a day", async () => {
    const f = field({ open: true, value: "Wednesday 12 June 2030", selected: new Date(2030, 5, 12) });
    render(<DateField label="Date" field={f} />);
    const calendar = screen.getByRole("group", { name: "Pick a date" });
    expect(within(calendar).getByText("June 2030")).toBeInTheDocument();
    expect(within(calendar).queryByText("No times")).not.toBeInTheDocument();
    await userEvent.click(within(calendar).getByRole("button", { name: "13 June" }));
    expect(f.onPick).toHaveBeenCalledWith(new Date(2030, 5, 13));
  });

  it("closes when the host clicks outside it", () => {
    const f = field({ open: true });
    render(<DateField label="Date" field={f} />);
    fireEvent.mouseDown(document.body);
    expect(f.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("offers to clear an optional date that has been picked", async () => {
    const onClear = vi.fn();
    render(<DateField label="Repeat until" field={field({ value: "Wednesday 12 June 2030", onClear })} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear repeat until" }));
    expect(onClear).toHaveBeenCalled();
  });
});
