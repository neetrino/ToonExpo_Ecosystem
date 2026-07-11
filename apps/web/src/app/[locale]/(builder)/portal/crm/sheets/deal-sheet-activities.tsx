'use client';

import { DEAL_ACTIVITY_BODY_MAX_LENGTH } from '@toonexpo/contracts';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useRefreshOnFormSuccess } from '@/components/portal-forms/use-refresh-on-form-success';
import { INITIAL_CRM_FORM_ACTION_STATE } from '@/lib/crm/action-state';
import { addDealCommentFormAction, addDealFollowUpFormAction } from '@/lib/crm/form-actions';

type SerializableDealActivity = {
  id: string;
  type: 'COMMENT' | 'FOLLOW_UP' | 'STATUS_CHANGE';
  body: string;
  createdAt: string;
  authorName: string | null;
};

type DealSheetActivitiesProps = {
  locale: string;
  dealId: string;
  activities: SerializableDealActivity[];
  labels: {
    title: string;
    empty: string;
    comment: string;
    followUp: string;
    submitComment: string;
    submitFollowUp: string;
    nextFollowUpAt: string;
    types: Record<SerializableDealActivity['type'], string>;
    noAuthor: string;
  };
  formatDateTime: (iso: string) => string;
};

export function DealSheetActivities({
  locale,
  dealId,
  activities,
  labels,
  formatDateTime,
}: DealSheetActivitiesProps) {
  return (
    <section className="crm-deal-sheet__section">
      <h4 className="crm-deal-sheet__section-title">{labels.title}</h4>

      {activities.length === 0 ? (
        <p className="crm-deal-sheet__empty">{labels.empty}</p>
      ) : (
        <ul className="crm-deal-sheet__activities">
          {activities.map((activity) => (
            <li key={activity.id} className="crm-deal-sheet__activity">
              <p className="crm-deal-sheet__activity-type">{labels.types[activity.type]}</p>
              <p className="crm-deal-sheet__activity-body">{activity.body}</p>
              <p className="crm-deal-sheet__activity-meta">
                <span>{activity.authorName ?? labels.noAuthor}</span>
                <span>{formatDateTime(activity.createdAt)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      <DealCommentForm locale={locale} dealId={dealId} labels={labels} />
      <DealFollowUpForm locale={locale} dealId={dealId} labels={labels} />
    </section>
  );
}

function DealCommentForm({
  locale,
  dealId,
  labels,
}: {
  locale: string;
  dealId: string;
  labels: DealSheetActivitiesProps['labels'];
}) {
  const [state, formAction, pending] = useActionState(
    addDealCommentFormAction.bind(null, locale),
    INITIAL_CRM_FORM_ACTION_STATE,
  );

  useRefreshOnFormSuccess(state, true);

  return (
    <form action={formAction} className="crm-deal-sheet__activity-form portal-form">
      <input type="hidden" name="dealId" value={dealId} />
      <PortalFormField label={labels.comment} name="body">
        <PortalTextArea name="body" required maxLength={DEAL_ACTIVITY_BODY_MAX_LENGTH} rows={3} />
      </PortalFormField>
      <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />
      <div className="portal-form__actions">
        <button
          type="submit"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          disabled={pending}
        >
          {labels.submitComment}
        </button>
      </div>
    </form>
  );
}

function DealFollowUpForm({
  locale,
  dealId,
  labels,
}: {
  locale: string;
  dealId: string;
  labels: DealSheetActivitiesProps['labels'];
}) {
  const [state, formAction, pending] = useActionState(
    addDealFollowUpFormAction.bind(null, locale),
    INITIAL_CRM_FORM_ACTION_STATE,
  );

  useRefreshOnFormSuccess(state, true);

  return (
    <form action={formAction} className="crm-deal-sheet__activity-form portal-form">
      <input type="hidden" name="dealId" value={dealId} />
      <PortalFormField label={labels.followUp} name="body">
        <PortalTextArea name="body" required maxLength={DEAL_ACTIVITY_BODY_MAX_LENGTH} rows={3} />
      </PortalFormField>
      <PortalFormField label={labels.nextFollowUpAt} name="nextFollowUpAt">
        <PortalTextInput name="nextFollowUpAt" type="datetime-local" />
      </PortalFormField>
      <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />
      <div className="portal-form__actions">
        <button
          type="submit"
          className="portal-btn portal-btn--primary portal-btn--sm"
          disabled={pending}
        >
          {labels.submitFollowUp}
        </button>
      </div>
    </form>
  );
}
