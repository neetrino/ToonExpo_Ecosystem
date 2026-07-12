'use client';

import type { PlatformSettingKey } from '@toonexpo/contracts';
import { useState } from 'react';

import type { PlatformSettingRow } from '@/lib/admin/settings-queries';

import { SettingFormSheet } from './sheets/setting-form-sheet';

type SettingsTableProps = {
  locale: string;
  settings: PlatformSettingRow[];
  labels: {
    columns: {
      key: string;
      value: string;
      updatedAt: string;
      actions: string;
    };
    edit: string;
    unset: string;
    keys: Record<PlatformSettingKey, string>;
  };
  formatDate: (date: Date) => string;
};

export function SettingsTable({ locale, settings, labels, formatDate }: SettingsTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.key}</th>
            <th>{labels.columns.value}</th>
            <th>{labels.columns.updatedAt}</th>
            <th>{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((setting) => (
            <SettingRow
              key={setting.key}
              locale={locale}
              setting={setting}
              labels={labels}
              formatDate={formatDate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type SettingRowProps = {
  locale: string;
  setting: PlatformSettingRow;
  labels: SettingsTableProps['labels'];
  formatDate: (date: Date) => string;
};

function SettingRow({ locale, setting, labels, formatDate }: SettingRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <tr>
      <td>{labels.keys[setting.key]}</td>
      <td>{setting.value ?? labels.unset}</td>
      <td>{setting.updatedAt ? formatDate(setting.updatedAt) : labels.unset}</td>
      <td>
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={() => setEditOpen(true)}
        >
          {labels.edit}
        </button>
        <SettingFormSheet
          locale={locale}
          settingKey={setting.key}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          currentValue={setting.value}
        />
      </td>
    </tr>
  );
}
