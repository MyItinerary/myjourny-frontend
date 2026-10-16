import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  DEFAULT_BOOKING_CANCELLED_EMAIL,
  DEFAULT_BOOKING_CONFIRMED_EMAIL,
  DEFAULT_PASSWORD_RESET_EMAIL,
  DEFAULT_PAYMENT_CONFIRMED_EMAIL,
  DEFAULT_TODAY_REMINDER_EMAIL,
  DEFAULT_VERIFY_EMAIL_EMAIL,
  EMAIL_TEMPLATES_CATALOG,
} from "../model/email-templates-data";
import { generateEmailHtmlForTemplate } from "../model/email-templates-html";
import type {
  BookingCancelledEmailData,
  BookingConfirmedEmailData,
  EmailCatalogItem,
  EmailTemplateId,
  EmailViewMode,
  EmailViewport,
  PasswordResetEmailData,
  PaymentConfirmedEmailData,
  TodayReminderEmailData,
  VerifyEmailEmailData,
} from "../model/email-templates.types";

export interface EmailTemplatesViewModel {
  activeTemplateId: EmailTemplateId;
  viewMode: EmailViewMode;
  viewport: EmailViewport;
  catalog: EmailCatalogItem[];
  copied: boolean;
  passwordResetData: PasswordResetEmailData;
  bookingConfirmedData: BookingConfirmedEmailData;
  todayReminderData: TodayReminderEmailData;
  paymentConfirmedData: PaymentConfirmedEmailData;
  bookingCancelledData: BookingCancelledEmailData;
  verifyEmailData: VerifyEmailEmailData;
  onSelectTemplate: (id: EmailTemplateId) => void;
  onSelectViewMode: (mode: EmailViewMode) => void;
  onSelectViewport: (viewport: EmailViewport) => void;
  onCopyHtml: (htmlContent?: string) => Promise<void>;
}

export interface UseEmailTemplatesViewModelProps {
  initialTemplateId?: EmailTemplateId;
  initialViewMode?: EmailViewMode;
  initialViewport?: EmailViewport;
}

export function useEmailTemplatesViewModel(
  props: UseEmailTemplatesViewModelProps = {},
): EmailTemplatesViewModel {
  const {
    initialTemplateId = "password-reset",
    initialViewMode = "preview",
    initialViewport = "desktop",
  } = props;

  const [activeTemplateId, setActiveTemplateId] = useState<EmailTemplateId>(initialTemplateId);
  const [viewMode, setViewMode] = useState<EmailViewMode>(initialViewMode);
  const [viewport, setViewport] = useState<EmailViewport>(initialViewport);
  const [copied, setCopied] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSelectTemplate = (id: EmailTemplateId) => {
    setActiveTemplateId(id);
  };

  const handleSelectViewMode = (mode: EmailViewMode) => {
    setViewMode(mode);
  };

  const handleSelectViewport = (vp: EmailViewport) => {
    setViewport(vp);
  };

  const handleCopyHtml = async (customHtml?: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast.error("Clipboard is not available in this environment");
      return;
    }

    try {
      const htmlContent =
        typeof customHtml === "string" && customHtml.trim().length > 0
          ? customHtml
          : generateEmailHtmlForTemplate(activeTemplateId, {
              passwordResetData: DEFAULT_PASSWORD_RESET_EMAIL,
              bookingConfirmedData: DEFAULT_BOOKING_CONFIRMED_EMAIL,
              todayReminderData: DEFAULT_TODAY_REMINDER_EMAIL,
              paymentConfirmedData: DEFAULT_PAYMENT_CONFIRMED_EMAIL,
              bookingCancelledData: DEFAULT_BOOKING_CANCELLED_EMAIL,
              verifyEmailData: DEFAULT_VERIFY_EMAIL_EMAIL,
            });

      await navigator.clipboard.writeText(htmlContent);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setCopied(true);
      toast.success("Email template HTML copied to clipboard");
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 2000);
    } catch {
      toast.error("Failed to copy email template HTML");
    }
  };

  return {
    activeTemplateId,
    viewMode,
    viewport,
    catalog: EMAIL_TEMPLATES_CATALOG,
    copied,
    passwordResetData: DEFAULT_PASSWORD_RESET_EMAIL,
    bookingConfirmedData: DEFAULT_BOOKING_CONFIRMED_EMAIL,
    todayReminderData: DEFAULT_TODAY_REMINDER_EMAIL,
    paymentConfirmedData: DEFAULT_PAYMENT_CONFIRMED_EMAIL,
    bookingCancelledData: DEFAULT_BOOKING_CANCELLED_EMAIL,
    verifyEmailData: DEFAULT_VERIFY_EMAIL_EMAIL,
    onSelectTemplate: handleSelectTemplate,
    onSelectViewMode: handleSelectViewMode,
    onSelectViewport: handleSelectViewport,
    onCopyHtml: handleCopyHtml,
  };
}
