'use client';

import type { AdminProjectListItem, PublicationStatus } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import { Building, Building2, CheckCircle2, CircleDashed, Home, MapPin, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminFeaturedOnHomeButton } from '@/features/admin/components/admin-featured-on-home-button';
import { AdminInventoryCardMetaRow } from '@/features/admin/components/admin-inventory-card';
import { useSetAdminProjectFeaturedOnHomeMutation } from '@/features/admin/hooks/use-admin-companies';
import { ProjectQrDialog } from '@/features/builder/components/project-qr-dialog';
import { HOME_FEATURED_PROJECT_LIMIT } from '@/features/catalog/constants/home-featured';
import { Link } from '@/i18n/navigation';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const MEDIA_RADIUS_CLASS = 'rounded-[15px]';

type AdminProjectCardProps = {
  project: AdminProjectListItem;
  onOpenBuildings?: ((project: AdminProjectListItem) => void) | undefined;
};

const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  published: 'bg-success-soft text-success',
  draft: 'bg-surface text-ink-muted',
  archived: 'bg-warning-soft text-warning',
};

const toSafeImageSource = (value: string | null | undefined): string | undefined => {
  const source = value?.trim();
  if (!source) {
    return undefined;
  }
  if (source.startsWith('/')) {
    return source;
  }

  try {
    const url = new URL(source);
    return url.protocol === 'https:' || url.protocol === 'http:' ? source : undefined;
  } catch {
    return undefined;
  }
};

type AdminProjectImageProps = {
  project: AdminProjectListItem;
};

const AdminProjectImage = ({ project }: AdminProjectImageProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const cover = project.cover;
  const imageSource =
    toSafeImageSource(cover?.thumbnailUrl) ?? toSafeImageSource(cover?.fileUrl);
  const validImageSource = imageFailed ? undefined : imageSource;

  return (
    <div
      className={cn(
        'relative aspect-[16/10] w-full overflow-hidden bg-surface ring-1 ring-border/60',
        MEDIA_RADIUS_CLASS,
      )}
    >
      {validImageSource && cover ? (
        <Image
          src={validImageSource}
          alt={cover.altText?.trim() || project.name}
          fill
          className={cn(
            'object-cover transition-transform duration-[var(--duration-slow)]',
            'ease-[var(--ease-out-premium)] group-hover:scale-[1.04]',
            'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          onError={() => {
            setImageFailed(true);
          }}
        />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
          <Building2 className="size-8 opacity-40" aria-hidden />
          <span className="max-w-[80%] truncate text-xs">{project.name}</span>
        </span>
      )}
    </div>
  );
};

type AdminProjectStatProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  onClick?: (() => void) | undefined;
  buttonAriaLabel?: string | undefined;
};

const AdminProjectStat = ({
  icon: Icon,
  label,
  value,
  onClick,
  buttonAriaLabel,
}: AdminProjectStatProps) => {
  const body = (
    <>
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[11px] font-medium tracking-wide text-ink-muted uppercase">
          {label}
        </span>
        <span className="text-base font-semibold tabular-nums tracking-tight text-ink">
          {value}
        </span>
      </span>
    </>
  );

  if (!onClick) {
    return <span className="flex min-w-0 items-center gap-2.5">{body}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={buttonAriaLabel ?? label}
      className={cn(
        'flex min-w-0 items-center gap-2.5 rounded-sm text-left',
        'transition-colors duration-[var(--duration-fast)] hover:text-brand-deep',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
      )}
    >
      {body}
    </button>
  );
};

/**
 * KPI-style project card — company header, title, cover, inventory footer.
 */
export const AdminProjectCard = ({ project, onOpenBuildings }: AdminProjectCardProps) => {
  const t = useTranslations('Admin.projects');
  const tFeatured = useTranslations('Admin.featuredOnHome');
  const tQr = useTranslations('Builder.projects.qr');
  const StatusIcon = project.publicationStatus === 'published' ? CheckCircle2 : CircleDashed;
  const [qrOpen, setQrOpen] = useState(false);
  const featuredMutation = useSetAdminProjectFeaturedOnHomeMutation();
  const openBuildingsLabel = t('openBuildings', { name: project.name });

  return (
    <>
      <article
        className={cn(
          'group relative flex h-full flex-col gap-3.5 overflow-hidden border border-border/80',
          'bg-surface-elevated p-4 shadow-card sm:p-5',
          LIST_CARD_LIFT_CLASS,
          'rounded-[15px]',
        )}
      >
        <header className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <AdminListCardLogo
                name={project.companyName}
                logoUrl={resolvePublicAssetUrl(project.companyLogoUrl)}
                shape="circle"
                className="size-9"
              />
              <p className="min-w-0 truncate text-sm font-medium text-ink-secondary">
                {project.companyName}
              </p>
            </div>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
                STATUS_BADGE_CLASS[project.publicationStatus],
              )}
            >
              <StatusIcon className="size-3.5" aria-hidden />
              {t(`publication.${project.publicationStatus}`)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/admin/projects/${project.id}`}
              className={cn(
                'min-w-0 flex-1 text-lg font-semibold tracking-tight text-ink sm:text-xl',
                'transition-colors duration-[var(--duration-fast)] group-hover:text-brand-deep',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
              )}
            >
              {project.name}
            </Link>
            <AdminFeaturedOnHomeButton
              featuredOnHome={project.featuredOnHome}
              limitLabel={tFeatured('projectLimit', { count: HOME_FEATURED_PROJECT_LIMIT })}
              onToggle={async (next) =>
                featuredMutation.mutateAsync({
                  projectId: project.id,
                  featuredOnHome: next,
                })
              }
            />
          </div>
        </header>

        <Link
          href={`/admin/projects/${project.id}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          <AdminProjectImage key={project.cover?.id ?? 'fallback'} project={project} />
        </Link>

        {project.city ? (
          <AdminInventoryCardMetaRow icon={<MapPin className="size-3.5" strokeWidth={2} />}>
            {project.city}
          </AdminInventoryCardMetaRow>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border/70 pt-3">
          <AdminProjectStat
            icon={Building}
            label={t('columns.buildings')}
            value={project.buildingsCount}
            onClick={
              onOpenBuildings
                ? () => {
                    onOpenBuildings(project);
                  }
                : undefined
            }
            buttonAriaLabel={openBuildingsLabel}
          />
          <AdminProjectStat
            icon={Home}
            label={t('columns.apartments')}
            value={project.apartmentsCount}
          />
          <IconButton
            label={tQr('open')}
            variant="soft"
            size="md"
            className="ml-auto"
            onClick={() => {
              setQrOpen(true);
            }}
          >
            <QrCode className="size-4" aria-hidden />
          </IconButton>
        </div>
      </article>

      <ProjectQrDialog
        open={qrOpen}
        onClose={() => {
          setQrOpen(false);
        }}
        projectId={project.id}
        projectName={project.name}
        scope={{ mode: 'admin', companyId: project.builderCompanyId }}
      />
    </>
  );
};
