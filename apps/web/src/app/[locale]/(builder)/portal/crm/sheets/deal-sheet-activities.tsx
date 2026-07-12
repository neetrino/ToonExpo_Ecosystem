'use client';

import type { ActivityStatus } from '@toonexpo/domain';
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
import { ACTIVITY_STATUS_BADGE_CLASS } from '@/lib/crm/crm-badges';
import {
  addDealCommentFormAction,
  addDealFollowUpFormAction,
  setActivityStatusFormAction,
} from '@/lib/crm/form-actions';
import { isFollowUpOverdue } from '@/lib/crm/format-crm-dates';

type SerializableDealActivity = {
  id: string;
  type: 'COMMENT' | 'FOLLOW_UP' | 'STATUS_CHANGE';
  body: string;
  status: ActivityStatus | null;
  dueAt: string | null;
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
    dueAt: string;
    markDone: string;
    markCancelled: string;
    types: Record<SerializableDealActivity['type'], string>;
    statuses: Record<ActivityStatus, string>;
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
            <DealActivityRow
              key={activity.id}
              locale={locale}
              activity={activity}
              labels={labels}
              formatDateTime={formatDateTime}
            />
          ))}
        </ul>
      )}

      <DealCommentForm locale={locale} dealId={dealId} labels={labels} />
      <DealFollowUpForm locale={locale} dealId={dealId} labels={labels} />
    </section>
  );
}

function activityRowClassName(activity: SerializableDealActivity): string {
  const base = 'crm-deal-sheet__activity';
  if (activity.type !== 'FOLLOW_UP' || activity.status === null) {
    return base;
  }
  if (activity.status === 'DONE' || activity.status === 'CANCELLED') {
    return `${base} crm-deal-sheet__activity--muted`;
  }
  if (activity.dueAt && isFollowUpOverdue(new Date(activity.dueAt))) {
    return `${base} crm-deal-sheet__activity--overdue`;
  }
  return base;
}

function DealActivityRow({
  locale,
  activity,
  labels,
  formatDateTime,
}: {
  locale: string;
  activity: SerializableDealActivity;
  labels: DealSheetActivitiesProps['labels'];
  formatDateTime: (iso: string) => string;
}) {
  const showFollowUpControls =
    activity.type === 'FOLLOW_UP' && activity.status === 'PLANNED';

  return (
    <li className={activityRowClassName(activity)}>
      <div className="crm-deal-sheet__activity-header">
        <p className="crm-deal-sheet__activity-type">{labels.types[activity.type]}</p>
        {activity.status ? (
          <span className={ACTIVITY_STATUS_BADGE_CLASS[activity.status]}>
            {labels.statuses[activity.status]}
          </span>
        ) : null}
      </div>
      <p className="crm-deal-sheet__activity-body">{activity.body}</p>
      <p className="crm-deal-sheet__activity-meta">
        <span>{activity.authorName ?? labels.noAuthor}</span>
        <span>{formatDateTime(activity.createdAt)}</span>
        {activity.dueAt ? (
          <span>
            {labels.dueAt}: {formatDateTime(activity.dueAt)}
          </span>
        ) : null}
      </p>
      {showFollowUpControls ? (
        <div className="crm-deal-sheet__activity-actions">
          <ActivityStatusButton locale={locale} activityId={activity.id} status="DONE" label={labels.markDone} />
          <ActivityStatusButton
            locale={locale}
            activityId={activity.id}
            status="CANCELLED"
            label={labels.markCancelled}
          />
        </div>
      ) : null}
    </li>
  );
}

function ActivityStatusButton({
  locale,
  activityId,
  status,
  label,
}: {
  locale: string;
  activityId: string;
  status: ActivityStatus;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(
    setActivityStatusFormAction.bind(null, locale),
    INITIAL_CRM_FORM_ACTION_STATE,
  );

  useRefreshOnFormSuccess(state, true);

  return (
    <form action={formAction} className="crm-deal-sheet__activity-status-form">
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="portal-btn portal-btn--ghost portal-btn--sm"
        disabled={pending}
      >
        {label}
      </button>
      <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />
    </form>
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
