import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";

const faint = "text-[#BDBDBD]";

// What the guest sees, redrawn as the host types.
export function HostBuilderPreviewView({ vm }: { vm: HostListingBuilderViewModel }) {
  const { draft, derived } = vm;
  const p = derived.preview;
  const cover = draft.photos[draft.cover] ?? draft.photos[0];
  return (
    <aside aria-label="What the guest sees" className="hidden w-[380px] shrink-0 flex-col overflow-y-auto bg-[#FCFCFC] p-5 shadow-[inset_1px_0_0_#E7E7E7] xl:flex">
      <div className="mb-3.5 flex items-center">
        <span className="text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">What the guest sees</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-[#0CBA65]">
          <span aria-hidden className="size-1.5 rounded-full bg-[#0CBA65]" />
          Live
        </span>
      </div>
      <div className="overflow-hidden rounded-[20px] bg-white shadow-[inset_0_0_0_1px_#E7E7E7]">
        <div className="relative h-[200px] bg-[#F4F2EE]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local preview of a file the host just picked
            <img src={cover} alt="Cover" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-[#A09DA3]">Your cover photo shows here</div>
          )}
        </div>
        <div className="p-4">
          <div className="text-[11px] font-medium tracking-[0.06em] text-[#F5032D]">{p.eyebrow}</div>
          <div className={`mt-1.5 font-heading text-[19px] leading-tight font-extrabold text-pretty ${draft.title ? "text-[#333134]" : faint}`}>
            {draft.title || "Your title goes here"}
          </div>
          <div className={`mt-1 text-[13px] leading-normal text-pretty ${draft.hook ? "text-[#6F6B72]" : faint}`}>
            {draft.hook || "Your one line, the bit people read first"}
          </div>
          <div className="mt-2.5 text-[12.5px] text-[#6F6B72]">{p.meta}</div>
          <p className="mt-3.5 text-[13px] leading-relaxed text-[#333134]">{p.description}</p>
          <div className="mt-4">
            <div className="mb-2 text-[13px] font-medium">Where you meet</div>
            <div className="flex gap-2.5">
              {draft.meetPhoto && (
                // eslint-disable-next-line @next/next/no-img-element -- a local preview of a file the host just picked
                <img src={draft.meetPhoto} alt="Meeting point" className="size-14 rounded-xl object-cover" />
              )}
              <div>
                <div className={`text-[13.5px] font-medium ${draft.cue ? "text-[#333134]" : faint}`}>{draft.cue || "The landmark you meet at"}</div>
                <div className="mt-0.5 text-xs text-[#6F6B72]">{p.area}</div>
              </div>
            </div>
          </div>
          {p.included.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="text-[13px] font-medium">What&apos;s included</div>
              {p.included.map((line, i) => (
                <div key={`${line}-${i}`} className="text-[13px] text-[#6F6B72]">{line}</div>
              ))}
            </div>
          )}
          {draft.quote && (
            <div className="mt-4 rounded-[14px] bg-[#F4F2EE] p-3.5">
              <div className="text-[13.5px] leading-normal">&ldquo;{draft.quote}&rdquo;</div>
              <div className="mt-1.5 text-xs text-[#6F6B72]">Your host</div>
            </div>
          )}
        </div>
        <div className="flex items-center px-4 py-3.5 shadow-[inset_0_1px_0_#E7E7E7]">
          <div>
            <div className={`font-heading text-lg font-extrabold ${draft.price ? "text-[#333134]" : faint}`}>{p.price}</div>
            <div className="text-xs text-[#6F6B72]">per person</div>
          </div>
          <span className="ml-auto rounded-full bg-[#F5032D] px-[18px] py-2.5 text-sm font-medium text-white">{p.bookLabel}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#6F6B72]">This panel is the guest&apos;s view of your listing. It changes as you type.</p>
    </aside>
  );
}
