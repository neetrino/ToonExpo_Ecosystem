import { baseEslintConfig } from "@toonexpo/config/eslint/base";

export default [
  ...baseEslintConfig,
  {
    ignores: ["src/generated/**", "prisma/migrations/**"],
  },
];
