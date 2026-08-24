'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceFields,
  type ProjectBankPartnerOfferItem,
} from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { BankPartnerOfferFinanceFieldsEditor } from '@/features/admin/components/bank-partner-offer-finance-fields-editor';
import {
  emptyFinanceFields,
  emptyLocaleText,
  projectBankPartnerOfferFormSchema,
  type ProjectBankPartnerOfferFormValues,
} from '@/features/admin/schemas/bank-partner-offer-template.schema';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  useDeleteProjectBankPartnerOfferMutation,
  useUpdateProjectBankPartnerOfferMutation,
} from '@/features/admin/hooks/use-project-bank-partner-offers';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { IconButton } from '@/shared/ui/icon-button';
import { Input } from '@/shared/ui/input';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ProjectBankPartnerOfferCardProps = {
  projectId: string;
  offer: ProjectBankPartnerOfferItem;
};

const toFormFields = (
  fields: BankPartnerOfferFinanceFields,
): ProjectBankPartnerOfferFormValues['fields'] => {
  const next = emptyFinanceFields();
  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    next[key] = {
      ...emptyLocaleText(),
      ...fields[key],
    };
  }
  return next;
};

/**
 * Editable project-scoped bank partner offer card (save + delete).
 */
export const ProjectBankPartnerOfferCard = ({
  projectId,
  offer,
}: ProjectBankPartnerOfferCardProps) => {
  const t = useTranslations('Builder.projects.catalog.bankPartnerOffers');
  const scope = useCatalogScope();
  const updateMutation = useUpdateProjectBankPartnerOfferMutation(scope, projectId);
  const deleteMutation = useDeleteProjectBankPartnerOfferMutation(scope, projectId);
  const { showSuccess, successToast } = useSuccessToast();
  const [pendingDelete, setPendingDelete] = useState(false);

  const form = useForm<ProjectBankPartnerOfferFormValues>({
    resolver: zodResolver(projectBankPartnerOfferFormSchema),
    defaultValues: {
      name: offer.name,
      fields: toFormFields(offer.fields),
      sortOrder: offer.sortOrder,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await updateMutation.mutateAsync({
      offerId: offer.id,
      body: {
        name: values.name,
        fields: values.fields,
      },
    });
    showSuccess(t('saved'));
  });

  const handleDelete = async (): Promise<void> => {
    await deleteMutation.mutateAsync(offer.id);
    setPendingDelete(false);
  };

  const busy = updateMutation.isPending || deleteMutation.isPending;
  const logoUrl = resolvePublicAssetUrl(offer.partnerCompanyLogoUrl);

  return (
    <>
      <ProjectCatalogSectionCard
        title={offer.name}
        headerAction={
          <IconButton
            type="button"
            label={t('delete')}
            variant="ghost"
            className="text-danger hover:text-danger"
            disabled={busy}
            onClick={() => setPendingDelete(true)}
          >
            <Trash2 className="size-4" strokeWidth={2} aria-hidden />
          </IconButton>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {offer.partnerCompanyName ? (
            <div className="flex items-center gap-2">
              <AdminListCardLogo
                name={offer.partnerCompanyName}
                logoUrl={logoUrl}
                shape="circle"
                className="size-8"
              />
              <span className="text-sm text-ink-secondary">{offer.partnerCompanyName}</span>
            </div>
          ) : null}

          <FormField id={`offer-name-${offer.id}`} label={t('name')}>
            <Input
              id={`offer-name-${offer.id}`}
              disabled={busy}
              {...form.register('name')}
            />
          </FormField>

          <BankPartnerOfferFinanceFieldsEditor register={form.register} />

          <Button type="submit" variant="secondary" size="sm" disabled={busy || !form.formState.isDirty}>
            {busy ? t('saving') : t('save')}
          </Button>
        </form>
      </ProjectCatalogSectionCard>

      <AdminDeleteModal
        open={pendingDelete}
        title={t('deleteTitle')}
        message={t('deleteDescription', { name: offer.name })}
        confirmLabel={t('deleteConfirm')}
        cancelLabel={t('deleteCancel')}
        confirming={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(false)}
      />
      {successToast}
    </>
  );
};
