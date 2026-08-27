"use client";

import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleAuthButtonProps {
  label?: string;
  onCredential: (credential: string) => void;
  onError?: () => void;
  className?: string;
}

// @react-oauth/google's <GoogleLogin> only renders Google's own stock
// button UI (theme/shape/size/text options, no custom children) — it can't
// reproduce our pixel-verified pill button (custom icon, copy, 48px
// height). So we render the real, functional GoogleLogin invisibly on top
// of our styled decorative button and let clicks fall through to it.
//
// This depends on Google's rendered button/iframe filling its container,
// which isn't a guaranteed contract on their end — if a future
// @react-oauth/google or Google Identity Services update changes that
// sizing behavior, the click target here can drift from the visible
// button. Worth a visual/click smoke test after any upgrade of that
// dependency.
export function GoogleAuthButton({
  label = "Continue with Google",
  onCredential,
  onError,
  className,
}: GoogleAuthButtonProps) {
  return (
    <div className={cn("relative h-12 w-full", className)}>
      <Button
        type="button"
        variant="outline"
        size="cta"
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none w-full"
      >
        <Image src="/icons/google.svg" alt="" width={24} height={24} />
        {label}
      </Button>

      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-full opacity-0",
          "[&_>div]:!h-full [&_>div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full"
        )}
      >
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) onCredential(response.credential);
          }}
          onError={onError}
          text="continue_with"
          width="360"
        />
      </div>
    </div>
  );
}
