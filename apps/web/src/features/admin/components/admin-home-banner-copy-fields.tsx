'use client';

import type { LocaleTextMap } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import {
  TranslationTabs,
  type TranslationLocale,
} from '@/features/builder/components/translation-tabs';
import {
  HOME_HERO_SUBTITLE_MAX_LENGTH,
  HOME_HERO_TITLE_MAX_LENGTH,
} from '@/features/catalog/constants/home-hero';
import { FormField } from '@/shared/ui/form-field';
import { Textarea } from '@/shared/ui/textarea';

export type HomeHeroCopyDraft = {
  title: Required<LocaleTextMap>;
  subtitle: Required<LocaleTextMap>;
};

type AdminHomeBannerCopyFieldsProps = {
  value: HomeHeroCopyDraft;
  disabled: boolean;
  onChange: (next: HomeHeroCopyDraft) => void;
};

export const emptyHomeHeroCopyDraft = (): HomeHeroCopyDraft => ({
  title: { hy: '', ru: '', en: '' },
  subtitle: { hy: '', ru: '', en: '' },
});

export const toHomeHeroCopyDraft = (
  title: LocaleTextMap | undefined,
  subtitle: LocaleTextMap | undefined,
): HomeHeroCopyDraft => ({
  title: {
    hy: title?.hy ?? '',
    ru: title?.ru ?? '',
    en: title?.en ?? '',
  },
  subtitle: {
    hy: subtitle?.hy ?? '',
    ru: subtitle?.ru ?? '',
    en: subtitle?.en ?? '',
  },
});

/**
 * HY / RU / EN headline fields for the public home hero (title + subtitle).
 */
export const AdminHomeBannerCopyFields = ({
  value,
  disabled,
  onChange,
}: AdminHomeBannerCopyFieldsProps) => {
  const t = useTranslations('Admin.homeBanner.copy');
  const tHero = useTranslations('HomePage.hero');
  const siteLocale = useLocale();

  const updateField = (
    field: keyof HomeHeroCopyDraft,
    locale: TranslationLocale,
    text: string,
  ): void => {
    onChange({
      ...value,
      [field]: { ...value[field], [locale]: text },
    });
  };

  return (
    <TranslationTabs>
      {(locale) => (
        <div className="flex flex-col gap-4">
          <FormField id={`home-hero-title-${locale}`} label={t('title')}>
            <Textarea
              id={`home-hero-title-${locale}`}
              rows={2}
              maxLength={HOME_HERO_TITLE_MAX_LENGTH}
              disabled={disabled}
              value={value.title[locale]}
              placeholder={locale === siteLocale ? tHero('title') : undefined}
              className="min-h-20"
              onChange={(event) => updateField('title', locale, event.target.value)}
            />
          </FormField>
          <FormField id={`home-hero-subtitle-${locale}`} label={t('subtitle')}>
            <Textarea
              id={`home-hero-subtitle-${locale}`}
              rows={3}
              maxLength={HOME_HERO_SUBTITLE_MAX_LENGTH}
              disabled={disabled}
              value={value.subtitle[locale]}
              placeholder={t('subtitlePlaceholder')}
              className="min-h-24"
              onChange={(event) => updateField('subtitle', locale, event.target.value)}
            />
          </FormField>
        </div>
      )}
    </TranslationTabs>
  );
};
