"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeartIcon, HomeSmileIcon, ImageIcon, MenuIcon, UserIcon } from "@/components/icons/nav-icons";
import { useSession } from "@/lib/auth/session-store";
import { useLogout } from "@/lib/queries/auth";

// Figma: "Desktop nav" (2001:7998) / "Mobile nav" (2001:7972 — logo +
// hamburger button), part of the Hero section. "Get started" swaps for the
// account icon once signed in; everything else stays the same either way.
export function HomeNav({ className }: { className?: string }) {
  const { user } = useSession();
  const router = useRouter();
  const logout = useLogout();

  return (
    <header className={cn("relative z-10 flex items-center justify-between px-6 py-4 lg:px-20 lg:py-6", className)}>
      <Link href="/" aria-label="MyJourny home" className="shrink-0">
        <Image src="/logo/myjourny-logo.svg" alt="MyJourny" width={167} height={29} priority className="h-[29px] w-auto" />
      </Link>

      <nav
        aria-label="Primary"
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 rounded-full bg-white p-2 shadow-[0_1px_8px_rgba(0,0,0,0.08)] lg:flex"
      >
        <Link
          href="/"
          className="flex h-[43px] items-center gap-2 rounded-full bg-brand px-4 text-base font-medium text-white"
        >
          <HomeSmileIcon className="size-[18px]" />
          Home
        </Link>
        {/* TODO: no destination page yet for these — wire up once favorites/explore exist. */}
        <Link
          href="#"
          aria-label="Favorites"
          className="flex size-[43px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <HeartIcon className="size-[18px]" />
        </Link>
        <Link
          href="#"
          aria-label="Explore"
          className="flex size-[43px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ImageIcon className="size-[18px]" />
        </Link>
      </nav>

      {/* TODO: menu button has no drawer to open yet. */}
      <button
        type="button"
        aria-label="Menu"
        className="flex size-12 items-center justify-center rounded-full bg-white text-foreground lg:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      <div className="hidden items-center gap-[11px] lg:flex">
        {/* TODO: no "become a guide" flow yet. */}
        <Link href="#" className="text-base font-medium text-foreground">
          Become a guide
        </Link>
        {user ? (
          <>
            {/* TODO: no account/profile page built yet to link this to. */}
            <Link
              href="#"
              aria-label="Account"
              className="flex size-12 items-center justify-center rounded-[12px] bg-[#F4F2EE] text-foreground"
            >
              <UserIcon className="size-12" />
            </Link>
            {/* TEMP: quick way to test logout while there's no account
                menu yet — replace with a proper account dropdown. */}
            <button
              type="button"
              aria-label="Log out"
              onClick={() => {
                logout.mutate(undefined, { onSuccess: () => router.push("/") });
              }}
              className="flex size-12 items-center justify-center rounded-[12px] bg-[#F4F2EE] text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="size-5" />
            </button>
          </>
        ) : (
          <Button size="cta" render={<Link href="/onboarding" />}>
            Get started
          </Button>
        )}
      </div>
    </header>
  );
}
