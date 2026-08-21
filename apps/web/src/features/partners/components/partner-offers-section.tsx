'use client';

import type { PartnerOfferItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PartnerOfferForm } from '@/features/partners/components/partner-offer-form';
import { toPartnerOfferFormValues } from '@/features/partners/utils/partner-form-values';
import {
  toCreatePartnerOfferBody,
  toUpdatePartnerOfferBody,
} from '@/features/partners/utils/partner-mappers';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Button } from '@/shared/ui/button';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { useDeleteConfirm } from '@/shared/hooks/use-delete-confirm';

type PartnerOffersSectionProps = {
  offers: PartnerOfferItem[];
  onCreate: (body: ReturnType<typeof toCreatePartnerOfferBody>) => Promise<void>;
  onUpdate: (offerId: string, body: ReturnType<typeof toUpdatePartnerOfferBody>) => Promise<void>;
  onDelete: (offerId: string) => Promise<void>;
  isBusy?: boolean | undefined;
};

/**
 * CRUD list for partner offers with locale tabs per offer form.
 */
export const PartnerOffersSection = ({
  offers,
  onCreate,
  onUpdate,
  onDelete,
  isBusy = false,
}: PartnerOffersSectionProps) => {
  const t = useTranslations('Partners.offers');
  const tCommon = useTranslations('Common');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const deleteConfirm = useDeleteConfirm<PartnerOfferItem>();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{t('title')}</h2>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditingId(null);
            setShowCreate(true);
          }}
        >
          <AddActionLabel>{t('add')}</AddActionLabel>
        </Button>
      </div>

      {offers.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {offers.map((offer) => (
            <li key={offer.id} className="rounded-sm border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{offer.title}</p>
                  {offer.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">
                      {offer.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <PublicationStatusBadge status={offer.publicationStatus} />
                    <span className="text-xs text-ink-muted">
                      {t('sortOrder', { value: offer.sortOrder })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowCreate(false);
                      setEditingId(offer.id);
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isBusy}
                    onClick={() => {
                      deleteConfirm.request(offer);
                    }}
                  >
                    {t('delete')}
                  </Button>
                </div>
              </div>

              {editingId === offer.id ? (
                <div className="mt-4 border-t border-border pt-4">
                  <PartnerOfferForm
                    key={offer.id}
                    defaultValues={toPartnerOfferFormValues(offer)}
                    submitLabel={t('save')}
                    onCancel={() => {
                      setEditingId(null);
                    }}
                    onSubmit={async (values) => {
                      await onUpdate(offer.id, toUpdatePartnerOfferBody(values));
                      setEditingId(null);
                    }}
                    isBusy={isBusy}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {showCreate ? (
        <div className="rounded-sm border border-border bg-background p-4">
          <PartnerOfferForm
            defaultValues={{
              titleHy: '',
              titleRu: '',
              titleEn: '',
              descriptionHy: '',
              descriptionRu: '',
              descriptionEn: '',
              publicationStatus: 'draft',
              sortOrder: offers.length,
            }}
            submitLabel={t('create')}
            onCancel={() => {
              setShowCreate(false);
            }}
            onSubmit={async (values) => {
              await onCreate(toCreatePartnerOfferBody(values));
              setShowCreate(false);
            }}
            isBusy={isBusy}
          />
        </div>
      ) : null}

      <ConfirmDeleteModal
        open={deleteConfirm.open}
        message={
          deleteConfirm.pending
            ? tCommon('deleteConfirmNamedMessage', { name: deleteConfirm.pending.title })
            : undefined
        }
        confirming={isBusy}
        onCancel={() => {
          if (!isBusy) {
            deleteConfirm.cancel();
          }
        }}
        onConfirm={() => {
          if (isBusy) {
            return;
          }
          void deleteConfirm.run(async (offer) => {
            await onDelete(offer.id);
          });
        }}
      />
    </section>
  );
};
