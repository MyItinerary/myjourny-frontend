import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { GUEST_TYPES } from "../view-model/use-search-bar-view-model";
import { SearchBarView } from "./search-bar-view";

describe("SearchBarView", () => {
  const defaultVm = {
    variant: "hero" as const,
    activeTab: null,
    selectedWhere: "",
    debouncedWhere: "",
    selectedWhen: "",
    draftRange: { start: null, end: null },
    whoText: "",
    guests: { adults: 0, children: 0, infants: 0 },
    totalGuests: 0,
    canSearch: false,
    isSearchingExperiences: false,
    suggestedExperiences: [],
    filteredDestinations: [],
    filteredActivities: [],
    filteredEvents: [],
    guestTypes: GUEST_TYPES,
    setActiveTab: vi.fn(),
    setWhereInput: vi.fn(),
    setWhoInput: vi.fn(),
    onSelectDestination: vi.fn(),
    onSelectActivity: vi.fn(),
    onSelectExperience: vi.fn(),
    onSelectEvent: vi.fn(),
    onPickDate: vi.fn(),
    onPickDatePreset: vi.fn(),
    onApplyDates: vi.fn(),
    onClearDates: vi.fn(),
    onAnyDate: vi.fn(),
    onNavigateToDestination: vi.fn(),
    onNavigateToActivity: vi.fn(),
    onNavigateToExperience: vi.fn(),
    onNavigateToEvent: vi.fn(),
    updateGuests: vi.fn(),
    incrementGuest: vi.fn(),
    decrementGuest: vi.fn(),
    onSearch: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders Where, When, Who tabs and disabled search button", () => {
    renderWithProviders(<SearchBarView {...defaultVm} />);

    expect(screen.getByLabelText("Where")).toBeInTheDocument();
    expect(screen.getByLabelText("When")).toBeInTheDocument();
    expect(screen.getByLabelText("Who")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  it("calls setWhereInput on user typing", async () => {
    const setWhereInput = vi.fn();
    const { user } = renderWithProviders(
      <SearchBarView {...defaultVm} setWhereInput={setWhereInput} />,
    );

    const input = screen.getByPlaceholderText(/Search destinations/i);
    await user.type(input, "Lagos");
    expect(setWhereInput).toHaveBeenCalled();
  });

  it("opens the dual-date picker when activeTab is 'when', with Tonight as the first quick pick", async () => {
    const onApplyDates = vi.fn();
    const onClearDates = vi.fn();
    const onPickDatePreset = vi.fn();
    const { user } = renderWithProviders(
      <SearchBarView
        {...defaultVm}
        activeTab="when"
        draftRange={{ start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) }}
        onApplyDates={onApplyDates}
        onClearDates={onClearDates}
        onPickDatePreset={onPickDatePreset}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Dates" })).toBeInTheDocument();
    expect(screen.getByText("November 2030")).toBeInTheDocument();
    expect(screen.getByText("December 2030")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^(Tonight|Tomorrow|This weekend|Next 7 days|Next weekend|Any date)$/ })[0]).toHaveTextContent("Tonight");

    await user.click(screen.getByRole("button", { name: "Tomorrow" }));
    expect(onPickDatePreset).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClearDates).toHaveBeenCalled();
    await user.click(screen.getAllByRole("button", { name: /Apply/ })[0]);
    expect(onApplyDates).toHaveBeenCalled();
  });

  it("renders guest selectors when activeTab is 'who'", async () => {
    const incrementGuest = vi.fn();
    const { user } = renderWithProviders(
      <SearchBarView {...defaultVm} activeTab="who" incrementGuest={incrementGuest} />,
    );

    expect(screen.getByText("Adults")).toBeInTheDocument();
    expect(screen.getByText("Children")).toBeInTheDocument();

    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);
    expect(incrementGuest).toHaveBeenCalledWith("adults");
  });
});
