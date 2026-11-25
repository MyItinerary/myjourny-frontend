"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth/session-store";
import { isHostAccount, useMe } from "@/lib/queries/auth";

import {
  clearApplicationDraft,
  loadApplicationDraft,
  saveApplicationDraft,
  submitGuideApplication,
  useSubmitHostApplication,
} from "../model/guide-application-api";
import {
  dateOfBirthToIso,
  isOldEnoughToGuide,
  isValidEmail,
  isValidPhoneNumber,
  MIN_GUIDE_AGE,
} from "../model/guide-application-rules";
import {
  DEFAULT_APPLICATION_DATA,
  NIGERIAN_CITIES,
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
  cityOptions: string[];
  /** Signed in: the application goes on this account, so no email or password. */
  signedInEmail: string | null;
  /** The email they typed already has an account. */
  accountExists: boolean;
  /** Log in (keeping what they've filled in) and come back to finish. */
  handleLogIn: () => void;
  setField: (field: keyof GuideApplicationFormData, value: string) => void;
  setVerificationType: (type: VerificationType) => void;
  handleContinue: () => Promise<void>;
  handleBack: () => void;
  handleDone: () => void;
}

export function useGuideApplicationViewModel(): GuideApplicationViewModel {
  const router = useRouter();
  const [step, setStep] = useState<ApplicationStep>(1);
  const [typed, setFormData] = useState<GuideApplicationFormData>(DEFAULT_APPLICATION_DATA);
  const [errors, setErrors] = useState<GuideApplicationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
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
  const accountName = user?.fullName ?? "";
  const formData = useMemo(
    () => (nameEdited || typed.fullName ? typed : { ...typed, fullName: accountName }),
    [typed, nameEdited, accountName]
  );

  // Already a host: nothing to apply for.
  const alreadyHost = !!me && isHostAccount(me);
  useEffect(() => {
    if (alreadyHost && step !== "review") router.replace("/host/dashboard");
  }, [alreadyHost, step, router]);

  const setField = useCallback((field: keyof GuideApplicationFormData, value: string) => {
    if (field === "fullName") setNameEdited(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setVerificationType = useCallback((verificationType: VerificationType) => {
    setFormData((prev) => ({ ...prev, verificationType }));
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: GuideApplicationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full legal name is required";
    }
    const dateOfBirth = dateOfBirthToIso(formData.dateOfBirth);
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (!dateOfBirth) {
      newErrors.dateOfBirth = "Enter your date of birth as DD/MM/YYYY";
    } else if (!isOldEnoughToGuide(dateOfBirth)) {
      newErrors.dateOfBirth = `You need to be at least ${MIN_GUIDE_AGE} to guide on MyJourny`;
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!isValidPhoneNumber(formData.countryCode, formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateStep2 = useCallback((): boolean => {
    const newErrors: GuideApplicationErrors = {};

    if (formData.verificationType === "business") {
      if (!formData.businessName?.trim()) {
        newErrors.businessName = "Registered business name is required";
      }
      if (!formData.cacNumber?.trim()) {
        newErrors.cacNumber = "CAC registration number is required";
      }
    }

    if (!signedIn) {
      if (!formData.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, signedIn]);

  const handleContinue = useCallback(async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (step === 2) {
      if (!validateStep2()) return;
      setIsSubmitting(true);
      setAccountExists(false);
      try {
        const result = signedIn
          ? await hostApplication.mutateAsync(formData)
          : await submitGuideApplication(formData);
        if (result.success) {
          setStep("review");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (result.accountExists) {
          // Said on the form, with the way forward, rather than in a toast.
          setAccountExists(true);
        } else {
          toast.error(result.message || "Failed to submit application. Please try again.");
        }
      } catch {
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [step, formData, validateStep1, validateStep2, signedIn, hostApplication]);

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
      setErrors({});
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

  return {
    step,
    formData,
    errors,
    isSubmitting,
    cityOptions: NIGERIAN_CITIES,
    signedInEmail: signedIn ? user?.email ?? null : null,
    accountExists,
    handleLogIn,
    setField,
    setVerificationType,
    handleContinue,
    handleBack,
    handleDone,
  };
}
