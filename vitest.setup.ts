import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./test/msw/server";

// Any request without a handler is a test bug — fail loudly instead of
// silently hitting the network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  window.localStorage.clear();
});
afterAll(() => server.close());
