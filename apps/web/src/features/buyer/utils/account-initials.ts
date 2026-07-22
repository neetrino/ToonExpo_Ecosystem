/**
 * Builds up to two initials from a display name for avatar fallbacks.
 */
export const getAccountInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return '?';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
};
