'use client';

import type { ApartmentStatus } from '@toonexpo/domain';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { PortalFormField, PortalSelect } from '@/components/portal-forms/form-fields';
import { useRefreshOnFormSuccess } from '@/components/portal-forms/use-refresh-on-form-success';
import type { ProjectApartmentGroup } from '@/lib/crm/apartment-link-queries';
import { APARTMENT_STATUS_BADGE_CLASS } from '@/lib/crm/crm-badges';
import { INITIAL_CRM_FORM_ACTION_STATE } from '@/lib/crm/action-state';
import { linkDealApartmentFormAction, unlinkDealApartmentFormAction } from '@/lib/crm/form-actions';
import type { DealDetailApartment } from '@/lib/crm/deal-queries';

type DealSheetApartmentsProps = {
  locale: string;
  dealId: string;
  projectId: string | null;
  apartments: DealDetailApartment[];
  apartmentGroups: ProjectApartmentGroup[];
  labels: {
    title: string;
    empty: string;
    emptyHint: string;
    link: string;
    unlink: string;
    project: string;
    apartment: string;
    noValue: string;
    status: Record<ApartmentStatus, string>;
    price: (value: string) => string;
    priceAtRequest: (value: string) => string;
  };
};

export function DealSheetApartments({
  locale,
  dealId,
  projectId,
  apartments,
  apartmentGroups,
  labels,
}: DealSheetApartmentsProps) {
  const linkedIds = new Set(apartments.map((apartment) => apartment.apartmentId));

  return (
    <section className="crm-deal-sheet__section">
      <h4 className="crm-deal-sheet__section-title">{labels.title}</h4>

      {apartments.length === 0 ? (
        <div className="crm-deal-sheet__empty">
          <p>{labels.empty}</p>
          <p className="crm-deal-sheet__empty-hint">{labels.emptyHint}</p>
        </div>
      ) : (
        <ul className="crm-deal-sheet__apartments">
          {apartments.map((apartment) => (
            <DealLinkedApartment
              key={apartment.apartmentId}
              locale={locale}
              dealId={dealId}
              apartment={apartment}
              labels={labels}
            />
          ))}
        </ul>
      )}

      <DealLinkApartmentForm
        locale={locale}
        dealId={dealId}
        projectId={projectId}
        apartmentGroups={apartmentGroups}
        linkedIds={linkedIds}
        labels={labels}
      />
    </section>
  );
}

type DealLinkedApartmentProps = {
  locale: string;
  dealId: string;
  apartment: DealDetailApartment;
  labels: DealSheetApartmentsProps['labels'];
};

function DealLinkedApartment({ locale, dealId, apartment, labels }: DealLinkedApartmentProps) {
  const [state, formAction, pending] = useActionState(
    unlinkDealApartmentFormAction.bind(null, locale),
    INITIAL_CRM_FORM_ACTION_STATE,
  );

  useRefreshOnFormSuccess(state, true);

  const priceLabel =
    apartment.priceAmd !== null
      ? labels.price(new Intl.NumberFormat(locale).format(apartment.priceAmd))
      : labels.noValue;

  const showSnapshotHint =
    apartment.priceAmdSnapshot !== null && apartment.priceAmdSnapshot !== apartment.priceAmd;
  const snapshotPriceLabel = showSnapshotHint
    ? labels.priceAtRequest(new Intl.NumberFormat(locale).format(apartment.priceAmdSnapshot))
    : null;

  return (
    <li className="crm-deal-sheet__apartment">
      <div>
        <p className="crm-deal-sheet__apartment-code">{apartment.code}</p>
        <p className="crm-deal-sheet__apartment-location">
          {apartment.buildingName} / {apartment.floorName}
        </p>
        <span className={APARTMENT_STATUS_BADGE_CLASS[apartment.status]}>
          {labels.status[apartment.status]}
        </span>
        <p className="crm-deal-sheet__apartment-price">{priceLabel}</p>
        {snapshotPriceLabel ? (
          <p className="crm-deal-sheet__apartment-price-hint">{snapshotPriceLabel}</p>
        ) : null}
      </div>
      <form action={formAction}>
        <input type="hidden" name="dealId" value={dealId} />
        <input type="hidden" name="apartmentId" value={apartment.apartmentId} />
        <button
          type="submit"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          disabled={pending}
        >
          {labels.unlink}
        </button>
        <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />
      </form>
    </li>
  );
}

type DealLinkApartmentFormProps = {
  locale: string;
  dealId: string;
  projectId: string | null;
  apartmentGroups: ProjectApartmentGroup[];
  linkedIds: Set<string>;
  labels: DealSheetApartmentsProps['labels'];
};

function DealLinkApartmentForm({
  locale,
  dealId,
  projectId,
  apartmentGroups,
  linkedIds,
  labels,
}: DealLinkApartmentFormProps) {
  const [state, formAction, pending] = useActionState(
    linkDealApartmentFormAction.bind(null, locale),
    INITIAL_CRM_FORM_ACTION_STATE,
  );

  useRefreshOnFormSuccess(state, true);

  const selectableGroups = apartmentGroups
    .map((group) => ({
      ...group,
      apartments: group.apartments.filter((apartment) => !linkedIds.has(apartment.apartmentId)),
    }))
    .filter((group) => group.apartments.length > 0);

  if (selectableGroups.length === 0) {
    return null;
  }

  const defaultProjectId = projectId ?? selectableGroups[0]?.projectId ?? '';

  return (
    <form action={formAction} className="crm-deal-sheet__link-form portal-form">
      <input type="hidden" name="dealId" value={dealId} />
      <fieldset className="crm-deal-sheet__link-fields">
        <legend>{labels.link}</legend>
        {!projectId && selectableGroups.length > 1 ? (
          <PortalFormField label={labels.project} name="projectPicker">
            <ProjectPicker groups={selectableGroups} defaultProjectId={defaultProjectId} />
          </PortalFormField>
        ) : null}
        <PortalFormField label={labels.apartment} name="apartmentId">
          <ApartmentPicker groups={selectableGroups} defaultProjectId={defaultProjectId} />
        </PortalFormField>
      </fieldset>
      <PortalFormError errorKey={state.errorKey} namespace="portal.crm.errors" />
      <div className="portal-form__actions">
        <button
          type="submit"
          className="portal-btn portal-btn--primary portal-btn--sm"
          disabled={pending}
        >
          {labels.link}
        </button>
      </div>
    </form>
  );
}

function ProjectPicker({
  groups,
  defaultProjectId,
}: {
  groups: ProjectApartmentGroup[];
  defaultProjectId: string;
}) {
  return (
    <PortalSelect name="projectPicker" defaultValue={defaultProjectId}>
      {groups.map((group) => (
        <option key={group.projectId} value={group.projectId}>
          {group.projectName}
        </option>
      ))}
    </PortalSelect>
  );
}

function ApartmentPicker({
  groups,
  defaultProjectId,
}: {
  groups: ProjectApartmentGroup[];
  defaultProjectId: string;
}) {
  const defaultGroup = groups.find((group) => group.projectId === defaultProjectId) ?? groups[0];

  return (
    <PortalSelect
      name="apartmentId"
      required
      defaultValue={defaultGroup?.apartments[0]?.apartmentId}
    >
      {groups.map((group) => (
        <optgroup key={group.projectId} label={group.projectName}>
          {group.apartments.map((apartment) => (
            <option key={apartment.apartmentId} value={apartment.apartmentId}>
              {apartment.code} — {apartment.buildingName}/{apartment.floorName}
            </option>
          ))}
        </optgroup>
      ))}
    </PortalSelect>
  );
}
