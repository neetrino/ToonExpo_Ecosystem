import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

/**
 * Shared not-found UI for missing catalog entities and unknown routes.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations('NotFound');

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-lg flex-col items-start gap-4 px-6 py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-ink-muted">404</p>
        <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('description')}</p>
        <Link
          href="/"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-pill bg-cta-dark px-5 text-sm font-medium text-on-dark"
        >
          {t('home')}
        </Link>
      </main>
    </div>
  );
}
