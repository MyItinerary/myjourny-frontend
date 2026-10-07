import { defineConfig } from "vitest/config";

// Unit + component tests (Vitest + React Testing Library + MSW).
// Coverage thresholds apply to the MVVM `features/` tree only — legacy code is
// excluded until migrated (see CONTRIBUTING.md, "Legacy ratchet").
// Changing thresholds requires CTO (CODEOWNERS) approval.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
    css: false,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["features/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/index.ts", "**/*.types.ts"],
      reporter: ["text", "json-summary", "html"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
