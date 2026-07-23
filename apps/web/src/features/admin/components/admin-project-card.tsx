'use client';

import type { AdminProjectListItem, PublicationStatus } from '@toonexpo/contracts';
import { Building, Building2, CheckCircle2, CircleDashed, Home, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type AdminProjectCardProps = {
  project: AdminProjectListItem;
};

const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  published: 'bg-success-soft text-success',
  draft: 'bg-surface text-ink-muted',
  archived: 'bg-warning-soft text-warning',
};

/**
 * Wide project card for the admin projects hub.
 */
export const AdminProjectCard = ({ project }: AdminProjectCardProps) => {
  const t = useTranslations('Admin.projects');
  const StatusIcon = project.publicationStatus === 'published' ? CheckCircle2 : CircleDashed;

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg bg-surface-elevated shadow-xs',
        'transition-[box-shadow,transform] duration-[var(--duration-fast)]',
        'hover:shadow-sm active:scale-[0.995]',
      )}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-ink">
            {project.name}
          </h2>
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
    </Link>
  );
};
