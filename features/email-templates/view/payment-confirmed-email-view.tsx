import {
  EMAIL_HERO_1_SRC,
  EMAIL_LOGO_SRC,
  type PaymentConfirmedEmailData,
} from "../model/email-templates.types";
import { EmailTemplateShellView } from "./email-template-shell-view";

export interface PaymentConfirmedEmailViewProps {
  data: PaymentConfirmedEmailData;
  className?: string;
  maxWidthClass?: string;
}

export function PaymentConfirmedEmailView({
  data,
  className,
  maxWidthClass,
}: PaymentConfirmedEmailViewProps) {
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
      footerCopyright={data.copyright}
      className={className}
      maxWidthClass={maxWidthClass}
    >
      {/* Big Total Charged Box */}
      <div className="rounded-2xl bg-[#F4F2EE] px-4 py-5.5 text-center sm:py-6">
        <p className="font-sans text-[11px] font-semibold tracking-wider text-[#6F6B72] uppercase sm:text-xs">
          TOTAL CHARGED
        </p>
        <p className="mt-1 font-sans text-3xl font-extrabold text-[#130404] sm:text-4xl">
          {data.totalChargedFormatted}
        </p>
      </div>

      {/* Line Item Receipt */}
      <div className="space-y-3 font-sans text-xs sm:text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-[#130404]">{data.experienceTitle}</p>
            <p className="text-xs text-[#6F6B72]">{data.guestsBreakdown}</p>
          </div>
          <span className="shrink-0 font-semibold text-[#130404]">
            {data.itemPriceFormatted}
          </span>
        </div>

        <div className="border-t border-[#E0DFDD]" />

        <div className="flex items-center justify-between font-bold text-[#130404]">
          <span>Total</span>
          <span>{data.totalPriceFormatted}</span>
        </div>
      </div>

      {/* Payment Meta Table */}
      <div className="space-y-2 rounded-xl border border-[#E0DFDD]/70 bg-[#F8F7F5] p-4 font-sans text-xs sm:text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#6F6B72]">Payment method</span>
          <span className="font-medium text-[#130404]">{data.paymentMethod}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6F6B72]">Date charged</span>
          <span className="font-medium text-[#130404]">{data.dateCharged}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6F6B72]">Receipt number</span>
          <span className="font-medium text-[#130404]">{data.receiptNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6F6B72]">Check-in code</span>
          <span className="font-extrabold tracking-wider text-[#130404]">
            {data.checkInCode}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 text-center">
        <a
          href={data.downloadReceiptUrl}
          className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#F5032D] px-8 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d90328] active:scale-[0.99]"
        >
          Download receipt
        </a>
      </div>

      {/* Questions Prompt */}
      <p className="font-sans text-xs text-[#6F6B72]">
        Questions about this charge?{" "}
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
