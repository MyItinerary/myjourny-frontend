# MyJourny Transactional Email Templates

This directory contains production-ready, table-based responsive HTML email templates designed for MyJourny's transactional messaging pipeline.

The templates use inline CSS and HTML table structures (`role="presentation"`) for maximum compatibility across email clients (Gmail, Apple Mail, Outlook, Yahoo, iOS Mail, Android Mail).

---

## Architecture & Rendering Compatibility

- **Template Engine**: Standard Handlebars / Mustache (`{{variable}}` and conditional blocks `{{#if var}}...{{else}}...{{/if}}`).
- **Engines Supported**: Handlebars (NestJS / Node / Express), Mustache, Jinja2 (Python), Liquid, or simple regex string replacers.
- **Max Width**: `600px` centered canvas with responsive mobile fallback (`width: 100%`).
- **Brand Colors**:
  - Primary Accent / CTA: `#F5032D`
  - Burgundy Header: `#2C0101`
  - Background Canvas: `#F4F2EE`
  - Text Primary: `#130404`
  - Text Muted: `#6F6B72`
- **Hosted Assets**:
  - Logo: `https://myjourny.app/images/email-templates/3.png`
  - Hero 1 (Security / Auth / Billing): `https://myjourny.app/images/email-templates/1.png`
  - Hero 2 (Experiences / Booking): `https://myjourny.app/images/email-templates/2.png`

---

## Template Catalog

| Template File | Trigger Event | Recommended Subject Line |
| :--- | :--- | :--- |
| `password-reset.html` | User requests password reset | `Reset your MyJourny password` |
| `booking-confirmed.html` | Booking confirmed & payment succeeds | `Your booking is confirmed: {{experienceTitle}}` |
| `today-reminder.html` | Morning of experience (e.g. 5:00 AM) | `Today: {{experienceTitle}}, {{time}}` |
| `payment-confirmed.html` | Receipt generation upon successful charge | `Your receipt for {{experienceTitle}}` |
| `booking-cancelled.html` | Cancellation initiated by guest or host | `Booking cancelled: {{experienceTitle}}` |
| `verify-email.html` | New account registration / email change | `Verify your email for MyJourny` |

---

## Data Contracts & Variables

### 1. `password-reset.html`

Sent when a user triggers a password reset flow.

#### Variables
| Variable | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `resetUrl` | `string` | **Yes** | — | Unique, single-use HTTPS reset password URL |
| `buttonLabel` | `string` | No | `Reset password` | Label for the primary CTA button |
| `expiresInMinutes` | `number` | No | `30` | Time before the reset token expires |
| `securityNote` | `string` | No | Security reminder note |
| `eyebrow` | `string` | No | `PASSWORD RESET` | Top banner eyebrow |
| `title` | `string` | No | `Let's get you back in` | Primary card heading |
| `subtitle` | `string` | No | Explanation note | Descriptive paragraph |
| `signOffPrefix` | `string` | No | `See you out there.` | Sign-off prefix line |
| `signOffTeam` | `string` | No | `From MyJourny` | Sender signature |
| `footerNotice` | `string` | No | Automated security notice |
| `helpEmail` | `string` | No | `support@myjourny.app` | Support contact email |
| `copyright` | `string` | No | `© 2026 MyJourny Ltd. Lagos, Nigeria.` | Legal copyright text |

#### Sample JSON Context
```json
{
  "resetUrl": "https://myjourny.app/reset?t=9k2mxa71",
  "buttonLabel": "Reset password",
  "expiresInMinutes": 30,
  "securityNote": "Wasn't you? No action needed, your password stays exactly as it is unless this link gets used.",
  "eyebrow": "PASSWORD RESET",
  "title": "Let's get you back in",
  "subtitle": "Happens to the best of us. Here's your link to set a new password and get back to discovering:",
  "signOffPrefix": "See you out there.",
  "signOffTeam": "From MyJourny",
  "footerNotice": "This is an automated security message, replies to this address aren't monitored.",
  "helpEmail": "support@myjourny.app",
  "copyright": "© 2026 MyJourny Ltd. Lagos, Nigeria."
}
```

