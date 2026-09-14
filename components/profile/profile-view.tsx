"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  DollarSign,
  FileText,
  Heart,
  Languages,
  Loader2,
  LogOut,
  Luggage,
  MessageSquare,
  Pencil,
  Shield,
  Sliders,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/session-store";
import { useLogout } from "@/lib/queries/auth";
import { useDeleteAccount, useGetBookings, useGetProfile, useUpdateProfile } from "@/lib/queries/profile";
import { useSavedExperienceIds } from "@/lib/queries/saved";
import { Button } from "@/components/ui/button";

interface MenuItemRowProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  badge?: string;
  danger?: boolean;
}

function MenuItemRow({ icon, label, onClick, href, badge, danger }: MenuItemRowProps) {
  const content = (
    <div
      className={`group flex items-center justify-between rounded-[18px] p-3.5 transition-all duration-200 hover:bg-[#F4F2EE] cursor-pointer ${
        danger ? "text-red-600 hover:bg-red-50" : "text-foreground"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-[14px] ${
            danger
              ? "bg-red-100 text-red-600"
              : "bg-[#F4F2EE] text-foreground group-hover:bg-white group-hover:text-brand"
          } transition-colors`}
        >
          {icon}
        </div>
        <span
          className={`font-sans text-[15px] font-medium leading-[20px] ${
            danger ? "text-red-600" : "text-foreground"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {badge && (
          <span className="rounded-full bg-[#F4F2EE] px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {badge}
          </span>
        )}
        <ChevronRight className="size-4.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button type="button" onClick={onClick} className="w-full text-left">{content}</button>;
}

export function ProfileView() {
  const router = useRouter();
  const { user } = useSession();
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const { data: profile } = useGetProfile();
  const { data: bookings, isLoading: isLoadingBookings } = useGetBookings();
  const { data: savedIds } = useSavedExperienceIds();
  const { mutate: updateProfile } = useUpdateProfile();

  // Modals state
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  // Preference selections
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.preferred_currency || "USD ($)");
  const [selectedLanguage, setSelectedLanguage] = useState(profile?.preferred_language || "English");
  const [notifPreferences, setNotifPreferences] = useState({
    trips: true,
    recommendations: true,
    promo: false,
  });
  const [starRating, setStarRating] = useState(5);

  const userName = user?.fullName || profile?.full_name || "Guest";
  const userEmail = user?.email || profile?.email || "";
  const locationLabel = "Wupa, Nigeria";
  const tripsCount = bookings?.length ?? 0;
  const wishlistCount = savedIds?.size ?? 0;

  const currencies = [
    { code: "USD", symbol: "$", label: "US Dollar (USD)" },
    { code: "EUR", symbol: "€", label: "Euro (EUR)" },
    { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
    { code: "NGN", symbol: "₦", label: "Nigerian Naira (NGN)" },
    { code: "CAD", symbol: "CA$", label: "Canadian Dollar (CAD)" },
    { code: "AUD", symbol: "AU$", label: "Australian Dollar (AUD)" },
  ];

  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
    { code: "it", label: "Italiano" },
  ];

  function handleSaveCurrency(curr: string) {
    setSelectedCurrency(curr);
    updateProfile({ preferred_currency: curr });
    toast.success(`Currency set to ${curr}`);
    setCurrencyModalOpen(false);
  }

  function handleSaveLanguage(lang: string) {
    setSelectedLanguage(lang);
    updateProfile({ preferred_language: lang });
    toast.success(`Language set to ${lang}`);
    setLanguageModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[640px]">
        {/* Screen Title */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-[24px] font-extrabold text-foreground sm:text-[28px]">
            My profile
          </h1>
        </div>

        {/* Profile Card / Header */}
        <div className="mb-6 flex flex-col items-center rounded-[24px] border border-[#E0DFDD]/70 bg-white p-6 shadow-sm sm:p-8">
          {/* Avatar with edit pencil badge */}
          <div className="relative mb-4">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-brand/20 bg-gradient-to-tr from-[#2C0101] to-[#F5032D] text-white shadow-inner sm:size-28">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={userName}
                  width={112}
                  height={112}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-12 text-white/90 sm:size-14" />
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.info("Avatar update coming soon")}
              aria-label="Edit avatar"
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#02A078] text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>

          {/* Name & details */}
          <h2 className="font-sans text-[20px] font-bold text-foreground sm:text-[22px]">
            {userName}
          </h2>
          {userEmail && (
            <p className="mt-0.5 font-sans text-[14px] text-muted-foreground">
              {userEmail}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1 font-sans text-[13px] font-medium text-muted-foreground">
            <span>{locationLabel}</span>
          </p>

          {/* Divider */}
          <div className="my-6 h-[1px] w-full bg-[#E0DFDD]/60" />

          {/* Stats row */}
          <div className="grid w-full grid-cols-2 divide-x divide-[#E0DFDD]/70 text-center">
            <div className="flex flex-col items-center">
              <span className="font-heading text-[22px] font-extrabold text-foreground sm:text-[26px]">
                {isLoadingBookings ? (
                  <Loader2 className="size-5 animate-spin text-brand" />
                ) : (
                  tripsCount
                )}
              </span>
              <span className="mt-0.5 font-sans text-[13px] font-medium text-muted-foreground">
                Trips
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-heading text-[22px] font-extrabold text-foreground sm:text-[26px]">
                {wishlistCount}
              </span>
              <span className="mt-0.5 font-sans text-[13px] font-medium text-muted-foreground">
                Wishlist
              </span>
            </div>
          </div>
        </div>

        {/* Become a Host Card (Matching Mobile Banner) */}
        <div className="mb-6 overflow-hidden rounded-[20px] bg-[#00140F] p-4 text-white shadow-md transition-all hover:bg-[#00221A] sm:p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-[#02A078] text-white shadow-sm">
              <Luggage className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-[16px] font-bold leading-[22px]">
                Become a host
              </h3>
              <p className="font-sans text-[13px] font-normal text-white/80">
                Apply to become a host and earn extra income
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("Host application portal is opening soon!")}
              className="hidden shrink-0 border-white/30 bg-white/10 text-white hover:bg-white/20 sm:inline-flex cursor-pointer"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Settings Menu Section */}
        <div className="mb-6 rounded-[22px] border border-[#E0DFDD]/70 bg-white p-2.5 shadow-sm sm:p-3.5">
          <div className="px-3 pt-1.5 pb-2">
            <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
              Settings & Preferences
            </span>
          </div>

          <MenuItemRow
            icon={<Sliders className="size-4.5" />}
            label="Profile and preferences"
            href="/profile/preferences"
          />

          <MenuItemRow
            icon={<DollarSign className="size-4.5" />}
            label="Currency"
            badge={selectedCurrency}
            onClick={() => setCurrencyModalOpen(true)}
          />

          <MenuItemRow
            icon={<Languages className="size-4.5" />}
            label="Language"
            badge={selectedLanguage}
            onClick={() => setLanguageModalOpen(true)}
          />

          <MenuItemRow
            icon={<Bell className="size-4.5" />}
            label="Notification settings"
            onClick={() => setNotificationsModalOpen(true)}
          />
        </div>

        {/* About Section */}
        <div className="mb-6 rounded-[22px] border border-[#E0DFDD]/70 bg-white p-2.5 shadow-sm sm:p-3.5">
          <div className="px-3 pt-1.5 pb-2">
            <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
              About & Support
            </span>
          </div>

          <MenuItemRow
            icon={<Sparkles className="size-4.5" />}
            label="About Myjourny"
            onClick={() => setAboutModalOpen(true)}
          />

          <MenuItemRow
            icon={<CircleHelp className="size-4.5" />}
            label="Help center"
            onClick={() => toast.info("Directing you to the Help Center…")}
          />

          <MenuItemRow
            icon={<MessageSquare className="size-4.5" />}
            label="Chat with us"
            onClick={() => toast.info("Live chat assistant will be available shortly.")}
          />

          <MenuItemRow
            icon={<Star className="size-4.5 text-amber-500" />}
            label="Rate the app"
            onClick={() => setRatingModalOpen(true)}
          />

          <MenuItemRow
            icon={<FileText className="size-4.5" />}
            label="Terms of service"
            onClick={() => toast.info("Viewing Terms of Service")}
          />

          <MenuItemRow
            icon={<Shield className="size-4.5" />}
            label="Privacy policy"
            onClick={() => toast.info("Viewing Privacy Policy")}
          />
        </div>

        {/* Danger Zone / Account Actions */}
        <div className="rounded-[22px] border border-[#E0DFDD]/70 bg-white p-2.5 shadow-sm sm:p-3.5">
          <div className="px-3 pt-1.5 pb-2">
            <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
              Account
            </span>
          </div>

          <MenuItemRow
            icon={<Trash2 className="size-4.5" />}
            label="Delete account"
            danger
            onClick={() => setDeleteDialogOpen(true)}
          />

          <MenuItemRow
            icon={<LogOut className="size-4.5" />}
            label="Logout"
            danger
            onClick={() => setLogoutDialogOpen(true)}
          />
        </div>
      </div>

      {/* --- Currency Modal --- */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-[18px] font-bold text-foreground">
                Select Currency
              </h3>
              <button
                type="button"
                onClick={() => setCurrencyModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {currencies.map((curr) => {
                const isSelected = selectedCurrency.startsWith(curr.code);
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleSaveCurrency(`${curr.code} (${curr.symbol})`)}
                    className={`flex items-center justify-between rounded-[14px] p-3 transition-colors ${
                      isSelected ? "bg-brand/10 text-brand font-semibold" : "hover:bg-[#F4F2EE] text-foreground"
                    }`}
                  >
                    <span className="font-sans text-[15px]">{curr.label}</span>
                    {isSelected && <Check className="size-4.5 text-brand" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- Language Modal --- */}
      {languageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-[18px] font-bold text-foreground">
                Select Language
              </h3>
              <button
                type="button"
                onClick={() => setLanguageModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.label;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSaveLanguage(lang.label)}
                    className={`flex items-center justify-between rounded-[14px] p-3 transition-colors ${
                      isSelected ? "bg-brand/10 text-brand font-semibold" : "hover:bg-[#F4F2EE] text-foreground"
                    }`}
                  >
                    <span className="font-sans text-[15px]">{lang.label}</span>
                    {isSelected && <Check className="size-4.5 text-brand" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- Notification Settings Modal --- */}
      {notificationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[460px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-[18px] font-bold text-foreground">
                Notification Settings
              </h3>
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4 divide-y divide-[#E0DFDD]/50">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-sans text-[15px] font-semibold text-foreground">Trip updates</p>
                  <p className="font-sans text-[13px] text-muted-foreground">Booking confirmations and changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.trips}
                  onChange={(e) => setNotifPreferences({ ...notifPreferences, trips: e.target.checked })}
                  className="size-5 accent-brand rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-sans text-[15px] font-semibold text-foreground">Recommendations</p>
                  <p className="font-sans text-[13px] text-muted-foreground">Personalized experiences based on your vibe</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.recommendations}
                  onChange={(e) => setNotifPreferences({ ...notifPreferences, recommendations: e.target.checked })}
                  className="size-5 accent-brand rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-sans text-[15px] font-semibold text-foreground">Promotions & deals</p>
                  <p className="font-sans text-[13px] text-muted-foreground">Special discounts and announcements</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.promo}
                  onChange={(e) => setNotifPreferences({ ...notifPreferences, promo: e.target.checked })}
                  className="size-5 accent-brand rounded cursor-pointer"
                />
              </div>
            </div>
            <Button
              className="mt-6 w-full cursor-pointer"
              onClick={() => {
                toast.success("Notification settings saved!");
                setNotificationsModalOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* --- About Modal --- */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
              <Sparkles className="size-7" />
            </div>
            <h3 className="font-heading text-[20px] font-bold text-foreground">MyJourny</h3>
            <p className="mt-1 font-sans text-[13px] text-muted-foreground">Version 1.0.0 (Web Build)</p>
            <p className="mt-4 font-sans text-[14px] leading-relaxed text-muted-foreground">
              Curating personal travel experiences tailored to what you genuinely love. Guided by locals and powered by smart recommendations.
            </p>
            <Button
              className="mt-6 w-full cursor-pointer"
              onClick={() => setAboutModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* --- Rate the App Modal --- */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[400px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-center">
            <h3 className="font-heading text-[18px] font-bold text-foreground">Enjoying MyJourny?</h3>
            <p className="mt-1 font-sans text-[14px] text-muted-foreground">Tap a star to rate your experience</p>
            <div className="my-6 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      star <= starRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Button
              className="w-full cursor-pointer"
              onClick={() => {
                toast.success("Thank you for your feedback!");
                setRatingModalOpen(false);
              }}
            >
              Submit feedback
            </Button>
          </div>
        </div>
      )}

      {/* --- Logout Confirmation Dialog --- */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[380px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-heading text-[18px] font-bold text-foreground">Log out</h3>
            <p className="mt-2 font-sans text-[14px] text-muted-foreground">
              Are you sure you want to log out of your MyJourny account?
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => setLogoutDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setLogoutDialogOpen(false);
                  logout.mutate(undefined, {
                    onSuccess: () => {
                      toast.success("Logged out successfully");
                      router.push("/login");
                    },
                  });
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Account Confirmation Dialog --- */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[380px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-heading text-[18px] font-bold text-red-600">Delete account</h3>
            <p className="mt-2 font-sans text-[14px] text-muted-foreground">
              This action is permanent and cannot be undone. All your saved preferences, bookings, and wishlist items will be permanently erased.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteAccount.isPending}
                className="flex-1 cursor-pointer"
                onClick={() => {
                  deleteAccount.mutate(undefined, {
                    onSuccess: () => {
                      toast.success("Account deleted");
                      setDeleteDialogOpen(false);
                    },
                    onError: () => {
                      toast.error("Failed to delete account. Please try again.");
                    },
                  });
                }}
              >
                {deleteAccount.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
