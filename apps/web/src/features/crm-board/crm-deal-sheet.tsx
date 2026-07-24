'use client';

import type { CrmDealDetail } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { CrmDealPipeline } from '@/features/crm-board/crm-deal-pipeline';
import type { CrmBoardMode } from '@/features/crm-board/constants';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { SideSheet } from '@/shared/ui/side-sheet';

type CrmDealSheetProps = {
  open: boolean;
  onClose: () => void;
  deal: CrmDealDetail | null;
  isLoading: boolean;
  isError: boolean;
  mode: CrmBoardMode;
  /** Edit-mode action sections (status, assignee, apartments, notes, …). */
  editSections?: ReactNode;
};

/**
 * CRM deal SideSheet — shared contact summary; edit sections injected by Builder.
 */
export const CrmDealSheet = ({
  open,
  onClose,
  deal,
  isLoading,
  isError,
  mode,
  editSections,
}: CrmDealSheetProps) => {
  const t = useTranslations('CrmBoard');
  const tSources = useTranslations('CrmBoard.sources');
  const locale = useLocale();

  const title =
    deal?.buyer.name?.trim() ||
    deal?.buyer.phone?.trim() ||
    deal?.buyer.email?.trim() ||
    t('dealSheetTitle');

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      title={title}
      description={mode === 'readonly' ? t('readonlyHint') : undefined}
      size="default"
    >
      {isLoading ? <p className="text-sm text-ink-secondary">{t('loadingDeal')}</p> : null}

      {isError || (!isLoading && !deal) ? (
        <p role="alert" className="text-sm text-danger">
          {t('dealNotFound')}
        </p>
      ) : null}

      {deal ? (
        <div className="flex flex-col gap-5">
          <CrmDealPipeline status={deal.status} />

          {deal.companyName ? (
            <p className="text-sm font-medium text-ink-secondary">
              {t('company')}: {deal.companyName}
            </p>
          ) : null}

          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t('fields.phone')}
              </dt>
              <dd className="text-sm text-ink">{deal.buyer.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t('fields.email')}
              </dt>
              <dd className="text-sm text-ink">{deal.buyer.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t('fields.source')}
              </dt>
              <dd className="text-sm text-ink">{tSources(deal.source)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t('fields.project')}
              </dt>
              <dd className="text-sm text-ink">{deal.projectName ?? t('noProject')}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t('fields.assignee')}
              </dt>
              <dd className="text-sm text-ink">{deal.assignedUserName ?? t('unassigned')}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {t('fields.created')}
              </dt>
              <dd className="text-sm text-ink">{formatBuyerDateTime(deal.createdAt, locale)}</dd>
            </div>
          </dl>

          {deal.message ? (
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
                {t('fields.description')}
              </h3>
              <p className="rounded-sm bg-surface px-3 py-2 text-sm text-ink whitespace-pre-wrap">
                {deal.message}
              </p>
            </div>
          ) : null}

          {mode === 'edit' ? editSections : <CrmDealReadonlyExtras deal={deal} />}
        </div>
      ) : null}
    </SideSheet>
  );
};

type CrmDealReadonlyExtrasProps = {
  deal: CrmDealDetail;
};

const CrmDealReadonlyExtras = ({ deal }: CrmDealReadonlyExtrasProps) => {
  const t = useTranslations('CrmBoard');
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-sm border border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t('apartmentsTitle')}</h3>
        {deal.apartments.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('apartmentsEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm text-ink">
            {deal.apartments.map((link) => (
              <li key={link.id}>
                #{link.apartmentNumber ?? link.apartmentId} · {link.linkType}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-sm border border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t('notesTitle')}</h3>
        {deal.notes.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('notesEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {deal.notes.map((note) => (
              <li key={note.id} className="rounded-sm bg-surface px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap text-ink">{note.body}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {note.authorName} · {formatBuyerDateTime(note.createdAt, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-sm border border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t('activitiesTitle')}</h3>
        {deal.activities.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('activitiesEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm text-ink">
            {deal.activities.map((activity) => (
              <li key={activity.id}>
                {activity.title}
                <span className="text-ink-muted"> · {activity.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
