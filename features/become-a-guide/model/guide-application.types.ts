export type VerificationType = "individual" | "business";

export type ApplicationStep = 1 | 2 | "review";

export interface GuideApplicationFormData {
  fullName: string;
  dateOfBirth: string;
  countryCode: string;
  phoneNumber: string;
  city: string;
  verificationType: VerificationType;
  website: string;
  businessName?: string;
  cacNumber?: string;
  email: string;
  password: string;
}

export type GuideApplicationErrors = Partial<Record<keyof GuideApplicationFormData, string>>;

export const DEFAULT_APPLICATION_DATA: GuideApplicationFormData = {
  fullName: "",
  dateOfBirth: "",
  countryCode: "+234",
  phoneNumber: "",
  city: "Lagos",
  verificationType: "individual",
  website: "",
  businessName: "",
  cacNumber: "",
  email: "",
  password: "",
};

export const NIGERIAN_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Calabar",
  "Benin City",
  "Enugu",
  "Abeokuta",
];
