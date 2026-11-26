import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { completeAuth, type MeResponse } from "@/lib/queries/auth";
import { dateOfBirthToIso, fullNameOf, fullPhoneNumber, normalizeWebsite } from "./guide-application-rules";
import type { GuideApplicationFormData } from "./guide-application.types";

export interface GuideApplicationSubmissionResult {
  success: boolean;
  message?: string;
  /** The email already has an account: log in and add hosting to it. */
  accountExists?: boolean;
}

/** FastAPI sends `detail` as a sentence, or as a list of field errors when validation fails. */
function errorMessage(err: unknown): string | undefined {
  const detail =
    err && typeof err === "object" && "response" in err
      ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
      : undefined;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: unknown } | undefined;
    if (typeof first?.msg === "string") return first.msg.replace(/^Value error, /, "");
  }
  return undefined;
}

function isConflict(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 409;
}

/** Whether the email already has an account (itin's /auth/email-exists). A failed lookup counts as
 * no account; the "already registered" answer on submit still catches it. */
export async function emailHasAccount(email: string): Promise<boolean> {
  try {
    const { data } = await apiClient.post<{ exists?: boolean }>("/auth/email-exists", { email: email.trim().toLowerCase() });
    return data.exists === true;
  } catch {
    return false;
  }
}

/** What admins review, without the account details. */
function applicationPayload(data: GuideApplicationFormData) {
  const business = data.verificationType === "business";
  return {
    full_name: fullNameOf(data.firstName, data.lastName),
    date_of_birth: dateOfBirthToIso(data.dateOfBirth),
    phone_number: fullPhoneNumber(data.countryCode, data.phoneNumber),
    city: data.city,
    applicant_type: data.verificationType,
    website: normalizeWebsite(data.website),
    // An individual can host under a brand name too; itin keeps it in the same place.
    business_name: data.businessName?.trim() || null,
    cac_number: business ? data.cacNumber?.trim() || null : null,
  };
}

export async function submitGuideApplication(
  data: GuideApplicationFormData
): Promise<GuideApplicationSubmissionResult> {
  const payload = { email: data.email.trim(), password: data.password, ...applicationPayload(data) };

  try {
    const { data: tokens } = await apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/register/guide",
      payload
    );
    // Signed in straight away, so the dashboard can show where the application is.
    await completeAuth(tokens, payload.email);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err), ...(isConflict(err) && { accountExists: true }) };
  }
}

/** A signed-in traveller adds hosting to the account they already have. */
export function useSubmitHostApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GuideApplicationFormData): Promise<GuideApplicationSubmissionResult> => {
      try {
        const { data: me } = await apiClient.post<MeResponse>("/auth/me/host", applicationPayload(data));
        // The nav and the host dashboard read the account from here.
        queryClient.setQueryData(["auth", "me"], me);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, message: errorMessage(err) };
      }
    },
  });
}

// The form, kept while the applicant logs in and comes back. Never the password.
const DRAFT_KEY = "myjourny:guide-application-draft";

export function saveApplicationDraft(data: GuideApplicationFormData) {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, password: "" }));
  } catch {
    // Without storage they fill it in again; nothing else depends on it.
  }
}

/** The saved form, if they're back from logging in. */
export function loadApplicationDraft(): Partial<GuideApplicationFormData> | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<GuideApplicationFormData>) : null;
  } catch {
    return null;
  }
}

export function clearApplicationDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing saved to clear.
  }
}
