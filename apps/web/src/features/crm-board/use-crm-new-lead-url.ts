'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import {
  CRM_DEAL_URL_PARAM,
  CRM_VIEW_NEW_LEAD,
  CRM_VIEW_URL_PARAM,
} from '@/features/crm-board/crm-deal-url';
import { usePathname, useRouter } from '@/i18n/navigation';

type UseCrmNewLeadUrlResult = {
  isNewLeadOpen: boolean;
  openNewLead: () => void;
  closeNewLead: () => void;
};

/**
 * Keeps the CRM New lead modal open across refresh via `?view=new-lead`.
 */
export const useCrmNewLeadUrl = (): UseCrmNewLeadUrlResult => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNewLeadOpen = searchParams.get(CRM_VIEW_URL_PARAM) === CRM_VIEW_NEW_LEAD;

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

  const openNewLead = useCallback((): void => {
    replaceParams((params) => {
      params.delete(CRM_DEAL_URL_PARAM);
      params.set(CRM_VIEW_URL_PARAM, CRM_VIEW_NEW_LEAD);
    });
  }, [replaceParams]);

  const closeNewLead = useCallback((): void => {
    replaceParams((params) => {
      params.delete(CRM_VIEW_URL_PARAM);
    });
  }, [replaceParams]);

  return { isNewLeadOpen, openNewLead, closeNewLead };
};
