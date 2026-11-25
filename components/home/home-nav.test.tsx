import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeNav } from "./home-nav";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: null }) }));
const me = vi.hoisted(() => ({ current: undefined as { signup_type: string } | undefined }));
vi.mock("@/lib/queries/auth", async (importOriginal) => ({
  isHostAccount: (await importOriginal<typeof import("@/lib/queries/auth")>()).isHostAccount,
  useLogout: () => ({ mutate: vi.fn() }),
  useMe: () => ({ data: me.current }),
}));
vi.mock("@/lib/queries/notifications", () => ({ useUnreadNotificationsCount: () => ({ data: 0 }) }));
vi.mock("@/components/notifications/notifications-dropdown", () => ({ NotificationsDropdown: () => null }));
vi.mock("@/features/search", () => ({ SearchBarView: () => null, useSearchBarViewModel: () => ({}) }));

const eventLinks = () => screen.queryAllByRole("link").filter((link) => link.getAttribute("href") === "/events");

describe("HomeNav", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    me.current = undefined;
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

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

  it("invites travellers to become a guide", async () => {
    me.current = { signup_type: "traveller" };
    const { user } = renderWithProviders(<HomeNav />);

    expect(screen.getByRole("link", { name: "Become a guide" })).toHaveAttribute("href", "/become-a-guide");
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.queryByText("Switch to host dashboard")).not.toBeInTheDocument();
  });

  it("sends guides to their host dashboard from the nav and the profile menu", async () => {
    me.current = { signup_type: "guide" };
    const { user } = renderWithProviders(<HomeNav />);

    expect(screen.getByRole("link", { name: "Switch to host dashboard" })).toHaveAttribute("href", "/host/dashboard");
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    const links = screen.getAllByRole("link").filter((link) => link.getAttribute("href") === "/host/dashboard");
    expect(links).toHaveLength(2);
    expect(screen.getByText("Manage your listings and bookings")).toBeInTheDocument();
    expect(screen.queryByText("Become a guide")).not.toBeInTheDocument();
  });

  it("sends a traveller who added hosting to the host dashboard too", () => {
    me.current = { signup_type: "both" };
    renderWithProviders(<HomeNav />);

    expect(screen.getByRole("link", { name: "Switch to host dashboard" })).toHaveAttribute("href", "/host/dashboard");
  });

  it("keeps the expanded search bar open when scrolling back to the top", async () => {
    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
    const { user } = renderWithProviders(<HomeNav />);

    const whenButton = await screen.findByRole("button", { name: "When" });
    await user.click(whenButton);
    expect(screen.getByRole("button", { name: "Search", expanded: true })).toBeInTheDocument();

    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    expect(screen.getByRole("button", { name: "Search", expanded: true })).toBeInTheDocument();
  });

  it("suppresses the compact search pill when hideCompactSearch is true", () => {
    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
    renderWithProviders(<HomeNav hideCompactSearch />);

    expect(screen.queryByRole("button", { name: "When" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });
});
