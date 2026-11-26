"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth/session-store";
import { isHostAccount, useMe } from "@/lib/queries/auth";

import {
  clearApplicationDraft,
  emailHasAccount,
  loadApplicationDraft,
  saveApplicationDraft,
  submitGuideApplication,
  useSubmitHostApplication,
} from "../model/guide-application-api";
import {
  dateOfBirthToIso,
  isOldEnoughToGuide,
  isStrongPassword,
  isValidCacNumber,
  isValidEmail,
  isValidPhoneNumber,
  isValidWebsite,
  MIN_GUIDE_AGE,
  passwordChecks,
  splitName,
} from "../model/guide-application-rules";
import {
  COUNTRIES,
  DEFAULT_APPLICATION_DATA,
  VERIFICATION_TYPES,
  type ApplicationStep,
  type GuideApplicationErrors,
  type GuideApplicationFormData,
  type VerificationType,
} from "../model/guide-application.types";

export interface GuideApplicationViewModel {
  step: ApplicationStep;
  formData: GuideApplicationFormData;
  errors: GuideApplicationErrors;
  isSubmitting: boolean;
  verificationTypes: typeof VERIFICATION_TYPES;
  countries: string[];
  /** The password rules, each ticked once it's met. */
  passwordRules: { label: string; met: boolean }[];
  /** They've tried to continue, so unmet password rules show as mistakes. */
  showPasswordErrors: boolean;
  /** Signed in: the application goes on this account, so no email or password. */
  signedInEmail: string | null;
  /** The email the application goes on: the account's, or the one they typed. */
  applyingEmail: string;
  /** The email they typed already has an account. */
  accountExists: boolean;
  /** Checking whether the email has an account, before step 2. */
  checkingEmail: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  /** Log in (keeping what they've filled in) and come back to finish. */
  handleLogIn: () => void;
  setField: (field: keyof GuideApplicationFormData, value: string) => void;
  setVerificationType: (type: VerificationType) => void;
  handleContinue: () => Promise<void>;
  handleBack: () => void;
  handleDone: () => void;
}

type Errors = GuideApplicationErrors;

/** Step 1: who they are, and the account. */
export function validateAccountStep(data: GuideApplicationFormData, signedIn: boolean, today = new Date()): Errors {
  const errors: Errors = {};
  if (!data.firstName.trim()) errors.firstName = "Enter your first name";
  if (!data.lastName.trim()) errors.lastName = "Enter your last name";

  const dateOfBirth = dateOfBirthToIso(data.dateOfBirth);
  if (!data.dateOfBirth.trim()) errors.dateOfBirth = "Enter your date of birth";
  else if (!dateOfBirth) errors.dateOfBirth = "Enter your date of birth as DD/MM/YYYY";
  else if (!isOldEnoughToGuide(dateOfBirth, today)) errors.dateOfBirth = `You need to be at least ${MIN_GUIDE_AGE} to host on MyJourny`;

  if (!data.phoneNumber.trim()) errors.phoneNumber = "Enter your phone number";
  else if (!isValidPhoneNumber(data.countryCode, data.phoneNumber)) errors.phoneNumber = "Enter a valid phone number";

  if (!signedIn) {
    if (!data.email.trim()) errors.email = "Enter your email address";
    else if (!isValidEmail(data.email)) errors.email = "Enter a valid email address, like name@example.com";
    if (!data.password) errors.password = "Create a password";
    else if (!isStrongPassword(data.password)) errors.password = "Your password needs to meet all the rules below";
  }
  return errors;
}

/** Step 2: the brand and where it's registered. */
export function validateBusinessStep(data: GuideApplicationFormData): Errors {
  const errors: Errors = {};
  const business = data.verificationType === "business";
  if (business && !data.businessName?.trim()) errors.businessName = "Enter your company's brand name";
  if (business) {
    if (!data.cacNumber?.trim()) errors.cacNumber = "Enter your CAC registration number";
    else if (!isValidCacNumber(data.cacNumber)) errors.cacNumber = "Enter an RC or BN number, like RC1234566";
  }
  if (data.website.trim() && !isValidWebsite(data.website)) errors.website = "Enter a web address, like samuel.com";
  if (!data.country) errors.country = "Choose where you're registered";
  return errors;
}

