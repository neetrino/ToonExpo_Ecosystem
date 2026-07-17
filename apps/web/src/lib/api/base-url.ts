import { loadWebEnv } from '@/lib/env';

/** Normalized Nest API origin (no trailing slash). */
export function resolveApiBaseUrl(): string {
  return loadWebEnv().NEXT_PUBLIC_API_URL.replace(/\/$/, '');
}

/** Join API base with a path, avoiding duplicated slashes. */
export function buildApiUrl(path: string): string {
  const base = resolveApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
