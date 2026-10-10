import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { formatPrice, useBookingQuote, useCreateBooking } from "@/features/booking";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

import { clearCheckoutDraft } from "../model/checkout-draft";
import { COUNTRIES, DEFAULT_COUNTRY, isValidPhone, toE164 } from "../model/countries";
import type { Country } from "../model/country.types";
import { useCheckoutDraft } from "../model/checkout-draft-store";
import {
  isEmailTakenError,
  useEmailHasAccount,
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

/** details: email and phone, then Continue. password: choose one, then pay.
 * pay: already signed in (Google, or an account), so just the phone. */
export type CheckoutStep = "details" | "password" | "pay";

/** The "Welcome back!" sheet for an email that already has an account. */
export type CheckoutLogin = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  canSubmit: boolean;
  pending: boolean;
  onSubmit: () => void;
  onGoogleCredential: (credential: string) => void;
  googleLoading: boolean;
  forgotHref: string;
};

export type CheckoutViewModel = {
  /** False until the saved booking is read; a missing one sends the guest back. */
  ready: boolean;
  summary: OrderSummary | null;
  form: {
    step: CheckoutStep;
    email: string;
    onEmailChange: (value: string) => void;
    /** Typed email is fine to use; the email is locked once signed in or past the first step. */
    emailLocked: boolean;
    country: {
      selected: Country;
      options: Country[];
      onSelect: (country: Country) => void;
    };
    phone: string;
    onPhoneChange: (value: string) => void;
    phoneLocked: boolean;
    password: string;
    onPasswordChange: (value: string) => void;
    confirmPassword: string;
    onConfirmPasswordChange: (value: string) => void;
    passwordError: string | null;
    /** Sign-up failed because the email already has an account. */
    emailTaken: boolean;
    loginHref: string;
    /** This email already has an account: "Continue" becomes "Login and continue to book". */
    accountExists: boolean;
    canContinue: boolean;
    onContinue: () => void;
    canPay: boolean;
    pending: boolean;
    onConfirm: () => void;
    onGoogleCredential: (credential: string) => void;
    googleLoading: boolean;
  };
  login: CheckoutLogin;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches the rule the form states: 8+ characters, a letter and a number.
const passwordValid = (password: string) => password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

export function useCheckoutViewModel(): CheckoutViewModel {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const draft = useCheckoutDraft();
  const register = useGuestRegister();
  const googleSignup = useGuestGoogleSignup();
  const login = useGuestLogin();
  const createBooking = useCreateBooking();
  const attemptKey = useRef<string | null>(null);

  const [stage, setStage] = useState<"details" | "password">("details");
  const [emailInput, setEmailInput] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  // Held from "Confirm and pay" until the page leaves: signing up makes the
  // guest signed in, which must not flip the form to its signed-in layout mid-way.
  const [submitting, setSubmitting] = useState(false);
  // The email sign-up turned away as already taken, when the lookup didn't know.
  const [takenEmail, setTakenEmail] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [loginGoogleLoading, setLoginGoogleLoading] = useState(false);
  const lookup = useEmailHasAccount(emailInput);

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

  const step: CheckoutStep = signedIn && !submitting ? "pay" : stage;
  const email = step === "pay" ? (user?.email ?? "") : emailInput.trim();
  const phoneValid = isValidPhone(country, phone);
  const detailsValid = EMAIL_PATTERN.test(emailInput.trim()) && phoneValid;

  const accountExists = step === "details" && (lookup.exists || takenEmail === emailInput.trim());

  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordError =
    password.length > 0 && !passwordValid(password)
      ? "Your password should contain at least 8 characters, a letter and a number"
      : confirmMismatch
        ? "The passwords don't match"
        : null;
  const passwordsReady = passwordValid(password) && password === confirmPassword;

  const bookAndPay = async () => {
    if (!draft) return;
    // One key per attempt, so a retry can't book twice.
    attemptKey.current ??= crypto.randomUUID();
    const booking = await createBooking.mutateAsync({
      ...draft.selection,
      idempotencyKey: attemptKey.current,
      guide_id: draft.guideId,
    });
    clearCheckoutDraft();
    if (booking.url) window.location.href = booking.url;
    else if (booking.status === "confirmed") router.push(`/bookings/${booking.id}/success`);
    else router.push(`/bookings/${booking.id}`);
  };

  // A new account is created with the phone as well as the email, so it lands
  // on their profile. (Someone already signed in, e.g. with Google, has no
  // sign-up to attach it to; saving theirs needs itin's verified phone-change flow.)
  const onConfirm = async () => {
    if (submitting || !draft || !phoneValid) return;
    if (step === "password" && !passwordsReady) return;
    setSubmitting(true);
    register.reset();
    // Sign-up reports its own failure; once it worked, anything that fails is the booking.
    let accountReady = step !== "password";
    try {
      // Create the account first, then book with it, then on to the payment page.
      if (step === "password") {
        await register.mutateAsync({ email, password, phone_number: toE164(country, phone) });
        accountReady = true;
      }
      await bookAndPay();
    } catch (error) {
      attemptKey.current = null;
      if (accountReady) toast.error(apiErrorMessage(error, "Couldn't start your booking. Please try again."));
      else if (isEmailTakenError(error)) {
        // Taken after all: back to the first step, now offering to log in.
        setTakenEmail(email);
        setStage("details");
      }
      setSubmitting(false);
    }
  };

  const onGoogleCredential = (credential: string) => {
    setGoogleLoading(true);
    googleSignup.mutate(
      { token: credential },
      {
        onSuccess: () => setGoogleLoading(false),
        onError: () => setGoogleLoading(false),
      },
    );
  };

  // Logged in: straight on to the payment page, no extra click.
  const continueAfterLogin = async () => {
    setLoginOpen(false);
    setSubmitting(true);
    try {
      await bookAndPay();
    } catch (error) {
      attemptKey.current = null;
      toast.error(apiErrorMessage(error, "Couldn't start your booking. Please try again."));
      setSubmitting(false);
    }
  };

  const onLogin = async () => {
    if (loginPending || !loginEmail.trim() || !loginPassword) return;
    setLoginPending(true);
    try {
      // Email and password only. Wrong details are reported by the login itself.
      await login.mutateAsync({ email: loginEmail.trim(), password: loginPassword });
    } catch {
      setLoginPending(false);
      return;
    }
    setLoginPending(false);
    await continueAfterLogin();
  };

  const onLoginGoogle = (credential: string) => {
    setLoginGoogleLoading(true);
    googleSignup.mutate(
      { token: credential },
      {
        onSuccess: async () => {
          setLoginGoogleLoading(false);
          await continueAfterLogin();
        },
        onError: () => setLoginGoogleLoading(false),
      },
    );
  };

  return {
    ready: hydrated && !!draft,
    summary,
    form: {
      step,
      email: step === "pay" ? email : emailInput,
      onEmailChange: setEmailInput,
      emailLocked: step !== "details",
      country: { selected: country, options: COUNTRIES, onSelect: setCountry },
      phone,
      onPhoneChange: (value) => setPhone(value.replace(/\D/g, "")),
      phoneLocked: step === "password",
      password,
      onPasswordChange: setPassword,
      confirmPassword,
      onConfirmPasswordChange: setConfirmPassword,
      passwordError,
      emailTaken: isEmailTakenError(register.error),
      loginHref: `/login?next=${encodeURIComponent("/checkout")}`,
      accountExists,
      canContinue: detailsValid && !googleLoading && !lookup.checking,
      onContinue: () => {
        if (!detailsValid) return;
        if (accountExists) {
          setLoginEmail(emailInput.trim());
          setLoginOpen(true);
        } else {
          setStage("password");
        }
      },
      canPay: step === "password" ? passwordsReady && !submitting : phoneValid && !submitting,
      pending: submitting,
      onConfirm,
      onGoogleCredential,
      googleLoading,
    },
    login: {
      open: loginOpen,
      onOpenChange: setLoginOpen,
      email: loginEmail,
      onEmailChange: setLoginEmail,
      password: loginPassword,
      onPasswordChange: setLoginPassword,
      canSubmit: !!loginEmail.trim() && !!loginPassword && !loginPending && !loginGoogleLoading,
      pending: loginPending,
      onSubmit: onLogin,
      onGoogleCredential: onLoginGoogle,
      googleLoading: loginGoogleLoading,
      forgotHref: "/login/forgot-password",
    },
  };
}
