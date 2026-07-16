import { slugSchema } from '@toonexpo/contracts';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPublicBuilderBySlug } from '@/lib/builders/queries';
import { loadWebEnv } from '@/lib/env';
import { buildBuilderOrganizationJsonLd } from '@/lib/seo/json-ld';
import { JsonLdScript } from '@/lib/seo/json-ld-script';
import { buildPublicPageMetadata } from '@/lib/seo/metadata';

import { BuilderDetailView } from './builder-detail-view';

type BuilderDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: BuilderDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    return {};
  }

  const builder = await getPublicBuilderBySlug(parsedSlug.data);
  if (!builder) {
    return {};
  }

  const { APP_URL } = loadWebEnv();
  const t = await getTranslations({ locale, namespace: 'catalog.builders' });

  return buildPublicPageMetadata({
    titleName: builder.name,
    description: builder.description,
    descriptionFallback: t('detail.seoFallback', { name: builder.name }),
    path: `/${locale}/builders/${builder.slug}`,
    appUrl: APP_URL,
    locale,
    imageUrl: builder.logoUrl,
  });
}

export default async function BuilderDetailPage({ params }: BuilderDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    notFound();
  }

  const builder = await getPublicBuilderBySlug(parsedSlug.data);
  if (!builder) {
    notFound();
  }

  const t = await getTranslations('catalog.builders');

  return (
    <section className="catalog-page">
      <JsonLdScript data={buildBuilderOrganizationJsonLd(builder, locale, loadWebEnv().APP_URL)} />
      <BuilderDetailView
        builder={builder}
        labels={{
          contacts: t('detail.contacts'),
          phone: t('detail.phone'),
          email: t('detail.email'),
          website: t('detail.website'),
          city: t('detail.city'),
          address: t('detail.address'),
          projects: t('detail.projects'),
          noValue: t('detail.noValue'),
        }}
      />
    </section>
  );
}
