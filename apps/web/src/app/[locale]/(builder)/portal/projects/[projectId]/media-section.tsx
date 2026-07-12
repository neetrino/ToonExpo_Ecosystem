'use client';

import { useState } from 'react';

import type { BuilderMediaAsset } from '@/lib/builder/queries';

import {
  MediaFormSheet,
  mediaAssetToFormValues,
  type MediaOwnerValues,
} from '../sheets/media-form-sheet';
import { MediaDeleteButton } from './media-delete-button';

type MediaSectionLabels = {
  title: string;
  addMedia: string;
  empty: string;
  edit: string;
  delete: string;
  coverBadge: string;
  coverHint: string;
  sortOrder: string;
  noAlt: string;
  confirmDelete: string;
};

type MediaSectionProps = {
  locale: string;
  owner: MediaOwnerValues;
  media: BuilderMediaAsset[];
  labels: MediaSectionLabels;
  compact?: boolean;
};

export function MediaSection({
  locale,
  owner,
  media,
  labels,
  compact = false,
}: MediaSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<BuilderMediaAsset | null>(null);

  const sectionClass = compact
    ? 'portal-media-section portal-media-section--compact'
    : 'portal-section portal-media-section';

  return (
    <section className={sectionClass}>
      <div className="portal-section__header portal-media-section__header">
        {!compact ? <h3 className="portal-section__title">{labels.title}</h3> : null}
        <button
          type="button"
          className={
            compact
              ? 'portal-btn portal-btn--ghost portal-btn--sm'
              : 'portal-btn portal-btn--primary'
          }
          onClick={() => setCreateOpen(true)}
        >
          {labels.addMedia}
        </button>
      </div>

      {!compact ? <p className="portal-form__hint">{labels.coverHint}</p> : null}

      {media.length === 0 ? (
        <p className="portal-empty">{labels.empty}</p>
      ) : (
        <div className="portal-media__grid">
          {media.map((asset, index) => (
            <MediaCard
              key={asset.id}
              locale={locale}
              asset={asset}
              isCover={index === 0}
              labels={labels}
              onEdit={() => setEditingAsset(asset)}
            />
          ))}
        </div>
      )}

      <MediaFormSheet
        locale={locale}
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        values={{
          ...owner,
          url: '',
          alt: null,
          sortOrder: media.length,
        }}
      />

      {editingAsset ? (
        <MediaFormSheet
          locale={locale}
          mode="edit"
          open
          onClose={() => setEditingAsset(null)}
          values={mediaAssetToFormValues(editingAsset, owner)}
        />
      ) : null}
    </section>
  );
}

type MediaCardProps = {
  locale: string;
  asset: BuilderMediaAsset;
  isCover: boolean;
  labels: MediaSectionLabels;
  onEdit: () => void;
};

function MediaCard({ locale, asset, isCover, labels, onEdit }: MediaCardProps) {
  return (
    <article className="portal-media-card">
      <img
        className="portal-media-card__thumb"
        src={asset.url}
        alt={asset.alt ?? ''}
        loading="lazy"
      />
      <div className="portal-media-card__body">
        {isCover ? <span className="portal-badge portal-badge--published">{labels.coverBadge}</span> : null}
        <p className="portal-media-card__alt">{asset.alt ?? labels.noAlt}</p>
        <p className="portal-media-card__meta">
          {labels.sortOrder}: {asset.sortOrder}
        </p>
        <div className="portal-actions">
          <button
            type="button"
            className="portal-btn portal-btn--ghost portal-btn--sm"
            onClick={onEdit}
          >
            {labels.edit}
          </button>
          <MediaDeleteButton
            locale={locale}
            mediaAssetId={asset.id}
            confirmMessage={labels.confirmDelete}
            label={labels.delete}
          />
        </div>
      </div>
    </article>
  );
}
