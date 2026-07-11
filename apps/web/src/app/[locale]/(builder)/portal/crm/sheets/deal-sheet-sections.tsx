'use client';

import type { DealStage, RequestSource } from '@toonexpo/domain';
import { DEAL_STAGES } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { PortalSelect } from '@/components/portal-forms/form-fields';
import { useRefreshOnFormSuccess } from '@/components/portal-forms/use-refresh-on-form-success';
import type { CompanyMemberOption } from '@/lib/crm/member-queries';
import { INITIAL_CRM_FORM_ACTION_STATE } from '@/lib/crm/action-state';
import { assignDealFormAction } from '@/lib/crm/form-actions';

import { CrmStageSelect } from '../crm-stage-select';

type DealSheetHeaderProps = {
  locale: string;
  dealId: string;
  stage: DealStage;
  source: RequestSource;
  contactName: string | null;
  createdAtLabel: string;
  assigneeUserId: string | null;
  members: CompanyMemberOption[];
  sourceLabel: string;
  unnamedContact: string;
};

export function DealSheetHeader({
  locale,
  dealId,
  stage,
  contactName,
  createdAtLabel,
  assigneeUserId,
  members,
  sourceLabel,
  unnamedContact,
}: DealSheetHeaderProps) {
  const t = useTranslations('portal.crm.dealSheet');

  return (
    <header className="crm-deal-sheet__header">
      <div className="crm-deal-sheet__heading">
        <h3 className="crm-deal-sheet__title">{contactName ?? unnamedContact}</h3>
      </div>
      <dl className="crm-deal-sheet__meta">
        <div>
          <dt>{t('source')}</dt>
          <dd>{sourceLabel}</dd>
        </div>
        <div>
          <dt>{t('createdAt')}</dt>
          <dd>{createdAtLabel}</dd>
        </div>
      </dl>
      <div className="crm-deal-sheet__controls">
        <label className="crm-deal-sheet__control">
          <span>{t('stage')}</span>
          <CrmStageSelect
            locale={locale}
            dealId={dealId}
            currentStage={stage}
            stages={DEAL_STAGES}
          />
        </label>
        <DealAssigneeSelect
          locale={locale}
          dealId={dealId}
          assigneeUserId={assigneeUserId}
          members={members}
          label={t('assignee')}
          unassignedLabel={t('unassigned')}
        />
      </div>
    </header>
  );
}

type DealAssigneeSelectProps = {
  locale: string;
  dealId: string;
  assigneeUserId: string | null;
  members: CompanyMemberOption[];
  label: string;
  unassignedLabel: string;
};

function DealAssigneeSelect({
  locale,
  dealId,
  assigneeUserId,
  members,
  label,
  unassignedLabel,
}: DealAssigneeSelectProps) {
  const [state, formAction, pending] = useActionState(
    assignDealFormAction.bind(null, locale),
    INITIAL_CRM_FORM_ACTION_STATE,
  );

  useRefreshOnFormSuccess(state, true);

  return (
    <form
      action={formAction}
      className="crm-deal-sheet__control"
      onChange={(event) => {
        if (event.target instanceof HTMLSelectElement) {
          event.currentTarget.requestSubmit();
        }
      }}
    >
      <input type="hidden" name="dealId" value={dealId} />
      <label>
        <span>{label}</span>
        <PortalSelect name="assigneeUserId" defaultValue={assigneeUserId ?? ''} disabled={pending}>
          <option value="">{unassignedLabel}</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </PortalSelect>
      </label>
      <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />
    </form>
  );
}

type DealSheetContactProps = {
  contactPhone: string | null;
  contactEmail: string | null;
  hasBuyerLink: boolean;
  message: string | null;
  labels: {
    title: string;
    phone: string;
    email: string;
    buyerLinked: string;
    message: string;
    noValue: string;
  };
};

export function DealSheetContact({
  contactPhone,
  contactEmail,
  hasBuyerLink,
  message,
  labels,
}: DealSheetContactProps) {
  return (
    <section className="crm-deal-sheet__section">
      <h4 className="crm-deal-sheet__section-title">{labels.title}</h4>
      <dl className="crm-deal-sheet__details">
        <div>
          <dt>{labels.phone}</dt>
          <dd>{contactPhone ?? labels.noValue}</dd>
        </div>
        <div>
          <dt>{labels.email}</dt>
          <dd>{contactEmail ?? labels.noValue}</dd>
        </div>
        {hasBuyerLink ? (
          <div>
            <dt>{labels.buyerLinked}</dt>
            <dd>{labels.buyerLinked}</dd>
          </div>
        ) : null}
        {message ? (
          <div>
            <dt>{labels.message}</dt>
            <dd>{message}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
