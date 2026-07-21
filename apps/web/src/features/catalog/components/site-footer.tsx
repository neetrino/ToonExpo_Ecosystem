import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';

/**
 * Public site footer with marketplace, company, and contact columns.
 */
export const SiteFooter = async () => {
  const t = await getTranslations('Footer');

  return (
    <footer className="border-t border-border/80 bg-surface-inverse text-on-dark">
      <div className="page-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <BrandLogo inverted />
          <p className="max-w-sm text-sm leading-relaxed text-on-dark/70">{t('tagline')}</p>
          <div className="pt-2">
            <LocaleSwitcher tone="dark" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
            {t('marketplace')}
          </p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-on-dark/70">
            <li>
              <Link href="/projects" className="transition-colors hover:text-on-dark">
                {t('links.projects')}
              </Link>
            </li>
            <li>
              <Link href="/builders" className="transition-colors hover:text-on-dark">
                {t('links.builders')}
              </Link>
            </li>
            <li>
              <Link href="/partners" className="transition-colors hover:text-on-dark">
                {t('links.partners')}
              </Link>
            </li>
            <li>
              <Link href="/mortgage" className="transition-colors hover:text-on-dark">
                {t('links.mortgage')}
              </Link>
            </li>
            <li>
              <Link href="/expo" className="transition-colors hover:text-on-dark">
                {t('links.expo')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {t('company')}
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-on-dark/70">
              <li>
                <Link href="/auth/register" className="transition-colors hover:text-on-dark">
                  {t('links.register')}
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="transition-colors hover:text-on-dark">
                  {t('links.login')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {t('contact')}
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-on-dark/70">
              <li>
                <a
                  href={`mailto:${t('contactEmail')}`}
                  className="transition-colors hover:text-on-dark"
                >
                  {t('contactEmail')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-on-dark/50">{t('trust')}</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-on-dark/45">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
