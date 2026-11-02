import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import { useNeedsEmailVerification, useResendVerification } from "../model/verify-email";

export type VerifyEmailNoticeViewModel = {
  visible: boolean;
  sending: boolean;
  sent: boolean;
  onResend: () => void;
};

/** A nudge for password signups that haven't opened their verification
 * link yet. Nothing is blocked; it only offers to send the link again. */
export function useVerifyEmailNoticeViewModel(): VerifyEmailNoticeViewModel {
  const visible = useNeedsEmailVerification();
  const resend = useResendVerification();
  return {
    visible,
    sending: resend.isPending,
    sent: resend.isSuccess,
    onResend: () => {
      if (resend.isPending) return;
      resend.mutate(undefined, {
        onSuccess: () => toast.success("We've sent you a new link."),
        onError: (error) => toast.error(apiErrorMessage(error, "We couldn't send the link. Try again.")),
      });
    },
  };
}
