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

/** Every required step filled in, so the host can go anywhere. */
const seedComplete = () =>
  seedBasics({
    locations: [{ name: "Freedom Park", lat: 6.45, lng: 3.39 }],
    cue: "The blue gate",
    meetPhoto: "https://res.cloudinary.com/demo/gate.jpg",
    whenType: "request",
    price: "15000",
    maxG: "8",
    inc: ["Photos"],
    exc: ["Lunch"],
    fitness: "easy",
    agePolicy: "all_ages",
    access: "not_suitable",
    safetyAgreed: true,
    photos: ["1", "2", "3", "4"].map((n) => `https://res.cloudinary.com/demo/${n}.jpg`),
    photoRightsAgreed: true,
  });

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
    seedComplete();
    renderWithProviders(<Builder />);
    for (const title of ["Category and tags", "Location", "Date and time", "Group size and price", "What's included", "Requirements and safety", "Photos", "Reviews", "How guests book"]) {
      await next();
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    await userEvent.click(screen.getAllByRole("button", { name: "Review and publish" }).at(-1)!);
    expect(screen.getByRole("heading", { name: "Review and publish" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish this experience" })).toBeInTheDocument();

    // Edit from the review goes straight to that step.
    const location = within(screen.getByRole("list", { name: "Your experience, step by step" })).getAllByRole("listitem")[2];
    await userEvent.click(within(location).getByText("Location"));
    await userEvent.click(within(location).getByRole("button", { name: "Edit Location" }));
    expect(screen.getByRole("heading", { name: "Location" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    await userEvent.click(within(screen.getByRole("navigation", { name: "Experience sections" })).getByRole("button", { name: /Title and description/ }));
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument();
  });

  it("puts Publish where Continue sits, beside Save and exit, and edits a step from the review", async () => {
    seedComplete();
    renderWithProviders(<Builder />);
    await userEvent.click(within(screen.getByRole("navigation", { name: "Experience sections" })).getByRole("button", { name: /Review and publish/ }));
    const publish = screen.getByRole("button", { name: "Publish this experience" });
    expect(publish.parentElement).toContainElement(screen.getByRole("button", { name: "Save and exit" }));
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();

    const location = within(screen.getByRole("list", { name: "Your experience, step by step" })).getAllByRole("listitem")[2];
    await userEvent.click(within(location).getByText("Location"));
    await userEvent.click(within(location).getByRole("button", { name: "Edit Location" }));
    expect(screen.getByRole("heading", { name: "Location" })).toBeInTheDocument();
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
    seedBasics({ title: "Golden hour portrait walk" });
  });

  it("has no box to tick, and moves on once the step is filled in", async () => {
    renderWithProviders(<Builder />);
    expect(screen.getByLabelText(/^Title/)).toHaveValue("Golden hour portrait walk");
    expect(screen.queryByRole("checkbox", { name: /I have checked this section/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/filled this in from/)).not.toBeInTheDocument();
    await next();
    expect(screen.getByRole("heading", { name: "Category and tags" })).toBeInTheDocument();
  });
});
