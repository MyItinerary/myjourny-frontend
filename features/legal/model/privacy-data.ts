import type { TermsData } from "./terms.types";

export const privacyData: TermsData = {
  title: "Privacy Policy",
  lastUpdated: "9 November 2026",
  companyAgreementText: "",
  agreementNoticeText: "",
  atAGlance: {
    title: "At a glance",
    items: [
      {
        question: "Who is responsible for your data?",
        answer: "Myjourny and Experiences LLC, operating as MyJourny.",
      },
      {
        question: "What do we collect?",
        answer:
          "What you give us, what happens when you use MyJourny, and what our partners tell us, such as whether a payment went through.",
      },
      {
        question: "Why?",
        answer:
          "To run your bookings, keep people safe, pay hosts, personalise what you see, and follow the law.",
      },
      {
        question: "Do you sell my data?",
        answer: "No. We never sell it.",
      },
      {
        question: "Who sees it?",
        answer:
          "Hosts and organisers see only what they need to run your booking. Our service providers see what they need to work for us.",
      },
      {
        question: "Can I stop personalisation and marketing?",
        answer: "Yes, any time, in settings or with one click in any marketing email.",
      },
      {
        question: "Can I see, fix, or delete my data?",
        answer: "Yes. See section 10.",
      },
      {
        question: "Who do I contact?",
        answer: "[DPO EMAIL]",
      },
    ],
  },
  tableOfContents: [
    { id: "at-a-glance", label: "At a glance" },
    { id: "section-1", label: "1. Who we are" },
    { id: "section-2", label: "2. The short version of how we use data" },
    { id: "section-3", label: "3. What we collect" },
    { id: "section-4", label: "4. Why we use your data, and our legal basis" },
    { id: "section-5", label: "5. Personalisation and automated decisions" },
    { id: "section-6", label: "6. What hosts and organisers see" },
    { id: "section-7", label: "7. Who else we share data with" },
    { id: "section-8", label: "8. Transfers outside Nigeria" },
    { id: "section-9", label: "9. How long we keep your data" },
    { id: "section-10", label: "10. Your rights" },
    { id: "section-11", label: "11. Marketing and messages" },
    { id: "section-12", label: "12. Keeping your data safe" },
    { id: "section-13", label: "13. Children" },
    { id: "section-14", label: "14. Links to other sites" },
    { id: "section-15", label: "15. Changes to this policy" },
    { id: "section-16", label: "16. Contact us" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. Who we are",
      items: [
        {
          text: 'MyJourny is a service of Myjourny and Experiences LLC (RC 9460304), of The Ersleigh 2, Road 13, Lekki Scheme 2, off Ogombo Road, Lagos. We help guests find and book experiences and events in Nigeria, run by hosts and organisers. In this policy, "we", "us", and "our" mean Myjourny and Experiences LLC.',
        },
        {
          text: "We are the data controller of the personal data described here. This policy follows the Nigeria Data Protection Act 2023 and the regulations and directives made under it. Our Data Protection Officer is reachable at [DPO EMAIL] .",
        },
        {
          text: "This policy applies to guests, hosts, event organisers, curators, and visitors to our website and any other service we run. If we collect data for a different purpose, we will tell you at that point.",
        },
      ],
    },
    {
      id: "section-2",
      number: "2.",
      title: "2. The short version of how we use data",
      items: [],
      bullets: [
        "We use your details to make bookings work, to take payment, and to contact you about them.",
        "We use your taste and activity to show you experiences you are more likely to want. You can switch this off.",
        "We share limited details with hosts and organisers so they can run what you booked.",
        "We keep payment and legal records as long as the law needs us to.",
        "You have rights over your data, and we make them easy to use.",
      ],
    },
    {
      id: "section-3",
      number: "3.",
      title: "3. What we collect",
      items: [
        {
          boldPrefix: "3.1 What you give us",
          text: "",
          bullets: [
            "**Account details:** your name, phone number, email address, and profile photo if you add one. If you sign in with Google, we receive your name, email, and profile picture from Google.",
            "**Taste profile:** your answers to the taste quiz, the categories and experiences you save, and the preferences you set.",
            "**Booking details:** the experience or event, the date, the number of guests, add-ons, and any notes you write to the host.",
            "**Dietary and access needs:** anything you tell us so a host can look after you. This can reveal health, religious, or other **sensitive information**. We collect it only with your **explicit consent**, only when you choose to give it, and share it only with the host or organiser who needs it.",
            "**Messages:** what you write to hosts, organisers, and our support team.",
            "**Reviews, ratings, and photos** you post.",
            "**Identity details:** if you are a host, an organiser, or a curator, we collect ID documents and may collect a selfie, so we can verify you. For payouts we collect your bank account details. For some guest bookings we may ask for ID or proof of age, for example for 18+ events.",
            "**Reports and complaints:** what you tell us in a safety report or a dispute.",
          ],
        },
        {
          boldPrefix: "3.2 What we collect when you use MyJourny",
          text: "",
          bullets: [
            "**Device and technical data:** device type, operating system, browser, IP address, language, and the pages and features you use.",
            "**Approximate location:** from your IP address or device settings, so we can show experiences near you. We use **precise location** only if you allow it, for example for live directions on the day.",
            "**Activity data:** what you search for, view, save, and book, and how you interact with emails and messages.",
            "**Check-in data:** when your ticket or booking is scanned at an event or experience.",
            "**Cookies and similar technologies.** See our Cookie Policy.",
          ],
        },
        {
          boldPrefix: "3.3 What we get from others",
          text: "",
          bullets: [
            "**Our payment partners, Paystack, Novac and Stripe:** whether a payment succeeded, failed, or was refunded, a payment reference, and the masked card or bank details (for example, Mastercard ending 4821). We do not receive or store your full card number.",
            "**Our verification provider, [ID VERIFICATION PROVIDER] :** whether your ID and bank details checked out.",
            "**Hosts and organisers:** their notes about a booking, such as a no-show, or a report about an incident.",
            "**Other users,** if they report a problem involving you.",
            "**Public sources and advisers,** where needed to prevent fraud or follow the law.",
          ],
        },
      ],
    },
    {
      id: "section-4",
      number: "4.",
      title: "4. Why we use your data, and our legal basis",
      items: [],
      table: {
        headers: ["What we do", "The data we use", "Our legal basis"],
        rows: [
          [
            "Create and secure your account, sign you in, send login codes",
            "Account details, device data",
            "Contract, and our legitimate interest in security",
          ],
          [
            "Process bookings, tickets, payments, refunds, and payouts",
            "Account, booking, payment, and bank details",
            "Contract",
          ],
          [
            "Share details with the host or organiser so they can run your booking",
            "Name, group size, notes, dietary and access needs, contact details unlocked 24 hours before",
            "Contract, and your **explicit consent** for sensitive details",
          ],
          [
            "Send service messages by WhatsApp, email, and push: confirmations, reminders, changes, receipts, security alerts",
            "Contact details, booking details",
            "Contract and legal obligation. You cannot opt out of these while you hold a booking.",
          ],
          [
            'Personalise what you see: recommendations, "picked for you", the weekly drop',
            "Taste profile, activity, saved items",
            "**Consent**, which you can withdraw any time",
          ],
          [
            "Send marketing emails",
            "Email, taste profile, activity",
            "**Consent**, withdrawn with one click",
          ],
          [
            "Keep people safe, prevent fraud, handle reports and disputes",
            "Account, booking, device, check-in, and report data",
            "Legitimate interest, legal obligation, and the protection of people's vital interests",
          ],
          [
            "Verify hosts, organisers, and curators",
            "ID, selfie, bank details, business details",
            "Contract, legal obligation, and legitimate interest",
          ],
          [
            "Improve MyJourny: fix bugs, understand how it is used, measure what works",
            "Activity and device data, usually aggregated",
            "Legitimate interest, or consent where cookies require it",
          ],
          [
            "Show reviews and attendee connect",
            "Name, photo, review text",
            "Contract for reviews, and **consent** for attendee connect",
          ],
          [
            "Meet tax, accounting, and regulatory duties, and respond to lawful requests",
            "Booking, payment, and identity records",
            "Legal obligation",
          ],
          [
            "Establish or defend legal claims",
            "Relevant records",
            "Legitimate interest and legal obligation",
          ],
        ],
        note: "Where we rely on **legitimate interest**, we have weighed it against your rights and interests. You can ask us how we did that, and you can object (section 10).",
      },
    },
    {
      id: "section-5",
      number: "5.",
      title: "5. Personalisation and automated decisions",
      items: [
        {
          text: "We use your taste profile and activity to rank and recommend experiences. We always show why something was recommended, and you can change your taste profile or turn personalisation off in settings. If you turn it off, you still see everything. It is just not ordered for you.",
        },
        {
          text: "**We never sell ranking or placement.** A host cannot pay to appear higher in your results.",
        },
        {
          text: "We use automated checks to spot likely fraud, such as repeated failed payments or suspicious sign-ins. A person reviews any decision that could stop you booking or block your account, and you can ask us to review it again.",
        },
      ],
    },
    {
      id: "section-6",
      number: "6.",
      title: "6. What hosts and organisers see",
      intro: "When you book, we share with the host or organiser only what they need:",
      bullets: [
        "your first name, and your full name where they need to check you in",
        "the number of guests and any add-ons",
        "the notes, and the dietary or access needs, you chose to give",
        "your phone number, shown only **24 hours before** the experience starts, so you can reach each other",
      ],
      items: [
        {
          text: "After you book, the host or organiser becomes an **independent controller** of those details. Our Host Terms require them to use the details only to run your booking and keep you safe, to keep them secure, to avoid sending you marketing unless you separately agree, to delete them normally within 30 days after the experience, and never to sell them. If you think a host or organiser has misused your data, tell us at **[DPO EMAIL]** and we will act on it.",
        },
        {
          text: "**Attendee connect** is optional and off by default. If you opt in after an experience, we show your first name and photo to the others who were there, for **14 days**. You can leave at any time.",
        },
        {
          text: "**Reviews** show your first name, photo, and review text to the public.",
        },
      ],
    },
    {
      id: "section-7",
      number: "7.",
      title: "7. Who else we share data with",
      intro: "We do not sell your data. We share it only with:",
      items: [],
      bullets: [
        "**Our payment partners, Paystack, Novac and Stripe**, who process and hold payments.",
        "**Our verification provider, [ID VERIFICATION PROVIDER]** .",
        "**Technology providers who work for us: [CLOUD PROVIDERS]** for hosting and storage, **[EMAIL AND MESSAGING PROVIDERS]** for email, SMS, and WhatsApp messages, **[ANALYTICS PROVIDER]** for analytics, and support tools to run our help desk. They may use your data only on our instructions, and we have contracts that require them to protect it.",
        "**WhatsApp**, which is run by Meta. When we message you there, WhatsApp handles the message under its own terms.",
        "**Professional advisers**, such as lawyers, accountants, and insurers.",
        "**Authorities**, such as courts, the police, tax authorities, and regulators, where the law requires or allows us to.",
        "**A buyer or investor**, if we merge, are acquired, or raise investment. We will tell you before your data is transferred under a different privacy policy.",
      ],
    },
    {
      id: "section-8",
      number: "8.",
      title: "8. Transfers outside Nigeria",
      items: [
        {
          text: "Some of our providers store or process data outside Nigeria. When your data leaves Nigeria, we make sure it is protected to the standard the NDPA requires, for example by using providers in countries with adequate protection, by using approved contract terms, or by relying on your consent where that is the right basis. Ask us at **[DPO EMAIL]** for details of the safeguards for a specific provider.",
        },
      ],
    },
    {
      id: "section-9",
      number: "9.",
      title: "9. How long we keep your data",
      items: [],
      table: {
        headers: ["Data", "How long we keep it"],
        rows: [
          [
            "Account and profile",
            "While your account is open, then deleted within 90 days of closing it, except what we must keep below",
          ],
          ["Taste profile and activity", "Until you delete it or close your account"],
          [
            "Booking, ticket, payment, refund, and payout records",
            "6 years after the transaction, for tax and accounting",
          ],
          [
            "Host, organiser, and curator ID documents and selfies",
            "Until verification is complete and then for 12 months after your account closes, unless a longer period is needed for a dispute or the law",
          ],
          [
            "Messages with hosts and organisers",
            "2 years after the experience, longer if there is a dispute",
          ],
          ["Support conversations", "3 years after the request closes"],
          ["Safety reports and dispute records", "6 years, or longer if needed for legal claims"],
          ["Marketing preferences and unsubscribe records", "Kept so we can respect your choice"],
          ["Server logs and security logs", "12 months"],
          ["Cookie data", "See the Cookie Policy"],
        ],
        note: "When the period ends, we delete the data or anonymise it so you can no longer be identified.",
      },
    },
    {
      id: "section-10",
      number: "10.",
      title: "10. Your rights",
      intro: "Under the NDPA, you can:",
      bullets: [
        "**Be informed** about how we use your data, which is what this policy is for.",
        "**Access** the data we hold about you, and get a copy.",
        "**Correct** anything that is wrong or incomplete.",
        "**Delete** your data, where we no longer need it or you withdraw consent.",
        "**Restrict** how we use your data while a question is being resolved.",
        "**Object** to uses based on our legitimate interest, and to **direct marketing** at any time.",
        "**Take your data with you** in a common, machine-readable format, where it applies.",
        "**Withdraw consent** at any time. This does not affect what we did before.",
        "**Not be subject to a decision based only on automated processing** that significantly affects you, and ask for a person to review it.",
      ],
      items: [
        {
          boldPrefix: "How to use them.",
          text: "Go to Settings, then Privacy, to download your data, change your taste profile, turn off personalisation, or close your account. Or email **[DPO EMAIL]** or message us on WhatsApp at **[SUPPORT WHATSAPP NUMBER]** . We may need to check it is you. We reply within one month. We do not charge, unless a request is clearly unfounded or excessive. We may keep what the law requires us to keep, and we will tell you what and why.",
        },
        {
          boldPrefix: "To complain.",
          text: "Tell us first at **[DPO EMAIL]** , and we will try to put it right. You can also complain to the **Nigeria Data Protection Commission** (ndpc.gov.ng) at any time.",
        },
      ],
    },
    {
      id: "section-11",
      number: "11.",
      title: "11. Marketing and messages",
      intro: "We send two kinds of message.",
      bullets: [
        "**Service messages** about your booking, your payments, your account, and security. We need to send these.",
        "**Marketing and recommendations**, such as our weekly drop and personalised picks. We send these only if you agreed. Every marketing email has an **Unsubscribe** link, and you can manage this in settings. WhatsApp is used for service messages only. We do not send marketing on WhatsApp.",
      ],
      items: [
        {
          text: "If you unsubscribe from marketing, we still send service messages for any booking you hold.",
        },
      ],
    },
    {
      id: "section-12",
      number: "12.",
      title: "12. Keeping your data safe",
      items: [
        {
          text: "We protect your data with measures suited to the risk, including encryption in transit, access controls so only staff who need data can see it, secure storage, staff training, and monitoring for misuse. We choose providers carefully and check how they protect data.",
        },
        {
          text: "No system is perfectly secure. If a breach affects your data in a way that puts your rights at risk, we will tell the NDPC within 72 hours of becoming aware of it, and we will tell you without undue delay, plainly and with what you should do.",
        },
        {
          text: "Please protect your account too. Never share your login code. We will never ask for it, by any channel.",
        },
      ],
    },
    {
      id: "section-13",
      number: "13.",
      title: "13. Children",
      items: [
        {
          text: "MyJourny accounts are for people aged 18 and over. We do not knowingly collect data from children through their own accounts. Some experiences and events welcome children when they come with a parent or guardian who books for them. If you think a child has given us data, contact **[DPO EMAIL]** and we will delete it.",
        },
      ],
    },
    {
      id: "section-14",
      number: "14.",
      title: "14. Links to other sites",
      items: [
        {
          text: "MyJourny may link to other sites, such as maps, payment pages, or a host's own page. We are not responsible for how they handle data. Read their policies.",
        },
      ],
    },
    {
      id: "section-15",
      number: "15.",
      title: "15. Changes to this policy",
      items: [
        {
          text: "We may update this policy. For guests, we tell you at least **14 days** before a material change takes effect, by email and in the product. For hosts and organisers, we give **30 days**. The date at the top shows when it was last changed.",
        },
      ],
    },
    {
      id: "section-16",
      number: "16.",
      title: "16. Contact us",
      items: [
        {
          text: "**Myjourny and Experiences LLC**, **The Ersleigh 2, Road 13, Lekki Scheme 2, off Ogombo Road, Lagos**. Data Protection Officer: **[DPO EMAIL]**",
        },
        {
          text: "Support: **[SUPPORT EMAIL]** or WhatsApp **[SUPPORT WHATSAPP NUMBER]**",
        },
      ],
    },
  ],
};