---

### 2. `booking-confirmed.html`

Sent immediately upon successful booking confirmation.

#### Variables
| Variable | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `ticketUrl` | `string` | **Yes** | — | Link to digital ticket page |
| `manageBookingUrl`| `string` | **Yes** | — | Link to manage / cancel booking |
| `calendarUrl` | `string` | No | `null` | Google Calendar / ICS download link |
| `date` | `string` | No | `Sat, 24 August` | Formatted date of experience |
| `time` | `string` | No | `6:00 AM · 2.5 hrs`| Time and duration |
| `guestsCount` | `number` | No | `2` | Number of spots booked |
| `confirmationCode`| `string` | No | `MJ-84213` | Human-readable booking code |
| `host.name` | `string` | No | `Kayak Thrills` | Host display name |
| `host.isVerified` | `boolean`| No | `true` | Displays `(Verified Host)` badge |
| `includedItems` | `string[]`| No | Default inclusions | List of included gear/perks |
| `cancelUntilText` | `string` | No | `Sat, 1 August, 6:00 AM` | Free cancellation cutoff |
| `explorerCountNote`| `string`| No | `6 other explorers are joining...` | Social proof / group note |
| `eyebrow` | `string` | No | `BOOKING CONFIRMED` | Top banner eyebrow |
| `title` | `string` | No | `Your next experience starts Saturday` |
| `subtitle` | `string` | No | Subtitle description |

#### Sample JSON Context
```json
{
  "ticketUrl": "https://myjourny.app/bookings/MJ-84213",
  "manageBookingUrl": "https://myjourny.app/bookings/MJ-84213/manage",
  "calendarUrl": "https://myjourny.app/bookings/MJ-84213/calendar",
  "date": "Sat, 24 August",
  "time": "6:00 AM · 2.5 hrs",
  "guestsCount": 2,
  "confirmationCode": "MJ-84213",
  "host": {
    "name": "Kayak Thrills",
    "isVerified": true
  },
  "includedItems": [
    "Kayak, paddle & life jacket.",
    "Safety briefing",
    "Fresh coconut water"
  ],
  "cancelUntilText": "Sat, 1 August, 6:00 AM",
  "explorerCountNote": "6 other explorers are joining this sunrise. See you on the water.",
  "eyebrow": "BOOKING CONFIRMED",
  "title": "Your next experience starts Saturday",
  "subtitle": "Sunrise Kayaking at Tarkwa Bay is locked in. Here's everything you need for the day.",
  "signOffPrefix": "Go make a story,",
  "signOffTeam": "MyJourny team",
  "footerNotice": "This confirms your booking, keep it for your records.",
  "helpEmail": "support@myjourny.app",
  "copyright": "© 2026 MyJourny Ltd. Lagos, Nigeria."
}
```

---

### 3. `today-reminder.html`

Sent early on the day of the experience to provide quick check-in details.

#### Variables
| Variable | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `directionsUrl` | `string` | **Yes** | — | Link to map directions & check-in QR |
| `checkInCode` | `string` | **Yes** | `MJ-84213` | Short check-in code for host |
| `timeAndDuration` | `string` | No | `6:00am, 2.5 hours` | Timing highlight |
| `meetingPoint` | `string` | No | Meeting instructions | Exact rendezvous landmark |
| `contactNote` | `string` | No | `Kayak is in a green vest · ` | Host appearance clue |
| `contactPhone` | `string` | No | `0803 000 0000` | Host phone / WhatsApp |
| `bringNote` | `string` | No | Gear / clothing reminder |
| `locationName` | `string` | No | `Tarkwa Bay` | Destination name |
| `locationState` | `string` | No | `Lagos state` | City / State |
| `host.name` | `string` | No | `Kayak Thrills` | Host name |
| `host.isVerified` | `boolean`| No | `true` | Verified host indicator |
| `includedItems` | `string[]`| No | Array of strings | What host provides |
| `whatsappNote` | `string` | No | Running late note | Guidance for late arrivals |

