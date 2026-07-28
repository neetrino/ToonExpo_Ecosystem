'use client';

import type { CrmDealDetail } from '@toonexpo/contracts';
import {
  Building2,
  CalendarClock,
  Mail,
  Phone,
  Share2,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';

import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import type { CrmBoardMode } from '@/features/crm-board/constants';
import { CrmDealPipeline } from '@/features/crm-board/crm-deal-pipeline';
import { CrmDealReadonlyExtras } from '@/features/crm-board/crm-deal-readonly-extras';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { IconButton } from '@/shared/ui/icon-button';
import { SideSheet } from '@/shared/ui/side-sheet';

type SheetFieldProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
};

const SheetField = ({ icon: Icon, label, children }: SheetFieldProps) => (
  <div className="flex min-w-0 items-start gap-2.5">
    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-sm bg-surface text-ink-muted">
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
    </span>
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  </div>
);

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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const title =
    deal?.buyer.name?.trim() ||
    deal?.buyer.phone?.trim() ||
    deal?.buyer.email?.trim() ||
    t('dealSheetTitle');

  useEffect(() => {
    if (!open) {
      setConfirmDeleteOpen(false);
    }
  }, [open]);

  return (
    <>
      <SideSheet
        open={open}
        onClose={onClose}
        title={title}
        description={mode === 'readonly' ? t('readonlyHint') : undefined}
        size="comfortable"
        escapeEnabled={!confirmDeleteOpen}
        headerActions={
          deal ? (
            <div className="flex items-center gap-2">
              <CrmDealPipeline status={deal.status} />
              {onDelete ? (
                <IconButton
                  label={isDeleting ? t('deleting') : tCommon('delete')}
                  size="sm"
                  className="text-danger hover:bg-danger-soft"
                  disabled={isDeleting}
                  onClick={() => {
                    setConfirmDeleteOpen(true);
                  }}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                </IconButton>
              ) : null}
            </div>
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
            {deal.companyName ? (
              <p className="text-sm font-medium text-ink-secondary">
                {t('company')}: {deal.companyName}
              </p>
            ) : null}

            <dl className="grid gap-3 sm:grid-cols-2">
              <SheetField icon={Phone} label={t('fields.phone')}>
                {deal.buyer.phone ?? '—'}
              </SheetField>
              <SheetField icon={Mail} label={t('fields.email')}>
                {deal.buyer.email ?? '—'}
              </SheetField>
              <SheetField icon={Share2} label={t('fields.source')}>
                {tSources(deal.source)}
              </SheetField>
              <SheetField icon={Building2} label={t('fields.project')}>
                {deal.projectName ?? t('noProject')}
              </SheetField>
              <SheetField icon={UserRound} label={t('fields.assignee')}>
                {deal.assignedUserName ?? t('unassigned')}
              </SheetField>
              <SheetField icon={CalendarClock} label={t('fields.created')}>
                {formatBuyerDateTime(deal.createdAt, locale)}
              </SheetField>
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

      <AdminDeleteModal
        open={confirmDeleteOpen}
        title={t('deleteConfirmTitle')}
        message={t('deleteConfirmMessage', { name: title })}
        confirming={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setConfirmDeleteOpen(false);
          }
        }}
        onConfirm={() => {
          onDelete?.();
        }}
      />
    </>
  );
};
