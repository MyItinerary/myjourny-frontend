import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { HostListingBuilderView } from "./host-listing-builder-view";

const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: nav.push }) }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }));

function Builder() {
  const vm = useHostListingBuilderViewModel();
  return <HostListingBuilderView vm={vm} />;
}

beforeEach(() => {
  window.localStorage.clear();
  URL.createObjectURL = vi.fn((f: Blob) => `blob:${(f as File).name}`);
});

const next = () => userEvent.click(screen.getByRole("button", { name: "Continue" }));

describe("the listing builder", () => {
  it("opens on the basics and the guest preview follows what is typed", async () => {
    renderWithProviders(<Builder />);
    expect(screen.getByRole("heading", { name: "The basics" })).toBeInTheDocument();
    expect(screen.getByText("0 of 8 sections done")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^Title/), "Island Walk");
    const preview = screen.getByRole("complementary", { name: "What the guest sees" });
    expect(within(preview).getByText("Island Walk")).toBeInTheDocument();
    expect(screen.getByText("11/60")).toBeInTheDocument();
  });

  it("shows and hides the writing tip", async () => {
    renderWithProviders(<Builder />);
    await userEvent.click(screen.getByRole("button", { name: /Most hosts describe the activity/ }));
    expect(screen.getByText("Alive")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Most hosts describe the activity/ }));
    expect(screen.queryByText("Alive")).not.toBeInTheDocument();
  });

  it("walks every section and can go back", async () => {
    renderWithProviders(<Builder />);
    for (const title of ["Category and tags", "Where you meet", "When it runs", "Group size and price", "What's included", "Requirements and safety", "Photos"]) {
      await next();
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    await userEvent.click(screen.getAllByRole("button", { name: "Review and publish" }).at(-1)!);
    expect(screen.getByRole("heading", { name: "Review and publish" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish this listing" })).toBeDisabled();

    await userEvent.click(screen.getAllByRole("button", { name: "Finish this" })[0]);
    expect(screen.getByRole("heading", { name: "The basics" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Category and tags/ }));
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "The basics" })).toBeInTheDocument();
  });

  it("saves and leaves", async () => {
    renderWithProviders(<Builder />);
    await userEvent.click(screen.getByRole("button", { name: "Save and finish later" }));
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/listings");
  });
});
