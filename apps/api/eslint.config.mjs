import { baseConfig } from '@toonexpo/config/eslint/base';

/**
 * NestJS relies on emitDecoratorMetadata + runtime class references for DI.
 * Forcing type-only imports breaks providers (AuthService etc. resolve as Function).
 */
export default [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
