"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GoogleAuthButton } from "@/components/onboarding/google-auth-button";
import { PasswordInput } from "@/components/onboarding/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isTwoFactorChallenge, useGoogleAuth, useLogin } from "@/lib/queries/auth";

// Where to go after login: ?next=<path> (e.g. back to an experience a
// guest tried to book). Same-site paths only, so it can't bounce people
// to another site.
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

// Figma "Welcome back!" login shell (2068:24743 / 2068:25586).
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Not the same as login.isPending/googleAuth.isPending — those flip once
  // the initial request settles, but completeAuth() chains a /auth/me
  // fetch inside its own onSuccess. These stay true until navigation
  // actually happens (or the attempt fails), covering the whole gap.
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);
  // Set when the account has 2FA on: the sign-in to retry once the person
  // enters a code. A Google ID token is reused for the retry.
  const [challenge, setChallenge] = useState<{ via: "password" } | { via: "google"; token: string } | null>(
    null
  );
  const [code, setCode] = useState("");
  const router = useRouter();
  const login = useLogin();
  const googleAuth = useGoogleAuth();

  const canContinue = email.length > 0 && password.length > 0;
  const isBusy = isLoggingIn || isGoogleAuthenticating;

  // Shared by both sign-in paths: go on, or stop and ask for a 2FA code.
  const afterAuth =
    (next: { via: "password" } | { via: "google"; token: string }, done: () => void) =>
    (data: unknown) => {
      if (isTwoFactorChallenge(data)) {
        setChallenge(next);
        done();
        return;
      }
      router.push(nextPath());
    };

  if (challenge) {
    const trimmed = code.trim();
    return (
      <form
        className="flex w-full max-w-[345px] flex-col items-center gap-6 lg:max-w-[402px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!trimmed || isBusy) return;
          if (challenge.via === "password") {
            setIsLoggingIn(true);
            login.mutate(
              { email, password, code: trimmed },
              { onSuccess: afterAuth(challenge, () => setIsLoggingIn(false)), onError: () => setIsLoggingIn(false) }
            );
          } else {
            setIsGoogleAuthenticating(true);
            googleAuth.mutate(
              { token: challenge.token, code: trimmed },
              {
                onSuccess: afterAuth(challenge, () => setIsGoogleAuthenticating(false)),
                onError: () => setIsGoogleAuthenticating(false),
              }
            );
          }
        }}
      >
        <p className="text-center text-base text-muted-foreground">
          Enter the 6-digit code from your authenticator app, or one of your recovery codes.
        </p>
        <Input
          size="cta"
          autoFocus
          autoComplete="one-time-code"
          inputMode="text"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full"
          aria-label="Two-factor code"
        />
        <Button type="submit" size="cta" disabled={!trimmed || isBusy} className="w-full">
          {isBusy ? "Checking…" : "Continue"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setChallenge(null);
            setCode("");
          }}
          className="cursor-pointer text-sm text-brand"
        >
          Back
        </button>
      </form>
    );
  }

  return (
    <form
      className="flex w-full max-w-[345px] flex-col items-center gap-6 lg:max-w-[402px]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canContinue || isBusy) return;
        setIsLoggingIn(true);
        login.mutate(
          { email, password },
          {
            onSuccess: afterAuth({ via: "password" }, () => setIsLoggingIn(false)),
            onError: () => setIsLoggingIn(false),
          }
        );
      }}
    >
      <GoogleAuthButton
        loading={isGoogleAuthenticating}
        onCredential={(credential) => {
          setIsGoogleAuthenticating(true);
          googleAuth.mutate(
            { token: credential },
            {
              onSuccess: afterAuth({ via: "google", token: credential }, () =>
                setIsGoogleAuthenticating(false)
              ),
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

      <Input
        type="email"
        size="cta"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />

      <div className="flex w-full flex-col items-start gap-2">
        <PasswordInput
          placeholder="Enter password"
          value={password}
          onChange={setPassword}
        />
        <Link
          href="/login/forgot-password"
          className="text-sm text-brand"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        size="cta"
        disabled={!canContinue || isBusy}
        className="w-full"
      >
        {isLoggingIn ? "Signing in…" : "Continue"}
      </Button>

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

      <p className="text-center text-sm text-muted-foreground">
        Not a member?{" "}
        <Link href="/onboarding" className="text-brand">
          Create your account
        </Link>
      </p>
    </form>
  );
}
