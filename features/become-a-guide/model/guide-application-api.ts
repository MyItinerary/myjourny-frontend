import { apiClient } from "@/lib/api-client";
import { completeAuth } from "@/lib/queries/auth";
import { dateOfBirthToIso, fullPhoneNumber } from "./guide-application-rules";
import type { GuideApplicationFormData } from "./guide-application.types";

export interface GuideApplicationSubmissionResult {
  success: boolean;
  message?: string;
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

export async function submitGuideApplication(
  data: GuideApplicationFormData
): Promise<GuideApplicationSubmissionResult> {
  const business = data.verificationType === "business";
  const payload = {
    email: data.email.trim(),
    password: data.password,
    full_name: data.fullName.trim(),
    date_of_birth: dateOfBirthToIso(data.dateOfBirth),
    phone_number: fullPhoneNumber(data.countryCode, data.phoneNumber),
    city: data.city,
    applicant_type: data.verificationType,
    website: data.website.trim() || null,
    business_name: business ? data.businessName?.trim() || null : null,
    cac_number: business ? data.cacNumber?.trim() || null : null,
  };

  try {
    const { data: tokens } = await apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/register/guide",
      payload
    );
    // Signed in straight away, so the dashboard can show where the application is.
    await completeAuth(tokens, payload.email);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}
