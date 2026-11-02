import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { HostBuilderPreviewView } from "./host-builder-preview-view";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }));

function Harness() {
  const vm = useHostListingBuilderViewModel();
  return (
    <>
      <input aria-label="t" onChange={(e) => vm.onField("title", e.target.value)} />
      <input aria-label="q" onChange={(e) => vm.onField("quote", e.target.value)} />
      <input aria-label="inc" onChange={(e) => vm.onListSet("inc", 0, e.target.value)} />
      <HostBuilderPreviewView vm={vm} />
    </>
  );
}

beforeEach(() => window.localStorage.clear());

describe("the guest preview", () => {
  it("starts with placeholders", () => {
    renderWithProviders(<Harness />);
    expect(screen.getByText("Your title goes here")).toBeInTheDocument();
    expect(screen.getByText("Your cover photo shows here")).toBeInTheDocument();
    expect(screen.getByText("Price not set")).toBeInTheDocument();
    expect(screen.getByText("How they book, not set")).toBeInTheDocument();
  });

  it("fills in the title, the host's line and what's included as they are written", async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(screen.getByLabelText("t"), "Island Walk");
    await userEvent.type(screen.getByLabelText("q"), "See you");
    await userEvent.type(screen.getByLabelText("inc"), "Photos");

    expect(screen.getByText("Island Walk")).toBeInTheDocument();
    expect(screen.getByText("“See you”")).toBeInTheDocument();
    expect(screen.getByText("Photos")).toBeInTheDocument();
    expect(screen.queryByText("Your title goes here")).not.toBeInTheDocument();
  });
});
