'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { EventSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import {
  EXHIBITION_EVENT_STATUSES,
  EXHIBITION_PUBLICATION_STATUSES,
} from '@/features/exhibition/constants';
import {
  eventFormSchema,
  type EventFormInput,
  type EventFormValues,
} from '@/features/exhibition/schemas/exhibition.schema';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type AdminEventFormProps = {
  initial?: EventSummary | undefined;
  onSubmit: (values: EventFormValues) => Promise<void>;
  isBusy: boolean;
};

/**
 * Create/edit form for exhibition events.
 */
export const AdminEventForm = ({ initial, onSubmit, isBusy }: AdminEventFormProps) => {
  const t = useTranslations('Admin.events.form');
  const isEdit = initial != null;

  const form = useForm<EventFormInput, unknown, EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          code: initial.code,
          startDate: initial.startDate ?? '',
          endDate: initial.endDate ?? '',
          status: initial.status,
          publicationStatus: initial.publicationStatus,
        }
      : {
          name: '',
          code: '',
          startDate: '',
          endDate: '',
          status: 'planning',
          publicationStatus: 'draft',
        },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <FormField id="event-name" label={t('name')}>
        <Input id="event-name" {...form.register('name')} />
      </FormField>
      <FormField id="event-code" label={t('code')}>
        <Input id="event-code" {...form.register('code')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="event-start" label={t('startDate')}>
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                id="event-start"
                name={field.name}
                value={field.value ?? ''}
                aria-label={t('startDate')}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
        <FormField id="event-end" label={t('endDate')}>
          <Controller
            name="endDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                id="event-end"
                name={field.name}
                value={field.value ?? ''}
                aria-label={t('endDate')}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      </div>
      <FormField id="event-status" label={t('status')}>
        <Controller
          name="status"
          control={form.control}
          render={({ field }) => (
            <Select
              id="event-status"
              name={field.name}
              value={field.value}
              aria-label={t('status')}
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
            >
              {EXHIBITION_EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ))}
            </Select>
          )}
        />
      </FormField>
      <FormField id="event-publication" label={t('publication')}>
        <Controller
          name="publicationStatus"
          control={form.control}
          render={({ field }) => (
            <Select
              id="event-publication"
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
      <Button type="submit" variant="primary" disabled={isBusy}>
        {isBusy ? t('saving') : isEdit ? t('save') : t('create')}
      </Button>
    </form>
  );
};
