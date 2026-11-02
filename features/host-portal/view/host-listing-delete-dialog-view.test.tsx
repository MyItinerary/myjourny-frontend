import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { DeleteDialogView } from "./host-listing-delete-dialog-view";

describe("DeleteDialogView", () => {
  it("renders nothing while closed", () => {
    renderWithProviders(<DeleteDialogView dialog={null} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains why a listing with bookings can't be deleted", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <DeleteDialogView dialog={{ kind: "blocked", title: "Boat Morning", upcoming: 2 }} onClose={onClose} onConfirm={vi.fn()} />,
    );

    expect(await screen.findByText(/Boat Morning has 2 bookings still to come/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("warns what deleting a finished listing loses", async () => {
    renderWithProviders(
      <DeleteDialogView dialog={{ kind: "ok", title: "Portraits", rating: null }} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(await screen.findByText("Delete Portraits for good")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive it instead" })).toBeInTheDocument();
  });
});
