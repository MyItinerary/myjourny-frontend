import { screen, within } from "@testing-library/react";
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
    expect(screen.getByRole("button", { name: "Walking" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(/picked · optional/)).not.toBeInTheDocument();
    expect(screen.queryByText("Pick one")).not.toBeInTheDocument();
  });

  it("picks more than one category, with a checkbox on each card, and groups their subcategories", async () => {
    renderWithProviders(<Harness which="category" />);
    await userEvent.click(screen.getByRole("button", { name: "Wellness & calm" }));
    await userEvent.click(screen.getByRole("button", { name: "Art & creativity" }));

    expect(screen.getByRole("button", { name: "Wellness & calm" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Art & creativity" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Art & creativity" }).querySelector("[data-checkbox]")).not.toBeNull();
    // Each category's subcategories under its name.
    expect(screen.getByText("Wellness & calm", { selector: "div" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Yoga" }));
    await userEvent.click(screen.getByRole("button", { name: "Photography walk" }));
    expect(screen.getByRole("button", { name: "Yoga" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Photography walk" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("where you meet", () => {
  it("picks several search results from the dropdown, keeping it open, and shows them as chips", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.type(screen.getByLabelText("Locations"), "freedom");
    const list = await screen.findByRole("listbox", { name: "Search results" });
    await userEvent.click(within(list).getByRole("option", { name: /Freedom Park/ }));

    expect(within(screen.getByRole("listbox", { name: "Search results" })).getByRole("option", { name: /Freedom Park/ })).toHaveAttribute("aria-selected", "true");
    const yours = screen.getByRole("list", { name: "Your locations" });
    expect(within(yours).getByText("Freedom Park")).toBeInTheDocument();
    expect(screen.getByLabelText("Locations")).toHaveValue("freedom");
    expect(screen.queryByText(/Guests will be sent to/)).not.toBeInTheDocument();

    await userEvent.click(within(yours).getByRole("button", { name: "Remove Freedom Park" }));
    expect(screen.queryByRole("list", { name: "Your locations" })).not.toBeInTheDocument();
  });

  it("picks a popular place from the suggestions without searching", async () => {
    renderWithProviders(<Harness which="where" />);
    const suggestions = screen.getByRole("group", { name: "Suggestions" });
    await userEvent.click(within(suggestions).getByRole("button", { name: "Lekki Phase 1" }));

    expect(within(screen.getByRole("list", { name: "Your locations" })).getByText("Lekki Phase 1")).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Suggestions" })).queryByRole("button", { name: "Lekki Phase 1" })).not.toBeInTheDocument();
  });

  it("offers the typed words when nothing matches, marked as not on the map", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.type(screen.getByLabelText("Locations"), "old fig tree");
    expect(await screen.findByText(/Nothing by that name/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Use .old fig tree. anyway/ }));
    const yours = screen.getByRole("list", { name: "Your locations" });
    expect(within(yours).getByText("old fig tree")).toBeInTheDocument();
    expect(within(yours).getByText("not on the map")).toBeInTheDocument();
    expect(screen.getByText(/None of these are on the map yet/)).toBeInTheDocument();
  });

  it("uploads the meeting point photo, shows it small under the upload box, and deletes it", async () => {
    renderWithProviders(<Harness which="where" />);
    await userEvent.upload(screen.getByLabelText("Photo of the meeting point"), new File(["x"], "gate.jpg", { type: "image/jpeg" }));
    const photo = await screen.findByAltText("Meeting point");
    expect(photo).toHaveAttribute("src", expect.stringMatching(/^https:\/\/res\.cloudinary\.com\/demo\//));
    expect(screen.getByText("Choose a different photo").closest("label")!.compareDocumentPosition(photo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Delete the meeting point photo" }));
    expect(screen.queryByAltText("Meeting point")).not.toBeInTheDocument();
    expect(screen.getByText("Choose a photo")).toBeInTheDocument();

    // The same photo can be picked again after deleting it.
    await userEvent.upload(screen.getByLabelText("Photo of the meeting point"), new File(["x"], "gate.jpg", { type: "image/jpeg" }));
    expect(await screen.findByAltText("Meeting point")).toBeInTheDocument();
  });
});

describe("title and description", () => {
  it("counts words in the long description", async () => {
    renderWithProviders(<Harness which="basics" />);
    await userEvent.type(screen.getByLabelText(/^Long description/), "one two three");
    expect(screen.getByText("3 of 1,000 words")).toBeInTheDocument();
    expect(screen.getByText("Write at least 100 words. 97 to go.")).toBeInTheDocument();
  });

  it("asks for a title, a short description and a long description, under a Required heading", () => {
    renderWithProviders(<Harness which="basics" />);
    expect(screen.getByRole("heading", { name: "Title and description" })).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Title/)).toHaveAttribute("placeholder", "Lagos Island Photowalk");
    expect(screen.getByText("Add the place and the activity. It helps people find your experience faster.")).toBeInTheDocument();
    expect(screen.getByText("0/60")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Short description/).tagName).toBe("TEXTAREA");
    expect(screen.getByText(/first thing they read after the title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Long description/).tagName).toBe("TEXTAREA");
    expect(screen.getByText(/from start to finish/)).toBeInTheDocument();
  });

  it("types into the short description", async () => {
    renderWithProviders(<Harness which="basics" />);
    await userEvent.type(screen.getByLabelText(/^Short description/), "Six streets");
    expect(screen.getByLabelText(/^Short description/)).toHaveValue("Six streets");
    expect(screen.getByText("2 of 100 words")).toBeInTheDocument();
  });
});

describe("category and tags", () => {
  it("marks the step required and lists the categories", () => {
    renderWithProviders(<Harness which="category" />);
    expect(screen.getByRole("heading", { name: "Category and tags" })).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText(/Pick every category that fits your experience/)).toBeInTheDocument();
    expect(screen.getByText("Pick a category first and the subcategories appear here.")).toBeInTheDocument();
  });
});

describe("where you meet", () => {
  it("marks the step required and asks where to meet", () => {
    renderWithProviders(<Harness which="where" />);
    expect(screen.getByRole("heading", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Specific meeting point/)).toHaveAttribute("placeholder", "Behind the black 2 storey building");
    expect(screen.getByText(/helps people find the spot/)).toBeInTheDocument();
    expect(screen.getByText("Search by landmark, city or area.")).toBeInTheDocument();
    expect(screen.getByText(/Why we ask for these details/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^City/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Area/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Stand where the guest will stand/)).not.toBeInTheDocument();
  });
});
