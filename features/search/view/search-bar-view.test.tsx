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
    selectedDate: new Date(2030, 5, 1),
    whoText: "",
    guests: { adults: 0, children: 0, infants: 0 },
    totalGuests: 0,
    allFieldsFilled: false,
    isSearchingExperiences: false,
    suggestedExperiences: [],
    filteredDestinations: [],
    filteredActivities: [],
    guestTypes: GUEST_TYPES,
    setActiveTab: vi.fn(),
    setWhereInput: vi.fn(),
    setWhoInput: vi.fn(),
    onSelectDestination: vi.fn(),
    onSelectActivity: vi.fn(),
    onSelectExperience: vi.fn(),
    onSelectDate: vi.fn(),
    onNavigateToDestination: vi.fn(),
    onNavigateToActivity: vi.fn(),
    onNavigateToExperience: vi.fn(),
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

  it("renders calendar modal when activeTab is 'when'", () => {
    renderWithProviders(<SearchBarView {...defaultVm} activeTab="when" />);

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
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
