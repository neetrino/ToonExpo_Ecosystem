import { baseEslintConfig } from "@toonexpo/config/eslint/base";

/**
 * next-intl requires a default export from `src/i18n/request.ts`.
 */
export default [
  ...baseEslintConfig,
  {
    files: ["**/i18n/request.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
