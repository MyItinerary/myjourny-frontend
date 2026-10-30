import { useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import {
  type EstimateSummary,
  type OutcomeSummary,
  estimateSummary,
  outcomeSummary,
  requestOutcome,
  useCancellationRequest,
  useRefundEstimate,
  useRequestCancellation,
} from "../model/cancellation";

type BookingForCancellation = {
  id: string;
  status: string;
  payment_status: string;
  currency?: string | null;
  session_timezone?: string | null;
  cancellation_policy_snapshot?: string | null;
};

export type BookingCancellationViewModel = {
  policyText: string;
  /** Before asking: what the policy gives if they cancel now. */
  estimate: EstimateSummary | null;
  /** After asking: where the request stands. */
  outcome: OutcomeSummary | null;
  canRequest: boolean;
  unpaid: boolean;
  formOpen: boolean;
  reason: string;
  canSubmit: boolean;
  sending: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
  onReason: (text: string) => void;
  onSubmit: () => void;
};

const NOT_LOADED: BookingForCancellation = { id: "", status: "", payment_status: "" };

const NO_POLICY = "This experience has no written cancellation policy. Our support team will review any request.";

/** The booking page's cancellation section: the policy agreed at booking,
 * what cancelling now would get back, and the request once sent. Refunds are
 * decided by MyJourny support, never automatically. */
export function useBookingCancellationViewModel(
  loaded: BookingForCancellation | null | undefined,
  signedIn: boolean,
): BookingCancellationViewModel {
  // Hooks run before the page knows the booking; nothing is fetched until it does.
  const booking = loaded ?? NOT_LOADED;
  const { data: request } = useCancellationRequest(booking.id, signedIn);
  const active = booking.status === "confirmed" || booking.status === "pending";
  const paid = booking.payment_status === "paid" || booking.payment_status === "partial";
  const pending = request ? requestOutcome(request) === "pending" : false;
  // A declined request leaves the booking on, so they can ask again.
  const canRequest = active && !pending;
  const { data: estimate } = useRefundEstimate(booking.id, signedIn && canRequest && paid);
  const send = useRequestCancellation(booking.id);
  const [formOpen, setFormOpen] = useState(false);
  const [reason, setReason] = useState("");
  const currency = booking.currency ?? "NGN";

  // The latest request is shown until the customer asks again.
  const showOutcome = request && (pending || !formOpen);

  return {
    policyText: booking.cancellation_policy_snapshot || NO_POLICY,
    estimate:
      canRequest && paid && estimate ? estimateSummary(estimate, currency, booking.session_timezone ?? undefined) : null,
    outcome: showOutcome ? outcomeSummary(request, currency) : null,
    canRequest,
    unpaid: booking.payment_status === "unpaid",
    formOpen,
    reason,
    canSubmit: reason.trim().length >= 3 && !send.isPending,
    sending: send.isPending,
    onOpenForm: () => setFormOpen(true),
    onCloseForm: () => setFormOpen(false),
    onReason: setReason,
    onSubmit: () =>
      send.mutate(reason.trim(), {
        onSuccess: (data) => {
          toast.success(
            data.request
              ? "Cancellation requested. We've emailed you, and we'll email again once support has reviewed it."
              : "Booking cancelled.",
          );
          setFormOpen(false);
          setReason("");
        },
        onError: (error) =>
          toast.error(apiErrorMessage(error, "Couldn't send your cancellation request. Please try again.")),
      }),
  };
}
