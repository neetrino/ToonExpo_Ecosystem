'use client';

import type { BankPartnerOfferTemplateItem } from '@toonexpo/contracts';
import { FileStack, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { BankPartnerOfferTemplateForm } from '@/features/admin/components/bank-partner-offer-template-form';
import { BankPartnerOfferTemplatesCollection } from '@/features/admin/components/bank-partner-offer-templates-collection';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import {
  useAdminBankPartnerOfferTemplatesQuery,
  useCreateBankPartnerOfferTemplateMutation,
  useDeleteBankPartnerOfferTemplateMutation,
  useUpdateBankPartnerOfferTemplateMutation,
} from '@/features/admin/hooks/use-admin-bank-partner-offer-templates';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

/**
 * Admin Templates — reusable finance offer templates (Import into project Finance).
 */
export const BankPartnerOfferTemplatesListPage = () => {
  const t = useTranslations('Admin.templates');
  const tCommon = useTranslations('Common.integratedSearch');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BankPartnerOfferTemplateItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BankPartnerOfferTemplateItem | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.templates,
  );

  const templatesQuery = useAdminBankPartnerOfferTemplatesQuery({});
  const createMutation = useCreateBankPartnerOfferTemplateMutation();
  const updateMutation = useUpdateBankPartnerOfferTemplateMutation();
  const deleteMutation = useDeleteBankPartnerOfferTemplateMutation();

  const filteredTemplates = useMemo(() => {
    const templates = templatesQuery.data?.data ?? [];
    if (!search.trim()) {
      return templates;
    }
    const q = search.trim().toLowerCase();
    return templates.filter((template) => template.name.toLowerCase().includes(q));
  }, [templatesQuery.data, search]);

  const busy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (templatesQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (templatesQuery.isError || !templatesQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={FileStack}
        title={t('title')}
        subtitle={t('subtitle')}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        onSearchChange={setSearch}
        onClearAll={() => {
          setSearch('');
        }}
        actions={
          <>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={() => {
                setCreating(true);
                setEditing(null);
              }}
            >
              <AddActionLabel>{t('newTemplate')}</AddActionLabel>
            </Button>
          </>
        }
      />

      <AdminCreateSheet
        open={creating}
        onClose={() => setCreating(false)}
        title={t('createTitle')}
      >
        <BankPartnerOfferTemplateForm
          key="create"
          isBusy={busy}
          onCancel={() => setCreating(false)}
          onCreate={async (body) => {
            await createMutation.mutateAsync(body);
            setCreating(false);
          }}
        />
      </AdminCreateSheet>

      <AdminCreateSheet
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing ? t('editTitle', { title: editing.name }) : ''}
        headerActions={
          editing ? (
            <IconButton
              label={t('delete')}
              size="sm"
              className="text-danger hover:bg-danger-soft"
              disabled={busy}
              onClick={() => setPendingDelete(editing)}
            >
              <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            </IconButton>
          ) : undefined
        }
      >
        {editing ? (
          <BankPartnerOfferTemplateForm
            key={editing.id}
            initial={editing}
            isBusy={busy}
            onCancel={() => setEditing(null)}
            onUpdate={async (body) => {
              await updateMutation.mutateAsync({ id: editing.id, body });
              setEditing(null);
            }}
          />
        ) : null}
      </AdminCreateSheet>

      {filteredTemplates.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <BankPartnerOfferTemplatesCollection
          templates={filteredTemplates}
          viewMode={effectiveViewMode}
          busy={busy}
          onEdit={(template) => {
            setEditing(template);
            setCreating(false);
          }}
          onDelete={setPendingDelete}
        />
      )}

      <AdminDeleteModal
        open={pendingDelete != null}
        title={t('deleteConfirmTitle')}
        message={
          pendingDelete ? t('deleteConfirmMessage', { title: pendingDelete.name }) : ''
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
            setEditing(null);
          });
        }}
      />
    </div>
  );
};
