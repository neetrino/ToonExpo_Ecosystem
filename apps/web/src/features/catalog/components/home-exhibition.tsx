import { Map, QrCode, ScanLine, Building2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

/**
 * Exhibition experience band — map, QR, visitor flow.
 */
export const HomeExhibition = async () => {
  const t = await getTranslations('HomePage');

  const items = [
    {
      icon: Map,
      title: t('exhibition.items.map.title'),
      body: t('exhibition.items.map.body'),
    },
    {
      icon: QrCode,
      title: t('exhibition.items.qr.title'),
      body: t('exhibition.items.qr.body'),
    },
    {
      icon: ScanLine,
      title: t('exhibition.items.scan.title'),
      body: t('exhibition.items.scan.body'),
    },
    {
      icon: Building2,
      title: t('exhibition.items.builders.title'),
      body: t('exhibition.items.builders.body'),
    },
  ] as const;

  return (
    <section className="section-pad bg-surface-inverse text-on-dark">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            className="[&_.text-eyebrow]:text-on-dark/50 [&_h2]:text-on-dark [&_p]:text-on-dark/70"
            eyebrow={t('exhibition.eyebrow')}
            title={t('exhibition.title')}
            description={t('exhibition.description')}
            action={
              <Link href="/expo">
                <Button
                  variant="outline"
                  className="border-on-dark/25 bg-transparent text-on-dark hover:bg-on-dark/10"
                >
                  {t('exhibition.cta')}
                </Button>
              </Link>
            }
          />
        </Reveal>
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-md border border-on-dark/10 bg-on-dark/5 p-5 backdrop-blur-sm"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-sm bg-brand/20 text-brand">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="text-sm font-semibold text-on-dark">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-dark/65">{item.body}</p>
              </article>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
};
