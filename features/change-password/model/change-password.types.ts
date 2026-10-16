export type PasswordField = "current" | "next" | "confirm";

export type PasswordValues = Record<PasswordField, string>;

/** A message per field, plus `form` for a failure that belongs to no field. */
export type PasswordErrors = Partial<Record<PasswordField | "form", string>>;
