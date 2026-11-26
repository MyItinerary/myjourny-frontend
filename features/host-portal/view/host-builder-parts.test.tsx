import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChoiceCard, Field, LineList, Pill, StepHeading } from "./host-builder-parts";

describe("builder parts", () => {
  it("heads a step at one size, with its intro and no step count", () => {
    render(<StepHeading title="What's included" intro="One item per line." />);
    expect(screen.getByRole("heading", { name: "What's included" })).toHaveClass("text-[28px]");
    expect(screen.getByText("One item per line.")).toHaveClass("text-base");
    expect(screen.queryByText(/Step \d+ of/)).not.toBeInTheDocument();
  });

  it("heads a step without an intro", () => {
    render(<StepHeading title="Photos" />);
    expect(screen.getByRole("heading", { name: "Photos" })).toBeInTheDocument();
  });

  it("heads a section compactly, with a badge and no eyebrow", () => {
    render(<StepHeading badge="Required" title="Category and tags" intro="One category." />);
    expect(screen.getByRole("heading", { name: "Category and tags" })).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText(/Section/)).not.toBeInTheDocument();
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
    await userEvent.click(screen.getByRole("button", { name: "Add item" }));
    expect(onAdd).toHaveBeenCalled();
  });

  it("shows a placeholder, limits the length and stops adding at the cap", () => {
    render(<LineList title="Included" label="Included line" lines={["a", "b"]} placeholder="Ten photos" maxLength={100} max={2} onSet={vi.fn()} onAdd={vi.fn()} onDel={vi.fn()} />);
    expect(screen.getByLabelText("Included line 1")).toHaveAttribute("placeholder", "Ten photos");
    expect(screen.getByLabelText("Included line 1")).toHaveAttribute("maxlength", "100");
    expect(screen.queryByRole("button", { name: "Add a line" })).not.toBeInTheDocument();
  });
});
