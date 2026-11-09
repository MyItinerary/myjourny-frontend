import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeNav } from "./home-nav";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: null }) }));
vi.mock("@/lib/queries/auth", () => ({ useLogout: () => ({ mutate: vi.fn() }) }));
vi.mock("@/lib/queries/notifications", () => ({ useUnreadNotificationsCount: () => ({ data: 0 }) }));
vi.mock("@/components/notifications/notifications-dropdown", () => ({ NotificationsDropdown: () => null }));
vi.mock("@/features/search", () => ({ SearchBarView: () => null, useSearchBarViewModel: () => ({}) }));

const eventLinks = () => screen.queryAllByRole("link").filter((link) => link.getAttribute("href") === "/events");

describe("HomeNav", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("leaves Events out of the nav and the profile menu while events are off", async () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "");
    const { user } = renderWithProviders(<HomeNav />);

    expect(screen.getByRole("link", { name: "Experiences" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(eventLinks()).toEqual([]);
  });

  it("links to Events from the nav and the profile menu once events are on", async () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "true");
    const { user } = renderWithProviders(<HomeNav />);

    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(eventLinks()).toHaveLength(2);
  });
});
