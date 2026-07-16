'use client';

import type { DealStage, RequestSource } from '@toonexpo/domain';
import { DEAL_STAGES } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';

import { CrmStageSelect } from './crm-stage-select';

export type CrmDealCardData = {
  id: string;
  stage: DealStage;
  source: RequestSource;
  contactName: string | null;
  projectName: string | null;
  apartmentCount: number;
  assigneeName: string | null;
  lastActivityLabel: string | null;
  isFollowUpOverdue: boolean;
};

type CrmDealCardProps = {
  locale: string;
  deal: CrmDealCardData;
  labels: {
    unnamedContact: string;
    noProject: string;
    noAssignee: string;
    noActivity: string;
    apartmentCount: string;
    source: Record<RequestSource, string>;
  };
  onOpen: (dealId: string) => void;
};

export function CrmDealCard({ locale, deal, labels, onOpen }: CrmDealCardProps) {
  const cardClassName = deal.isFollowUpOverdue
    ? 'crm-deal-card crm-deal-card--overdue'
    : 'crm-deal-card';

  return (
    <article className={cardClassName}>
      <button type="button" className="crm-deal-card__open" onClick={() => onOpen(deal.id)}>
        <p className="crm-deal-card__name">{deal.contactName ?? labels.unnamedContact}</p>
        <p className="crm-deal-card__project">{deal.projectName ?? labels.noProject}</p>
        <p className="crm-deal-card__meta">
          <span>{labels.apartmentCount.replace('{count}', String(deal.apartmentCount))}</span>
          <span>{labels.source[deal.source]}</span>
        </p>
        <p className="crm-deal-card__footer">
          <span>{deal.assigneeName ?? labels.noAssignee}</span>
          <span>{deal.lastActivityLabel ?? labels.noActivity}</span>
        </p>
      </button>
      <CrmStageSelect
        locale={locale}
        dealId={deal.id}
        currentStage={deal.stage}
        stages={DEAL_STAGES}
        compact
      />
    </article>
  );
}

type CrmViewToggleProps = {
  view: 'board' | 'list';
  labels: {
    board: string;
    list: string;
  };
};

export function CrmViewToggle({ view, labels }: CrmViewToggleProps) {
  return (
    <div className="portal-filter" role="group" aria-label={labels.board}>
      <Link
        className={
          view === 'board'
            ? 'portal-filter__link portal-filter__link--active'
            : 'portal-filter__link'
        }
        href="/portal/crm"
      >
        {labels.board}
      </Link>
      <Link
        className={
          view === 'list'
            ? 'portal-filter__link portal-filter__link--active'
            : 'portal-filter__link'
        }
        href="/portal/crm?view=list"
      >
        {labels.list}
      </Link>
    </div>
  );
}
