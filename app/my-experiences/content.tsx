"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Compass, CalendarX2, CalendarCheck, CalendarDays } from "lucide-react";

import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { BookingCard } from "@/components/my-experiences/booking-card";
import { useSession } from "@/lib/auth/session-store";
import { useMyBookings, type MyExperiencesTab } from "@/lib/queries/bookings";
import { cn } from "@/lib/utils";

type TabKey = MyExperiencesTab;

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past experiences" },
  { key: "cancelled", label: "Cancelled experiences" },
];

export function MyExperiencesContent() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useMyBookings(activeTab);

  // Flatten paginated pages from useInfiniteQuery
  const realBookings = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const displayedBookings = user ? realBookings : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1 mx-auto w-full max-w-[1512px] px-6 lg:px-20 py-8 lg:py-12">
        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            My experiences
          </h1>
          <p className="mt-2 text-base text-[#6F6B72]">
            Bookings you&apos;ve made over time
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="relative border-b border-[#E0DFDD]/70 mb-8 sm:mb-10">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "relative pb-3.5 text-sm sm:text-[15px] transition-colors whitespace-nowrap cursor-pointer",
                    isActive
                      ? "font-bold text-[#1E1E1E]"
                      : "font-medium text-[#8C888F] hover:text-[#1E1E1E]"
                  )}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="my-experiences-tab-underline"
                      className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-brand"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content: Cards Grid or Empty State or Error */}
        {isLoading && user ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse">
                <div className="aspect-[4/3] w-full rounded-[20px] bg-[#EAE8E3]" />
                <div className="mt-3 h-4 w-3/4 rounded-md bg-[#EAE8E3]" />
                <div className="mt-2 h-3 w-1/2 rounded-md bg-[#EAE8E3]" />
              </div>
            ))}
          </div>
        ) : isError && user ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-destructive mb-3">
              Could not load your bookings. Please try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#E0DFDD] px-5 text-sm font-semibold text-foreground hover:bg-[#F4F2EE] transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : displayedBookings.length > 0 ? (
          <div>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
            >
              {displayedBookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </motion.div>

            {/* "View more" button: maps directly onto useInfiniteQuery, shown only when has_more is true */}
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#1E1E1E] px-8 text-sm font-semibold text-[#1E1E1E] transition-all hover:bg-[#F4F2EE] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-[#1E1E1E] border-t-transparent" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    "View more"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            key={user ? `empty-${activeTab}` : "empty-guest"}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-[#F4F2EE] text-[#6F6B72] mb-4">
              {activeTab === "cancelled" ? (
                <CalendarX2 className="size-8" />
              ) : activeTab === "past" ? (
                <CalendarCheck className="size-8" />
              ) : (
                <CalendarDays className="size-8" />
              )}
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">
              {!user
                ? "No experiences yet"
                : activeTab === "cancelled"
                ? "No cancelled experiences"
                : activeTab === "past"
                ? "No past experiences"
                : "No upcoming experiences"}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-[#6F6B72]">
              {!user
                ? "Log in or create an account to view and manage your booked journeys."
                : activeTab === "cancelled"
                ? "You haven't cancelled any bookings."
                : activeTab === "past"
                ? "You haven't completed any experiences yet."
                : "When you book an experience, it will appear here."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#2C0101] px-6 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-black"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E0DFDD] px-6 text-sm font-semibold text-foreground transition-colors hover:bg-[#F4F2EE]"
                  >
                    <Compass className="size-4" />
                    Explore experiences
                  </Link>
                </>
              ) : (
                <Link
                  href="/"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand/90"
                >
                  <Compass className="size-4" />
                  Explore experiences
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
