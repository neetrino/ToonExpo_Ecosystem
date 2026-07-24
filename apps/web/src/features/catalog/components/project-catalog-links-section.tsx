import type { JSX } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Badge, Box, Globe, Images, LayoutGrid, MapPinned, Sofa, Video, View } from 'lucide-react';

import type {
  ProjectCatalogLink,
  ProjectCatalogLinkId,
} from '@/features/catalog/utils/project-catalog-links';
import { cn } from '@/shared/ui/cn';

type ProjectCatalogLinksSectionProps = {
  links: ProjectCatalogLink[];
  labels: Record<ProjectCatalogLinkId, string>;
};

const LINK_ICON: Partial<Record<ProjectCatalogLinkId, LucideIcon>> = {
  exteriorRenders: Images,
  interiorRenders: Sofa,
  typicalInteractiveTour: View,
  video: Video,
  exteriorInteractiveTour: MapPinned,
  floorPlans2d: LayoutGrid,
  floorPlans3d: Box,
  logoBranding: Badge,
  website: Globe,
};

/** Figma `300:585` — Facebook “f” glyph (fill via `currentColor` / brand-deep). */
const FacebookGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 11 19"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M7.31437 18.395V10.1844H10.2091L10.6424 6.98452H7.31428V4.94155C7.31428 4.01512 7.58446 3.38381 8.97991 3.38381L10.7596 3.38301V0.521091C10.4518 0.482165 9.39527 0.39502 8.16628 0.39502C5.60026 0.39502 3.84352 1.88619 3.84352 4.62474V6.98452H0.941406V10.1844H3.84352V18.3949H7.31437V18.395Z" />
  </svg>
);

/** Figma `300:588` — Instagram glyph (fill via `currentColor` / brand-deep). */
const InstagramGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 19 19"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M9.85156 0.39502C13.4466 0.39502 15.2443 0.394824 16.5391 1.25146C17.1172 1.63402 17.6126 2.12936 17.9951 2.70752C18.8518 4.00225 18.8516 5.79995 18.8516 9.39502C18.8516 12.9901 18.8518 14.7878 17.9951 16.0825C17.6126 16.6607 17.1172 17.156 16.5391 17.5386C15.2443 18.3952 13.4466 18.395 9.85156 18.395C6.25649 18.395 4.45879 18.3952 3.16406 17.5386C2.5859 17.156 2.09056 16.6607 1.70801 16.0825C0.851367 14.7878 0.851563 12.9901 0.851563 9.39502C0.851563 5.79995 0.851367 4.00225 1.70801 2.70752C2.09056 2.12936 2.5859 1.63402 3.16406 1.25146C4.45879 0.394824 6.25649 0.39502 9.85156 0.39502ZM9.85059 4.73584C7.27737 4.73595 5.19143 6.82179 5.19141 9.39502C5.19141 11.9683 7.27736 14.0541 9.85059 14.0542C12.4239 14.0542 14.5098 11.9683 14.5098 9.39502C14.5097 6.82172 12.4239 4.73584 9.85059 4.73584ZM9.85059 6.31201C11.5533 6.31201 12.9336 7.69234 12.9336 9.39502C12.9336 11.0977 11.5533 12.478 9.85059 12.478C8.14798 12.4779 6.76758 11.0976 6.76758 9.39502C6.7676 7.69241 8.148 6.31212 9.85059 6.31201ZM14.6924 3.40674C14.0878 3.40679 13.5977 3.89689 13.5977 4.50146C13.5977 5.10609 14.0878 5.59614 14.6924 5.59619C15.297 5.59619 15.7871 5.10612 15.7871 4.50146C15.7871 3.89686 15.297 3.40674 14.6924 3.40674Z" />
  </svg>
);

const SOCIAL_GLYPH: Partial<
  Record<ProjectCatalogLinkId, (props: { className?: string }) => JSX.Element>
> = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
};

/**
 * Project catalog Links — same card grid as Key facts; title opens the URL.
 * Facebook / Instagram use Figma glyphs (`300:585`, `300:588`) inline — not R2.
 */
export const ProjectCatalogLinksSection = ({ links, labels }: ProjectCatalogLinksSectionProps) => {
  if (links.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {links.map((link) => {
        const LucideIcon = LINK_ICON[link.id];
        const SocialGlyph = SOCIAL_GLYPH[link.id];

        return (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex min-h-[4.5rem] items-center gap-3 rounded-[15px] border border-header-border',
                'bg-canvas px-4 py-3.5 transition-[transform,box-shadow,border-color] duration-200',
                'hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
              )}
            >
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg',
                  'bg-band-mist text-brand-deep',
                )}
                aria-hidden
              >
                {SocialGlyph ? (
                  <SocialGlyph className="size-4" />
                ) : LucideIcon ? (
                  <LucideIcon className="size-4" strokeWidth={2} />
                ) : null}
              </span>
              <span className="min-w-0 text-sm font-bold text-ink-navy">{labels[link.id]}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
};
