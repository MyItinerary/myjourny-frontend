export type HelpGuide = { n: string; title: string; meta: string; body: string };

// Where a host reaches a person. WhatsApp has no number to link to yet.
export const SUPPORT_EMAIL = "support@myjourny.app";

export const SUPPORT_COPY = {
  heading: "Need support?",
  body: "A person answers, 8am to 10pm, every day. Average reply is under nine minutes.",
  whatsapp: "Message us on WhatsApp",
  email: "Send an email",
};

export const GUIDES_HEADING = "Read these before your first one";

export const GUIDES: HelpGuide[] = [
  {
    n: "1",
    title: "How to price an experience without guessing",
    meta: "6 minutes · with a worked example in Naira",
    body: "Start with your day rate. If a private shoot is ₦50,000 for three hours, that is your floor for the same three hours. Divide it by the smallest group you would still run, which for most people is three or four, and that gives you the price that makes the day worth leaving the house for. Then look at what the seat is worth to the guest, not to you. Eight people at ₦10,000 is ₦80,000 and you keep ₦68,000, which is more than the private shoot for the same afternoon. Do not go below your floor to fill seats, because a full walk at the wrong price is a bad Saturday you agreed to.",
  },
  {
    n: "2",
    title: "Writing a description people actually finish",
    meta: "4 minutes · good and bad side by side",
    body: "Nobody books a list of stops. Answer three things: what will they feel, what do they leave with, and who is this not for. The last one matters most, because it is what stops the wrong guest booking and leaving you three stars. Write it the way you would say it out loud to a friend, then cut the first sentence, which is almost always throat clearing.",
  },
  {
    n: "3",
    title: "The guest who is late, drunk, or difficult",
    meta: "5 minutes · what we back you on",
    body: "You can refuse entry to anyone who is drunk or who is putting other guests at risk, and you keep the money. Tell us inside 24 hours with the booking reference and we handle the refund argument. For lateness, wait ten minutes at the meeting point and then go. Put the ten minutes in your listing so the guest agreed to it before they paid.",
  },
  {
    n: "4",
    title: "Safety on water, with food, and with children",
    meta: "7 minutes · certifications and when you need one",
    body: "On water you need enough life jackets for your maximum group, always, and a named boat operator. With food you say what you cannot work around rather than promising everything. Children under 16 need an adult on the booking. None of these need a certificate, but if you have one, upload it and a badge appears on your listing.",
  },
];

export const HELP_CARDS = {
  safety: {
    title: "When something goes wrong on the day",
    body: "What to do if a guest is hurt, if someone turns up drunk, if the weather turns, and what we cover. Four pages, no legal language.",
    action: "Read the safety rules",
  },
  community: {
    title: "Other hosts in Lagos",
    body: "There is a WhatsApp group of 40 hosts who mostly talk about pricing and difficult guests. We do not read it.",
    action: "Ask to join",
  },
};
