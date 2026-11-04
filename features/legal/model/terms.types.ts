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

export interface AtAGlanceItem {
  question: string;
  answer: string;
}

export interface SectionTable {
  headers: string[];
  rows: string[][];
  note?: string;
}

export interface SectionActionCard {
  label: string;
  buttonText: string;
}

export interface TermsSection {
  id: string;
  number?: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  items: TermsParagraph[];
  bullets?: string[];
  table?: SectionTable;
  note?: string;
  actionCard?: SectionActionCard;
}

export interface TableOfContentsItem {
  id: string;
  label: string;
  isPartHeading?: boolean;
}

export interface ReadNextItem {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

export interface DocumentQuestions {
  text: string;
  previousVersionsText?: string;
  previousVersionsHref?: string;
}

export interface TermsData {
  title: string;
  lastUpdated: string;
  companyAgreementText: string;
  agreementNoticeText: string;
  shortVersion?: {
    title: string;
    disclaimer: string;
    items: ShortVersionItem[];
  };
  atAGlance?: {
    title: string;
    items: AtAGlanceItem[];
  };
  readNext?: {
    title?: string;
    items: ReadNextItem[];
  };
  documentQuestions?: DocumentQuestions;
  tableOfContents: TableOfContentsItem[];
  sections: TermsSection[];
}
