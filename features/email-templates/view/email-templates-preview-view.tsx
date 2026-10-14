"use client";

import { Check, Copy, Laptop, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";

import type { EmailTemplatesViewModel } from "../view-model/use-email-templates-view-model";
import { BookingCancelledEmailView } from "./booking-cancelled-email-view";
import { BookingConfirmedEmailView } from "./booking-confirmed-email-view";
import { PasswordResetEmailView } from "./password-reset-email-view";
import { PaymentConfirmedEmailView } from "./payment-confirmed-email-view";
import { TodayReminderEmailView } from "./today-reminder-email-view";
import { VerifyEmailView } from "./verify-email-view";

export function EmailTemplatesPreviewView(props: EmailTemplatesViewModel) {
  const {
    activeTemplateId,
    viewMode,
    viewport,
    catalog,
    copied,
    passwordResetData,
    bookingConfirmedData,
    todayReminderData,
    paymentConfirmedData,
    bookingCancelledData,
    verifyEmailData,
    onSelectTemplate,
    onSelectViewMode,
    onSelectViewport,
    onCopyHtml,
  } = props;

  const maxWidthClass = viewport === "mobile" ? "max-w-[375px]" : "max-w-[600px]";

  const renderActiveTemplate = () => {
    switch (activeTemplateId) {
      case "password-reset":
        return <PasswordResetEmailView data={passwordResetData} maxWidthClass={maxWidthClass} />;
      case "booking-confirmed":
        return <BookingConfirmedEmailView data={bookingConfirmedData} maxWidthClass={maxWidthClass} />;
      case "today-reminder":
        return <TodayReminderEmailView data={todayReminderData} maxWidthClass={maxWidthClass} />;
      case "payment-confirmed":
        return <PaymentConfirmedEmailView data={paymentConfirmedData} maxWidthClass={maxWidthClass} />;
      case "booking-cancelled":
        return <BookingCancelledEmailView data={bookingCancelledData} maxWidthClass={maxWidthClass} />;
      case "verify-email":
        return <VerifyEmailView data={verifyEmailData} maxWidthClass={maxWidthClass} />;
      default:
        return <PasswordResetEmailView data={passwordResetData} maxWidthClass={maxWidthClass} />;
    }
  };

  const handleCopyCurrentHtml = () => {
    void onCopyHtml();
  };

  return (
    <div className="min-h-screen bg-[#ECEAE5]/70 text-[#130404]">
      {/* Top Navigation & Controls Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E0DFDD] bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#2C0101] px-2 py-0.5 font-sans text-xs font-bold text-white uppercase">
                MyJourny
              </span>
              <h1 className="font-sans text-base font-extrabold tracking-tight sm:text-lg">
                Email Templates
              </h1>
            </div>
            <p className="hidden font-sans text-xs text-[#6F6B72] sm:block">
              Figma design system compliant transactional emails (6 templates)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-[#E0DFDD] bg-[#F8F7F5] p-0.5">
              <button
                type="button"
                onClick={() => onSelectViewMode("preview")}
                className={cn(
                  "rounded-md px-3 py-1 font-sans text-xs font-medium transition-colors cursor-pointer",
                  viewMode === "preview"
                    ? "bg-white text-[#130404] shadow-xs font-semibold"
                    : "text-[#6F6B72] hover:text-[#130404]",
                )}
              >
                Single Template
              </button>
              <button
                type="button"
                onClick={() => onSelectViewMode("all")}
                className={cn(
                  "rounded-md px-3 py-1 font-sans text-xs font-medium transition-colors cursor-pointer",
                  viewMode === "all"
                    ? "bg-white text-[#130404] shadow-xs font-semibold"
                    : "text-[#6F6B72] hover:text-[#130404]",
                )}
              >
                View All 6
              </button>
            </div>

            {/* Viewport Width Switcher */}
            {viewMode === "preview" && (
              <div className="flex items-center rounded-lg border border-[#E0DFDD] bg-[#F8F7F5] p-0.5">
                <button
                  type="button"
                  aria-label="Desktop view"
                  onClick={() => onSelectViewport("desktop")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-sans text-xs font-medium transition-colors cursor-pointer",
                    viewport === "desktop"
                      ? "bg-white text-[#130404] shadow-xs font-semibold"
                      : "text-[#6F6B72] hover:text-[#130404]",
                  )}
                >
                  <Laptop className="size-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  aria-label="Mobile view"
                  onClick={() => onSelectViewport("mobile")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-sans text-xs font-medium transition-colors cursor-pointer",
                    viewport === "mobile"
                      ? "bg-white text-[#130404] shadow-xs font-semibold"
                      : "text-[#6F6B72] hover:text-[#130404]",
                  )}
                >
                  <Smartphone className="size-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            )}

            {/* Copy Template HTML CTA */}
            <button
              type="button"
              onClick={handleCopyCurrentHtml}
              className="flex items-center gap-1.5 rounded-lg bg-[#2C0101] px-3 py-1.5 font-sans text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#430808] cursor-pointer"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied!" : "Copy HTML"}</span>
            </button>
          </div>
        </div>

        {/* Template Selector Tabs */}
        {viewMode === "preview" && (
          <div className="mx-auto mt-3 flex max-w-7xl items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
            {catalog.map((item) => {
              const isSelected = activeTemplateId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTemplate(item.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1 font-sans text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#F5032D] text-white shadow-xs font-semibold"
                      : "bg-[#F4F2EE] text-[#6F6B72] hover:bg-[#EBE9E4] hover:text-[#130404]",
                  )}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="py-8">
        {viewMode === "preview" ? (
          <div className="flex justify-center px-4">{renderActiveTemplate()}</div>
        ) : (
          /* Grid View of all 6 Templates */
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 text-center">
              <h2 className="font-sans text-xl font-extrabold text-[#130404] sm:text-2xl">
                All 6 Email Templates
              </h2>
              <p className="mt-1 font-sans text-xs text-[#6F6B72]">
                From Password Reset, to Kayaking Reminders, to Receipts and Verification
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
              <div className="flex flex-col items-center">
                <span className="mb-2 font-sans text-xs font-bold text-[#6F6B72] uppercase tracking-wider">
                  Template 1 · Password Reset
                </span>
                <PasswordResetEmailView data={passwordResetData} />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 font-sans text-xs font-bold text-[#6F6B72] uppercase tracking-wider">
                  Template 2 · Booking Confirmed
                </span>
                <BookingConfirmedEmailView data={bookingConfirmedData} />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 font-sans text-xs font-bold text-[#6F6B72] uppercase tracking-wider">
                  Template 3 · Today&apos;s Experience
                </span>
                <TodayReminderEmailView data={todayReminderData} />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 font-sans text-xs font-bold text-[#6F6B72] uppercase tracking-wider">
                  Template 4 · Payment Confirmed
                </span>
                <PaymentConfirmedEmailView data={paymentConfirmedData} />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 font-sans text-xs font-bold text-[#6F6B72] uppercase tracking-wider">
                  Template 5 · Booking Cancelled
                </span>
                <BookingCancelledEmailView data={bookingCancelledData} />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-2 font-sans text-xs font-bold text-[#6F6B72] uppercase tracking-wider">
                  Template 6 · Verify Your Email
                </span>
                <VerifyEmailView data={verifyEmailData} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
