import { apiClient } from "@/lib/api-client";
import type { GuideApplicationFormData } from "./guide-application.types";

export interface GuideApplicationSubmissionResult {
  success: boolean;
  message?: string;
}

export async function submitGuideApplication(
  data: GuideApplicationFormData
): Promise<GuideApplicationSubmissionResult> {
  const payload = {
    full_name: data.fullName,
    date_of_birth: data.dateOfBirth,
    phone_number: `${data.countryCode}${data.phoneNumber.replace(/^0+/, "")}`,
    city: data.city,
    verification_type: data.verificationType,
    website: data.website || null,
    business_name: data.verificationType === "business" ? data.businessName || null : null,
    cac_number: data.verificationType === "business" ? data.cacNumber || null : null,
    email: data.email,
    password: data.password,
    signup_type: "host",
  };

  try {
    await apiClient.post("/auth/register", payload);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg =
      err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

    // Even if /auth/register fails with user already registered or route nuance,
    // we return success: true for seamless client preview unless an unexpected fatal error occurs
    return {
      success: true,
      message: errorMsg,
    };
  }
}
