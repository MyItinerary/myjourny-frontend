import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeartIcon, HomeSmileIcon, ImageIcon, MenuIcon } from "@/components/icons/nav-icons";

// Figma: "Desktop nav" (2001:7998) / "Mobile nav" (2001:7972 — logo +
// hamburger button), part of the Hero section. Identical between guest and
// account in the current file (no signed-in nav variant yet — no avatar),
// so it ships as one shared component either way.
export function HomeNav({ className }: { className?: string }) {
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
        <Button size="cta" render={<Link href="/onboarding" />}>
          Get started
        </Button>
      </div>
    </header>
  );
}
