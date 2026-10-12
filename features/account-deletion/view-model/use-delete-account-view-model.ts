import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";
import { signOutLocally } from "@/lib/queries/profile";

import {
  blockersFromError,
  describeBlockers,
  DELETION_PREVIEW_KEY,
  previewBlockers,
  useDeleteAccount,
  useDeletionPreview,
} from "../model/account-deletion";
import type { BlockerNote } from "../model/account-deletion.types";

type Options = {
  /** The dialog is showing; the preview is only fetched then. */
  open: boolean;
  email: string;
  onClose: () => void;
  onDeactivateInstead: () => void;
};

export type DeleteAccountViewModel = {
  open: boolean;
  step: 1 | 2;
  email: string;
  checking: boolean;
  /** What has to be resolved first; empty when the account can be deleted. */
  blockers: BlockerNote[];
  canContinue: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  canConfirm: boolean;
  deleting: boolean;
  onContinue: () => void;
  onBack: () => void;
  onConfirm: () => void;
  onClose: () => void;
  onDeactivateInstead: () => void;
};

/** The two-step delete-account dialog: what blocks deletion or what goes,
 * then typing DELETE to confirm. */
export function useDeleteAccountViewModel({ open, email, onClose, onDeactivateInstead }: Options): DeleteAccountViewModel {
  const queryClient = useQueryClient();
  const preview = useDeletionPreview(open);
  const deleteAccount = useDeleteAccount();
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState("");

  const blockers = describeBlockers(previewBlockers(preview.data));
  const checking = preview.isLoading;
  const typed = draft.trim().toUpperCase() === "DELETE";

  const close = () => {
    setStep(1);
    setDraft("");
    onClose();
  };

  const onConfirm = () => {
    if (!typed || deleteAccount.isPending) return;
    deleteAccount.mutate(undefined, {
      onSuccess: () => signOutLocally(queryClient),
      onError: (error) => {
        const blocked = blockersFromError(error);
        if (blocked) {
          // Something changed since step 1 (a new booking, a refund request):
          // go back and show it.
          queryClient.setQueryData(DELETION_PREVIEW_KEY, {
            upcoming_booking_count: blocked.upcoming_bookings,
            review_count: 0,
            can_delete: false,
            blockers: blocked,
          });
          setStep(1);
          setDraft("");
          return;
        }
        toast.error(apiErrorMessage(error, "Couldn't delete your account."));
      },
    });
  };

  return {
    open,
    step,
    email,
    checking,
    blockers,
    canContinue: !checking && !preview.isError && blockers.length === 0,
    draft,
    onDraftChange: setDraft,
    canConfirm: typed && !deleteAccount.isPending,
    deleting: deleteAccount.isPending,
    onContinue: () => setStep(2),
    onBack: () => setStep(1),
    onConfirm,
    onClose: close,
    onDeactivateInstead: () => {
      close();
      onDeactivateInstead();
    },
  };
}
