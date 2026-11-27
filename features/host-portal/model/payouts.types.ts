export type PayoutProvider = "paystack" | "stripe" | null;

export type PayoutAccountStatus = {
  connected: boolean;
  provider: PayoutProvider;
  onboarding_completed: boolean;
};

export type PaystackBank = { name: string; code: string };

export type PaystackBanksResponse = {
  country: string;
  currency: string;
  banks: PaystackBank[];
};

export type ResolvedBankAccount = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

export type PaystackRecipientInput = {
  name: string;
  account_number: string;
  bank_code: string;
  currency: "NGN";
  target_id: string;
  account_type: "guide";
};

export type PaystackRecipientResponse = { status: string; recipient_code: string };

export type StripeOnboardingResponse = { account_url: string };
