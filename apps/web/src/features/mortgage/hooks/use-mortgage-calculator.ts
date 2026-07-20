'use client';

import type { PublicMortgageOfferItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { MORTGAGE_CALCULATOR_DEBOUNCE_MS } from '@/features/mortgage/constants';
import { useMortgageCalculateMutation } from '@/features/mortgage/hooks/use-public-mortgage';
import { mortgageCalculatorSchema } from '@/features/mortgage/schemas/mortgage-calculator.schema';
import { resolveMortgageCalculatorValidationMessage } from '@/features/mortgage/utils/mortgage-calculator-validation';
import { pickNearestLoanTerm } from '@/features/mortgage/utils/mortgage-term';

type DownPaymentField = 'percent' | 'amount';

const DEFAULT_TERM_YEARS = 20;

type UseMortgageCalculatorParams = {
  offers: PublicMortgageOfferItem[];
};

export const useMortgageCalculator = ({ offers }: UseMortgageCalculatorParams) => {
  const t = useTranslations('Mortgage.calculator');
  const { mutate, data, isPending } = useMortgageCalculateMutation();

  const [selectedOfferId, setSelectedOfferId] = useState(offers[0]?.id ?? '');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('');
  const [downPaymentAmount, setDownPaymentAmount] = useState('');
  const [loanTermYears, setLoanTermYears] = useState<number | null>(null);
  const [termAdjustedHint, setTermAdjustedHint] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const lastDownPaymentField = useRef<DownPaymentField>('percent');

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? offers[0],
    [offers, selectedOfferId],
  );

  useEffect(() => {
    if (!selectedOffer) {
      return;
    }

    const minPercent = Number(selectedOffer.minDownPaymentPercent);
    if (downPaymentPercent === '') {
      setDownPaymentPercent(String(minPercent));
    }

    const defaultTerm =
      selectedOffer.termOptionsYears[selectedOffer.termOptionsYears.length - 1] ??
      DEFAULT_TERM_YEARS;

    setLoanTermYears((current) => {
      if (current == null) {
        return defaultTerm;
      }
      const nearest = pickNearestLoanTerm(current, selectedOffer.termOptionsYears);
      if (nearest !== current) {
        setTermAdjustedHint(t('termAdjusted', { years: nearest }));
      }
      return nearest;
    });
  }, [selectedOffer, downPaymentPercent, t]);

  const parsedPropertyPrice = Number(propertyPrice.replace(/\s/g, ''));
  const parsedDownPaymentPercent = Number(downPaymentPercent);

  const syncDownPaymentFromPercent = (price: number, percent: number) => {
    const amount = Math.round((price * percent) / 100);
    setDownPaymentAmount(amount > 0 ? String(amount) : '');
  };

  const syncDownPaymentFromAmount = (price: number, amount: number) => {
    if (price <= 0) {
      return;
    }
    const percent = (amount / price) * 100;
    setDownPaymentPercent(percent.toFixed(2).replace(/\.?0+$/, ''));
  };

  const handlePropertyPriceChange = (value: string) => {
    setPropertyPrice(value);
    const price = Number(value.replace(/\s/g, ''));
    if (!Number.isFinite(price) || price <= 0) {
      return;
    }
    if (lastDownPaymentField.current === 'percent') {
      const percent = Number(downPaymentPercent);
      if (Number.isFinite(percent)) {
        syncDownPaymentFromPercent(price, percent);
      }
    } else {
      const amount = Number(downPaymentAmount.replace(/\s/g, ''));
      if (Number.isFinite(amount)) {
        syncDownPaymentFromAmount(price, amount);
      }
    }
  };

  const handleDownPaymentPercentChange = (value: string) => {
    lastDownPaymentField.current = 'percent';
    setDownPaymentPercent(value);
    const price = Number(propertyPrice.replace(/\s/g, ''));
    const percent = Number(value);
    if (Number.isFinite(price) && price > 0 && Number.isFinite(percent)) {
      syncDownPaymentFromPercent(price, percent);
    }
  };

  const handleDownPaymentAmountChange = (value: string) => {
    lastDownPaymentField.current = 'amount';
    setDownPaymentAmount(value);
    const price = Number(propertyPrice.replace(/\s/g, ''));
    const amount = Number(value.replace(/\s/g, ''));
    if (Number.isFinite(price) && price > 0 && Number.isFinite(amount)) {
      syncDownPaymentFromAmount(price, amount);
    }
  };

  const handleSelectOffer = (offerId: string) => {
    const offer = offers.find((item) => item.id === offerId);
    if (!offer) {
      return;
    }

    setSelectedOfferId(offerId);
    setTermAdjustedHint(null);

    const minPercent = Number(offer.minDownPaymentPercent);
    setDownPaymentPercent(String(minPercent));

    const price = Number(propertyPrice.replace(/\s/g, ''));
    if (Number.isFinite(price) && price > 0) {
      syncDownPaymentFromPercent(price, minPercent);
    }

    setLoanTermYears((current) => {
      const base = current ?? offer.termOptionsYears[0] ?? DEFAULT_TERM_YEARS;
      const nearest = pickNearestLoanTerm(base, offer.termOptionsYears);
      if (current != null && nearest !== current) {
        setTermAdjustedHint(t('termAdjusted', { years: nearest }));
      }
      return nearest;
    });
  };

  useEffect(() => {
    if (!selectedOffer || loanTermYears == null) {
      return;
    }

    // Empty price = pristine form; do not show validation errors yet.
    if (propertyPrice.trim() === '') {
      setValidationMessage(null);
      return;
    }

    const validation = mortgageCalculatorSchema.safeParse({
      propertyPrice: parsedPropertyPrice,
      downPaymentPercent: parsedDownPaymentPercent,
      loanTermYears,
      bankOfferId: selectedOffer.id,
      minDownPaymentPercent: Number(selectedOffer.minDownPaymentPercent),
      termOptionsYears: selectedOffer.termOptionsYears,
    });

    if (!validation.success) {
      setValidationMessage(
        resolveMortgageCalculatorValidationMessage(validation.error.issues[0]?.message, t),
      );
      return;
    }

    setValidationMessage(null);

    const timer = window.setTimeout(() => {
      mutate({
        propertyPrice: parsedPropertyPrice,
        downPaymentPercent: parsedDownPaymentPercent,
        loanTermYears,
        bankOfferId: selectedOffer.id,
      });
    }, MORTGAGE_CALCULATOR_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    selectedOffer,
    propertyPrice,
    parsedPropertyPrice,
    parsedDownPaymentPercent,
    loanTermYears,
    mutate,
    t,
  ]);

  const monthlyPaymentByOffer = useMemo(() => {
    const map = new Map<string, number>();
    if (data && selectedOfferId) {
      map.set(selectedOfferId, data.monthlyPayment);
    }
    return map;
  }, [data, selectedOfferId]);

  return {
    selectedOffer,
    selectedOfferId,
    propertyPrice,
    downPaymentPercent,
    downPaymentAmount,
    loanTermYears,
    termAdjustedHint,
    validationMessage,
    calculationResult: data ?? null,
    isCalculating: isPending,
    monthlyPaymentByOffer,
    handlePropertyPriceChange,
    handleDownPaymentPercentChange,
    handleDownPaymentAmountChange,
    handleSelectOffer,
    setLoanTermYears,
    setTermAdjustedHint,
  };
};
