import type { FooterLink, FooterLinkColumn, FooterSocialLink } from "./footer-content.types";

// Figma: "Footer" (2656:72994). Static copy for the link columns and legal row.
export const FOOTER_LINK_COLUMNS: FooterLinkColumn[] = [
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Safety Guide", href: "/legal/safety" },
      { label: "Report a safety concern", href: "/legal/safety" },
      { label: "Payment protection", href: "#" },
      { label: "Cancellation and Refund Policy", href: "/legal/cancellations" },
      { label: "Contact us", href: "#" },
    ],
  },
  {
    heading: "Hosting and Curating",
    links: [
      { label: "Become a host", href: "#" },
      { label: "Host an event", href: "#" },
      { label: "How hosting pays", href: "#" },
      { label: "Host Terms", href: "/legal/hosts" },
      { label: "Hosting responsibly", href: "#" },
    ],
  },
  {
    heading: "Myjourny",
    links: [
      { label: "Why book with us", href: "#" },
      { label: "Experiences and events", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Investors", href: "#" },
      { label: "Gift cards", href: "#" },
    ],
  },
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy policy", href: "/legal/privacy" },
  { label: "Terms of use", href: "/legal/terms" },
  { label: "Cookie policy", href: "/legal/cookies" },
  { label: "Cookie preferences", href: "/legal/cookies" },
];

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  { label: "LinkedIn", src: "/icons/footer/linkedin.svg", width: 18 },
  { label: "X", src: "/icons/footer/x.svg", width: 20 },
  { label: "Instagram", src: "/icons/footer/instagram.svg", width: 18 },
];
