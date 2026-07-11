import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from '@toonexpo/shared';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale =
    requested && (SUPPORTED_LOCALES as readonly string[]).includes(requested)
      ? (requested as AppLocale)
      : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
