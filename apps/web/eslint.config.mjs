import { baseConfig } from '@toonexpo/config/eslint/base';

export default [
  ...baseConfig,
  {
    ignores: ['next-env.d.ts', '.next/**'],
  },
];
