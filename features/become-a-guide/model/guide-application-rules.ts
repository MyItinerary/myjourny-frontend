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
