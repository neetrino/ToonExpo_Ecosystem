'use client';

import type { BankPartnerOfferTemplateItem } from '@toonexpo/contracts';
import { CheckCircle2, FileStack, Import } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  useApplyProjectBankPartnerOffersMutation,
  useProjectBankPartnerOffersQuery,
  useSelectableTemplatesQuery,
} from '@/features/admin/hooks/use-project-bank-partner-offers';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { SelectionMark } from '@/shared/ui/multi-listbox-selection-mark';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

type ProjectBankPartnerOfferImportSheetProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

const LIST_PANEL_CLASS =
  'overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-card';

/**
 * Multi-select import of published Template/Partner Offers onto a project.
 */
export const ProjectBankPartnerOfferImportSheet = ({
  projectId,
  open,
  onClose,
}: ProjectBankPartnerOfferImportSheetProps) => {
  const t = useTranslations('Builder.projects.catalog.financeImport');
  const scope = useCatalogScope();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const templatesQuery = useSelectableTemplatesQuery(scope);
  const offersQuery = useProjectBankPartnerOffersQuery(scope, projectId);
  const applyMutation = useApplyProjectBankPartnerOffersMutation(scope, projectId);

  const appliedTemplateIds = useMemo(
    () =>
      new Set(
        (offersQuery.data?.data ?? [])
          .map((offer) => offer.templateId)
          .filter((id): id is string => id != null),
      ),
    [offersQuery.data?.data],
  );

  const templates = templatesQuery.data?.data ?? [];
  const importable = templates.filter((template) => !appliedTemplateIds.has(template.id));
  const importableIds = importable.map((template) => template.id);
  const allImportableSelected =
    importableIds.length > 0 && importableIds.every((id) => selectedIds.includes(id));

  const toggleTemplate = (templateId: string, checked: boolean): void => {
    setSelectedIds((current) =>
      checked ? [...current, templateId] : current.filter((id) => id !== templateId),
    );
  };

  const toggleSelectAll = (): void => {
    setSelectedIds(allImportableSelected ? [] : importableIds);
  };

  const handleImport = async (): Promise<void> => {
    if (selectedIds.length === 0) {
      return;
    }
    await applyMutation.mutateAsync({ templateIds: selectedIds });
    setSelectedIds([]);
    onClose();
  };

  const handleClose = (): void => {
    setSelectedIds([]);
    onClose();
  };

  const showList = !templatesQuery.isLoading && templates.length > 0;

  return (
    <AdminCreateSheet
      open={open}
      title={t('title')}
      description={t('hintMulti')}
      size="comfortable"
      onClose={handleClose}
    >
      <div className="flex flex-col gap-4">
        {templatesQuery.isLoading ? (
          <p className="text-sm text-ink-secondary">{t('loading')}</p>
        ) : null}

        {templatesQuery.isError ? (
          <p role="alert" className="text-sm text-danger">
            {t('error')}
          </p>
        ) : null}

        {!templatesQuery.isLoading && templates.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t('empty')}</p>
        ) : null}

        {!templatesQuery.isLoading && templates.length > 0 && importable.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t('allApplied')}</p>
        ) : null}

        {showList ? (
          <div className={LIST_PANEL_CLASS}>
            {importable.length > 1 ? (
              <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
                <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                  {t('templatesCount', { count: templates.length })}
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-brand hover:text-brand-hover"
                  onClick={toggleSelectAll}
                >
                  {allImportableSelected ? t('clearSelection') : t('selectAll')}
                </button>
              </div>
            ) : null}

            <ul
              className="luxury-scrollbar max-h-[min(22rem,52vh)] divide-y divide-border"
              aria-label={t('title')}
            >
              {templates.map((template) => (
                <TemplateImportRow
                  key={template.id}
                  template={template}
                  applied={appliedTemplateIds.has(template.id)}
                  checked={selectedIds.includes(template.id)}
                  onToggle={(checked) => toggleTemplate(template.id, checked)}
                />
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex w-full items-center justify-center gap-2"
            disabled={selectedIds.length === 0 || applyMutation.isPending}
            onClick={() => void handleImport()}
          >
            <Import className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            {t('importSelected', { count: selectedIds.length })}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={handleClose}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    </AdminCreateSheet>
  );
};

type TemplateImportRowProps = {
  template: BankPartnerOfferTemplateItem;
  applied: boolean;
  checked: boolean;
  onToggle: (checked: boolean) => void;
};

const TemplateImportRow = ({
  template,
  applied,
  checked,
  onToggle,
}: TemplateImportRowProps) => {
  const t = useTranslations('Builder.projects.catalog.financeImport');
  const partnerName = template.partnerCompanyName?.trim() ?? '';
  const logoUrl = resolvePublicAssetUrl(template.partnerCompanyLogoUrl);
  const active = !applied && checked;

  return (
    <li>
      <button
        type="button"
        disabled={applied}
        aria-pressed={applied || checked}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm transition-colors',
          applied && 'cursor-default bg-surface-muted/60',
          active && 'bg-brand-soft',
          !applied && !checked && 'hover:bg-surface',
        )}
        onClick={() => {
          if (!applied) {
            onToggle(!checked);
          }
        }}
      >
        {applied ? (
          <CheckCircle2 className="size-4 shrink-0 text-success" strokeWidth={2} aria-hidden />
        ) : (
          <SelectionMark checked={checked} />
        )}

        <span className="flex min-w-0 flex-1 items-center gap-3">
          {partnerName.length > 0 ? (
            <AdminListCardLogo
              name={partnerName}
              logoUrl={logoUrl}
              shape="circle"
              className="size-9 shrink-0"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface ring-1 ring-border">
              <FileStack className="size-4 text-ink-muted" strokeWidth={2} aria-hidden />
            </span>
          )}

          <span className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                'truncate font-medium',
                applied ? 'text-ink-muted' : 'text-ink-navy',
                active && 'font-semibold text-brand-deep',
              )}
            >
              {template.name}
            </span>
            {applied ? (
              <span className="text-xs text-ink-muted">{t('alreadyApplied')}</span>
            ) : partnerName.length > 0 ? (
              <span className="truncate text-xs text-ink-secondary">{partnerName}</span>
            ) : null}
          </span>
        </span>
      </button>
    </li>
  );
};
