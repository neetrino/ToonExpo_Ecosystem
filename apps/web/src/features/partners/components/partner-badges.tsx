import type { PartnerCompanyStatus, PublicationStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import { LIST_STATUS_BADGE_CLASS } from '@/shared/ui/list-status-badge';

type PartnerStatusBadgeProps = {
  status: PartnerCompanyStatus;
};

const statusClassName: Record<PartnerCompanyStatus, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-surface text-ink-muted',
};

/**
 * Compact pill badge for partner active/inactive status.
 */
export const PartnerStatusBadge = ({ status }: PartnerStatusBadgeProps) => {
  const t = useTranslations('Partners');

  return (
    <span className={cn(LIST_STATUS_BADGE_CLASS, statusClassName[status])}>
      {t(`companyStatus.${status}`)}
    </span>
  );
};

type PublicationStatusBadgeProps = {
  status: PublicationStatus;
  className?: string | undefined;
};

const publicationClassName: Record<PublicationStatus, string> = {
  draft: 'bg-surface text-ink-muted',
  published: 'bg-brand/10 text-brand',
  archived: 'bg-warning/10 text-warning',
};

/**
 * Compact pill badge for publication status.
 */
export const PublicationStatusBadge = ({ status, className }: PublicationStatusBadgeProps) => {
  const t = useTranslations('Partners');

  return (
    <span className={cn(LIST_STATUS_BADGE_CLASS, publicationClassName[status], className)}>
      {t(`publication.${status}`)}
    </span>
  );
};

type FeaturedBadgeProps = {
  featured: boolean;
};

/**
 * Badge shown when a partner is marked featured.
 */
export const FeaturedBadge = ({ featured }: FeaturedBadgeProps) => {
  const t = useTranslations('Partners');

  if (!featured) {
    return null;
  }

  return (
    <span className={cn(LIST_STATUS_BADGE_CLASS, 'bg-cta-dark/10 text-cta-dark')}>
      {t('featured')}
    </span>
  );
};
