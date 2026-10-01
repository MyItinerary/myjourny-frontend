"use client";

import { Suspense } from "react";
import { ProfileView } from "@/components/account settings/profile-view";

export function ProfileContent() {
  return (
    <Suspense fallback={null}>
      <ProfileView />
    </Suspense>
  );
}
