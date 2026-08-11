'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  getAdminHomeHero,
  updateAdminHomeHero,
} from '@/features/admin/api/admin-home-hero-api';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { DEFAULT_HOME_HERO_IMAGE_SRC } from '@/features/catalog/constants/home-hero';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

/**
 * Admin editor for the public home page hero banner image.
 */
export const AdminHomeBannerPage = () => {
  const t = useTranslations('Admin.homeBanner');
  const [mediaAssetId, setMediaAssetId] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasCustom, setHasCustom] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const hero = await getAdminHomeHero();
        if (cancelled) {
          return;
        }
        setMediaAssetId(hero.mediaAssetId ?? '');
        setPreviewUrl(hero.imageUrl);
        setHasCustom(hero.mediaAssetId != null);
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

  const displayPreview = previewUrl ?? DEFAULT_HOME_HERO_IMAGE_SRC;

  const handleSave = async (): Promise<void> => {
    if (!mediaAssetId.trim()) {
      setError(t('errors.required'));
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const hero = await updateAdminHomeHero({ mediaAssetId: mediaAssetId.trim() });
      setMediaAssetId(hero.mediaAssetId ?? '');
      setPreviewUrl(hero.imageUrl);
      setHasCustom(hero.mediaAssetId != null);
      setSuccess(true);
    } catch {
      setError(t('errors.save'));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const hero = await updateAdminHomeHero({ mediaAssetId: null });
      setMediaAssetId('');
      setPreviewUrl(hero.imageUrl);
      setHasCustom(false);
      setSuccess(true);
    } catch {
      setError(t('errors.save'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Card padding="none" className="flex flex-col gap-4 overflow-hidden">
            <div className="relative aspect-[16/10] w-full bg-canvas">
              <Image
                src={displayPreview}
                alt={t('previewAlt')}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent px-4 py-3">
                <p className="text-xs font-medium text-on-dark">
                  {hasCustom ? t('previewCustom') : t('previewDefault')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-5">
            <MediaUploadField
              id="admin-home-hero"
              label={t('uploadLabel')}
              context="admin"
              value={mediaAssetId}
              previewUrl={previewUrl}
              onChange={(nextId) => {
                setMediaAssetId(nextId);
                setSuccess(false);
                setError(null);
              }}
            />

            <p className="text-sm text-ink-secondary">{t('hint')}</p>

            {error ? (
              <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            {success ? (
              <p role="status" className="text-sm text-success">
                {t('saveSuccess')}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !mediaAssetId.trim()}
                onClick={() => {
                  void handleSave();
                }}
              >
                {busy ? t('saving') : t('save')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy || !hasCustom}
                onClick={() => {
                  void handleReset();
                }}
              >
                {t('resetDefault')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
