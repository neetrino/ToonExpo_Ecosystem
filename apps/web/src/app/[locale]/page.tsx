import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-lg text-[var(--te-muted)]">{t('subtitle')}</p>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded bg-[var(--te-accent)] px-4 py-2 text-sm font-medium" href="/">
          {t('ctaPublic')}
        </Link>
        <Link className="rounded border border-white/20 px-4 py-2 text-sm" href="/account">
          {t('ctaBuyer')}
        </Link>
        <Link className="rounded border border-white/20 px-4 py-2 text-sm" href="/portal">
          {t('ctaBuilder')}
        </Link>
        <Link className="rounded border border-white/20 px-4 py-2 text-sm" href="/admin">
          {t('ctaAdmin')}
        </Link>
      </div>
    </section>
  );
}
