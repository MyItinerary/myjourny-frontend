import type { TermsData } from "./terms.types";

export const cancellationData: TermsData = {
  title: "Cancellation and Refund Policy",
  lastUpdated: "[DATE]",
  companyAgreementText:
    "This policy is part of our Terms of Use. It tells you when you get your money back, how much, and how to ask. We have tried to keep it plain.",
  agreementNoticeText: "",
  shortVersion: {
    title: "The short version",
    disclaimer: "",
    items: [
      {
        id: "short-1",
        text: "Before you pay, every listing shows **its cancellation policy with exact dates and amounts**.",
      },
      {
        id: "short-2",
        text: "If a host cancels, you get a **full refund**.",
      },
      {
        id: "short-3",
        text: "If an experience cannot safely go ahead, you choose **a new date or a full refund**.",
      },
      {
        id: "short-4",
        text: "Experiences have a **Flexible, Moderate, or Strict** policy. Event tickets are usually non-refundable, but you can often transfer them.",
      },
      {
        id: "short-5",
        text: "Refunds go back to how you paid, in about **5 to 10 working days**.",
      },
    ],
  },
  tableOfContents: [
    { id: "short-version", label: "The short version" },
    { id: "section-1", label: "1. How cancellation works" },
    { id: "section-2", label: "2. Changes, grace period, and late bookings" },
    { id: "section-3", label: "3. Events and tickets" },
    { id: "section-4", label: "4. When you always get a refund or a choice" },
    { id: "section-5", label: "5. What is not refundable" },
    { id: "section-6", label: "6. How refunds are paid" },
    { id: "section-7", label: "7. How to ask" },
    { id: "section-8", label: "8. For hosts" },
  ],
  sections: [
    {
      id: "section-1",
      number: "1.",
      title: "1. How cancellation works",
      items: [
        {
          number: "1.1",
          text: "MyJourny applies each host's policy for them. The policy that was showing when you booked is the one that applies, even if the host changes it later.",
        },
        {
          number: "1.2",
          text: "All times are in West Africa Time (WAT), based on the experience's start time shown on the listing and in your confirmation.",
        },
        {
          number: "1.3",
          text: "A refund is of the **full price you paid** (including taxes and any fees we showed), unless this policy says a percentage.",
        },
      ],
    },
    {
      id: "section-2",
      number: "2.",
      title: "2. Changes, grace period, and late bookings",
      items: [
        {
          number: "2.1",
          boldPrefix: "Changing the date.",
          text: "You can ask to move your booking to another date. If the cancellation window is still open and there is space, we will move it for free. If not, the host may agree to a change, but they do not have to.",
        },
        {
          number: "2.2",
          boldPrefix: "Changing group size.",
          text: "You can reduce the number of guests, and the refund follows the policy for the part you remove. You can add guests if there is space, at the current price.",
        },
        {
          number: "2.3",
          boldPrefix: "Late bookings.",
          text: "The policy runs from the moment you book. If you book inside a refund window, only the part of the policy that still applies is available.",
        },
        {
          number: "2.4",
          boldPrefix: "24-hour grace period.",
          text: "If your experience starts at least 72 hours after you book, you can cancel for a full refund within 24 hours of booking, whatever the policy says.",
        },
        {
          number: "2.5",
          boldPrefix: "Request to book.",
          text: "Your card is authorised, not charged, until the host accepts. If they decline or do not reply in time, the authorisation is released and you pay nothing. The cancellation policy applies only once your booking is confirmed.",
        },
      ],
    },
    {
      id: "section-3",
      number: "3.",
      title: "3. Events and tickets",
      items: [
        {
          number: "3.1",
          boldPrefix: "Default: non-refundable.",
          text: 'Event tickets are non-refundable once bought, unless the event page shows a refund deadline. The page will say, for example, "Full refund until Saturday 7 November, 6:00pm."',
        },
        {
          number: "3.2",
          boldPrefix: "Refund deadline.",
          text: "If the organiser sets one, you can cancel for a full refund up to that exact date and time. After it, tickets are not refundable.",
        },
        {
          number: "3.3",
          boldPrefix: "Transfers.",
          text: "You can almost always send your ticket to a friend until the transfer deadline shown on the event page. This is often the best option if you cannot go.",
        },
        {
          number: "3.4",
          boldPrefix: "If the organiser cancels:",
          text: "you receive a full refund automatically. You do not need to ask.",
        },
        {
          number: "3.5",
          boldPrefix: "If the event is postponed (no new date yet):",
          text: "your ticket stays valid for the new date. You can ask for a full refund within 14 days of the announcement.",
        },
        {
          number: "3.6",
          boldPrefix: "If the event is rescheduled (new date set):",
          text: "your ticket moves to the new date. You can ask for a full refund within 14 days of the announcement.",
        },
        {
          number: "3.7",
          boldPrefix: "If the event changes in other ways:",
          text: "a change to the line-up, running order, or programme is not a reason for a refund. If the change is so large that the event is materially different from what was advertised, for example a different venue area or a different type of event, you can ask for a refund within 7 days of the announcement.",
        },
        {
          number: "3.8",
          boldPrefix: "Event minimum not met:",
          text: "if an event only runs when a minimum number of tickets sells and it does not, everyone is refunded in full.",
        },
        {
          number: "3.9",
          boldPrefix: "Free events and free tickets:",
          text: "there is nothing to refund. Please release your spot if you cannot go, so someone on the waitlist can use it.",
        },
        {
          number: "3.10",
          boldPrefix: "Tiers and add-ons:",
          text: "each ticket type and add-on follows the same rules unless the event page says otherwise. If an early bird tier ends while you are booking, you pay the new price, and we tell you clearly before you pay.",
        },
      ],
    },
    {
      id: "section-4",
      number: "4.",
      title: "4. When you always get a refund or a choice",
      intro: "These rules apply to every booking, whatever policy it has.",
      items: [
        {
          number: "4.1",
          boldPrefix: "The host or organiser cancels:",
          text: "full refund. We will also help you find another date or a similar experience.",
        },
        {
          number: "4.2",
          boldPrefix: "The experience cannot safely go ahead.",
          text: "This includes severe weather, unsafe conditions, or a safety concern raised by the host or by us. You choose **a new date or a full refund**.",
        },
        {
          number: "4.3",
          boldPrefix: "The minimum group size is not met:",
          text: "full refund.",
        },
        {
          number: "4.4",
          boldPrefix: "The host does not deliver, or what you receive is materially different from the listing.",
          text: "For example, the listing said the experience suits beginners and it does not, or the meeting point is wrong, or the stated accessibility is untrue. Tell us as soon as you can, ideally on the day, and within 48 hours after. We will review it, and you may be entitled to a full or partial refund.",
        },
        {
          number: "4.5",
          boldPrefix: "Events outside anyone's control.",
          text: "This includes government orders, public disorder, severe disruption to roads or utilities, and similar events that make the experience impossible or unsafe. You choose **a new date or a full refund**.",
        },
        {
          number: "4.6",
          boldPrefix: "Pricing or listing errors by us.",
          text: "If the price or key details were shown wrongly because of an error on our side, we will fix it, or you can cancel for a full refund.",
        },
      ],
    },
    {
      id: "section-5",
      number: "5.",
      title: "5. What is not refundable",
      items: [
        {
          number: "5.1",
          boldPrefix: "No-shows and late arrival.",
          text: "If you do not turn up, or arrive after the host has released your spot (normally 15 minutes after the start unless the listing says otherwise), no refund is due.",
        },
        {
          number: "5.2",
          boldPrefix: "Being sent away.",
          text: "If a host stops you taking part because you are unsafe, drunk, on drugs, or disruptive, or because you did not meet requirements the listing clearly stated (such as an age limit or ID), no refund is due.",
        },
        {
          number: "5.3",
          boldPrefix: "Change of mind or personal circumstances",
          text: "outside the refund windows, including illness, travel problems, and work. In genuine emergencies with proof, such as a hospital admission or a death in the family, please contact us. We cannot promise a refund, but we will talk to the host and may offer a new date or credit as a goodwill gesture. This is a favour, not a right.",
        },
        {
          number: "5.4",
          boldPrefix: "Credit.",
          text: "In some cases, such as a goodwill gesture, we may offer MyJourny credit instead of a refund. Credit is optional for you to accept, and you can ask for a refund where this policy says you are entitled to one.",
        },
      ],
    },
    {
      id: "section-6",
      number: "6.",
      title: "6. How refunds are paid",
      items: [
        {
          number: "6.1",
          text: "Refunds go back to the **original payment method**.",
        },
        {
          number: "6.2",
          text: "Once approved, a refund normally reaches you within **5 to 10 working days**, depending on your bank or card. We will tell you when we have sent it.",
        },
        {
          number: "6.3",
          text: "If a booking was made with a promo code, the refund is of what you paid, not of the full price before the code.",
        },
        {
          number: "6.4",
          boldPrefix: "Chargebacks:",
          text: "if you dispute a payment with your bank while a refund is being processed, you could be refunded twice and we may recover the extra. Please contact us first. We are usually faster.",
        },
      ],
    },
    {
      id: "section-7",
      number: "7.",
      title: "7. How to ask",
      items: [
        {
          number: "7.1",
          text: "Tell us in the app, under **My bookings**, or contact **[SUPPORT EMAIL]** or **[SUPPORT WHATSAPP NUMBER]** . Give your booking reference and what happened.",
        },
        {
          number: "7.2",
          text: "We aim to reply within **2 working days** and to decide within **7 days**.",
        },
        {
          number: "7.3",
          text: "If you do not agree with our decision, you can ask for a review, and you can use any other route the law gives you, including the Federal Competition and Consumer Protection Commission.",
        },
      ],
    },
    {
      id: "section-8",
      number: "8.",
      title: "8. For hosts",
      items: [
        {
          number: "8.1",
          text: "You choose a policy for each experience: Flexible, Moderate, or Strict. Flexible is the default. Choose the policy that fits how much it costs you to lose a spot.",
        },
        {
          number: "8.2",
          text: "If a guest is refunded, your payout reduces by the same share. If a guest is partly refunded, you receive the remaining share less our 15% commission on it.",
        },
        {
          number: "8.3",
          text: "If you cancel, guests get a full refund, and you are not paid for that booking. Repeated cancellations affect your listing's visibility and can lead to suspension. See the [Host Terms](/legal/hosts).",
        },
        {
          number: "8.4",
          text: "You cannot change the policy for bookings that are already confirmed.",
        },
      ],
    },
  ],
};
