import { baseEslintConfig } from "@toonexpo/config/eslint/base";

/**
 * NestJS DI keeps injectable class imports as values for `emitDecoratorMetadata`.
 * Shared `consistent-type-imports` would incorrectly rewrite those to `import type`.
 */
export default [
  ...baseEslintConfig,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];
