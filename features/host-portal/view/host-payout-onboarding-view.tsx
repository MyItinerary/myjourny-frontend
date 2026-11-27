import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostPayoutOnboardingViewModel } from "../view-model/use-host-payout-onboarding-view-model";

const STATUS: Record<HostPayoutOnboardingViewModel["status"], string> = {
  loading: "Checking Stripe account…",
  error: "Couldn't check payout status",
  ready: "Stripe payouts are ready",
  pending: "Stripe setup is being confirmed",
  incomplete: "Stripe setup is incomplete",
};

export function HostPayoutOnboardingView({ vm }: { vm: HostPayoutOnboardingViewModel }) {
  const ready = vm.status === "ready";
  const pending = vm.status === "pending";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FCFCFC] px-5 py-12">
      <section className="w-full max-w-[520px] rounded-3xl bg-white p-7 shadow-[inset_0_0_0_1px_#E7E7E7] sm:p-9">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#6F6B72]">MyJourny payouts</p>
        <h1 className="mt-3 font-heading text-2xl font-extrabold text-[#333134]">Stripe account status</h1>
        <p className="mt-2 text-sm leading-[1.6] text-[#6F6B72]">{STATUS[vm.status]}</p>

        {vm.status === "loading" ? (
          <p role="status" className="mt-5 rounded-xl bg-[#FAF9F7] p-4 text-sm text-[#6F6B72]">Loading your payout status…</p>
        ) : vm.error ? (
          <p role="alert" className="mt-5 rounded-xl bg-[#FFF0F0] p-4 text-sm text-[#9F2525]">{vm.error}</p>
        ) : (
          <p className={cn("mt-5 rounded-xl p-4 text-sm leading-[1.6]", ready ? "bg-[#F0FCF5] text-[#0C7540]" : "bg-[#FDF7EB] text-[#8A5B08]")}>
            {vm.message}
          </p>
        )}

        {pending && (
          <button type="button" onClick={vm.onRefresh} className="mt-4 h-10 cursor-pointer rounded-full bg-white px-4 text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#D9D9D9]">
            Check status now
          </button>
        )}
        {vm.status === "error" && (
          <button type="button" onClick={vm.onRefresh} className="mt-4 h-10 cursor-pointer rounded-full bg-white px-4 text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#D9D9D9]">
            Retry status check
          </button>
        )}

        <Link href="/host/dashboard/profile?pane=payouts" className="mt-6 inline-flex h-10 items-center rounded-full bg-[#2C0101] px-4 text-[13px] font-medium text-white">
          Return to payout settings
        </Link>
      </section>
    </main>
  );
}
