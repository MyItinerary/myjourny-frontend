"use client";

import { ModalShell, TextField } from "@/components/account-settings/section-ui";
import { cn } from "@/lib/utils";

import type { DeleteAccountViewModel } from "../view-model/use-delete-account-view-model";

const GOES = [
  {
    title: "Your profile and preferences",
    body: "Your name, photo, contact details and preference answers, which cannot be rebuilt.",
  },
  { title: "Saved experiences, wishlists and trips", body: null },
  {
    title: "Your sign-in",
    body: "Your password and connected accounts. Signing up again with the same email starts a new account.",
  },
];

/** The delete-account dialog. Step 1 says what blocks deletion, or what goes
 * and what is kept; step 2 asks the person to type DELETE. */
export function DeleteAccountDialogView(vm: DeleteAccountViewModel) {
  if (!vm.open) return null;
  return (
    <ModalShell title="Delete your account" onClose={vm.onClose}>
      <div className="text-[13px] font-medium text-brand">Step {vm.step} of 2</div>
      {vm.step === 1 ? <WhatHappens {...vm} /> : <Confirm {...vm} />}
    </ModalShell>
  );
}

function WhatHappens(vm: DeleteAccountViewModel) {
  return (
    <>
      {vm.checking ? (
        <div className="mt-3.5 text-base text-muted-foreground">Checking your bookings…</div>
      ) : vm.blockers.length > 0 ? (
        <div className="mt-3.5 flex flex-col gap-3">
          <div className="text-base text-foreground">A few things need to be settled before you can delete your account.</div>
          {vm.blockers.map((blocker) => (
            <div key={blocker.key} className="rounded-xl bg-muted p-4.5">
              <div className="text-[15px] font-medium text-foreground">{blocker.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{blocker.body}</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-3.5 text-base text-foreground">Deleting is permanent. Here is what goes.</div>
          <div className="mt-4.5 flex flex-col gap-3.5">
            {GOES.map((item) => (
              <div key={item.title} className="rounded-xl border border-border p-4">
                <div className="text-[15px] font-medium text-foreground">{item.title}</div>
                {item.body && <div className="mt-0.5 text-sm text-muted-foreground">{item.body}</div>}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-border p-4">
            <div className="text-[15px] font-medium text-foreground">What we keep</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Booking and payment records, without your name or contact details. We have to keep them for refunds,
              disputes and tax. Download your data from Privacy first if you want your own copy of receipts.
            </div>
          </div>
        </>
      )}
      <div className="mt-5 rounded-xl bg-muted p-4.5">
        <div className="text-[15px] font-medium text-foreground">Deactivating hides your account and is reversible</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Your profile stops being visible, and signing in brings it back.
        </div>
        <button
          type="button"
          onClick={vm.onDeactivateInstead}
          className="mt-2.5 cursor-pointer text-sm font-medium text-brand underline"
        >
          Deactivate instead
        </button>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={vm.onClose}
          className="cursor-pointer rounded-full bg-muted px-5.5 py-3 text-[15px] font-medium text-foreground"
        >
          Keep my account
        </button>
        <button
          type="button"
          disabled={!vm.canContinue}
          onClick={vm.onContinue}
          className="cursor-pointer rounded-full border border-foreground px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to delete
        </button>
      </div>
    </>
  );
}

function Confirm(vm: DeleteAccountViewModel) {
  return (
    <>
      <div className="mt-3.5 text-base text-foreground">
        This removes {vm.email} and your personal details straight away. It can&apos;t be undone.
      </div>
      <TextField
        label="Type DELETE to confirm"
        value={vm.draft}
        onChange={(e) => vm.onDraftChange(e.target.value)}
        className="tracking-[0.08em]"
      />
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={vm.onBack}
          className="cursor-pointer text-[15px] font-medium text-muted-foreground underline hover:text-primary"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!vm.canConfirm}
          onClick={vm.onConfirm}
          className={cn(
            "cursor-pointer rounded-full px-5.5 py-3 text-[15px] font-medium",
            vm.canConfirm ? "bg-brand text-white hover:bg-[#FF4540]" : "cursor-not-allowed bg-[#E0E0E0] text-[#BDBDBD]",
          )}
        >
          {vm.deleting ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </>
  );
}
