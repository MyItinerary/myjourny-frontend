"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { PlaneNavIcon } from "@/components/icons/nav-icons";
import { useSession } from "@/lib/auth/session-store";
import { useLogout } from "@/lib/queries/auth";
import { useUnreadNotificationsCount } from "@/lib/queries/notifications";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";
import { SearchBar } from "@/components/home/search-bar";

// Illustrated nav/menu icons (Figma "image 16"): the 44px artwork is cropped
// to a 32px window, so it's shifted by -6px inside an overflow-clip box.
function NavArt({ src, className }: { src: string; className?: string }) {
  return (
    <span className={cn("relative block size-8 shrink-0 overflow-hidden", className)}>
      <Image src={src} alt="" width={44} height={44} className="absolute -left-1.5 -top-1.5 size-11 max-w-none" />
    </span>
  );
}

function MenuRow({
  href,
  onClick,
  icon,
  label,
  sublabel,
  badge,
  chevron = true,
  accent = false,
}: {
  href?: string;
  onClick: () => void;
  icon: string;
  label: string;
  sublabel?: string;
  badge?: number;
  chevron?: boolean;
  accent?: boolean;
}) {
  const content = (
    <>
      <span
        className={cn(
          "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px]",
          accent ? "border-[0.5px] border-[#FBD4D8] bg-[#FDE9EC]" : "bg-[#F5F3EF]"
        )}
      >
        {accent && (
          <Image
            src="/icons/nav/guide-bg.svg"
            alt=""
            width={56}
            height={110}
            unoptimized
            className="absolute left-1/2 top-1/2 h-[110px] w-14 max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        )}
        <NavArt src={icon} className="relative" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className={cn("text-base leading-6", accent ? "text-[#F5032D]" : "text-[#212121]")}>{label}</span>
          {badge ? (
            <span className="rounded-full bg-[#F5032D]/10 px-2 text-[11px] font-bold text-[#F5032D]">{badge}</span>
          ) : null}
        </span>
        {sublabel && (
          <span className={cn("text-xs leading-[18px]", accent ? "text-[#130404]" : "text-[#9E9E9E]")}>{sublabel}</span>
        )}
      </span>
      {chevron && <Image src="/icons/nav/chevron-right.svg" alt="" width={18} height={18} unoptimized className="shrink-0" />}
    </>
  );
  const className =
    "flex w-full cursor-pointer items-center gap-[13px] rounded-[14px] py-2 text-left transition-colors hover:bg-[#F8F7F5]";
  return href ? (
    <Link href={href} onClick={onClick} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

// Scrolled-state search pill (Figma 2303:1016): the artwork is cropped to a
// 37×26 window inside a 32.667px box.
function CompactArt({ src }: { src: string }) {
  return (
    <span className="relative block size-[32.667px] shrink-0">
      <span className="absolute left-[-2.17px] top-[3.33px] block h-[26px] w-[37px] overflow-hidden">
        <Image
          src={src}
          alt=""
          width={36}
          height={36}
          className="absolute left-[calc(50%+0.37px)] top-[-4.88px] size-[35.75px] max-w-none -translate-x-1/2"
        />
      </span>
    </span>
  );
}

const COMPACT_SEARCH_TABS = [
  { id: "where", label: "Where/What", icon: "/icons/nav/search-where.png" },
  { id: "when", label: "When", icon: "/icons/nav/search-when.png" },
  { id: "who", label: "Who", icon: "/icons/nav/search-who.png" },
] as const;

export function HomeNav({ className }: { className?: string }) {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const currentPathTab = pathname?.startsWith("/wishlists") || pathname === "/wishlist"
    ? "wishlist"
    : pathname?.startsWith("/my-experiences") || pathname?.startsWith("/bookings")
      ? "experiences"
      : pathname === "/" || pathname === ""
        ? "home"
        : null;

  const [activeTab, setActiveTab] = useState<string | null>(currentPathTab);

  useEffect(() => {
    setActiveTab(currentPathTab);
  }, [currentPathTab]);

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: "/icons/nav/home.png",
    },
    {
      id: "wishlist",
      label: "Wishlists",
      href: "/wishlists",
      icon: "/icons/nav/wishlist.png",
    },
    {
      id: "experiences",
      label: "My experiences",
      href: user ? "/my-experiences" : "/login",
      icon: "/icons/nav/experiences.png",
    },
  ];
  const logout = useLogout();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = useUnreadNotificationsCount();
  const [isScrolled, setIsScrolled] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

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
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileMenuOpen(false);
        setNotificationsOpen(false);
      }
    }
    if (profileMenuOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen, notificationsOpen]);

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
      <div className="relative h-[68px] sm:h-[76px] w-full lg:h-[100px]">
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
              "mx-auto flex w-full max-w-[1512px] items-center justify-between px-3 sm:px-6 transition-all duration-300 lg:px-20",
              "h-[68px] sm:h-[76px] lg:h-[100px]"
            )}
            style={{
              maxWidth: "1512px",
            }}
          >
            {/* Logo */}
            <Link href="/" aria-label="MyJourny home" className="flex shrink-0 items-center">
              <Image
                src="/logo/myjourny-logo.svg"
                alt="MyJourny"
                width={167}
                height={29}
                priority
                style={{ width: "auto" }}
                className="h-[22px] sm:h-[26px] w-auto lg:h-[29px]"
              />
            </Link>

            {/* Desktop Center: Nav Pills <-> Compact Search Transformation */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex">
              <AnimatePresence mode="wait">
                {!isScrolled ? (
                  <motion.nav
                    layout="position"
                    key="primary-nav"
                    initial={{ opacity: 0, scale: 0.88, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: -6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    aria-label="Primary"
                    className="flex items-center gap-4 rounded-full bg-white p-2 shadow-[0_1px_8px_rgba(0,0,0,0.08)]"
                  >
                    {navItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setActiveTab(item.id)}
                          aria-label={item.label}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "relative flex items-center rounded-full text-base font-medium select-none transition-colors duration-200",
                            isActive
                              ? "h-[43px] text-[#1F1F1F]"
                              : "h-12 text-foreground hover:bg-black/[0.04]"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-nav-indicator"
                              className="absolute inset-0 rounded-full bg-[#F4F2EE]"
                              transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                              }}
                            />
                          )}

                          <motion.div
                            layout="position"
                            className={cn(
                              "relative z-10 flex h-full items-center",
                              isActive ? "px-4 gap-2" : "w-12 justify-center"
                            )}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          >
                            <NavArt src={item.icon} />
                            <AnimatePresence initial={false} mode="popLayout">
                              {isActive && (
                                <motion.span
                                  key={item.id}
                                  initial={{ opacity: 0, scale: 0.85, x: -4 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.85, x: -4 }}
                                  transition={{ duration: 0.16, ease: "easeOut" }}
                                  className="whitespace-nowrap font-medium"
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </motion.nav>
                ) : !isSearchExpanded ? (
                  /* Compact 3-segment pill matching user specification and screenshot */
                  <motion.div
                    key="compact-search-pill"
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex items-center gap-[9px] rounded-[57px] bg-[#F4F2EE] px-[10px] py-[5px] transition-shadow duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center">
                      {COMPACT_SEARCH_TABS.map((tab, index) => (
                        <div key={tab.id} className="flex items-center">
                          {index > 0 && <span aria-hidden className="h-[33px] w-px bg-[#B2B2B2]" />}
                          <button
                            type="button"
                            onClick={() => handleOpenSearch(tab.id)}
                            className="flex items-center gap-2 rounded-full px-4 py-2 font-sans text-[14px] font-medium leading-[21px] text-[#6F6B72] transition-colors hover:bg-black/5 cursor-pointer"
                          >
                            <CompactArt src={tab.icon} />
                            <span>{tab.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Red Search Button */}
                    <button
                      type="button"
                      aria-label="Search"
                      onClick={() => handleOpenSearch("where")}
                      className="flex size-11 shrink-0 items-center justify-center rounded-[23px] bg-brand transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Image src="/icons/nav/search-lg.svg" alt="" width={20} height={20} unoptimized />
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
                className="mx-2 flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-full border border-[#E0DFDD] bg-[#F4F2EE] py-1.5 pl-3 pr-1.5 shadow-xs transition-all hover:border-[#c7c1ba] sm:mx-3 lg:hidden cursor-pointer"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                  <PlaneNavIcon className="size-3.5 shrink-0 text-[#6F6B72]" />
                  <span className="truncate font-sans text-[12px] sm:text-[13px] font-medium text-[#333134]">
                    Where / When / Who
                  </span>
                </div>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-xs">
                  <Search className="size-3.5 stroke-[2.5]" />
                </span>
              </motion.button>
            )}

            {/* Right Nav: Notifications + Profile Icon Trigger + Dropdown Menu */}
            <div className="relative flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="#"
                className="hidden text-base font-medium text-foreground transition-colors hover:text-brand lg:inline-block mr-1"
              >
                Become a guide
              </Link>

              {user && (
                <div ref={notifContainerRef} className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    title="Notifications"
                    onClick={() => {
                      setNotificationsOpen((prev) => !prev);
                      setProfileMenuOpen(false);
                    }}
                    className={cn(
                      "relative flex shrink-0 items-center justify-center rounded-[12px] text-[#333134] transition-all cursor-pointer",
                      "size-11 lg:size-12",
                      isScrolled
                        ? "bg-[#F4F2EE] hover:bg-[#eae8e3]"
                        : "bg-[#FFF] hover:bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
                      notificationsOpen && "ring-2 ring-brand/20 bg-[#F4F2EE]"
                    )}
                  >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-[#F5032D] px-1 text-[11px] font-bold text-white shadow-xs">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute right-0 top-[calc(100%+12px)] z-50"
                      >
                        <NotificationsDropdown
                          onClose={() => setNotificationsOpen(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Profile icon button trigger */}
              <div ref={menuContainerRef} className="relative">
                <button
                  type="button"
                  aria-label="Profile menu"
                  title="Profile menu"
                  aria-expanded={profileMenuOpen}
                  onClick={() => {
                    setProfileMenuOpen((prev) => !prev);
                    setNotificationsOpen(false);
                  }}
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-[12px] text-[#333134] transition-all cursor-pointer",
                    "size-10 sm:size-11 lg:size-12",
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
                  <Image
                    src="/icons/nav/profile-button.png"
                    alt=""
                    width={48}
                    height={48}
                    className="size-full rounded-[12px] object-cover"
                  />
                </button>

                {/* Floating Dropdown Card Menu */}
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[401px] max-w-[calc(100vw-32px)] rounded-[20px] bg-white p-5 shadow-[0_12px_44px_rgba(0,0,0,0.12)] border border-[#F0EFEB]"
                    >
                      <MenuRow
                        href={user ? "/my-experiences" : "/login"}
                        onClick={() => setProfileMenuOpen(false)}
                        icon="/icons/nav/experiences.png"
                        label="My experiences"
                      />
                      <MenuRow
                        href={user ? "/notifications" : "/login"}
                        onClick={() => setProfileMenuOpen(false)}
                        icon="/icons/nav/notifications.png"
                        label="Notifications"
                        badge={unreadCount > 0 ? unreadCount : undefined}
                      />
                      <MenuRow
                        href={user ? "/profile" : "/login"}
                        onClick={() => setProfileMenuOpen(false)}
                        icon="/icons/nav/account-settings.png"
                        label="Account settings"
                      />
                      <MenuRow
                        href="#"
                        onClick={() => setProfileMenuOpen(false)}
                        icon="/icons/nav/help.png"
                        label="Help center"
                      />

                      <div className="my-3 h-px w-full bg-[#EEEEEE]" />

                      <MenuRow
                        href="#"
                        onClick={() => setProfileMenuOpen(false)}
                        icon="/icons/nav/become-guide.png"
                        label="Become a guide"
                        sublabel="Make extra income from what you already love doing"
                        accent
                      />

                      <div className="my-3 h-px w-full bg-[#EEEEEE]" />

                      <MenuRow
                        onClick={() => {
                          setProfileMenuOpen(false);
                          if (user) {
                            logout.mutate(undefined, { onSuccess: () => router.push("/login") });
                          } else {
                            router.push("/login");
                          }
                        }}
                        icon={user ? "/icons/nav/logout.png" : "/icons/nav/login.png"}
                        label={user ? "Logout" : "Login or create account"}
                        chevron={false}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
