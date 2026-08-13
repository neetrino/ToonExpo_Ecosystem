const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * Turns a stored media `fileUrl` into a browser-loadable URL.
 * Root-relative demo/legacy paths (`/demo/...`) live on R2, not the Next origin.
 */
export const toPublicFileUrl = (fileUrl: string): string => {
  const trimmed = fileUrl.trim();
  if (!trimmed || HTTP_URL_PATTERN.test(trimmed) || !trimmed.startsWith('/')) {
    return trimmed;
  }

  const base = process.env['R2_PUBLIC_URL']?.trim();
  if (!base) {
    return trimmed;
  }

  return `${base.replace(/\/$/, '')}${trimmed}`;
};
