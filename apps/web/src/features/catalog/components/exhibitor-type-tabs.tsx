'use client';

import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';

import { EXHIBITOR_TAB_SLIDE_MS, type ExhibitorTab } from '@/features/catalog/constants/exhibitor-tabs';
import { useExhibitorTabIndicator } from '@/features/catalog/hooks/use-exhibitor-tab-indicator';
import { buildExhibitorTabHref } from '@/features/catalog/utils/partner-filters';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ExhibitorTypeTabsProps = {
  activeTab: ExhibitorTab;
  visibleTabs: readonly ExhibitorTab[];
  onSelectTab: (tab: ExhibitorTab) => void;
};

type ExhibitorTabLinkProps = {
  tab: ExhibitorTab;
  label: string;
  isActive: boolean;
  onSelectTab: (tab: ExhibitorTab) => void;
};

const isModifiedClick = (event: MouseEvent<HTMLAnchorElement>): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const ExhibitorTabLink = ({ tab, label, isActive, onSelectTab }: ExhibitorTabLinkProps) => (
  <Link
    href={buildExhibitorTabHref(tab)}
    prefetch
    aria-current={isActive ? 'page' : undefined}
    onClick={(event) => {
      if (isModifiedClick(event)) {
        return;
      }
      event.preventDefault();
      onSelectTab(tab);
    }}
    className={cn(
      'inline-flex items-center px-3 py-2.5 text-sm whitespace-nowrap',
      'transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
      isActive ? 'font-semibold text-ink-navy' : 'font-medium text-header-muted hover:text-ink-navy',
    )}
  >
    {label}
  </Link>
);

/**
 * Public exhibitors category tabs — sliding underline + smooth horizontal scroll.
 */
export const ExhibitorTypeTabs = ({
  activeTab,
  visibleTabs,
  onSelectTab,
}: ExhibitorTypeTabsProps) => {
  const t = useTranslations('Catalog.partnersPage.tabs');
  const { scrollerRef, setTabRef, indicator } = useExhibitorTabIndicator(activeTab);

  return (
    <nav aria-label={t('ariaLabel')} className="-mx-1">
      <div
        ref={scrollerRef}
        className="no-scrollbar overflow-x-auto overscroll-x-contain scroll-smooth px-1"
      >
        <ul className="relative flex min-w-max items-end gap-1 border-b border-header-border">
          {visibleTabs.map((tab) => (
            <li key={tab} ref={setTabRef(tab)} className="shrink-0">
              <ExhibitorTabLink
                tab={tab}
                label={t(tab)}
                isActive={tab === activeTab}
                onSelectTab={onSelectTab}
              />
            </li>
          ))}
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute bottom-0 h-0.5 bg-brand',
              'transition-[left,width] duration-[var(--duration-slow)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none',
              indicator ? 'opacity-100' : 'opacity-0',
            )}
            style={
              indicator
                ? {
                    left: indicator.left,
                    width: indicator.width,
                    transitionDuration: `${EXHIBITOR_TAB_SLIDE_MS}ms`,
                  }
                : undefined
            }
          />
        </ul>
      </div>
    </nav>
  );
};
