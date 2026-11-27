import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  useCreateStripeOnboarding,
  useHostPayoutHistory,
  usePaystackBanks,
  usePayoutAccount,
  useResolvePaystackAccount,
  useSavePaystackRecipient,
} from "./payouts-data";

describe("payout queries", () => {
  it("loads payout account status", async () => {
    const status = { connected: true, provider: "paystack", onboarding_completed: true };
    server.use(http.get(apiUrl("/guide/payout-account"), () => HttpResponse.json(status)));
    const { result } = renderHookWithProviders(() => usePayoutAccount());

    await waitFor(() => expect(result.current.data).toEqual(status));
  });

  it("loads payout history including ledger stage amounts", async () => {
    const history = [{
      id: "payout-1", booking_id: "booking-1", experience_title: "Art tour", created_at: "2026-11-28T18:12:00",
      currency: "NGN", amount: "3000.00", reference: "payout:booking-1:day1",
    }];
    server.use(http.get(apiUrl("/guide/payouts"), () => HttpResponse.json(history)));
    const { result } = renderHookWithProviders(() => useHostPayoutHistory());

    await waitFor(() => expect(result.current.data).toEqual(history));
  });

  it("requests Paystack banks for Nigeria in NGN", async () => {
    let requestUrl = "";
    server.use(http.get(apiUrl("/payment/paystack/banks"), ({ request }) => {
      requestUrl = request.url;
      return HttpResponse.json({ country: "nigeria", currency: "NGN", banks: [{ name: "Example Bank", code: "000" }] });
    }));
    const { result } = renderHookWithProviders(() => usePaystackBanks());

    await waitFor(() => expect(result.current.data).toEqual([{ name: "Example Bank", code: "000" }]));
    expect(new URL(requestUrl).searchParams.get("country")).toBe("nigeria");
    expect(new URL(requestUrl).searchParams.get("currency")).toBe("NGN");
  });

  it("resolves the selected bank and account number", async () => {
    let requestUrl = "";
    server.use(http.get(apiUrl("/payment/paystack/bank/resolve"), ({ request }) => {
      requestUrl = request.url;
      return HttpResponse.json({ account_number: "0123456789", account_name: "Ada Okafor", bank_id: 1 });
    }));
    const { result } = renderHookWithProviders(() => useResolvePaystackAccount());

    await act(() => result.current.mutateAsync({ accountNumber: "0123456789", bankCode: "000" }));
    expect(new URL(requestUrl).searchParams.get("account_number")).toBe("0123456789");
    expect(new URL(requestUrl).searchParams.get("bank_code")).toBe("000");
  });

  it("saves the verified recipient and invalidates account status", async () => {
    let body: unknown;
    let accountReads = 0;
    server.use(
      http.get(apiUrl("/guide/payout-account"), () => {
        accountReads += 1;
        return HttpResponse.json({ connected: true, provider: "paystack", onboarding_completed: true });
      }),
      http.post(apiUrl("/payment/paystack-recipient"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ status: "success", recipient_code: "RCP_123" });
      }),
    );
    const { result } = renderHookWithProviders(() => ({ account: usePayoutAccount(), save: useSavePaystackRecipient() }));
    await waitFor(() => expect(result.current.account.data?.connected).toBe(true));

    await act(() => result.current.save.mutateAsync({
      name: "Ada Okafor", account_number: "0123456789", bank_code: "000", currency: "NGN", target_id: "guide-1", account_type: "guide",
    }));
    await waitFor(() => expect(accountReads).toBeGreaterThan(1));
    expect(body).toEqual({
      name: "Ada Okafor", account_number: "0123456789", bank_code: "000", currency: "NGN", target_id: "guide-1", account_type: "guide",
    });
  });

  it("creates Stripe onboarding for the guide", async () => {
    let body: unknown;
    server.use(http.post(apiUrl("/payment/connect-account"), async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ account_url: "https://connect.stripe.com/onboarding" });
    }));
    const { result } = renderHookWithProviders(() => useCreateStripeOnboarding());

    await act(() => result.current.mutateAsync("guide-1"));
    expect(body).toEqual({ account_type: "guide", target_id: "guide-1" });
    expect(result.current.data?.account_url).toBe("https://connect.stripe.com/onboarding");
  });
});
