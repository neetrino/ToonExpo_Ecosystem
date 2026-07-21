import type { BuilderSummary } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { BuilderCard } from '@/features/catalog/components/builder-card';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

type HomeBuildersProps = {
  builders: BuilderSummary[];
};

/**
 * Home builders strip with link to full builders page.
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
                href="/builders"
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
          <StaggerGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
};
