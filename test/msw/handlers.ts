import type { RequestHandler } from "msw";

// Base URL every apiClient request resolves against in tests. Use it to build
// per-test handlers: `server.use(http.get(apiUrl("/experiences"), ...))`.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const apiUrl = (path: string) => `${API_URL}${path}`;

// Default handlers shared by every test. Prefer `server.use(...)` inside a
// test for scenario-specific responses.
export const handlers: RequestHandler[] = [];
