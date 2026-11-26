import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { builderHandlers } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepRequirements } from "./host-builder-step-requirements-view";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => "approved" }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  server.use(...builderHandlers());
  window.localStorage.clear();
});

function Requirements() {
  const vm = useHostListingBuilderViewModel();
  return <StepRequirements vm={vm} />;
}

describe("requirements and safety", () => {
  it("asks for fitness level, who can come, dietary needs and accessibility, in plain words", async () => {
    renderWithProviders(<Requirements />);
    expect(screen.getByText("Tell guests what this experience asks of them, so the right people book and nobody is caught out on the day.")).toBeInTheDocument();
    for (const label of ["Fitness level", "Who can come", "Dietary needs you can cater for", "Accessibility"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText(/Pick nothing if food/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Moderate" }));
    expect(screen.getByRole("button", { name: "Moderate" })).toHaveAttribute("aria-pressed", "true");

    // An age box only for the policies that need one.
    await userEvent.click(screen.getByRole("button", { name: "All ages" }));
    expect(screen.queryByLabelText("Youngest age allowed")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "From a set age" }));
    await userEvent.type(screen.getByLabelText("Youngest age allowed"), "1x2");
    expect(screen.getByLabelText("Youngest age allowed")).toHaveValue("12");
    await userEvent.click(screen.getByRole("button", { name: "Under a set age with an adult" }));
    expect(screen.getByLabelText("Guests under this age must come with an adult")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Partly accessible" }));
    await userEvent.type(screen.getByLabelText(/Anything else guests should know about access/), "Two flights of stairs");
    expect(screen.getByLabelText(/Anything else guests should know about access/)).toHaveValue("Two flights of stairs");
    await userEvent.click(screen.getByRole("button", { name: "Halal" }));
    expect(screen.getByRole("button", { name: "Halal" })).toHaveAttribute("aria-pressed", "true");
  });

  it("asks whether guests need to swim as a yes or no choice", async () => {
    renderWithProviders(<Requirements />);
    const swim = screen.getByRole("radiogroup", { name: "Do guests need to know how to swim?" });
    await userEvent.click(within(swim).getByRole("button", { name: "Yes" }));
    expect(within(swim).getByRole("button", { name: "Yes" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(within(swim).getByRole("button", { name: "No" }));
    expect(within(swim).getByRole("button", { name: "No" })).toHaveAttribute("aria-pressed", "true");
    expect(within(swim).getByRole("button", { name: "Yes" })).toHaveAttribute("aria-pressed", "false");
  });

  it("explains what guests see when bad weather could cancel it", async () => {
    renderWithProviders(<Requirements />);
    expect(screen.queryByText(/What guests see:/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: "Bad weather could cancel this experience" }));
    expect(screen.getByText(/move to\s+another date for free or get a full refund/)).toBeInTheDocument();
    expect(screen.queryByText(/next Saturday/)).not.toBeInTheDocument();
  });

  it("asks the host to tick the safety declaration, with links to the rules and to us", async () => {
    renderWithProviders(<Requirements />);
    const box = screen.getByRole("checkbox", { name: /host safety rules/ });
    expect(box).not.toBeChecked();
    expect(screen.getByRole("link", { name: "host safety rules" })).toHaveAttribute("href", "/legal/safety");
    expect(screen.getByRole("link", { name: "tell MyJourny" })).toHaveAttribute("href", "mailto:support@myjourny.app");
    await userEvent.click(box);
    expect(box).toBeChecked();
  });
});
