import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { DeleteDialogView } from "./host-listing-delete-dialog-view";

describe("DeleteDialogView", () => {
  it("renders nothing while closed", () => {
    renderWithProviders(<DeleteDialogView dialog={null} onClose={vi.fn()} onConfirm={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains why a listing with bookings can't be deleted", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <DeleteDialogView dialog={{ kind: "blocked", id: "l1", title: "Boat Morning", upcoming: 2 }} onClose={onClose} onConfirm={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(await screen.findByText(/Boat Morning has 2 bookings still to come/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("warns what deleting a finished listing loses", async () => {
    renderWithProviders(
      <DeleteDialogView dialog={{ kind: "ok", id: "l1", title: "Portraits", rating: null }} onClose={vi.fn()} onConfirm={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(await screen.findByText("Delete Portraits for good")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive it instead" })).toBeInTheDocument();
  });

  it("deletes only from the delete button", async () => {
    const onConfirm = vi.fn();
    const onDelete = vi.fn();
    const { user } = renderWithProviders(
      <DeleteDialogView dialog={{ kind: "ok", id: "l1", title: "Portraits", rating: null }} onClose={vi.fn()} onConfirm={onConfirm} onDelete={onDelete} />,
    );
    await user.click(await screen.findByRole("button", { name: "Archive it instead" }));
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Delete and lose the reviews" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
