import type { FooterLinkColumn, FooterSocialLink } from "./footer-content.types";

// Figma: "Footer" (2656:72994). Static copy for the link columns and legal row.
export const FOOTER_LINK_COLUMNS: FooterLinkColumn[] = [
  {
    heading: "Support",
    links: [
      "Help Center",
      "Safety Guide",
      "Report a safety concern",
      "Payment protection",
      "Cancellation and Refund Policy",
      "Contact us",
    ],
  },
  {
    heading: "Hosting and Curating",
    links: ["Become a host", "Host an event", "How hosting pays", "Host Terms", "Hosting responsibly"],
  },
  {
    heading: "Myjourny",
    links: ["Why book with us", "Experiences and events", "Blog", "Investors", "Gift cards"],
  },
];

export const FOOTER_LEGAL_LINKS = ["Privacy policy", "Terms of use", "Cookie policy", "Cookie preferences"];

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  { label: "LinkedIn", src: "/icons/footer/linkedin.svg", width: 18 },
  { label: "X", src: "/icons/footer/x.svg", width: 20 },
  { label: "Instagram", src: "/icons/footer/instagram.svg", width: 18 },
];
