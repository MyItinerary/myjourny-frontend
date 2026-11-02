import type { ListingStatus } from "./home.types";

export type ProfilePaneKey = "personal" | "public" | "verify" | "notify" | "payouts" | "tax" | "security";

/** What a row's button does: a change we can't save yet, or a trip to another page. */
export type ProfileRowLink = "earnings" | "help";

export type ProfileRow = {
  label: string;
  value: string;
  /** "Edit", "Add", "View"... */
  action: string;
  /** Greyed, for "Not provided". */
  muted?: boolean;
  chip?: { text: string; kind: ListingStatus };
  help?: string;
  link?: ProfileRowLink;
};

export type SetupTask = { title: string; body: string; pane: ProfilePaneKey; done: boolean };

export type ProfileDocument = { name: string; sub: string; checked: boolean; action: string };

export type ProfileStatement = { year: string; sub: string };

export type PublicPreview = {
  name: string;
  /** "Photographer · Lagos · hosting since 2026" */
  line: string;
  badges: string[];
  bio: string;
  /** "English, Yoruba and Pidgin" */
  languages: string;
};

/** Where WhatsApp, SMS, email and push reach the host, for each thing that happens. */
export type NotificationRow = { label: string; channels: [boolean, boolean, boolean, boolean] };

export type PayoutSchedule = "booking" | "weekly";

export type HostProfile = {
  /** Set while the host still has to finish getting set up. */
  setup: SetupTask[] | null;
  /** Verification steps still to do, shown on the nav item. */
  verifyLeft: number;
  rows: Record<Exclude<ProfilePaneKey, "notify">, ProfileRow[]>;
  notifications: NotificationRow[];
  schedule: PayoutSchedule;
  statements: ProfileStatement[];
  documents: ProfileDocument[];
  preview: PublicPreview;
  /** What's holding up closing the account. */
  closing: { upcoming: number; guests: number };
};
