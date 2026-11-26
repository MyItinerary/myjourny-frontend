import { Check, X } from "lucide-react";

const TIPS = [
  "Pick bright photos that show people taking part, not empty places.",
  "Put your best photo first. It's the one people see in search.",
  "Use real photos, so guests know what to expect: the place, the group size and any transport.",
];
const DO = ["Landscape photos", "At least 1200 pixels wide", "JPG or PNG", "Up to 10 MB each"];
const DONT = ["Watermarks or logos", "AI-generated images", "Stock photos", "Screenshots", "Black and white photos", "Portrait (upright) photos"];

// Beside the photos step: what makes a good photo, and what we send back.
export function HostBuilderPhotoTipsView() {
  return (
    <aside aria-label="Photo tips" className="rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_#E7E7E7]">
      <h3 className="text-base font-medium text-[#333134]">Photo tips</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6F6B72]">
        Guests often decide from your photos alone. Pick ones that show what the experience is really like.
      </p>
      <ul className="mt-4 flex list-disc flex-col gap-2 border-t border-[#F0F0F0] pt-4 pl-4 text-[13px] leading-relaxed text-[#333134]">
        {TIPS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="mt-5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F0FCF5] px-2 py-1 text-[13px] font-medium text-[#0B8A4C]">
          <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
          Do
        </span>
        <ul aria-label="Do" className="mt-2.5 flex list-disc flex-col gap-1.5 pl-4 text-[13px] text-[#333134]">
          {DO.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FEF2F3] px-2 py-1 text-[13px] font-medium text-[#C8022A]">
          <X aria-hidden className="size-3.5" strokeWidth={2.5} />
          Don&apos;t
        </span>
        <ul aria-label="Don't" className="mt-2.5 flex list-disc flex-col gap-1.5 pl-4 text-[13px] text-[#333134]">
          {DONT.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
