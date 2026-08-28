"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <form
      className="flex w-full max-w-[345px] flex-col items-center gap-6 lg:max-w-[402px]"
      onSubmit={(e) => {
        e.preventDefault();
        if (email) router.push(continueHref);
      }}
    >
      {showGoogle && (
        <>
          <Button
            type="button"
            variant="outline"
            size="cta"
            className="w-full cursor-pointer"
            onClick={() => router.push("/onboarding/get-to-know-you")}
          >
            <Image src="/icons/google.svg" alt="" width={24} height={24} />
            Continue with Google
          </Button>

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
        className="w-full"
      />

      <Button type="submit" size="cta" disabled={!email} className="w-full">
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
