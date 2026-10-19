import type { SupportedLocale } from '@toonexpo/shared';

import { PRIVACY_POLICY_EN } from '@/features/legal/privacy-policy.en';
import { PRIVACY_POLICY_HY } from '@/features/legal/privacy-policy.hy';
import { PRIVACY_POLICY_RU } from '@/features/legal/privacy-policy.ru';
import type { PrivacyPolicyCopy } from '@/features/legal/privacy-policy.types';

const PRIVACY_POLICY_BY_LOCALE: Record<SupportedLocale, PrivacyPolicyCopy> = {
  en: PRIVACY_POLICY_EN,
  hy: PRIVACY_POLICY_HY,
  ru: PRIVACY_POLICY_RU,
};

/** Privacy policy copy for the active public locale. */
export const getPrivacyPolicy = (locale: SupportedLocale): PrivacyPolicyCopy =>
  PRIVACY_POLICY_BY_LOCALE[locale];
