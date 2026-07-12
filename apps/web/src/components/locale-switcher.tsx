'use client';

import { SUPPORTED_LOCALES, type AppLocale } from '@toonexpo/shared';
import { usePathname, useRouter } from '@/i18n/navigation';

type LocaleSwitcherProps = {
  currentLocale: string;
};

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Language</span>
      <select
        className="rounded-md border border-[var(--te-border)] bg-[var(--te-card)] px-2 py-1 text-[var(--te-fg)]"
        value={currentLocale}
        onChange={(event) => {
          const nextLocale = event.target.value as AppLocale;
          router.replace(pathname, { locale: nextLocale });
        }}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {locale.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
