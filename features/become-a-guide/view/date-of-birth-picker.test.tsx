import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateOfBirthPicker } from "./date-of-birth-picker";

describe("DateOfBirthPicker", () => {
  it("renders input with placeholder and calendar icon", () => {
    render(<DateOfBirthPicker value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText("DD/MM/YYYY")).toBeInTheDocument();
  });

  it("opens calendar dropdown when input is clicked", async () => {
    const user = userEvent.setup();
    render(<DateOfBirthPicker value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("DD/MM/YYYY");
    await user.click(input);

    expect(screen.getByRole("dialog", { name: "Calendar dropdown" })).toBeInTheDocument();
  });

  it("selects a day and triggers onChange formatted as DD/MM/YYYY", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateOfBirthPicker value="" onChange={onChange} />);

    await user.click(screen.getByPlaceholderText("DD/MM/YYYY"));
    const dayButton = screen.getByRole("button", { name: "15" });
    await user.click(dayButton);

    expect(onChange).toHaveBeenCalledWith("15/01/1998");
    expect(screen.queryByRole("dialog", { name: "Calendar dropdown" })).not.toBeInTheDocument();
  });

  it("displays error message when provided", () => {
    render(
      <DateOfBirthPicker
        value=""
        onChange={vi.fn()}
        error="Date of birth is required"
      />
    );

    expect(screen.getByText("Date of birth is required")).toBeInTheDocument();
  });
});
