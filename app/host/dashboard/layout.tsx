import type { Metadata } from "next";
import type { ReactNode } from "react";

import { HostSidebar } from "./sidebar";

export const metadata: Metadata = {
  title: "Host portal — MyJourny",
};

// The host portal: the sidebar rail beside whichever section is open. Each
// section draws its own header bar and scrolls on its own.
export default function HostPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <HostSidebar />
      <main className="flex min-w-0 flex-1 flex-col bg-white">{children}</main>
    </div>
  );
}
