import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { GUEST_TYPES } from "../view-model/use-search-bar-view-model";
import { WhoGuestsDropdownView } from "./who-guests-dropdown-view";

describe("WhoGuestsDropdownView", () => {
  const defaultProps = {
    variant: "hero" as const,
    guests: { adults: 1, children: 0, infants: 0 },
    totalGuests: 1,
    guestTypes: GUEST_TYPES,
    incrementGuest: vi.fn(),
    decrementGuest: vi.fn(),
    onSearch: vi.fn(),
  };

  it("renders guest rows and triggers increment/decrement callbacks", async () => {
    const incrementGuest = vi.fn();
    const decrementGuest = vi.fn();

    const { user } = renderWithProviders(
      <WhoGuestsDropdownView
        {...defaultProps}
        incrementGuest={incrementGuest}
        decrementGuest={decrementGuest}
      />,
    );

    expect(screen.getByText("Adults")).toBeInTheDocument();
    expect(screen.getByText("Children")).toBeInTheDocument();

    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);
    expect(incrementGuest).toHaveBeenCalledWith("adults");

    const minusButtons = screen.getAllByRole("button", { name: "-" });
    await user.click(minusButtons[0]);
    expect(decrementGuest).toHaveBeenCalledWith("adults");
  });

  it("does not render search button when allFieldsFilled is false even if totalGuests > 0", () => {
    renderWithProviders(
      <WhoGuestsDropdownView {...defaultProps} allFieldsFilled={false} />,
    );

    expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
  });

  it("renders and triggers search button when allFieldsFilled is true", async () => {
    const onSearch = vi.fn();
    const { user } = renderWithProviders(
      <WhoGuestsDropdownView {...defaultProps} allFieldsFilled={true} onSearch={onSearch} />,
    );

    const searchButton = screen.getByRole("button", { name: "Search" });
    expect(searchButton).toBeInTheDocument();
    await user.click(searchButton);
    expect(onSearch).toHaveBeenCalled();
  });
});
