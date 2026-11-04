import type { TermsData } from "./terms.types";

export const termsData: TermsData = {
  title: "Terms of Use",
  lastUpdated: "[DATE]",
  companyAgreementText:
    'These terms are an agreement between you and [COMPANY LEGAL NAME] (RC [RC NUMBER] ), registered at [REGISTERED ADDRESS] . We call ourselves "MyJourny", "we", or "us". You are "you" or "the guest".',
  agreementNoticeText:
    "By creating an account or making a booking, you agree to these terms, our Privacy Policy, and our Cancellation and Refund Policy. If you do not agree, please do not use MyJourny.",
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
    { id: "part-2", label: "PART II: EVENTS AND TICKETS", isPartHeading: true },
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
  ],
};
