import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { builderHandlers, CLOUDINARY } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepBooking, StepPhotos, StepRequirements, StepReview, StepReviews } from "./host-builder-steps-c";

const toast = vi.hoisted(() => ({ info: vi.fn(), success: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => "approved" }));
vi.mock("sonner", () => ({ toast }));

function Harness({ which }: { which: "requirements" | "photos" | "reviews" | "booking" | "review" }) {
  const vm = useHostListingBuilderViewModel();
  return which === "requirements" ? <StepRequirements vm={vm} /> : which === "photos" ? <StepPhotos vm={vm} /> : which === "reviews" ? <StepReviews vm={vm} /> : which === "booking" ? <StepBooking vm={vm} /> : <StepReview vm={vm} />;
}

beforeEach(() => {
  server.use(...builderHandlers());
  window.localStorage.clear();
  toast.info.mockReset();
});

const jpg = (name: string) => new File([name], name, { type: "image/jpeg" });

describe("requirements and safety", () => {
  it("takes how physical it is, who can come, getting around, food chips and the weather rule", async () => {
    renderWithProviders(<Harness which="requirements" />);
    await userEvent.click(screen.getByRole("button", { name: "Moderate" }));
    expect(screen.getByRole("button", { name: "Moderate" })).toHaveAttribute("aria-pressed", "true");

    // An age box only for the policies that need one.
    await userEvent.click(screen.getByRole("button", { name: "All ages" }));
    expect(screen.queryByLabelText("Youngest age allowed")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "From a set age" }));
    await userEvent.type(screen.getByLabelText("Youngest age allowed"), "1x2");
    expect(screen.getByLabelText("Youngest age allowed")).toHaveValue("12");

    await userEvent.click(screen.getByRole("button", { name: "Partly accessible" }));
    await userEvent.type(screen.getByLabelText(/Anything else about getting around/), "Two flights of stairs");
    expect(screen.getByLabelText(/Anything else about getting around/)).toHaveValue("Two flights of stairs");
    await userEvent.click(screen.getByRole("button", { name: "Halal" }));
    expect(screen.getByRole("button", { name: "Halal" })).toHaveAttribute("aria-pressed", "true");

    expect(screen.queryByText(/Your rule:/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: "Weather can stop this happening" }));
    expect(screen.getByText(/Your rule:/)).toBeInTheDocument();
  });
});

describe("photos", () => {
  it("adds photos, marks the cover, reorders, changes the cover and removes", async () => {
    renderWithProviders(<Harness which="photos" />);
    expect(screen.getByText("No photos yet")).toBeInTheDocument();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, [jpg("a.jpg"), jpg("b.jpg")]);
    expect(await screen.findByText("2 photos")).toBeInTheDocument();
    const coverTile = () => screen.getByText("Cover").parentElement!;
    expect(within(coverTile()).getByRole("img")).toHaveAttribute("src", `${CLOUDINARY}photo-1.jpg`);

    await userEvent.click(screen.getByRole("button", { name: "Make cover" }));
    expect(within(coverTile()).getByRole("img")).toHaveAttribute("src", `${CLOUDINARY}photo-2.jpg`);

    await userEvent.click(screen.getByRole("button", { name: "Move photo 1 later" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove photo 1" }));
    expect(screen.getByText("1 photo")).toBeInTheDocument();
  });
});

describe("review and publish", () => {
  it("lists what is missing, takes the host's line, and keeps publish locked", async () => {
    renderWithProviders(<Harness which="review" />);
    expect(screen.getAllByRole("button", { name: "Finish this" })).toHaveLength(8);

    await userEvent.type(screen.getByLabelText(/One line from you/), "See you at the gate");
    expect(screen.getByLabelText(/One line from you/)).toHaveValue("See you at the gate");

    expect(screen.queryByText("How guests book")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish this experience" })).toBeDisabled();
  });
});

describe("reviews", () => {
  it("offers four places, asks for a link and says importing is not available yet", async () => {
    renderWithProviders(<Harness which="reviews" />);
    expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByText(/No reviews yet/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Google link")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Google/ }));
    expect(screen.getByRole("button", { name: "Import reviews" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Google link"), "https://maps.app.goo.gl/x");
    await userEvent.click(screen.getByRole("button", { name: "Import reviews" }));
    expect(toast.info).toHaveBeenCalledWith("Importing reviews isn't available yet, so nothing was imported.");
  });
});

describe("how guests book", () => {
  it("picks a cancellation policy, shows what guests will read and disables Moderate", async () => {
    renderWithProviders(<Harness which="booking" />);
    expect(screen.getByRole("heading", { name: "How guests book" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Moderate/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Strict/ }));
    expect(screen.getByRole("button", { name: /Strict/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Guests will read:/).closest("p")).toHaveTextContent("7 days");
  });

  it("takes a booking type and says it is not saved", async () => {
    renderWithProviders(<Harness which="booking" />);
    await userEvent.click(screen.getByRole("button", { name: /Instant book/ }));
    expect(screen.getByRole("button", { name: /Instant book/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/can't be saved from here yet/)).toBeInTheDocument();
  });
});


describe("review and publish", () => {
  it("lists what is missing, each with a way to finish it, and keeps publish off", () => {
    renderWithProviders(<Harness which="review" />);
    expect(screen.getByText("Last look")).toBeInTheDocument();
    expect(screen.getByText(/each line takes you to the step/)).toBeInTheDocument();
    expect(screen.getByText("Everything we need")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Finish this" })).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Publish this experience" })).toBeDisabled();
  });
});
