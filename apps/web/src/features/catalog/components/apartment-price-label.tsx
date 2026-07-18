"use client";

import type { PriceVisibility } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { usePriceOverlay } from "@/features/catalog/components/price-overlay-scope";
import { formatCatalogPrice } from "@/features/catalog/utils/format-price";
import { Link } from "@/i18n/navigation";

type ApartmentPriceProps = {
  apartmentId: string;
  amount: string | null;
  currency: string;
  priceVisibility: PriceVisibility;
};

const useApartmentPriceLabel = ({
  apartmentId,
  amount,
  currency,
  priceVisibility,
}: ApartmentPriceProps): { label: string; revealed: boolean } => {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(apartmentId);
  const effectiveAmount = amount ?? overlay?.price ?? null;

  return {
    label: formatCatalogPrice({
      amount: effectiveAmount,
      currency: overlay?.priceCurrency ?? currency,
      locale,
      priceVisibility,
      onRequestLabel: t("price.onRequest"),
      signInLabel: t("price.signInToSee"),
    }),
    revealed: effectiveAmount != null,
  };
};

/**
 * Apartment row price. SSR renders the anonymous cached value; after
 * hydration the authenticated overlay reveals `visible_after_login` prices.
 */
export const ApartmentPriceLabel = (props: ApartmentPriceProps) => {
  const { label } = useApartmentPriceLabel(props);
  return <span className="font-brand font-semibold text-ink">{label}</span>;
};

/**
 * Apartment detail price heading: sign-in CTA for hidden
 * `visible_after_login` prices, plain amount once revealed.
 */
export const ApartmentDetailPrice = (props: ApartmentPriceProps) => {
  const { label, revealed } = useApartmentPriceLabel(props);
  const needsSignIn =
    props.priceVisibility === "visible_after_login" && !revealed;

  if (needsSignIn) {
    return (
      <p className="font-brand text-2xl font-bold text-ink">
        <Link href="/auth/login" className="underline-offset-4 hover:underline">
          {label}
        </Link>
      </p>
    );
  }

  return <p className="font-brand text-3xl font-bold text-ink">{label}</p>;
};
