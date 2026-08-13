'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BoothSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  EXHIBITION_BOOTH_TYPES,
  EXHIBITION_PUBLICATION_STATUSES,
} from '@/features/exhibition/constants';
import {
  boothFormSchema,
  type BoothFormInput,
  type BoothFormValues,
} from '@/features/exhibition/schemas/exhibition.schema';
import { Button } from '@/shared/ui/button';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type AdminBoothFormProps = {
  initial?: BoothSummary | undefined;
  pickedCoordinates?: { xPercent: number; yPercent: number } | null;
  onSubmit: (values: BoothFormValues) => Promise<void>;
  onDelete?: (() => Promise<void>) | undefined;
  isBusy: boolean;
};

/**
 * Create/edit booth form with percent coordinates.
 */
export const AdminBoothForm = ({
  initial,
  pickedCoordinates,
  onSubmit,
  onDelete,
  isBusy,
}: AdminBoothFormProps) => {
  const t = useTranslations('Admin.events.booths.form');
  const isEdit = initial != null;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const form = useForm<BoothFormInput, unknown, BoothFormValues>({
    resolver: zodResolver(boothFormSchema),
    defaultValues: initial
      ? {
          code: initial.code,
          name: initial.name ?? '',
          type: initial.type,
          xPercent: Number(initial.xPercent),
          yPercent: Number(initial.yPercent),
          locationText: initial.locationText ?? '',
          publicationStatus: initial.publicationStatus,
        }
      : {
          code: '',
          name: '',
          type: 'builder',
          xPercent: 50,
          yPercent: 50,
          locationText: '',
          publicationStatus: 'draft',
        },
  });

  useEffect(() => {
    if (!pickedCoordinates) {
      return;
    }
    form.setValue('xPercent', pickedCoordinates.xPercent);
    form.setValue('yPercent', pickedCoordinates.yPercent);
  }, [pickedCoordinates, form]);

  return (
    <>
    <form
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <FormField id="booth-code" label={t('code')}>
        <Input id="booth-code" {...form.register('code')} />
      </FormField>
      <FormField id="booth-name" label={t('name')}>
        <Input id="booth-name" {...form.register('name')} />
      </FormField>
      <FormField id="booth-type" label={t('type')}>
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Select
              id="booth-type"
              name={field.name}
              value={field.value}
              aria-label={t('type')}
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
            >
              {EXHIBITION_BOOTH_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </Select>
          )}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="booth-x" label={t('xPercent')}>
          <Input id="booth-x" type="number" step="0.01" {...form.register('xPercent')} />
        </FormField>
        <FormField id="booth-y" label={t('yPercent')}>
          <Input id="booth-y" type="number" step="0.01" {...form.register('yPercent')} />
        </FormField>
      </div>
      <FormField id="booth-location" label={t('locationText')}>
        <Input id="booth-location" {...form.register('locationText')} />
      </FormField>
      <FormField id="booth-publication" label={t('publication')}>
        <Controller
          name="publicationStatus"
          control={form.control}
          render={({ field }) => (
            <Select
              id="booth-publication"
              name={field.name}
              value={field.value}
              aria-label={t('publication')}
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
            >
              {EXHIBITION_PUBLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`publicationStatuses.${status}`)}
                </option>
              ))}
            </Select>
          )}
        />
      </FormField>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" disabled={isBusy}>
          {isBusy ? t('saving') : isEdit ? t('save') : t('create')}
        </Button>
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={() => {
              setConfirmOpen(true);
            }}
          >
            {t('delete')}
          </Button>
        ) : null}
      </div>
    </form>
    <ConfirmDeleteModal
      open={confirmOpen}
      confirming={isBusy}
      onCancel={() => {
        if (!isBusy) {
          setConfirmOpen(false);
        }
      }}
      onConfirm={() => {
        if (!onDelete || isBusy) {
          return;
        }
        void onDelete().then(() => {
          setConfirmOpen(false);
        });
      }}
    />
    </>
  );
};
