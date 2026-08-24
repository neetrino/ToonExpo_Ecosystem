'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceFields,
  type ProjectBankPartnerOfferItem,
  type UpdateProjectBankPartnerOfferBody,
} from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
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
  useProjectEditSubForms,
  useRegisterProjectEditSubForm,
} from '@/features/builder/context/project-edit-subforms-context';
import {
  useDeleteProjectBankPartnerOfferMutation,
  useUpdateProjectBankPartnerOfferMutation,
} from '@/features/admin/hooks/use-project-bank-partner-offers';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { FormField } from '@/shared/ui/form-field';
import { IconButton } from '@/shared/ui/icon-button';
import { Input } from '@/shared/ui/input';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

type ProjectBankPartnerOfferCardProps = {
  projectId: string;
  offer: ProjectBankPartnerOfferItem;
  isPending?: boolean;
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

const readOfferFormValues = (
  form: ReturnType<typeof useForm<ProjectBankPartnerOfferFormValues>>,
): Promise<UpdateProjectBankPartnerOfferBody> =>
  new Promise((resolve, reject) => {
    void form.handleSubmit(
      (values) =>
        resolve({
          name: values.name,
          fields: values.fields,
        }),
      () => reject(new Error('Offer validation failed')),
    )();
  });

/**
 * Editable project-scoped bank partner offer card (save + delete).
 */
export const ProjectBankPartnerOfferCard = ({
  projectId,
  offer,
  isPending = false,
}: ProjectBankPartnerOfferCardProps) => {
  const t = useTranslations('Builder.projects.catalog.bankPartnerOffers');
  const scope = useCatalogScope();
  const { unstagePendingImport } = useProjectEditSubForms();
  const updateMutation = useUpdateProjectBankPartnerOfferMutation(scope, projectId);
  const deleteMutation = useDeleteProjectBankPartnerOfferMutation(scope, projectId);
  const [pendingDelete, setPendingDelete] = useState(false);

  const form = useForm<ProjectBankPartnerOfferFormValues>({
    resolver: zodResolver(projectBankPartnerOfferFormSchema),
    defaultValues: {
      name: offer.name,
      fields: toFormFields(offer.fields),
      sortOrder: offer.sortOrder,
    },
  });

  useEffect(() => {
    form.reset({
      name: offer.name,
      fields: toFormFields(offer.fields),
      sortOrder: offer.sortOrder,
    });
  }, [form, offer.id, offer.updatedAt]);

  const { isDirty } = form.formState;

  const getValues = useCallback(
    () => readOfferFormValues(form),
    [form],
  );

  const saveOffer = useCallback(async (): Promise<void> => {
    const values = await getValues();
    await updateMutation.mutateAsync({
      offerId: offer.id,
      body: values,
    });
    form.reset({
      ...values,
      sortOrder: offer.sortOrder,
    });
  }, [form, getValues, offer.id, offer.sortOrder, updateMutation]);

  useRegisterProjectEditSubForm({
    id: offer.id,
    isDirty: isPending || isDirty,
    isPendingImport: isPending,
    getValues,
    save: isPending ? async () => undefined : saveOffer,
  });

  const handleDelete = async (): Promise<void> => {
    if (isPending && offer.templateId != null) {
      unstagePendingImport(offer.templateId);
      setPendingDelete(false);
      return;
    }
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
        <div className="flex flex-col gap-4">
          {isPending ? (
            <p className="text-xs font-medium text-brand">{t('pendingImport')}</p>
          ) : null}

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
        </div>
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
    </>
  );
};
