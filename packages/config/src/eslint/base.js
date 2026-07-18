import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint flat config for ToonExpo packages and apps.
 *
 * Default exports are forbidden except for Next.js App Router entry files
 * that the framework requires (`page`, `layout`, `loading`, `error`, `global-error`,
 * `not-found`, `default`, `template`, `route`, `middleware`, `proxy`).
 */
export const baseEslintConfig = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/src/generated/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Named exports only. Default exports are forbidden except documented Next.js App Router exceptions.",
        },
      ],
    },
  },
  {
    files: [
      "**/app/**/{page,layout,loading,error,global-error,not-found,default,template,route}.{ts,tsx,js,jsx}",
      "**/src/app/**/{page,layout,loading,error,global-error,not-found,default,template,route}.{ts,tsx,js,jsx}",
      "**/middleware.{ts,js}",
      "**/src/middleware.{ts,js}",
      "**/proxy.{ts,js}",
      "**/src/proxy.{ts,js}",
      "**/eslint.config.{js,mjs,cjs,ts}",
      "**/prisma.config.ts",
      "**/vitest.config.{ts,js,mts}",
      "**/next.config.{ts,js,mjs}",
      "**/prettier.config.{js,cjs,mjs,ts}",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
);
