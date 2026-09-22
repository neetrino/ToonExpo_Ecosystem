'use client';

import type { ApartmentSalesStatus } from '@toonexpo/contracts';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { persistApartmentSalesStatus } from '@/features/catalog/components/apartment-public-sales-status-persist';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { useListboxDismiss } from '@/shared/ui/use-listbox-dismiss';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ApartmentPublicSalesStatusProps = {
  apartmentId: string;
  companyId: string;
  salesStatus: ApartmentSalesStatus;
  /** Gallery overlay on mobile; breadcrumb row on desktop. */
  placement: 'overlay' | 'inline';
};

const PLACEMENT_CLASS = {
  overlay: 'absolute top-3 right-3 z-20 flex flex-col items-end gap-1',
  inline: 'relative z-20 flex flex-col items-end gap-1',
} as const;

const PUBLIC_SALES_STATUSES: ApartmentSalesStatus[] = ['available', 'reserved', 'sold'];

const STATUS_TONE: Record<ApartmentSalesStatus, string> = {
  available: 'bg-success text-on-dark',
  reserved: 'bg-warning text-on-dark',
  sold: 'bg-danger text-on-dark',
};

const STATUS_DOT: Record<ApartmentSalesStatus, string> = {
  available: 'bg-success',
  reserved: 'bg-warning',
  sold: 'bg-danger',
};

const CHIP_PILL_CLASS = cn(
  'inline-flex w-max flex-nowrap items-center gap-2 rounded-full',
  'border border-white/55 py-1.5 pr-2.5 pl-3.5 text-[11px] font-bold tracking-wide uppercase',
  'shadow-sm ring-1 ring-white/30 ring-inset backdrop-blur-[2px]',
);

const CHIP_BUTTON_CLASS = cn(
  CHIP_PILL_CLASS,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
  'disabled:cursor-not-allowed disabled:opacity-70',
);

/**
 * Public sales-status chip on the apartment gallery.
 * Everyone sees the status; only platform admins get the dropdown editor.
 */
export const ApartmentPublicSalesStatus = ({
  apartmentId,
  companyId,
  salesStatus,
  placement,
}: ApartmentPublicSalesStatusProps) => {
  const t = useTranslations('Catalog.apartment');
  const tStatus = useTranslations('Catalog.status');
  const { data: me } = useMeQuery();
  const router = useRouter();
  const { showSuccess, successToast } = useSuccessToast();
  const [currentStatus, setCurrentStatus] = useState(salesStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const pendingSavedRef = useRef<ApartmentSalesStatus | null>(null);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const canEdit = me?.accountType === 'platform_admin';

  useEffect(() => {
    if (pendingSavedRef.current != null) {
      if (salesStatus === pendingSavedRef.current) {
        pendingSavedRef.current = null;
      } else {
        return;
      }
    }
    setCurrentStatus(salesStatus);
  }, [salesStatus]);

  useListboxDismiss(open, true, rootRef, menuRef, setOpen);

  const onPick = (next: ApartmentSalesStatus): void => {
    setOpen(false);
    void persistApartmentSalesStatus({
      apartmentId,
      scope: { mode: 'admin', companyId },
      next,
      currentStatus,
      isSaving,
      setCurrentStatus,
      setIsSaving,
      setErrorMessage,
      onSaved: (status) => {
        pendingSavedRef.current = status;
      },
      showSuccess,
      savedLabel: t('salesStatusSaved'),
      errorLabel: t('salesStatusSaveError'),
      refresh: () => router.refresh(),
    });
  };

  return (
    <div
      ref={rootRef}
      className={PLACEMENT_CLASS[placement]}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {canEdit ? (
        <SalesStatusEditor
          open={open}
          listId={listId}
          currentStatus={currentStatus}
          isSaving={isSaving}
          ariaLabel={t('salesStatusAria')}
          menuRef={menuRef}
          statusLabel={(status) => tStatus(status)}
          onToggle={() => setOpen((current) => !current)}
          onPick={onPick}
        />
      ) : (
        <span className={cn(CHIP_PILL_CLASS, STATUS_TONE[currentStatus])}>
          <span className="shrink-0 whitespace-nowrap text-on-dark">{tStatus(currentStatus)}</span>
        </span>
      )}
      {errorMessage ? (
        <p role="alert" className="max-w-[12rem] text-right text-xs text-danger">
          {errorMessage}
        </p>
      ) : null}
      {successToast}
    </div>
  );
};

type SalesStatusEditorProps = {
  open: boolean;
  listId: string;
  currentStatus: ApartmentSalesStatus;
  isSaving: boolean;
  ariaLabel: string;
  menuRef: RefObject<HTMLDivElement | null>;
  statusLabel: (status: ApartmentSalesStatus) => string;
  onToggle: () => void;
  onPick: (status: ApartmentSalesStatus) => void;
};

const SalesStatusEditor = ({
  open,
  listId,
  currentStatus,
  isSaving,
  ariaLabel,
  menuRef,
  statusLabel,
  onToggle,
  onPick,
}: SalesStatusEditorProps) => (
  <div className="relative">
    <button
      type="button"
      className={cn(CHIP_BUTTON_CLASS, STATUS_TONE[currentStatus])}
      disabled={isSaving}
      aria-label={ariaLabel}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      onClick={onToggle}
    >
      <span className="shrink-0 whitespace-nowrap text-on-dark">{statusLabel(currentStatus)}</span>
      <ChevronDown
        className={cn(
          'size-3.5 shrink-0 text-on-dark transition-transform duration-[var(--duration-base)]',
          open && 'rotate-180',
        )}
        strokeWidth={2.5}
        aria-hidden
      />
    </button>
    {open ? (
      <SalesStatusMenu
        listId={listId}
        currentStatus={currentStatus}
        menuRef={menuRef}
        ariaLabel={ariaLabel}
        statusLabel={statusLabel}
        onPick={onPick}
      />
    ) : null}
  </div>
);

type SalesStatusMenuProps = {
  listId: string;
  currentStatus: ApartmentSalesStatus;
  menuRef: RefObject<HTMLDivElement | null>;
  ariaLabel: string;
  statusLabel: (status: ApartmentSalesStatus) => string;
  onPick: (status: ApartmentSalesStatus) => void;
};

const SalesStatusMenu = ({
  listId,
  currentStatus,
  menuRef,
  ariaLabel,
  statusLabel,
  onPick,
}: SalesStatusMenuProps) => (
  <div ref={menuRef} className="absolute top-full right-0 z-[var(--z-dropdown)] pt-1.5">
    <ul
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      className={cn(
        'min-w-[10.5rem] overflow-hidden rounded-[12px] border border-header-border',
        'bg-surface-elevated text-ink shadow-md',
        'animate-dropdown-panel-in-bottom',
      )}
    >
      {PUBLIC_SALES_STATUSES.map((status) => {
        const active = status === currentStatus;
        return (
          <li key={status} role="none">
            <button
              type="button"
              role="option"
              aria-selected={active}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm whitespace-nowrap',
                active
                  ? 'bg-brand-soft font-semibold text-brand-deep'
                  : 'font-medium hover:bg-surface',
              )}
              onClick={() => onPick(status)}
            >
              <span
                className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[status])}
                aria-hidden
              />
              {statusLabel(status)}
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);
