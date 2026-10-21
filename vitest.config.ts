import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // A production build with a real origin; next.config.mjs inlines these at
    // build time. Tests for previews and local builds stub them.
    env: {
      NEXT_PUBLIC_SITE_URL: "https://shipbroker.example",
      NEXT_PUBLIC_INDEXABLE: "true",
    },
    include: ["**/*.test.ts", "**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts", "app/**/lib/**/*.ts"],
      exclude: ["**/*.d.ts", "**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
