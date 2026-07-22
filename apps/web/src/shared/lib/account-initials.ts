const INITIALS_MAX_LENGTH = 2;

/**
 * Derives up to two uppercase initials from a display name.
 */
export const getAccountInitials = (name: string): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, INITIALS_MAX_LENGTH).toUpperCase();
  }

  return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
};
