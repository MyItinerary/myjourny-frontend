import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { PayoutHistoryItem } from "./earnings.types";
import type {
  PaystackBanksResponse,
  PaystackRecipientInput,
  PaystackRecipientResponse,
  PayoutAccountStatus,
  ResolvedBankAccount,
  StripeOnboardingResponse,
} from "./payouts.types";

export const payoutAccountKey = ["guide", "payout-account"] as const;
export const payoutHistoryKey = ["guide", "payouts"] as const;
export const paystackBanksKey = ["payment", "paystack", "banks", "nigeria", "NGN"] as const;

export function usePayoutAccount(enabled = true) {
  return useQuery({
    queryKey: payoutAccountKey,
    queryFn: async () => (await apiClient.get<PayoutAccountStatus>("/guide/payout-account")).data,
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const account = query.state.data;
      return account?.provider === "stripe" && account.connected && !account.onboarding_completed ? 2000 : false;
    },
  });
}

export function useHostPayoutHistory(enabled = true) {
  return useQuery({
    queryKey: payoutHistoryKey,
    queryFn: async () => (await apiClient.get<PayoutHistoryItem[]>("/guide/payouts")).data,
    enabled,
  });
}

export function usePaystackBanks(enabled = true) {
  return useQuery({
    queryKey: paystackBanksKey,
    queryFn: async () =>
      (
        await apiClient.get<PaystackBanksResponse>("/payment/paystack/banks", {
          params: { country: "nigeria", currency: "NGN" },
        })
      ).data.banks,
    enabled,
    staleTime: 60 * 60_000,
  });
}

export function useResolvePaystackAccount() {
  return useMutation({
    mutationFn: async ({ accountNumber, bankCode }: { accountNumber: string; bankCode: string }) =>
      (
        await apiClient.get<ResolvedBankAccount>("/payment/paystack/bank/resolve", {
          params: { account_number: accountNumber, bank_code: bankCode },
        })
      ).data,
  });
}

export function useSavePaystackRecipient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaystackRecipientInput) =>
      (await apiClient.post<PaystackRecipientResponse>("/payment/paystack-recipient", input)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payoutAccountKey });
    },
  });
}

export function useCreateStripeOnboarding() {
  return useMutation({
    mutationFn: async (targetId: string) =>
      (await apiClient.post<StripeOnboardingResponse>("/payment/connect-account", { account_type: "guide", target_id: targetId })).data,
  });
}
