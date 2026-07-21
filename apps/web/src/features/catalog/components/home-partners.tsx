import type { PublicPartnerListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

type HomePartnersProps = {
  partners: PublicPartnerListItem[];
};

/**
 * Featured partners / banks strip for the homepage.
 */
export const HomePartners = async ({ partners }: HomePartnersProps) => {
  const t = await getTranslations('HomePage');
  const featured = partners.slice(0, 6);

  return (
    <section className="section-pad bg-surface">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            eyebrow={t('partners.eyebrow')}
            title={t('partners.title')}
            description={t('partners.description')}
            action={
              <Link
                href="/partners"
                className="text-sm font-semibold text-ink transition-colors hover:text-brand"
              >
                {t('partners.viewAll')}
              </Link>
            }
          />
        </Reveal>

        {featured.length === 0 ? (
          <EmptyState title={t('partners.empty')} />
        ) : (
          <StaggerGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((partner) => (
              <Link
                key={partner.id}
                href={`/partners/${partner.slug}`}
                className="group flex items-center gap-4 rounded-md border border-border bg-surface-elevated p-4 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-surface">
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      className="object-contain p-1.5"
                      sizes="56px"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs font-semibold text-ink-muted">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink group-hover:text-brand">
                    {partner.name}
                  </p>
                  {partner.shortDescription ? (
                    <p className="mt-1 line-clamp-2 text-xs text-ink-secondary">
                      {partner.shortDescription}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
};
