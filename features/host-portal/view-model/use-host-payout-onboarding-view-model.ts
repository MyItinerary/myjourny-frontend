import { apiErrorMessage } from "@/lib/api-error";

import { usePayoutAccount } from "../model/payouts-data";

export type HostPayoutOnboardingViewModel = {
  status: "loading" | "error" | "ready" | "pending" | "incomplete";
  message: string;
  error: string | null;
  onRefresh: () => void;
};

export function useHostPayoutOnboardingViewModel(): HostPayoutOnboardingViewModel {
  const account = usePayoutAccount();
  const ready = account.data?.connected && account.data.onboarding_completed;
  const pending = account.data?.provider === "stripe" && account.data.connected && !account.data.onboarding_completed;

  return {
    status: account.isPending ? "loading" : account.isError ? "error" : ready ? "ready" : pending ? "pending" : "incomplete",
    message: ready
      ? "Your Stripe account is ready to receive payouts in other currencies."
      : pending
        ? "Stripe has received your details. We are waiting for confirmation and will check again automatically."
        : "Stripe onboarding has not been completed yet. You can continue it from your payout settings.",
    error: account.isError ? apiErrorMessage(account.error, "We couldn't check your payout status.") : null,
    onRefresh: () => void account.refetch(),
  };
}
