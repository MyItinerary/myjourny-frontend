export interface ShortVersionItem {
  id: string;
  text: string;
}

export interface BulletItem {
  boldPrefix?: string;
  text: string;
}

export interface TermsParagraph {
  number?: string;
  boldPrefix?: string;
  text: string;
  bullets?: Array<string | BulletItem>;
}

export interface TermsSection {
  id: string;
  number?: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  items: TermsParagraph[];
  bullets?: string[];
}

export interface TableOfContentsItem {
  id: string;
  label: string;
  isPartHeading?: boolean;
}

export interface TermsData {
  title: string;
  lastUpdated: string;
  companyAgreementText: string;
  agreementNoticeText: string;
  shortVersion: {
    title: string;
    disclaimer: string;
    items: ShortVersionItem[];
  };
  tableOfContents: TableOfContentsItem[];
  sections: TermsSection[];
}
