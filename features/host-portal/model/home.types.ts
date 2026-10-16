export type ListingStatus = "Live" | "Draft" | "In review" | "Hidden" | "Paused" | "Sold out" | "Archived" | "Rejected";

export type HomeStat = {
  label: string;
  value: string;
  note: string;
  /** green: good news; muted: plain fact. */
  tone: "green" | "muted";
};

export type HomeAttention = {
  id: string;
  title: string;
  sub: string;
  timer: string;
  /** Red and filled when it can't wait; amber and outlined otherwise. */
  urgent: boolean;
  action: string;
  href: string;
};

export type HomeListing = {
  id: string;
  imageUrl: string;
  status: ListingStatus;
  title: string;
  meta: string;
  href: string;
};

export type HomeReview = { name: string; stars: number; when: string; text: string };

export type HomeNextExperience = {
  title: string;
  when: string;
  guests: string;
  payout: string;
  meeting: string;
  href: string;
};

/** What the host's Home needs. */
export type HostHomeData = {
  stats: HomeStat[];
  attention: HomeAttention[];
  listings: HomeListing[];
  earnings: { total: string; months: { month: string; amountK: number }[] };
  next: HomeNextExperience | null;
  reviews: HomeReview[];
};

/** "empty" is a host who is approved but hasn't listed anything yet. */
export type HostHomeState = { kind: "empty" } | { kind: "full"; data: HostHomeData };
