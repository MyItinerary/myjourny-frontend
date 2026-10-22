import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { formatPriceOrFree, useBookingQuote, useCreateBooking } from "@/features/booking";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

import { clearCheckoutDraft } from "../model/checkout-draft";
import { useCheckoutDraft } from "../model/checkout-draft-store";
import { rememberCheckoutReturn } from "../model/checkout-return";
import {
  isEmailTakenError,
  isTwoFactorChallenge,
  useEmailLookup,
  useGuestGoogleSignup,
  useGuestLogin,
  useGuestRegister,
} from "../model/guest-account";

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

/** Where the "Log in or sign up" dialog is.
 * email: type it (or use Google). login: it has an account, enter the password.
 * signup: it's new, create a password. google: the account only signs in with
 * Google. code: the account has two-factor sign-in, enter the code. */
export type AuthStage = "email" | "login" | "signup" | "google" | "code";

export type CheckoutAuth = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: AuthStage;
  /** From a later step back to the email. */
  onBack: () => void;
  email: string;
  onEmailChange: (value: string) => void;
  canContinue: boolean;
  checking: boolean;
  onContinue: () => Promise<void>;
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  passwordError: string | null;
  code: string;
  onCodeChange: (value: string) => void;
  canSubmit: boolean;
  pending: boolean;
  /** Log in, create the account, or send the 2FA code, depending on the stage. */
  onSubmit: () => void;
  onGoogleCredential: (credential: string) => void;
  googleLoading: boolean;
  forgotHref: string;
  /** Leaving to reset a password: remember where to come back to. */
  onForgotPassword: () => void;
};

