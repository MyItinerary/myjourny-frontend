// `hidden` keeps a link or column in the data for later without showing it in the footer.
export type FooterLink = { label: string; href: string; hidden?: boolean };

export type FooterLinkColumn = { heading: string; links: FooterLink[]; hidden?: boolean };

export type FooterSocialLink = { label: string; src: string; width: number };

export type FooterTab = { id: number; label: string; active: boolean };

export type FooterSubcategory = { id: number; label: string; href: string };
