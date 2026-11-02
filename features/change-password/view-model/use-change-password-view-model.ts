import { useState } from "react";

import {
  MIN_PASSWORD_LENGTH,
  passwordChangeErrors,
  useChangePassword,
  validatePasswordChange,
} from "../model/change-password";
import type { PasswordErrors, PasswordField, PasswordValues } from "../model/change-password.types";

type Options = {
  open: boolean;
  onClose: () => void;
  /** The password was changed; the dialog has already closed. */
  onChanged: () => void;
};

export type ChangePasswordViewModel = {
  open: boolean;
  values: PasswordValues;
  /** Only the messages that should be showing right now. */
  errors: PasswordErrors;
  minLength: number;
  canSave: boolean;
  saving: boolean;
  onChange: (field: PasswordField, value: string) => void;
  onBlur: (field: PasswordField) => void;
  onSave: () => void;
  onClose: () => void;
};

const EMPTY: PasswordValues = { current: "", next: "", confirm: "" };

/** The change-password dialog. Problems show under the field they belong to:
 * the form's own checks once a field has been left, itin's refusals after Save. */
export function useChangePasswordViewModel({ open, onClose, onChanged }: Options): ChangePasswordViewModel {
  const changePassword = useChangePassword();
  const [values, setValues] = useState<PasswordValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<PasswordField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<PasswordErrors>({});

  const invalid = validatePasswordChange(values);
  const errors: PasswordErrors = { ...serverErrors };
  if (touched.next && invalid.next) errors.next = invalid.next;
  if (touched.confirm && invalid.confirm) errors.confirm = invalid.confirm;

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setServerErrors({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const onSave = () => {
    if (changePassword.isPending) return;
    setTouched({ current: true, next: true, confirm: true });
    setServerErrors({});
    if (invalid.next || invalid.confirm) return;
    changePassword.mutate(
      { current_password: values.current, new_password: values.next },
      {
        onSuccess: () => {
          reset();
          onClose();
          onChanged();
        },
        onError: (error) => setServerErrors(passwordChangeErrors(error)),
      },
    );
  };

  return {
    open,
    values,
    errors,
    minLength: MIN_PASSWORD_LENGTH,
    canSave: !!values.current && !!values.next && !!values.confirm && !changePassword.isPending,
    saving: changePassword.isPending,
    onChange: (field, value) => {
      setValues((previous) => ({ ...previous, [field]: value }));
      // What itin said about this field no longer describes what is typed.
      setServerErrors((previous) => ({ ...previous, [field]: undefined, form: undefined }));
    },
    onBlur: (field) => setTouched((previous) => ({ ...previous, [field]: true })),
    onSave,
    onClose: close,
  };
}
