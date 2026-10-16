import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useMe } from "@/lib/queries/auth";

type Message = { message: string };

/** Confirms an email from the link itin sends (/verify-email?token=…).
 * Works signed out: the token is the proof. A query keyed by the token, so it
 * runs once per link even when React mounts the page twice; never retried,
 * since a link only works once. */
export function useVerifyEmail(token: string | null) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["auth", "verify-email", token],
    queryFn: async () => {
      const { data } = await apiClient.get<Message>("/auth/email/verify", { params: { token } });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      return data;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/** Sends a fresh link to the signed-in user's email (at most 3 an hour). */
export function useResendVerification() {
  return useMutation({
    mutationFn: async () => (await apiClient.post<Message>("/auth/email/resend-verification")).data,
  });
}

/** True only when /auth/me says the signed-in user hasn't verified yet.
 * Unknown (loading, signed out, older API) counts as verified, so nobody is
 * nagged by mistake. */
export function useNeedsEmailVerification(): boolean {
  const { data } = useMe();
  return data?.is_email_verified === false;
}
