"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/queries/notifications";
import { useSession } from "@/lib/auth/session-store";

interface DisplayNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  dateGroup: "Today" | "This week" | "Earlier";
  unread: boolean;
  imageUrl?: string | null;
}

const FIGMA_SAMPLE_NOTIFICATIONS: DisplayNotification[] = [
  {
    id: "sample-1",
    title: "Booking confirmed",
    body: "Your booking for Sunrise Kayaking at Tarkwa Bay is confirmed for Sat, Aug 2.",
    time: "2h ago",
    dateGroup: "Today",
    unread: true,
  },
  {
    id: "sample-2",
    title: "Message from Tobi A.",
    body: "“Looking forward to Saturday! Bring sunscreen ☀️”",
    time: "4h ago",
    dateGroup: "Today",
    unread: true,
  },
  {
    id: "sample-3",
    title: "How was the experience?",
    body: "Leave a review for Balogun Market Deep Dive, it helps other travelers decide.",
    time: "4h ago",
    dateGroup: "Today",
    unread: true,
  },
  {
    id: "sample-4",
    title: "New in Port Harcourt",
    body: "5 new experiences just added in the heart GRA Phase 2.",
    time: "2d ago",
    dateGroup: "This week",
    unread: false,
  },
  {
    id: "sample-5",
    title: "Confirmed experience coming up",
    body: "Your Jollof Rice Masterclass with Chef Amaka is in 3 days.",
    time: "2d ago",
    dateGroup: "This week",
    unread: false,
  },
  {
    id: "sample-6",
    title: "Price drop on a saved experience",
    body: "Pleasure Park exploration dropped to ₦12,000, it's in your wishlist.",
    time: "2d ago",
    dateGroup: "This week",
    unread: false,
  },
];

const ORDERED_GROUPS: Array<DisplayNotification["dateGroup"]> = [
  "Today",
  "This week",
  "Earlier",
];

export function NotificationsContent() {
  const { user } = useSession();
  const { data: serverNotifications = [], isLoading } = useNotifications({ limit: 50 });
  const { mutate: markServerRead } = useMarkNotificationRead();
  const { mutate: markServerAllRead } = useMarkAllNotificationsRead();

  // Local tracking of notifications marked as read
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [allMarkedRead, setAllMarkedRead] = useState(false);

  // Use server notifications if available; fallback to Figma reference notifications
  const allNotifications: DisplayNotification[] = useMemo(() => {
    if (serverNotifications.length > 0) {
      return serverNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        time: n.time,
        dateGroup: (n.dateGroup as DisplayNotification["dateGroup"]) || "Earlier",
        unread: n.unread,
        imageUrl: n.raw?.meta_info?.image_url || null,
      }));
    }
    return FIGMA_SAMPLE_NOTIFICATIONS;
  }, [serverNotifications]);

  // Compute unread count based on items and local read state
  const unreadCount = useMemo(() => {
    if (allMarkedRead) return 0;
    return allNotifications.filter(
      (item) => item.unread && !readIds.has(item.id)
    ).length;
  }, [allNotifications, readIds, allMarkedRead]);

  // Group notifications in ordered buckets
  const groupedSections = useMemo(() => {
    const map = new Map<DisplayNotification["dateGroup"], DisplayNotification[]>();
    for (const group of ORDERED_GROUPS) {
      map.set(group, []);
    }

    for (const item of allNotifications) {
      const groupKey = ORDERED_GROUPS.includes(item.dateGroup)
        ? item.dateGroup
        : "Earlier";
      map.get(groupKey)?.push(item);
    }

    return ORDERED_GROUPS.map((title) => ({
      title,
      items: map.get(title) || [],
    })).filter((section) => section.items.length > 0);
  }, [allNotifications]);

  function handleMarkAllRead() {
    setAllMarkedRead(true);
    setReadIds(new Set(allNotifications.map((n) => n.id)));
    if (user && serverNotifications.length > 0) {
      markServerAllRead();
    }
  }

  function handleItemClick(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (user && serverNotifications.length > 0) {
      markServerRead(id);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HomeNav />

      <main className="flex-1 mx-auto w-full max-w-[1512px] px-4 sm:px-6 lg:px-20 pt-6 sm:pt-8 pb-16">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 sm:mb-6 flex items-center gap-1.5 text-xs sm:text-sm text-[#737373]"
        >
          <Link href="/" className="font-medium text-brand hover:underline">
            Home page
          </Link>
          <span>/</span>
          <span className="font-medium text-[#1E1E1E]">Notifications</span>
          <span>/</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-start justify-between pb-4 sm:pb-6">
          <div>
            <h1 className="font-heading text-[28px] sm:text-[34px] font-extrabold tracking-tight text-[#1E1E1E] leading-tight">
              Notifications
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#737373]">
              {unreadCount > 0 ? `${unreadCount} unread` : "0 unread"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={`pt-1 sm:pt-2 text-xs sm:text-sm font-semibold transition-colors ${
              unreadCount > 0
                ? "text-[#7E1515] hover:text-[#5E0F0F] cursor-pointer"
                : "text-[#A09C96] cursor-default"
            }`}
          >
            Mark all as read
          </button>
        </div>

        {/* Grouped Notifications List */}
        <div className="space-y-8 sm:space-y-10">
          {isLoading && serverNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="mt-3 text-sm">Loading notifications...</p>
            </div>
          ) : (
            groupedSections.map(({ title, items }) => (
              <section key={title} className="space-y-3.5 sm:space-y-4">
                <h2 className="font-heading text-sm sm:text-base font-semibold text-[#1E1E1E]">
                  {title}
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {items.map((notification) => {
                    const isUnread =
                      !allMarkedRead &&
                      notification.unread &&
                      !readIds.has(notification.id);

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleItemClick(notification.id)}
                        className="group flex items-start sm:items-center justify-between gap-4 py-1.5 transition-colors cursor-pointer rounded-xl hover:bg-[#FAF9F7]/80 px-2 -mx-2"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                          {/* Soft Rounded Thumbnail */}
                          <div className="relative size-12 sm:size-14 shrink-0 overflow-hidden rounded-[14px] bg-[#EFEFEF]">
                            {notification.imageUrl && (
                              <Image
                                src={notification.imageUrl}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`font-heading text-sm sm:text-base leading-snug ${
                                isUnread
                                  ? "font-bold text-[#1E1E1E]"
                                  : "font-medium text-[#2E2E2E]"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p className="mt-0.5 text-xs sm:text-sm text-[#737373] leading-relaxed line-clamp-2">
                              {notification.body}
                            </p>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <span className="shrink-0 text-xs sm:text-sm text-[#737373] self-start sm:self-center font-normal whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
