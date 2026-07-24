'use client';

import type { CrmDealDetail } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import type { CrmBoardMode } from '@/features/crm-board/constants';
import { CrmDealPipeline } from '@/features/crm-board/crm-deal-pipeline';
import { CrmDealReadonlyExtras } from '@/features/crm-board/crm-deal-readonly-extras';
import { Button } from '@/shared/ui/button';
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
  onDelete?: (() => void) | undefined;
  isDeleting?: boolean | undefined;
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
  onDelete,
  isDeleting = false,
}: CrmDealSheetProps) => {
  const t = useTranslations('CrmBoard');
  const tCommon = useTranslations('Common');
  const tSources = useTranslations('CrmBoard.sources');
  const locale = useLocale();

  const title =
    deal?.buyer.name?.trim() ||
    deal?.buyer.phone?.trim() ||
    deal?.buyer.email?.trim() ||
    t('dealSheetTitle');

  const handleDelete = (): void => {
    if (!onDelete || !deal) {
      return;
    }
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }
    onDelete();
  };

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      title={title}
      description={mode === 'readonly' ? t('readonlyHint') : undefined}
      size="default"
      footer={
        deal && onDelete ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="w-full sm:w-auto"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            {isDeleting ? t('deleting') : tCommon('delete')}
          </Button>
        ) : undefined
      }
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
