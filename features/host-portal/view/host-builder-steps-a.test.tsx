import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepBasics, StepCategory, StepWhere } from "./host-builder-steps-a";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }));

function Harness({ which }: { which: "basics" | "category" | "where" }) {
  const vm = useHostListingBuilderViewModel();
  return which === "basics" ? <StepBasics vm={vm} /> : which === "category" ? <StepCategory vm={vm} /> : <StepWhere vm={vm} />;
}

beforeEach(() => {
  window.localStorage.clear();
  URL.createObjectURL = vi.fn(() => "blob:gate");
});

describe("category and tags", () => {
  it("shows subcategories only after a category is picked", async () => {
    renderWithProviders(<Harness which="category" />);
    expect(screen.getByText(/Pick a category first/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Wellness & calm" }));
    await userEvent.click(screen.getByRole("button", { name: "Yoga" }));
    expect(screen.getByRole("button", { name: "Yoga" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "Walking" }));
    expect(screen.getByText("1 picked · three or more")).toBeInTheDocument();
  });
});

describe("where you meet", () => {
  it("searches for a landmark, picks it, and lets the host change it", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.type(screen.getByLabelText("The landmark"), "freedom");
    await userEvent.click(screen.getByRole("button", { name: /Freedom Park/ }));
    expect(screen.getByText("Guests will be sent to Freedom Park")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.getByLabelText("The landmark")).toHaveValue("");
  });

  it("offers the typed words when nothing matches", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.type(screen.getByLabelText("The landmark"), "old fig tree");
    expect(screen.getByText(/Nothing by that name/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Use .old fig tree. anyway/ }));
    expect(screen.getByText("Guests will be sent to old fig tree")).toBeInTheDocument();
  });

  it("shows the meeting point photo once one is chosen", async () => {
    renderWithProviders(<Harness which="where" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(["x"], "gate.jpg", { type: "image/jpeg" }));
    expect(screen.getByAltText("Meeting point")).toHaveAttribute("src", "blob:gate");
  });
});

describe("the basics", () => {
  it("counts words and characters", async () => {
    renderWithProviders(<Harness which="basics" />);
    await userEvent.type(screen.getByLabelText(/The full description/), "one two three");
    expect(screen.getByText("3 words")).toBeInTheDocument();
  });
});
