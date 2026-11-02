import Link from "next/link";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { Button } from "@/components/ui/button";

import type { VerifyEmailStatus } from "../model/verify-email.types";

type Props = {
  status: VerifyEmailStatus;
  heading: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export function VerifyEmailView({ status, heading, subtitle, ctaLabel, ctaHref }: Props) {
  return (
    <AuthScreenLayout heading={heading} subtitle={subtitle}>
      {status !== "verifying" && (
        <Button size="cta" className="w-full" render={<Link href={ctaHref} />}>
          {ctaLabel}
        </Button>
      )}
    </AuthScreenLayout>
  );
}
