import { cn } from "@/lib/utils";

import type { HostProfileViewModel, ProfileNavItem } from "../view-model/use-host-profile-view-model";
import {
  DangerCard,
  NotificationsTable,
  PayoutsSection,
  PreviewCard,
  RowList,
  SetupCard,
  TaxSection,
} from "./host-profile-sections-view";

const ICONS: Record<ProfileNavItem["icon"], string> = {
  person: "M12 11.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM5 20.2a7 7 0 0 1 14 0",
  card: "M4 6.5h16v11H4zM4 10.5h16M15.5 14.5h2.5",
  shield: "M12 3l7 2.6v5.2c0 4.2-2.8 7.4-7 9.2-4.2-1.8-7-5-7-9.2V5.6z",
  bell: "M7 10a5 5 0 0 1 10 0v3.4l1.6 2.6H5.4L7 13.4zM10 19a2 2 0 0 0 4 0",
  doc: "M6.5 3.5h7L18 8v12.5H6.5zM13.5 3.5V8H18",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.2 9.5h17.6M3.2 14.5h17.6M12 3c2.4 2.6 2.4 15.4 0 18M12 3c-2.4 2.6-2.4 15.4 0 18",
};

function NavIcon({ name }: { name: ProfileNavItem["icon"] }) {
  return (
    <svg aria-hidden width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={ICONS[name]} />
    </svg>
  );
}

// Handoff "Listing Builder" prototype, Profile: seven panes down the left, the
// open one on the right. The same page serves a host who has finished setting
// up and one who hasn't.
export function HostProfileView({ vm }: { vm: HostProfileViewModel }) {
  return (
    <div className="flex min-h-0 flex-1 bg-white">
      <nav aria-label="Profile sections" className="w-[288px] shrink-0 overflow-y-auto px-[18px] py-[26px] shadow-[inset_-1px_0_0_#E7E7E7]">
        <div className="flex flex-col gap-0.5">
          {vm.nav.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-current={item.active ? "page" : undefined}
              onClick={() => vm.onPane(item.key)}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#333134] hover:bg-[#FAF9F7]",
                item.active ? "bg-[#F4F2EE] font-medium hover:bg-[#F4F2EE]" : "font-normal",
              )}
            >
              <span className={item.active ? "text-[#333134]" : "text-[#6F6B72]"}>
                <NavIcon name={item.icon} />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <span className="rounded-full bg-[#FDF7EB] px-2 py-[3px] text-[10.5px] font-medium text-[#B4760A]">{item.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto pt-[26px] pb-[90px]">
        <div className="max-w-[720px] px-10">
          <h2 className="mb-1.5 font-heading text-[26px] font-extrabold text-[#333134]">{vm.title}</h2>
          <p className="mb-[26px] text-[14.5px] leading-[1.6] text-pretty text-[#6F6B72]">{vm.subtitle}</p>

          {vm.setup && <SetupCard setup={vm.setup} />}
          <RowList vm={vm} />
          {vm.preview && <PreviewCard preview={vm.preview} />}
          {vm.notifications && <NotificationsTable notifications={vm.notifications} />}
          {vm.payouts && <PayoutsSection payouts={vm.payouts} />}
          {vm.tax && <TaxSection tax={vm.tax} />}
          {vm.danger && <DangerCard danger={vm.danger} />}
        </div>
      </div>
    </div>
  );
}
