import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ChangePasswordViewModel } from "../view-model/use-change-password-view-model";
import { ChangePasswordDialogView } from "./change-password-dialog-view";

function viewModel(overrides: Partial<ChangePasswordViewModel> = {}): ChangePasswordViewModel {
  return {
    open: true,
    values: { current: "", next: "", confirm: "" },
    errors: {},
    minLength: 10,
    canSave: true,
    saving: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onSave: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

describe("ChangePasswordDialogView", () => {
  it("renders nothing while closed", () => {
    const { container } = renderWithProviders(<ChangePasswordDialogView {...viewModel({ open: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("passes typing, leaving a field and the buttons to the view-model", async () => {
    const vm = viewModel();
    const { user } = renderWithProviders(<ChangePasswordDialogView {...vm} />);

    await user.type(screen.getByLabelText("Current password"), "a");
    await user.type(screen.getByLabelText("New password"), "b");
    await user.type(screen.getByLabelText("Confirm new password"), "c");
    await user.tab();
    expect(vm.onChange).toHaveBeenCalledWith("current", "a");
    expect(vm.onChange).toHaveBeenCalledWith("next", "b");
    expect(vm.onChange).toHaveBeenCalledWith("confirm", "c");
    expect(vm.onBlur).toHaveBeenCalledWith("current");
    expect(vm.onBlur).toHaveBeenCalledWith("next");
    expect(vm.onBlur).toHaveBeenCalledWith("confirm");
    expect(screen.getByPlaceholderText("At least 10 characters")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(vm.onSave).toHaveBeenCalled();
    expect(vm.onClose).toHaveBeenCalled();
  });

  it("shows each error with its field and marks the field invalid", () => {
    renderWithProviders(
      <ChangePasswordDialogView
        {...viewModel({
          errors: {
            current: "That isn't your current password.",
            next: "Use at least 10 characters.",
            confirm: "The passwords don't match.",
            form: "We couldn't change your password. Try again.",
          },
        })}
      />,
    );

    const current = screen.getByLabelText("Current password");
    expect(current).toHaveAttribute("aria-invalid", "true");
    expect(current).toHaveAccessibleDescription("That isn't your current password.");
    expect(screen.getByLabelText("New password")).toHaveAccessibleDescription("Use at least 10 characters.");
    expect(screen.getByLabelText("Confirm new password")).toHaveAccessibleDescription("The passwords don't match.");
    expect(screen.getByText("We couldn't change your password. Try again.")).toBeInTheDocument();
  });

  it("locks Save while saving or incomplete", () => {
    renderWithProviders(<ChangePasswordDialogView {...viewModel({ canSave: false, saving: true })} />);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });
});
