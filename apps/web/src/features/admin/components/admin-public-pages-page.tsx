'use client';

import type { PublicSitePageKey, PublicSitePages } from '@toonexpo/contracts';
import { PUBLIC_SITE_PAGE_KEYS } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  getAdminPublicSitePages,
  updateAdminPublicSitePages,
} from '@/features/admin/api/admin-public-site-pages-api';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

const emptyPages = (): PublicSitePages => {
  const pages = {} as PublicSitePages;
  for (const key of PUBLIC_SITE_PAGE_KEYS) {
    pages[key] = true;
  }
  return pages;
};

/**
 * Admin toggles for which public marketing pages are visible to visitors.
 */
export const AdminPublicPagesPage = () => {
  const t = useTranslations('Admin.publicPages');
  const [pages, setPages] = useState<PublicSitePages>(emptyPages);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const { showSuccess, successToast } = useSuccessToast();

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminPublicSitePages();
        if (cancelled) {
          return;
        }
        setPages(response.pages);
        setDirty(false);
      } catch {
        if (!cancelled) {
          setError(t('errors.load'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const setPageEnabled = (key: PublicSitePageKey, enabled: boolean): void => {
    setPages((current) => ({ ...current, [key]: enabled }));
    setDirty(true);
  };

  const onSave = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const response = await updateAdminPublicSitePages({ pages });
      setPages(response.pages);
      setDirty(false);
      showSuccess(t('saveSuccess'));
    } catch {
      setError(t('errors.save'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-brand text-2xl font-bold text-ink">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      {loading ? <p className="text-sm text-ink-secondary">{t('loading')}</p> : null}

      {!loading ? (
        <Card padding="none" className="flex flex-col gap-1 p-2 sm:p-3">
          {PUBLIC_SITE_PAGE_KEYS.map((key) => {
            const enabled = pages[key];
            const switchId = `public-page-${key}`;
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-[14px] px-3 py-3 hover:bg-surface"
              >
                <div className="min-w-0">
                  <label htmlFor={switchId} className="block text-sm font-semibold text-ink">
                    {t(`pages.${key}`)}
                  </label>
                  <p className="mt-0.5 text-xs text-ink-secondary">{t(`paths.${key}`)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-medium text-ink-secondary">
                    {enabled ? t('active') : t('inactive')}
                  </span>
                  <Switch
                    id={switchId}
                    checked={enabled}
                    disabled={busy}
                    aria-label={t('toggleAria', { page: t(`pages.${key}`) })}
                    onCheckedChange={(checked) => {
                      setPageEnabled(key, checked);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="button" disabled={!dirty || busy || loading} onClick={() => void onSave()}>
          {busy ? t('saving') : t('save')}
        </Button>
      </div>

      {successToast}
    </div>
  );
};
