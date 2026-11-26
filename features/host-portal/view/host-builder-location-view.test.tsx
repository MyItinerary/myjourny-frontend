import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { LocationPicker } from "./host-builder-location-view";

type Place = HostListingBuilderViewModel["place"];

const place = (over: Partial<Place> = {}): Place => ({
  query: "",
  open: false,
  results: [],
  noMatch: false,
  selected: [],
  suggestions: [],
  needsPin: false,
  onQuery: vi.fn(),
  onOpen: vi.fn(),
  onClose: vi.fn(),
  onToggle: vi.fn(),
  onUseTyped: vi.fn(),
  ...over,
});

describe("LocationPicker", () => {
  it("lists search results with a checkbox each, and picks one without closing", async () => {
    const onToggle = vi.fn();
    const onClose = vi.fn();
    const result = { name: "Freedom Park", area: "Lagos Island", lat: 6.45, lng: 3.39, picked: true };
    render(<LocationPicker place={place({ query: "free", open: true, results: [result, { ...result, name: "Freedom Square", picked: false }], onToggle, onClose })} />);

    const list = screen.getByRole("listbox", { name: "Search results" });
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    expect(within(list).getByRole("option", { name: /Freedom Park/ })).toHaveAttribute("aria-selected", "true");
    expect(within(list).getByRole("option", { name: /Freedom Square/ })).toHaveAttribute("aria-selected", "false");

    await userEvent.click(within(list).getByRole("option", { name: /Freedom Square/ }));
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ name: "Freedom Square" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes the results when focus leaves the search, not when it moves into the list", () => {
    const onClose = vi.fn();
    const result = { name: "Freedom Park", area: "", lat: 1, lng: 1, picked: false };
    render(<LocationPicker place={place({ query: "free", open: true, results: [result], onClose })} />);
    const input = screen.getByLabelText("Locations");
    const option = screen.getByRole("option", { name: /Freedom Park/ });

    fireEvent.blur(input, { relatedTarget: option });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.blur(input, { relatedTarget: document.body });
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the locations picked as chips with a close button, and the suggestions below", async () => {
    const onRemove = vi.fn();
    const onPick = vi.fn();
    render(
      <LocationPicker
        place={place({
          selected: [{ key: "a", name: "Lekki Phase 1", pinned: true, onRemove }, { key: "b", name: "the old fig tree", pinned: false, onRemove: vi.fn() }],
          suggestions: [{ key: "Abeokuta", name: "Abeokuta", onPick }],
          needsPin: false,
        })}
      />,
    );

    const yours = screen.getByRole("list", { name: "Your locations" });
    expect(within(yours).getAllByRole("listitem")[0]).toHaveClass("bg-[#F4F2EE]");
    expect(within(yours).getByText("not on the map")).toBeInTheDocument();
    await userEvent.click(within(yours).getByRole("button", { name: "Remove Lekki Phase 1" }));
    expect(onRemove).toHaveBeenCalled();

    expect(screen.getByText("Suggestions")).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole("group", { name: "Suggestions" })).getByRole("button", { name: "Abeokuta" }));
    expect(onPick).toHaveBeenCalled();
  });

  it("offers to use what was typed when nothing matches", async () => {
    const onUseTyped = vi.fn();
    render(<LocationPicker place={place({ query: "old fig", open: true, noMatch: true, onUseTyped })} />);
    await userEvent.click(screen.getByRole("button", { name: /Use .old fig. anyway/ }));
    expect(onUseTyped).toHaveBeenCalled();
  });

  it("warns when none of the locations is on the map", () => {
    render(<LocationPicker place={place({ needsPin: true })} />);
    expect(screen.getByText(/None of these are on the map yet/)).toBeInTheDocument();
  });
});
