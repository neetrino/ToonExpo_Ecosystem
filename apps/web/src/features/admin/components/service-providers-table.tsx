'use client';

import type { AdminServiceProviderItem } from '@toonexpo/contracts';
import { SquarePen, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';
import { ListTableReveal } from '@/shared/ui/motion';

type ServiceProvidersTableProps = {
  providers: AdminServiceProviderItem[];
  busy: boolean;
  onEdit: (provider: AdminServiceProviderItem) => void;
  onDelete: (id: string) => void;
};

/**
 * Service providers list view — same columns as the card collection.
 */
export const ServiceProvidersTable = ({
  providers,
  busy,
  onEdit,
  onDelete,
}: ServiceProvidersTableProps) => {
  const t = useTranslations('Admin.serviceProviders.providers');

  return (
    <ListTableReveal>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{t('columns.name')}</th>
              <th className="px-3 py-2 font-medium">{t('columns.type')}</th>
              <th className="px-3 py-2 font-medium">{t('columns.categories')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.active')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="border-t border-border hover:bg-surface/60">
                <td className="px-3 py-2.5 font-semibold tracking-tight text-ink">
                  {provider.name}
                </td>
                <td className="px-3 py-2.5 text-ink-secondary">
                  {t(`form.types.${provider.providerType}`)}
                </td>
                <td className="px-3 py-2.5 text-ink-secondary">
                  {provider.categories.map((category) => category.name).join(' · ') || '—'}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-center">
                    <span
                      className={cn(
                        LIST_STATUS_BADGE_CLASS,
                        LIST_STATUS_BADGE_COMPACT_CLASS,
                        provider.active
                          ? 'bg-success/10 text-success'
                          : 'bg-surface text-ink-muted',
                      )}
                    >
                      {provider.active ? t('activeYes') : t('activeNo')}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-center gap-1">
                    <IconButton
                      label={t('edit')}
                      size="sm"
                      className="text-cta-dark hover:bg-cta-dark/5"
                      onClick={() => {
                        onEdit(provider);
                      }}
                    >
                      <SquarePen className="size-3.5" strokeWidth={1.75} aria-hidden />
                    </IconButton>
                    <IconButton
                      label={t('delete')}
                      size="sm"
                      className="text-danger hover:bg-danger-soft"
                      disabled={busy}
                      onClick={() => {
                        onDelete(provider.id);
                      }}
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListTableReveal>
  );
};
