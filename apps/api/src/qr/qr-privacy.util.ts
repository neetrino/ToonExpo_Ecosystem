/**
 * Masks a phone number for privacy-safe partial display.
 * Keeps country-ish prefix and last 2 digits when long enough.
 */
export const maskPhone = (phone: string): string => {
  const trimmed = phone.trim();
  if (trimmed.length <= 4) {
    return "*".repeat(trimmed.length);
  }

  const visibleTail = 2;
  const visibleHead = Math.min(4, trimmed.length - visibleTail);
  const maskedCount = trimmed.length - visibleHead - visibleTail;
  return `${trimmed.slice(0, visibleHead)}${"*".repeat(maskedCount)}${trimmed.slice(-visibleTail)}`;
};

/**
 * Masks an email for privacy-safe partial display (a***@domain.tld).
 */
export const maskEmail = (email: string): string => {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) {
    return "***";
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const visibleLocal = local.slice(0, 1);
  return `${visibleLocal}***@${domain}`;
};