#### Sample JSON Context
```json
{
  "directionsUrl": "https://myjourny.app/bookings/MJ-84213/directions",
  "checkInCode": "MJ-84213",
  "timeAndDuration": "6:00am, 2.5 hours",
  "meetingPoint": "Tarkwa Bay Jetty, look for the blue boathouse.",
  "contactNote": "Kayak is in a green vest · ",
  "contactPhone": "0803 000 0000",
  "bringNote": "Bring: swimwear or clothes you don't mind getting wet, sunscreen.",
  "locationName": "Tarkwa Bay",
  "locationState": "Lagos state",
  "host": {
    "name": "Kayak Thrills",
    "isVerified": true
  },
  "includedItems": [
    "Kayak, paddle & life jacket.",
    "Safety briefing",
    "Fresh coconut water"
  ],
  "whatsappNote": "Running behind? Message Tobi on WhatsApp, he's expecting you and would rather know.",
  "eyebrow": "TODAY",
  "title": "Today: Sunrise Kayaking, 6:00am",
  "subtitle": "Everything for this morning, in one place.",
  "signOffPrefix": "See you at the jetty,",
  "signOffTeam": "MyJourny team",
  "footerNotice": "This is a copy of what's already in your MyJourny app and WhatsApp.",
  "helpEmail": "support@myjourny.app",
  "copyright": "© 2026 MyJourny Ltd. Lagos, Nigeria."
}
```

---

### 4. `payment-confirmed.html`

Official customer receipt sent upon successful charge.

#### Variables
| Variable | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `totalChargedFormatted` | `string` | **Yes** | `₦32,000` | Grand total with currency symbol |
| `experienceTitle` | `string` | **Yes** | Experience title | Name of experience booked |
| `guestsBreakdown` | `string` | No | `₦16,000 × 2 guests` | Rate × quantity calculation |
| `itemPriceFormatted` | `string` | No | `₦32,000` | Line item total |
| `totalPriceFormatted`| `string` | No | `₦32,000` | Final amount billed |
| `paymentMethod` | `string` | No | `Verve •••• 4821` | Card brand and last 4 digits |
| `dateCharged` | `string` | No | `Fri, 1 August 2026` | Date of charge |
| `receiptNumber` | `string` | **Yes** | `RCP-260801-4213` | Invoice / Receipt number |
| `checkInCode` | `string` | No | `MJ-84213` | Related booking code |
| `downloadReceiptUrl` | `string` | **Yes** | — | PDF or web receipt URL |
| `billingEmail` | `string` | No | `billing@myjourny.app` | Support email for billing inquiries |

#### Sample JSON Context
```json
{
  "totalChargedFormatted": "₦32,000",
  "experienceTitle": "Sunrise Kayaking at Tarkwa Bay",
  "guestsBreakdown": "₦16,000 × 2 guests",
  "itemPriceFormatted": "₦32,000",
  "totalPriceFormatted": "₦32,000",
  "paymentMethod": "Verve •••• 4821",
  "dateCharged": "Fri, 1 August 2026",
  "receiptNumber": "RCP-260801-4213",
  "checkInCode": "MJ-84213",
  "downloadReceiptUrl": "https://myjourny.app/receipts/RCP-260801-4213",
  "billingEmail": "billing@myjourny.app",
  "eyebrow": "PAYMENT CONFIRMED",
  "title": "You're all set for Tarkwa Bay",
  "subtitle": "Your payment for Sunrise Kayaking at Tarkwa Bay has gone through. Here's your receipt.",
  "signOffTeam": "MyJourny team",
  "footerNotice": "Keep this receipt for your records, it may be used for expense or tax purposes. MyJourny Ltd is the merchant of record for this transaction.",
  "copyright": "© 2026 MyJourny Ltd. Lagos, Nigeria."
}
```

---

### 5. `booking-cancelled.html`

Sent when a booking is cancelled, explaining the refund breakdown and status.

