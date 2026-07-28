'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
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
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
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

type AdminCrmNewDealSheetProps = {
  open: boolean;
  companies: CompanyOption[];
  defaultCompanyId?: string;
  onClose: () => void;
  onCreated: (dealId: string) => void;
};

/**
 * Admin quick-create lead sheet — builder + contact fields.
 */
export const AdminCrmNewDealSheet = ({
  open,
  companies,
  defaultCompanyId = '',
  onClose,
  onCreated,
}: AdminCrmNewDealSheetProps) => {
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
    if (!open) {
      return;
    }
    form.reset({
      companyId: defaultCompanyId,
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      projectId: '',
    });
  }, [open, defaultCompanyId, form]);

  useEffect(() => {
    form.setValue('projectId', '');
  }, [selectedCompanyId, form]);

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

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('title')} size="compact">
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

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? t('submitting') : tBoard('quickLead')}
          </Button>
        </div>
      </form>
    </AdminCreateSheet>
  );
};
