'use client';

import type { CrmDealDetail } from '@toonexpo/contracts';
import { useRef, type ReactNode } from 'react';

import {
  CRM_DEAL_SHEET_TABS,
  type CrmBoardMode,
  type CrmDealSheetTab,
} from '@/features/crm-board/constants';
import { CrmDealPaymentsReadonly } from '@/features/crm-board/crm-deal-payments-readonly';
import { CrmDealReadonlyExtras } from '@/features/crm-board/crm-deal-readonly-extras';

type CrmDealSheetPanelsProps = {
  deal: CrmDealDetail;
  tab: CrmDealSheetTab;
  mode: CrmBoardMode;
  dealPanel?: ReactNode;
  paymentPanel?: ReactNode;
  notesPanel?: ReactNode;
};

const tabIndex = (tab: CrmDealSheetTab): number => CRM_DEAL_SHEET_TABS.indexOf(tab);

type CrmDealSheetAnimatedPanelProps = {
  tab: CrmDealSheetTab;
  children: ReactNode;
};

/**
 * Remounts tab content so the panel fades/slides with the underline.
 */
export const CrmDealSheetAnimatedPanel = ({
  tab,
  children,
}: CrmDealSheetAnimatedPanelProps) => {
  const previousTab = useRef(tab);
  const direction = tabIndex(tab) >= tabIndex(previousTab.current) ? 'forward' : 'back';
  previousTab.current = tab;

  return (
    <div
      id={`crm-sheet-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`crm-sheet-tab-${tab}`}
      className="crm-deal-sheet-panel"
    >
      <div key={tab} data-direction={direction} className="crm-deal-sheet-panel__inner">
        {children}
      </div>
    </div>
  );
};

/**
 * Active CRM sheet tab content (edit panels or read-only fallbacks).
 */
export const CrmDealSheetPanels = ({
  deal,
  tab,
  mode,
  dealPanel,
  paymentPanel,
  notesPanel,
}: CrmDealSheetPanelsProps) => {
  if (tab === 'deal') {
    if (mode === 'edit') {
      return dealPanel ?? null;
    }
    return <CrmDealReadonlyExtras deal={deal} variant="deal" />;
  }
  if (tab === 'payment') {
    return paymentPanel ?? <CrmDealPaymentsReadonly deal={deal} />;
  }
  return notesPanel ?? <CrmDealReadonlyExtras deal={deal} variant="notes" />;
};
