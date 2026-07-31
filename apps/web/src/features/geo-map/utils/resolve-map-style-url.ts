import { DEFAULT_MAP_STYLE_URL } from '@/features/geo-map/constants';

/**
 * Resolves the MapLibre style URL: `NEXT_PUBLIC_MAP_STYLE_URL` env override
 * (see `MAP_STYLE_URL_ENV_VAR`) when set, otherwise the free OpenFreeMap default.
 * Reads `process.env.NEXT_PUBLIC_MAP_STYLE_URL` as a literal so Next.js can inline it.
 */
export const resolveMapStyleUrl = (): string => {
  const configured =
    // @ts-expect-error Next.js inlining needs static property access, not index signature.
    (process.env.NEXT_PUBLIC_MAP_STYLE_URL as string | undefined)?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_MAP_STYLE_URL;
};
