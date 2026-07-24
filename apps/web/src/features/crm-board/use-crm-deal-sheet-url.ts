'use client';

import type { CrmDealListItem } from '@toonexpo/contracts';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  CRM_DEAL_URL_PARAM,
  CRM_VIEW_URL_PARAM,
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

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void): void => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
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
      replaceParams((params) => {
        params.delete(CRM_VIEW_URL_PARAM);
        params.set(CRM_DEAL_URL_PARAM, getCrmDealUrlName(deal));
      });
    }
  }, [selectedDealId, dealParam, deals, replaceParams]);

  const openDeal = useCallback(
    (dealId: string): void => {
      setSelectedDealId(dealId);
      const deal = deals.find((item) => item.id === dealId);
      if (deal) {
        replaceParams((params) => {
          params.delete(CRM_VIEW_URL_PARAM);
          params.set(CRM_DEAL_URL_PARAM, getCrmDealUrlName(deal));
        });
      }
    },
    [deals, replaceParams],
  );

  const closeDeal = useCallback((): void => {
    setSelectedDealId(null);
    replaceParams((params) => {
      params.delete(CRM_DEAL_URL_PARAM);
    });
  }, [replaceParams]);

  return { selectedDealId, openDeal, closeDeal };
};
