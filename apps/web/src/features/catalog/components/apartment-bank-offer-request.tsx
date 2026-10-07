'use client';

import type { PriceVisibility, ProjectBankPartnerOfferSummary } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { useCreateBuyerRequestMutation } from '@/features/buyer/hooks/use-buyer';
import { isNonBuyerStaff } from '@/features/buyer/utils/is-buyer-account';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { usePathname } from '@/i18n/navigation';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';

const ESTIMATE_APR_PERCENT = 5.92;
const ESTIMATE_DOWN_PAYMENT_PERCENT = 20;
const ESTIMATE_TERM_YEARS = 30;
const MONTHS_PER_YEAR = 12;
const PERCENT_DIVISOR = 100;
const RATE_PATTERN = /(\d+(?:[.,]\d+)?)\s*%/;

type ApartmentBankOfferRequestProps = {
  apartmentId: string;
  projectId: string;
  amount: string | null;
  currency: string;
  priceVisibility: PriceVisibility;
  offers: ProjectBankPartnerOfferSummary[];
};

/**
 * Contact-card bank offer: featured bank, optional multi-select, then a request.
 */
export const ApartmentBankOfferRequest = ({
  apartmentId,
  projectId,
  amount,
  currency,
  priceVisibility,
  offers,
}: ApartmentBankOfferRequestProps) => {
  const t = useTranslations('Catalog.apartment');
  const locale = useLocale();
  const pathname = usePathname();
  const { data: user } = useMeQuery();
  const mutation = useCreateBuyerRequestMutation();
  const sorted = [...offers].sort((left, right) => left.sortOrder - right.sortOrder);
  const primary = sorted[0];
  const [othersOpen, setOthersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(primary ? [primary.id] : []);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!primary) {
    return null;
  }

  const priceLabel = formatOfferAmount(
    amount,
    currency,
    locale,
    priceVisibility,
    t('bankOfferOnRequest'),
  );
  const monthly = estimateMonthly(amount);
  const monthlyLabel =
    monthly == null
      ? '—'
      : formatOfferAmount(String(monthly), 'AMD', locale, priceVisibility, t('bankOfferOnRequest'));
  const rateLabel = resolveRateLabel(primary, locale);

  const send = async (ids: string[]): Promise<void> => {
    setError(null);
    if (!user || user.accountType !== 'buyer' || isNonBuyerStaff(user.accountType)) {
      window.location.assign(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    const names = sorted
      .filter((offer) => ids.includes(offer.id))
      .map((offer) => offer.partnerCompanyName ?? offer.name);
    if (names.length === 0) {
      return;
    }
    try {
      await mutation.mutateAsync({
        projectId,
        apartmentId,
        note: `${t('bankOfferNote')}: ${names.join(', ')}`,
      });
      setSent(true);
    } catch {
      setError(t('bankOfferError'));
    }
  };

  if (sent) {
    return <p className="text-sm font-medium text-ink-navy">{t('bankOfferSent')}</p>;
  }

  return (
    <div className="space-y-3 border-t border-header-border pt-4">
      <BankOfferRow
        offer={primary}
        totalLabel={t('bankOfferTotal', { amount: priceLabel })}
        monthlyLabel={t('bankOfferMonthly', { amount: monthlyLabel, rate: rateLabel })}
      />
      <SendRequestButton
        label={mutation.isPending ? t('inquireSubmitting') : t('bankOfferSend')}
        disabled={mutation.isPending}
        onClick={() => void send(othersOpen ? selectedIds : [primary.id])}
      />
      {sorted.length > 1 ? (
        <label className="flex items-center gap-2 text-sm text-ink-navy">
          <input
            type="checkbox"
            checked={othersOpen}
            onChange={(event) => {
              const open = event.target.checked;
              setOthersOpen(open);
              if (open) {
                setSelectedIds((current) =>
                  current.includes(primary.id) ? current : [primary.id, ...current],
                );
              }
            }}
          />
          {t('bankOfferOthers')}
        </label>
      ) : null}
      {othersOpen ? (
        <BankOfferChoices
          offers={sorted}
          selectedIds={selectedIds}
          onToggle={(id) => {
            setSelectedIds((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
            );
          }}
        />
      ) : null}
      {othersOpen ? (
        <SendRequestButton
          label={mutation.isPending ? t('inquireSubmitting') : t('bankOfferSend')}
          disabled={mutation.isPending || selectedIds.length === 0}
          onClick={() => void send(selectedIds)}
        />
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
};

const BankOfferRow = ({
  offer,
  totalLabel,
  monthlyLabel,
}: {
  offer: ProjectBankPartnerOfferSummary;
  totalLabel: string;
  monthlyLabel: string;
}) => {
  const name = offer.partnerCompanyName ?? offer.name;
  return (
    <div className="flex items-center gap-3">
      <AdminListCardLogo
        name={name}
        logoUrl={resolvePublicAssetUrl(offer.partnerCompanyLogoUrl)}
        shape="circle"
        className="size-12"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-navy">{totalLabel}</p>
        <p className="text-sm text-ink-secondary">{monthlyLabel}</p>
      </div>
    </div>
  );
};

const BankOfferChoices = ({
  offers,
  selectedIds,
  onToggle,
}: {
  offers: ProjectBankPartnerOfferSummary[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) => (
  <ul className="space-y-2">
    {offers.map((offer) => {
      const name = offer.partnerCompanyName ?? offer.name;
      return (
        <li key={offer.id}>
          <label className="flex items-center gap-2 text-sm text-ink-navy">
            <input
              type="checkbox"
              checked={selectedIds.includes(offer.id)}
              onChange={() => onToggle(offer.id)}
            />
            <AdminListCardLogo
              name={name}
              logoUrl={resolvePublicAssetUrl(offer.partnerCompanyLogoUrl)}
              shape="circle"
              className="size-8"
            />
            <span className="truncate">{name}</span>
          </label>
        </li>
      );
    })}
  </ul>
);

const SendRequestButton = ({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="flex h-11 w-full items-center justify-center rounded-[12px] bg-brand text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50"
  >
    {label}
  </button>
);

const formatOfferAmount = (
  amount: string | null,
  currency: string,
  locale: string,
  priceVisibility: PriceVisibility,
  onRequestLabel: string,
): string =>
  formatCatalogPrice({
    amount,
    currency,
    locale,
    priceVisibility,
    onRequestLabel,
    signInLabel: onRequestLabel,
  });

const estimateMonthly = (amount: string | null): number | null => {
  const price = amount != null ? Number(amount) : null;
  if (price == null || !Number.isFinite(price) || price <= 0) {
    return null;
  }
  const downPayment = Math.round((price * ESTIMATE_DOWN_PAYMENT_PERCENT) / PERCENT_DIVISOR);
  const loanAmount = price - downPayment;
  if (loanAmount <= 0) {
    return 0;
  }
  const monthlyRate = ESTIMATE_APR_PERCENT / PERCENT_DIVISOR / MONTHS_PER_YEAR;
  const payments = ESTIMATE_TERM_YEARS * MONTHS_PER_YEAR;
  const factor = (1 + monthlyRate) ** payments;
  return Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
};

const resolveRateLabel = (offer: ProjectBankPartnerOfferSummary, locale: string): string => {
  const text = offer.fields.mortgageTerms;
  const raw =
    text == null
      ? ''
      : locale === 'hy' || locale === 'ru' || locale === 'en'
        ? text[locale] || text.en || text.hy
        : text.en;
  const match = RATE_PATTERN.exec(raw);
  return match?.[1]?.replace(',', '.') ?? String(ESTIMATE_APR_PERCENT);
};
