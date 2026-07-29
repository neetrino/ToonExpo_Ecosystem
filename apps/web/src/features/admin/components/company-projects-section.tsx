'use client';

import type { AdminCompanyProjectListItem, PublicationStatus } from '@toonexpo/contracts';
import { CheckCircle2, CircleDashed, FolderKanban } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { useAdminCompanyProjectsQuery } from '@/features/admin/hooks/use-admin-companies';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { Skeleton } from '@/shared/ui/skeleton';

type CompanyProjectsSectionProps = {
  companyId: string;
};

const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  published: 'bg-success-soft text-success',
  draft: 'bg-surface text-ink-muted',
  archived: 'bg-warning-soft text-warning',
};

type ProjectRowProps = {
  project: AdminCompanyProjectListItem;
};

const ProjectRow = ({ project }: ProjectRowProps) => {
  const t = useTranslations('Admin.projects');
  const locale = useLocale();
  const StatusIcon = project.publicationStatus === 'published' ? CheckCircle2 : CircleDashed;
  const createdLabel = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(project.createdAt));

  return (
    <li>
      <Link
        href={`/admin/projects/${project.id}`}
        className={cn(
          'flex items-start gap-3 rounded-md border border-border bg-surface px-3 py-3',
          'transition-colors hover:border-border-strong hover:bg-surface-elevated',
        )}
      >
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand">
          <FolderKanban className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{createdLabel}</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium',
            STATUS_BADGE_CLASS[project.publicationStatus],
          )}
        >
          <StatusIcon className="size-3" aria-hidden />
          {t(`publication.${project.publicationStatus}`)}
        </span>
      </Link>
    </li>
  );
};

/**
 * Lists every project for a company inside the admin company detail sheet.
 */
export const CompanyProjectsSection = ({ companyId }: CompanyProjectsSectionProps) => {
  const t = useTranslations('Admin.companies.detail.projects');
  const query = useAdminCompanyProjectsQuery(companyId);

  return (
    <section className="flex flex-col gap-3" aria-labelledby="company-projects-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="company-projects-heading" className="text-sm font-semibold text-ink">
          {t('title')}
        </h3>
        {query.data ? (
          <p className="text-xs text-ink-muted">{t('count', { count: query.data.data.length })}</p>
        ) : null}
      </div>

      {query.isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : null}

      {query.isError ? (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      ) : null}

      {query.data && query.data.data.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-ink-secondary">
          {t('empty')}
        </p>
      ) : null}

      {query.data && query.data.data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {query.data.data.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </ul>
      ) : null}
    </section>
  );
};
