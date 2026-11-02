import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChoiceCard, Field, LineList, Pill, StepHeading } from "./host-builder-parts";

describe("builder parts", () => {
  it("heads a section", () => {
    render(<StepHeading eyebrow="Section 1 of 8" title="The basics" intro="Three things." />);
    expect(screen.getByRole("heading", { name: "The basics" })).toBeInTheDocument();
    expect(screen.getByText("Section 1 of 8")).toBeInTheDocument();
  });

  it("labels a field with its hint and aside", () => {
    render(<Field label="Title" aside="3/60" hint="Say the place."><input /></Field>);
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByText("3/60")).toBeInTheDocument();
    expect(screen.getByText("Say the place.")).toBeInTheDocument();
  });

  it("toggles a pill and a choice card", async () => {
    const onPill = vi.fn();
    const onCard = vi.fn();
    render(
      <>
        <Pill on onClick={onPill}>Walking</Pill>
        <ChoiceCard selected={false} radio onClick={onCard}>Yoga</ChoiceCard>
      </>,
    );
    expect(screen.getByRole("button", { name: "Walking" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Walking" }));
    await userEvent.click(screen.getByRole("button", { name: "Yoga" }));
    expect(onPill).toHaveBeenCalled();
    expect(onCard).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Yoga" })).toHaveAttribute("aria-pressed", "false");
  });

  it("edits, adds and removes lines in a list", async () => {
    const onSet = vi.fn();
    const onAdd = vi.fn();
    const onDel = vi.fn();
    render(<LineList title="Included in the price" label="Included line" lines={["Photos", ""]} onSet={onSet} onAdd={onAdd} onDel={onDel} />);

    await userEvent.type(screen.getByLabelText("Included line 2"), "a");
    expect(onSet).toHaveBeenCalledWith(1, "a");
    await userEvent.click(screen.getByRole("button", { name: "Remove Included line 1" }));
    expect(onDel).toHaveBeenCalledWith(0);
    await userEvent.click(screen.getByRole("button", { name: "Add a line" }));
    expect(onAdd).toHaveBeenCalled();
  });
});
