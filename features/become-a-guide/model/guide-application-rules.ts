// The same rules itin applies to POST /auth/register/guide, so mistakes show
// on the form instead of as a failed submit.

export const MIN_GUIDE_AGE = 18;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/** The full number as itin stores it: the country code, then the digits without a leading 0. */
export function fullPhoneNumber(countryCode: string, phoneNumber: string): string {
  return `${countryCode}${phoneNumber.replace(/[\s()-]/g, "").replace(/^0+/, "")}`;
}

export function isValidPhoneNumber(countryCode: string, phoneNumber: string): boolean {
  return /^\+?\d{7,15}$/.test(fullPhoneNumber(countryCode, phoneNumber));
}

/** The picker shows DD/MM/YYYY; the API wants YYYY-MM-DD. Null when it isn't a real date. */
export function dateOfBirthToIso(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isOldEnoughToGuide(isoDate: string, today: Date = new Date()): boolean {
  const [year, month, day] = isoDate.split("-").map(Number);
  const hadBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  return today.getFullYear() - year - (hadBirthday ? 0 : 1) >= MIN_GUIDE_AGE;
}

/** "Samuel" and "Okafor" as the one name itin keeps. */
export function fullNameOf(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

/** The account's name split back into first and last, for a signed-in applicant. */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

/** The password rules the form lists, each with whether it's met. */
export function passwordChecks(password: string): { label: string; met: boolean }[] {
  return [
    { label: "Between 8 and 30 characters", met: password.length >= 8 && password.length <= 30 },
    { label: "Include a number (1234) and one special character (#%!.^)", met: /\d/.test(password) && /[^A-Za-z0-9\s]/.test(password) },
    { label: "Uppercase (ABC) and lowercase (abc) letters", met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "No blank spaces", met: password.length > 0 && !/\s/.test(password) },
  ];
}

export const isStrongPassword = (password: string) => passwordChecks(password).every((c) => c.met);

/** "samuel.com" or "https://samuel.com/tours": a web address with a real-looking domain. */
export function isValidWebsite(value: string): boolean {
  const withScheme = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
  try {
    const url = new URL(withScheme);
    return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname);
  } catch {
    return false;
  }
}

/** The website as itin keeps it, with https:// in front. */
export function normalizeWebsite(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** A CAC number: RC or BN, then the digits, e.g. "RC1234566" or "BN 3456789". */
export function isValidCacNumber(value: string): boolean {
  return /^(RC|BN)\s?\d{4,8}$/i.test(value.trim());
}
