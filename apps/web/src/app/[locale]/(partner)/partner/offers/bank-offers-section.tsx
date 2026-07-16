'use client';

import { useState } from 'react';

import type { PartnerCabinetBankOffer } from '@/lib/partner/queries';

import { PartnerBankOfferFormSheet } from './sheets/bank-offer-form-sheet';

type PartnerBankOffersSectionProps = {
  locale: string;
  offers: PartnerCabinetBankOffer[];
  labels: {
    title: string;
    empty: string;
    newOffer: string;
    edit: string;
    featured: string;
    columns: {
      title: string;
      rate: string;
      term: string;
      amount: string;
      status: string;
      actions: string;
    };
    status: {
      DRAFT: string;
      PUBLISHED: string;
      ARCHIVED: string;
    };
  };
};

export function PartnerBankOffersSection({
  locale,
  offers,
  labels,
}: PartnerBankOffersSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="portal-section">
      <div className="portal-page__header">
        <h3 className="portal-page__subtitle">{labels.title}</h3>
        <button
          type="button"
          className="portal-btn portal-btn--primary"
          onClick={() => setCreateOpen(true)}
        >
          {labels.newOffer}
        </button>
      </div>

      {offers.length === 0 ? (
        <p className="portal-empty">{labels.empty}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{labels.columns.title}</th>
                <th>{labels.columns.rate}</th>
                <th>{labels.columns.term}</th>
                <th>{labels.columns.amount}</th>
                <th>{labels.columns.status}</th>
                <th>{labels.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <PartnerBankOfferRow
                  key={offer.id}
                  locale={locale}
                  offer={offer}
                  labels={labels}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PartnerBankOfferFormSheet
        locale={locale}
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        values={{
          title: '',
          interestRate: 10,
          minDownPaymentPercent: 10,
          maxTermMonths: 240,
          featured: false,
        }}
      />
    </section>
  );
}

type PartnerBankOfferRowProps = {
  locale: string;
  offer: PartnerCabinetBankOffer;
  labels: PartnerBankOffersSectionProps['labels'];
};

function PartnerBankOfferRow({ locale, offer, labels }: PartnerBankOfferRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <tr>
      <td>
        {offer.title}
        {offer.featured ? ` · ${labels.featured}` : null}
      </td>
      <td>{offer.interestRate}%</td>
      <td>{offer.maxTermMonths}</td>
      <td>{offer.maxAmountAmd ?? '—'}</td>
      <td>
        <span className={`portal-badge portal-badge--${offer.status.toLowerCase()}`}>
          {labels.status[offer.status]}
        </span>
      </td>
      <td>
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={() => setEditOpen(true)}
        >
          {labels.edit}
        </button>
        <PartnerBankOfferFormSheet
          locale={locale}
          mode="edit"
          open={editOpen}
          onClose={() => setEditOpen(false)}
          values={{
            bankOfferId: offer.id,
            title: offer.title,
            description: offer.description,
            interestRate: offer.interestRate,
            minDownPaymentPercent: offer.minDownPaymentPercent,
            maxTermMonths: offer.maxTermMonths,
            maxAmountAmd: offer.maxAmountAmd,
            featured: offer.featured,
          }}
        />
      </td>
    </tr>
  );
}
