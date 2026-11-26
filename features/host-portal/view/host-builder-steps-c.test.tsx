import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { builderHandlers } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepBooking, StepReview, StepReviews } from "./host-builder-steps-c";

const toast = vi.hoisted(() => ({ info: vi.fn(), success: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => "approved" }));
vi.mock("sonner", () => ({ toast }));

function Harness({ which }: { which: "reviews" | "booking" | "review" }) {
  const vm = useHostListingBuilderViewModel();
  return which === "reviews" ? <StepReviews vm={vm} /> : which === "booking" ? <StepBooking vm={vm} /> : <StepReview vm={vm} />;
}

beforeEach(() => {
  server.use(...builderHandlers());
  window.localStorage.clear();
  toast.info.mockReset();
});

describe("reviews", () => {
  it("is optional, offers four places, asks for a link and says importing isn't available yet", async () => {
    renderWithProviders(<Harness which="reviews" />);
    expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByText(/Already have reviews on another site/)).toBeInTheDocument();
    expect(screen.queryByText(/No reviews yet/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Reviews stay exactly as written/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Google link")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Google/ }));
    expect(screen.getByRole("button", { name: "Import reviews" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Google link"), "https://maps.app.goo.gl/x");
    await userEvent.click(screen.getByRole("button", { name: "Import reviews" }));
    expect(toast.info).toHaveBeenCalledWith("Importing reviews isn't available yet, so nothing was imported.");
  });
});

describe("how guests book", () => {
  it("asks only for the booking type, with no cancellation terms", () => {
    renderWithProviders(<Harness which="booking" />);
    expect(screen.getByRole("heading", { name: "How guests book" })).toBeInTheDocument();
    expect(screen.queryByText(/what happens if they cancel/)).not.toBeInTheDocument();
    expect(screen.queryByText("Cancellation terms")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Strict/ })).not.toBeInTheDocument();
  });

  it("takes a booking type, with no note about saving", async () => {
    renderWithProviders(<Harness which="booking" />);
    await userEvent.click(screen.getByRole("button", { name: /Instant book/ }));
    expect(screen.getByRole("button", { name: /Instant book/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(/can't be saved from here yet/)).not.toBeInTheDocument();
  });
});

describe("review and publish", () => {
  it("breaks down each step in a section that opens, with what was entered and an edit link", async () => {
    renderWithProviders(<Harness which="review" />);
    expect(screen.getByRole("heading", { name: "Review and publish" })).toBeInTheDocument();
    expect(screen.queryByText("Everything we need")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/One line from you/)).not.toBeInTheDocument();
    expect(screen.queryByText(/It goes live straight away/)).not.toBeInTheDocument();
    // Publishing happens from the buttons under the form, not here.
    expect(screen.queryByRole("button", { name: "Publish this experience" })).not.toBeInTheDocument();

    const steps = within(screen.getByRole("list", { name: "Your experience, step by step" })).getAllByRole("listitem");
    expect(steps).toHaveLength(10);
    expect(within(steps[0]).getByText("Title and description")).toBeInTheDocument();
    expect(within(steps[0]).getByText("Needs something")).toBeInTheDocument();
    expect(within(steps[8]).getAllByText("Optional").length).toBeGreaterThan(0);

    await userEvent.click(within(steps[0]).getByText("Title and description"));
    expect(within(steps[0]).getByText("Title")).toBeVisible();
    expect(within(steps[0]).getAllByText("Not added").length).toBeGreaterThan(0);
    expect(within(steps[0]).getByRole("button", { name: "Edit Title and description" })).toBeInTheDocument();
  });
});