export type CheckoutViewModel = {
  /** False until the saved booking is read; a missing one sends them back. */
  ready: boolean;
  summary: OrderSummary | null;
  steps: {
    backHref: string;
    /** Step 1. Null until they're logged in. */
    account: string | null;
    onStartAuth: () => void;
    /** Step 2: book, then on to Paystack or Stripe. */
    canPay: boolean;
    /** The total is nothing, so step 2 books without a payment page. */
    free: boolean;
    paying: boolean;
    onConfirm: () => void;
  };
  auth: CheckoutAuth;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The same rule sign-up states everywhere: 8+ characters, a letter and a number.
const passwordValid = (password: string) => password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

type Challenge = { via: "password" } | { via: "google"; token: string };

export function useCheckoutViewModel(): CheckoutViewModel {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const draft = useCheckoutDraft();
  const lookup = useEmailLookup();
  const register = useGuestRegister();
  const google = useGuestGoogleSignup();
  const login = useGuestLogin();
  const createBooking = useCreateBooking();
  const attemptKey = useRef<string | null>(null);
  // Bumped when the dialog closes, goes back or the email changes, so an
  // email check still running from before can't move the dialog.
  const lookupRun = useRef(0);

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<AuthStage>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [pending, setPending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const signedIn = !!user?.email;
  // Signed in, the server prices the booking for this account.
  const { data: quote } = useBookingQuote(signedIn && draft ? draft.selection : null);

  // Nothing to check out (a refresh in a new tab, or storage was blocked):
  // back to browsing.
  useEffect(() => {
    if (hydrated && !draft && !paying) router.replace("/");
  }, [hydrated, draft, paying, router]);

  const total = draft ? (quote ? formatPriceOrFree(Number(quote.total), draft.currency) : draft.total) : "";
  // Nothing to pay: the booking is confirmed without a payment page.
  const free = total === "Free";
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

  const trimmedEmail = email.trim();
  const passwordError =
    stage !== "signup"
      ? null
      : password.length > 0 && !passwordValid(password)
        ? "Your password should contain at least 8 characters, a letter and a number"
        : confirmPassword.length > 0 && password !== confirmPassword
          ? "The passwords don't match"
          : null;

  const resetSecrets = () => {
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setChallenge(null);
  };

  // Signed in: the dialog's job is done and step 1 shows who they are.
  const finish = () => {
    setOpen(false);
    setStage("email");
    resetSecrets();
  };

  const onContinue = async () => {
    if (!EMAIL_PATTERN.test(trimmedEmail) || lookup.isPending) return;
    resetSecrets();
    const run = ++lookupRun.current;
    const found = await lookup.mutateAsync(trimmedEmail);
    if (run !== lookupRun.current) return;
    if (!found?.exists) setStage("signup");
    else setStage(found.hasPassword ? "login" : "google");
  };

  const submit = async () => {
    setPending(true);
    try {
      if (stage === "signup") {
        await register.mutateAsync({ email: trimmedEmail, password });
        finish();
      } else if (stage === "login") {
        const data = await login.mutateAsync({ email: trimmedEmail, password });
        if (isTwoFactorChallenge(data)) {
          setChallenge({ via: "password" });
          setStage("code");
        } else finish();
      } else if (stage === "code" && challenge) {
        const data =
          challenge.via === "password"
            ? await login.mutateAsync({ email: trimmedEmail, password, code: code.trim() })
            : await google.mutateAsync({ token: challenge.token, code: code.trim() });
        if (!isTwoFactorChallenge(data)) finish();
      }
    } catch (error) {
      // The auth hooks report the failure. An email that turned out to have an
      // account after all goes to the password step.
      if (stage === "signup" && isEmailTakenError(error)) {
        resetSecrets();
        setStage("login");
      }
    } finally {
      setPending(false);
    }
  };

  const canSubmit =
    !pending &&
    (stage === "signup"
      ? passwordValid(password) && password === confirmPassword
      : stage === "login"
        ? password.length > 0
        : stage === "code"
          ? code.trim().length > 0
          : false);

  const onGoogleCredential = async (credential: string) => {
    setGoogleLoading(true);
    try {
      const data = await google.mutateAsync({ token: credential });
      if (isTwoFactorChallenge(data)) {
        setChallenge({ via: "google", token: credential });
        setStage("code");
      } else finish();
    } catch {
      // Reported by the Google hook.
    } finally {
      setGoogleLoading(false);
    }
  };

  const onConfirm = async () => {
    if (!draft || !signedIn || paying) return;
    setPaying(true);
    // One key per attempt, so a retry can't book twice.
    attemptKey.current ??= crypto.randomUUID();
    try {
      const booking = await createBooking.mutateAsync({
        ...draft.selection,
        idempotencyKey: attemptKey.current,
        guide_id: draft.guideId,
      });
      clearCheckoutDraft();
      if (booking.url) window.location.href = booking.url;
      // Free experiences are confirmed straight away, with nothing to pay.
      else router.push(`/bookings/${booking.id}/success`);

    } catch (error) {
      attemptKey.current = null;
      toast.error(apiErrorMessage(error, "Couldn't start your booking. Please try again."));
      // 409: the session filled up or stopped running. The experience page
      // shows the seats left now.
      if ((error as { response?: { status?: number } })?.response?.status === 409) {
        router.push(`/experiences/${draft.experienceId}`);
        return;
      }
      setPaying(false);
    }
  };

  return {
    ready: hydrated && !!draft,
    summary,
    steps: {
      backHref: summary?.changeHref ?? "/",
      account: signedIn ? (user?.email ?? null) : null,
      onStartAuth: () => setOpen(true),
      canPay: signedIn && !paying,
      free,
      paying,
      onConfirm,
    },
    auth: {
      open: open && !signedIn,
      onOpenChange: (next) => {
        setOpen(next);
        if (!next) {
          lookupRun.current += 1;
          setStage("email");
          resetSecrets();
        }
      },
      stage,
      onBack: () => {
        lookupRun.current += 1;
        setStage("email");
        resetSecrets();
      },
      email,
      onEmailChange: (value) => {
        lookupRun.current += 1;
        setEmail(value);
      },
      canContinue: EMAIL_PATTERN.test(trimmedEmail) && !lookup.isPending && !googleLoading,
      checking: lookup.isPending,
      onContinue,
      password,
      onPasswordChange: setPassword,
      confirmPassword,
      onConfirmPasswordChange: setConfirmPassword,
      passwordError,
      code,
      onCodeChange: setCode,
      canSubmit,
      pending,
      onSubmit: () => {
        if (canSubmit) void submit();
      },
      onGoogleCredential,
      googleLoading,
      forgotHref: "/login/forgot-password",
      // The reset email link opens elsewhere; the booking is already saved,
      // so only note that the end of the flow should come back here.
      onForgotPassword: rememberCheckoutReturn,
    },
  };
}
