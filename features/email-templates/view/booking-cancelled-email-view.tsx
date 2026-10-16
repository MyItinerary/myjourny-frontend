import {
  EMAIL_HERO_1_SRC,
  EMAIL_LOGO_SRC,
  type BookingCancelledEmailData,
} from "../model/email-templates.types";
import { EmailTemplateShellView } from "./email-template-shell-view";

export interface BookingCancelledEmailViewProps {
  data: BookingCancelledEmailData;
  className?: string;
  maxWidthClass?: string;
}

export function BookingCancelledEmailView({
  data,
  className,
  maxWidthClass,
}: BookingCancelledEmailViewProps) {
  return (
    <EmailTemplateShellView
      heroImageSrc={EMAIL_HERO_1_SRC}
      logoSrc={EMAIL_LOGO_SRC}
      eyebrow={data.eyebrow}
      title={data.title}
      subtitle={data.subtitle}
      signOffPrefix={data.signOffPrefix}
      signOffTeam={data.signOffTeam}
      footerNotice={data.footerNotice}
      footerHelpEmail={data.helpEmail}
      footerCopyright={data.copyright}
      className={className}
      maxWidthClass={maxWidthClass}
    >
      {/* Refund Summary Table */}
      <div className="space-y-2.5 rounded-xl border border-[#E0DFDD]/70 bg-[#F8F7F5] p-4 font-sans text-xs sm:text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#6F6B72]">Cancelled by</span>
          <span className="font-semibold text-[#130404]">{data.cancelledBy}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6F6B72]">Refund amount</span>
          <span className="font-extrabold text-[#130404]">{data.refundAmountFormatted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6F6B72]">Refund status</span>
          <span className="font-semibold text-[#130404]">{data.refundStatus}</span>
        </div>
      </div>

      {/* Refund Policy Note */}
      <p className="font-sans text-xs leading-relaxed text-[#6F6B72]">
        {data.policyNote}
      </p>

      {/* Recommendation Prompt & Browse Button */}
      <div className="border-t border-[#F4F2EE] pt-5 text-center">
        <p className="mb-3.5 font-sans text-xs font-medium text-[#6F6B72] sm:text-sm">
          {data.browsePrompt}
        </p>
        <a
          href={data.browseUrl}
          className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#F5032D] px-8 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d90328] active:scale-[0.99]"
        >
          Browse experiences
        </a>
      </div>

      {/* Discrepancy Help Link */}
      <p className="pt-2 font-sans text-xs text-[#6F6B72]">
        Think this isn&apos;t right?{" "}
        <a
          href={`mailto:${data.billingEmail}`}
          className="font-medium text-[#F5032D] hover:underline"
        >
          {data.billingEmail}
        </a>
      </p>
    </EmailTemplateShellView>
  );
}
