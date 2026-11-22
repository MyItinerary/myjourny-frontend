import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useMobileMenuViewModel } from "./use-mobile-menu-view-model";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const session = vi.hoisted(() => ({ user: null as null | { email: string } }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: session.user }) }));
const me = vi.hoisted(() => ({ current: undefined as { signup_type: string } | undefined }));
const logout = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@/lib/queries/auth", async (importOriginal) => ({
  isHostAccount: (await importOriginal<typeof import("@/lib/queries/auth")>()).isHostAccount,
  useLogout: () => logout,
  useMe: () => ({ data: me.current }),
}));
const unread = vi.hoisted(() => ({ count: 0 }));
vi.mock("@/lib/queries/notifications", () => ({ useUnreadNotificationsCount: () => unread.count }));

afterEach(() => {
  session.user = null;
  me.current = undefined;
  unread.count = 0;
  vi.clearAllMocks();
});

describe("useMobileMenuViewModel", () => {
  it("sends a guest to log in for account pages, with no hosting switch", () => {
    const { result } = renderHookWithProviders(() => useMobileMenuViewModel({ onClose: vi.fn() }));

    expect(result.current.hostingHref).toBeNull();
    expect(result.current.links.find((l) => l.id === "notifications")?.href).toBe("/login");
    expect(result.current.links.find((l) => l.id === "account-settings")?.href).toBe("/login");
    expect(result.current.auth.label).toBe("Login or create account");
    expect(result.current.guide?.href).toBe("/become-a-guide");
  });

  it("gives a signed-in user the host dashboard switch, their account pages and the unread count", () => {
    session.user = { email: "ada@example.com" };
    unread.count = 3;
    const { result } = renderHookWithProviders(() => useMobileMenuViewModel({ onClose: vi.fn() }));

    expect(result.current.hostingHref).toBe("/host/dashboard");
    expect(result.current.links.find((l) => l.id === "notifications")).toMatchObject({ href: "/notifications", badge: 3 });
    expect(result.current.links.find((l) => l.id === "account-settings")?.href).toBe("/profile");
    expect(result.current.auth.label).toBe("Logout");
  });

  it("drops the guide invite for hosts", () => {
    session.user = { email: "ada@example.com" };
    me.current = { signup_type: "guide" };
    const { result } = renderHookWithProviders(() => useMobileMenuViewModel({ onClose: vi.fn() }));

    expect(result.current.guide).toBeNull();
  });

  it("logs out then returns to the login page", () => {
    session.user = { email: "ada@example.com" };
    const onClose = vi.fn();
    const { result } = renderHookWithProviders(() => useMobileMenuViewModel({ onClose }));

    result.current.onAuth();
    expect(onClose).toHaveBeenCalled();
    const [, options] = logout.mutate.mock.calls[0];
    options.onSuccess();
    expect(router.push).toHaveBeenCalledWith("/login");
  });

  it("opens the login page for a guest's auth row", () => {
    const { result } = renderHookWithProviders(() => useMobileMenuViewModel({ onClose: vi.fn() }));

    result.current.onAuth();
    expect(router.push).toHaveBeenCalledWith("/login");
    expect(logout.mutate).not.toHaveBeenCalled();
  });

  it("stops the page behind it scrolling while it's mounted", () => {
    const { unmount } = renderHookWithProviders(() => useMobileMenuViewModel({ onClose: vi.fn() }));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
