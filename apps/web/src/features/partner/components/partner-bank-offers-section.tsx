'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BankOfferListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  portalBankOfferFormSchema,
  termOptionsToField,
  type PortalBankOfferFormInput,
  type PortalBankOfferFormValues,
} from '@/features/admin/schemas/bank-offer.schema';
import {
  toPortalCreateBankOfferBody,
  toPortalUpdateBankOfferBody,
} from '@/features/partner/utils/portal-bank-offer-mappers';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AddActionLabel } from '@/shared/ui/add-action-label';

type PartnerBankOffersPageProps = {
  onCreate: (body: ReturnType<typeof toPortalCreateBankOfferBody>) => Promise<void>;
  onUpdate: (id: string, body: ReturnType<typeof toPortalUpdateBankOfferBody>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  offers: BankOfferListItem[];
  isBusy: boolean;
};

/**
 * Bank partner portal CRUD for own mortgage offers (publication is admin-only).
 */
export const PartnerBankOffersSection = ({
  offers,
  onCreate,
  onUpdate,
  onDelete,
  isBusy,
}: PartnerBankOffersPageProps) => {
  const t = useTranslations('Partner.bankOffers');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t('pageTitle')}</h1>
          <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
          <p className="text-xs text-ink-muted">{t('publicationNote')}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setShowCreate(true);
            setEditingId(null);
          }}
        >
          <AddActionLabel>{t('add')}</AddActionLabel>
        </Button>
      </div>

      {offers.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {offers.map((offer) => (
            <li key={offer.id} className="rounded-sm border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{offer.title}</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {t('rateLabel', { rate: offer.rate })}
                  </p>
                  <div className="mt-2">
                    <PublicationStatusBadge status={offer.publicationStatus} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowCreate(false);
                      setEditingId(offer.id);
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isBusy}
                    onClick={() => {
                      void onDelete(offer.id);
                    }}
                  >
                    {t('delete')}
                  </Button>
                </div>
              </div>

              {editingId === offer.id ? (
                <div className="mt-4 border-t border-border pt-4">
                  <PortalBankOfferForm
                    initial={offer}
                    submitLabel={t('save')}
                    isBusy={isBusy}
                    onCancel={() => {
                      setEditingId(null);
                    }}
                    onSubmit={async (values) => {
                      await onUpdate(offer.id, toPortalUpdateBankOfferBody(values));
                      setEditingId(null);
                    }}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {showCreate ? (
        <div className="rounded-sm border border-border bg-background p-4">
          <PortalBankOfferForm
            submitLabel={t('create')}
            isBusy={isBusy}
            onCancel={() => {
              setShowCreate(false);
            }}
            onSubmit={async (values) => {
              await onCreate(toPortalCreateBankOfferBody(values));
              setShowCreate(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

type PortalBankOfferFormProps = {
  initial?: BankOfferListItem | undefined;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: PortalBankOfferFormValues) => Promise<void>;
  isBusy: boolean;
};

const PortalBankOfferForm = ({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
  isBusy,
}: PortalBankOfferFormProps) => {
  const t = useTranslations('Partner.bankOffers.form');

  const form = useForm<PortalBankOfferFormInput, unknown, PortalBankOfferFormValues>({
    resolver: zodResolver(portalBankOfferFormSchema),
    defaultValues: initial
      ? {
          title: initial.title,
          shortDescription: initial.shortDescription ?? '',
          rate: Number(initial.rate),
          apr: initial.apr != null ? Number(initial.apr) : undefined,
          minDownPaymentPercent: Number(initial.minDownPaymentPercent),
          termOptionsYears: termOptionsToField(initial.termOptionsYears),
          fees: initial.fees ?? '',
          calculationNotes: initial.calculationNotes ?? '',
          featured: initial.featured,
          sortOrder: initial.sortOrder,
        }
      : {
          title: '',
          shortDescription: '',
          rate: 0,
          minDownPaymentPercent: 10,
          termOptionsYears: '15, 20, 30',
          fees: '',
          calculationNotes: '',
          featured: false,
          sortOrder: 0,
        },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <FormField id="title" label={t('title')}>
        <Input id="title" {...form.register('title')} />
      </FormField>
      <FormField id="shortDescription" label={t('shortDescription')}>
        <Textarea id="shortDescription" rows={3} {...form.register('shortDescription')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="rate" label={t('rate')}>
          <Input
            id="rate"
            type="number"
            step="0.01"
            {...form.register('rate', { valueAsNumber: true })}
          />
        </FormField>
        <FormField id="apr" label={t('apr')}>
          <Input
            id="apr"
            type="number"
            step="0.01"
            {...form.register('apr', { valueAsNumber: true })}
          />
        </FormField>
        <FormField id="minDownPaymentPercent" label={t('minDownPayment')}>
          <Input
            id="minDownPaymentPercent"
            type="number"
            step="0.01"
            {...form.register('minDownPaymentPercent', { valueAsNumber: true })}
          />
        </FormField>
        <FormField id="termOptionsYears" label={t('termOptions')}>
          <Input id="termOptionsYears" {...form.register('termOptionsYears')} />
        </FormField>
      </div>
      <FormField id="fees" label={t('fees')}>
        <Textarea id="fees" rows={2} {...form.register('fees')} />
      </FormField>
      <FormField id="calculationNotes" label={t('calculationNotes')}>
        <Textarea id="calculationNotes" rows={2} {...form.register('calculationNotes')} />
      </FormField>
      <FormField id="sortOrder" label={t('sortOrder')}>
        <Input
          id="sortOrder"
          type="number"
          {...form.register('sortOrder', { valueAsNumber: true })}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" {...form.register('featured')} />
        {t('featured')}
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isBusy || form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
