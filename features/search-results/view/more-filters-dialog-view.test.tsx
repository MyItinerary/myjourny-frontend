import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { buildResultsVm, withFilters } from "@/test/utils/search-results-vm";

import { MoreFiltersDialogView } from "./more-filters-dialog-view";

const open = (overrides = {}) => buildResultsVm({ panelOpen: true, ...overrides });

// These cases cover events too; the events-off cases switch the flag back off.
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("MoreFiltersDialogView", () => {
  it("renders nothing while closed", () => {
    renderWithProviders(<MoreFiltersDialogView {...buildResultsVm()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows every section, with Experiences and Events as separate category groups", () => {
    renderWithProviders(<MoreFiltersDialogView {...open()} />);

    for (const heading of ["Type", "Featured", "Category", "Price", "Collections", "Place", "Time of day", "Who it suits"]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText("Experiences", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Events", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Local food & drinks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Music & live shows" })).toBeInTheDocument();
    expect(screen.getByText("Choose one to see more filters.")).toBeInTheDocument();
    // No type yet: the type-specific filters aren't there.
    expect(screen.queryByRole("heading", { name: "Experiences" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Events" })).not.toBeInTheDocument();
  });

  it("keeps icons on the category chips in the panel", () => {
    renderWithProviders(<MoreFiltersDialogView {...open()} />);

    expect(screen.getByRole("button", { name: "Local food & drinks" }).querySelector("svg")).not.toBeNull();
  });

  it("shows the Experiences filters once Experiences is chosen", async () => {
    const setFlag = vi.fn();
    const setGroupSize = vi.fn();
    const toggleOption = vi.fn();
    const filters = withFilters({ types: ["experiences"] });
    const { user } = renderWithProviders(<MoreFiltersDialogView {...open({ filters, setFlag, setGroupSize, toggleOption })} />);

    expect(screen.getByRole("heading", { name: "Experiences" })).toBeInTheDocument();
    for (const label of ["Free cancellation", "Verified host", "Host replies within 2 hours", "Not weather dependent"]) {
      expect(screen.getByRole("switch", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Hausa" })).toBeDisabled();

    await user.click(screen.getByRole("switch", { name: "Verified host" }));
    expect(setFlag).toHaveBeenCalledWith("verifiedHost", true);
    await user.click(screen.getByRole("button", { name: "More group size" }));
    expect(setGroupSize).toHaveBeenCalledWith(2);
    await user.click(screen.getByRole("button", { name: "Half day" }));
    expect(toggleOption).toHaveBeenCalledWith("duration", "half_day");
    // One category group when a type is chosen.
    expect(screen.queryByText("Experiences", { selector: "p" })).not.toBeInTheDocument();
  });

  it("shows the Events filters, Hide sold out on by default, and Genre only after Music", () => {
    const events = withFilters({ types: ["events"] });
    const { rerender } = renderWithProviders(<MoreFiltersDialogView {...open({ filters: events })} />);

    expect(screen.getByRole("switch", { name: "Hide sold out" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Student discount" })).not.toBeChecked();
    expect(screen.queryByRole("button", { name: "Afrobeats" })).not.toBeInTheDocument();

    rerender(
      <MoreFiltersDialogView {...open({ filters: withFilters({ types: ["events"], categories: ["music-live-shows"] }) })} />,
    );
    expect(screen.getByRole("button", { name: "Afrobeats" })).toBeInTheDocument();
  });

  it("without the quiz asks to take it; after the quiz nests subcategories under the selected category", () => {
    const filters = withFilters({ categories: ["local-food-drinks"] });
    const { rerender } = renderWithProviders(<MoreFiltersDialogView {...open({ filters })} />);

    expect(screen.getByText(/Take the taste quiz and we'll show more filters/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Make it mine" })).toHaveAttribute("href", "/onboarding");
    expect(screen.queryByRole("button", { name: "Cafés & coffee culture" })).not.toBeInTheDocument();

    rerender(<MoreFiltersDialogView {...open({ filters, tookQuiz: true })} />);
    expect(screen.queryByRole("link", { name: "Make it mine" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cafés & coffee culture" })).toBeInTheDocument();
    // The subcategories stand alone: no categories above them.
    expect(screen.queryByRole("button", { name: "Culture & history" })).not.toBeInTheDocument();
    expect(screen.queryByText("For you")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Picked for your taste" })).toBeInTheDocument();
  });

  it("points at the types when none is chosen, and says what a type change cleared", async () => {
    const toggleType = vi.fn();
    const { user, rerender } = renderWithProviders(<MoreFiltersDialogView {...open({ toggleType })} />);

    expect(screen.getByText(/Want more filters\? Choose/)).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Events" }).at(-1) as HTMLElement);
    expect(toggleType).toHaveBeenCalledWith("events");

    rerender(<MoreFiltersDialogView {...open({ clearedNote: 2 })} />);
    expect(screen.getByText("Cleared 2 filters that don't apply")).toBeInTheDocument();
  });

  it("greys the footer button when nothing matches and labels it after the type", () => {
    const { rerender } = renderWithProviders(<MoreFiltersDialogView {...open({ total: 12, footerLabel: "Show 12 events" })} />);
    expect(screen.getByRole("button", { name: "Show 12 events" })).toBeEnabled();

    rerender(<MoreFiltersDialogView {...open({ total: 0 })} />);
    expect(screen.getByRole("button", { name: "No matching experiences" })).toBeDisabled();
  });

  it("picks type, featured, category, price toggle and a place", async () => {
    const toggleType = vi.fn();
    const toggleCategory = vi.fn();
    const pickTonight = vi.fn();
    const toggleFree = vi.fn();
    const toggleOption = vi.fn();
    const { user } = renderWithProviders(
      <MoreFiltersDialogView {...open({ toggleType, toggleCategory, pickTonight, toggleFree, toggleOption })} />,
    );

    await user.click(screen.getAllByRole("button", { name: "Experiences" })[0]);
    expect(toggleType).toHaveBeenCalledWith("experiences");
    await user.click(screen.getByRole("button", { name: "Culture & history" }));
    expect(toggleCategory).toHaveBeenCalledWith("culture-history");
    await user.click(screen.getByRole("button", { name: "Tonight" }));
    expect(pickTonight).toHaveBeenCalled();
    await user.click(screen.getByRole("switch", { name: "Free" }));
    expect(toggleFree).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Lekki" }));
    expect(toggleOption).toHaveBeenCalledWith("area", "Lekki");
    expect(screen.getByRole("button", { name: "Eid" })).toBeDisabled();
  });

  it("clears all and closes", async () => {
    const clearAll = vi.fn();
    const closePanel = vi.fn();
    const { user } = renderWithProviders(<MoreFiltersDialogView {...open({ hasActiveFilters: true, clearAll, closePanel })} />);

    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(clearAll).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Close filters" }));
    expect(closePanel).toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(closePanel).toHaveBeenCalledTimes(2);
  });
});

describe("MoreFiltersDialogView while events are off", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", ""));

  it("offers Experiences only, with no Events type, group or hint", () => {
    renderWithProviders(<MoreFiltersDialogView {...open()} />);

    expect(screen.queryByRole("button", { name: "Events" })).not.toBeInTheDocument();
    expect(screen.queryByText("Events", { selector: "p" })).not.toBeInTheDocument();
    const hint = screen.getByText(/Want more filters\? Choose/);
    expect(hint).toHaveTextContent("Want more filters? Choose Experiences above.");
  });
});
