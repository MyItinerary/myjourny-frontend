import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { DeleteAccountViewModel } from "../view-model/use-delete-account-view-model";
import { DeleteAccountDialogView } from "./delete-account-dialog-view";

function viewModel(overrides: Partial<DeleteAccountViewModel> = {}): DeleteAccountViewModel {
  return {
    open: true,
    step: 1,
    email: "ada@example.com",
    checking: false,
    blockers: [],
    canContinue: true,
    draft: "",
    onDraftChange: vi.fn(),
    canConfirm: false,
    deleting: false,
    onContinue: vi.fn(),
    onBack: vi.fn(),
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    onDeactivateInstead: vi.fn(),
    ...overrides,
  };
}

describe("DeleteAccountDialogView", () => {
  it("renders nothing while closed", () => {
    const { container } = renderWithProviders(<DeleteAccountDialogView {...viewModel({ open: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("says what goes and that booking and payment records are kept", async () => {
    const vm = viewModel();
    const { user } = renderWithProviders(<DeleteAccountDialogView {...vm} />);

    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Your profile and preferences")).toBeInTheDocument();
    expect(screen.getByText("What we keep")).toBeInTheDocument();
    expect(screen.getByText(/Booking and payment records, without your name or contact details/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue to delete" }));
    await user.click(screen.getByRole("button", { name: "Deactivate instead" }));
    await user.click(screen.getByRole("button", { name: "Keep my account" }));
    expect(vm.onContinue).toHaveBeenCalled();
    expect(vm.onDeactivateInstead).toHaveBeenCalled();
    expect(vm.onClose).toHaveBeenCalled();
  });

  it("lists what must be settled first and blocks the next step", () => {
    renderWithProviders(
      <DeleteAccountDialogView
        {...viewModel({
          canContinue: false,
          blockers: [
            { key: "upcoming", title: "You have an upcoming booking", body: "Cancel it first." },
            { key: "refunds", title: "A refund is still being reviewed", body: "Nothing more is needed." },
          ],
        })}
      />,
    );

    expect(screen.getByText("You have an upcoming booking")).toBeInTheDocument();
    expect(screen.getByText("A refund is still being reviewed")).toBeInTheDocument();
    expect(screen.queryByText("What we keep")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue to delete" })).toBeDisabled();
  });

  it("shows a checking state", () => {
    renderWithProviders(<DeleteAccountDialogView {...viewModel({ checking: true, canContinue: false })} />);
    expect(screen.getByText("Checking your bookings…")).toBeInTheDocument();
  });

  it("asks for DELETE before the final button works", async () => {
    const vm = viewModel({ step: 2 });
    const { user, rerender } = renderWithProviders(<DeleteAccountDialogView {...vm} />);

    expect(screen.getByText(/This removes ada@example.com and your personal details/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete my account" })).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "D");
    expect(vm.onDraftChange).toHaveBeenCalledWith("D");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(vm.onBack).toHaveBeenCalled();

    const ready = viewModel({ step: 2, draft: "DELETE", canConfirm: true });
    rerender(<DeleteAccountDialogView {...ready} />);
    await user.click(screen.getByRole("button", { name: "Delete my account" }));
    expect(ready.onConfirm).toHaveBeenCalled();

    rerender(<DeleteAccountDialogView {...viewModel({ step: 2, deleting: true })} />);
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  });
});
