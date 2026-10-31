"use client";

import { Dialog } from "@base-ui/react/dialog";

import type { DeleteDialog } from "../view-model/use-host-listings-view-model";

export function DeleteDialogView({ dialog, onClose, onConfirm }: { dialog: DeleteDialog | null; onClose: () => void; onConfirm: () => void }) {
  const title = dialog?.kind === "blocked" ? "You cannot delete this one yet" : `Delete ${dialog?.title ?? ""} for good`;
  const outline = "h-11 cursor-pointer rounded-full bg-white px-[18px] text-sm font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]";

  return (
    <Dialog.Root open={dialog !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#2C0101]/[0.32] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="w-full max-w-[520px] rounded-2xl bg-white p-7 outline-none transition-[opacity,scale] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {dialog && (
              <>
                <Dialog.Title className="mb-3 font-heading text-[22px] leading-tight font-extrabold text-[#333134]">{title}</Dialog.Title>
                <Dialog.Description className="mb-[18px] text-[14.5px] leading-[1.6] text-pretty text-[#6F6B72]">
                  {dialog.kind === "blocked"
                    ? `${dialog.title} has ${dialog.upcoming} ${dialog.upcoming === 1 ? "booking" : "bookings"} still to come. Deleting it would cancel ${dialog.upcoming === 1 ? "it" : "them all"} and every guest would be refunded against your name.`
                    : `There are no bookings to come, so nobody is affected today. But this also deletes its past bookings and reviews${dialog.rating ? `, and the ${dialog.rating} rating attached to it` : ""}. That cannot be undone and it does not move to another listing.`}
                </Dialog.Description>
                <p className="mb-[22px] rounded-[14px] bg-[#FAF9F7] p-3.5 text-[13.5px] leading-[1.6] text-[#333134] shadow-[inset_0_0_0_1px_#E9E1D2]">
                  {dialog.kind === "blocked"
                    ? "Hide it instead. It comes off search straight away, nobody new can book, and the bookings you already have still happen."
                    : "Archiving keeps the reviews and the history, takes it off search, and lets you copy it into a new listing later."}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="h-11 cursor-pointer rounded-full bg-[#F5032D] px-5 text-sm font-medium text-white"
                  >
                    {dialog.kind === "blocked" ? "Hide it instead" : "Archive it instead"}
                  </button>
                  <button type="button" onClick={onClose} className={outline}>
                    {dialog.kind === "blocked" ? "Leave it alone" : "Cancel"}
                  </button>
                  {dialog.kind === "blocked" ? (
                    <button
                      type="button"
                      disabled
                      className="ml-auto h-11 cursor-not-allowed rounded-full bg-[#F5F5F5] px-[18px] text-sm font-medium text-[#BDBDBD]"
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onConfirm}
                      className="ml-auto h-11 cursor-pointer rounded-full bg-white px-[18px] text-sm font-medium text-[#F5032D] shadow-[inset_0_0_0_1px_#FACDD3]"
                    >
                      Delete and lose the reviews
                    </button>
                  )}
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

