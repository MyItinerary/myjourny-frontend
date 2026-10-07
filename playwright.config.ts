import { defineConfig, devices } from "@playwright/test";

// E2E tests run against a production build. The API base URL points at an
// unroutable mock origin; every spec stubs it with `mockApi()` from
// e2e/fixtures.ts, so E2E never depends on a live itin backend.
export const E2E_API_URL = "http://127.0.0.1:8999";
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_API_URL: E2E_API_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "e2e-google-client-id",
    },
  },
});
