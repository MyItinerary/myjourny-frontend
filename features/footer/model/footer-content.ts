import type { FooterLink, FooterLinkColumn, FooterSocialLink } from "./footer-content.types";

// Figma: "Footer" (2656:72994). Static copy for the link columns and legal row.

// Safety concerns and general questions go straight to the team by email.
export const CONTACT_MAILTO = "mailto:hello@myjourny.io";

// QA asked for some links to come off the footer, but they're wanted later, so they're
// marked hidden rather than deleted. Remove `hidden` to bring one back.
export const FOOTER_LINK_COLUMNS: FooterLinkColumn[] = [
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "#", hidden: true },
      { label: "Safety Guide", href: "/legal/safety" },
      { label: "Report a safety concern", href: CONTACT_MAILTO },
      { label: "Payment protection", href: "#", hidden: true },
      { label: "Cancellation and Refund Policy", href: "/legal/cancellations" },
      { label: "Contact us", href: CONTACT_MAILTO },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Hosting and Curating",
    links: [
      { label: "Become a host", href: "/become-a-guide" },
      { label: "Host an event", href: "#", hidden: true },
      { label: "How hosting pays", href: "#", hidden: true },
      { label: "Host Terms", href: "/legal/hosts" },
      { label: "Hosting responsibly", href: "#", hidden: true },
    ],
  },
  {
    heading: "Myjourny",
    hidden: true,
    links: [
      { label: "Why book with us", href: "#" },
      { label: "Experiences", href: "/experiences" },
      { label: "Investors", href: "#" },
      { label: "Gift cards", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of use", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Community guidelines and review policy", href: "/legal/community-guidelines" },
    ],
  },
];

// The columns and links people see: everything not marked hidden.
export function visibleFooterColumns(columns: FooterLinkColumn[]): FooterLinkColumn[] {
  return columns
    .filter((column) => !column.hidden)
    .map((column) => ({ ...column, links: column.links.filter((link) => !link.hidden) }));
}

// The policies live in the Legal column; the bottom row keeps only Cookie preferences,
// which the Cookie Policy tells people to look for "in the footer of any page".
export const FOOTER_LEGAL_LINKS: FooterLink[] = [{ label: "Cookie preferences", href: "/legal/cookies" }];

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  { label: "LinkedIn", src: "/icons/footer/linkedin.svg", width: 18 },
  { label: "X", src: "/icons/footer/x.svg", width: 20 },
  { label: "Instagram", src: "/icons/footer/instagram.svg", width: 18 },
];
