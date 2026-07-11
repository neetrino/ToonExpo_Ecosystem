'use client';

import { useState } from 'react';

import type { AdminBankOfferRow } from '@/lib/admin/queries';

import { BankOfferStatusButton } from '../partner-status-buttons';
import { BankOfferFormSheet } from '../sheets/bank-offer-form-sheet';

type BankOffersSectionProps = {
  locale: string;
  partnerId: string;
  offers: AdminBankOfferRow[];
  labels: {
    title: string;
    empty: string;
    newOffer: string;
    edit: string;
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
    featured: string;
  };
};

export function BankOffersSection({ locale, partnerId, offers, labels }: BankOffersSectionProps) {
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
                <BankOfferRow
                  key={offer.id}
                  locale={locale}
                  partnerId={partnerId}
                  offer={offer}
                  labels={labels}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BankOfferFormSheet
        locale={locale}
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        values={{
          partnerId,
          title: '',
          interestRate: 10,
          maxTermMonths: 240,
          featured: false,
        }}
      />
    </section>
  );
}

type BankOfferRowProps = {
  locale: string;
  partnerId: string;
  offer: AdminBankOfferRow;
  labels: BankOffersSectionProps['labels'];
};

function BankOfferRow({ locale, partnerId, offer, labels }: BankOfferRowProps) {
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
        <div className="portal-toolbar">
          <button
            type="button"
            className="portal-btn portal-btn--ghost portal-btn--sm"
            onClick={() => setEditOpen(true)}
          >
            {labels.edit}
          </button>
          {offer.status !== 'PUBLISHED' ? (
            <BankOfferStatusButton
              locale={locale}
              partnerId={partnerId}
              bankOfferId={offer.id}
              targetStatus="PUBLISHED"
              actionKey="publish"
            />
          ) : null}
          {offer.status !== 'ARCHIVED' ? (
            <BankOfferStatusButton
              locale={locale}
              partnerId={partnerId}
              bankOfferId={offer.id}
              targetStatus="ARCHIVED"
              actionKey="archive"
            />
          ) : null}
          {offer.status !== 'DRAFT' ? (
            <BankOfferStatusButton
              locale={locale}
              partnerId={partnerId}
              bankOfferId={offer.id}
              targetStatus="DRAFT"
              actionKey="draft"
            />
          ) : null}
        </div>
        <BankOfferFormSheet
          locale={locale}
          mode="edit"
          open={editOpen}
          onClose={() => setEditOpen(false)}
          values={{
            bankOfferId: offer.id,
            partnerId,
            title: offer.title,
            description: offer.description,
            interestRate: offer.interestRate,
            maxTermMonths: offer.maxTermMonths,
            maxAmountAmd: offer.maxAmountAmd,
            featured: offer.featured,
          }}
        />
      </td>
    </tr>
  );
}
