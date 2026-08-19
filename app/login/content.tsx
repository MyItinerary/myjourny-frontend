"use client";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { LoginForm } from "@/components/onboarding/login-form";

// Figma: "Desktop - 30"/"Desktop - 31" (2068:24743/2068:24830) / "Splash" (2068:25586/2068:25657)
export function LoginContent() {
  return (
    <AuthScreenLayout heading="Welcome back!" subtitle="Pick up where you left off.">
      <LoginForm />
    </AuthScreenLayout>
  );
}
