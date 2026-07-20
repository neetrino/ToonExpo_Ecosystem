import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getPublicPartnerBySlug } from '@/features/catalog/api/partners-api';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { FeaturedBadge } from '@/features/partners/components/partner-badges';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { SiteHeader } from '@/shared/ui/site-header';

type PartnerDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const loadPartner = cache(async (slug: string, locale: string) => {
  try {
    return await getPublicPartnerBySlug(slug, { locale });
  } catch {
    return null;
  }
});

export const generateMetadata = async ({ params }: PartnerDetailPageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const partner = await loadPartner(slug, locale);

  if (!partner) {
    return { title: t('partnersPage.notFoundTitle') };
  }

  return {
    title: partner.name,
    description: partner.shortDescription ?? t('partnersPage.metaFallback', { name: partner.name }),
  };
};

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const partner = await loadPartner(slug, locale);
  if (!partner) {
    notFound();
  }

  const t = await getTranslations('Catalog.partnersPage');
  const socialEntries = partner.socialLinks ? Object.entries(partner.socialLinks) : [];
  const hasContacts =
    Boolean(partner.contacts?.phone) ||
    Boolean(partner.contacts?.email) ||
    Boolean(partner.website) ||
    socialEntries.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate h-[min(40vh,320px)] w-full overflow-hidden bg-surface">
          {partner.coverUrl ? (
            <Image
              src={partner.coverUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="relative mx-auto flex h-full w-full max-w-content items-end gap-4 px-6 pb-8">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-sm border border-border bg-background">
              {partner.logoUrl ? (
                <Image
                  src={partner.logoUrl}
                  alt={partner.name}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              ) : (
                <div className="flex size-full items-center justify-center font-brand text-lg font-bold text-brand">
                  {partner.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-ink sm:text-3xl">{partner.name}</h1>
                <FeaturedBadge featured={partner.featured} />
              </div>
              <p className="mt-1 text-sm text-ink-secondary">
                <PartnerTypeLabel type={partner.type} />
              </p>
            </div>
          </div>
        </section>

        <div
          className={
            hasContacts
              ? 'mx-auto grid w-full max-w-content gap-10 px-6 py-10 lg:grid-cols-[2fr_1fr]'
              : 'mx-auto grid w-full max-w-content gap-10 px-6 py-10'
          }
        >
          <section className="flex flex-col gap-6">
            {partner.shortDescription ? (
              <p className="text-base text-ink-secondary">{partner.shortDescription}</p>
            ) : null}
            {partner.fullDescription ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {partner.fullDescription}
              </div>
            ) : null}

            {partner.offers.length > 0 ? (
              <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-ink">{t('detail.offersTitle')}</h2>
                <ul className="flex flex-col gap-3">
                  {partner.offers.map((offer) => (
                    <li key={offer.id} className="rounded-sm border border-border bg-surface p-4">
                      <h3 className="font-medium text-ink">{offer.title}</h3>
                      {offer.description ? (
                        <p className="mt-2 text-sm text-ink-secondary">{offer.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </section>

          {hasContacts ? (
            <aside className="flex flex-col gap-4">
              <div className="rounded-sm border border-border bg-surface p-4">
                <h2 className="text-sm font-semibold text-ink">{t('detail.contactsTitle')}</h2>
                <dl className="mt-3 flex flex-col gap-2 text-sm">
                  {partner.contacts?.phone ? (
                    <ContactRow label={t('detail.phone')} value={partner.contacts.phone} />
                  ) : null}
                  {partner.contacts?.email ? (
                    <ContactRow
                      label={t('detail.email')}
                      value={partner.contacts.email}
                      href={`mailto:${partner.contacts.email}`}
                    />
                  ) : null}
                  {partner.website ? (
                    <ContactRow
                      label={t('detail.website')}
                      value={partner.website}
                      href={partner.website}
                    />
                  ) : null}
                </dl>
                {socialEntries.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-2 text-sm">
                    {socialEntries.map(([key, url]) => (
                      <li key={key}>
                        <a
                          href={url}
                          className="font-medium text-brand hover:underline"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {key}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </aside>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const ContactRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
    <dd className="text-ink">
      {href ? (
        <a href={href} className="font-medium text-brand hover:underline">
          {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);
