export type VerificationType = "individual" | "business";

export type ApplicationStep = 1 | 2 | "review";

export interface GuideApplicationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  countryCode: string;
  phoneNumber: string;
  /** Not asked any more; still sent, because itin's application expects one. */
  city: string;
  verificationType: VerificationType;
  website: string;
  /** The brand guests see. A business's must match its CAC certificate. */
  businessName?: string;
  cacNumber?: string;
  /** Where the host or business is registered. */
  country: string;
  email: string;
  password: string;
}

export type GuideApplicationErrors = Partial<Record<keyof GuideApplicationFormData, string>>;

export const DEFAULT_APPLICATION_DATA: GuideApplicationFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  countryCode: "+234",
  phoneNumber: "",
  city: "Lagos",
  verificationType: "individual",
  website: "",
  businessName: "",
  cacNumber: "",
  country: "",
  email: "",
  password: "",
};

export const VERIFICATION_TYPES: { key: VerificationType; label: string }[] = [
  { key: "individual", label: "As an individual" },
  { key: "business", label: "As a business" },
];

export const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Other"];
