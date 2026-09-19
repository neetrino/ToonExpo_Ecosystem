'use client';

import type { HomeHeroSlide, MediaAssetItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  getAdminHomeHero,
  updateAdminHomeHero,
} from '@/features/admin/api/admin-home-hero-api';
import {
  AdminHomeBannerCopyFields,
  emptyHomeHeroCopyDraft,
  toHomeHeroCopyDraft,
  type HomeHeroCopyDraft,
} from '@/features/admin/components/admin-home-banner-copy-fields';
import { AdminHomeBannerSlideList } from '@/features/admin/components/admin-home-banner-slide-list';
import {
  FORM_SAVE_BAR_SCROLL_CLEARANCE_CLASS,
  FormSaveBar,
} from '@/features/builder/components/form-save-bar';
import { HOME_HERO_MAX_SLIDES } from '@/features/catalog/constants/home-hero';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { cn } from '@/shared/ui/cn';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type DraftSlide = HomeHeroSlide;

/**
 * Admin editor for ordered home hero banners and headline copy.
 */
export const AdminHomeBannerPage = () => {
  const t = useTranslations('Admin.homeBanner');
  const [slides, setSlides] = useState<DraftSlide[]>([]);
  const [copy, setCopy] = useState<HomeHeroCopyDraft>(emptyHomeHeroCopyDraft);
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
        setCopy(toHomeHeroCopyDraft(hero.title, hero.subtitle));
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
    setSlides((current) => [...current, { mediaAssetId: asset.id, imageUrl: asset.fileUrl }]);
    setAddValue('');
    setDirty(true);
    setError(null);
  };

  const removeSlide = (mediaAssetId: string): void => {
    setSlides((current) => current.filter((slide) => slide.mediaAssetId !== mediaAssetId));
    setDirty(true);
  };

  const handleSave = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const hero = await updateAdminHomeHero({
        mediaAssetIds: slides.length === 0 ? [] : slides.map((slide) => slide.mediaAssetId),
        title: copy.title,
        subtitle: copy.subtitle,
      });
      setSlides(hero.slides);
      setCopy(toHomeHeroCopyDraft(hero.title, hero.subtitle));
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
      setCopy(toHomeHeroCopyDraft(hero.title, hero.subtitle));
      setDirty(false);
      showSuccess(t('saveSuccess'));
    } catch {
      setError(t('errors.save'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', FORM_SAVE_BAR_SCROLL_CLEARANCE_CLASS)}>
      <div className="flex flex-col gap-2">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-5">
              <AdminHomeBannerSlideList
                slides={slides}
                maxSlides={HOME_HERO_MAX_SLIDES}
                busy={busy}
                onReorder={(next) => {
                  setSlides(next);
                  setDirty(true);
                }}
                onRemove={setPendingRemoveId}
              />
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
            </div>

            <Card className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold text-ink">{t('copy.titleSection')}</h2>
                <p className="text-sm text-ink-secondary">{t('copy.hint')}</p>
              </div>
              <AdminHomeBannerCopyFields
                value={copy}
                disabled={busy}
                onChange={(next) => {
                  setCopy(next);
                  setDirty(true);
                }}
              />
            </Card>
          </div>

          {error ? (
            <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <FormSaveBar>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !dirty}
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
          </FormSaveBar>
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
