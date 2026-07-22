import type { ProjectListItem } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { NewDevelopmentRowCard } from '@/features/catalog/components/new-development-row-card';
import { EmptyState } from '@/shared/ui/empty-state';

type NewDevelopmentsViewProps = {
  projects: ProjectListItem[];
};

/**
 * New Developments marketing list — Figma frame `103:2407` (hero + feature rows).
 */
export const NewDevelopmentsView = async ({ projects }: NewDevelopmentsViewProps) => {
  const t = await getTranslations('DevelopmentsPage');

  return (
    <>
      <section className="-mt-[4.5rem] border-b border-header-border bg-band-mist/30 pt-[4.5rem]">
        <div className="page-container pt-[clamp(3.5rem,8vw,5.5rem)] pb-[clamp(4rem,9vw,6.5rem)]">
          <p className="text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 max-w-3xl font-brand text-[clamp(2.25rem,5.5vw,3.5rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-header-muted">{t('subtitle')}</p>
        </div>
      </section>

      <section className="page-container py-16 pb-24">
        {projects.length === 0 ? (
          <EmptyState title={t('empty')} />
        ) : (
          <div className="flex flex-col gap-10">
            {projects.map((project, index) => (
              <NewDevelopmentRowCard
                key={project.id}
                project={project}
                imageSide={index % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
};
