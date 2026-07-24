'use client';

import { useTranslations } from 'next-intl';

import { usePortalServiceProvidersQuery } from '@/features/builder/hooks/use-portal-service-providers';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';

type ReadinessHelpDialogProps = {
  categoryName: string;
  categoryId: string;
  onClose: () => void;
};

/**
 * Dialog listing active service providers for a readiness category.
 */
export const ReadinessHelpDialog = ({
  categoryName,
  categoryId,
  onClose,
}: ReadinessHelpDialogProps) => {
  const t = useTranslations('Builder.readiness.help');
  const query = usePortalServiceProvidersQuery(categoryId, true);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="readiness-help-title"
      className={cn(
        'fixed inset-0 z-[var(--z-modal)] flex items-end justify-center p-0 sm:items-center sm:p-6',
        MODAL_BACKDROP_CLASS_NAME,
      )}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-lg bg-background p-5 shadow-lg sm:rounded-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="readiness-help-title" className="text-lg font-semibold text-ink">
              {t('title')}
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">{categoryName}</p>
          </div>
          <button type="button" className="text-sm text-ink-muted hover:text-ink" onClick={onClose}>
            {t('close')}
          </button>
        </div>

        {query.isLoading ? <p className="text-sm text-ink-secondary">{t('loading')}</p> : null}

        {query.isError ? (
          <p role="alert" className="text-sm text-danger">
            {t('error')}
          </p>
        ) : null}

        {query.data?.data.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t('empty')}</p>
        ) : null}

        {query.data && query.data.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {query.data.data.map((provider) => (
              <li key={provider.id} className="rounded-sm border border-border bg-surface p-4">
                <p className="font-medium text-ink">{provider.name}</p>
                <p className="text-xs text-ink-muted">{t(`types.${provider.providerType}`)}</p>
                {provider.services ? (
                  <p className="mt-2 text-sm text-ink-secondary">{provider.services}</p>
                ) : null}
                {provider.description ? (
                  <p className="mt-2 text-sm text-ink">{provider.description}</p>
                ) : null}
                <div className="mt-3 flex flex-col gap-1 text-sm">
                  {provider.phone ? (
                    <a className="text-brand hover:underline" href={`tel:${provider.phone}`}>
                      {provider.phone}
                    </a>
                  ) : null}
                  {provider.email ? (
                    <a className="text-brand hover:underline" href={`mailto:${provider.email}`}>
                      {provider.email}
                    </a>
                  ) : null}
                  {provider.website ? (
                    <a
                      className="text-brand hover:underline"
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {provider.website}
                    </a>
                  ) : null}
                  {provider.socialLinks
                    ? Object.entries(provider.socialLinks).map(([key, url]) => (
                        <a
                          key={key}
                          className="text-brand hover:underline"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {key}
                        </a>
                      ))
                    : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <Button type="button" variant="secondary" className="mt-4" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
    </div>
  );
};
