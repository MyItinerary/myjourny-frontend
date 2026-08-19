"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InfoCircleIcon } from "@/components/icons/auth-icons";
import { PasswordInput } from "@/components/onboarding/password-input";
import { Button } from "@/components/ui/button";

interface BottomLink {
  prompt: string;
  linkText: string;
  href: string;
}

interface PasswordFormProps {
  continueHref: string;
  bottomLink: BottomLink;
}

// Figma "Create a secure Password" shell — two PasswordInputs, an info row,
// Continue, terms, bottom link. Shared by the sign-up Password step
// (2068:24915) and the Forgot-password Reset-password screen (2068:24939).
export function PasswordForm({ continueHref, bottomLink }: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const canContinue = password.length > 0 && password === confirmPassword;

  return (
    <form
      className="flex w-full max-w-[345px] flex-col items-center gap-4 lg:max-w-[402px]"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) router.push(continueHref);
      }}
    >
      <div className="flex w-full flex-col gap-4">
        <PasswordInput
          placeholder="Enter password here"
          value={password}
          onChange={setPassword}
        />
        <PasswordInput
          placeholder="Re enter password here"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>

      <div className="flex w-full items-start gap-2">
        <InfoCircleIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Your password should contain at least 8 characters, a letter and a number
        </p>
      </div>

      <Button type="submit" size="cta" disabled={!canContinue} className="w-full">
        Continue
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
        {bottomLink.prompt}{" "}
        <Link href={bottomLink.href} className="text-brand">
          {bottomLink.linkText}
        </Link>
      </p>
    </form>
  );
}
