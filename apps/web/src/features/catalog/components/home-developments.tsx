import type { ProjectListItem } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { DevelopmentProgressCard } from '@/features/catalog/components/development-progress-card';
import { CATALOG_CARD_CELL_FILL_CLASS } from '@/features/catalog/constants/catalog-list';
import { HOME_FEATURED_PROJECT_LIMIT } from '@/features/catalog/constants/home-featured';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

type HomeDevelopmentsProps = {
  projects: ProjectListItem[];
};

/**
 * Under-construction developments band (Stage 5). The city map lives in `HomeMapSection`.
 */
export const HomeDevelopments = async ({ projects }: HomeDevelopmentsProps) => {
  const t = await getTranslations('HomePage.developments');
  const watchProjects = projects.slice(0, HOME_FEATURED_PROJECT_LIMIT);

  return (
    <section className="border-y border-header-border bg-band-mist/30">
      <div className="page-container section-pad">
        <Reveal>
          <SectionHeader
            eyebrow={t('eyebrow')}
            title={t('title')}
            action={
              <Link
                href="/projects"
                className="shrink-0 pb-1 text-sm font-semibold text-brand-deep transition-colors hover:text-brand-deep/80"
              >
                {t('viewAll')}
              </Link>
            }
          />
        </Reveal>

        {watchProjects.length === 0 ? (
          <EmptyState title={t('empty')} />
        ) : (
          <StaggerGroup
            className={cn(
              'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
              CATALOG_CARD_CELL_FILL_CLASS,
            )}
          >
            {watchProjects.map((project, index) => (
              <DevelopmentProgressCard key={project.id} project={project} priority={index === 0} />
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
};
