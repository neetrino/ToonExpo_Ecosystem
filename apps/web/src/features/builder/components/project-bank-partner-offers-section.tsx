'use client';

import { Import } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useProjectEditSubForms } from '@/features/builder/context/project-edit-subforms-context';
import { useProjectBankPartnerOffersQuery } from '@/features/admin/hooks/use-project-bank-partner-offers';
import { ProjectBankPartnerOfferCard } from '@/features/builder/components/project-bank-partner-offer-card';
import { ProjectBankPartnerOfferImportSheet } from '@/features/builder/components/project-bank-partner-offer-import-sheet';
import { templateToPendingBankPartnerOffer } from '@/features/builder/utils/pending-bank-partner-offer';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import { Button } from '@/shared/ui/button';

type ProjectBankPartnerOffersSectionProps = {
  projectId: string;
};

/**
 * Project bank partner offers — multi-import templates, each as its own card.
 */
export const ProjectBankPartnerOffersSection = ({
  projectId,
}: ProjectBankPartnerOffersSectionProps) => {
  const t = useTranslations('Builder.projects.catalog.bankPartnerOffers');
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');
  const scope = useCatalogScope();
  const [importOpen, setImportOpen] = useState(false);
  const offersQuery = useProjectBankPartnerOffersQuery(scope, projectId);
  const { pendingImportTemplates } = useProjectEditSubForms();
  const savedOffers = offersQuery.data?.data ?? [];
  const pendingOffers = useMemo(
    () => pendingImportTemplates.map((template) => templateToPendingBankPartnerOffer(template, projectId)),
    [pendingImportTemplates, projectId],
  );
  const hasOffers = savedOffers.length > 0 || pendingOffers.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <ProjectCatalogSectionCard
        title={tCatalog('bankPartner')}
        headerAction={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="inline-flex items-center gap-1.5"
            disabled={offersQuery.isLoading}
            onClick={() => setImportOpen(true)}
          >
            <Import className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {t('import')}
          </Button>
        }
      >
        {offersQuery.isLoading ? (
          <p className="text-sm text-ink-secondary">{t('loading')}</p>
        ) : null}

        {offersQuery.isError ? (
          <p role="alert" className="text-sm text-danger">
            {t('error')}
          </p>
        ) : null}

        {!offersQuery.isLoading && !hasOffers ? (
          <p className="text-sm text-ink-secondary">{t('empty')}</p>
        ) : hasOffers ? (
          <p className="text-sm text-ink-secondary">{t('sectionHint')}</p>
        ) : null}
      </ProjectCatalogSectionCard>

      {savedOffers.map((offer) => (
        <ProjectBankPartnerOfferCard key={offer.id} projectId={projectId} offer={offer} />
      ))}

      {pendingOffers.map((offer) => (
        <ProjectBankPartnerOfferCard
          key={offer.id}
          projectId={projectId}
          offer={offer}
          isPending
        />
      ))}

      <ProjectBankPartnerOfferImportSheet
        projectId={projectId}
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
};
