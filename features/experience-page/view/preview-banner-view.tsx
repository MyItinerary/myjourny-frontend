import { Eye } from "lucide-react";

/** The strip across the top of a preview: whose eyes it's for, and the way out. */
export function PreviewBannerView({ status, onClose }: { status: string; onClose: () => void }) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-[16px] bg-primary px-4 py-3 text-primary-foreground lg:px-6"
    >
      <p className="flex items-start gap-2 font-sans text-sm">
        <Eye className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <strong className="font-semibold">Preview{status ? ` · ${status}` : ""}</strong>
          <span className="opacity-80"> — this is how travellers will see it. Only you can open this page.</span>
        </span>
      </p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-current px-4 py-1.5 font-sans text-sm font-medium"
      >
        Close preview
      </button>
    </div>
  );
}
