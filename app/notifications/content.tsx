"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Clock,
  CreditCard,
  Heart,
  Receipt,
  AlertTriangle,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  type NotificationCategory,
  type NotificationItem,
} from "@/lib/queries/notifications";
import { useSession } from "@/lib/auth/session-store";
import { cn } from "@/lib/utils";

const FILTER_TABS = ["All", "Bookings", "Payments", "Tips"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const TAB_TO_CATEGORY: Record<FilterTab, NotificationCategory | null> = {
  All: null,
  Bookings: "bookings",
  Payments: "payments",
  Tips: "tips",
};

function getIcon(iconType: NotificationItem["iconType"]) {
  switch (iconType) {
    case "booking":
      return <Receipt className="size-5 text-[#02A078]" />;
    case "reminder":
      return <Clock className="size-5 text-[#E86339]" />;
    case "payment":
      return <CreditCard className="size-5 text-[#3B82F6]" />;
    case "saved":
    case "tip":
      return <Heart className="size-5 text-[#E84393]" />;
    case "schedule":
    default:
      return <AlertTriangle className="size-5 text-[#F59E0B]" />;
  }
}

function getIconBg(iconType: NotificationItem["iconType"]) {
  switch (iconType) {
    case "booking":
      return "bg-[#E5FFF8]";
    case "reminder":
      return "bg-[#FFF0EB]";
    case "payment":
      return "bg-[#EFF6FF]";
    case "saved":
    case "tip":
      return "bg-[#FFF0F6]";
    case "schedule":
    default:
      return "bg-[#FFFBEB]";
  }
}

export function NotificationsContent() {
  const router = useRouter();
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const { data: notifications = [], isLoading } = useNotifications({ limit: 100 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const selectedCategory = TAB_TO_CATEGORY[activeTab];
  const filteredNotifications = selectedCategory
    ? notifications.filter((item) => item.category === selectedCategory)
    : notifications;

  const unreadCount = notifications.filter((n) => n.unread).length;

  if (!user && typeof window !== "undefined") {
    // Guest or unauthenticated state
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <HomeNav />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#F4F2EE] text-foreground mb-4">
              <Bell className="size-8 text-[#6F6B72]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Sign in to view notifications
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an account or sign in to get real-time trip reminders, payment updates, and personalized recommendations.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#2C0101] px-6 text-sm font-semibold text-white hover:bg-black transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#E0DFDD] px-6 text-sm font-semibold text-foreground hover:bg-[#F4F2EE] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E0DFDD]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#F5032D]/10 px-2.5 py-0.5 text-xs font-bold text-[#F5032D]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Stay updated on your upcoming bookings, payments, and itinerary changes.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E0DFDD] bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-[#F4F2EE] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <CheckCheck className="size-4 text-brand" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                activeTab === tab
                  ? "bg-[#2C0101] text-white shadow-xs"
                  : "bg-[#F4F2EE] text-foreground hover:bg-[#EAE8E3]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="mt-6 divide-y divide-[#E0DFDD]/70 rounded-[24px] border border-[#E0DFDD] bg-white shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="mt-3 text-sm">Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#F4F2EE] text-muted-foreground">
                <Bell className="size-7 text-[#A09C96]" />
              </div>
              <p className="mt-4 font-heading text-lg font-bold text-foreground">
                No notifications found
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                {activeTab === "All"
                  ? "When you book experiences, receive trip reminders, or get recommendations, they will appear here."
                  : `You don't have any ${activeTab.toLowerCase()} notifications right now.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (notification.unread) {
                    markRead(notification.id);
                  }
                }}
                className={cn(
                  "group relative flex items-start gap-4 p-4 sm:p-5 transition-colors cursor-pointer",
                  notification.unread
                    ? "bg-[#FFF9F7]/70 hover:bg-[#FFF4F0]"
                    : "hover:bg-[#FAF9F7]"
                )}
              >
                {/* Type Icon */}
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full mt-0.5",
                    getIconBg(notification.iconType)
                  )}
                >
                  {getIcon(notification.iconType)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "text-[15px] leading-tight",
                        notification.unread
                          ? "font-bold text-[#1E1E1E]"
                          : "font-medium text-[#333134]"
                      )}
                    >
                      {notification.title}
                    </h3>
                    {notification.unread && (
                      <span className="size-2 rounded-full bg-[#F5032D] shrink-0" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="mt-1.5 text-sm text-[#6F6B72] leading-relaxed">
                      {notification.message}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#A09C96]">
                    <span>{notification.dateGroup}</span>
                    <span>•</span>
                    <span>{notification.time}</span>
                    <span>•</span>
                    <span className="capitalize">{notification.category}</span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#EAE8E3] hover:text-destructive transition-all shrink-0 cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
