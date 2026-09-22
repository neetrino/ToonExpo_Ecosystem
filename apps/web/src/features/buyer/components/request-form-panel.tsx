'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateBuyerRequestMutation } from '@/features/buyer/hooks/use-buyer';
import {
  createRequestNoteSchema,
  toCreateBuyerRequestBody,
  type CreateRequestNoteValues,
} from '@/features/buyer/schemas/create-request.schema';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Textarea } from '@/shared/ui/textarea';

type RequestFormPanelProps = {
  projectId: string;
  apartmentId?: string | undefined;
  /** Prefills the optional note (price-on-request CTA). */
  defaultNote?: string | undefined;
  /** Required for modal variant (close / cancel). */
  onClose?: (() => void) | undefined;
  /** `modal` = dialog with cancel; `page` = QR interest landing. */
  variant?: 'modal' | 'page' | undefined;
};

type SuccessKind = 'created' | 'deduplicated';

/**
 * Optional note → POST /requests (modal or QR interest page).
 */
export const RequestFormPanel = ({
  projectId,
  apartmentId,
  defaultNote = '',
  onClose,
  variant = 'modal',
}: RequestFormPanelProps) => {
  const t = useTranslations('Catalog.request');
  const tInterest = useTranslations('Catalog.qrInterest');
  const mutation = useCreateBuyerRequestMutation();
  const [success, setSuccess] = useState<SuccessKind | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const isPage = variant === 'page';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestNoteValues>({
    resolver: zodResolver(createRequestNoteSchema),
    defaultValues: { note: defaultNote },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await mutation.mutateAsync(
        toCreateBuyerRequestBody({
          projectId,
          apartmentId,
          note: values.note,
        }),
      );
      setSuccess(result.deduplicated ? 'deduplicated' : 'created');
    } catch {
      setFormError(t('errors.generic'));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink" role="status">
          {success === 'deduplicated' ? t('success.deduplicated') : t('success.created')}
        </p>
        {isPage ? (
          <Link href="/requests" className="inline-flex">
            <Button type="button" variant="secondary" className="w-full sm:w-auto">
              {tInterest('viewRequests')}
            </Button>
          </Link>
        ) : (
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('close')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        id="request-note"
        label={t('noteLabel')}
        error={errors.note ? t('validation.note') : undefined}
      >
        <Textarea
          id="request-note"
          placeholder={t('notePlaceholder')}
          aria-invalid={Boolean(errors.note)}
          {...register('note')}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  );
};
