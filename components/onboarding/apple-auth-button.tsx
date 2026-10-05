"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppleAuthButtonProps {
  onAppleAuth: () => void;
  className?: string;
  loading?: boolean;
}

export function AppleAuthButton({
  onAppleAuth,
  className,
  loading = false,
}: AppleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onAppleAuth}
      disabled={loading}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-[#E0DFDD] bg-white text-sm font-semibold text-[#1E1E1E] hover:bg-[#F4F2EE] transition-all cursor-pointer shadow-xs",
        className
      )}
    >
      {loading ? (
        <Loader2Icon className="size-4.5 animate-spin" />
      ) : (
        <svg
          className="size-4.5 fill-current"
          viewBox="0 0 170 170"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.68-7.85-11.96-14.42-6.53-9.79-11.66-21.08-15.4-33.88-3.74-12.8-5.61-24.62-5.61-35.47 0-14.24 3.59-25.97 10.77-35.18 7.18-9.22 16.3-13.88 27.35-13.99 4.35 0 9.28 1.14 14.8 3.42 5.51 2.28 9.38 3.48 11.61 3.59 2.01 0 6.09-1.25 12.24-3.76 6.15-2.5 11.22-3.64 15.22-3.41 12.8.65 22.71 5.38 29.74 14.19-11.52 7.07-17.18 16.63-17 28.7.22 9.57 3.91 17.5 11.09 23.8 7.18 6.3 15.44 9.89 24.78 10.76-2.28 6.85-5.05 13.75-8.31 20.7zM119.22 33.15c0-7.39 2.66-14.46 7.99-21.2C132.53 5.21 139.11 1.08 147 0c.22 1.2.33 2.39.33 3.59 0 7.28-2.77 14.35-8.31 21.2-5.54 6.85-12.44 11.09-20.7 12.72-.44-1.42-.66-2.88-.66-4.36z" />
        </svg>
      )}
      <span>Continue with Apple</span>
    </Button>
  );
}
