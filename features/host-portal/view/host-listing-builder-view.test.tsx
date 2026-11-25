import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { builderHandlers } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { HostListingBuilderView } from "./host-listing-builder-view";

const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: nav.push, replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => "approved" }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

function Builder() {
  const vm = useHostListingBuilderViewModel();
  return <HostListingBuilderView vm={vm} />;
}

beforeEach(() => {
  server.use(...builderHandlers());
  window.localStorage.clear();
  URL.createObjectURL = vi.fn((f: Blob) => `blob:${(f as File).name}`);
});

const next = () => userEvent.click(screen.getByRole("button", { name: "Continue" }));
const KEY = "myjourny:host-listing-draft";
const LONG = Array.from({ length: 500 }, (_, i) => `word${i}`).join(" ");
/** A draft with step 1 written, so the host can move on from it. */
const seedBasics = (extra: Record<string, unknown> = {}) =>
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ title: "Island walk", hook: "Six streets.", desc: LONG, cats: ["Art & creativity"], subs: ["Photography walk"], tags: ["Walking"], ...extra }),
  );

describe("the experience builder", () => {
  it("opens on the title and description, with no guest preview beside it, and counts the title", async () => {
    renderWithProviders(<Builder />);
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "The basics" })).not.toBeInTheDocument();
    expect(screen.getByText("0 of 8 sections done")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/^Title/), "Island Walk");
    expect(screen.queryByRole("complementary", { name: "What the guest sees" })).not.toBeInTheDocument();
    expect(screen.getByText("11/60")).toBeInTheDocument();
  });

  it("shows the tip for the field last clicked into, and keeps it after clicking away so it can be copied", async () => {
    renderWithProviders(<Builder />);
    expect(screen.queryByRole("complementary", { name: /^Tips for/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/^Title/));
    expect(screen.getByRole("complementary", { name: "Tips for the title" })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/^Short description/));
    expect(screen.getByRole("complementary", { name: "Tips for the short description" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Tips for the title" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/^Long description/));
    expect(screen.getByRole("complementary", { name: "Tips for the long description" })).toBeInTheDocument();

    await userEvent.click(document.body);
    expect(screen.getByRole("complementary", { name: "Tips for the long description" })).toBeInTheDocument();
  });

  it("holds Continue until the title and both descriptions are written", async () => {
    renderWithProviders(<Builder />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Category and tags/ })).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/^Long description/), "Too short");
    expect(screen.getByText("Write at least 100 words. 98 to go.")).toBeInTheDocument();
    expect(screen.getByText("2 of 1,000 words")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("walks every section and can go back", async () => {
    seedBasics();
    renderWithProviders(<Builder />);
    for (const title of ["Category and tags", "Location", "When it runs", "Group size and price", "What's included", "Requirements and safety", "Photos", "Reviews", "How guests book"]) {
      await next();
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    await userEvent.click(screen.getAllByRole("button", { name: "Review and publish" }).at(-1)!);
    expect(screen.getByRole("heading", { name: "Review and publish" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish this experience" })).toBeDisabled();

    // Steps 1 and 2 are filled in, so the first thing still missing is where to meet.
    await userEvent.click(screen.getAllByRole("button", { name: "Finish this" })[0]);
    expect(screen.getByRole("heading", { name: "Location" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    await userEvent.click(within(screen.getByRole("navigation", { name: "Experience sections" })).getByRole("button", { name: /Title and description/ }));
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument();
  });

  it("saves and leaves", async () => {
    renderWithProviders(<Builder />);
    const save = screen.getByRole("button", { name: "Save and exit" });
    expect(save).toHaveClass("shadow-[inset_0_0_0_1px_#E7E7E7]");
    await userEvent.click(save);
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/listings");
  });
});

describe("the experience builder, from a template", () => {
  beforeEach(() => {
    seedBasics({ title: "Golden hour portrait walk", template: "Golden hour portrait walk", prefilled: [1, 2, 4, 5, 6, 7], checked: [] });
  });

  it("holds Continue until the host ticks that they checked the section", async () => {
    renderWithProviders(<Builder />);

    expect(screen.getByLabelText(/^Title/)).toHaveValue("Golden hour portrait walk");
    expect(screen.getByText(/filled this in from the "Golden hour portrait walk" template/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Category and tags/ })).toBeDisabled();

    await userEvent.click(screen.getByRole("checkbox", { name: /I have checked this section/ }));
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    await next();
    expect(screen.getByRole("heading", { name: "Category and tags" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /I have checked this section/ })).not.toBeChecked();
  });
});
