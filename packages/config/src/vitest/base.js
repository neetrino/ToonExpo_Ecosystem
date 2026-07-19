import { defineConfig } from "vitest/config";

/**
 * Shared Vitest preset for ToonExpo workspace packages.
 */
export const baseVitestConfig = defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/index.ts"],
    },
  },
});
