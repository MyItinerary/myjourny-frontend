import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { builderHandlers, CLOUDINARY } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { useHostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepPhotos } from "./host-builder-step-photos-view";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => "approved" }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  server.use(...builderHandlers());
  window.localStorage.clear();
});

function Photos() {
  const vm = useHostListingBuilderViewModel();
  return <StepPhotos vm={vm} />;
}

const jpg = (name: string) => new File([name], name, { type: "image/jpeg" });
const tiles = () => within(screen.getByRole("list", { name: "Your photos" })).queryAllByRole("img");
/** A drag that carries an item or files, for the drag and drop handlers. */
const transfer = (types: string[], files: File[] = []) => ({ types, files, effectAllowed: "" });

describe("photos", () => {
  it("is required, with no photo count, and shows four empty slots with the main one marked", () => {
    renderWithProviders(<Photos />);
    expect(screen.getByRole("heading", { name: "Photos" })).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText(/People decide here/)).not.toBeInTheDocument();
    expect(screen.queryByText("No photos yet")).not.toBeInTheDocument();
    expect(screen.getByText("JPG or PNG · Up to 10 MB each · At least 4 photos")).toBeInTheDocument();
    expect(screen.getAllByText("Add a photo")).toHaveLength(4);
    expect(screen.getByText("Main photo")).toBeInTheDocument();
  });

  it("uploads photos, marks the first as the main one, and removes one", async () => {
    renderWithProviders(<Photos />);
    await userEvent.upload(screen.getByLabelText("Upload photos"), [jpg("a.jpg"), jpg("b.jpg")]);
    await screen.findByAltText("Main photo");
    expect(tiles().map((t) => t.getAttribute("src"))).toEqual([`${CLOUDINARY}photo-1.jpg`, `${CLOUDINARY}photo-2.jpg`]);
    expect(screen.getAllByText("Add a photo")).toHaveLength(2);
    expect(screen.queryByText(/2 photos/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Move photo/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Remove main photo" }));
    expect(tiles().map((t) => t.getAttribute("src"))).toEqual([`${CLOUDINARY}photo-2.jpg`]);
  });

  it("reorders by drag and drop, the photo dropped first becoming the main one", async () => {
    renderWithProviders(<Photos />);
    await userEvent.upload(screen.getByLabelText("Upload photos"), [jpg("a.jpg"), jpg("b.jpg")]);
    await screen.findByAltText("Photo 2");
    const items = within(screen.getByRole("list", { name: "Your photos" })).getAllByRole("listitem");

    fireEvent.dragStart(items[1], { dataTransfer: transfer(["text/plain"]) });
    fireEvent.dragOver(items[0], { dataTransfer: transfer(["text/plain"]) });
    fireEvent.drop(items[0], { dataTransfer: transfer(["text/plain"]) });

    expect(tiles().map((t) => t.getAttribute("src"))).toEqual([`${CLOUDINARY}photo-2.jpg`, `${CLOUDINARY}photo-1.jpg`]);
    expect(screen.getByAltText("Main photo")).toHaveAttribute("src", `${CLOUDINARY}photo-2.jpg`);
  });

  it("reorders with the arrow keys too", async () => {
    renderWithProviders(<Photos />);
    await userEvent.upload(screen.getByLabelText("Upload photos"), [jpg("a.jpg"), jpg("b.jpg")]);
    await screen.findByAltText("Photo 2");
    const first = within(screen.getByRole("list", { name: "Your photos" })).getAllByRole("listitem")[0];
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(tiles().map((t) => t.getAttribute("src"))).toEqual([`${CLOUDINARY}photo-2.jpg`, `${CLOUDINARY}photo-1.jpg`]);
  });

  it("uploads photos dragged onto the upload area", async () => {
    renderWithProviders(<Photos />);
    const area = screen.getByText("or drag photos here").closest("div")!.parentElement!;
    fireEvent.dragOver(area, { dataTransfer: transfer(["Files"], [jpg("a.jpg")]) });
    fireEvent.drop(area, { dataTransfer: transfer(["Files"], [jpg("a.jpg")]) });
    expect(await screen.findByAltText("Main photo")).toHaveAttribute("src", `${CLOUDINARY}photo-1.jpg`);
  });

  it("asks the host to confirm the photo rights, with a link to the host terms", async () => {
    renderWithProviders(<Photos />);
    const box = screen.getByRole("checkbox", { name: /These are my photos/ });
    expect(box).not.toBeChecked();
    expect(screen.getByRole("link", { name: "host terms" })).toHaveAttribute("href", "/legal/hosts");
    await userEvent.click(box);
    expect(box).toBeChecked();
  });
});
