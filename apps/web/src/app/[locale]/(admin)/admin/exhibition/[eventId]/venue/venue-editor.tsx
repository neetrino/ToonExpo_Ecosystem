'use client';

import {
  BOOTH_COORD_MAX,
  BOOTH_COORD_MIN,
  VENUE_IMAGE_ALT_MAX_LENGTH,
  VENUE_IMAGE_URL_MAX_LENGTH,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { PortalFormField, PortalTextInput } from '@/components/portal-forms/form-fields';
import { ImageUploadField } from '@/components/portal-forms/image-upload-field';
import { useRouter } from '@/i18n/navigation';
import type {
  AdminAssignmentOption,
  AdminVenueBoothRow,
  AdminVenueMapDetail,
} from '@/lib/exhibition/admin-venue-queries';
import type { AdminMutationErrorKey } from '@/lib/admin/mutation-result';
import { computeHotspotPercent } from '@/lib/visual-map/hotspot-geometry';

import { upsertVenueMapAction } from './actions';
import { BoothFormSheet } from './booth-form-sheet';

type VenueEditorProps = {
  locale: string;
  detail: AdminVenueMapDetail;
  companies: AdminAssignmentOption[];
  partners: AdminAssignmentOption[];
};

type EditorSheet =
  | { kind: 'closed' }
  | { kind: 'create'; xPercent: number; yPercent: number }
  | { kind: 'edit'; booth: AdminVenueBoothRow };

export function VenueEditor({ locale, detail, companies, partners }: VenueEditorProps) {
  const t = useTranslations('admin.exhibition.venue');
  const router = useRouter();
  const imageRef = useRef<HTMLImageElement>(null);
  const [sheet, setSheet] = useState<EditorSheet>({ kind: 'closed' });
  const [mapError, setMapError] = useState<AdminMutationErrorKey | undefined>();
  const [pending, startTransition] = useTransition();

  function handleImageClick(event: React.MouseEvent<HTMLImageElement>): void {
    if (!detail.venueMap) {
      return;
    }
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const coords = computeHotspotPercent(rect, event.clientX, event.clientY);
    setSheet({ kind: 'create', xPercent: coords.x, yPercent: coords.y });
  }

  function handleMapSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMapError(undefined);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await upsertVenueMapAction(locale, detail.event.id, {
        imageUrl: String(formData.get('imageUrl') ?? ''),
        imageAlt: String(formData.get('imageAlt') ?? ''),
      });
      if (!result.ok) {
        setMapError(result.errorKey);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="portal-visual-map-editor">
      <header className="portal-visual-map-editor__header">
        <div>
          <h2 className="portal-page__title">{t('title', { name: detail.event.name })}</h2>
          <p className="portal-visual-map-hint">
            <code className="portal-code">{detail.event.code}</code> · {detail.event.status}
          </p>
        </div>
      </header>

      <form className="portal-form" onSubmit={handleMapSubmit}>
        <ImageUploadField
          name="imageUrl"
          purpose="VENUE_IMAGE"
          initialUrl={detail.venueMap?.imageUrl ?? ''}
          required
          maxLength={VENUE_IMAGE_URL_MAX_LENGTH}
        />
        <PortalFormField label={t('fields.imageAlt')} name="imageAlt">
          <PortalTextInput
            name="imageAlt"
            defaultValue={detail.venueMap?.imageAlt ?? ''}
            maxLength={VENUE_IMAGE_ALT_MAX_LENGTH}
          />
        </PortalFormField>
        <PortalFormError errorKey={mapError} />
        <button type="submit" className="portal-btn" disabled={pending}>
          {t('saveMap')}
        </button>
      </form>

      {detail.venueMap ? (
        <>
          <p className="portal-visual-map-hint">{t('clickHint')}</p>
          <div className="portal-visual-map-canvas">
            <img
              ref={imageRef}
              src={detail.venueMap.imageUrl}
              alt={detail.venueMap.imageAlt ?? detail.event.name}
              className="portal-visual-map-canvas__image"
              onClick={handleImageClick}
            />
            <div className="portal-visual-map-canvas__overlay">
              {detail.booths.map((booth) => (
                <button
                  key={booth.id}
                  type="button"
                  className="portal-visual-map-marker"
                  style={{ left: `${booth.xPercent}%`, top: `${booth.yPercent}%` }}
                  title={booth.code}
                  aria-label={booth.code}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSheet({ kind: 'edit', booth });
                  }}
                >
                  <span className="portal-visual-map-marker__label">{booth.code}</span>
                </button>
              ))}
            </div>
          </div>
          <BoothFormSheet
            locale={locale}
            eventId={detail.event.id}
            venueMapId={detail.venueMap.id}
            companies={companies}
            partners={partners}
            open={sheet.kind !== 'closed'}
            mode={sheet.kind === 'edit' ? 'edit' : 'create'}
            booth={sheet.kind === 'edit' ? sheet.booth : undefined}
            coords={
              sheet.kind === 'create'
                ? { xPercent: sheet.xPercent, yPercent: sheet.yPercent }
                : sheet.kind === 'edit'
                  ? { xPercent: sheet.booth.xPercent, yPercent: sheet.booth.yPercent }
                  : { xPercent: BOOTH_COORD_MIN, yPercent: BOOTH_COORD_MIN }
            }
            onClose={() => setSheet({ kind: 'closed' })}
          />
        </>
      ) : (
        <p className="portal-empty">{t('noMap')}</p>
      )}

      <p className="portal-visual-map-hint">
        {t('coordHint', { min: BOOTH_COORD_MIN, max: BOOTH_COORD_MAX })}
      </p>
    </div>
  );
}
