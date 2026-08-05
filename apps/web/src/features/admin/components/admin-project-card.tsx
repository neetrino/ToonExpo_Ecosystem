'use client';

import type { AdminProjectListItem, PublicationStatus } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import {
  Building,
  Building2,
  CheckCircle2,
  CircleDashed,
  Home,
  MapPin,
  QrCode,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ProjectQrDialog } from '@/features/builder/components/project-qr-dialog';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';

type AdminProjectCardProps = {
  project: AdminProjectListItem;
};

const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  published: 'bg-success-soft text-success',
  draft: 'bg-surface text-ink-muted',
  archived: 'bg-warning-soft text-warning',
};

type AdminProjectImageProps = {
  project: AdminProjectListItem;
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

const AdminProjectImage = ({ project }: AdminProjectImageProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const cover = project.buildingCover;
  const imageSource =
    toSafeImageSource(cover?.media.thumbnailUrl) ?? toSafeImageSource(cover?.media.fileUrl);
  const validImageSource = imageFailed ? undefined : imageSource;

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className={cn(
        'relative block aspect-[16/10] overflow-hidden rounded-md bg-surface',
        'ring-1 ring-ink/5 ring-inset',
      )}
    >
      {validImageSource && cover ? (
        <Image
          src={validImageSource}
          alt={cover.media.altText?.trim() || `${cover.buildingName} — ${project.name}`}
          fill
          className={cn(
            'object-cover transition-transform duration-[var(--duration-slow)]',
            'ease-[var(--ease-out-premium)] group-hover:scale-[1.03]',
            'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          onError={() => {
            setImageFailed(true);
          }}
        />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-2 text-ink-muted">
          <Building2 className="size-8 opacity-50" aria-hidden />
          <span className="max-w-[80%] truncate text-sm">{project.name}</span>
        </span>
      )}
    </Link>
  );
};

type AdminProjectStatProps = {
  icon: LucideIcon;
  label: string;
  value: number;
};

const AdminProjectStat = ({ icon: Icon, label, value }: AdminProjectStatProps) => {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
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
    </span>
  );
};

/**
 * Wide project card for the admin projects hub.
 */
export const AdminProjectCard = ({ project }: AdminProjectCardProps) => {
  const t = useTranslations('Admin.projects');
  const tQr = useTranslations('Builder.projects.qr');
  const StatusIcon = project.publicationStatus === 'published' ? CheckCircle2 : CircleDashed;
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <>
      <article
        className={cn(
          'group flex h-full flex-col rounded-lg bg-surface-elevated p-2 shadow-xs',
          'ring-1 ring-border transition-all duration-[var(--duration-base)]',
          'ease-[var(--ease-out-premium)] hover:-translate-y-0.5 hover:shadow-card',
          'hover:ring-brand/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        )}
      >
        <AdminProjectImage key={project.buildingCover?.media.id ?? 'fallback'} project={project} />

        <div className="flex flex-1 items-start gap-3 px-2 pt-4 sm:px-3">
          <Link
            href={`/admin/projects/${project.id}`}
            className="flex min-w-0 flex-1 flex-col active:scale-[0.995]"
          >
            <h2
              className={cn(
                'truncate font-brand text-lg font-semibold tracking-[-0.02em] text-ink',
                'transition-colors duration-[var(--duration-fast)] group-hover:text-brand-deep',
              )}
            >
              {project.name}
            </h2>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-ink-secondary">
              <span className="inline-flex min-w-0 items-center gap-2">
                <Building2 className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                <span className="truncate">{project.companyName}</span>
              </span>
              <span className="inline-flex min-w-0 items-center gap-2">
                <MapPin className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                <span className="truncate">{project.city ?? '—'}</span>
              </span>
            </div>
          </Link>

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

        <div
          className={cn(
            'mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border/70',
            'px-2 pt-3 pb-1 sm:px-3',
          )}
        >
          <AdminProjectStat
            icon={Building}
            label={t('columns.buildings')}
            value={project.buildingsCount}
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
