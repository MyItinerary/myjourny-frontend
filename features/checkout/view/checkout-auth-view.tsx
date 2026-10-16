"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { GoogleAuthButton } from "@/components/onboarding/google-auth-button";
import { PasswordInput } from "@/components/onboarding/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AuthStage, CheckoutAuth } from "../view-model/use-checkout-view-model";
import { useIsDesktop } from "./use-is-desktop";

const titleClass = "font-sans text-2xl font-extrabold leading-[1.2] text-[#333134]";
const descriptionClass = "font-sans text-sm text-[#6F6B72]";

const COPY: Record<AuthStage, { title: string; description: string }> = {
  email: { title: "Log in or sign up", description: "Use your email to book this experience." },
  login: { title: "Welcome back!", description: "Enter your password to carry on booking." },
  signup: { title: "Create a password", description: "You'll use it to log in to your account later." },
  google: { title: "Welcome back!", description: "This email signs in with Google." },
  code: {
    title: "Enter your code",
    description: "Enter the 6-digit code from your authenticator app, or one of your recovery codes.",
  },
};

function Divider() {
  return (
    <div className="flex items-center gap-3 px-6">
      <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
      <span className="font-sans text-base text-[#333134]">or</span>
      <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
    </div>
  );
}

function Terms() {
  return (
    <p className="text-center font-sans text-sm font-medium leading-[21px] text-[#6F6B72]">
      By continuing you agree to our{" "}
      <Link href="/terms" className="text-[#F5032D]">
        terms of service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="text-[#F5032D]">
        privacy policy
      </Link>
    </p>
  );
}

function EmailStep({ auth }: { auth: CheckoutAuth }) {
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        auth.onContinue();
      }}
    >
      <Input
        type="email"
        size="cta"
        autoComplete="email"
        placeholder="Enter email address"
        aria-label="Email address"
        value={auth.email}
        onChange={(e) => auth.onEmailChange(e.target.value)}
      />
      <Button type="submit" size="cta" disabled={!auth.canContinue} className="w-full">
        {auth.checking ? "Checking…" : "Continue"}
      </Button>
      <Divider />
      <GoogleAuthButton loading={auth.googleLoading} onCredential={auth.onGoogleCredential} />
      <Terms />
    </form>
  );
}

function SecretStep({ auth }: { auth: CheckoutAuth }) {
  const submitLabel = {
    login: auth.pending ? "Logging in…" : "Log in",
    signup: auth.pending ? "Creating your account…" : "Agree and continue",
    code: auth.pending ? "Checking…" : "Continue",
  }[auth.stage as "login" | "signup" | "code"];

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        auth.onSubmit();
      }}
    >
      {auth.stage !== "code" && (
        <p className="text-center font-sans text-base font-medium text-[#333134]">{auth.email.trim()}</p>
      )}
      {auth.stage === "code" ? (
        <Input
          size="cta"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          aria-label="Two-factor code"
          value={auth.code}
          onChange={(e) => auth.onCodeChange(e.target.value)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <PasswordInput
            placeholder={auth.stage === "signup" ? "Enter password here" : "Enter password"}
            value={auth.password}
            onChange={auth.onPasswordChange}
          />
          {auth.stage === "signup" && (
            <PasswordInput
              placeholder="Re enter password here"
              value={auth.confirmPassword}
              onChange={auth.onConfirmPasswordChange}
            />
          )}
          {auth.passwordError ? (
            <p role="alert" className="font-sans text-sm text-[#F5032D]">
              {auth.passwordError}
            </p>
          ) : (
            auth.stage === "signup" && (
              <p className="font-sans text-sm text-[#6F6B72]">At least 8 characters, with a letter and a number.</p>
            )
          )}
          {auth.stage === "login" && (
            <Link
              href={auth.forgotHref}
              onClick={auth.onForgotPassword}
              className="self-start font-sans text-sm font-medium text-[#F5032D]"
            >
              Forgot password?
            </Link>
          )}
        </div>
      )}
      <Button type="submit" size="cta" disabled={!auth.canSubmit} className="w-full">
        {submitLabel}
      </Button>
      {auth.stage === "signup" && <Terms />}
    </form>
  );
}

function GoogleStep({ auth }: { auth: CheckoutAuth }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-center font-sans text-base font-medium text-[#333134]">{auth.email.trim()}</p>
      <GoogleAuthButton loading={auth.googleLoading} onCredential={auth.onGoogleCredential} />
    </div>
  );
}

function Body({ auth }: { auth: CheckoutAuth }) {
  if (auth.stage === "email") return <EmailStep auth={auth} />;
  if (auth.stage === "google") return <GoogleStep auth={auth} />;
  return <SecretStep auth={auth} />;
}

function BackButton({ auth }: { auth: CheckoutAuth }) {
  if (auth.stage === "email") return null;
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={auth.onBack}
      className="absolute top-5 left-5 cursor-pointer text-[#212121]"
    >
      <ArrowLeft className="size-6" />
    </button>
  );
}

function Header({ title, description }: { title: ReactNode; description: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col items-center gap-2 text-center">
      {title}
      {description}
    </div>
  );
}

// Step 1 of the checkout, as on Airbnb: one dialog (a bottom sheet on a
// phone) that starts with the email and becomes log in, create a password,
// Google-only or the two-factor code, using our usual account rules.
export function CheckoutAuthView({ auth }: { auth: CheckoutAuth }) {
  const desktop = useIsDesktop();
  const copy = COPY[auth.stage];

  if (desktop) {
    return (
      <Dialog.Root open={auth.open} onOpenChange={auth.onOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup className="relative w-full max-w-[400px] rounded-2xl bg-white p-6 pt-14 outline-none transition-[opacity,scale] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              <BackButton auth={auth} />
              <Dialog.Close aria-label="Close" className="absolute top-5 right-5 cursor-pointer text-[#212121]">
                <X className="size-6" />
              </Dialog.Close>
              <Header
                title={<Dialog.Title className={titleClass}>{copy.title}</Dialog.Title>}
                description={<Dialog.Description className={descriptionClass}>{copy.description}</Dialog.Description>}
              />
              <Body auth={auth} />
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={auth.open} onOpenChange={auth.onOpenChange} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/40 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end">
          <Drawer.Popup className="relative flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white px-6 pt-3 pb-6 outline-none transition-transform duration-300 [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]">
            <span aria-hidden className="mx-auto mb-6 h-1 w-10 shrink-0 rounded-full bg-[#E0E0E0]" />
            <BackButton auth={auth} />
            <Header
              title={<Drawer.Title className={titleClass}>{copy.title}</Drawer.Title>}
              description={<Drawer.Description className={descriptionClass}>{copy.description}</Drawer.Description>}
            />
            <Body auth={auth} />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
