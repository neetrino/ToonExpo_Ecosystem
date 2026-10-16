'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { createMortgageApplication } from '@/features/mortgage/api/public-mortgage-api';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { FormField } from '@/shared/ui/form-field';
import { Textarea } from '@/shared/ui/textarea';

const NOTE_MAX_LENGTH = 2000;
const NOTE_FIELD_ID = 'mortgage-application-note';

const noteSchema = z.object({
  note: z.string().max(NOTE_MAX_LENGTH),
});

type NoteValues = z.infer<typeof noteSchema>;

type MortgageApplyButtonProps = {
  bankOfferId: string;
  propertyPrice: number;
  downPaymentPercent: number;
  loanTermYears: number;
};

type ApplyPayload = Omit<MortgageApplyButtonProps, never>;

/**
 * Sends the current calculator estimate to the selected bank.
 */
export const MortgageApplyButton = (props: MortgageApplyButtonProps) => {
  const t = useTranslations('Mortgage.calculator.apply');
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMeQuery();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openApply = (): void => {
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.accountType !== 'buyer') {
      setError(t('staffBlocked'));
      return;
    }
    setError(null);
    setOpen(true);
  };

  return (
    <div className="mt-4">
      <Button type="button" className="w-full" onClick={openApply}>
        {t('send')}
      </Button>
      {sent ? (
        <p className="mt-2 text-sm text-ink-navy" role="status">
          {t('success')}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <ApplyDialog
        open={open}
        payload={props}
        onClose={() => {
          setOpen(false);
        }}
        onSent={() => {
          setSent(true);
          setOpen(false);
        }}
        onError={() => {
          setError(t('error'));
        }}
      />
    </div>
  );
};

const ApplyDialog = ({
  open,
  payload,
  onClose,
  onSent,
  onError,
}: {
  open: boolean;
  payload: ApplyPayload;
  onClose: () => void;
  onSent: () => void;
  onError: () => void;
}) => {
  const t = useTranslations('Mortgage.calculator.apply');
  const mutation = useMutation({ mutationFn: createMortgageApplication });
  const form = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const note = values.note.trim();
    try {
      await mutation.mutateAsync({
        bankOfferId: payload.bankOfferId,
        propertyPrice: payload.propertyPrice,
        downPaymentPercent: payload.downPaymentPercent,
        loanTermYears: payload.loanTermYears,
        ...(note ? { note } : {}),
      });
      onSent();
    } catch {
      onError();
    }
  });

  return (
    <Dialog open={open} title={t('title')} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <FormField id={NOTE_FIELD_ID} label={t('noteLabel')}>
          <Textarea
            id={NOTE_FIELD_ID}
            {...form.register('note')}
            placeholder={t('notePlaceholder')}
          />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('submitting') : t('submit')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
