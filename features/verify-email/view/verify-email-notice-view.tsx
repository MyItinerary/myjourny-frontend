import { MailWarning } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  visible: boolean;
  sending: boolean;
  sent: boolean;
  onResend: () => void;
};

export function VerifyEmailNoticeView({ visible, sending, sent, onResend }: Props) {
  if (!visible) return null;
  return (
    <div
      role="status"
      className="mb-8 flex max-w-[720px] flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden />
        <div className="text-sm">
          <p className="font-medium text-[#130404]">Verify your email</p>
          <p className="mt-1 text-[#6F6B72]">
            {sent
              ? "Check your inbox for the link. It works for 24 hours."
              : "Open the link we emailed you so your receipts and booking updates reach the right inbox."}
          </p>
        </div>
      </div>
      <Button variant="outline" onClick={onResend} disabled={sending} className="shrink-0">
        {sending ? "Sending…" : sent ? "Send again" : "Resend link"}
      </Button>
    </div>
  );
}
