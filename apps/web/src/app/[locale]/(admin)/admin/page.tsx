import { getTranslations, setRequestLocale } from 'next-intl/server';

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('placeholders.admin');

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-[var(--te-muted)]">{t('description')}</p>
    </section>
  );
}
