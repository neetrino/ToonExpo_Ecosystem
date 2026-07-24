'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateAdminManualDealMutation } from '@/features/admin/hooks/use-admin-crm';
import { useAdminCompanyProjectsQuery } from '@/features/admin/hooks/use-admin-companies';
import { CRM_CONTACT_NAME_MAX_LENGTH } from '@/features/builder/schemas/crm.schema';
import {
  EMAIL_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from '@/shared/config/auth.constants';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { Select } from '@/shared/ui/select';

const adminCreateDealSchema = z.object({
  companyId: z.string().trim().min(1),
  contactName: z.string().trim().min(1).max(CRM_CONTACT_NAME_MAX_LENGTH),
  contactPhone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 ||
        (value.length >= PHONE_MIN_LENGTH &&
          value.length <= PHONE_MAX_LENGTH &&
          PHONE_PATTERN.test(value)),
      { message: 'phone' },
    ),
  contactEmail: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || (value.includes('@') && value.length <= EMAIL_MAX_LENGTH),
      { message: 'email' },
    ),
  projectId: z.string().trim().optional(),
});

type AdminCreateDealFormValues = z.infer<typeof adminCreateDealSchema>;

type CompanyOption = { id: string; name: string };

type AdminCrmNewDealPanelProps = {
  companies: CompanyOption[];
  defaultCompanyId?: string;
  onClose: () => void;
  onCreated: (dealId: string) => void;
};

/**
 * Admin quick-create lead modal — builder + contact fields.
 */
export const AdminCrmNewDealPanel = ({
  companies,
  defaultCompanyId = '',
  onClose,
  onCreated,
}: AdminCrmNewDealPanelProps) => {
  const t = useTranslations('Admin.crm.newDeal');
  const tBoard = useTranslations('CrmBoard');
  const mutation = useCreateAdminManualDealMutation();
  const form = useForm<AdminCreateDealFormValues>({
    resolver: zodResolver(adminCreateDealSchema),
    defaultValues: {
      companyId: defaultCompanyId,
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      projectId: '',
    },
  });

  const selectedCompanyId = form.watch('companyId');
  const projectsQuery = useAdminCompanyProjectsQuery(
    selectedCompanyId,
    selectedCompanyId.length > 0,
  );

  const projects = useMemo(
    () =>
      (projectsQuery.data?.data ?? []).map((project) => ({
        id: project.id,
        name: project.name,
      })),
    [projectsQuery.data],
  );

  useEffect(() => {
    form.setValue('projectId', '');
  }, [selectedCompanyId, form]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({
        companyId: values.companyId,
        contactName: values.contactName,
        ...(values.contactPhone ? { contactPhone: values.contactPhone } : {}),
        ...(values.contactEmail ? { contactEmail: values.contactEmail } : {}),
        ...(values.projectId ? { projectId: values.projectId } : {}),
      });
      onClose();
      onCreated(result.dealId);
    } catch {
      form.setError('root', { message: t('errors.generic') });
    }
  });

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-crm-new-deal-title"
      className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center bg-ink/70 p-0 sm:items-center sm:p-6"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-lg bg-background p-5 shadow-lg sm:rounded-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="admin-crm-new-deal-title" className="text-lg font-semibold text-ink">
            {t('title')}
          </h2>
          <button type="button" className="text-sm text-ink-muted hover:text-ink" onClick={onClose}>
            {t('cancel')}
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FormField
            id="companyId"
            label={t('company')}
            error={form.formState.errors.companyId ? t('validation.company') : undefined}
          >
            <Controller
              name="companyId"
              control={form.control}
              render={({ field }) => (
                <Select
                  id="companyId"
                  name={field.name}
                  value={field.value}
                  aria-label={t('company')}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                >
                  <option value="">{t('companyPlaceholder')}</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="contactName"
            label={t('contactName')}
            error={form.formState.errors.contactName ? t('validation.contactName') : undefined}
          >
            <Input
              id="contactName"
              placeholder={t('contactNamePlaceholder')}
              autoComplete="name"
              {...form.register('contactName')}
            />
          </FormField>

          <FormField
            id="contactPhone"
            label={t('contactPhone')}
            error={form.formState.errors.contactPhone ? t('validation.phone') : undefined}
          >
            <Controller
              name="contactPhone"
              control={form.control}
              render={({ field }) => (
                <PhoneInput
                  id="contactPhone"
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  placeholder={t('contactPhonePlaceholder')}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>

          <FormField
            id="contactEmail"
            label={t('contactEmail')}
            error={form.formState.errors.contactEmail ? t('validation.email') : undefined}
          >
            <Input
              id="contactEmail"
              type="email"
              placeholder={t('contactEmailPlaceholder')}
              autoComplete="email"
              {...form.register('contactEmail')}
            />
          </FormField>

          <FormField id="projectId" label={t('project')}>
            <Controller
              name="projectId"
              control={form.control}
              render={({ field }) => (
                <Select
                  id="projectId"
                  name={field.name}
                  value={field.value ?? ''}
                  aria-label={t('project')}
                  disabled={!selectedCompanyId}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                >
                  <option value="">{t('projectOptional')}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>

          {form.formState.errors.root?.message ? (
            <p role="alert" className="text-sm text-danger">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? t('submitting') : tBoard('quickLead')}
          </Button>
        </form>
      </div>
    </div>,
    document.body,
  );
};
