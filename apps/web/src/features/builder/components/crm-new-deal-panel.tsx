'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';

import { useCreateManualDealMutation } from '@/features/builder/hooks/use-portal-crm';
import {
  createManualDealSchema,
  type CreateManualDealFormValues,
} from '@/features/builder/schemas/crm.schema';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type ProjectOption = { id: string; name: string };

type CrmNewDealPanelProps = {
  projects: ProjectOption[];
  onClose: () => void;
  /** When set, called instead of navigating to the deal detail page. */
  onCreated?: (dealId: string) => void;
};

/**
 * Manual deal create panel (name, phone, email, optional project/note).
 */
export const CrmNewDealPanel = ({ projects, onClose, onCreated }: CrmNewDealPanelProps) => {
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
        contactName: values.contactName,
        ...(values.contactPhone ? { contactPhone: values.contactPhone } : {}),
        ...(values.contactEmail ? { contactEmail: values.contactEmail } : {}),
        ...(values.projectId ? { projectId: values.projectId } : {}),
        ...(values.note ? { note: values.note } : {}),
      });
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

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crm-new-deal-title"
      className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-lg bg-background p-5 shadow-lg sm:rounded-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="crm-new-deal-title" className="text-lg font-semibold text-ink">
            {t('newDeal.title')}
          </h2>
          <button type="button" className="text-sm text-ink-muted hover:text-ink" onClick={onClose}>
            {t('newDeal.cancel')}
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FormField
            id="contactName"
            label={t('newDeal.contactName')}
            error={form.formState.errors.contactName ? t('validation.contactName') : undefined}
          >
            <Input id="contactName" {...form.register('contactName')} />
          </FormField>

          <FormField
            id="contactPhone"
            label={t('newDeal.contactPhone')}
            error={form.formState.errors.contactPhone ? t('validation.phone') : undefined}
          >
            <Input id="contactPhone" type="tel" {...form.register('contactPhone')} />
          </FormField>

          <FormField
            id="contactEmail"
            label={t('newDeal.contactEmail')}
            error={form.formState.errors.contactEmail ? t('validation.email') : undefined}
          >
            <Input id="contactEmail" type="email" {...form.register('contactEmail')} />
          </FormField>

          <FormField id="projectId" label={t('newDeal.project')}>
            <select
              id="projectId"
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              {...form.register('projectId')}
            >
              <option value="">{t('newDeal.projectOptional')}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="note" label={t('newDeal.note')}>
            <Textarea id="note" rows={3} {...form.register('note')} />
          </FormField>

          {form.formState.errors.root?.message ? (
            <p role="alert" className="text-sm text-danger">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? t('newDeal.submitting') : t('newDeal.submit')}
          </Button>
        </form>
      </div>
    </div>,
    document.body,
  );
};
