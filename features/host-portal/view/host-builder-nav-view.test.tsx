import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { BuilderStepNumber } from "../model/listing-draft.types";
import { HostBuilderNavView } from "./host-builder-nav-view";

const STEP_LABELS = ["Title and description", "Category and tags", "Location", "Date and time", "Group size and price", "What's included", "Requirements and safety", "Photos", "Reviews", "How guests book", "Review and publish"];

function setup(over: { step?: number; open?: boolean; attention?: Record<number, string>; doneCount?: number; furthest?: number } = {}) {
  const step = over.step ?? 1;
  const fns = { onStep: vi.fn(), onBack: vi.fn(), onNext: vi.fn(), onToggle: vi.fn() };
  const doneCount = over.doneCount ?? 0;
  const vm = {
    step: step as BuilderStepNumber,
    doneCount,
    steps: STEP_LABELS.map((label, i) => ({
      n: (i + 1) as BuilderStepNumber,
      label,
      done: i + 1 <= 8 && i + 1 <= doneCount,
      active: i + 1 === step,
      locked: i === 10 && doneCount < 8,
      blocked: i + 1 > (over.furthest ?? 11),
      attention: over.attention?.[i + 1] ?? null,
      sub: i === 10 && doneCount < 8 ? "Finish the required steps" : "",
    })),
    sheet: { open: over.open ?? false, onToggle: fns.onToggle },
    stepBar: { eyebrow: `Step ${step} of 11`, title: STEP_LABELS[step - 1], attention: over.attention?.[step] ?? null, canPrev: step > 1, canNext: step < 11 },
    onStep: fns.onStep,
    onBack: fns.onBack,
    onNext: fns.onNext,
  };
  render(<HostBuilderNavView vm={vm} />);
  return fns;
}

describe("the builder step navigator", () => {
  it("lists every step, marks the current one and shows progress", () => {
    setup({ step: 2, doneCount: 1 });
    const rail = screen.getByRole("navigation", { name: "Experience sections" });
    expect(within(rail).getAllByRole("button")).toHaveLength(11);
    expect(within(rail).getByRole("button", { name: /Category and tags/ })).toHaveAttribute("aria-current", "step");
    expect(within(rail).getByText("1 of 8 sections done")).toBeInTheDocument();
    expect(within(rail).getByText("Finish the required steps")).toBeInTheDocument();
  });

  it("jumps to a step", async () => {
    const fns = setup();
    await userEvent.click(screen.getByRole("button", { name: /Location/ }));
    expect(fns.onStep).toHaveBeenCalledWith(3);
  });

  it("names what is missing on a step that needs attention", () => {
    setup({ attention: { 3: "Meeting point on the map, with a photo" } });
    expect(screen.getByRole("tooltip")).toHaveTextContent("Meeting point on the map, with a photo");
    expect(screen.getAllByRole("img", { name: "Needs attention" })).toHaveLength(1);
  });

  it("steps back and forward from the mobile bar, with the ends disabled", async () => {
    const fns = setup();
    expect(screen.getByText("Step 1 of 11")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(fns.onNext).toHaveBeenCalled();
  });

  it("opens the all steps sheet and picks a step from it", async () => {
    const fns = setup({ open: true });
    const sheet = screen.getByRole("dialog", { name: "All steps" });
    await userEvent.click(within(sheet).getByRole("button", { name: /Photos/ }));
    expect(fns.onStep).toHaveBeenCalledWith(8);
    await userEvent.click(within(sheet).getByRole("button", { name: "Close" }));
    expect(fns.onToggle).toHaveBeenCalled();
  });

  it("won't open a step past one a template filled in that isn't checked yet", async () => {
    const fns = setup({ step: 1, furthest: 1 });
    const rail = screen.getByRole("navigation", { name: "Experience sections" });

    expect(within(rail).getByRole("button", { name: /Category and tags/ })).toBeDisabled();
    expect(within(rail).getByRole("button", { name: /Title and description/ })).toBeEnabled();
    await userEvent.click(within(rail).getByRole("button", { name: /Category and tags/ }));
    expect(fns.onStep).not.toHaveBeenCalled();
  });
});
