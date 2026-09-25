import type { PublicSitePageKey, PublicSitePages } from '@toonexpo/contracts';
import { PUBLIC_SITE_PAGE_KEYS } from '@toonexpo/contracts';
import { Facebook, Instagram } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ComponentProps, ReactNode } from 'react';

import { getPublicSitePages } from '@/features/catalog/api/public-site-pages-api';
import { Link } from '@/i18n/navigation';

const FOOTER_SOCIAL = [
  {
    id: 'facebook',
    href: 'https://www.facebook.com/toonexporealestate',
    icon: Facebook,
  },
  {
    id: 'instagram',
    href: 'https://www.instagram.com/toon_expo/',
    icon: Instagram,
  },
] as const;

type AppHref = ComponentProps<typeof Link>['href'];

type FooterNavItem =
  | {
      label: string;
      href: AppHref;
      external?: false | undefined;
      pageKey?: PublicSitePageKey | undefined;
    }
  | { label: string; href: string; external: true; pageKey?: undefined };

const defaultPages = (): PublicSitePages => {
  const pages = {} as PublicSitePages;
  for (const key of PUBLIC_SITE_PAGE_KEYS) {
    pages[key] = true;
  }
  return pages;
};

type FooterColumn = {
  title: string;
  items: readonly FooterNavItem[];
};

/**
 * Public site footer — marketplace sitemap + social.
 */
export const SiteFooter = async () => {
  const t = await getTranslations('Footer');
  const tNav = await getTranslations('Nav');
  const pages = await getPublicSitePages()
    .then((response) => response.pages)
    .catch(() => defaultPages());
  const contactEmail = t('contactEmail');
  const mail = (subject: string): string =>
    `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;

  const columns: readonly FooterColumn[] = [
    {
      title: t('marketplace'),
      items: [
        { label: tNav('buy'), href: '/apartments', pageKey: 'apartments' },
        { label: tNav('projects'), href: '/projects', pageKey: 'projects' },
        { label: t('links.specialOffers'), href: '/mortgage', pageKey: 'mortgage' },
        { label: tNav('geoMap'), href: '/map', pageKey: 'map' },
      ],
    },
    {
      title: t('developersPartners'),
      items: [
        { label: tNav('partners'), href: '/partners', pageKey: 'partners' },
        {
          label: t('links.becomePartner'),
          href: mail(t('links.becomePartner')),
          external: true,
        },
        {
          label: t('links.listProperty'),
          href: mail(t('links.listProperty')),
          external: true,
        },
      ],
    },
    {
      title: t('financeInsights'),
      items: [
        { label: tNav('mortgage'), href: '/mortgage', pageKey: 'mortgage' },
        {
          label: t('links.mortgageCalculator'),
          href: { pathname: '/mortgage', hash: 'calculator' },
          pageKey: 'mortgage',
        },
        { label: tNav('marketInsights'), href: '/insights', pageKey: 'insights' },
        { label: t('links.marketReports'), href: '/insights', pageKey: 'insights' },
      ],
    },
    {
      title: t('resources'),
      items: [
        { label: t('links.faq'), href: mail(t('links.faq')), external: true },
        {
          label: t('links.helpCenter'),
          href: mail(t('links.helpCenter')),
          external: true,
        },
      ],
    },
    {
      title: t('company'),
      items: [
        { label: t('links.about'), href: '/' },
        {
          label: t('links.contact'),
          href: `mailto:${contactEmail}`,
          external: true,
        },
      ],
    },
    {
      title: t('legal'),
      items: [
        {
          label: t('links.privacyPolicy'),
          href: mail(t('links.privacyPolicy')),
          external: true,
        },
        {
          label: t('links.terms'),
          href: mail(t('links.terms')),
          external: true,
        },
        {
          label: t('links.cookiePolicy'),
          href: mail(t('links.cookiePolicy')),
          external: true,
        },
      ],
    },
  ];

  const visibleColumns = columns
    .map((column) => ({
      ...column,
      items: column.items.filter((item) => !item.pageKey || pages[item.pageKey] !== false),
    }))
    .filter((column) => column.items.length > 0);

  return (
    <footer className="hidden border-t border-header-border bg-canvas lg:block">
      <div className="page-container pt-12 pb-4">
        <div className="mb-12 flex justify-between gap-8">
          {visibleColumns.map((column) => (
            <FooterNavColumn key={column.title} title={column.title} items={column.items} />
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-header-border pt-8 pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-xs tracking-wider text-header-muted uppercase">
            {t('copyrightPrefix')} {t('copyrightSuffix')} {t('copyrightCreatedBy')}{' '}
            <a
              href="https://neetrino.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand transition-colors hover:text-brand-hover"
            >
              {t('copyrightCompany')}
            </a>
            .
          </p>

          <ul className="flex items-center gap-3" aria-label={t('socialLabel')}>
            {FOOTER_SOCIAL.map(({ id, href, icon: Icon }) => (
              <li key={id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-[10px] text-header-muted transition-colors hover:bg-brand-deep/[0.06] hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30"
                  aria-label={t(`social.${id}`)}
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

const FooterNavColumn = ({
  title,
  items,
}: {
  title: string;
  items: readonly FooterNavItem[];
}): ReactNode => (
  <div>
    <p className="font-brand text-xs font-bold tracking-[0.1em] text-ink-navy uppercase whitespace-nowrap">
      {title}
    </p>
    <ul className="mt-6 flex flex-col gap-3 text-sm text-header-muted">
      {items.map((item) => (
        <li key={item.label}>
          <FooterNavLink item={item} />
        </li>
      ))}
    </ul>
  </div>
);

const FooterNavLink = ({ item }: { item: FooterNavItem }): ReactNode => {
  const className = 'transition-colors hover:text-brand-deep';

  if (item.external) {
    return (
      <a href={item.href} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
};
