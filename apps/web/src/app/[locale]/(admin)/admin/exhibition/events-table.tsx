'use client';

import { useState } from 'react';
import type { ExhibitionEventStatus } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';
import type { AdminExhibitionEventRow } from '@/lib/admin/exhibition-queries';
import { formatDateTime } from '@/lib/crm/format-crm-dates';

import { EventFormSheet } from './sheets/event-form-sheet';

type EventsTableProps = {
  locale: string;
  events: AdminExhibitionEventRow[];
  labels: {
    columns: {
      name: string;
      code: string;
      status: string;
      checkIns: string;
      dates: string;
      actions: string;
    };
    edit: string;
    venueMap: string;
    noDates: string;
  };
  statusLabels: Record<ExhibitionEventStatus, string>;
};

export function EventsTable({ locale, events, labels, statusLabels }: EventsTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.name}</th>
            <th>{labels.columns.code}</th>
            <th>{labels.columns.status}</th>
            <th>{labels.columns.checkIns}</th>
            <th>{labels.columns.dates}</th>
            <th>{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <EventRow
              key={event.id}
              locale={locale}
              event={event}
              labels={labels}
              statusLabels={statusLabels}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type EventRowProps = {
  locale: string;
  event: AdminExhibitionEventRow;
  labels: EventsTableProps['labels'];
  statusLabels: Record<ExhibitionEventStatus, string>;
};

function toLocalInput(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function EventRow({ locale, event, labels, statusLabels }: EventRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const datesLabel =
    event.startDate || event.endDate
      ? `${event.startDate ? formatDateTime(event.startDate, locale) : '—'} → ${event.endDate ? formatDateTime(event.endDate, locale) : '—'}`
      : labels.noDates;

  return (
    <tr>
      <td>{event.name}</td>
      <td>
        <code className="portal-code">{event.code}</code>
      </td>
      <td>{statusLabels[event.status]}</td>
      <td>{event.checkInCount}</td>
      <td>{datesLabel}</td>
      <td>
        <button
          type="button"
          className="portal-btn portal-btn--ghost"
          onClick={() => setEditOpen(true)}
        >
          {labels.edit}
        </button>
        <Link className="portal-btn portal-btn--ghost" href={`/admin/exhibition/${event.id}/venue`}>
          {labels.venueMap}
        </Link>
        <EventFormSheet
          locale={locale}
          mode="edit"
          open={editOpen}
          onClose={() => setEditOpen(false)}
          values={{
            eventId: event.id,
            name: event.name,
            code: event.code,
            startDate: toLocalInput(event.startDate),
            endDate: toLocalInput(event.endDate),
            status: event.status,
          }}
        />
      </td>
    </tr>
  );
}
