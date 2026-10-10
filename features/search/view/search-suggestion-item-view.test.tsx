import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import {
  ExperienceSuggestionItem,
  SearchSuggestionList,
} from "./search-suggestion-item-view";

describe("SearchSuggestionList", () => {
  const defaultProps = {
    destinations: [{ id: "lagos", city: "Lagos, Nigeria", description: "Beaches" }],
    activities: [{ id: "food", label: "Local food", subtitle: "Eats" }],
    experiences: [
      {
        id: "exp-1",
        title: "Nike Art Gallery Deep Dive",
        city: "Lagos",
        price_from: 15000,
        currency: "NGN",
        subtitle: "Lagos · from NGN 15,000",
        fallbackImage: "/images/home/experiences/kayaking.jpg",
      },
    ],
    isSearchingExperiences: false,
    query: "",
    onSelectDestination: vi.fn(),
    onSelectActivity: vi.fn(),
    onSelectExperience: vi.fn(),
  };

  it("renders destinations and triggers callback on click", async () => {
    const onSelectDestination = vi.fn();
    const { user } = renderWithProviders(
      <SearchSuggestionList {...defaultProps} onSelectDestination={onSelectDestination} />,
    );

    expect(screen.getByText("Lagos, Nigeria")).toBeInTheDocument();
    await user.click(screen.getByText("Lagos, Nigeria"));
    expect(onSelectDestination).toHaveBeenCalledWith(defaultProps.destinations[0]);
  });

  it("renders activities and triggers callback on click", async () => {
    const onSelectActivity = vi.fn();
    const { user } = renderWithProviders(
      <SearchSuggestionList {...defaultProps} onSelectActivity={onSelectActivity} />,
    );

    expect(screen.getByText("Local food")).toBeInTheDocument();
    await user.click(screen.getByText("Local food"));
    expect(onSelectActivity).toHaveBeenCalledWith(defaultProps.activities[0]);
  });

  it("renders experiences and triggers callback on click", async () => {
    const onSelectExperience = vi.fn();
    const { user } = renderWithProviders(
      <SearchSuggestionList {...defaultProps} onSelectExperience={onSelectExperience} />,
    );

    expect(screen.getByText("Nike Art Gallery Deep Dive")).toBeInTheDocument();
    await user.click(screen.getByText("Nike Art Gallery Deep Dive"));
    expect(onSelectExperience).toHaveBeenCalledWith(defaultProps.experiences[0]);
  });

  it("shows searching indicator when waiting for query", () => {
    renderWithProviders(
      <SearchSuggestionList
        {...defaultProps}
        experiences={[]}
        isSearchingExperiences={true}
        query="Nike"
      />,
    );

    expect(screen.getByText(/Searching experiences/i)).toBeInTheDocument();
  });

  it("shows empty state when no items match", () => {
    renderWithProviders(
      <SearchSuggestionList
        {...defaultProps}
        destinations={[]}
        activities={[]}
        experiences={[]}
        query="Nonexistent"
      />,
    );

    expect(screen.getByText(/No destinations, activities, or experiences found/i)).toBeInTheDocument();
  });
});

describe("ExperienceSuggestionItem", () => {
  it("renders experience with the subtitle it is given and handles selection", async () => {
    const onSelect = vi.fn();
    const exp = {
      id: "exp-42",
      title: "Lekki Conservation Walk",
      city: "Lagos",
      price_from: 8000,
      currency: "NGN",
      subtitle: "Lagos · from NGN 8,000",
      fallbackImage: "/images/home/experiences/kayaking.jpg",
    };

    const { user } = renderWithProviders(
      <ExperienceSuggestionItem experience={exp} onSelect={onSelect} />,
    );

    expect(screen.getByText("Lekki Conservation Walk")).toBeInTheDocument();
    expect(screen.getByText("Lagos · from NGN 8,000")).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(exp);
  });
});
