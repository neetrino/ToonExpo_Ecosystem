'use client';

import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AccountSectionHeading } from '@/features/buyer/components/account/account-section-heading';
import { LocaleSegmentSwitcher } from '@/shared/ui/locale-segment-switcher';

/**
 * Admin settings control for portal UI language (independent of public site locale).
 */
export const PanelLocaleSettingsSection = () => {
  const t = useTranslations('Admin.settings.panelLocale');

  return (
    <div className="border-t border-border/70 pt-8">
      <AccountSectionHeading
        icon={Languages}
        title={t('title')}
        subtitle={t('subtitle')}
        headingId="admin-panel-locale-heading"
      />
      <div className="mt-5">
        <LocaleSegmentSwitcher mode="panel" size="sm" />
      </div>
    </div>
  );
};
