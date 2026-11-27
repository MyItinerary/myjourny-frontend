import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

import { formatAmount, sessionDate } from "../model/earnings";
import { useCreateStripeOnboarding, useHostPayoutHistory, usePaystackBanks, usePayoutAccount, useResolvePaystackAccount, useSavePaystackRecipient } from "../model/payouts-data";
import type { PaystackRecipientInput } from "../model/payouts.types";
import {
  closingCopy,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_NOTE,
  PANE_COPY,
  PROFILE_PANES,
  SETUP_NOTE,
} from "../model/profile-copy";
import { useHostProfile } from "../model/profile-data";
import type { HostProfile, ProfilePaneKey, ProfileRow, SetupTask } from "../model/profile.types";
import { HOST_PORTAL_BASE } from "../model/nav";
import type { HostPageHeader } from "./use-host-home-view-model";
import { usePreviewMode } from "./use-preview-mode";

export type ProfileNavItem = {
  key: ProfilePaneKey;
  label: string;
  icon: "person" | "card" | "shield" | "bell" | "globe" | "doc";
  active: boolean;
  /** "1 left" */
  badge: string | null;
};

export type HostProfileViewModel = {
  header: HostPageHeader;
  nav: ProfileNavItem[];
  onPane: (pane: ProfilePaneKey) => void;
  pane: ProfilePaneKey;
  title: string;
  subtitle: string;
  setup: { count: string; percent: number; note: string; tasks: (SetupTask & { onOpen: () => void })[] } | null;
  rows: ProfileRow[];
  onRowAction: (row: ProfileRow) => void;
  preview: HostProfile["preview"] | null;
  notifications: {
    channels: readonly string[];
    rows: { label: string; cells: { on: boolean; locked: boolean }[] }[];
    note: string;
    onToggle: (row: number, channel: number) => void;
  } | null;
  payouts: {
    account: { connected: boolean; provider: string | null; onboardingCompleted: boolean } | null;
    accountLoading: boolean;
    accountError: string | null;
    banks: { name: string; code: string }[];
    banksLoading: boolean;
    banksError: string | null;
    bankCode: string;
    accountNumber: string;
    resolvedName: string | null;
    confirmedName: boolean;
    formError: string | null;
    verifying: boolean;
    saving: boolean;
    startingStripe: boolean;
    history: { id: string; date: string; experience: string; currency: string; amount: string }[];
    historyLoading: boolean;
    historyError: string | null;
    onBankChange: (code: string) => void;
    onAccountNumberChange: (accountNumber: string) => void;
    onConfirmNameChange: (confirmed: boolean) => void;
    onRetryBanks: () => void;
    onVerify: () => void;
    onSave: () => void;
    onStripeSetup: () => void;
    onRefreshAccount: () => void;
  } | null;
  tax: { statements: HostProfile["statements"]; documents: HostProfile["documents"]; onAction: () => void } | null;
  danger: { text: string; onStart: () => void } | null;
};

const NOT_CONNECTED = "This will work once your profile is connected.";

const isPane = (value: string | null): value is ProfilePaneKey => PROFILE_PANES.some((p) => p.key === value);

