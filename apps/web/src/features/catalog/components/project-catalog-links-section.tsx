import type { LucideIcon } from 'lucide-react';
import { Badge, Box, Globe, Images, LayoutGrid, MapPinned, Sofa, Video, View } from 'lucide-react';
import Image from 'next/image';

import type {
  ProjectCatalogLink,
  ProjectCatalogLinkId,
} from '@/features/catalog/utils/project-catalog-links';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';
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

const SOCIAL_ICON_SRC: Partial<Record<ProjectCatalogLinkId, string>> = {
  facebook: staticAssetUrl('/images/social/facebook.webp'),
  instagram: staticAssetUrl('/images/social/instagram.webp'),
};

/**
 * Project catalog Links — same card grid as Key facts; title opens the URL.
 * Facebook / Instagram use Figma glyphs as WebP (`300:585`, `300:588`).
 */
export const ProjectCatalogLinksSection = ({ links, labels }: ProjectCatalogLinksSectionProps) => {
  if (links.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {links.map((link) => {
        const LucideIcon = LINK_ICON[link.id];
        const socialSrc = SOCIAL_ICON_SRC[link.id];

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
                {socialSrc ? (
                  <Image
                    src={socialSrc}
                    alt=""
                    width={16}
                    height={16}
                    className="size-4 object-contain"
                  />
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
