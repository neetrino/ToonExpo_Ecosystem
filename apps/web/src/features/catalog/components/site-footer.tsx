import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';

/**
 * Public site footer — light marketplace chrome matching Figma `81:459`.
 */
export const SiteFooter = async () => {
  const t = await getTranslations('Footer');
  const tNav = await getTranslations('Nav');

  return (
    <footer className="hidden border-t border-header-border bg-canvas lg:block">
      <div className="page-container pt-12 pb-4">
        <div className="mb-16 flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md shrink-0">
            <BrandLogo />
            <p className="mt-8 text-sm leading-[1.625] text-header-muted">{t('tagline')}</p>
          </div>

          <div className="flex flex-wrap gap-12 sm:gap-16 md:gap-20 lg:gap-24 md:justify-end md:text-right">
            <div>
              <p className="font-brand text-xs font-bold tracking-[0.1em] text-ink-navy uppercase">
                {t('marketplace')}
              </p>
              <ul className="mt-9 flex flex-col gap-3 text-sm text-header-muted">
                <li>
                  <Link href="/apartments" className="transition-colors hover:text-brand-deep">
                    {tNav('buy')}
                  </Link>
                </li>
                <li>
                  <Link href="/developments" className="transition-colors hover:text-brand-deep">
                    {tNav('newDevelopments')}
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className="transition-colors hover:text-brand-deep">
                    {tNav('partners')}
                  </Link>
                </li>
                <li>
                  <Link href="/mortgage" className="transition-colors hover:text-brand-deep">
                    {tNav('mortgage')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-brand text-xs font-bold tracking-[0.1em] text-ink-navy uppercase">
                {t('company')}
              </p>
              <ul className="mt-9 flex flex-col gap-3 text-sm text-header-muted">
                <li>
                  <Link href="/" className="transition-colors hover:text-brand-deep">
                    {t('links.about')}
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${t('contactEmail')}`}
                    className="transition-colors hover:text-brand-deep"
                  >
                    {t('links.press')}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${t('contactEmail')}`}
                    className="transition-colors hover:text-brand-deep"
                  >
                    {t('links.contact')}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${t('contactEmail')}`}
                    className="transition-colors hover:text-brand-deep"
                  >
                    {t('privacy')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-6 border-t border-header-border pt-8 pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-[10px] tracking-widest text-header-muted uppercase">
            {t('copyrightPrefix')}{' '}
            <a
              href="https://neetrino.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand transition-colors hover:text-brand-hover"
            >
              {t('copyrightCompany')}
            </a>
            . {t('copyrightSuffix')}
          </p>
          <div className="flex items-center gap-3 text-xs font-medium text-header-muted">
            <span className="inline-flex size-4 items-center justify-center rounded-pill bg-brand-secondary/10">
              <Image
                src="/brand/footer-check.svg"
                alt=""
                width={10}
                height={10}
                className="size-2.5"
                unoptimized
              />
            </span>
            <p>{t('trust')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
