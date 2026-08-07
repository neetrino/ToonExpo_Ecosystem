'use client';

import { useTranslations } from 'next-intl';

import { RequestFormPanel } from '@/features/buyer/components/request-form-panel';
import { isNonBuyerStaff } from '@/features/buyer/utils/is-buyer-account';
import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';

type QrInterestRequestSectionProps = {
  projectId: string;
  apartmentId?: string | undefined;
};

/**
 * Auth-gated notes form for project/apartment QR interest landing.
 */
export const QrInterestRequestSection = ({
  projectId,
  apartmentId,
}: QrInterestRequestSectionProps) => {
  const t = useTranslations('Catalog');
  const pathname = usePathname();
  const { data: user, isLoading } = useMeQuery();

  if (isLoading) {
    return (
      <div
        className="h-48 animate-pulse rounded-[20px] border border-header-border bg-surface-elevated"
        aria-hidden
      />
    );
  }

  if (isNonBuyerStaff(user?.accountType)) {
    return (
      <p className="rounded-[20px] border border-header-border bg-surface-elevated p-5 text-sm text-ink">
        {t('qrInterest.staffBlocked')}
      </p>
    );
  }

  if (!user) {
    const returnUrl = encodeURIComponent(pathname);
    return (
      <div className="flex flex-col gap-4 rounded-[20px] border border-header-border bg-surface-elevated p-5">
        <p className="text-sm text-ink">{t('qrInterest.loginRequired')}</p>
        <Link href={`/auth/login?returnUrl=${returnUrl}`} className="inline-flex">
          <Button type="button" className="w-full sm:w-auto">
            {t('qrInterest.loginCta')}
          </Button>
        </Link>
      </div>
    );
  }

  if (user.accountType !== 'buyer') {
    return (
      <p className="rounded-[20px] border border-header-border bg-surface-elevated p-5 text-sm text-ink">
        {t('request.errors.generic')}
      </p>
    );
  }

  return (
    <div className="rounded-[20px] border border-header-border bg-surface-elevated p-5">
      <h2 className="mb-4 text-lg font-semibold text-ink">{t('request.title')}</h2>
      <RequestFormPanel projectId={projectId} apartmentId={apartmentId} variant="page" />
    </div>
  );
};
