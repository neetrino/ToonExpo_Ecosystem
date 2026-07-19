'use client';

import type { IntegrationAuditLogItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { BosProvisioningStatusBadge } from '@/features/admin/components/bos-provisioning-status-badge';
import { useAdminBosProvisioningDetailQuery } from '@/features/admin/hooks/use-admin-bos-provisioning';
import { Link } from '@/i18n/navigation';

type BosProvisioningDetailPageProps = {
  requestId: string;
};

const formatDateTime = (iso: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const formatJson = (value: Record<string, unknown> | null): string => {
  if (!value) {
    return '—';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '—';
  }
};

const AuditLogRow = ({ entry, locale }: { entry: IntegrationAuditLogItem; locale: string }) => {
  const t = useTranslations('Admin.bos.detail.audit');

  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2.5 text-ink-secondary">{formatDateTime(entry.createdAt, locale)}</td>
      <td className="px-3 py-2.5">
        <span className="font-medium text-ink">{t(`actions.${entry.action}`)}</span>
      </td>
      <td className="px-3 py-2.5">
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-ink-secondary">
          {formatJson(entry.details)}
        </pre>
      </td>
    </tr>
  );
};

/**
 * Admin BOS provisioning request detail with payload summary and audit log.
 */
export const BosProvisioningDetailPage = ({ requestId }: BosProvisioningDetailPageProps) => {
  const t = useTranslations('Admin.bos.detail');
  const locale = useLocale();
  const query = useAdminBosProvisioningDetailQuery(requestId);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t('notFound')}
        </p>
        <Link
          href="/admin/integrations/bos"
          className="text-sm font-medium text-brand hover:underline"
        >
          {t('back')}
        </Link>
      </div>
    );
  }

  const request = query.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link href="/admin/integrations/bos" className="text-sm text-ink-secondary hover:text-ink">
          {t('back')}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-lg font-semibold text-ink">{request.requestId}</h1>
          <BosProvisioningStatusBadge status={request.status} />
        </div>
        <p className="text-sm text-ink-secondary">
          {request.companyName} · {request.bosCompanyId}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">{t('summary.title')}</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted">{t('summary.bosCompanyId')}</dt>
            <dd className="font-mono text-ink">{request.bosCompanyId}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t('summary.companyType')}</dt>
            <dd className="text-ink">{t(`companyTypes.${request.companyType}`)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t('summary.primaryContact')}</dt>
            <dd className="text-ink">
              {request.primaryContactName} · {request.primaryContactEmail}
              {request.primaryContactPhone ? ` · ${request.primaryContactPhone}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t('summary.eventCycle')}</dt>
            <dd className="text-ink">{request.eventCycleName ?? request.eventCycleId ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t('summary.requestedModules')}</dt>
            <dd className="text-ink">
              {request.requestedModules.length > 0
                ? request.requestedModules.map((module) => t(`modules.${module}`)).join(', ')
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t('summary.attemptCount')}</dt>
            <dd className="text-ink">{request.attemptCount}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t('summary.createdAt')}</dt>
            <dd className="text-ink">{formatDateTime(request.createdAt, locale)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t('summary.processedAt')}</dt>
            <dd className="text-ink">{formatDateTime(request.updatedAt, locale)}</dd>
          </div>
          {request.toonexpoCompanyId ? (
            <div>
              <dt className="text-ink-muted">{t('summary.toonexpoCompany')}</dt>
              <dd>
                <Link
                  href={`/admin/companies/${request.toonexpoCompanyId}`}
                  className="font-medium text-brand hover:underline"
                >
                  {request.toonexpoCompanyId}
                </Link>
              </dd>
            </div>
          ) : null}
          {request.errorMessage ? (
            <div className="sm:col-span-2">
              <dt className="text-ink-muted">{t('summary.errorMessage')}</dt>
              <dd className="text-danger">{request.errorMessage}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">{t('audit.title')}</h2>
        {request.auditLogs.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t('audit.empty')}</p>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-border">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">{t('audit.time')}</th>
                  <th className="px-3 py-2 font-medium">{t('audit.action')}</th>
                  <th className="px-3 py-2 font-medium">{t('audit.details')}</th>
                </tr>
              </thead>
              <tbody>
                {request.auditLogs.map((entry) => (
                  <AuditLogRow key={entry.id} entry={entry} locale={locale} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
