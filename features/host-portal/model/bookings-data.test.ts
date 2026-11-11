import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useHostBookings } from "./bookings-data";
import type { HostAccess } from "./host-access";

const access = vi.hoisted(() => ({ current: "approved" as HostAccess }));
vi.mock("./host-access", () => ({ useHostAccess: () => access.current }));

const booking = (id: string, payment_status: string) => ({
  id, status: "confirmed", payment_status, experience_title: "Lagoon kayak", party_size: 2,
  price_total: "30000.00", guide_earnings_amount: "25500.00", requested_datetime: "2026-09-20T07:30:00",
  guest: { name: "Amaka Eze" }, created_at: "2026-09-01T10:00:00",
});

beforeEach(() => {
  access.current = "approved";
  server.use(http.get(apiUrl("/bookings/guide"), () => HttpResponse.json([booking("b1", "paid"), booking("b2", "unpaid")])));
});
afterEach(() => vi.unstubAllEnvs());

describe("useHostBookings", () => {
  it("shows the guide's paid bookings from itin, not abandoned checkouts", async () => {
    const { result } = renderHookWithProviders(() => useHostBookings(null, "2026-09-19"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bookings.map((b) => [b.id, b.name, b.when])).toEqual([["b1", "Amaka Eze", "tomorrow"]]);
  });

  it("doesn't ask itin for a traveller's bookings", () => {
    access.current = "traveller";
    const { result } = renderHookWithProviders(() => useHostBookings(null, "2026-09-19"));
    expect(result.current).toEqual({ bookings: [], loading: false });
  });

  it("shows the six sample bookings for ?preview=full, but not in production", () => {
    expect(renderHookWithProviders(() => useHostBookings("full", "2026-09-19")).result.current.bookings).toHaveLength(6);
    vi.stubEnv("NODE_ENV", "production");
    expect(renderHookWithProviders(() => useHostBookings("full", "2026-09-19")).result.current.bookings).toHaveLength(0);
  });

  it("waits for today to be known", () => {
    expect(renderHookWithProviders(() => useHostBookings(null, null)).result.current).toEqual({ bookings: [], loading: true });
  });
});
