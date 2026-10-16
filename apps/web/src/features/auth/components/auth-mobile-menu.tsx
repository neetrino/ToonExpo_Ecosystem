'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { SITE_HEADER_HREF_PAGE_KEY } from '@/features/catalog/constants/public-site-pages';
import { usePublicSitePages } from '@/features/catalog/providers/public-site-pages-provider';
import { usePathname } from '@/i18n/navigation';
import { lockBodyScrollSoft, unlockBodyScrollSoft } from '@/shared/ui/body-scroll-lock';
import { BurgerMenuIcon } from '@/shared/ui/burger-menu-icon';
import { IconButton } from '@/shared/ui/icon-button';
import {
  BURGER_MENU_MS,
  isSiteHeaderNavActive,
  SITE_HEADER_MOBILE_NAV_HREFS,
} from '@/shared/ui/site-header.constants';
import { SiteHeaderMobileNav } from '@/shared/ui/site-header-mobile-nav';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';

/**
 * Mobile burger on the login header — same drawer as the public site header.
 */
export const AuthMobileMenu = () => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const { isPageEnabled } = usePublicSitePages();
  const [open, setOpen] = useState(false);
  const { rendered, visible } = useDrawerTransition(open, BURGER_MENU_MS);
  const navItems = SITE_HEADER_MOBILE_NAV_HREFS.filter((item) =>
    isPageEnabled(SITE_HEADER_HREF_PAGE_KEY[item.href]),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!rendered) {
      return;
    }
    lockBodyScrollSoft();
    return () => {
      unlockBodyScrollSoft();
    };
  }, [rendered]);

  return (
    <div className="relative lg:hidden">
      <IconButton
        label={t('menu')}
        className="rounded-full"
        style={{ ['--burger-icon-ms' as string]: `${BURGER_MENU_MS}ms` }}
        variant="outline"
        size="md"
        aria-expanded={open || rendered}
        aria-controls="mobile-nav"
        onClick={() => setOpen((current) => !current)}
      >
        <BurgerMenuIcon open={open} />
      </IconButton>
      {rendered ? (
        <div className="absolute top-full right-0 z-10 mt-2 w-[min(20rem,calc(100vw-2.5rem))]">
          <SiteHeaderMobileNav
            navItems={navItems}
            pathname={pathname}
            onClose={() => setOpen(false)}
            isNavActive={isSiteHeaderNavActive}
            visible={visible}
            durationMs={BURGER_MENU_MS}
          />
        </div>
      ) : null}
    </div>
  );
};
