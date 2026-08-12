'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { useCreatePartnerMutation } from '@/features/admin/hooks/use-admin-partners';
import { PARTNER_COMPANY_TYPES } from '@/features/partners/constants';
import {
  createPartnerSchema,
  type CreatePartnerFormValues,
} from '@/features/partners/schemas/partner.schema';
import { toCreatePartnerBody } from '@/features/partners/utils/partner-mappers';
import { useRouter } from '@/i18n/navigation';
import { ApiError } from '@/shared/api/errors';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type CreatePartnerSheetProps = {
  open: boolean;
  onClose: () => void;
};

const mapCreateError = (error: unknown): 'emailTaken' | 'generic' => {
  if (error instanceof ApiError && error.status === 409) {
    return 'emailTaken';
  }
  return 'generic';
};

/**
 * Side sheet to provision a partner company, invite the first admin, and create a draft profile.
 */
export const CreatePartnerSheet = ({ open, onClose }: CreatePartnerSheetProps) => {
  const t = useTranslations('Admin.partners.create');
  const locale = useLocale();
  const router = useRouter();
  const mutation = useCreatePartnerMutation();

  const form = useForm<CreatePartnerFormValues>({
    resolver: zodResolver(createPartnerSchema),
    defaultValues: {
      name: '',
      type: 'other',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync(toCreatePartnerBody(values, locale));
      onClose();
      form.reset();
      router.push(`/admin/partners/${result.id}`);
    } catch (error) {
      form.setError('root', { message: t(`errors.${mapCreateError(error)}`) });
    }
  });

  const handleClose = (): void => {
    onClose();
    form.reset();
  };

  const busy = mutation.isPending || form.formState.isSubmitting;

  return (
    <AdminCreateSheet open={open} onClose={handleClose} title={t('title')}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <FormField
          id="name"
          label={t('name')}
          error={form.formState.errors.name ? t('validation.name') : undefined}
        >
          <Input
            id="name"
            placeholder={t('placeholders.name')}
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register('name')}
          />
        </FormField>

        <FormField id="type" label={t('type')}>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <Select
                id="type"
                name={field.name}
                value={field.value}
                aria-label={t('type')}
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

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            {t('adminSection')}
          </legend>

          <FormField
            id="adminName"
            label={t('adminName')}
            error={form.formState.errors.adminName ? t('validation.adminName') : undefined}
          >
            <Input
              id="adminName"
              placeholder={t('placeholders.adminName')}
              aria-invalid={Boolean(form.formState.errors.adminName)}
              {...form.register('adminName')}
            />
          </FormField>

          <FormField
            id="adminEmail"
            label={t('adminEmail')}
            error={form.formState.errors.adminEmail ? t('validation.adminEmail') : undefined}
          >
            <Input
              id="adminEmail"
              type="email"
              autoComplete="email"
              placeholder={t('placeholders.adminEmail')}
              aria-invalid={Boolean(form.formState.errors.adminEmail)}
              {...form.register('adminEmail')}
            />
          </FormField>

          <FormField
            id="adminPhone"
            label={t('adminPhone')}
            error={form.formState.errors.adminPhone ? t('validation.adminPhone') : undefined}
          >
            <Input
              id="adminPhone"
              type="tel"
              autoComplete="tel"
              placeholder={t('placeholders.adminPhone')}
              aria-invalid={Boolean(form.formState.errors.adminPhone)}
              {...form.register('adminPhone')}
            />
          </FormField>
        </fieldset>

        {form.formState.errors.root?.message ? (
          <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={busy} className="w-full">
          {busy ? t('submitting') : t('submit')}
        </Button>
      </form>
    </AdminCreateSheet>
  );
};
