import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostHomeViewModel } from "../view-model/use-host-home-view-model";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";
const EYEBROW = "text-[11px] font-medium tracking-[0.06em] text-[#F5032D] uppercase";

// The templates on a new host's Home. Each one opens the builder with a draft filled in.
export function HostHomeTemplatesView({ templates }: { templates: HostHomeViewModel["templates"] }) {
  return (
    <>
      <h2 className="mb-4 text-base font-medium text-[#333134]">{templates.heading}</h2>
      <div className="mb-[34px] grid gap-4 md:grid-cols-3">
        {templates.items.map((template) => (
          <div key={template.id} className={cn(CARD, "flex flex-col overflow-hidden")}>
            <div className="relative h-[132px] w-full">
              <Image src={template.imageUrl} alt="" fill sizes="300px" className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col p-[15px]">
              <p className={EYEBROW}>{template.eyebrow}</p>
              <p className="mt-[7px] text-[15px] leading-[1.3] font-medium text-[#333134]">{template.title}</p>
              <p className="mt-1.5 text-[13px] leading-normal text-pretty text-[#6F6B72]">{template.sub}</p>
              <p className="mt-2.5 text-[13px] font-medium text-[#333134]">{template.money}</p>
              <Link
                href={template.href}
                className="mt-3.5 flex h-10 items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] hover:bg-[#F5F5F5]"
              >
                Use this template
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
