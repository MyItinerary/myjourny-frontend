import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepIncluded, StepPrice, StepWhen } from "./host-builder-steps-b";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }));

function Harness({ which }: { which: "when" | "price" | "included" }) {
  const vm = useHostListingBuilderViewModel();
  return which === "when" ? <StepWhen vm={vm} /> : which === "price" ? <StepPrice vm={vm} /> : <StepIncluded vm={vm} />;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("when it runs", () => {
  it("shows nothing until a shape is picked", () => {
    renderWithProviders(<Harness which="when" />);
    expect(screen.queryByText("Which days")).not.toBeInTheDocument();
  });

  it("builds a weekly schedule and lists the next dates", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /A repeating schedule/ }));
    await userEvent.click(screen.getByRole("button", { name: "Sat" }));
    await userEvent.click(screen.getByRole("button", { name: "Add another start time" }));
    await userEvent.type(screen.getByLabelText("Start time 1"), "16:00");
    await userEvent.click(screen.getByRole("button", { name: "Every 2 weeks" }));

    expect(screen.getByText(/Sat at 16:00 · next five dates/)).toBeInTheDocument();
    expect(screen.getAllByText(/^Sat.*16:00$/)).toHaveLength(5);

    await userEvent.click(screen.getByRole("button", { name: "Remove start time 1" }));
    expect(screen.queryByLabelText("Start time 1")).not.toBeInTheDocument();
  });

  it("takes a one-off date and time, and explains on request", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /A one off/ }));
    await userEvent.type(screen.getByLabelText("Start time"), "16:00");
    expect(screen.getByLabelText("Start time")).toHaveValue("16:00");

    await userEvent.click(screen.getByRole("button", { name: /Only on request/ }));
    expect(screen.getByText(/Guests will ask for a date/)).toBeInTheDocument();
  });
});

describe("group size and price", () => {
  it("works out what the host keeps and ignores letters", async () => {
    renderWithProviders(<Harness which="price" />);
    await userEvent.type(screen.getByLabelText(/^Price per person/), "9,0a00");
    await userEvent.type(screen.getByLabelText(/^Most you can handle/), "8");
    await userEvent.type(screen.getByLabelText(/^Smallest group you will run/), "2");
    await userEvent.type(screen.getByLabelText(/Price for one private group/), "50000");

    expect(screen.getByText("8 guests at ₦9,000 = ₦72,000")).toBeInTheDocument();
    expect(screen.getByText("₦61,200")).toBeInTheDocument();
    expect(screen.getByText(/Our commission, 15 percent/)).toBeInTheDocument();
  });
});

describe("what's included", () => {
  it("keeps four separate lists", async () => {
    renderWithProviders(<Harness which="included" />);
    await userEvent.type(screen.getByLabelText("Included line 1"), "Photos");
    await userEvent.type(screen.getByLabelText("Bring line 1"), "Water");
    await userEvent.click(screen.getAllByRole("button", { name: "Add a line" })[1]);
    expect(screen.getAllByLabelText(/^Not included line/)).toHaveLength(2);
    expect(screen.getByLabelText("Included line 1")).toHaveValue("Photos");
    expect(screen.getByLabelText("Wear line 1")).toHaveValue("");
  });
});
