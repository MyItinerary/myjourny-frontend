"use client";

import { Drawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import Link from "next/link";

import type { DayPanel } from "../view-model/use-host-calendar-view-model";

// Figma / handoff: the panel that slides in from the right with one date: what
// runs on it, and a way to block it or open it again.
export function CalendarDayPanelView({
  panel,
  onClose,
  onToggleBlock,
}: {
  panel: DayPanel | null;
  onClose: () => void;
  onToggleBlock: () => void;
}) {
  return (
    <Drawer.Root open={panel !== null} onOpenChange={(open) => !open && onClose()} swipeDirection="right">
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-[#2C0101]/[0.22] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-40 flex justify-end">
          <Drawer.Popup className="h-full w-full max-w-[420px] overflow-y-auto bg-white p-6 shadow-[-12px_0_40px_rgba(16,24,40,0.12)] outline-none transition-transform duration-200 [transform:translateX(var(--drawer-swipe-movement-x,0px))] data-ending-style:[transform:translateX(100%)] data-starting-style:[transform:translateX(100%)]">
            {panel && (
              <>
                <div className="mb-[22px] flex items-start gap-3">
                  <div>
                    <Drawer.Title className="font-heading text-[22px] leading-[1.2] font-extrabold text-[#333134]">{panel.title}</Drawer.Title>
                    {panel.subtitle && (
                      <Drawer.Description className="mt-1 text-[13px] text-[#6F6B72]">{panel.subtitle}</Drawer.Description>
                    )}
                  </div>
                  <Drawer.Close
                    aria-label="Close"
                    className="ml-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] text-[#333134]"
                  >
                    <X aria-hidden className="size-3.5" strokeWidth={2.2} />
                  </Drawer.Close>
                </div>

                {panel.events.map((event) => (
                  <div key={event.id} className="mb-3.5 rounded-2xl bg-[#FAF9F7] p-4 shadow-[inset_0_0_0_1px_#E9E1D2]">
                    <p className="text-sm font-medium text-[#333134]">{event.title}</p>
                    {event.note && <p className="mt-1 text-[13px] text-[#6F6B72]">{event.note}</p>}
                    <div className="mt-3.5 flex gap-2">
                      <Link
                        href={event.guestListHref}
                        className="flex h-[38px] items-center rounded-full bg-[#F5032D] px-[15px] text-[13px] font-medium text-white"
                      >
                        See the guest list
                      </Link>
                      <Link
                        href={event.scanHref}
                        className="flex h-[38px] items-center rounded-full bg-white px-[15px] text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]"
                      >
                        Scan tickets
                      </Link>
                    </div>
                  </div>
                ))}

                {panel.events.length === 0 && (
                  <p className="mb-3.5 rounded-2xl bg-[#FAF9F7] p-5 text-[13.5px] leading-[1.6] text-[#6F6B72]">
                    Nobody has booked this date. It is still open for anyone who finds your listing.
                  </p>
                )}

                <button
                  type="button"
                  onClick={onToggleBlock}
                  disabled={panel.past && !panel.blocked}
                  className="mb-2.5 h-11 w-full cursor-pointer rounded-full bg-white text-[13.5px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:text-[#BDBDBD] disabled:hover:bg-white"
                >
                  {panel.blockLabel}
                </button>
                <p className="text-xs leading-[1.6] text-[#A09DA3]">
                  Blocking a date only stops new bookings. Anyone who already booked still comes.
                </p>
              </>
            )}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
