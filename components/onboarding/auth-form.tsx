"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GoogleAuthButton } from "@/components/onboarding/google-auth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGoogleAuth } from "@/lib/queries/auth";

interface BottomLink {
  prompt: string;
  linkText: string;
  href: string;
}

interface AuthFormProps {
  continueHref: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  showGoogle?: boolean;
  showTerms?: boolean;
  bottomLink?: BottomLink;
  /** Where a successful Google sign-in lands — always skips the password step. */
  googleSuccessHref?: string;
  /**
   * Called on submit before navigating. Return `true` to navigate to
   * `continueHref`, a string to navigate there instead (e.g. with a query
   * string built from the entered email), or `false` to stay put. Defaults
   * to always continuing — the plain email-collection steps don't call the
   * backend themselves.
   */
  onEmailSubmit?: (email: string) => Promise<boolean | string> | boolean | string;
  /** Fired the first time the email input is focused. */
  onEmailFocus?: () => void;
}

const defaultBottomLink: BottomLink = {
  prompt: "Already have an account?",
  linkText: "Login",
  href: "/login",
};

// Figma "Desktop - 1" (2068:24661) / "Splash" (2068:25512) — sign-up form
// shell. Also reused (with different props) for the Email step and the
// Forgot-password Request-reset screen.
export function AuthForm({
  continueHref,
  emailPlaceholder = "Enter email address",
  submitLabel = "Continue",
  showGoogle = true,
  showTerms = true,
  bottomLink = defaultBottomLink,
  googleSuccessHref = "/onboarding/get-to-know-you",
  onEmailSubmit,
  onEmailFocus,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Not the same as googleAuth.isPending — that flips once the /auth/google
  // request settles, but completeAuth() chains a /auth/me fetch inside its
  // own onSuccess. This stays true until navigation actually happens (or
  // the attempt fails), covering the whole gap so the button doesn't look
  // idle while work is still happening.
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);
  const router = useRouter();
  const googleAuth = useGoogleAuth();

  return (
    <form
      className="flex w-full max-w-[345px] flex-col items-center gap-6 lg:max-w-[402px]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email || isSubmitting) return;
        setIsSubmitting(true);
        const result = onEmailSubmit ? await onEmailSubmit(email) : true;
        setIsSubmitting(false);
        if (result) router.push(typeof result === "string" ? result : continueHref);
      }}
    >
      {showGoogle && (
        <>
          <GoogleAuthButton
            loading={isGoogleAuthenticating}
            onCredential={(credential) => {
              setIsGoogleAuthenticating(true);
              googleAuth.mutate(
                { token: credential },
                {
                  onSuccess: () => router.push(googleSuccessHref),
                  onError: () => setIsGoogleAuthenticating(false),
                }
              );
            }}
          />

          <div className="flex w-full items-center gap-3">
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="text-base text-foreground">or</span>
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <Input
        type="email"
        size="cta"
        placeholder={emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={onEmailFocus}
        className="w-full"
      />

      <Button
        type="submit"
        size="cta"
        disabled={!email || isSubmitting || isGoogleAuthenticating}
        className="w-full"
      >
        {submitLabel}
      </Button>

      {showTerms && (
        <p className="text-center text-sm text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/legal/terms" className="text-brand">
            terms of service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-brand">
            privacy policy
          </Link>
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {bottomLink.prompt}{" "}
        <Link href={bottomLink.href} className="text-brand">
          {bottomLink.linkText}
        </Link>
      </p>
    </form>
  );
}
