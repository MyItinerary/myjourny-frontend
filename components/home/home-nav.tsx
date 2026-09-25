"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Globe,
  Image as ImageIconLucide,
  LifeBuoy,
  Power,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  CalendarOneIcon,
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

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
      setProfileMenuOpen(false);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  function handleOpenSearch(tab: "where" | "when" | "who") {
    setActiveSearchTab(tab);
    setIsSearchExpanded(true);
    setProfileMenuOpen(false);
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

            {/* Right Nav: "Become a guide" + Profile Icon Trigger + Dropdown Menu */}
            <div ref={menuContainerRef} className="relative flex items-center gap-3 shrink-0">
              <Link
                href="#"
                className="hidden text-base font-medium text-foreground transition-colors hover:text-brand lg:inline-block mr-1"
              >
                Become a guide
              </Link>

              {/* Profile icon button trigger (Hamburger menu removed) */}
              <button
                type="button"
                aria-label="Profile menu"
                title="Profile menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-[12px] text-[#333134] transition-all cursor-pointer",
                  "size-11 lg:size-12",
                  isScrolled
                    ? "bg-[#F4F2EE] hover:bg-[#eae8e3]"
                    : "bg-[#FFF] hover:bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
                  profileMenuOpen && "ring-2 ring-brand/20 bg-[#F4F2EE]"
                )}
                style={{
                  borderRadius: "12px",
                  background: profileMenuOpen || isScrolled ? "#F4F2EE" : "#FFF",
                }}
              >
                <HumanNavIcon />
              </button>

              {/* Floating Dropdown Card Menu */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+12px)] z-50 w-[340px] max-w-[calc(100vw-32px)] rounded-[24px] bg-white p-3 shadow-[0_12px_44px_rgba(0,0,0,0.12)] border border-[#F0EFEB]"
                  >
                    {/* Item 1: My experiences */}
                    <Link
                      href={user ? "/profile" : "/login"}
                      onClick={() => setProfileMenuOpen(false)}
                      className="group flex items-center justify-between rounded-[16px] p-2.5 transition-colors hover:bg-[#F8F7F5]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134] group-hover:bg-[#EAE8E3] transition-colors">
                          <ImageIconLucide className="size-5" />
                        </div>
                        <span className="font-sans text-[15px] font-medium text-[#1E1E1E]">
                          My experiences
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-[#8C888F] group-hover:text-[#333134] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>

                    {/* Item 2: Notifications */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (user) router.push("/profile");
                        else router.push("/login");
                      }}
                      className="group flex w-full items-center justify-between rounded-[16px] p-2.5 text-left transition-colors hover:bg-[#F8F7F5] cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134] group-hover:bg-[#EAE8E3] transition-colors">
                          <Bell className="size-5" />
                        </div>
                        <span className="font-sans text-[15px] font-medium text-[#1E1E1E]">
                          Notifications
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-[#8C888F] group-hover:text-[#333134] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    {/* Item 3: Language and Currency */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (user) router.push("/profile/preferences");
                        else router.push("/login");
                      }}
                      className="group flex w-full items-center justify-between rounded-[16px] p-2.5 text-left transition-colors hover:bg-[#F8F7F5] cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134] group-hover:bg-[#EAE8E3] transition-colors">
                          <Globe className="size-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans text-[15px] font-medium text-[#1E1E1E] leading-snug">
                            Language and Currency
                          </span>
                          <span className="font-sans text-[12px] text-[#8C888F] leading-tight mt-0.5">
                            English/USD
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-[#8C888F] group-hover:text-[#333134] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    {/* Item 4: Account settings */}
                    <Link
                      href={user ? "/profile" : "/login"}
                      onClick={() => setProfileMenuOpen(false)}
                      className="group flex items-center justify-between rounded-[16px] p-2.5 transition-colors hover:bg-[#F8F7F5]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134] group-hover:bg-[#EAE8E3] transition-colors">
                          <Settings className="size-5" />
                        </div>
                        <span className="font-sans text-[15px] font-medium text-[#1E1E1E]">
                          Account settings
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-[#8C888F] group-hover:text-[#333134] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>

                    {/* Item 5: Help center */}
                    <Link
                      href="#"
                      onClick={() => setProfileMenuOpen(false)}
                      className="group flex items-center justify-between rounded-[16px] p-2.5 transition-colors hover:bg-[#F8F7F5]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134] group-hover:bg-[#EAE8E3] transition-colors">
                          <LifeBuoy className="size-5" />
                        </div>
                        <span className="font-sans text-[15px] font-medium text-[#1E1E1E]">
                          Help center
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-[#8C888F] group-hover:text-[#333134] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>

                    {/* Divider */}
                    <div className="my-1.5 h-[1px] w-full bg-[#F0EFEB]" />

                    {/* Item 6: Become a guide */}
                    <Link
                      href="#"
                      onClick={() => setProfileMenuOpen(false)}
                      className="group flex items-center justify-between rounded-[16px] p-2.5 transition-colors hover:bg-[#F8F7F5]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134] group-hover:bg-[#EAE8E3] transition-colors">
                          <Trash2 className="size-5" />
                        </div>
                        <div className="flex flex-col min-w-0 pr-1">
                          <span className="font-sans text-[15px] font-medium text-[#1E1E1E] leading-snug">
                            Become a guide
                          </span>
                          <span className="font-sans text-[12px] text-[#8C888F] leading-tight mt-0.5">
                            Make extra income from what you already love doing
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-[#8C888F] group-hover:text-[#333134] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>

                    {/* Divider */}
                    <div className="my-1.5 h-[1px] w-full bg-[#F0EFEB]" />

                    {/* Item 7: Logout */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (user) {
                          logout.mutate(undefined, { onSuccess: () => router.push("/login") });
                        } else {
                          router.push("/login");
                        }
                      }}
                      className="group flex w-full items-center justify-between rounded-[16px] p-2.5 text-left transition-colors hover:bg-[#F8F7F5] cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134] group-hover:bg-[#EAE8E3] transition-colors">
                          <Power className="size-5" />
                        </div>
                        <span className="font-sans text-[15px] font-medium text-[#1E1E1E]">
                          Logout
                        </span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
    </>
  );
}
