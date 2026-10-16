import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ProfileCityViewModel } from "../view-model/use-profile-city-view-model";
import { CityDialogView } from "./city-dialog-view";

const lagos = { key: "popular:Lagos", name: "Lagos", detail: "Lagos State, Nigeria" };
const abuja = { key: "popular:Abuja", name: "Abuja", detail: "" };

function viewModel(overrides: Partial<ProfileCityViewModel> = {}): ProfileCityViewModel {
  return {
    open: true,
    search: "",
    onSearchChange: vi.fn(),
    listLabel: "Popular cities",
    choices: [lagos, abuja],
    selectedKey: null,
    onSelect: vi.fn(),
    searching: false,
    notice: null,
    locating: false,
    onUseMyLocation: vi.fn(),
    canSave: false,
    saving: false,
    onSave: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

describe("CityDialogView", () => {
  it("renders nothing while closed", () => {
    const { container } = renderWithProviders(<CityDialogView {...viewModel({ open: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists the cities and passes search, selection and location to the view-model", async () => {
    const vm = viewModel();
    const { user } = renderWithProviders(<CityDialogView {...vm} />);

    expect(screen.getByText("Popular cities")).toBeInTheDocument();
    expect(screen.getByText("Lagos State, Nigeria")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Search for a city" }), "a");
    await user.click(screen.getByRole("button", { name: /Abuja/ }));
    await user.click(screen.getByRole("button", { name: "Use my location" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(vm.onSearchChange).toHaveBeenCalledWith("a");
    expect(vm.onSelect).toHaveBeenCalledWith(abuja);
    expect(vm.onUseMyLocation).toHaveBeenCalled();
    expect(vm.onClose).toHaveBeenCalled();
  });

  it("marks the selected city and lets it be saved", async () => {
    const vm = viewModel({ selectedKey: lagos.key, canSave: true });
    const { user } = renderWithProviders(<CityDialogView {...vm} />);

    expect(screen.getByRole("button", { name: /Lagos/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(vm.onSave).toHaveBeenCalled();
  });

  it("shows searching, locating and saving states", () => {
    renderWithProviders(
      <CityDialogView {...viewModel({ searching: true, locating: true, saving: true, listLabel: null, search: "lag" })} />,
    );
    expect(screen.getByText("Searching…")).toBeInTheDocument();
    expect(screen.queryByText("Lagos")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finding your city…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it("shows a notice in place of an empty list", () => {
    renderWithProviders(
      <CityDialogView {...viewModel({ choices: [], notice: "Location is blocked for this site. Search for your city instead." })} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Location is blocked for this site.");
    expect(screen.queryByText("Popular cities")).not.toBeInTheDocument();
  });
});
