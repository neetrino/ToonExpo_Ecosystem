import { defineConfig, mergeConfig } from "vitest/config";

import { baseVitestConfig } from "@toonexpo/config/vitest/base";

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    oxc: {
      decorator: {
        legacy: true,
        emitDecoratorMetadata: true,
      },
    },
    test: {
      include: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "test/**/*.{test,spec,e2e-spec}.{ts,tsx}",
      ],
      fileParallelism: false,
      hookTimeout: 30_000,
      testTimeout: 30_000,
    },
  }),
);
