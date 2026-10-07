import { test as base, type Page, type Route } from "@playwright/test";

import { E2E_API_URL } from "../playwright.config";

type Handler = (route: Route) => Promise<void> | void;

/**
 * Stub every call to the itin API. Unmatched GETs return `[]` (enough for
 * list endpoints to render empty states); unmatched writes return 404 so a
 * spec that forgets to stub a mutation fails visibly.
 *
 *   await mockApi(page, { "POST /auth/login": (r) => r.fulfill({ status: 401, json: { detail: "Bad creds" } }) });
 */
export async function mockApi(page: Page, overrides: Record<string, Handler> = {}) {
  await page.route(`${E2E_API_URL}/**`, async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const key = `${request.method()} ${pathname.replace(/\/$/, "")}`;
    const handler = overrides[key];
    if (handler) return handler(route);
    if (request.method() === "GET") return route.fulfill({ status: 200, json: [] });
    return route.fulfill({ status: 404, json: { detail: `Unstubbed ${key}` } });
  });
}

// Third-party scripts (Google Identity Services) would make E2E depend on the
// internet and inject extra UI, such as the "Continue with Google" button. Block them.
const BLOCKED_THIRD_PARTY = ["https://accounts.google.com/**", "https://apis.google.com/**"];

export const test = base.extend<{ api: void }>({
  api: [
    async ({ page }, use) => {
      for (const pattern of BLOCKED_THIRD_PARTY) await page.route(pattern, (route) => route.abort());
      await mockApi(page);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
