'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminEventForm } from '@/features/exhibition/components/admin/admin-event-form';
import { AdminEventsTable } from '@/features/exhibition/components/admin/admin-events-table';
import {
  useAdminEventsQuery,
  useCreateAdminEventMutation,
} from '@/features/exhibition/hooks/use-exhibition';
import type { EventFormValues } from '@/features/exhibition/schemas/exhibition.schema';
import { usePathname, useRouter } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';

/**
 * Admin exhibition events list with create side sheet.
 */
export const AdminEventsListPage = () => {
  const t = useTranslations('Admin.events');
  const query = useAdminEventsQuery();
  const createMutation = useCreateAdminEventMutation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const clearCreateParam = useCallback((): void => {
    if (searchParams.get('create') !== '1') {
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete('create');
    const queryString = next.toString();
    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setSheetOpen(true);
    }
  }, [searchParams]);

  const handleCloseSheet = (): void => {
    setSheetOpen(false);
    clearCreateParam();
  };

  const onSubmit = async (values: EventFormValues): Promise<void> => {
    const event = await createMutation.mutateAsync({
      name: values.name,
      code: values.code,
      status: values.status,
      publicationStatus: values.publicationStatus,
      ...(values.startDate ? { startDate: values.startDate } : {}),
      ...(values.endDate ? { endDate: values.endDate } : {}),
    });
    handleCloseSheet();
    router.push(`/admin/events/${event.id}`);
  };

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const events = query.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t('title')}</h1>
          <p className="text-sm text-ink-secondary">{t('subtitle', { count: events.length })}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setSheetOpen(true);
          }}
        >
          <AddActionLabel>{t('newEvent')}</AddActionLabel>
        </Button>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <AdminEventsTable events={events} />
      )}

      <AdminCreateSheet open={sheetOpen} onClose={handleCloseSheet} title={t('new.title')}>
        <AdminEventForm onSubmit={onSubmit} isBusy={createMutation.isPending} />
      </AdminCreateSheet>
    </div>
  );
};
