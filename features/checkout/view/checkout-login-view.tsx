"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import Link from "next/link";

import { GoogleAuthButton } from "@/components/onboarding/google-auth-button";
import { PasswordInput } from "@/components/onboarding/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CheckoutLogin } from "../view-model/use-checkout-view-model";
import { useIsDesktop } from "./use-is-desktop";

const titleClass = "font-sans text-2xl font-extrabold leading-[1.2] text-[#333134]";
const descriptionClass = "font-sans text-sm text-[#6F6B72]";

function LoginForm({ login, header }: { login: CheckoutLogin; header: React.ReactNode }) {
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        login.onSubmit();
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">{header}</div>

      <GoogleAuthButton loading={login.googleLoading} onCredential={login.onGoogleCredential} />

      <div className="flex items-center gap-3 px-6">
        <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
        <span className="font-sans text-base text-[#333134]">or</span>
        <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
      </div>

      <div className="flex flex-col gap-4">
        <Input
          type="email"
          size="cta"
          autoComplete="email"
          placeholder="Enter email address"
          aria-label="Email address"
          value={login.email}
          onChange={(e) => login.onEmailChange(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <PasswordInput placeholder="Enter password" value={login.password} onChange={login.onPasswordChange} />
          <Link href={login.forgotHref} onClick={login.onForgotPassword} className="self-start font-sans text-sm font-medium text-[#F5032D]">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="cta" disabled={!login.canSubmit} className="w-full">
        {login.pending ? "Logging in…" : "Continue"}
      </Button>

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
    </form>
  );
}

// Figma "Welcome back!" over the checkout (2379:13276 desktop, 2379:13243 mobile):
// a dialog on desktop, a bottom sheet on a phone. A guest whose email already
// has an account logs in here, and booking carries on to payment.
export function CheckoutLoginView({ login }: { login: CheckoutLogin }) {
  const desktop = useIsDesktop();

  if (desktop) {
    return (
      <Dialog.Root open={login.open} onOpenChange={login.onOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup className="relative w-full max-w-[328px] rounded-2xl bg-white p-6 pt-14 outline-none transition-[opacity,scale] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              <Dialog.Close aria-label="Close" className="absolute top-5 right-5 cursor-pointer text-[#212121]">
                <X className="size-6" />
              </Dialog.Close>
              <LoginForm
                login={login}
                header={
                  <>
                    <Dialog.Title className={titleClass}>Welcome back!</Dialog.Title>
                    <Dialog.Description className={descriptionClass}>Pick up where you left off.</Dialog.Description>
                  </>
                }
              />
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={login.open} onOpenChange={login.onOpenChange} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/40 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end">
          <Drawer.Popup className="flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white px-6 pt-3 pb-6 outline-none transition-transform duration-300 [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]">
            <span aria-hidden className="mx-auto mb-6 h-1 w-10 shrink-0 rounded-full bg-[#E0E0E0]" />
            <LoginForm
              login={login}
              header={
                <>
                  <Drawer.Title className={titleClass}>Welcome back!</Drawer.Title>
                  <Drawer.Description className={descriptionClass}>Pick up where you left off.</Drawer.Description>
                </>
              }
            />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
