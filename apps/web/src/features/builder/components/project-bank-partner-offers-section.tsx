'use client';

import type {
  BankPartnerOfferTemplateItem,
  ProjectBankPartnerOfferItem,
} from '@toonexpo/contracts';
import { SquarePen, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { ProjectBankPartnerOfferEditForm } from '@/features/builder/components/project-bank-partner-offer-edit-form';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  useApplyProjectBankPartnerOffersMutation,
  useDeleteProjectBankPartnerOfferMutation,
  useProjectBankPartnerOffersQuery,
  useSelectableTemplatesQuery,
  useUpdateProjectBankPartnerOfferMutation,
} from '@/features/admin/hooks/use-project-bank-partner-offers';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';

type ProjectBankPartnerOffersSectionProps = {
  projectId: string;
};

/**
 * Project catalog section: apply bank finance templates and edit copies.
 */
export const ProjectBankPartnerOffersSection = ({
  projectId,
}: ProjectBankPartnerOffersSectionProps) => {
  const t = useTranslations('Builder.projects.bankPartnerOffers');
  const scope = useCatalogScope();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<ProjectBankPartnerOfferItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectBankPartnerOfferItem | null>(
    null,
  );

  const offersQuery = useProjectBankPartnerOffersQuery(scope, projectId);
  const templatesQuery = useSelectableTemplatesQuery(scope);
  const applyMutation = useApplyProjectBankPartnerOffersMutation(scope, projectId);
  const updateMutation = useUpdateProjectBankPartnerOfferMutation(scope, projectId);
  const deleteMutation = useDeleteProjectBankPartnerOfferMutation(scope, projectId);

  const appliedTemplateIds = useMemo(() => {
    const ids = new Set<string>();
    for (const offer of offersQuery.data?.data ?? []) {
      if (offer.templateId) {
        ids.add(offer.templateId);
      }
    }
    return ids;
  }, [offersQuery.data]);

  const availableTemplates = useMemo(
    () =>
      (templatesQuery.data?.data ?? []).filter(
        (template) => !appliedTemplateIds.has(template.id),
      ),
    [templatesQuery.data, appliedTemplateIds],
  );

  const busy =
    applyMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const toggleTemplate = (template: BankPartnerOfferTemplateItem): void => {
    setSelectedIds((current) =>
      current.includes(template.id)
        ? current.filter((id) => id !== template.id)
        : [...current, template.id],
    );
  };

  return (
    <ProjectCatalogSectionCard title={t('title')}>
      <p className="mb-4 text-sm text-ink-secondary">{t('subtitle')}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy || availableTemplates.length === 0}
          onClick={() => {
            setSelectedIds([]);
            setPickerOpen(true);
          }}
        >
          {t('addFromTemplates')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy || availableTemplates.length === 0}
          onClick={() => {
            void applyMutation.mutateAsync({ addAll: true });
          }}
        >
          {t('addAll')}
        </Button>
      </div>

      {offersQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : null}

      {offersQuery.isError ? (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      ) : null}

      {(offersQuery.data?.data.length ?? 0) === 0 && !offersQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {(offersQuery.data?.data ?? []).map((offer) => (
          <li
            key={offer.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink-navy">{offer.name}</p>
              <p className="truncate text-sm text-ink-secondary">
                {offer.partnerCompanyName}
              </p>
            </div>
            <IconButton
              label={t('edit')}
              disabled={busy}
              onClick={() => setEditing(offer)}
            >
              <SquarePen className="size-4" />
            </IconButton>
            <IconButton
              label={t('remove')}
              disabled={busy}
              onClick={() => setPendingDelete(offer)}
            >
              <Trash2 className="size-4" />
            </IconButton>
          </li>
        ))}
      </ul>

      <AdminCreateSheet
        open={pickerOpen}
        title={t('pickerTitle')}
        onClose={() => setPickerOpen(false)}
      >
        <div className="flex flex-col gap-3">
          {availableTemplates.length === 0 ? (
            <p className="text-sm text-ink-secondary">{t('pickerEmpty')}</p>
          ) : (
            availableTemplates.map((template) => {
              const checked = selectedIds.includes(template.id);
              return (
                <label
                  key={template.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={() => toggleTemplate(template)}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink-navy">{template.name}</span>
                    <span className="block text-sm text-ink-secondary">
                      {template.partnerCompanyName}
                    </span>
                  </span>
                </label>
              );
            })
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy || selectedIds.length === 0}
              onClick={() => {
                void applyMutation
                  .mutateAsync({ templateIds: selectedIds })
                  .then(() => setPickerOpen(false));
              }}
            >
              {t('applySelected')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPickerOpen(false)}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      </AdminCreateSheet>

      <AdminCreateSheet
        open={editing != null}
        title={editing ? t('editTitle', { title: editing.name }) : ''}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <ProjectBankPartnerOfferEditForm
            key={editing.id}
            initial={editing}
            isBusy={busy}
            onCancel={() => setEditing(null)}
            onSave={async (body) => {
              await updateMutation.mutateAsync({ offerId: editing.id, body });
              setEditing(null);
            }}
          />
        ) : null}
      </AdminCreateSheet>

      <AdminDeleteModal
        open={pendingDelete != null}
        title={t('removeConfirmTitle')}
        message={
          pendingDelete
            ? t('removeConfirmMessage', { title: pendingDelete.name })
            : ''
        }
        confirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setPendingDelete(null);
          }
        }}
        onConfirm={() => {
          if (!pendingDelete) {
            return;
          }
          void deleteMutation.mutateAsync(pendingDelete.id).then(() => {
            setPendingDelete(null);
          });
        }}
      />
    </ProjectCatalogSectionCard>
  );
};
