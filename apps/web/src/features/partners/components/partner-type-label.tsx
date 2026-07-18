import type { PartnerCompanyType } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

type PartnerTypeLabelProps = {
  type: PartnerCompanyType;
  className?: string | undefined;
};

/**
 * Localized label for a partner company type.
 */
export const PartnerTypeLabel = ({ type, className }: PartnerTypeLabelProps) => {
  const t = useTranslations("Partners");

  return <span className={className}>{t(`types.${type}`)}</span>;
};
