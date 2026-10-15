import type { Metadata } from "next";
import type { ReactNode } from "react";

import { HostSidebar } from "./sidebar";

export const metadata: Metadata = {
  title: "Host portal — MyJourny",
};

// The host portal: the sidebar rail beside whichever section is open.
export default function HostPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-white">
      <HostSidebar />
      <main className="min-w-0 flex-1 p-10">{children}</main>
    </div>
  );
}
