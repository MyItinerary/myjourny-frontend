import type { FooterLink, FooterLinkColumn, FooterSocialLink } from "./footer-content.types";

// Figma: "Footer" (2656:72994). Static copy for the link columns and legal row.

// Safety concerns and general questions go straight to the team by email.
export const CONTACT_MAILTO = "mailto:hello@myjourny.io";
export const SAFETY_MAILTO = CONTACT_MAILTO;

export const FOOTER_LINK_COLUMNS: FooterLinkColumn[] = [
  {
    heading: "Support",
    links: [
      { label: "Safety Guide", href: "/legal/safety" },
      { label: "Report a safety concern", href: CONTACT_MAILTO },
      { label: "Cancellation and Refund Policy", href: "/legal/cancellations" },
      { label: "Terms of use", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Community guidelines and review policy", href: "/legal/community-guidelines" },
      { label: "Blog", href: "#" },
      { label: "Contact us", href: CONTACT_MAILTO },
    ],
  },
  {
    heading: "Hosting and Curating",
    links: [
      { label: "Become a host", href: "/become-a-guide" },
      { label: "Host Terms", href: "/legal/hosts" },
    ],
  },
];

// The policies live in the Support column; the bottom row keeps only Cookie preferences,
// which the Cookie Policy tells people to look for "in the footer of any page".
export const FOOTER_LEGAL_LINKS: FooterLink[] = [{ label: "Cookie preferences", href: "/legal/cookies" }];

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  { label: "LinkedIn", src: "/icons/footer/linkedin.svg", width: 18 },
  { label: "X", src: "/icons/footer/x.svg", width: 20 },
  { label: "Instagram", src: "/icons/footer/instagram.svg", width: 18 },
];
