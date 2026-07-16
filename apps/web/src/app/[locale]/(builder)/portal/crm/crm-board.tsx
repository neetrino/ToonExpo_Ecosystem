'use client';

import type { DealStage } from '@toonexpo/domain';

import { CrmDealCard, type CrmDealCardData } from './crm-deal-card';

type CrmBoardColumnData = {
  stage: DealStage;
  stageLabel: string;
  deals: CrmDealCardData[];
};

type CrmBoardProps = {
  locale: string;
  columns: CrmBoardColumnData[];
  labels: {
    unnamedContact: string;
    noProject: string;
    noAssignee: string;
    noActivity: string;
    apartmentCount: string;
    source: Record<CrmDealCardData['source'], string>;
  };
  onOpenDeal: (dealId: string) => void;
};

export function CrmBoard({ locale, columns, labels, onOpenDeal }: CrmBoardProps) {
  return (
    <div className="crm-board">
      {columns.map((column) => (
        <section key={column.stage} className="crm-board__column">
          <header className="crm-board__column-header">
            <h3 className="crm-board__column-title">{column.stageLabel}</h3>
            <span className="crm-board__count">{column.deals.length}</span>
          </header>
          <div className="crm-board__cards">
            {column.deals.map((deal) => (
              <CrmDealCard
                key={deal.id}
                locale={locale}
                deal={deal}
                labels={labels}
                onOpen={onOpenDeal}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
