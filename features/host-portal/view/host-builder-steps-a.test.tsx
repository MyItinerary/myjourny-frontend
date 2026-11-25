import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { builderHandlers } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepBasics, StepCategory, StepWhere } from "./host-builder-steps-a";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => "approved" }));

function Harness({ which }: { which: "basics" | "category" | "where" }) {
  const vm = useHostListingBuilderViewModel();
  return which === "basics" ? <StepBasics vm={vm} /> : which === "category" ? <StepCategory vm={vm} /> : <StepWhere vm={vm} />;
}

beforeEach(() => {
  window.localStorage.clear();
  server.use(...builderHandlers());
});

describe("category and tags", () => {
  it("shows subcategories only after a category is picked", async () => {
    renderWithProviders(<Harness which="category" />);
    expect(screen.getByText(/Pick a category first/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Wellness & calm" }));
    await userEvent.click(screen.getByRole("button", { name: "Yoga" }));
    expect(screen.getByRole("button", { name: "Yoga" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "Walking" }));
    expect(screen.getByText("1 picked · optional")).toBeInTheDocument();
  });
});

describe("where you meet", () => {
  it("searches for a landmark, picks it, and lets the host change it", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.type(screen.getByLabelText("The landmark"), "freedom");
    await userEvent.click(await screen.findByRole("button", { name: /Freedom Park/ }));
    expect(screen.getByText("Guests will be sent to Freedom Park")).toBeInTheDocument();
    expect(screen.queryByText(/Not on the map yet/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.getByLabelText("The landmark")).toHaveValue("");
  });

  it("offers the typed words when nothing matches", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.type(screen.getByLabelText("The landmark"), "old fig tree");
    expect(await screen.findByText(/Nothing by that name/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Use .old fig tree. anyway/ }));
    expect(screen.getByText("Guests will be sent to old fig tree")).toBeInTheDocument();
    // No pin until one is picked from the search.
    expect(screen.getByText(/Not on the map yet/)).toBeInTheDocument();
  });

  it("uploads the meeting point photo and shows it", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.upload(screen.getByLabelText("Photo of the meeting point"), new File(["x"], "gate.jpg", { type: "image/jpeg" }));
    expect(await screen.findByAltText("Meeting point")).toHaveAttribute("src", expect.stringMatching(/^https:\/\/res\.cloudinary\.com\/demo\//));
  });
});

describe("the basics", () => {
  it("counts words and characters", async () => {
    renderWithProviders(<Harness which="basics" />);
    await userEvent.type(screen.getByLabelText(/The full description/), "one two three");
    expect(screen.getByText("3 words")).toBeInTheDocument();
  });
});
