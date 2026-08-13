'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { useCreateManualDealMutation } from '@/features/builder/hooks/use-portal-crm';
import {
  createManualDealSchema,
  type CreateManualDealFormValues,
} from '@/features/builder/schemas/crm.schema';
import { useRouter } from '@/i18n/navigation';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { toOptionalPhone } from '@/shared/lib/phone';
import { PhoneFormControl } from '@/shared/ui/phone-form-control';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

type ProjectOption = { id: string; name: string };

type CrmNewDealPanelProps = {
  open: boolean;
  projects: ProjectOption[];
  onClose: () => void;
  /** When set, called instead of navigating to the deal detail page. */
  onCreated?: (dealId: string) => void;
};

/**
 * Manual Quick Lead create flow in a side sheet (name, phone, email, optional project/note).
 */
export const CrmNewDealPanel = ({
  open,
  projects,
  onClose,
  onCreated,
}: CrmNewDealPanelProps) => {
  const t = useTranslations('Builder.crm');
  const router = useRouter();
  const mutation = useCreateManualDealMutation();
  const form = useForm<CreateManualDealFormValues>({
    resolver: zodResolver(createManualDealSchema),
    defaultValues: {
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      projectId: '',
      note: '',
    },
  });

  const handleClose = (): void => {
    form.reset();
    onClose();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const contactPhone = toOptionalPhone(values.contactPhone);
      const result = await mutation.mutateAsync({
        contactName: values.contactName,
        ...(contactPhone ? { contactPhone } : {}),
        ...(values.contactEmail ? { contactEmail: values.contactEmail } : {}),
        ...(values.projectId ? { projectId: values.projectId } : {}),
        ...(values.note ? { note: values.note } : {}),
      });
      form.reset();
      onClose();
      if (onCreated) {
        onCreated(result.dealId);
        return;
      }
      router.push(`/builder/crm/deals/${result.dealId}`);
    } catch {
      form.setError('root', { message: t('errors.generic') });
    }
  });

  return (
    <AdminCreateSheet open={open} onClose={handleClose} title={t('newDeal.title')} size="compact">
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <FormField
          id="contactName"
          label={t('newDeal.contactName')}
          error={form.formState.errors.contactName ? t('validation.contactName') : undefined}
        >
          <Input
            id="contactName"
            placeholder={t('newDeal.contactNamePlaceholder')}
            autoComplete="name"
            {...form.register('contactName')}
          />
        </FormField>

        <FormField
          id="contactPhone"
          label={t('newDeal.contactPhone')}
          error={form.formState.errors.contactPhone ? t('validation.phone') : undefined}
        >
          <PhoneFormControl
            control={form.control}
            name="contactPhone"
            id="contactPhone"
            placeholder={t('newDeal.contactPhonePlaceholder')}
          />
        </FormField>

        <FormField
          id="contactEmail"
          label={t('newDeal.contactEmail')}
          error={form.formState.errors.contactEmail ? t('validation.email') : undefined}
        >
          <Input
            id="contactEmail"
            type="email"
            placeholder={t('newDeal.contactEmailPlaceholder')}
            autoComplete="email"
            {...form.register('contactEmail')}
          />
        </FormField>

        <FormField id="projectId" label={t('newDeal.project')}>
          <Controller
            name="projectId"
            control={form.control}
            render={({ field }) => (
              <Select
                id="projectId"
                name={field.name}
                value={field.value ?? ''}
                aria-label={t('newDeal.project')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                <option value="">{t('newDeal.projectOptional')}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        <FormField id="note" label={t('newDeal.note')}>
          <Textarea id="note" rows={3} {...form.register('note')} />
        </FormField>

        {form.formState.errors.root?.message ? (
          <p role="alert" className="text-sm text-danger">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
          <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
            {mutation.isPending ? t('newDeal.submitting') : t('newDeal.submit')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={mutation.isPending}
            className="w-full sm:w-auto"
            onClick={handleClose}
          >
            {t('newDeal.cancel')}
          </Button>
        </div>
      </form>
    </AdminCreateSheet>
  );
};
