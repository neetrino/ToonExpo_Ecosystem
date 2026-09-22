'use client';

import type { CreateCrmPaymentBody, CrmDealDetail, CrmPaymentItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useAddCrmPaymentMutation } from '@/features/builder/hooks/use-portal-crm';
import { CRM_PAYMENT_NOTE_MAX_LENGTH } from '@/features/builder/schemas/crm.schema';
import { parsePaymentAmountInput } from '@/features/builder/utils/crm-payment-totals';
import { CrmDealPaymentsReadonly } from '@/features/crm-board/crm-deal-payments-readonly';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type CrmDealPaymentsSectionProps = {
  deal: CrmDealDetail;
};

type CrmDealPaymentFormProps = {
  dealId: string;
};

const submitPayment = async (params: {
  amount: string;
  note: string;
  mutate: (body: CreateCrmPaymentBody) => Promise<CrmPaymentItem>;
  invalidAmount: string;
  genericError: string;
  setError: (value: string | null) => void;
  onSuccess: () => void;
}): Promise<void> => {
  const parsed = parsePaymentAmountInput(params.amount);
  if (parsed == null) {
    params.setError(params.invalidAmount);
    return;
  }
  params.setError(null);
  try {
    await params.mutate({
      amount: parsed,
      ...(params.note.trim() ? { note: params.note.trim() } : {}),
    });
    params.onSuccess();
  } catch {
    params.setError(params.genericError);
  }
};

const CrmDealPaymentForm = ({ dealId }: CrmDealPaymentFormProps) => {
  const t = useTranslations('Builder.crm.detail');
  const mutation = useAddCrmPaymentMutation(dealId);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <FormField id="crm-payment-amount" label={t('paymentAmount')} error={error ?? undefined}>
        <Input
          id="crm-payment-amount"
          inputMode="decimal"
          value={amount}
          placeholder={t('paymentAmountPlaceholder')}
          onChange={(event) => {
            setAmount(event.target.value);
          }}
        />
      </FormField>
      <Textarea
        id="crm-payment-note"
        rows={2}
        maxLength={CRM_PAYMENT_NOTE_MAX_LENGTH}
        value={note}
        placeholder={t('paymentNotePlaceholder')}
        onChange={(event) => {
          setNote(event.target.value);
        }}
      />
      <Button
        type="button"
        size="sm"
        disabled={!amount.trim() || mutation.isPending}
        onClick={() => {
          void submitPayment({
            amount,
            note,
            mutate: mutation.mutateAsync,
            invalidAmount: t('errors.invalidPaymentAmount'),
            genericError: t('errors.generic'),
            setError,
            onSuccess: () => {
              setAmount('');
              setNote('');
            },
          });
        }}
      >
        {mutation.isPending ? t('saving') : t('addPayment')}
      </Button>
    </div>
  );
};

/**
 * Payment summary, history, and builder form to record a payment.
 */
export const CrmDealPaymentsSection = ({ deal }: CrmDealPaymentsSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <CrmDealPaymentsReadonly deal={deal} />
      {deal.apartments.length > 0 ? <CrmDealPaymentForm dealId={deal.id} /> : null}
    </div>
  );
};
