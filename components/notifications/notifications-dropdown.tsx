"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Clock,
  CreditCard,
  Heart,
  Receipt,
  AlertTriangle,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  type NotificationCategory,
  type NotificationItem,
} from "@/lib/queries/notifications";
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
      return <Receipt className="size-4 text-[#02A078]" />;
    case "reminder":
      return <Clock className="size-4 text-[#E86339]" />;
    case "payment":
      return <CreditCard className="size-4 text-[#3B82F6]" />;
    case "saved":
    case "tip":
      return <Heart className="size-4 text-[#E84393]" />;
    case "schedule":
    default:
      return <AlertTriangle className="size-4 text-[#F59E0B]" />;
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

export function NotificationsDropdown({
  onClose,
}: {
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const { data: notifications = [], isLoading } = useNotifications({ limit: 50 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const selectedCategory = TAB_TO_CATEGORY[activeTab];
  const filteredNotifications = selectedCategory
    ? notifications.filter((item) => item.category === selectedCategory)
    : notifications;

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="flex w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] flex-col rounded-[24px] border border-[#E0DFDD] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0DFDD]/70 p-4 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-[17px] font-bold text-foreground">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-[#F5032D]/10 px-2 py-0.5 text-xs font-semibold text-[#F5032D]">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-[#E0DFDD]/50 bg-[#FAF9F7] px-4 py-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
              activeTab === tab
                ? "bg-[#2C0101] text-white"
                : "text-muted-foreground hover:bg-[#EAE8E3] hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-[#E0DFDD]/40">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-2 text-xs">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#F4F2EE] text-muted-foreground">
              <Bell className="size-6 text-[#A09C96]" />
            </div>
            <p className="mt-3 font-heading text-sm font-semibold text-foreground">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeTab === "All"
                ? "We'll notify you about bookings, trip updates, and recommendations."
                : `No notifications in ${activeTab.toLowerCase()}.`}
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
                "group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer",
                notification.unread ? "bg-[#FFF9F7]/70 hover:bg-[#FFF4F0]" : "hover:bg-[#FAF9F7]"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full mt-0.5",
                  getIconBg(notification.iconType)
                )}
              >
                {getIcon(notification.iconType)}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <h4
                    className={cn(
                      "text-[13px] leading-tight truncate",
                      notification.unread
                        ? "font-bold text-[#1E1E1E]"
                        : "font-medium text-[#333134]"
                    )}
                  >
                    {notification.title}
                  </h4>
                  {notification.unread && (
                    <span className="size-2 rounded-full bg-[#F5032D] shrink-0" />
                  )}
                </div>
                {notification.message ? (
                  <p className="mt-1 text-xs text-[#6F6B72] leading-relaxed line-clamp-2">
                    {notification.message}
                  </p>
                ) : null}
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#A09C96]">
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
                className="opacity-0 group-hover:opacity-100 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-[#EAE8E3] hover:text-destructive transition-all shrink-0 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E0DFDD]/70 bg-[#FAF9F7] p-2.5 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2C0101] hover:text-brand transition-colors"
        >
          <span>View all notifications</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );
}
