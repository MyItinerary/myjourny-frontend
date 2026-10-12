import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { GUEST_TYPES } from "../view-model/use-search-bar-view-model";
import { MobileSearchModalView } from "./mobile-search-modal-view";

describe("MobileSearchModalView", () => {
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

  it("renders search input and closes on button click", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <MobileSearchModalView {...defaultVm} onClose={onClose} />,
    );

    expect(screen.getByRole("heading", { name: "Search" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close search" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("triggers setWhereInput when typing in search input", async () => {
    const setWhereInput = vi.fn();
    const { user } = renderWithProviders(
      <MobileSearchModalView {...defaultVm} setWhereInput={setWhereInput} />,
    );

    const input = screen.getByPlaceholderText(/Search destinations/i);
    await user.type(input, "Abuja");
    expect(setWhereInput).toHaveBeenCalled();
  });

  it("triggers onSearch when pressing Enter", async () => {
    const onSearch = vi.fn();
    const { user } = renderWithProviders(
      <MobileSearchModalView {...defaultVm} selectedWhere="Lagos" onSearch={onSearch} />,
    );

    const input = screen.getByPlaceholderText(/Search destinations/i);
    await user.type(input, "{enter}");
    expect(onSearch).toHaveBeenCalled();
  });
});
