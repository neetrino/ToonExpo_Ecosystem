import type { ProjectBankPartnerOfferSummary } from '@toonexpo/contracts';

import { ProjectCatalogDetailsList } from '@/features/catalog/components/project-catalog-details-bits';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import { buildProjectBankPartnerOfferRows } from '@/features/catalog/utils/build-project-bank-partner-offer-rows';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

type ProjectBankPartnerOffersPanelProps = {
  offers: ProjectBankPartnerOfferSummary[];
  locale: string;
  sectionTitle: string;
  labels: Parameters<typeof buildProjectBankPartnerOfferRows>[2];
};

/**
 * Renders stacked bank partner offer cards on the public project page.
 */
export const ProjectBankPartnerOffersPanel = ({
  offers,
  locale,
  sectionTitle,
  labels,
}: ProjectBankPartnerOffersPanelProps) => {
  if (offers.length === 0) {
    return null;
  }

  const resolvedLocale = locale === 'hy' || locale === 'ru' || locale === 'en' ? locale : 'en';

  return (
    <>
      {offers.map((offer) => {
        const rows = buildProjectBankPartnerOfferRows(offer, resolvedLocale, labels);
        if (rows.length === 0) {
          return null;
        }

        const title = offer.name.trim().length > 0 ? offer.name : sectionTitle;
        const logoUrl = resolvePublicAssetUrl(offer.partnerCompanyLogoUrl);

        return (
          <ProjectCatalogSectionCard key={offer.id} title={title}>
            {offer.partnerCompanyName ? (
              <div className="mb-4 flex items-center gap-2">
                <AdminListCardLogo
                  name={offer.partnerCompanyName}
                  logoUrl={logoUrl}
                  shape="circle"
                  className="size-8"
                />
                <span className="text-sm font-medium text-ink-secondary">
                  {offer.partnerCompanyName}
                </span>
              </div>
            ) : null}
            <ProjectCatalogDetailsList rows={rows} />
          </ProjectCatalogSectionCard>
        );
      })}
    </>
  );
};
