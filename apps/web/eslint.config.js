import { baseEslintConfig } from "@toonexpo/config/eslint/base";

/**
 * next-intl requires a default export from `src/i18n/request.ts`.
 */
export default [
  {
    ignores: ["public/maplibre/**"],
  },
  ...baseEslintConfig,
  {
    files: ["scripts/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
  {
    files: ["**/i18n/request.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
