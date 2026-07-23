'use client';

import type { AdminPartnerDetail } from '@toonexpo/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';

import {
  useCreatePartnerOfferMutation,
  useDeletePartnerOfferMutation,
  useUpdatePartnerMutation,
  useUpdatePartnerOfferMutation,
} from '@/features/admin/hooks/use-admin-partners';
import { PartnerOffersSection } from '@/features/partners/components/partner-offers-section';
import { PartnerProfileFields } from '@/features/partners/components/partner-profile-fields';
import { PartnerMediaFields } from '@/features/partners/components/partner-media-fields';
import type { PartnerMediaFieldValues } from '@/features/partners/components/partner-media-fields';
import {
  PARTNER_COMPANY_STATUSES,
  PARTNER_COMPANY_TYPES,
  PARTNER_PUBLICATION_STATUSES,
} from '@/features/partners/constants';
import {
  updatePartnerSchema,
  type UpdatePartnerFormValues,
} from '@/features/partners/schemas/partner.schema';
import { toUpdatePartnerFormValues } from '@/features/partners/utils/partner-form-values';
import { toUpdatePartnerBody } from '@/features/partners/utils/partner-mappers';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type AdminPartnerDetailFormProps = {
  partnerId: string;
  partner: AdminPartnerDetail;
};

/**
 * Partner profile + admin controls + offers CRUD (shared by page and sheet).
 */
export const AdminPartnerDetailForm = ({ partnerId, partner }: AdminPartnerDetailFormProps) => {
  const t = useTranslations('Admin.partners.detail');
  const updateMutation = useUpdatePartnerMutation(partnerId);
  const createOfferMutation = useCreatePartnerOfferMutation(partnerId);
  const updateOfferMutation = useUpdatePartnerOfferMutation(partnerId);
  const deleteOfferMutation = useDeletePartnerOfferMutation(partnerId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<UpdatePartnerFormValues>({
    resolver: zodResolver(updatePartnerSchema),
    values: toUpdatePartnerFormValues(partner),
  });

  const busy =
    updateMutation.isPending ||
    createOfferMutation.isPending ||
    updateOfferMutation.isPending ||
    deleteOfferMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateMutation.mutateAsync(toUpdatePartnerBody(values));
      setSaveSuccess(true);
    } catch {
      setSaveError(t('errors.generic'));
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label={t('form.name')}>
            <Input id="name" {...form.register('name')} />
          </FormField>
          <FormField id="slug" label={t('form.slug')}>
            <Input id="slug" {...form.register('slug')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="type" label={t('form.type')}>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select
                  id="type"
                  name={field.name}
                  value={field.value}
                  aria-label={t('form.type')}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                >
                  {PARTNER_COMPANY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`types.${type}`)}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>
          <FormField id="status" label={t('form.status')}>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select
                  id="status"
                  name={field.name}
                  value={field.value}
                  aria-label={t('form.status')}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                >
                  {PARTNER_COMPANY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`statuses.${status}`)}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>
          <FormField id="publicationStatus" label={t('form.publication')}>
            <Controller
              name="publicationStatus"
              control={form.control}
              render={({ field }) => (
                <Select
                  id="publicationStatus"
                  name={field.name}
                  value={field.value}
                  aria-label={t('form.publication')}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                >
                  {PARTNER_PUBLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`publicationStatuses.${status}`)}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>
          <FormField id="featured" label={t('form.featured')}>
            <label className="flex h-11 items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...form.register('featured')} />
              {t('form.featuredLabel')}
            </label>
          </FormField>
        </div>

        <PartnerProfileFields register={form.register} errors={form.formState.errors} />

        <PartnerMediaFields
          control={form.control as unknown as Control<PartnerMediaFieldValues>}
          context="admin"
        />

        {saveError ? (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        ) : null}
        {saveSuccess ? <p className="text-sm text-success">{t('saveSuccess')}</p> : null}

        <Button type="submit" variant="secondary" disabled={busy || !form.formState.isDirty}>
          {busy ? t('saving') : t('save')}
        </Button>
      </form>

      <PartnerOffersSection
        offers={partner.offers}
        isBusy={busy}
        onCreate={async (body) => {
          await createOfferMutation.mutateAsync(body);
        }}
        onUpdate={async (offerId, body) => {
          await updateOfferMutation.mutateAsync({ offerId, body });
        }}
        onDelete={async (offerId) => {
          await deleteOfferMutation.mutateAsync(offerId);
        }}
      />
    </div>
  );
};
