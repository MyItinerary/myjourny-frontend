"use client";

import {
  EmailTemplatesPreviewView,
  useEmailTemplatesViewModel,
} from "@/features/email-templates";

export function EmailTemplatesContent() {
  const vm = useEmailTemplatesViewModel();
  return <EmailTemplatesPreviewView {...vm} />;
}
