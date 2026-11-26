import { Lightbulb } from "lucide-react";

const SUPPORT_EMAIL = "support@myjourny.app";

// Beside the category step: why picking the right ones matters, and who to ask.
export function HostBuilderCategoryTipView() {
  return (
    <aside
      aria-label="Why categories and tags matter"
      className="animate-in fade-in slide-in-from-right-4 rounded-2xl bg-[#FAF9F7] p-4 shadow-[inset_0_0_0_1px_#E9E1D2] duration-500"
    >
      <div className="mb-3 flex items-start gap-2.5">
        <Lightbulb aria-hidden className="mt-px size-[18px] shrink-0 text-[#333134]" />
        <h3 className="text-[13.5px] leading-snug font-medium text-[#333134]">Why this matters</h3>
      </div>
      <div className="flex flex-col gap-2.5 text-[13px] leading-relaxed text-[#6F6B72]">
        <p>
          <span className="font-medium text-[#333134]">Categories</span> decide which pages your experience shows up on when people
          browse. Pick every one that honestly fits.
        </p>
        <p>
          <span className="font-medium text-[#333134]">Subcategories</span> narrow it down, so someone looking for a cooking class
          doesn&apos;t land on a street food walk.
        </p>
        <p>
          <span className="font-medium text-[#333134]">Tags</span> are what people tap when they know what they want, like small
          group or beginner friendly. The right ones put you in front of guests who are ready to book.
        </p>
      </div>
      <p className="mt-3.5 border-t border-[#E9E1D2] pt-3.5 text-[13px] text-[#6F6B72]">
        Not sure where yours fits?{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#F5032D] underline underline-offset-2">
          Contact support
        </a>
      </p>
    </aside>
  );
}
