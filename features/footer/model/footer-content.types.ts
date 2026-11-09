export type FooterLink = { label: string; href: string };

export type FooterLinkColumn = { heading: string; links: FooterLink[] };

export type FooterSocialLink = { label: string; src: string; width: number };

export type FooterTab = { id: number; label: string; active: boolean };

export type FooterSubcategory = { id: number; label: string; href: string };
