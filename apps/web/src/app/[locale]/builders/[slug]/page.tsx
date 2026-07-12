import { slugSchema } from '@toonexpo/contracts';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPublicBuilderBySlug } from '@/lib/builders/queries';

import { BuilderDetailView } from './builder-detail-view';

type BuilderDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

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
