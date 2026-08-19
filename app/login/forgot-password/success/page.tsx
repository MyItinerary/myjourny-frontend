import Link from "next/link";
import type { Metadata } from "next";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Password reset — MyJourny",
};

// Figma: "Desktop - 37" (2068:25009) — same split auth shell as every other
// auth screen (not the gradient-bg InterstitialScreen shell), just a single
// button, no form fields.
export default function ResetSuccessPage() {
  return (
    <AuthScreenLayout heading="You reset your password successfully" subtitle="Continue to login">
      <div className="flex w-full max-w-[345px] flex-col lg:max-w-[402px]">
        <Button size="cta" className="w-full" render={<Link href="/login" />}>
          Back to login
        </Button>
      </div>
    </AuthScreenLayout>
  );
}
