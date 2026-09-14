"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Sliders, User, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeartIcon, HomeSmileIcon, ImageIcon, MenuIcon, UserIcon } from "@/components/icons/nav-icons";
import { useSession } from "@/lib/auth/session-store";
import { useLogout } from "@/lib/queries/auth";

export function HomeNav({ className }: { className?: string }) {
  const { user } = useSession();
  const router = useRouter();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
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

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMobileMenuOpen(true)}
          className="flex size-12 items-center justify-center rounded-full bg-white text-foreground shadow-sm lg:hidden cursor-pointer"
        >
          <MenuIcon className="size-5" />
        </button>

        <div className="hidden items-center gap-[11px] lg:flex">
          <Link href="#" className="text-base font-medium text-foreground">
            Become a guide
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                aria-label="Account"
                className="flex size-12 items-center justify-center rounded-[12px] bg-[#F4F2EE] text-foreground transition-colors hover:bg-muted"
              >
                <UserIcon className="size-12" />
              </Link>
              <button
                type="button"
                aria-label="Log out"
                onClick={() => {
                  logout.mutate(undefined, { onSuccess: () => router.push("/") });
                }}
                className="flex size-12 items-center justify-center rounded-[12px] bg-[#F4F2EE] text-foreground transition-colors hover:bg-muted cursor-pointer"
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="flex h-full w-[280px] flex-col justify-between bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <Image src="/logo/myjourny-logo.svg" alt="MyJourny" width={120} height={21} className="h-5 w-auto" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex size-9 items-center justify-center rounded-full bg-[#F4F2EE] text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground hover:bg-[#F4F2EE]"
                >
                  <HomeSmileIcon className="size-5 text-brand" />
                  Home
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground hover:bg-[#F4F2EE]"
                    >
                      <User className="size-5 text-brand" />
                      My Profile
                    </Link>
                    <Link
                      href="/profile/preferences"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground hover:bg-[#F4F2EE]"
                    >
                      <Sliders className="size-5 text-brand" />
                      Your Preferences
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground hover:bg-[#F4F2EE]"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/onboarding"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-brand hover:bg-[#F4F2EE]"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {user && (
              <div className="border-t border-[#E0DFDD] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout.mutate(undefined, { onSuccess: () => router.push("/") });
                  }}
                  className="flex w-full items-center gap-3 rounded-xl p-3 font-sans text-[15px] font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-5" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
