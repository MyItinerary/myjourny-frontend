"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PasswordInput } from "@/components/onboarding/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Figma "Welcome back!" login shell (2068:24743 / 2068:25586).
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const canContinue = email.length > 0 && password.length > 0;

  return (
    <form
      className="flex w-full max-w-[345px] flex-col items-center gap-6 lg:max-w-[402px]"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) router.push("/onboarding/get-to-know-you");
      }}
    >
      <Button type="button" variant="outline" size="cta" className="w-full">
        <Image src="/icons/google.svg" alt="" width={24} height={24} />
        Continue with Google
      </Button>

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
        Not a member?{" "}
        <Link href="/onboarding" className="text-brand">
          Create your account
        </Link>
      </p>
    </form>
  );
}
