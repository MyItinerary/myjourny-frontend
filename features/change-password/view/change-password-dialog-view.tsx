"use client";

import { ModalFooter, ModalShell, TextField } from "@/components/account-settings/section-ui";

import type { ChangePasswordViewModel } from "../view-model/use-change-password-view-model";

/** The change-password dialog: current, new and confirm, each with its own error. */
export function ChangePasswordDialogView(vm: ChangePasswordViewModel) {
  if (!vm.open) return null;
  return (
    <ModalShell title="Change password" onClose={vm.onClose}>
      <div className="flex flex-col gap-4">
        <TextField
          label="Current password"
          revealable
          autoComplete="current-password"
          value={vm.values.current}
          error={vm.errors.current}
          onChange={(e) => vm.onChange("current", e.target.value)}
          onBlur={() => vm.onBlur("current")}
        />
        <TextField
          label="New password"
          revealable
          autoComplete="new-password"
          placeholder={`At least ${vm.minLength} characters`}
          value={vm.values.next}
          error={vm.errors.next}
          onChange={(e) => vm.onChange("next", e.target.value)}
          onBlur={() => vm.onBlur("next")}
        />
        <TextField
          label="Confirm new password"
          revealable
          autoComplete="new-password"
          value={vm.values.confirm}
          error={vm.errors.confirm}
          onChange={(e) => vm.onChange("confirm", e.target.value)}
          onBlur={() => vm.onBlur("confirm")}
        />
      </div>
      {vm.errors.form && (
        <div role="alert" className="mt-3 text-sm text-destructive">
          {vm.errors.form}
        </div>
      )}
      <div className="mt-2.5 text-sm text-muted-foreground">
        Changing your password signs you out everywhere except this device.
      </div>
      <ModalFooter
        onCancel={vm.onClose}
        saveLabel={vm.saving ? "Saving…" : "Save"}
        saveDisabled={!vm.canSave}
        onSave={vm.onSave}
      />
    </ModalShell>
  );
}
