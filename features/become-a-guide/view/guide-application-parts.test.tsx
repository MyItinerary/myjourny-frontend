import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActionButtons, ApplicationCard, Field, inputClass, Select } from "./guide-application-parts";

describe("guide application parts", () => {
  it("gives a field its label, hint and mistake", () => {
    render(
      <Field label="Website" htmlFor="w" hint="We check it." error="Enter a web address">
        <input id="w" aria-describedby="w-error" />
      </Field>,
    );
    expect(screen.getByLabelText("Website")).toHaveAccessibleDescription("Enter a web address");
    expect(screen.getByText("We check it.")).toBeInTheDocument();
  });

  it("edges an input red when it's wrong", () => {
    expect(inputClass(true)).toContain("border-[#DC2626]");
    expect(inputClass(false)).toContain("border-transparent");
  });

  it("offers a select's choices, with a placeholder that can't be picked", async () => {
    const onChange = vi.fn();
    render(<Select id="c" value="" onChange={onChange} placeholder="Country" options={[{ value: "Nigeria", label: "Nigeria" }]} />);
    expect(screen.getByRole("option", { name: "Country" })).toBeDisabled();
    await userEvent.selectOptions(screen.getByRole("combobox"), "Nigeria");
    expect(onChange).toHaveBeenCalledWith("Nigeria");
  });

  it("frames the form with the logo and step", () => {
    render(<ApplicationCard stepLabel="Step 2 of 2">form</ApplicationCard>);
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "MyJourny" })).toBeInTheDocument();
  });

  it("disables the main action while busy", () => {
    render(<ActionButtons primaryLabel="Submit" onPrimary={vi.fn()} onBack={vi.fn()} busy />);
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
  });
});
