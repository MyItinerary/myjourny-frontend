export interface ShortVersionItem {
  id: string;
  text: string;
}

export interface TermsParagraph {
  number?: string;
  boldPrefix?: string;
  text: string;
}

export interface TermsSection {
  id: string;
  number?: string;
  title: string;
  items: TermsParagraph[];
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
