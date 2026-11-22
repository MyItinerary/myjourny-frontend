import { act, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { closeMobileSearch, useMobileSearchOpen } from "@/features/mobile-nav";
import { renderHookWithProviders, renderWithProviders } from "@/test/utils/render";

import { HomeNav } from "./home-nav";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => nav.pathname }));
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
    nav.pathname = "/";
    closeMobileSearch();
  });

  // Every page mounts its own nav, so fading the pills in on mount replayed on every click.
  it("shows the nav pills straight away instead of fading them in on each page", () => {
    renderWithProviders(<HomeNav />);
    expect(screen.getByRole("navigation", { name: "Primary" })).not.toHaveStyle({ opacity: "0" });
  });

  it("on Home, Experiences and Events, shows the search button only once the hero's search is scrolled past", () => {
    for (const path of ["/", "/experiences", "/events"]) {
      nav.pathname = path;
      window.scrollY = 0;
      const { unmount } = renderWithProviders(<HomeNav />);
      expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();

      act(() => {
        window.scrollY = 400;
        window.dispatchEvent(new Event("scroll"));
      });
      expect(screen.getAllByRole("button", { name: "Search" }).some((b) => b.getAttribute("aria-haspopup") === "dialog")).toBe(true);
      unmount();
    }
    window.scrollY = 0;
  });

  it("opens the phone search sheet from the search button on other pages, like Wishlists", async () => {
    nav.pathname = "/wishlists";
    const sheet = renderHookWithProviders(() => useMobileSearchOpen());
    const { user } = renderWithProviders(<HomeNav />);

    expect(sheet.result.current).toBe(false);
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(sheet.result.current).toBe(true);
  });

  it("leaves Events out of the nav and the profile menu while events are off", async () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "");
    const { user } = renderWithProviders(<HomeNav />);

    expect(screen.getByRole("link", { name: "Experiences" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(eventLinks()).toEqual([]);
  });

  it("links to Events from the nav once events are on", async () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "true");
    const { user } = renderWithProviders(<HomeNav />);

    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(eventLinks()).toHaveLength(1);
  });

  it("opens the full-screen menu from the profile button and closes it from the X", async () => {
    const { user } = renderWithProviders(<HomeNav />);

    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
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
});
