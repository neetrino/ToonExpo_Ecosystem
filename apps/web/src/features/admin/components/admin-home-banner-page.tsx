'use client';

import type { HomeHeroSlide, MediaAssetItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  getAdminHomeHero,
  updateAdminHomeHero,
} from '@/features/admin/api/admin-home-hero-api';
import {
  DEFAULT_HOME_HERO_IMAGE_SRC,
  HOME_HERO_MAX_SLIDES,
} from '@/features/catalog/constants/home-hero';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { cn } from '@/shared/ui/cn';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type DraftSlide = HomeHeroSlide;

/**
 * Admin editor for ordered home hero banners (carousel on the public site).
 */
export const AdminHomeBannerPage = () => {
  const t = useTranslations('Admin.homeBanner');
  const [slides, setSlides] = useState<DraftSlide[]>([]);
  const [addValue, setAddValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();
  const [dirty, setDirty] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

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
        setSlides(hero.slides);
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

  const previewSrc = slides[0]?.imageUrl ?? DEFAULT_HOME_HERO_IMAGE_SRC;
  const atLimit = slides.length >= HOME_HERO_MAX_SLIDES;

  const addSlide = (asset: MediaAssetItem): void => {
    if (slides.some((slide) => slide.mediaAssetId === asset.id)) {
      setError(t('errors.duplicate'));
      return;
    }
    if (slides.length >= HOME_HERO_MAX_SLIDES) {
      setError(t('errors.maxSlides', { max: HOME_HERO_MAX_SLIDES }));
      return;
    }
    setSlides((current) => [
      ...current,
      { mediaAssetId: asset.id, imageUrl: asset.fileUrl },
    ]);
    setAddValue('');
    setDirty(true);
    setError(null);
  };

  const removeSlide = (mediaAssetId: string): void => {
    setSlides((current) => current.filter((slide) => slide.mediaAssetId !== mediaAssetId));
    setDirty(true);
  };

  const moveSlide = (index: number, direction: -1 | 1): void => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) {
      return;
    }
    setSlides((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      if (!item) {
        return current;
      }
      copy.splice(nextIndex, 0, item);
      return copy;
    });
    setDirty(true);
  };

  const handleSave = async (): Promise<void> => {
    if (slides.length === 0) {
      setError(t('errors.required'));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const hero = await updateAdminHomeHero({
        mediaAssetIds: slides.map((slide) => slide.mediaAssetId),
      });
      setSlides(hero.slides);
      setDirty(false);
      showSuccess(t('saveSuccess'));
    } catch {
      setError(t('errors.save'));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const hero = await updateAdminHomeHero({ mediaAssetIds: null });
      setSlides(hero.slides);
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
      <div className="flex flex-col gap-2">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card padding="none" className="overflow-hidden">
            <div className="relative aspect-[16/10] w-full bg-canvas">
              <Image
                src={previewSrc}
                alt={t('previewAlt')}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent px-4 py-3">
                <p className="text-xs font-medium text-on-dark">
                  {slides.length === 0
                    ? t('previewDefault')
                    : t('previewCount', { count: slides.length })}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">{t('slidesTitle')}</h2>
                <p className="text-xs text-ink-muted">
                  {t('slidesMeta', { count: slides.length, max: HOME_HERO_MAX_SLIDES })}
                </p>
              </div>

              {slides.length === 0 ? (
                <p className="text-sm text-ink-secondary">{t('slidesEmpty')}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {slides.map((slide, index) => (
                    <li
                      key={slide.mediaAssetId}
                      className="flex items-center gap-3 rounded-sm border border-border bg-background p-2"
                    >
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-canvas">
                        <Image
                          src={slide.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {t('slideLabel', { index: index + 1 })}
                        </p>
                        <p className="truncate text-xs text-ink-muted">{slide.mediaAssetId}</p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={busy || index === 0}
                          onClick={() => moveSlide(index, -1)}
                        >
                          {t('moveUp')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={busy || index === slides.length - 1}
                          onClick={() => moveSlide(index, 1)}
                        >
                          {t('moveDown')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => setPendingRemoveId(slide.mediaAssetId)}
                        >
                          {t('remove')}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className={cn('flex flex-col gap-4', atLimit && 'opacity-70')}>
              <MediaUploadField
                id="admin-home-hero-add"
                label={t('uploadLabel')}
                context="admin"
                value={addValue}
                onChange={setAddValue}
                onAssetSelected={addSlide}
                error={atLimit ? t('errors.maxSlides', { max: HOME_HERO_MAX_SLIDES }) : undefined}
              />
              <p className="text-sm text-ink-secondary">{t('hint')}</p>
            </Card>

            {error ? (
              <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !dirty || slides.length === 0}
                onClick={() => {
                  void handleSave();
                }}
              >
                {busy ? t('saving') : t('save')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  void handleReset();
                }}
              >
                {t('resetDefault')}
              </Button>
            </div>
          </div>
        </div>
      )}
      {successToast}
      <ConfirmDeleteModal
        open={pendingRemoveId != null}
        title={t('removeConfirmTitle')}
        message={t('removeConfirmMessage')}
        confirmLabel={t('remove')}
        onCancel={() => setPendingRemoveId(null)}
        onConfirm={() => {
          if (pendingRemoveId) {
            removeSlide(pendingRemoveId);
          }
          setPendingRemoveId(null);
        }}
      />
    </div>
  );
};
