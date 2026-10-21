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

  it("hides every password by default and lets each one be shown and hidden again", async () => {
    const { user } = renderWithProviders(<ChangePasswordDialogView {...viewModel()} />);

    const fields = ["Current password", "New password", "Confirm new password"].map((label) =>
      screen.getByLabelText(label),
    );
    for (const field of fields) expect(field).toHaveAttribute("type", "password");

    const toggles = screen.getAllByRole("button", { name: "Show password" });
    expect(toggles).toHaveLength(3);

    await user.click(toggles[1]);
    expect(fields[1]).toHaveAttribute("type", "text");
    expect(fields[0]).toHaveAttribute("type", "password");
    expect(fields[2]).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(fields[1]).toHaveAttribute("type", "password");
  });

  it("locks Save while saving or incomplete", () => {
    renderWithProviders(<ChangePasswordDialogView {...viewModel({ canSave: false, saving: true })} />);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });
});
