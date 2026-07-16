import type { Metadata } from 'next';

const DEFAULT_DESCRIPTION_MAX_LENGTH = 160;
const SITE_NAME = 'ToonExpo';

export function truncateSeoText(
  value: string | null | undefined,
  maxLength = DEFAULT_DESCRIPTION_MAX_LENGTH,
): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  const cut = trimmed.slice(0, maxLength - 1).trimEnd();
  return `${cut}…`;
}

export function buildAbsoluteUrl(appUrl: string, path: string): string {
  const base = appUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function buildEntityTitle(name: string, context?: string | null): string {
  const parts = [name.trim()];
  if (context?.trim()) {
    parts.push(context.trim());
  }
  parts.push(SITE_NAME);
  return parts.join(' · ');
}

export function buildEntityDescription(
  primary: string | null | undefined,
  fallback: string,
): string {
  return truncateSeoText(primary) ?? fallback;
}

type PublicPageMetadataInput = {
  titleName: string;
  titleContext?: string | null;
  description: string | null | undefined;
  descriptionFallback: string;
  path: string;
  appUrl: string;
  locale: string;
  imageUrl?: string | null;
};

export function buildPublicPageMetadata({
  titleName,
  titleContext,
  description,
  descriptionFallback,
  path,
  appUrl,
  locale,
  imageUrl,
}: PublicPageMetadataInput): Metadata {
  const title = buildEntityTitle(titleName, titleContext);
  const desc = buildEntityDescription(description, descriptionFallback);
  const canonical = buildAbsoluteUrl(appUrl, path);

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
  };
}

export { SITE_NAME };