#### Variables
| Variable | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `cancelledBy` | `string` | No | `You, 3 days ago` | Who initiated cancellation |
| `refundAmountFormatted` | `string`| **Yes** | `₦5,000` | Refund sum with currency symbol |
| `refundStatus` | `string` | No | `Arrived Feb 12 · Bank transfer` | Refund timeline / method |
| `policyNote` | `string` | No | Cancellation policy note | Why this amount was refunded |
| `browsePrompt` | `string` | No | Encouraging exploration text | Prompt above the browse button |
| `browseUrl` | `string` | No | `https://myjourny.app/experiences` | URL to catalog |
| `billingEmail` | `string` | No | `billing@myjourny.app` | Billing dispute email |
| `bookingCode` | `string` | No | `MJ-10552` | Cancelled booking code |

#### Sample JSON Context
```json
{
  "cancelledBy": "You, 3 days ago",
  "refundAmountFormatted": "₦5,000",
  "refundStatus": "Arrived Feb 12 · Bank transfer",
  "policyNote": "You cancelled within the free window, so the full amount was returned automatically, no action needed on your end.",
  "browsePrompt": "Your city's still full of things to do when you're ready",
  "browseUrl": "https://myjourny.app/experiences",
  "billingEmail": "billing@myjourny.app",
  "bookingCode": "MJ-10552",
  "eyebrow": "BOOKING CANCELLED",
  "title": "This booking's been cancelled",
  "subtitle": "Dawn Yoga at Millennium Park on Sat, 14 February is no longer happening. Here's what that means for your refund.",
  "signOffPrefix": "Until next time,",
  "signOffTeam": "MyJourny Team",
  "footerNotice": "This confirms the cancellation of booking MJ-10552.",
  "helpEmail": "support@myjourny.app",
  "copyright": "© 2026 MyJourny Ltd. Lagos, Nigeria."
}
```

---

### 6. `verify-email.html`

Sent to verify a user's email address during registration or email update.

#### Variables
| Variable | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `verifyUrl` | `string` | **Yes** | — | HTTPS verification link with token |
| `buttonLabel` | `string` | No | `Verify email` | Button CTA text |
| `expiresInHours` | `number` | No | `24` | Token validity window |
| `discoveryNote` | `string` | No | Onboarding welcome text | Value proposition message |
| `unrecognizedNote` | `string` | No | Phishing / mistake disclaimer | Safe-to-ignore text |
| `eyebrow` | `string` | No | `VERIFY YOUR EMAIL` |
| `title` | `string` | No | `Your journey starts here` |
| `subtitle` | `string` | No | Explanatory subtitle |

#### Sample JSON Context
```json
{
  "verifyUrl": "https://myjourny.app/verify?t=9k2mxa71",
  "buttonLabel": "Verify email",
  "expiresInHours": 24,
  "discoveryNote": "Once verified, you'll be ready to browse and book real experiences in Lagos and Abuja, hosted by people who actually live there.",
  "unrecognizedNote": "Didn't create a MyJourny account? You can safely ignore this email.",
  "eyebrow": "VERIFY YOUR EMAIL",
  "title": "Your journey starts here",
  "subtitle": "One quick step before you start exploring, confirm this is your email address.",
  "signOffPrefix": "Can't wait to see where you go,",
  "signOffTeam": "The MyJourny Team",
  "footerNotice": "This is an automated message, replies to this address aren't monitored.",
  "helpEmail": "support@myjourny.app",
  "copyright": "© 2026 MyJourny Ltd. Lagos, Nigeria."
}
```

---

## Security Guidelines for Backend Implementation

1. **HTML Escaping**: Always ensure your template engine escapes HTML entities (e.g., `<` & `>`) by default. Handlebars escapes by default with `{{variable}}`. Avoid unescaped triple braces `{{{variable}}}` unless you have sanitized the string with an HTML sanitizer.
2. **Safe URLs**: All URLs (`resetUrl`, `ticketUrl`, `directionsUrl`, `downloadReceiptUrl`, etc.) must strictly begin with `https://`. Never allow `javascript:`, `data:`, or relative paths in email links.
3. **Mailto Links**: All email contact links should be formatted with `mailto:` schemes and validated for valid RFC 5322 email formatting.
4. **Interactive Previews**: The frontend application includes a real-time preview environment at [`/email-templates`](http://localhost:3000/email-templates) where you can view each template rendered, toggle between desktop and mobile viewport widths, and copy clean generated HTML.
