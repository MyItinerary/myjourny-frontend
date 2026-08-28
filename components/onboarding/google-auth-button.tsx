"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleAuthButtonProps {
  label?: string;
  onCredential: (credential: string) => void;
  onError?: () => void;
  className?: string;
  /** True while a credential is being exchanged/signed in — shows a spinner and blocks another attempt. */
  loading?: boolean;
}

// @react-oauth/google's <GoogleLogin> only renders Google's own stock
// button UI (theme/shape/size/text options, no custom children) — it can't
// reproduce our pixel-verified pill button (custom icon, copy, 48px
// height). So we render the real, functional GoogleLogin invisibly on top
// of our styled decorative button and let clicks fall through to it.
//
// Root-caused bug (reported: button not clickable): GoogleLogin's `width`
// isn't a CSS size — it's passed straight to Google's own
// google.accounts.id.renderButton(), which bakes a button of that EXACT
// pixel width into the iframe on Google's side. A hardcoded width="360"
// only lined up with the real container by coincidence; forcing the
// iframe element to `w-full` via CSS just stretches its outer box, it
// can't rescale content Google already rendered for 360px — so wherever
// the actual container isn't exactly 360px (any breakpoint/layout this
// button appears in), the real clickable area drifts out from under the
// visible decorative button and clicks land on dead space. Fixed by
// measuring the real container with a ResizeObserver and always passing
// its exact current width, so the two can never drift apart.
export function GoogleAuthButton({
  label = "Continue with Google",
  onCredential,
  onError,
  className,
  loading = false,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(360);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width;
      if (width) setButtonWidth(Math.round(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative h-12 w-full", className)}>
      <Button
        type="button"
        variant="outline"
        size="cta"
        tabIndex={-1}
        aria-hidden
        disabled={loading}
        className="pointer-events-none w-full"
      >
        {loading ? (
          <Loader2Icon className="size-5 animate-spin" />
        ) : (
          <Image src="/icons/google.svg" alt="" width={24} height={24} />
        )}
        {loading ? "Signing in…" : label}
      </Button>

      {/* Hidden while loading so a second click/credential can't fire mid-request. */}
      {!loading && (
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
            width={buttonWidth}
          />
        </div>
      )}
    </div>
  );
}
