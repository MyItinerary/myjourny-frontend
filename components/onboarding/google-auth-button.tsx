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

// GoogleLogin only renders Google's own stock button UI, so the real one
// renders invisibly on top of our styled decorative button. Its `width` is
// a fixed pixel value baked server-side by Google, not CSS — measured live
// via ResizeObserver so it always matches the real container.
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