export function useGuideApplicationViewModel(): GuideApplicationViewModel {
  const router = useRouter();
  const [step, setStep] = useState<ApplicationStep>(1);
  const [typed, setFormData] = useState<GuideApplicationFormData>(DEFAULT_APPLICATION_DATA);
  const [errors, setErrors] = useState<Errors>({});
  const [triedStep1, setTriedStep1] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, state, hydrated } = useSession();
  const signedIn = state === "account";
  const { data: me } = useMe();
  const hostApplication = useSubmitHostApplication();

  // Back from logging in: pick up where they left off, on step 2. Read once
  // the browser's storage is, so the first render matches the server's.
  const [draftRestored, setDraftRestored] = useState<boolean | null>(null);
  if (hydrated && draftRestored === null) {
    const draft = loadApplicationDraft();
    setDraftRestored(!!draft);
    if (draft) {
      setFormData((prev) => ({ ...prev, ...draft, password: "" }));
      setStep(2);
    }
  }
  useEffect(() => {
    if (draftRestored) clearApplicationDraft();
  }, [draftRestored]);

  // A signed-in applicant starts with the name on their account.
  const [nameEdited, setNameEdited] = useState(false);
  const accountName = useMemo(() => splitName(user?.fullName ?? ""), [user?.fullName]);
  const formData = useMemo(
    () => (nameEdited || typed.firstName || typed.lastName ? typed : { ...typed, ...accountName }),
    [typed, nameEdited, accountName],
  );

  // Already a host: nothing to apply for.
  const alreadyHost = !!me && isHostAccount(me);
  useEffect(() => {
    if (alreadyHost && step !== "review") router.replace("/host/dashboard");
  }, [alreadyHost, step, router]);

  const setField = useCallback(
    (field: keyof GuideApplicationFormData, value: string) => {
      if (field === "email") setAccountExists(false);
      if (field === "firstName" || field === "lastName") {
        // Editing one name keeps the other from the account.
        if (!nameEdited) setFormData((prev) => ({ ...prev, ...accountName, ...pickNames(prev) }));
        setNameEdited(true);
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [nameEdited, accountName],
  );

  const setVerificationType = useCallback((verificationType: VerificationType) => {
    setFormData((prev) => ({ ...prev, verificationType }));
    // What step 2 asks for changes, so its mistakes no longer apply.
    setErrors((prev) => {
      const next = { ...prev };
      delete next.businessName;
      delete next.cacNumber;
      return next;
    });
  }, []);

  const handleContinue = useCallback(async () => {
    if (step === 1) {
      setTriedStep1(true);
      const found = validateAccountStep(formData, signedIn);
      setErrors(found);
      if (Object.keys(found).length > 0) return;
      // An email that already has an account logs in instead, and adds hosting to it.
      if (!signedIn) {
        setCheckingEmail(true);
        const exists = await emailHasAccount(formData.email);
        setCheckingEmail(false);
        if (exists) {
          setAccountExists(true);
          return;
        }
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (step === 2) {
      const found = validateBusinessStep(formData);
      setErrors(found);
      if (Object.keys(found).length > 0) return;
      setIsSubmitting(true);
      setAccountExists(false);
      try {
        const result = signedIn ? await hostApplication.mutateAsync(formData) : await submitGuideApplication(formData);
        if (result.success) {
          setStep("review");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (result.accountExists) {
          // Said on the form, with the way forward, rather than in a toast.
          setAccountExists(true);
        } else {
          toast.error(result.message || "We couldn't send your application. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [step, formData, signedIn, hostApplication]);

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
      setErrors({});
      setAccountExists(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (step === 1) {
      router.push("/become-a-guide");
      return;
    }
    router.push("/");
  }, [step, router]);

  const handleDone = useCallback(() => {
    router.push("/host/dashboard");
  }, [router]);

  const handleLogIn = useCallback(() => {
    saveApplicationDraft({ ...formData, email: "" });
    router.push(`/login?next=${encodeURIComponent("/become-a-guide/apply")}`);
  }, [formData, router]);

  const signedInEmail = signedIn ? (user?.email ?? null) : null;

  return {
    step,
    formData,
    errors,
    isSubmitting,
    verificationTypes: VERIFICATION_TYPES,
    countries: COUNTRIES,
    passwordRules: passwordChecks(formData.password),
    showPasswordErrors: triedStep1,
    signedInEmail,
    applyingEmail: signedInEmail ?? formData.email.trim(),
    accountExists,
    checkingEmail,
    showPassword,
    onTogglePassword: () => setShowPassword((shown) => !shown),
    handleLogIn,
    setField,
    setVerificationType,
    handleContinue,
    handleBack,
    handleDone,
  };
}

const pickNames = (data: GuideApplicationFormData) => ({
  ...(data.firstName ? { firstName: data.firstName } : {}),
  ...(data.lastName ? { lastName: data.lastName } : {}),
});
