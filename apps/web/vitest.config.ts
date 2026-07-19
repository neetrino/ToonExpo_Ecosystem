import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, mergeConfig } from "vitest/config";

import { baseVitestConfig } from "@toonexpo/config/vitest/base";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    resolve: {
      alias: {
        "@": path.join(rootDir, "src"),
      },
    },
  }),
);
