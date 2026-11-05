import type { TermsData } from "./terms.types";

export const termsData: TermsData = {
  title: "Terms of Use",
  lastUpdated: "[DATE]",
  companyAgreementText:
    'These terms are an agreement between you and [COMPANY LEGAL NAME] (RC [RC NUMBER] ), registered at [REGISTERED ADDRESS] . We call ourselves "MyJourny", "we", or "us". You are "you" or "the guest".',
  agreementNoticeText:
    "By creating an account or making a booking, you agree to these terms, our [Privacy Policy](/legal/privacy), and our [Cancellation and Refund Policy](/legal/cancellations). If you do not agree, please do not use MyJourny.",
  shortVersion: {
    title: "The short version",
    disclaimer: "This summary is for convenience. The full terms below are what apply.",
    items: [
      {
        id: "short-1",
        text: "MyJourny is a marketplace. Hosts run the experiences. We help you find them, book them, and pay safely.",
      },
      {
        id: "short-2",
        text: "Your payment is held by our payment partner until the experience happens, then released to the host.",
      },
      {
        id: "short-3",
        text: "Read the listing before you book. It tells you the fitness level, age limit, accessibility, and what to bring.",
      },
      {
        id: "short-4",
        text: "If a host cancels, you get a full refund.",
      },
      {
        id: "short-5",
        text: "Be kind, follow your host's safety instructions, and tell them about anything that affects your safety.",
      },
    ],
  },
  tableOfContents: [
    { id: "short-version", label: "The short version" },
    { id: "section-1", label: "1. What MyJourny is, and what it is not" },
    { id: "section-2", label: "2. Your account" },
    { id: "section-3", label: "3. Booking" },
    { id: "section-4", label: "4. Payment" },
    { id: "section-5", label: "5. Cancellations, changes, and refunds" },
    { id: "section-6", label: "6. Your responsibilities as a guest" },
    { id: "section-7", label: "7. Safety and risk" },
    { id: "section-8", label: "8. Reviews and your content" },
    { id: "section-9", label: "9. Personalisation, collections, and connecting with other guests" },
    { id: "section-10", label: "10. Messages and contact" },
    { id: "section-11", label: "11. Acceptable use" },
    { id: "section-12", label: "12. Our intellectual property" },
    { id: "section-13", label: "13. When things go wrong: our liability" },
    { id: "section-14", label: "14. Complaints and disputes" },
    { id: "section-15", label: "15. Changes to these terms" },
    { id: "section-16", label: "16. General" },
    { id: "part-b", label: "PART II: EVENTS AND TICKETS", isPartHeading: true },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. What MyJourny is, and what it is not",
      items: [
        {
          number: "1.1",
          text: "MyJourny is an online marketplace where independent hosts list experiences and events, and guests book them.",
        },
        {
          number: "1.2",
          boldPrefix: "The host is the seller.",
          text: "When you book, the agreement to provide the experience is between you and the host. We act as the host's agent for taking bookings, collecting payment, and applying the cancellation policy. We are not the host, the organiser, or the operator of any experience.",
        },
        {
          number: "1.3",
          text: "We are not a tour operator, an employer of hosts, an insurer, or a guarantor of any experience. Hosts are independent. Curators who recommend experiences are independent too, and a recommendation is an opinion, not a safety guarantee.",
        },
        {
          number: "1.4",
          text: '"Verified" next to a host means we checked their identity and that the payout bank account is in their name. It does not mean we inspected their equipment, venue, vehicles, or safety practices. "Curator pick" means a curator liked it.',
        },
        {
          number: "1.5",
          text: "We do our best to keep listings accurate, but listing details come from hosts. Please read them carefully.",
        },
      ],
    },
    {
      id: "section-2",
      number: "2.",
      title: "2. Your account",
      items: [
        {
          number: "2.1",
          text: "You must be at least 18 to create an account.",
        },
        {
          number: "2.2",
          text: "Give accurate details and keep them up to date. You can log in with your phone number. Keep your login codes private, and tell us quickly if you think someone else is using your account.",
        },
        {
          number: "2.3",
          text: "One person, one account. You may not sell, share, or transfer your account.",
        },
        {
          number: "2.4",
          text: "We may suspend or close an account that breaks these terms, is used for fraud, or puts others at risk. We will tell you why unless the law or safety prevents it.",
        },
      ],
    },
    {
      id: "section-3",
      number: "3.",
      title: "3. Booking",
      items: [
        {
          number: "3.1",
          boldPrefix: "Instant booking.",
          text: 'If a listing says "Book now", your booking is confirmed once your payment succeeds and you see the confirmation.',
        },
        {
          number: "3.2",
          boldPrefix: "Request to book.",
          text: 'If a listing says "Request to book", your card is authorised but not charged until the host accepts. The host has up to 24 hours to respond, or until 48 hours before the start time, whichever is sooner. If the host declines or does not respond, the request ends and the authorisation is released. A bank may take a few days to show the released amount.',
        },
        {
          number: "3.3",
          boldPrefix: "Holds.",
          text: "When you start checkout, we hold your spots for a short time (currently 12 minutes). If you do not finish, the spots are released.",
        },
        {
          number: "3.4",
          boldPrefix: "Prices.",
          text: "Prices are in naira (₦) and include all fees and applicable taxes, unless the listing says otherwise. We do not charge guests a booking fee.",
        },
        {
          number: "3.5",
          boldPrefix: "Minimum group size.",
          text: "Some experiences only run if a minimum number of people book. If the minimum is not met by the stated deadline, the experience is cancelled and you receive a full refund.",
        },
        {
          number: "3.6",
          boldPrefix: "Group bookings.",
          text: "If you book for others, you are responsible for making sure they know and follow these terms, the listing, and the host's instructions. Please share the host's safety and meeting-point information with them.",
        },
        {
          number: "3.7",
          boldPrefix: "Promo codes.",
          text: "Codes are for the listed tickets or experiences, cannot be combined unless stated, have no cash value, and may expire or run out. We can withdraw a code that was used unfairly or by mistake.",
        },
      ],
    },
    {
      id: "section-4",
      number: "4.",
      title: "4. Payment",
      items: [
        {
          number: "4.1",
          text: "You pay through MyJourny using the payment methods shown at checkout. Payments are processed by [PAYMENT PARTNER] , a licensed payment company. We do not store your full card details.",
        },
        {
          number: "4.2",
          boldPrefix: "Your money is held until the experience happens.",
          text: "After you pay, the payment partner holds the money. It is released to the host after the experience ends, less our commission. If the experience is cancelled or you are due a refund under our policy, the held money is refunded to you.",
        },
        {
          number: "4.3",
          text: "Payments made outside MyJourny, for example by transferring money directly to a host, are not protected by us. Please do not do it. If a host asks you to pay outside MyJourny, tell us.",
        },
        {
          number: "4.4",
          text: "If a payment fails or is reversed, we may cancel the booking. If you dispute a charge with your bank, please contact us first. We can usually fix things faster.",
        },
      ],
    },
    {
      id: "section-5",
      number: "5.",
      title: "5. Cancellations, changes, and refunds",
      items: [
        {
          number: "5.1",
          text: "Every listing shows its cancellation policy before you pay, with exact dates and amounts. The Cancellation and Refund Policy explains the rules and is part of these terms.",
        },
        {
          number: "5.2",
          boldPrefix: "If a host cancels, you receive a full refund.",
          text: "We will also help you find another date or a similar experience.",
        },
        {
          number: "5.3",
          text: "If an experience cannot safely go ahead, for example because of bad weather, you may choose a new date or a full refund.",
        },
        {
          number: "5.4",
          text: "Refunds go back to your original payment method. They normally take 5 to 10 working days after approval, depending on your bank.",
        },
        {
          number: "5.5",
          text: "If you arrive late or do not show up, you are not entitled to a refund, unless the Cancellation and Refund Policy says otherwise.",
        },
      ],
    },
    {
      id: "section-6",
      number: "6.",
      title: "6. Your responsibilities as a guest",
      items: [
        {
          number: "6.1",
          text: "Read the listing, including the fitness level, age limit, accessibility notes, what to bring, and safety notes. Book only if the experience is right for you and everyone in your booking.",
        },
        {
          number: "6.2",
          text: "Tell your host before the experience about anything that could affect your safety or theirs, such as a medical condition, an injury, pregnancy, an allergy, or a disability. You do not have to share more than is needed.",
        },
        {
          number: "6.3",
          text: "Follow your host's safety briefing and instructions. A host may stop you from taking part, without a refund, if you are unsafe, are drunk or on drugs, or put others at risk.",
        },
        {
          number: "6.4",
          text: "Do not bring weapons, illegal drugs, or anything the listing forbids.",
        },
        {
          number: "6.5",
          text: "Treat hosts, other guests, and other people's property with respect. You are responsible for damage you cause.",
        },
        {
          number: "6.6",
          text: "Keep children under your care safe and within the age rules of the listing.",
        },
      ],
    },
    {
      id: "section-7",
      number: "7.",
      title: "7. Safety and risk",
      items: [
        {
          number: "7.1",
          text: "Many experiences involve physical activity, water, food, travel, or crowds. They carry real risks, some of which cannot be removed. By booking, you accept the ordinary risks that come with an activity as described in the listing.",
        },
        {
          number: "7.2",
          text: "Hosts, not MyJourny, run and supervise experiences. We ask hosts to meet safety standards and to hold the permits and insurance their activity needs, but we do not inspect or supervise experiences, and we cannot promise that any experience is safe for you.",
        },
        {
          number: "7.3",
          text: "We recommend you hold your own personal accident insurance if you want cover beyond what a host provides.",
        },
        {
          number: "7.4",
          boldPrefix: "Under-18s.",
          text: "A person under 18 may take part only if the listing allows it and a parent or guardian makes the booking and stays responsible for them. Some experiences require an adult to stay with the child throughout.",
        },
        {
          number: "7.5",
          text: "If something goes wrong, tell the host straight away and then contact us. Call the emergency services first if anyone is in danger.",
        },
      ],
    },
    {
      id: "section-8",
      number: "8.",
      title: "8. Reviews and your content",
      items: [
        {
          number: "8.1",
          text: "You can review an experience only if you booked and took part in it. Reviews must be honest, based on your own experience, and free of hate, harassment, personal data, or advertising.",
        },
        {
          number: "8.2",
          text: "Do not offer or accept payment, discounts, or favours in exchange for a review.",
        },
        {
          number: "8.3",
          text: "You keep ownership of what you post. You give us a free, worldwide licence to display and use your reviews, photos, and other content on MyJourny and in our marketing, and to remove or edit it where needed for these terms.",
        },
        {
          number: "8.4",
          text: "We may remove content that breaks these terms or the law.",
        },
      ],
    },
    {
      id: "section-9",
      number: "9.",
      title: "9. Personalisation, collections, and connecting with other guests",
      items: [
        {
          number: "9.1",
          text: "We use your taste profile, searches, saves, and bookings to personalise what you see. We explain why a listing is shown to you, and you can change or switch off personalisation in your settings. The Privacy Policy explains what data we use and your rights.",
        },
        {
          number: "9.2",
          text: "Saving experiences into collections is private unless you choose to share a collection.",
        },
        {
          number: "9.3",
          boldPrefix: "Connecting with other guests is optional.",
          text: "If you opt in, other people going to the same experience can see the details you choose to share and may be able to contact you. You can opt out at any time. We do not check other guests, so use the same care you would with anyone you meet for the first time. Do not share personal contact details, addresses, or financial information until you are comfortable. Report anyone who makes you feel unsafe.",
        },
      ],
    },
    {
      id: "section-10",
      number: "10.",
      title: "10. Messages and contact",
      items: [
        {
          number: "10.1",
          text: "We send booking confirmations, reminders, and updates by email, SMS, and WhatsApp. These are service messages, and we send them whether or not you have opted into marketing.",
        },
        {
          number: "10.2",
          text: "You can opt in or out of marketing messages at any time in your settings.",
        },
        {
          number: "10.3",
          text: "The host's contact details are shared with you 24 hours before the experience, so you can coordinate. Before then, you can message the host through MyJourny. Please keep communication about bookings on MyJourny so we can help if something goes wrong.",
        },
      ],
    },
    {
      id: "section-11",
      number: "11.",
      title: "11. Acceptable use",
      intro: "You must not:",
      bullets: [
        "break the law or encourage others to",
        "give false information or use another person's identity or payment method",
        "harass, threaten, discriminate against, or abuse anyone",
        "post or send spam, scams, or malicious code",
        "copy, scrape, or resell our listings, data, or content",
        "try to bypass our payment system to avoid fees, or to take bookings off the platform",
        "interfere with how MyJourny works or try to access accounts that are not yours",
      ],
      items: [],
    },
    {
      id: "section-12",
      number: "12.",
      title: "12. Our intellectual property",
      items: [
        {
          text: "MyJourny, our logo, our design, and our content are ours or our licensors'. You may use MyJourny for your personal use under these terms. You may not copy or use our brand without our written permission.",
        },
      ],
    },
    {
      id: "section-13",
      number: "13.",
      title: "13. When things go wrong: our liability",
      items: [
        {
          number: "13.1",
          text: "We are not responsible for what hosts, other guests, or curators do or fail to do, or for the quality, safety, or legality of an experience, except where we ourselves were negligent or broke these terms.",
        },
        {
          number: "13.2",
          text: "To the extent the law allows, our total liability to you for any claim relating to a booking is limited to the amount you paid for that booking. We are not liable for indirect or consequential loss, such as lost opportunities or lost income.",
        },
        {
          number: "13.3",
          boldPrefix: "Nothing in these terms limits liability that the law does not allow us to limit.",
          text: "That includes liability for fraud, and for death or personal injury caused by our negligence. Nothing in these terms takes away your rights as a consumer under Nigerian law.",
        },
        {
          number: "13.4",
          text: "We do not promise that MyJourny will always be available or error-free. We may change or pause parts of the service.",
        },
      ],
    },
    {
      id: "section-14",
      number: "14.",
      title: "14. Complaints and disputes",
      items: [
        {
          number: "14.1",
          text: "If something is wrong, contact us at [SUPPORT EMAIL] or on WhatsApp at [SUPPORT WHATSAPP NUMBER] . We aim to reply within 2 working days and to resolve most issues within 14 days.",
        },
        {
          number: "14.2",
          text: "If we cannot resolve it, you can use any other route the law gives you, including contacting the Federal Competition and Consumer Protection Commission.",
        },
        {
          number: "14.3",
          text: "These terms are governed by the laws of the Federal Republic of Nigeria. Subject to your rights under consumer law, the courts of Lagos State have jurisdiction.",
        },
      ],
    },
    {
      id: "section-15",
      number: "15.",
      title: "15. Changes to these terms",
      items: [
        {
          text: "We may update these terms. For significant changes, we will give you at least 14 days' notice by email, SMS, or in the app. If you keep using MyJourny after the change takes effect, you accept the new terms. If you do not, you can close your account. Bookings you already made keep the terms that applied when you booked.",
        },
      ],
    },
    {
      id: "section-16",
      number: "16.",
      title: "16. General",
      items: [
        {
          number: "16.1",
          text: "If part of these terms is found invalid, the rest still applies.",
        },
        {
          number: "16.2",
          text: "We may transfer our rights under these terms to another company if we are restructured or sold. You may not transfer yours without our consent.",
        },
        {
          number: "16.3",
          text: "If we delay enforcing a right, we have not given it up.",
        },
        {
          number: "16.4",
          text: "These terms, the Privacy Policy, and the Cancellation and Refund Policy are the whole agreement between us on this subject.",
        },
        {
          number: "16.5",
          text: "We send notices to the email or phone number on your account. You can write to us at [REGISTERED ADDRESS] or [SUPPORT EMAIL] .",
        },
      ],
    },
    {
      id: "part-b",
      eyebrow: "PART B",
      title: "Events and tickets",
      intro:
        "Part B applies when you buy a ticket to an event. Where it conflicts with sections 1 to 16 above, Part B wins for events.",
      items: [
        {
          boldPrefix: "B1. The organiser is the seller.",
          text: "As with experiences, the event is run by the organiser. We sell tickets as the organiser's agent.",
        },
        {
          boldPrefix: "B2. Your ticket.",
          text: "Your ticket is a QR code sent to you by email and WhatsApp. It admits the number of people it states. Keep it private. If a ticket is copied, the first to be scanned gets in, and we are not responsible for a copied ticket you shared or exposed.",
        },
        {
          boldPrefix: "B3. Transfers and resale.",
          text: "You may transfer a ticket to a friend until the transfer deadline shown on the event page. You must not resell tickets for more than you paid, or use them for commercial resale. We may cancel tickets that are resold unfairly.",
        },
        {
          boldPrefix: "B4. Ticket types.",
          text: "Each ticket type has its own price, availability, sale window, and conditions. Early bird, student, and other discounted tickets may need proof, such as a valid student ID, at the door. If you cannot show it, you may be refused entry or asked to pay the difference.",
        },
        {
          boldPrefix: "B5. Entry.",
          text: "Organisers can set entry rules, such as age limits, dress code, bag limits, ID checks, and search policies. Organisers and venue staff may refuse entry or remove people for breaking those rules, or for unsafe or unlawful behaviour. In that case, no refund is due.",
        },
        {
          boldPrefix: "B6. Cancellations by you.",
          text: "Event tickets are not refundable once bought, unless the event page shows a refund deadline, in which case you can cancel for a full refund up to that exact date and time. You can usually transfer your ticket instead.",
        },
        {
          boldPrefix: "B7. Cancellations and changes by the organiser.",
          text: "",
          bullets: [
            {
              boldPrefix: "Cancelled:",
              text: "You receive a full refund automatically.",
            },
            {
              boldPrefix: "Postponed (new date not yet set):",
              text: "Your ticket stays valid for the new date, or you can ask for a full refund within 14 days of the announcement.",
            },
            {
              boldPrefix: "Rescheduled (new date set):",
              text: "Your ticket moves to the new date, or you can ask for a full refund within 14 days of the announcement.",
            },
            {
              boldPrefix: "Other changes:",
              text: "Changes to the line-up, running order, or programme are not grounds for a refund unless the change is so large that the event is materially different from what was advertised. In that case, you can ask for a full refund within 7 days of the announcement.",
            },
          ],
        },
        {
          boldPrefix: "B8. Safety at events.",
          text: "Organisers are responsible for crowd safety, security, first aid, emergency exits, noise, and any permits or registrations the event needs. Follow staff instructions, and leave through the marked exits if told to evacuate.",
        },
        {
          boldPrefix: "B9. Filming and photography.",
          text: "Organisers and MyJourny may film or photograph events. By attending, you may appear in recordings. Notices at the venue will say so. If you do not want to be filmed, tell the organiser or staff and move out of filmed areas.",
        },
        {
          boldPrefix: "B10. Age and alcohol.",
          text: "Where an event is 18 and over, you must be able to show proof of age. Alcohol will not be served to anyone under the legal age or to anyone who appears drunk.",
        },
      ],
    },
  ],
};
