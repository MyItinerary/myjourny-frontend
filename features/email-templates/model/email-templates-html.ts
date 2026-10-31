import type {
  BookingCancelledEmailData,
  BookingConfirmedEmailData,
  EmailTemplateId,
  PasswordResetEmailData,
  PaymentConfirmedEmailData,
  TodayReminderEmailData,
  VerifyEmailEmailData,
} from "./email-templates.types";

// Where the exported emails load their images from (myjourny.app/images 404s).
const EMAIL_BASE_URL = "https://myjourny.io";
const LOGO_FULL_URL = `${EMAIL_BASE_URL}/images/email-templates/3.png`;
const HERO_1_FULL_URL = `${EMAIL_BASE_URL}/images/email-templates/1.png`;
const HERO_2_FULL_URL = `${EMAIL_BASE_URL}/images/email-templates/2.png`;

/**
 * Escapes characters that have syntactic meaning in HTML and attributes.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sanitizes URLs for href attributes, strictly allowing only https: and mailto: schemes.
 * Any other scheme (including javascript:, data:, http:) falls back to '#'.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (/^(https:\/\/|mailto:)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return "#";
}

interface ShellOptions {
  heroImageSrc: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  signOffPrefix?: string;
  signOffTeam: string;
  footerNotice: string;
  helpEmail?: string;
  copyright: string;
  bodyHtml: string;
}

function renderEmailShell(opts: ShellOptions): string {
  const {
    heroImageSrc,
    eyebrow,
    title,
    subtitle,
    signOffPrefix,
    signOffTeam,
    footerNotice,
    helpEmail,
    copyright,
    bodyHtml,
  } = opts;

  const escapedTitle = escapeHtml(title) || "MyJourny";
  const escapedEyebrow = escapeHtml(eyebrow) || "MYJOURNY";
  const escapedSubtitle = escapeHtml(subtitle);
  const escapedSignOffTeam = escapeHtml(signOffTeam || "From MyJourny");
  const escapedFooterNotice = escapeHtml(footerNotice);
  const escapedCopyright = escapeHtml(copyright || "© 2026 MyJourny Ltd. Lagos, Nigeria.");
  const safeHelpMailto = helpEmail ? sanitizeUrl(`mailto:${helpEmail}`) : "";
  const escapedHelpEmail = helpEmail ? escapeHtml(helpEmail) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapedTitle}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F4F2EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin:0;padding:24px 12px;background-color:#F4F2EE;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <!-- Main Card Container (600px canvas) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #E0DFDD;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <!-- Hero Header Banner with Logo -->
          <tr>
            <td align="center" style="background-color:#2C0101;background-image:url('${heroImageSrc}');background-size:cover;background-position:center;padding:48px 24px;text-align:center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${LOGO_FULL_URL}" alt="MyJourny" width="180" style="display:block;max-width:180px;height:auto;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.35));" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card Body Content -->
          <tr>
            <td style="padding:32px 28px 28px 28px;">
              <!-- Eyebrow -->
              <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#F5032D;">
                ${escapedEyebrow}
              </p>

              <!-- Heading -->
              <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;font-weight:800;color:#130404;letter-spacing:-0.02em;">
                ${escapedTitle}
              </h1>

              <!-- Subtitle -->
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#6F6B72;">
                ${escapedSubtitle}
              </p>

              <!-- Dynamic Template Body -->
              ${bodyHtml}

              <!-- Sign-off & Social Icons Divider -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px;border-top:1px solid #F4F2EE;padding-top:24px;">
                <tr>
                  <td align="left" style="font-size:13px;color:#6F6B72;line-height:1.5;">
                    ${signOffPrefix ? `<p style="margin:0 0 2px 0;">${escapeHtml(signOffPrefix)}</p>` : ""}
                    <p style="margin:0;font-weight:600;color:#333134;">${escapedSignOffTeam}</p>
                  </td>
                  <td align="right">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-left:8px;">
                          <a href="https://instagram.com/myjournyapp" style="display:inline-block;color:#6F6B72;text-decoration:none;font-size:12px;font-weight:600;">IG</a>
                        </td>
                        <td style="padding-left:12px;">
                          <a href="https://x.com/myjournyapp" style="display:inline-block;color:#6F6B72;text-decoration:none;font-size:12px;font-weight:600;">X</a>
                        </td>
                        <td style="padding-left:12px;">
                          <a href="https://tiktok.com/@myjournyapp" style="display:inline-block;color:#6F6B72;text-decoration:none;font-size:12px;font-weight:600;">TT</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- External Footer -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px;margin-top:24px;text-align:center;">
          <tr>
            <td style="font-size:12px;line-height:1.6;color:#8A868D;text-align:center;">
              <p style="margin:0 0 4px 0;">${escapedFooterNotice}</p>
              ${
                safeHelpMailto
                  ? `<p style="margin:0 0 6px 0;">Need help? <a href="${safeHelpMailto}" style="color:#F5032D;text-decoration:none;font-weight:600;">${escapedHelpEmail}</a></p>`
                  : ""
              }
              <p style="margin:0;font-size:11px;color:#A39FA7;">${escapedCopyright}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generatePasswordResetEmailHtml(data: PasswordResetEmailData): string {
  const safeResetUrl = sanitizeUrl(data.resetUrl);
  const escapedResetUrl = escapeHtml(data.resetUrl);

  const bodyHtml = `
    <!-- CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0 20px 0;text-align:center;">
      <tr>
        <td align="center">
          <a href="${safeResetUrl}" style="display:inline-block;background-color:#F5032D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:9999px;box-shadow:0 2px 4px rgba(245,3,45,0.2);">
            ${escapeHtml(data.buttonLabel)}
          </a>
          <p style="margin:12px 0 0 0;font-size:12px;color:#6F6B72;">
            This link expires in <strong style="color:#130404;">${escapeHtml(data.expiresInMinutes)} minutes</strong> · one-time use only
          </p>
        </td>
      </tr>
    </table>

    <!-- Fallback URL Section -->
    <div style="background-color:#F8F7F5;border-radius:12px;padding:14px 16px;text-align:center;font-size:12px;color:#6F6B72;margin:16px 0;">
      <p style="margin:0 0 4px 0;">Button not working? Paste this into your browser:</p>
      <a href="${safeResetUrl}" style="color:#F5032D;word-break:break-all;text-decoration:underline;font-weight:500;">${escapedResetUrl}</a>
    </div>

    <!-- Security Note -->
    <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#6F6B72;">
      ${escapeHtml(data.securityNote)}
    </p>`;

  return renderEmailShell({
    heroImageSrc: HERO_1_FULL_URL,
    eyebrow: data.eyebrow,
    title: data.title,
    subtitle: data.subtitle,
    signOffPrefix: data.signOffPrefix,
    signOffTeam: data.signOffTeam,
    footerNotice: data.footerNotice,
    helpEmail: data.helpEmail,
    copyright: data.copyright,
    bodyHtml,
  });
}

export function generateBookingConfirmedEmailHtml(data: BookingConfirmedEmailData): string {
  const safeTicketUrl = sanitizeUrl(data.ticketUrl);
  const safeCalendarUrl = data.calendarUrl ? sanitizeUrl(data.calendarUrl) : "";
  const safeManageBookingUrl = sanitizeUrl(data.manageBookingUrl);

  const includedItemsList = data.includedItems
    .map(
      (item) =>
        `<li style="margin-bottom:4px;"><span style="color:#333134;">•</span> ${escapeHtml(item)}</li>`,
    )
    .join("");

  const bodyHtml = `
    <!-- 2x2 Info Grid -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8F7F5;border-radius:16px;padding:16px;margin-bottom:20px;">
      <tr>
        <td width="50%" style="padding:8px 12px;vertical-align:top;">
          <p style="margin:0 0 2px 0;font-size:12px;color:#6F6B72;">Date</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#130404;">${escapeHtml(data.date)}</p>
        </td>
        <td width="50%" style="padding:8px 12px;vertical-align:top;">
          <p style="margin:0 0 2px 0;font-size:12px;color:#6F6B72;">Time</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#130404;">${escapeHtml(data.time)}</p>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:8px 12px;vertical-align:top;">
          <p style="margin:0 0 2px 0;font-size:12px;color:#6F6B72;">Guests</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#130404;">${escapeHtml(data.guestsCount)}</p>
        </td>
        <td width="50%" style="padding:8px 12px;vertical-align:top;">
          <p style="margin:0 0 2px 0;font-size:12px;color:#6F6B72;">Confirmation</p>
          <p style="margin:0;font-size:15px;font-weight:700;letter-spacing:0.04em;color:#130404;">${escapeHtml(data.confirmationCode)}</p>
        </td>
      </tr>
    </table>

    <!-- Primary Action Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align:center;margin:16px 0;">
      <tr>
        <td align="center">
          <a href="${safeTicketUrl}" style="display:inline-block;background-color:#F5032D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:9999px;">
            View my ticket
          </a>
          ${
            safeCalendarUrl
              ? `<div style="margin-top:10px;"><a href="${safeCalendarUrl}" style="color:#6F6B72;font-size:12px;font-weight:500;text-decoration:none;">+ Add to calendar</a></div>`
              : ""
          }
        </td>
      </tr>
    </table>

    <!-- Host Info -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #F4F2EE;padding-top:16px;margin-top:16px;">
      <tr>
        <td style="font-size:14px;font-weight:600;color:#130404;">
          Hosted by ${escapeHtml(data.host.name)} ${data.host.isVerified ? "(Verified Host)" : ""}
        </td>
      </tr>
    </table>

    <!-- What's Included -->
    <div style="margin-top:16px;">
      <h2 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#130404;">What's included</h2>
      <ul style="margin:0;padding-left:16px;font-size:13px;color:#6F6B72;list-style:none;">
        ${includedItemsList}
      </ul>
    </div>

    <!-- Cancellation Notice Box -->
    <div style="background-color:#F4F2EE;border-radius:12px;padding:12px 16px;font-size:12px;color:#333134;margin-top:16px;">
      Free to cancel until <strong style="color:#130404;">${escapeHtml(data.cancelUntilText)}</strong>. 
      <a href="${safeManageBookingUrl}" style="color:#801414;font-weight:600;text-decoration:underline;">Manage booking</a>
    </div>

    <!-- Explorer Note -->
    <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#6F6B72;">
      ${escapeHtml(data.explorerCountNote)}
    </p>`;

  return renderEmailShell({
    heroImageSrc: HERO_2_FULL_URL,
    eyebrow: data.eyebrow,
    title: data.title,
    subtitle: data.subtitle,
    signOffPrefix: data.signOffPrefix,
    signOffTeam: data.signOffTeam,
    footerNotice: data.footerNotice,
    helpEmail: data.helpEmail,
    copyright: data.copyright,
    bodyHtml,
  });
}

export function generateTodayReminderEmailHtml(data: TodayReminderEmailData): string {
  const safeDirectionsUrl = sanitizeUrl(data.directionsUrl);

  const includedItemsList = data.includedItems
    .map(
      (item) =>
        `<li style="margin-bottom:4px;"><span style="color:#333134;">•</span> ${escapeHtml(item)}</li>`,
    )
    .join("");

  const bodyHtml = `
    <!-- Highlight Box -->
    <div style="background-color:#F8F7F5;border:1px solid #E0DFDD;border-radius:14px;padding:16px;font-size:13px;color:#333134;margin-bottom:16px;">
      <p style="margin:0 0 6px 0;font-weight:700;color:#130404;">${escapeHtml(data.timeAndDuration)}</p>
      <p style="margin:0 0 6px 0;">${escapeHtml(data.meetingPoint)}</p>
      <p style="margin:0 0 6px 0;"><span>${escapeHtml(data.contactNote)}</span> <strong style="color:#E04F16;">${escapeHtml(data.contactPhone)}</strong></p>
      <p style="margin:0;color:#6F6B72;font-size:12px;">${escapeHtml(data.bringNote)}</p>
    </div>

    <!-- Check-in Code Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border:1px solid #E0DFDD;border-radius:12px;padding:12px 16px;margin-bottom:16px;">
      <tr>
        <td style="font-size:13px;color:#6F6B72;">Check-in code</td>
        <td align="right" style="font-size:17px;font-weight:800;letter-spacing:0.06em;color:#130404;">
          ${escapeHtml(data.checkInCode)}
        </td>
      </tr>
    </table>

    <!-- Primary Action Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align:center;margin:16px 0;">
      <tr>
        <td align="center">
          <a href="${safeDirectionsUrl}" style="display:inline-block;background-color:#F5032D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:9999px;">
            Directions and check-in
          </a>
        </td>
      </tr>
    </table>

    <!-- Location Card -->
    <div style="background-color:#F7F5F0;border:1px solid #E0DFDD;border-radius:14px;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px;text-align:center;background-color:#ECE8E1;font-weight:700;font-size:13px;color:#130404;">
        📍 ${escapeHtml(data.locationName)}, ${escapeHtml(data.locationState)}
      </div>
    </div>

    <!-- Host Info -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #F4F2EE;padding-top:16px;margin-top:16px;">
      <tr>
        <td style="font-size:14px;font-weight:600;color:#130404;">
          Hosted by ${escapeHtml(data.host.name)} ${data.host.isVerified ? "(Verified Host)" : ""}
        </td>
      </tr>
    </table>

    <!-- What's Included -->
    <div style="margin-top:16px;">
      <h2 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#130404;">What's included</h2>
      <ul style="margin:0;padding-left:16px;font-size:13px;color:#6F6B72;list-style:none;">
        ${includedItemsList}
      </ul>
    </div>

    <!-- WhatsApp Note -->
    <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#6F6B72;">
      ${escapeHtml(data.whatsappNote)}
    </p>`;

  return renderEmailShell({
    heroImageSrc: HERO_2_FULL_URL,
    eyebrow: data.eyebrow,
    title: data.title,
    subtitle: data.subtitle,
    signOffPrefix: data.signOffPrefix,
    signOffTeam: data.signOffTeam,
    footerNotice: data.footerNotice,
    helpEmail: data.helpEmail,
    copyright: data.copyright,
    bodyHtml,
  });
}

export function generatePaymentConfirmedEmailHtml(data: PaymentConfirmedEmailData): string {
  const safeReceiptUrl = sanitizeUrl(data.downloadReceiptUrl);
  const safeBillingMailto = sanitizeUrl(`mailto:${data.billingEmail}`);
  const escapedBillingEmail = escapeHtml(data.billingEmail);

  const bodyHtml = `
    <!-- Total Charged Box -->
    <div style="background-color:#F4F2EE;border-radius:16px;padding:22px;text-align:center;margin-bottom:20px;">
      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:0.08em;color:#6F6B72;text-transform:uppercase;">TOTAL CHARGED</p>
      <p style="margin:0;font-size:32px;font-weight:800;color:#130404;">${escapeHtml(data.totalChargedFormatted)}</p>
    </div>

    <!-- Line Item Breakdown -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;margin-bottom:20px;">
      <tr>
        <td style="padding-bottom:10px;">
          <p style="margin:0 0 2px 0;font-weight:600;color:#130404;">${escapeHtml(data.experienceTitle)}</p>
          <p style="margin:0;font-size:12px;color:#6F6B72;">${escapeHtml(data.guestsBreakdown)}</p>
        </td>
        <td align="right" style="padding-bottom:10px;font-weight:600;color:#130404;">
          ${escapeHtml(data.itemPriceFormatted)}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:1px solid #E0DFDD;padding-top:10px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-weight:700;color:#130404;">Total</td>
              <td align="right" style="font-weight:700;color:#130404;">${escapeHtml(data.totalPriceFormatted)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Payment Meta Table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8F7F5;border:1px solid #E0DFDD;border-radius:14px;padding:16px;font-size:13px;margin-bottom:20px;">
      <tr>
        <td style="padding:4px 0;color:#6F6B72;">Payment method</td>
        <td align="right" style="padding:4px 0;font-weight:600;color:#130404;">${escapeHtml(data.paymentMethod)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6F6B72;">Date charged</td>
        <td align="right" style="padding:4px 0;font-weight:600;color:#130404;">${escapeHtml(data.dateCharged)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6F6B72;">Receipt number</td>
        <td align="right" style="padding:4px 0;font-weight:600;color:#130404;">${escapeHtml(data.receiptNumber)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6F6B72;">Check-in code</td>
        <td align="right" style="padding:4px 0;font-weight:800;letter-spacing:0.04em;color:#130404;">${escapeHtml(data.checkInCode)}</td>
      </tr>
    </table>

    <!-- Primary Action Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align:center;margin:16px 0;">
      <tr>
        <td align="center">
          <a href="${safeReceiptUrl}" style="display:inline-block;background-color:#F5032D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:9999px;">
            Download receipt
          </a>
        </td>
      </tr>
    </table>

    <!-- Questions Note -->
    <p style="margin:16px 0 0 0;font-size:12px;color:#6F6B72;">
      Questions about this charge? <a href="${safeBillingMailto}" style="color:#F5032D;text-decoration:underline;font-weight:500;">${escapedBillingEmail}</a>
    </p>`;

  return renderEmailShell({
    heroImageSrc: HERO_1_FULL_URL,
    eyebrow: data.eyebrow,
    title: data.title,
    subtitle: data.subtitle,
    signOffPrefix: data.signOffPrefix,
    signOffTeam: data.signOffTeam,
    footerNotice: data.footerNotice,
    copyright: data.copyright,
    bodyHtml,
  });
}

export function generateBookingCancelledEmailHtml(data: BookingCancelledEmailData): string {
  const safeBrowseUrl = sanitizeUrl(data.browseUrl);
  const safeBillingMailto = sanitizeUrl(`mailto:${data.billingEmail}`);
  const escapedBillingEmail = escapeHtml(data.billingEmail);

  const bodyHtml = `
    <!-- Refund Summary Table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8F7F5;border:1px solid #E0DFDD;border-radius:14px;padding:16px;font-size:13px;margin-bottom:16px;">
      <tr>
        <td style="padding:4px 0;color:#6F6B72;">Cancelled by</td>
        <td align="right" style="padding:4px 0;font-weight:600;color:#130404;">${escapeHtml(data.cancelledBy)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6F6B72;">Refund amount</td>
        <td align="right" style="padding:4px 0;font-weight:800;color:#130404;">${escapeHtml(data.refundAmountFormatted)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6F6B72;">Refund status</td>
        <td align="right" style="padding:4px 0;font-weight:600;color:#130404;">${escapeHtml(data.refundStatus)}</td>
      </tr>
    </table>

    <!-- Policy Note -->
    <p style="margin:0 0 20px 0;font-size:12px;line-height:1.6;color:#6F6B72;">
      ${escapeHtml(data.policyNote)}
    </p>

    <!-- Browse CTA Section -->
    <div style="border-top:1px solid #F4F2EE;padding-top:20px;text-align:center;">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:500;color:#6F6B72;">
        ${escapeHtml(data.browsePrompt)}
      </p>
      <a href="${safeBrowseUrl}" style="display:inline-block;background-color:#F5032D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:9999px;">
        Browse experiences
      </a>
    </div>

    <!-- Help Discrepancy Note -->
    <p style="margin:20px 0 0 0;font-size:12px;color:#6F6B72;">
      Think this isn't right? <a href="${safeBillingMailto}" style="color:#F5032D;text-decoration:underline;font-weight:500;">${escapedBillingEmail}</a>
    </p>`;

  return renderEmailShell({
    heroImageSrc: HERO_1_FULL_URL,
    eyebrow: data.eyebrow,
    title: data.title,
    subtitle: data.subtitle,
    signOffPrefix: data.signOffPrefix,
    signOffTeam: data.signOffTeam,
    footerNotice: data.footerNotice,
    helpEmail: data.helpEmail,
    copyright: data.copyright,
    bodyHtml,
  });
}

export function generateVerifyEmailHtml(data: VerifyEmailEmailData): string {
  const safeVerifyUrl = sanitizeUrl(data.verifyUrl);
  const escapedVerifyUrl = escapeHtml(data.verifyUrl);

  const bodyHtml = `
    <!-- Primary Action Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0 20px 0;text-align:center;">
      <tr>
        <td align="center">
          <a href="${safeVerifyUrl}" style="display:inline-block;background-color:#F5032D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:9999px;">
            ${escapeHtml(data.buttonLabel)}
          </a>
          <p style="margin:12px 0 0 0;font-size:12px;color:#6F6B72;">
            This link expires in <strong style="color:#130404;">${escapeHtml(data.expiresInHours)} hours</strong>
          </p>
        </td>
      </tr>
    </table>

    <!-- Fallback URL Section -->
    <div style="background-color:#F8F7F5;border-radius:12px;padding:14px 16px;text-align:center;font-size:12px;color:#6F6B72;margin:16px 0;">
      <p style="margin:0 0 4px 0;">Button not working? Paste this into your browser:</p>
      <a href="${safeVerifyUrl}" style="color:#F5032D;word-break:break-all;text-decoration:underline;font-weight:500;">${escapedVerifyUrl}</a>
    </div>

    <!-- Discovery & Unrecognized Notes -->
    <div style="margin-top:16px;font-size:12px;line-height:1.6;color:#6F6B72;">
      <p style="margin:0 0 8px 0;">${escapeHtml(data.discoveryNote)}</p>
      <p style="margin:0;">${escapeHtml(data.unrecognizedNote)}</p>
    </div>`;

  return renderEmailShell({
    heroImageSrc: HERO_1_FULL_URL,
    eyebrow: data.eyebrow,
    title: data.title,
    subtitle: data.subtitle,
    signOffPrefix: data.signOffPrefix,
    signOffTeam: data.signOffTeam,
    footerNotice: data.footerNotice,
    helpEmail: data.helpEmail,
    copyright: data.copyright,
    bodyHtml,
  });
}

export interface GenerateEmailHtmlContext {
  passwordResetData: PasswordResetEmailData;
  bookingConfirmedData: BookingConfirmedEmailData;
  todayReminderData: TodayReminderEmailData;
  paymentConfirmedData: PaymentConfirmedEmailData;
  bookingCancelledData: BookingCancelledEmailData;
  verifyEmailData: VerifyEmailEmailData;
}

export function generateEmailHtmlForTemplate(
  templateId: EmailTemplateId,
  context: GenerateEmailHtmlContext,
): string {
  switch (templateId) {
    case "password-reset":
      return generatePasswordResetEmailHtml(context.passwordResetData);
    case "booking-confirmed":
      return generateBookingConfirmedEmailHtml(context.bookingConfirmedData);
    case "today-reminder":
      return generateTodayReminderEmailHtml(context.todayReminderData);
    case "payment-confirmed":
      return generatePaymentConfirmedEmailHtml(context.paymentConfirmedData);
    case "booking-cancelled":
      return generateBookingCancelledEmailHtml(context.bookingCancelledData);
    case "verify-email":
      return generateVerifyEmailHtml(context.verifyEmailData);
    default:
      return generatePasswordResetEmailHtml(context.passwordResetData);
  }
}
