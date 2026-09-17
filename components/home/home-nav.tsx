"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Search, Sliders, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  CalendarOneIcon,
  HamburgerNavIcon,
  HeartIcon,
  HomeSmileIcon,
  HumanNavIcon,
  ImageIcon,
  PlaneNavIcon,
  UsersTwoNavIcon,
} from "@/components/icons/nav-icons";
import { useSession } from "@/lib/auth/session-store";
import { useLogout } from "@/lib/queries/auth";
import { SearchBar } from "@/components/home/search-bar";

export function HomeNav({ className }: { className?: string }) {
  const { user } = useSession();
  const router = useRouter();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // When scrolled, tracking if the search bar is expanded inside the fixed navbar
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<"where" | "when" | "who" | null>(null);

  useEffect(() => {
    function handleScroll() {
      // Navbar becomes fixed when scrolling starts
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setIsSearchExpanded(false);
        setActiveSearchTab(null);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleOpenSearch(tab: "where" | "when" | "who") {
    setActiveSearchTab(tab);
    setIsSearchExpanded(true);
  }

  function handleCloseSearch() {
    setIsSearchExpanded(false);
    setActiveSearchTab(null);
  }

  return (
    <>
      {/* Dimmed backdrop overlay when search component is opened on fixed navbar */}
      <AnimatePresence>
        {isScrolled && isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseSearch}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* Spacer to preserve document flow since header is fixed */}
      <div className="relative h-[76px] w-full lg:h-[100px]">
        <header
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isScrolled
              ? "bg-[rgba(255,255,255,0.93)] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
              : "bg-transparent",
            className
          )}
          style={{
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.93)" : undefined,
          }}
        >
          {/* Main nav row: max 1512px width & 100px height on desktop */}
          <div
            className={cn(
              "mx-auto flex w-full max-w-[1512px] items-center justify-between px-6 transition-all duration-300 lg:px-20",
              "h-[76px] lg:h-[100px]"
            )}
            style={{
              maxWidth: "1512px",
            }}
          >
            {/* Logo */}
            <Link href="/" aria-label="MyJourny home" className="shrink-0">
              <Image
                src="/logo/myjourny-logo.svg"
                alt="MyJourny"
                width={167}
                height={29}
                priority
                style={{ width: "auto" }}
                className="h-[26px] w-auto lg:h-[29px]"
              />
            </Link>

            {/* Desktop Center: Nav Pills <-> Compact Search Transformation */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex">
              <AnimatePresence mode="wait">
                {!isScrolled ? (
                  <motion.nav
                    key="primary-nav"
                    initial={{ opacity: 0, scale: 0.88, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: -6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    aria-label="Primary"
                    className="flex items-center gap-4 rounded-full bg-white p-2 shadow-[0_1px_8px_rgba(0,0,0,0.08)]"
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
                  </motion.nav>
                ) : !isSearchExpanded ? (
                  /* Compact 3-segment pill matching user specification and screenshot */
                  <motion.div
                    key="compact-search-pill"
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex h-[52px] items-center rounded-full bg-[#F4F2EE] px-2 py-1 shadow-xs transition-all duration-200 hover:shadow-sm"
                  >
                    {/* Where/What */}
                    <button
                      type="button"
                      onClick={() => handleOpenSearch("where")}
                      className="flex h-full items-center gap-2.5 rounded-l-full pl-4 pr-3.5 font-sans text-[14px] font-medium text-[#333134] transition-colors hover:bg-black/5 cursor-pointer"
                    >
                      <PlaneNavIcon className="size-4 text-[#6F6B72]" />
                      <span>Where/What</span>
                    </button>

                    {/* Divider */}
                    <span className="h-4 w-[1px] bg-[#E0DFDD]" />

                    {/* When */}
                    <button
                      type="button"
                      onClick={() => handleOpenSearch("when")}
                      className="flex h-full items-center gap-2.5 px-3.5 font-sans text-[14px] font-medium text-[#333134] transition-colors hover:bg-black/5 cursor-pointer"
                    >
                      <CalendarOneIcon className="size-4 text-[#6F6B72]" />
                      <span>When</span>
                    </button>

                    {/* Divider */}
                    <span className="h-4 w-[1px] bg-[#E0DFDD]" />

                    {/* Who */}
                    <button
                      type="button"
                      onClick={() => handleOpenSearch("who")}
                      className="flex h-full items-center gap-2.5 px-3.5 font-sans text-[14px] font-medium text-[#333134] transition-colors hover:bg-black/5 cursor-pointer"
                    >
                      <UsersTwoNavIcon className="size-4 text-[#6F6B72]" />
                      <span>Who</span>
                    </button>

                    {/* Red Search Button */}
                    <button
                      type="button"
                      aria-label="Search"
                      onClick={() => handleOpenSearch("where")}
                      className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Search className="size-4 stroke-[2.5]" />
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Mobile compact search pill when scrolled and not expanded */}
            {isScrolled && !isSearchExpanded && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleOpenSearch("where")}
                className="mx-3 flex flex-1 items-center justify-between rounded-full border border-[#E0DFDD] bg-[#F4F2EE] px-3.5 py-2 shadow-xs lg:hidden cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate font-sans text-[13px] font-medium text-[#333134]">
                  <PlaneNavIcon className="size-3.5 text-[#6F6B72]" />
                  <span className="truncate">Where / When / Who</span>
                </div>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Search className="size-3 stroke-[2.5]" />
                </span>
              </motion.button>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                "flex size-11 flex-col items-center justify-center rounded-[12px] text-[#333134] shadow-xs lg:hidden cursor-pointer shrink-0 transition-colors",
                isScrolled ? "bg-[#F4F2EE] hover:bg-[#eae8e3]" : "bg-white hover:bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              )}
              style={{
                borderRadius: "12px",
                background: isScrolled ? "#F4F2EE" : "#FFF",
              }}
            >
              <HamburgerNavIcon />
            </button>

            {/* Desktop Right Nav: "Become a guide" + Human icon + Hamburger icon */}
            <div className="hidden items-center gap-3 lg:flex shrink-0">
              <Link
                href="#"
                className="mr-1 text-base font-medium text-foreground transition-colors hover:text-brand"
              >
                Become a guide
              </Link>

              {/* Human icon container */}
              <Link
                href={user ? "/profile" : "/login"}
                aria-label={user ? "Profile" : "Log in"}
                title={user ? "Profile" : "Log in"}
                className={cn(
                  "flex shrink-0 flex-col items-center justify-center rounded-[12px] text-[#333134] transition-all cursor-pointer",
                  isScrolled
                    ? "bg-[#F4F2EE] hover:bg-[#eae8e3]"
                    : "bg-[#FFF] hover:bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                )}
                style={{
                  display: "flex",
                  width: "48px",
                  height: "48px",
                  padding: "var(--spacing-md, 12px) var(--spacing-lg, 16px)",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "var(--spacing-md, 12px)",
                  alignSelf: "stretch",
                  borderRadius: "12px",
                  background: isScrolled ? "#F4F2EE" : "#FFF",
                }}
              >
                <HumanNavIcon />
              </Link>

              {/* Hamburger icon container */}
              <button
                type="button"
                aria-label="Menu"
                title="Menu"
                onClick={() => setMobileMenuOpen(true)}
                className={cn(
                  "flex shrink-0 flex-col items-center justify-center rounded-[12px] text-[#333134] transition-all cursor-pointer",
                  isScrolled
                    ? "bg-[#F4F2EE] hover:bg-[#eae8e3]"
                    : "bg-[#FFF] hover:bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                )}
                style={{
                  display: "flex",
                  width: "48px",
                  height: "48px",
                  padding: "var(--spacing-md, 12px) var(--spacing-lg, 16px)",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "var(--spacing-md, 12px)",
                  alignSelf: "stretch",
                  borderRadius: "12px",
                  background: isScrolled ? "#F4F2EE" : "#FFF",
                }}
              >
                <HamburgerNavIcon />
              </button>
            </div>
          </div>

          {/* Expanded Search Bar Container inside the Fixed Navbar */}
          <AnimatePresence>
            {isScrolled && isSearchExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="overflow-visible pb-4 pt-1 px-4 lg:px-20"
              >
                <div className="mx-auto flex w-full max-w-[860px] justify-center">
                  <SearchBar
                    variant="nav"
                    initialActiveTab={activeSearchTab}
                    onClose={handleCloseSearch}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      {/* Drawer Menu (Desktop & Mobile) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-[300px] flex-col justify-between bg-white p-6 shadow-2xl"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <Image src="/logo/myjourny-logo.svg" alt="MyJourny" width={120} height={21} className="h-5 w-auto" />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex size-9 items-center justify-center rounded-full bg-[#F4F2EE] text-foreground transition-colors hover:bg-muted cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground transition-colors hover:bg-[#F4F2EE]"
                  >
                    <HomeSmileIcon className="size-5 text-brand" />
                    Home
                  </Link>

                  <Link
                    href="#"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground transition-colors hover:bg-[#F4F2EE]"
                  >
                    <span className="text-base font-medium">Become a guide</span>
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground transition-colors hover:bg-[#F4F2EE]"
                      >
                        <User className="size-5 text-brand" />
                        My Profile
                      </Link>
                      <Link
                        href="/profile/preferences"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground transition-colors hover:bg-[#F4F2EE]"
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
                        className="flex items-center gap-3 rounded-xl p-3 font-sans text-[16px] font-medium text-foreground transition-colors hover:bg-[#F4F2EE]"
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

              {user ? (
                <div className="border-t border-[#E0DFDD] pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout.mutate(undefined, { onSuccess: () => router.push("/login") });
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-3 font-sans text-[15px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="size-5" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="border-t border-border pt-4">
                  <Link
                    href="/onboarding"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-full bg-[#2c0101] font-sans text-sm font-semibold text-white transition-opacity hover:opacity-95"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