export function useHostProfileViewModel(): HostProfileViewModel {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useSession();
  const profile = useHostProfile(usePreviewMode(), user);

  const fromUrl = params.get("pane");
  const [pane, setPane] = useState<ProfilePaneKey>(isPane(fromUrl) ? fromUrl : "personal");
  const [notifOverride, setNotif] = useState<HostProfile["notifications"] | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolved, setResolved] = useState<{ accountNumber: string; bankCode: string; name: string } | null>(null);
  const [confirmedName, setConfirmedName] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const resolvedName = resolved?.accountNumber === accountNumber && resolved.bankCode === bankCode ? resolved.name : null;

  const notifications = notifOverride ?? profile.notifications;
  const soon = () => toast.info(NOT_CONNECTED);
  const payoutsOpen = pane === "payouts";
  const payoutAccount = usePayoutAccount(payoutsOpen);
  const banks = usePaystackBanks(payoutsOpen);
  const payoutHistory = useHostPayoutHistory(payoutsOpen);
  const resolveAccount = useResolvePaystackAccount();
  const saveRecipient = useSavePaystackRecipient();
  const createStripeOnboarding = useCreateStripeOnboarding();

  const onVerify = () => {
    setFormError(null);
    setResolved(null);
    setConfirmedName(false);
    if (!bankCode || !/^\d{10}$/.test(accountNumber)) {
      setFormError("Choose a bank and enter its 10-digit account number.");
      return;
    }
    resolveAccount.mutate(
      { accountNumber, bankCode },
      {
        onSuccess: (result) => {
          if (result.account_number !== accountNumber) {
            setFormError("The bank returned a different account number. Please verify it again.");
            return;
          }
          setResolved({ accountNumber, bankCode, name: result.account_name });
        },
        onError: (error) => setFormError(apiErrorMessage(error, "We couldn't verify that account. Check the details and try again.")),
      },
    );
  };

  const onSave = () => {
    setFormError(null);
    if (!user?.id) {
      setFormError("Sign in again before adding a payout account.");
      return;
    }
    if (!bankCode || !resolvedName) {
      setFormError("Verify the account name before saving the bank details.");
      return;
    }
    if (!confirmedName) {
      setFormError("Confirm that the verified account name is correct before saving.");
      return;
    }
    const recipient: PaystackRecipientInput = {
      name: resolvedName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
      target_id: user.id,
      account_type: "guide",
    };
    saveRecipient.mutate(recipient, {
      onSuccess: () => toast.success("Your Naira payout account is connected."),
      onError: (error) => setFormError(apiErrorMessage(error, "We couldn't save the bank account. Please try again.")),
    });
  };

  const onStripeSetup = () => {
    if (!user?.id) {
      toast.error("Sign in again before connecting a payout account.");
      return;
    }
    createStripeOnboarding.mutate(user.id, {
      onSuccess: ({ account_url }) => {
        window.location.href = account_url;
      },
      onError: (error) => toast.error(apiErrorMessage(error, "We couldn't start Stripe onboarding. Please try again.")),
    });
  };

  const doneTasks = profile.setup?.filter((t) => t.done).length ?? 0;

  return {
    header: {
      title: "Your profile",
      chip: profile.setup ? "Not live yet" : "Live",
      subtitle: "This is what guests see before they book",
      actions: [{ label: "View as a guest", onClick: soon, primary: false }],
    },
    nav: PROFILE_PANES.map((p) => ({
      ...p,
      active: p.key === pane,
      badge: p.key === "verify" && profile.verifyLeft > 0 ? `${profile.verifyLeft} left` : null,
    })),
    onPane: setPane,
    pane,
    title: PANE_COPY[pane].title,
    subtitle: PANE_COPY[pane].sub,
    setup:
      pane === "personal" && profile.setup
        ? {
            count: `${doneTasks} of ${profile.setup.length} done`,
            percent: Math.max(6, Math.round((doneTasks / profile.setup.length) * 100)),
            note: SETUP_NOTE,
            tasks: profile.setup.map((task) => ({ ...task, onOpen: () => setPane(task.pane) })),
          }
        : null,
    rows: pane === "notify" || pane === "payouts" ? [] : profile.rows[pane],
    onRowAction: (row) => {
      if (row.link === "earnings") router.push(`${HOST_PORTAL_BASE}/earnings`);
      else if (row.link === "help") router.push(`${HOST_PORTAL_BASE}/help?guide=1`);
      else soon();
    },
    preview: pane === "public" ? profile.preview : null,
    notifications:
      pane === "notify"
        ? {
            channels: NOTIFICATION_CHANNELS,
            rows: notifications.map((n, r) => ({
              label: n.label,
              // Booking requests always reach WhatsApp.
              cells: n.channels.map((on, c) => ({ on, locked: r === 0 && c === 0 })),
            })),
            note: NOTIFICATION_NOTE,
            onToggle: (r, c) => {
              if (r === 0 && c === 0) return;
              setNotif(
                notifications.map((n, i) =>
                  i === r ? { ...n, channels: n.channels.map((on, j) => (j === c ? !on : on)) as typeof n.channels } : n,
                ),
              );
            },
          }
        : null,
    payouts: payoutsOpen
      ? {
          account: payoutAccount.data
            ? {
                connected: payoutAccount.data.connected,
                provider: payoutAccount.data.provider,
                onboardingCompleted: payoutAccount.data.onboarding_completed,
              }
            : null,
          accountLoading: payoutAccount.isPending,
          accountError: payoutAccount.isError ? apiErrorMessage(payoutAccount.error, "Couldn't load your payout account.") : null,
          banks: banks.data ?? [],
          banksLoading: banks.isPending,
          banksError: banks.isError ? apiErrorMessage(banks.error, "Couldn't load available banks. Please retry.") : null,
          bankCode,
          accountNumber,
          resolvedName,
          confirmedName,
          formError,
          verifying: resolveAccount.isPending,
          saving: saveRecipient.isPending,
          startingStripe: createStripeOnboarding.isPending,
          history: (payoutHistory.data ?? []).map((payout) => ({
            id: payout.id,
            date: sessionDate(payout.created_at),
            experience: payout.experience_title ?? "Experience",
            currency: payout.currency,
            amount: formatAmount(payout.amount, payout.currency),
          })),
          historyLoading: payoutHistory.isPending,
          historyError: payoutHistory.isError ? apiErrorMessage(payoutHistory.error, "Couldn't load payout history.") : null,
          onBankChange: (code) => {
            setBankCode(code);
            setResolved(null);
            setConfirmedName(false);
            setFormError(null);
          },
          onAccountNumberChange: (number) => {
            setAccountNumber(number.replace(/\D/g, "").slice(0, 10));
            setResolved(null);
            setConfirmedName(false);
            setFormError(null);
          },
          onConfirmNameChange: setConfirmedName,
          onRetryBanks: () => void banks.refetch(),
          onVerify,
          onSave,
          onStripeSetup,
          onRefreshAccount: () => void payoutAccount.refetch(),
        }
      : null,
    tax: pane === "tax" ? { statements: profile.statements, documents: profile.documents, onAction: soon } : null,
    danger: pane === "security" ? { text: closingCopy(profile.closing), onStart: soon } : null,
  };
}
