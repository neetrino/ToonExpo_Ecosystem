/**
 * Validates a post-login return path (relative, same-origin only).
 */
export const sanitizeReturnUrl = (
  value: string | null | undefined,
  fallback = '/settings',
): string => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  if (trimmed.includes('://') || trimmed.includes('\\')) {
    return fallback;
  }

  return trimmed;
};
