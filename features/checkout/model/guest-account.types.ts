/** What the email check found. */
export type EmailLookup = {
  exists: boolean;
  /** False for an account made with Google only. */
  hasPassword: boolean;
};
