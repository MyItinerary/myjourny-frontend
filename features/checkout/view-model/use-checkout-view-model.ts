import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { formatPrice, useBookingQuote, useCreateBooking } from "@/features/booking";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";
import { isTwoFactorChallenge } from "@/lib/queries/auth";

import { clearCheckoutDraft } from "../model/checkout-draft";
import { useCheckoutDraft } from "../model/checkout-draft-store";
import { useGuestEmailSignup, useGuestGoogleSignup } from "../model/guest-signup";

export type OrderSummary = {
  title: string;
  imageUrl: string | null;
  rating: number | null;
  when: string;
  guests: string;
  durationLabel: string;
  /** "₦16,000.00" */
  total: string;
  /** "x 1 Adult" */
  quantity: string;
  /** Back to the experience, to change the booking. */
  changeHref: string;
};

export type CheckoutViewModel = {
  /** False until the saved booking is read; a missing one sends the guest back. */
  ready: boolean;
  summary: OrderSummary | null;
  step: "email" | "details";
  email: {
    value: string;
    onChange: (value: string) => void;
    canContinue: boolean;
    pending: boolean;
    onContinue: () => void;
    onGoogleCredential: (credential: string) => void;
    googleLoading: boolean;
  };
  details: {
    email: string;
    phone: string;
    onPhoneChange: (value: string) => void;
    note: string;
    onNoteChange: (value: string) => void;
    canPay: boolean;
    pending: boolean;
    onConfirm: () => void;
  };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Nigerian numbers: 10 digits after +234, or 11 with the leading 0.
const PHONE_DIGITS = /^\d{10,11}$/;

export function useCheckoutViewModel(): CheckoutViewModel {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const draft = useCheckoutDraft();
  const signup = useGuestEmailSignup();
  const googleSignup = useGuestGoogleSignup();
  const createBooking = useCreateBooking();
  const attemptKey = useRef<string | null>(null);

  const [emailInput, setEmailInput] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const signedIn = !!user?.email;
  // Once they have an account the server can price the booking for real.
  const { data: quote } = useBookingQuote(signedIn && draft ? draft.selection : null);

  // Nothing to check out (a refresh in a new tab, or storage was blocked):
  // back to browsing.
  useEffect(() => {
    if (hydrated && !draft) router.replace("/");
  }, [hydrated, draft, router]);

  const total = draft ? (quote ? formatPrice(Number(quote.total), draft.currency) : draft.total) : "";
  const summary: OrderSummary | null = draft
    ? {
        title: draft.title,
        imageUrl: draft.imageUrl,
        rating: draft.rating,
        when: draft.when,
        guests: `${draft.guests} guest${draft.guests === 1 ? "" : "s"}`,
        durationLabel: draft.durationLabel,
        total,
        quantity: `x ${draft.ticketsLabel}`,
        changeHref: `/experiences/${draft.experienceId}`,
      }
    : null;

  const onContinue = () => {
    if (!EMAIL_PATTERN.test(emailInput.trim()) || signup.isPending) return;
    signup.mutate(emailInput.trim(), {
      onError: (error) => toast.error(apiErrorMessage(error, "Couldn't continue with that email. Please try again.")),
    });
  };

  const onGoogleCredential = (credential: string) => {
    setGoogleLoading(true);
    googleSignup.mutate(
      { token: credential },
      {
        onSuccess: (data) => {
          if (isTwoFactorChallenge(data)) {
            toast.info("This account uses two-factor authentication. Log in to continue.");
            router.push(`/login?next=${encodeURIComponent("/checkout")}`);
          }
          setGoogleLoading(false);
        },
        onError: () => setGoogleLoading(false),
      },
    );
  };

  const phoneValid = PHONE_DIGITS.test(phone);
  // The phone is checked but not sent yet: itin only takes a phone number
  // through its verified phone-change flow, and the booking has no field for it.
  const onConfirm = () => {
    if (!draft || !phoneValid || createBooking.isPending) return;
    // One key per attempt, so a double click can't book twice.
    attemptKey.current ??= crypto.randomUUID();
    createBooking.mutate(
      { ...draft.selection, idempotencyKey: attemptKey.current, guide_id: draft.guideId },
      {
        onSuccess: (booking) => {
          clearCheckoutDraft();
          if (booking.url) window.location.href = booking.url;
          else if (booking.status === "confirmed") router.push(`/bookings/${booking.id}/success`);
          else router.push(`/bookings/${booking.id}`);
        },
        onError: (error) => {
          attemptKey.current = null;
          toast.error(apiErrorMessage(error, "Couldn't start your booking. Please try again."));
        },
      },
    );
  };

  return {
    ready: hydrated && !!draft,
    summary,
    step: signedIn ? "details" : "email",
    email: {
      value: emailInput,
      onChange: setEmailInput,
      canContinue: EMAIL_PATTERN.test(emailInput.trim()) && !signup.isPending && !googleLoading,
      pending: signup.isPending,
      onContinue,
      onGoogleCredential,
      googleLoading,
    },
    details: {
      email: user?.email ?? "",
      phone,
      onPhoneChange: (value) => setPhone(value.replace(/\D/g, "")),
      note,
      onNoteChange: setNote,
      canPay: phoneValid && !createBooking.isPending,
      pending: createBooking.isPending,
      onConfirm,
    },
  };
}
