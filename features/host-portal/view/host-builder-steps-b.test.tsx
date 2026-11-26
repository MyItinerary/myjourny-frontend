import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { builderHandlers } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepIncluded, StepPrice, StepWhen } from "./host-builder-steps-b";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => "approved" }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

function Harness({ which }: { which: "when" | "price" | "included" }) {
  const vm = useHostListingBuilderViewModel();
  return which === "when" ? <StepWhen vm={vm} /> : which === "price" ? <StepPrice vm={vm} /> : <StepIncluded vm={vm} />;
}

beforeEach(() => {
  server.use(...builderHandlers());
  window.localStorage.clear();
});

describe("date and time", () => {
  it("asks for the date and time, and shows nothing more until a schedule type is picked", () => {
    renderWithProviders(<Harness which="when" />);
    expect(screen.getByRole("heading", { name: "Date and time" })).toBeInTheDocument();
    expect(screen.getByText("Select the date and time of this experience. You can also block dates from your calendar.")).toBeInTheDocument();
    expect(screen.queryByText("Which days")).not.toBeInTheDocument();
  });

  it("builds a weekly schedule and lists the next dates", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /Repeating schedule/ }));
    await userEvent.click(screen.getByRole("button", { name: "Sat" }));
    // A start time and an end time, not a list of start times.
    expect(screen.queryByRole("button", { name: "Add another start time" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^How long it lasts/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "End time" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Start time" }));
    await userEvent.click(screen.getByRole("option", { name: "4:00pm" }));
    expect(screen.getByRole("button", { name: "Start time" })).toHaveTextContent("4:00pm");
    await userEvent.click(screen.getByRole("button", { name: "End time" }));
    await userEvent.click(screen.getByRole("option", { name: "7:00pm" }));
    expect(screen.getByRole("button", { name: "End time" })).toHaveTextContent("7:00pm");
    await userEvent.click(screen.getByRole("button", { name: "Every 2 weeks" }));

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.queryByText("This is what you just made")).not.toBeInTheDocument();
    expect(screen.getByText(/Sat at 16:00 · next five dates/)).toBeInTheDocument();
    expect(screen.getAllByText(/^Sat.*16:00$/)).toHaveLength(5);
  });

  it("sets when a repeating schedule stops with the calendar dropdown, and clears it", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /Repeating schedule/ }));
    expect(screen.queryByRole("group", { name: "Pick a date" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Repeat until: not picked" }));
    const calendar = screen.getByRole("group", { name: "Pick a date" });
    await userEvent.click(within(calendar).getByRole("button", { name: "Today" }));
    expect(screen.queryByRole("group", { name: "Pick a date" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Repeat until: .+ \d{4}$/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear repeat until" }));
    expect(screen.getByRole("button", { name: "Repeat until: not picked" })).toBeInTheDocument();
  });

  it("opens the calendar guests book with from the one-off date field, and closes it on a pick", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /One off/ }));
    expect(screen.queryByRole("group", { name: "Pick a date" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Date: not picked" }));
    const calendar = screen.getByRole("group", { name: "Pick a date" });
    expect(within(calendar).queryByText("No times")).not.toBeInTheDocument();
    await userEvent.click(within(calendar).getByRole("button", { name: "Today" }));

    expect(screen.queryByRole("group", { name: "Pick a date" })).not.toBeInTheDocument();
    const today = new Date();
    const weekday = today.toLocaleDateString("en-GB", { weekday: "long" });
    expect(screen.getByRole("button", { name: new RegExp(`^Date: ${weekday} ${today.getDate()} `) })).toBeInTheDocument();
    // The one-off date is required, so it has no clear button.
    expect(screen.queryByRole("button", { name: "Clear date" })).not.toBeInTheDocument();
  });

  it("gives a one-off a start time and an end time too", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /One off/ }));
    expect(screen.getByRole("button", { name: "End time" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Start time" }));
    await userEvent.click(screen.getByRole("option", { name: "10:00am" }));
    await userEvent.click(screen.getByRole("button", { name: "End time" }));
    await userEvent.click(screen.getByRole("option", { name: "1:30pm" }));
    expect(screen.getByRole("button", { name: "End time" })).toHaveTextContent("1:30pm");
  });

  it("offers Every day under a repeating schedule", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /Repeating schedule/ }));
    await userEvent.click(screen.getByRole("button", { name: "Every day" }));
    expect(screen.getByRole("button", { name: "Every day" })).toHaveAttribute("aria-pressed", "true");
    for (const day of ["Mon", "Sun"]) expect(screen.getByRole("button", { name: day })).toHaveAttribute("aria-pressed", "true");
  });

  it("takes a one-off date and time, and explains on request", async () => {
    renderWithProviders(<Harness which="when" />);
    await userEvent.click(screen.getByRole("button", { name: /One off/ }));
    await userEvent.click(screen.getByRole("button", { name: "Start time" }));
    await userEvent.click(screen.getByRole("option", { name: "12:30am" }));
    expect(screen.getByRole("button", { name: "Start time" })).toHaveTextContent("12:30am");

    await userEvent.click(screen.getByRole("button", { name: /Only on request/ }));
    expect(screen.getByText("Guests send you a request, and we email it to you with their contact details. It's important you reply within 24 hours.")).toBeInTheDocument();
  });
});

describe("group size and price", () => {
  it("works out what the host keeps and ignores letters", async () => {
    renderWithProviders(<Harness which="price" />);
    await userEvent.type(screen.getByLabelText(/^Price per person/), "9,0a00");
    await userEvent.type(screen.getByLabelText(/^Maximum guests/), "8");
    await userEvent.type(screen.getByLabelText(/^Minimum guests/), "2");
    expect(screen.queryByLabelText(/Price for the private group/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    await userEvent.type(screen.getByLabelText(/Price for the private group/), "50000");

    expect(screen.getByText("8 guests at ₦9,000 = ₦72,000")).toBeInTheDocument();
    expect(screen.getByText("₦61,200")).toBeInTheDocument();
    expect(screen.getByText(/Our commission, 15 percent/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "No" }));
    expect(screen.queryByLabelText(/Price for the private group/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(screen.getByLabelText(/Price for the private group/)).toHaveValue("");
  });

  it("explains our cancellation policy instead of asking for one", () => {
    renderWithProviders(<Harness which="price" />);
    expect(screen.queryByText("If a guest cancels")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Hours before the start/)).not.toBeInTheDocument();
    expect(screen.getByText(/cancel up to 24 hours before the experience and get a full refund/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the cancellation policy" })).toHaveAttribute("href", "/legal/cancellations");
  });
});

describe("what's included", () => {
  it("keeps four separate lists", async () => {
    renderWithProviders(<Harness which="included" />);
    expect(screen.getByText("Tell guests what's included, what isn't, what to bring and what to wear. Add one item per line.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Included line 1"), "Photos");
    await userEvent.type(screen.getByLabelText("Bring line 1"), "Water");
    expect(screen.getByText("Included")).toBeInTheDocument();
    expect(screen.queryByText("Included in the price")).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Add item" })[1]);
    expect(screen.getAllByLabelText(/^Not included line/)).toHaveLength(2);
    expect(screen.getByLabelText("Included line 1")).toHaveValue("Photos");
    expect(screen.getByLabelText("Wear line 1")).toHaveValue("");
  });
});
