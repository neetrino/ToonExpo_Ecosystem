'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import type { CrmDealSheetTab } from '@/features/crm-board/constants';

type TabIndicator = {
  left: number;
  width: number;
};

type UseCrmDealTabIndicatorResult = {
  listRef: RefObject<HTMLDivElement | null>;
  setTabRef: (tab: CrmDealSheetTab) => (node: HTMLButtonElement | null) => void;
  indicator: TabIndicator;
};

/**
 * Measures the active CRM sheet tab so the underline can slide between labels.
 */
export const useCrmDealTabIndicator = (active: CrmDealSheetTab): UseCrmDealTabIndicatorResult => {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<CrmDealSheetTab, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState<TabIndicator>({ left: 0, width: 0 });

  const setTabRef = useCallback(
    (tab: CrmDealSheetTab) => (node: HTMLButtonElement | null) => {
      tabRefs.current[tab] = node;
    },
    [],
  );

  useLayoutEffect(() => {
    const updateIndicator = (): void => {
      const list = listRef.current;
      const tab = tabRefs.current[active];
      if (!list || !tab) {
        return;
      }
      setIndicator({
        left: tab.offsetLeft - list.scrollLeft,
        width: tab.offsetWidth,
      });
    };

    updateIndicator();
    const list = listRef.current;
    const resizeObserver = list ? new ResizeObserver(updateIndicator) : null;
    if (list) {
      resizeObserver?.observe(list);
    }
    window.addEventListener('resize', updateIndicator);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [active]);

  return { listRef, setTabRef, indicator };
};
