import { getTranslations } from 'next-intl/server';

/**
 * Desktop landing for `/admin` — mobile shows AdminMobileHub instead.
 */
export const AdminHomePage = async () => {
  const t = await getTranslations('Admin.home');

  return (
    <div className="hidden md:block">
      <h1 className="text-page-title text-ink">{t('title')}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">{t('subtitle')}</p>
    </div>
  );
};
