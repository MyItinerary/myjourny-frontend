import {
  EMAIL_HERO_1_SRC,
  EMAIL_LOGO_SRC,
  type PasswordResetEmailData,
} from "../model/email-templates.types";
import { EmailTemplateShellView } from "./email-template-shell-view";

export interface PasswordResetEmailViewProps {
  data: PasswordResetEmailData;
  className?: string;
  maxWidthClass?: string;
}

export function PasswordResetEmailView({
  data,
  className,
  maxWidthClass,
}: PasswordResetEmailViewProps) {
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
      {/* Primary Action Button */}
      <div className="pt-1 pb-3 text-center">
        <a
          href={data.resetUrl}
          className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#F5032D] px-8 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d90328] active:scale-[0.99]"
        >
          {data.buttonLabel}
        </a>

        {/* Expiry Note */}
        <p className="mt-3.5 font-sans text-xs text-[#6F6B72]">
          This link expires in{" "}
          <strong className="font-semibold text-[#130404]">{data.expiresInMinutes} minutes</strong>{" "}
          · one-time use only
        </p>
      </div>

      {/* Fallback URL section */}
      <div className="rounded-xl bg-[#F8F7F5] p-3.5 text-center text-xs text-[#6F6B72]">
        <p className="mb-1">Button not working? Paste this into your browser:</p>
        <a
          href={data.resetUrl}
          className="font-medium text-[#F5032D] break-all hover:underline"
        >
          {data.resetUrl}
        </a>
      </div>

      {/* Security Reassurance */}
      <p className="font-sans text-xs leading-relaxed text-[#6F6B72]">
        {data.securityNote}
      </p>
    </EmailTemplateShellView>
  );
}
