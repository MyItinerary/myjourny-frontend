export type Country = {
  /** ISO 3166-1 alpha-2, e.g. "NG". */
  iso: string;
  name: string;
  /** Calling code without the plus, e.g. "234". */
  dial: string;
};
