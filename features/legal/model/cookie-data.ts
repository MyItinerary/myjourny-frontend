import type { TermsData } from "./terms.types";

export const cookieData: TermsData = {
  title: "Cookie Policy",
  lastUpdated: "[DATE]",
  companyAgreementText: "",
  agreementNoticeText: "",
  tableOfContents: [
    { id: "section-1", label: "1. What this policy covers" },
    { id: "section-2", label: "2. What cookies are" },
    { id: "section-3", label: "3. The four kinds we use" },
    { id: "section-4", label: "4. The cookies we use" },
    { id: "section-5", label: "5. Third parties" },
    { id: "section-6", label: "6. Your choices" },
    { id: "section-7", label: "7. If you say no" },
    { id: "section-8", label: "8. Do Not Track" },
    { id: "section-9", label: "9. Changes to this policy" },
    { id: "section-10", label: "10. Contact us" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. What this policy covers",
      items: [
        {
          text: 'This policy explains how **[COMPANY LEGAL NAME]** ("we", "us") uses cookies and similar technologies on MyJourny. It should be read with our [Privacy Policy](/legal/privacy), which explains how we handle personal data more widely.',
        },
      ],
    },
    {
      id: "section-2",
      number: "2.",
      title: "2. What cookies are",
      intro:
        "Cookies are small text files that a website saves on your phone or computer. They let a site remember who you are, what you chose, and how you use it. We also use similar technologies that do the same job:",
      bullets: [
        "**Local storage and session storage**, which keep information in your browser.",
        "**Device identifiers and SDKs**, which help us recognise a device.",
        "**Pixels and tags**, tiny images or scripts that tell us a page or email was viewed.",
      ],
      items: [],
      note: 'When we say "cookies" in this policy, we mean all of these.',
    },
    {
      id: "section-3",
      number: "3.",
      title: "3. The four kinds we use",
      items: [],
      table: {
        headers: ["Type", "What it does", "Can I turn it off?"],
        rows: [
          [
            "**Strictly necessary**",
            "Keeps you signed in, holds your spot during the 12-minute checkout hold, remembers your cookie choice, protects against fraud and attacks, and makes payments work",
            "No. MyJourny cannot work without them. They do not need consent.",
          ],
          [
            "**Preferences**",
            "Remembers choices such as your area, language, filters, and recently viewed items",
            "Yes",
          ],
          [
            "**Analytics**",
            "Tells us how people use MyJourny so we can fix problems and improve it. We look at it in aggregate.",
            "Yes",
          ],
          [
            "**Personalisation**",
            "Uses what you view and save to order and recommend experiences for you",
            "Yes. It also follows the personalisation switch in your settings.",
          ],
        ],
        note: "We do not use cookies to show you ads from other companies, and we do not sell cookie data.",
      },
    },
    {
      id: "section-4",
      number: "4.",
      title: "4. The cookies we use",
      items: [],
      table: {
        headers: ["Name", "Type", "Set by", "What it does", "How long it lasts"],
        rows: [
          [
            "**[session cookie]**",
            "Strictly necessary",
            "MyJourny",
            "Keeps you signed in",
            "Session, up to **[DURATION]**",
          ],
          [
            "**[checkout hold cookie]**",
            "Strictly necessary",
            "MyJourny",
            "Holds your selection for 12 minutes during checkout",
            "12 minutes",
          ],
          [
            "**[security cookie]**",
            "Strictly necessary",
            "MyJourny",
            "Protects against fraud and bot traffic",
            "**[DURATION]**",
          ],
          [
            "**[consent cookie]**",
            "Strictly necessary",
            "MyJourny",
            "Remembers your cookie choice",
            "12 months",
          ],
          [
            "**[payment partner cookies]**",
            "Strictly necessary",
            "**[PAYMENT PARTNER]**",
            "Secures your payment and prevents fraud on the payment page",
            "**[DURATION]**",
          ],
          [
            "**[preferences cookie]**",
            "Preferences",
            "MyJourny",
            "Remembers your area, filters, and language",
            "**[DURATION]**",
          ],
          [
            "**[analytics cookies]**",
            "Analytics",
            "**[ANALYTICS PROVIDER]**",
            "Counts visits and shows which pages are used",
            "**[DURATION]**",
          ],
          [
            "**[personalisation cookie]**",
            "Personalisation",
            "MyJourny",
            "Links your activity to your taste profile",
            "**[DURATION]**",
          ],
          [
            "**[Google sign-in cookies]**",
            "Strictly necessary, only when you choose Google sign-in",
            "Google",
            "Lets you sign in with Google",
            "**[DURATION]**",
          ],
        ],
      },
    },
    {
      id: "section-5",
      number: "5.",
      title: "5. Third parties",
      items: [
        {
          text: "Some cookies come from other companies that provide a service on our pages, such as our payment partner, Google sign-in, maps and directions, and analytics. These companies have their own policies. We choose them carefully, and non-essential ones load only after you agree.",
        },
      ],
    },
    {
      id: "section-6",
      number: "6.",
      title: "6. Your choices",
      items: [],
      bullets: [
        "**When you first visit,** we show a banner with three options: **Accept all**, **Reject non-essential**, and **Manage preferences**. Rejecting is as easy as accepting. Nothing non-essential runs until you choose.",
        '**To change your mind,** open Settings, then Privacy, then Cookie preferences, or use the "Cookie preferences" link in the footer of any page. Withdrawing consent is as easy as giving it.',
        "**Browser settings** let you block or delete cookies. If you block strictly necessary cookies, parts of MyJourny will not work, such as signing in and paying.",
        "**Mobile devices** let you reset your advertising identifier or limit tracking in your phone's settings.",
        "**Emails:** if we measure opens with a pixel, you can stop that by turning off marketing emails, or by blocking images in your mail app. Service emails never need it.",
      ],
      actionCard: {
        label: "See or change what you've agreed to.",
        buttonText: "Manage cookie preferences",
      },
      note: "We ask again for your choice after 12 months, or sooner if we add a new kind of cookie.",
    },
    {
      id: "section-7",
      number: "7.",
      title: "7. If you say no",
      items: [
        {
          text: "You can still use MyJourny, browse, and book. You may see less relevant recommendations, and we may not remember your filters between visits.",
        },
      ],
    },
    {
      id: "section-8",
      number: "8.",
      title: "8. Do Not Track",
      items: [
        {
          text: 'Some browsers send a "Do Not Track" or Global Privacy Control signal. We treat it as a request to reject non-essential cookies.',
        },
      ],
    },
    {
      id: "section-9",
      number: "9.",
      title: "9. Changes to this policy",
      items: [
        {
          text: "If we change the cookies we use in a way that matters, we update this page, show the banner again, and change the date above. For guests we give 14 days' notice of material changes to our policies, as set out in our Terms of Use.",
        },
      ],
    },
    {
      id: "section-10",
      number: "10.",
      title: "10. Contact us",
      items: [
        {
          text: "Questions about cookies or this policy? Contact our Data Protection Officer at **[DPO EMAIL]** or write to us at **[REGISTERED ADDRESS]**. If you are not satisfied with how we handle your request, you can complain to the Nigeria Data Protection Commission (ndpc.gov.ng).",
        },
      ],
    },
  ],
  readNext: {
    title: "Read next",
    items: [
      {
        eyebrow: "YOUR PRIVACY",
        title: "Privacy Policy",
        description: "What we collect, who sees it, how long we keep it, and your rights.",
        href: "/legal/privacy",
      },
      {
        eyebrow: "FOR GUESTS",
        title: "Terms of Use",
        description: "Booking, paying, events and tickets, and what we're responsible for.",
        href: "/legal/terms",
      },
    ],
  },
  documentQuestions: {
    text: "Questions about this document? Email **[DPO EMAIL]** or message us on WhatsApp at **[SUPPORT WHATSAPP NUMBER]**.",
    previousVersionsText: "Previous versions",
    previousVersionsHref: "#",
  },
};
