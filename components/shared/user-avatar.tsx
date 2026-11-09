"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type AvatarUser = { fullName: string | null; email: string | null; avatarUrl: string | null };

/** "Ada Obi" → "AO", "ada@example.com" → "A". */
export function userInitials(user: Pick<AvatarUser, "fullName" | "email">): string {
  const name = user.fullName?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return user.email?.trim()[0]?.toUpperCase() ?? "?";
}

/** The profile icon in the nav. Google sign-ins show the picture Google gave
 * them (its initials avatar, if they have no photo); other accounts show their
 * initials on a plain background. Signed-out visitors get the default icon. */
export function UserAvatar({ user, className }: { user: AvatarUser | null; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!user) {
    return (
      <Image
        src="/icons/nav/profile-button.png"
        alt=""
        width={48}
        height={48}
        className={cn("size-full rounded-[12px] object-cover", className)}
      />
    );
  }

  if (user.avatarUrl && user.avatarUrl !== failedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- the picture comes from Google or the API on any host
      <img
        src={user.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(user.avatarUrl)}
        className={cn("size-full rounded-[12px] object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-full items-center justify-center rounded-[12px] bg-[#E9E1D2] font-sans text-sm font-semibold text-[#333134] lg:text-base",
        className,
      )}
    >
      {userInitials(user)}
    </span>
  );
}
