import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
import { setTokens } from "@/lib/auth/session-store";

import type { PasswordErrors, PasswordValues } from "./change-password.types";

export const MIN_PASSWORD_LENGTH = 10;

type ChangePasswordResponse = { message: string; access_token?: string; refresh_token?: string };

/** POST /auth/password/change. itin signs out every session but this one. A
 * token from before session tracking can't be kept, so it sends fresh ones back. */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; new_password: string }) =>
      (await apiClient.post<ChangePasswordResponse>("/auth/password/change", payload)).data,
    onSuccess: (data) => {
      if (data.access_token && data.refresh_token) {
        setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
      }
    },
  });
}

/** What is wrong with the form before anything is sent. Empty fields are not
 * errors here; Save stays off until all three are filled. */
export function validatePasswordChange(values: PasswordValues): PasswordErrors {
  const errors: PasswordErrors = {};
  if (values.next && values.next.length < MIN_PASSWORD_LENGTH) {
    errors.next = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (values.confirm && values.confirm !== values.next) {
    errors.confirm = "The passwords don't match.";
  }
  return errors;
}

/** Puts itin's refusal under the field it is about. */
export function passwordChangeErrors(error: unknown): PasswordErrors {
  const response = (error as { response?: { status?: number; data?: { detail?: unknown } } })?.response;
  const detail = response?.data?.detail;

  if (response?.status === 400 && detail === "Incorrect current password") {
    return { current: "That isn't your current password." };
  }
  if (response?.status === 400 && detail === "New password must differ from current password") {
    return { next: "Choose a password that is different from your current one." };
  }
  if (response?.status === 422 && Array.isArray(detail)) {
    const aboutNewPassword = detail.some(
      (item) => Array.isArray(item?.loc) && item.loc.includes("new_password"),
    );
    if (aboutNewPassword) return { next: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  return { form: apiErrorMessage(error, "We couldn't change your password. Try again.") };
}
