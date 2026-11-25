import type { ReactNode } from "react";

import type { HostGuardViewModel } from "../view-model/use-host-guard-view-model";

type Props = HostGuardViewModel & { children: ReactNode };

export function HostGuardView({ ready, banner, children }: Props) {
  if (!ready) {
    return (
      <div aria-busy="true" className="flex h-dvh items-center justify-center bg-white text-sm text-[#6F6B72]">
        Checking your account…
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      {banner && (
        <div role="status" className="shrink-0 border-b border-[#F3E2BF] bg-[#FDF7EB] px-4 py-3 sm:px-6">
          <p className="text-[13.5px] font-medium text-[#8A5A07]">{banner.title}</p>
          <p className="mt-0.5 text-[12.5px] text-[#8A5A07]/90">{banner.body}</p>
        </div>
      )}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
