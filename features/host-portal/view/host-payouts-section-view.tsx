import { cn } from "@/lib/utils";

import type { HostProfileViewModel } from "../view-model/use-host-profile-view-model";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";
const HEADING = "text-[14.5px] font-medium text-[#333134]";

export function PayoutsSection({ payouts }: { payouts: NonNullable<HostProfileViewModel["payouts"]> }) {
  const field = "mt-1 h-11 w-full rounded-xl bg-white px-3 text-sm text-[#333134] shadow-[inset_0_0_0_1px_#D9D9D9] outline-none focus:shadow-[inset_0_0_0_2px_#2C0101]";
  const button = "h-10 cursor-pointer rounded-full bg-[#2C0101] px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50";
  const accountReady = payouts.account?.connected && payouts.account.onboardingCompleted;

  return (
    <div className="mt-[26px] flex flex-col gap-7">
      <section>
        <h3 className={cn(HEADING, "mb-1")}>Naira payouts</h3>
        <p className="mb-4 text-[12.5px] leading-[1.55] text-[#6F6B72]">Connect a Nigerian bank account through Paystack. Verify the account name before saving it.</p>

        {payouts.accountLoading && <p role="status" className="mb-3 text-sm text-[#6F6B72]">Loading payout account…</p>}
        {payouts.accountError && <p role="alert" className="mb-3 rounded-xl bg-[#FFF0F0] p-3 text-sm text-[#9F2525]">{payouts.accountError}</p>}
        {payouts.account?.provider === "paystack" && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#F0FCF5] px-4 py-3 text-[13px] text-[#0C7540]">
            <span className="font-medium">Paystack account connected</span>
            <span className="ml-auto">{accountReady ? "Ready for payouts" : "Setup incomplete"}</span>
          </div>
        )}

        <div className={cn(CARD, "flex flex-col gap-4 p-[18px]")}>
          <label className="text-[12.5px] font-medium text-[#333134]">
            Bank
            <select className={field} value={payouts.bankCode} onChange={(event) => payouts.onBankChange(event.target.value)}>
              <option value="">Choose a bank</option>
              {payouts.banks.map((bank, index) => <option key={`${bank.code}-${bank.name}-${index}`} value={bank.code}>{bank.name}</option>)}
            </select>
          </label>
          {payouts.banksLoading && <p role="status" className="text-xs text-[#6F6B72]">Loading banks…</p>}
          {payouts.banksError && (
            <p role="alert" className="flex items-center gap-3 text-xs text-[#9F2525]">
              <span>{payouts.banksError}</span>
              <button type="button" onClick={payouts.onRetryBanks} className="cursor-pointer underline">Retry</button>
            </p>
          )}

          <label className="text-[12.5px] font-medium text-[#333134]">
            Account number
            <input
              className={field}
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              value={payouts.accountNumber}
              onChange={(event) => payouts.onAccountNumberChange(event.target.value)}
              placeholder="10-digit account number"
            />
          </label>

          {payouts.resolvedName && (
            <div className="rounded-xl bg-[#F0FCF5] px-3.5 py-3 text-[13px] text-[#0C7540]">
              <p>Verified account name: <strong>{payouts.resolvedName}</strong></p>
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-[12.5px] leading-[1.45]">
                <input
                  type="checkbox"
                  checked={payouts.confirmedName}
                  onChange={(event) => payouts.onConfirmNameChange(event.target.checked)}
                  className="mt-0.5 accent-[#0C7540]"
                />
                <span>I confirm this is the account I want payouts sent to.</span>
              </label>
            </div>
          )}
          {payouts.formError && <p role="alert" className="text-[12.5px] text-[#9F2525]">{payouts.formError}</p>}

          <div className="flex flex-wrap gap-2">
            <button type="button" className={button} onClick={payouts.onVerify} disabled={payouts.verifying || payouts.accountNumber.length !== 10 || !payouts.bankCode}>
              {payouts.verifying ? "Verifying…" : "Verify account"}
            </button>
            <button type="button" className={cn(button, "bg-white text-[#333134] shadow-[inset_0_0_0_1px_#D9D9D9]")} onClick={payouts.onSave} disabled={!payouts.resolvedName || !payouts.confirmedName || payouts.saving}>
              {payouts.saving ? "Saving…" : payouts.account?.provider === "paystack" ? "Change bank account" : "Save bank account"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h3 className={cn(HEADING, "mb-1")}>Other currencies</h3>
        <p className="mb-4 text-[12.5px] leading-[1.55] text-[#6F6B72]">Use Stripe to receive payouts in currencies other than NGN.</p>
        <div className={cn(CARD, "flex flex-col gap-3 p-[18px]")}>
          {payouts.account?.provider === "stripe" && (
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-medium text-[#333134]">Stripe Connect</span>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", accountReady ? "bg-[#F0FCF5] text-[#0CBA65]" : "bg-[#FDF7EB] text-[#B4760A]")}>
                {accountReady ? "Ready for payouts" : "Setup pending"}
              </span>
              {!accountReady && <button type="button" onClick={payouts.onRefreshAccount} className="ml-auto cursor-pointer text-[12px] underline">Check status</button>}
            </div>
          )}
          {payouts.account?.provider !== "stripe" && <p className="text-[13px] text-[#6F6B72]">Connect a Stripe account to complete onboarding for other currencies.</p>}
          <button type="button" className={button} onClick={payouts.onStripeSetup} disabled={payouts.startingStripe}>
            {payouts.startingStripe ? "Opening Stripe…" : payouts.account?.provider === "stripe" ? "Continue Stripe setup" : "Connect Stripe"}
          </button>
        </div>
      </section>

      <section>
        <h3 className={cn(HEADING, "mb-3")}>Payout history</h3>
        {payouts.historyLoading ? (
          <p role="status" className="text-sm text-[#6F6B72]">Loading payout history…</p>
        ) : payouts.historyError ? (
          <p role="alert" className="rounded-xl bg-[#FFF0F0] p-3 text-sm text-[#9F2525]">{payouts.historyError}</p>
        ) : payouts.history.length === 0 ? (
          <p className="rounded-xl bg-[#FAF9F7] p-4 text-[13px] text-[#6F6B72]">No payouts have been recorded yet.</p>
        ) : (
          <div className={cn(CARD, "overflow-hidden")}>
            {payouts.history.map((item) => (
              <div key={item.id} className="flex min-h-[58px] items-center gap-3 px-4 py-3 shadow-[inset_0_-1px_0_#F0F0F0] last:shadow-none">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#333134]">{item.experience}</p>
                  <p className="mt-1 text-[11.5px] text-[#6F6B72]">{item.date}</p>
                </div>
                <span className="shrink-0 text-[11px] text-[#6F6B72]">{item.currency}</span>
                <p className="shrink-0 text-right text-[13px] font-medium text-[#333134]">{item.amount}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
