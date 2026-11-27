import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { HostEarnings } from "./earnings.types";

export const hostEarningsKey = ["guide", "earnings"] as const;

/** Ledger totals and booking lines for the signed-in guide. */
export function useHostEarnings(enabled = true) {
  return useQuery({
    queryKey: hostEarningsKey,
    queryFn: async () => (await apiClient.get<HostEarnings>("/guide/earnings")).data,
    enabled,
  });
}
