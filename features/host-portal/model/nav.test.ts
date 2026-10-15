import { describe, expect, it } from "vitest";

import { activeNavKey, countLabel, HOST_NAV_ITEMS } from "./nav";

describe("HOST_NAV_ITEMS", () => {
  it("lists the seven destinations in order", () => {
    expect(HOST_NAV_ITEMS.map((i) => i.label)).toEqual([
      "Dashboard",
      "Listings",
      "Calendar",
      "Bookings",
      "Earnings",
      "Profile",
      "Help",
    ]);
  });
});

describe("activeNavKey", () => {
  it("matches each destination", () => {
    expect(activeNavKey("/host/dashboard")).toBe("dashboard");
    expect(activeNavKey("/host/dashboard/")).toBe("dashboard");
    expect(activeNavKey("/host/dashboard/bookings")).toBe("bookings");
    expect(activeNavKey("/host/dashboard/earnings")).toBe("earnings");
  });

  it("keeps Listings active while the builder is open", () => {
    expect(activeNavKey("/host/dashboard/listings")).toBe("listings");
    expect(activeNavKey("/host/dashboard/listings/new")).toBe("listings");
    expect(activeNavKey("/host/dashboard/listings/abc/edit")).toBe("listings");
  });

  it("doesn't match look-alikes or other pages", () => {
    expect(activeNavKey("/host/dashboard/listingsfoo")).toBeNull();
    expect(activeNavKey("/experiences")).toBeNull();
    expect(activeNavKey(null)).toBeNull();
  });
});

describe("countLabel", () => {
  it("shows the count, 99+ past 99, and nothing for zero", () => {
    expect(countLabel(2)).toBe("2");
    expect(countLabel(99)).toBe("99");
    expect(countLabel(100)).toBe("99+");
    expect(countLabel(0)).toBeNull();
    expect(countLabel(Number.NaN)).toBeNull();
  });
});
