import type { BuilderSummary } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { BuilderCard } from '@/features/catalog/components/builder-card';
import { CATALOG_CARD_CELL_FILL_CLASS } from '@/features/catalog/constants/catalog-list';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

type HomeBuildersProps = {
  builders: BuilderSummary[];
};

/**
 * Home builders strip with link to exhibitors (builders tab).
 */
export const HomeBuilders = async ({ builders }: HomeBuildersProps) => {
  const t = await getTranslations('HomePage');

  return (
    <section className="section-pad bg-surface">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            eyebrow={t('builders.eyebrow')}
            title={t('builders.title')}
            action={
              <Link
                href="/partners?type=builder"
                className="text-sm font-semibold text-ink transition-colors hover:text-brand"
              >
                {t('builders.viewAll')}
              </Link>
            }
          />
        </Reveal>

        {builders.length === 0 ? (
          <EmptyState title={t('builders.empty')} />
        ) : (
          <StaggerGroup
            className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', CATALOG_CARD_CELL_FILL_CLASS)}
          >
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
};
