'use client';

import type { CrmDealListItem } from '@toonexpo/contracts';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  CRM_DEAL_URL_PARAM,
  findCrmDealByUrlName,
  getCrmDealUrlName,
} from '@/features/crm-board/crm-deal-url';
import { usePathname, useRouter } from '@/i18n/navigation';

type UseCrmDealSheetUrlResult = {
  selectedDealId: string | null;
  openDeal: (dealId: string) => void;
  closeDeal: () => void;
};

/**
 * Keeps the CRM deal SideSheet open across refresh via `?deal=<buyer name>`.
 */
export const useCrmDealSheetUrl = (deals: readonly CrmDealListItem[]): UseCrmDealSheetUrlResult => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const dealParam = searchParams.get(CRM_DEAL_URL_PARAM)?.trim() || null;

  const replaceDealParam = useCallback(
    (name: string | null): void => {
      const next = new URLSearchParams(searchParams.toString());
      if (name) {
        next.set(CRM_DEAL_URL_PARAM, name);
      } else {
        next.delete(CRM_DEAL_URL_PARAM);
      }
      const query = next.toString();
      const href = query.length > 0 ? `${pathname}?${query}` : pathname;
      router.replace(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!dealParam) {
      setSelectedDealId(null);
      return;
    }
    const match = findCrmDealByUrlName(deals, dealParam);
    if (match) {
      setSelectedDealId(match.id);
    }
  }, [dealParam, deals]);

  useEffect(() => {
    if (!selectedDealId || dealParam) {
      return;
    }
    const deal = deals.find((item) => item.id === selectedDealId);
    if (deal) {
      replaceDealParam(getCrmDealUrlName(deal));
    }
  }, [selectedDealId, dealParam, deals, replaceDealParam]);

  const openDeal = useCallback(
    (dealId: string): void => {
      setSelectedDealId(dealId);
      const deal = deals.find((item) => item.id === dealId);
      if (deal) {
        replaceDealParam(getCrmDealUrlName(deal));
      }
    },
    [deals, replaceDealParam],
  );

  const closeDeal = useCallback((): void => {
    setSelectedDealId(null);
    replaceDealParam(null);
  }, [replaceDealParam]);

  return { selectedDealId, openDeal, closeDeal };
};
