'use client';

import type { AdminProjectListItem, PublicationStatus } from '@toonexpo/contracts';
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
      className="relative block aspect-[16/9] overflow-hidden bg-surface"
    >
      {validImageSource && cover ? (
        <Image
          src={validImageSource}
          alt={cover.media.altText?.trim() || `${cover.buildingName} — ${project.name}`}
          fill
          className="object-cover"
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
          'flex h-full flex-col overflow-hidden rounded-lg bg-surface-elevated shadow-xs',
          'transition-[box-shadow,transform] duration-[var(--duration-fast)]',
          'hover:shadow-sm',
        )}
      >
        <AdminProjectImage key={project.buildingCover?.media.id ?? 'fallback'} project={project} />

        <div className="flex flex-1 gap-2 p-4">
          <Link
            href={`/admin/projects/${project.id}`}
            className="flex min-w-0 flex-1 flex-col active:scale-[0.995]"
          >
            <h2 className="text-base font-semibold tracking-tight text-ink">{project.name}</h2>
            <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">{project.companyName}</span>
              </span>
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">{project.city ?? '—'}</span>
              </span>
            </div>
          </Link>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
                STATUS_BADGE_CLASS[project.publicationStatus],
              )}
            >
              <StatusIcon className="size-3.5" aria-hidden />
              {t(`publication.${project.publicationStatus}`)}
            </span>
            <IconButton
              label={tQr('open')}
              variant="soft"
              size="md"
              onClick={() => {
                setQrOpen(true);
              }}
            >
              <QrCode className="size-4" aria-hidden />
            </IconButton>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
              aria-hidden
            >
              <Building className="size-4" strokeWidth={2} />
            </span>
            <span className="text-sm text-ink-secondary">{t('columns.buildings')}</span>
            <span className="text-lg font-semibold tracking-tight text-ink">
              {project.buildingsCount}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
              aria-hidden
            >
              <Home className="size-4" strokeWidth={2} />
            </span>
            <span className="text-sm text-ink-secondary">{t('columns.apartments')}</span>
            <span className="text-lg font-semibold tracking-tight text-ink">
              {project.apartmentsCount}
            </span>
          </div>
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
